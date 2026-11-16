import type { VercelRequest, VercelResponse } from '@vercel/node'
import { isFaxepave } from './_auth'
import { pool } from './_db'

function isValidEventDate(value: unknown): value is number {
  return typeof value === 'number' && Number.isFinite(value) && Number.isFinite(new Date(value).getTime())
}
// Every statement names its own columns instead of interpolating a shared list: a SQL string in
// the source can be read and grepped as the query it is. The five lists are the same shape, so a
// new column is added to all of them — and `status` is the one the chronicle's gate reads.
// 'published' is the chronicle; 'pending' waits for the Faxepave; 'denied' is refused but kept,
// because a close recorded the only evidence there is and a stray tap must be undoable.
const statuses = ['published', 'pending', 'denied'] as const
type Status = (typeof statuses)[number]
const isStatus = (value: unknown): value is Status => statuses.includes(value as Status)

export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    if (!pool) return res.status(503).json({ error: 'Database connection is not configured' })
    const id = typeof req.query.id === 'string' ? req.query.id : undefined
    const requested = typeof req.query.status === 'string' ? req.query.status : undefined
    // A closed room's devices are sent to the entry it just produced, and that entry is not in
    // the chronicle yet: reading one entry by id is allowed whatever its status, so approval
    // decides what the archive lists, not whether the people who drank can read their result.
    // A refused Faxing is the Faxepave's business, so its link is a 404 to everyone else.
    if (req.method === 'GET' && id) {
      const result = await pool.query('SELECT id, title, event_date, official, attendees, status, created_at FROM faxing_events WHERE id = $1', [id])
      const event = result.rows[0]
      if (!event || (event.status === 'denied' && !isFaxepave(req))) return res.status(404).json({ error: 'Event not found' })
      return res.status(200).json(event)
    }
    if (req.method === 'GET') {
      if (requested !== undefined && !isStatus(requested)) return res.status(400).json({ error: 'Unknown status' })
      const wantsQueue = requested === 'pending' || requested === 'denied'
      if (wantsQueue && !isFaxepave(req)) return res.status(401).json({ error: 'Berre Faxepaven ser kva som ventar.' })
      const result = requested === undefined || requested === 'published'
        ? await pool.query('SELECT id, title, event_date, official, attendees, status, created_at FROM faxing_events WHERE status = \'published\' ORDER BY event_date DESC')
        : await pool.query('SELECT id, title, event_date, official, attendees, status, created_at FROM faxing_events WHERE status = $1 ORDER BY event_date DESC', [requested])
      return res.status(200).json(result.rows)
    }
    // Every write needs Faxepave. A contest reaches the chronicle by closing its room, where
    // the server derives the titles; an open POST let anyone file an "official" event.
    if (!isFaxepave(req)) return res.status(401).json({ error: 'Faxepave login required' })
    if (req.method === 'POST') {
      const { id: eventId, title, eventDate, official, attendees } = req.body ?? {}
      if (typeof eventId !== 'string' || !eventId.trim() || typeof title !== 'string' || !Number.isFinite(Number(eventDate)) || typeof official !== 'boolean' || !Array.isArray(attendees)) return res.status(400).json({ error: 'Invalid event payload' })
      // Filed by hand, so the Faxepave writing it is the decision it enters on.
      const result = await pool.query('INSERT INTO faxing_events (id, title, event_date, official, attendees, status) VALUES ($1, $2, $3, $4, $5::jsonb, \'published\') RETURNING id, title, event_date, official, attendees, status, created_at', [eventId.trim(), title.trim().slice(0, 160), new Date(Number(eventDate)), official, JSON.stringify(attendees)])
      return res.status(201).json(result.rows[0])
    }
    if (!id) return res.status(400).json({ error: 'Event id is required' })
    // Approving publishes; denying hides and keeps. Neither rewrites a title or a finish time.
    if (req.method === 'PATCH') {
      const { status } = req.body ?? {}
      if (status !== 'published' && status !== 'denied') return res.status(400).json({ error: 'Invalid event status' })
      const result = await pool.query('UPDATE faxing_events SET status = $1 WHERE id = $2 RETURNING id, title, event_date, official, attendees, status, created_at', [status, id])
      if (!result.rowCount) return res.status(404).json({ error: 'Event not found' })
      return res.status(200).json(result.rows[0])
    }
    if (req.method === 'PUT') {
      const { title, eventDate, official, attendees } = req.body ?? {}
      if (typeof title !== 'string' || !isValidEventDate(Number(eventDate)) || typeof official !== 'boolean' || !Array.isArray(attendees)) return res.status(400).json({ error: 'Invalid event payload' })
      const result = await pool.query('UPDATE faxing_events SET title = $1, event_date = $2, official = $3, attendees = $4::jsonb WHERE id = $5 RETURNING id, title, event_date, official, attendees, status, created_at', [title.trim().slice(0, 160), new Date(Number(eventDate)), official, JSON.stringify(attendees), id])
      if (!result.rowCount) return res.status(404).json({ error: 'Event not found' })
      return res.status(200).json(result.rows[0])
    }
    if (req.method === 'DELETE') {
      const result = await pool.query('DELETE FROM faxing_events WHERE id = $1', [id])
      if (!result.rowCount) return res.status(404).json({ error: 'Event not found' })
      return res.status(204).end()
    }
    res.setHeader('Allow', 'GET, POST, PUT, PATCH, DELETE')
    return res.status(405).json({ error: 'Method not allowed' })
  } catch (error) {
    console.error('[v0] Events API error:', error)
    const message = error instanceof Error ? error.message : 'Unable to access events'
    return res.status(500).json({ error: process.env.NODE_ENV === 'production' ? 'Unable to access events' : message })
  }
}
