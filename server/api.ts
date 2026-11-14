// The api/*.ts handlers, mounted on a plain Node request. Shared by the Pi server
// (server/index.ts) and `npm run dev` (vite.config.ts), so the two can never serve
// different APIs: dev used to carry a hand-copied one that had no /api/rooms at all.
import type { IncomingMessage, ServerResponse } from 'node:http'
import { Pool } from 'pg'
import adminHandler from '../api/admin'
import eventsHandler from '../api/events'
import roomsHandler from '../api/rooms'

type Handler = (req: never, res: never) => unknown
const routes: Record<string, Handler> = { '/api/admin': adminHandler, '/api/events': eventsHandler, '/api/rooms': roomsHandler }
const MAX_BODY = 1_000_000

async function readBody(req: IncomingMessage): Promise<unknown> {
  const chunks: Buffer[] = []
  let size = 0
  for await (const chunk of req) {
    size += chunk.length
    if (size > MAX_BODY) throw Object.assign(new Error('Body too large'), { status: 413 })
    chunks.push(chunk as Buffer)
  }
  const text = Buffer.concat(chunks).toString('utf8')
  if (!text) return undefined
  if (!(req.headers['content-type'] ?? '').includes('application/json')) return text
  try { return JSON.parse(text) } catch { throw Object.assign(new Error('Invalid JSON'), { status: 400 }) }
}

// The subset of VercelRequest/VercelResponse that api/*.ts uses.
function vercelRes(res: ServerResponse) {
  const r = res as ServerResponse & { status(code: number): typeof r; json(body: unknown): typeof r }
  r.status = code => { res.statusCode = code; return r }
  r.json = body => { res.setHeader('Content-Type', 'application/json'); res.end(JSON.stringify(body)); return r }
  return r
}

/** Runs the matching api handler. Resolves false when the path is not an API route. */
export async function handleApi(req: IncomingMessage, res: ServerResponse): Promise<boolean> {
  const url = new URL(req.url ?? '/', 'http://localhost')
  const route = routes[url.pathname.replace(/\/$/, '')]
  if (!route) return false
  const vreq = Object.assign(req, { query: Object.fromEntries(url.searchParams), body: await readBody(req), cookies: {} })
  await route(vreq as never, vercelRes(res) as never)
  return true
}

// The schema api/*.ts expects. Idempotent, so it runs on every start.
export async function migrate() {
  const url = process.env.DATABASE_URL || process.env.POSTGRES_URL
  if (!url) return console.warn('DATABASE_URL is not set; /api/events and /api/rooms will answer 503')
  const pool = new Pool({ connectionString: url, max: 1 })
  try {
    await pool.query(`CREATE TABLE IF NOT EXISTS faxing_events (
      id text PRIMARY KEY,
      title text NOT NULL,
      event_date timestamptz NOT NULL,
      official boolean NOT NULL DEFAULT false,
      attendees jsonb NOT NULL DEFAULT '[]'::jsonb,
      created_at timestamptz NOT NULL DEFAULT now()
    )`)
    await pool.query(`CREATE TABLE IF NOT EXISTS faxing_rooms (
      id text PRIMARY KEY,
      code text NOT NULL UNIQUE,
      title text NOT NULL,
      official boolean NOT NULL DEFAULT false,
      host_token_hash text NOT NULL,
      started_at timestamptz,
      closed_at timestamptz,
      event_id text,
      created_at timestamptz NOT NULL DEFAULT now()
    )`)
    // One row per participant, not a jsonb array on the room: two people finishing in the
    // same second write different rows, so neither finish is lost to a read-modify-write.
    await pool.query(`CREATE TABLE IF NOT EXISTS faxing_room_members (
      id text PRIMARY KEY,
      room_id text NOT NULL REFERENCES faxing_rooms(id) ON DELETE CASCADE,
      name text NOT NULL,
      gender text NOT NULL,
      finished_at timestamptz,
      disqualified boolean NOT NULL DEFAULT false,
      token_hash text,
      joined_at timestamptz NOT NULL DEFAULT now()
    )`)
    await pool.query('CREATE UNIQUE INDEX IF NOT EXISTS faxing_room_members_name ON faxing_room_members (room_id, lower(name))')
  } finally { await pool.end() }
}
