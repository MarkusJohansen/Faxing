// Production server for the Pi: serves the built SPA from dist/ and runs the
// Vercel-style handlers in api/ unchanged, through a small req/res adapter.
// Bundled to server.cjs by `npm run build:server`.
import { createReadStream } from 'node:fs'
import { stat } from 'node:fs/promises'
import { createServer, type IncomingMessage, type ServerResponse } from 'node:http'
import { extname, join, normalize, resolve } from 'node:path'
import { Pool } from 'pg'
import adminHandler from '../api/admin'
import eventsHandler from '../api/events'

type Handler = (req: never, res: never) => unknown
const routes: Record<string, Handler> = { '/api/admin': adminHandler, '/api/events': eventsHandler }

const PORT = Number(process.env.PORT || 8080)
const ROOT = resolve(process.env.STATIC_DIR || join(__dirname, 'dist'))
const MAX_BODY = 1_000_000

const TYPES: Record<string, string> = {
  '.html': 'text/html; charset=utf-8', '.js': 'text/javascript', '.css': 'text/css',
  '.json': 'application/json', '.svg': 'image/svg+xml', '.png': 'image/png', '.ico': 'image/x-icon',
  '.jpg': 'image/jpeg', '.webp': 'image/webp', '.woff2': 'font/woff2', '.txt': 'text/plain',
}

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

async function serveStatic(pathname: string, res: ServerResponse) {
  let decoded: string
  try { decoded = decodeURIComponent(pathname) } catch { res.statusCode = 400; return res.end() }
  let file = normalize(join(ROOT, decoded))
  if (!file.startsWith(ROOT)) { res.statusCode = 400; return res.end() }
  let info = await stat(file).catch(() => null)
  if (info?.isDirectory()) { file = join(file, 'index.html'); info = await stat(file).catch(() => null) }
  if (!info?.isFile()) {
    // Single-page app: unknown paths get index.html; missing assets get a real 404.
    if (pathname.startsWith('/assets/')) { res.statusCode = 404; return res.end() }
    file = join(ROOT, 'index.html')
  }
  // Vite content-hashes everything under /assets, so it can be cached forever.
  res.setHeader('Cache-Control', pathname.startsWith('/assets/') ? 'public, max-age=31536000, immutable' : 'no-cache')
  res.setHeader('Content-Type', TYPES[extname(file)] ?? 'application/octet-stream')
  createReadStream(file).on('error', () => res.destroy()).pipe(res)
}

async function handle(req: IncomingMessage, res: ServerResponse) {
  const url = new URL(req.url ?? '/', 'http://localhost')
  if (url.pathname === '/healthz') { res.setHeader('Content-Type', 'text/plain'); return res.end('ok\n') }
  const route = routes[url.pathname.replace(/\/$/, '')]
  if (route) {
    const vreq = Object.assign(req, { query: Object.fromEntries(url.searchParams), body: await readBody(req), cookies: {} })
    return route(vreq as never, vercelRes(res) as never)
  }
  if (req.method !== 'GET' && req.method !== 'HEAD') { res.statusCode = 405; return res.end() }
  return serveStatic(url.pathname, res)
}

// The schema api/events.ts expects. Idempotent, so it runs on every start.
async function migrate() {
  const url = process.env.DATABASE_URL
  if (!url) return console.warn('DATABASE_URL is not set; /api/events will answer 503')
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
  } finally { await pool.end() }
}

migrate().then(() => {
  createServer((req, res) => {
    handle(req, res).catch((error: Error & { status?: number }) => {
      if (!error.status) console.error(error)
      if (!res.headersSent) { res.statusCode = error.status ?? 500; res.end() } else res.destroy()
    })
  }).listen(PORT, () => console.log(`faxing listening on :${PORT}, static from ${ROOT}`))
}).catch(error => { console.error('migration failed', error); process.exit(1) })
