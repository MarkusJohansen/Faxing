import type { VercelRequest, VercelResponse } from '@vercel/node'
import { isFaxepave } from './_auth'
import { pool } from './_db'

function isValidEventDate(value: unknown): value is number {
  return typeof value === 'number' && Number.isFinite(value) && Number.isFinite(new Date(value).getTime())
}
const columns = 'id, title, event_date, official, attendees, created_at'

export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    if (!pool) return res.status(503).json({ error: 'Database connection is not configured' })
    const id = typeof req.query.id === 'string' ? req.query.id : undefined
    if (req.method === 'GET' && !id) {
      const result = await pool.query(`SELECT ${columns} FROM faxing_events ORDER BY event_date DESC`)
      return res.status(200).json(result.rows)
    }
    // Every write needs Faxepave. A contest reaches the chronicle by closing its room, where
    // the server derives the titles; an open POST let anyone file an "official" event.
    if (req.method !== 'GET' && !isFaxepave(req)) return res.status(401).json({ error: 'Faxepave login required' })
    if (req.method === 'POST') {
      const { id: eventId, title, eventDate, official, attendees } = req.body ?? {}
      if (typeof eventId !== 'string' || !eventId.trim() || typeof title !== 'string' || !Number.isFinite(Number(eventDate)) || typeof official !== 'boolean' || !Array.isArray(attendees)) return res.status(400).json({ error: 'Invalid event payload' })
      const result = await pool.query(`INSERT INTO faxing_events (id, title, event_date, official, attendees) VALUES ($1, $2, $3, $4, $5::jsonb) RETURNING ${columns}`, [eventId.trim(), title.trim().slice(0, 160), new Date(Number(eventDate)), official, JSON.stringify(attendees)])
      return res.status(201).json(result.rows[0])
    }
    if (!id) return res.status(400).json({ error: 'Event id is required' })
    if (req.method === 'PUT') {
      const { title, eventDate, official, attendees } = req.body ?? {}
      if (typeof title !== 'string' || !isValidEventDate(Number(eventDate)) || typeof official !== 'boolean' || !Array.isArray(attendees)) return res.status(400).json({ error: 'Invalid event payload' })
      const result = await pool.query(`UPDATE faxing_events SET title = $1, event_date = $2, official = $3, attendees = $4::jsonb WHERE id = $5 RETURNING ${columns}`, [title.trim().slice(0, 160), new Date(Number(eventDate)), official, JSON.stringify(attendees), id])
      if (!result.rowCount) return res.status(404).json({ error: 'Event not found' })
      return res.status(200).json(result.rows[0])
    }
    if (req.method === 'DELETE') {
      const result = await pool.query('DELETE FROM faxing_events WHERE id = $1', [id])
      if (!result.rowCount) return res.status(404).json({ error: 'Event not found' })
      return res.status(204).end()
    }
    res.setHeader('Allow', 'GET, POST, PUT, DELETE')
    return res.status(405).json({ error: 'Method not allowed' })
  } catch (error) {
    console.error('[v0] Events API error:', error)
    const message = error instanceof Error ? error.message : 'Unable to access events'
    return res.status(500).json({ error: process.env.NODE_ENV === 'production' ? 'Unable to access events' : message })
  }
}
