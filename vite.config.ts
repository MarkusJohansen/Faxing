import { defineConfig, loadEnv, type Plugin, type ConfigEnv } from 'vite'
import react from '@vitejs/plugin-react'
import { Pool } from 'pg'

function localEventsApi(databaseUrl: string, adminPassword: string): Plugin {
  const pool = new Pool({
    connectionString: databaseUrl,
    max: 5,
    ssl: { rejectUnauthorized: false },
  })

  return {
    name: 'local-events-api',
    configureServer(server) {
      server.middlewares.use('/api/admin', async (req, res) => {
        const secret = adminPassword
        if (req.method === 'POST') {
          const chunks: Buffer[] = []
          for await (const chunk of req) chunks.push(Buffer.from(chunk))
          const body = JSON.parse(Buffer.concat(chunks).toString('utf8') || '{}')
          if (!secret || body.password !== secret) { res.statusCode = 401; res.end(JSON.stringify({ error: 'Forkert password.' })); return }
          const { createHmac } = await import('node:crypto')
          const token = createHmac('sha256', secret).update('faxepave-session').digest('hex')
          res.setHeader('Set-Cookie', `faxepave_session=${token}; HttpOnly; SameSite=Lax; Path=/; Max-Age=86400`)
          res.statusCode = 200; res.end(JSON.stringify({ authenticated: true })); return
        }
  if (req.method === 'DELETE') { res.setHeader('Set-Cookie', 'faxepave_session=; HttpOnly; SameSite=Lax; Path=/; Max-Age=0'); res.statusCode = 204; res.end(); return }
  if (req.method === 'GET') {
    const cookie = req.headers.cookie?.split(';').map(value => value.trim()).find(value => value.startsWith('faxepave_session='))?.split('=')[1]
    const { createHmac, timingSafeEqual } = await import('node:crypto')
    const expected = secret ? createHmac('sha256', secret).update('faxepave-session').digest('hex') : ''
    const authenticated = Boolean(cookie && expected && cookie.length === expected.length && timingSafeEqual(Buffer.from(cookie), Buffer.from(expected)))
    res.statusCode = 200; res.setHeader('Content-Type', 'application/json'); res.end(JSON.stringify({ authenticated })); return
  }
  res.statusCode = 405; res.end(JSON.stringify({ error: 'Method not allowed' }))
      })
      server.middlewares.use('/api/events', async (req, res) => {
        try {
          if (req.method === 'PUT' || req.method === 'DELETE') {
const secret = adminPassword
            const cookie = req.headers.cookie?.split(';').map(value => value.trim()).find(value => value.startsWith('faxepave_session='))?.split('=')[1]
            const { createHmac } = await import('node:crypto')
            const expected = secret ? createHmac('sha256', secret).update('faxepave-session').digest('hex') : ''
            if (!cookie || !expected || cookie !== expected) { res.statusCode = 401; res.end(JSON.stringify({ error: 'Faxepave login required' })); return }
          }
          if (req.method === 'GET') {
            const result = await pool.query(
              'SELECT id, title, event_date, official, attendees, created_at FROM faxing_events ORDER BY event_date DESC',
            )
            res.statusCode = 200
            res.setHeader('Content-Type', 'application/json')
            res.end(JSON.stringify(result.rows))
            return
          }

          if (req.method === 'PUT') {
            const eventId = new URL(req.url ?? '', 'http://localhost').searchParams.get('id')
            if (!eventId) {
              res.statusCode = 400
              res.end(JSON.stringify({ error: 'Event id is required' }))
              return
            }
            const chunks: Buffer[] = []
            for await (const chunk of req) chunks.push(Buffer.from(chunk))
            const body = JSON.parse(Buffer.concat(chunks).toString('utf8') || '{}')
            const { title, eventDate, official, attendees } = body
            if (typeof title !== 'string' || !Number.isFinite(Number(eventDate)) || typeof official !== 'boolean' || !Array.isArray(attendees)) {
              res.statusCode = 400
              res.end(JSON.stringify({ error: 'Invalid event payload' }))
              return
            }
            const result = await pool.query(
              `UPDATE faxing_events SET title = $1, event_date = $2, official = $3, attendees = $4::jsonb WHERE id = $5
               RETURNING id, title, event_date, official, attendees, created_at`,
              [title.trim().slice(0, 160), new Date(Number(eventDate)), official, JSON.stringify(attendees), eventId],
            )
            if (!result.rowCount) {
              res.statusCode = 404
              res.end(JSON.stringify({ error: 'Event not found' }))
              return
            }
            res.statusCode = 200
            res.setHeader('Content-Type', 'application/json')
            res.end(JSON.stringify(result.rows[0]))
            return
          }

          if (req.method === 'DELETE') {
            const eventId = new URL(req.url ?? '', 'http://localhost').searchParams.get('id')
            if (!eventId) { res.statusCode = 400; res.end(JSON.stringify({ error: 'Event id is required' })); return }
            const result = await pool.query('DELETE FROM faxing_events WHERE id = $1', [eventId])
            if (!result.rowCount) { res.statusCode = 404; res.end(JSON.stringify({ error: 'Event not found' })); return }
            res.statusCode = 204; res.end(); return
          }

          if (req.method === 'POST') {
            const chunks: Buffer[] = []
            for await (const chunk of req) chunks.push(Buffer.from(chunk))
            const body = JSON.parse(Buffer.concat(chunks).toString('utf8') || '{}')
            const { id, title, eventDate, official, attendees } = body
            if (
              typeof id !== 'string' ||
              typeof title !== 'string' ||
              !Number.isFinite(Number(eventDate)) ||
              typeof official !== 'boolean' ||
              !Array.isArray(attendees)
            ) {
              res.statusCode = 400
              res.end(JSON.stringify({ error: 'Invalid event payload' }))
              return
            }

            const result = await pool.query(
              `INSERT INTO faxing_events (id, title, event_date, official, attendees)
               VALUES ($1, $2, $3, $4, $5::jsonb)
               RETURNING id, title, event_date, official, attendees, created_at`,
              [id, title.trim().slice(0, 160), new Date(Number(eventDate)), official, JSON.stringify(attendees)],
            )
            res.statusCode = 201
            res.setHeader('Content-Type', 'application/json')
            res.end(JSON.stringify(result.rows[0]))
            return
          }

          res.statusCode = 405
          res.setHeader('Allow', 'GET, POST')
          res.end(JSON.stringify({ error: 'Method not allowed' }))
        } catch (error) {
          console.error('[v0] Local events API error:', error)
          res.statusCode = 500
          res.setHeader('Content-Type', 'application/json')
          res.end(JSON.stringify({ error: 'Unable to access events' }))
        }
      })
    },
  }
}

export default defineConfig(({ mode }: ConfigEnv) => {
  const env = loadEnv(mode, process.cwd(), '')
  const databaseUrl = env.DATABASE_URL || env.POSTGRES_URL || process.env.DATABASE_URL || process.env.POSTGRES_URL

  return {
    plugins: [react(), localEventsApi(databaseUrl, env.FAXEPAVE_PASSWORD || process.env.FAXEPAVE_PASSWORD || '')],
    server: {
      host: '0.0.0.0',
      port: 5173,
    },
  }
})
