// Production server for the Pi: serves the built SPA from dist/ and runs the
// Vercel-style handlers in api/ unchanged, through the adapter in ./api.
// Bundled to server.cjs by `npm run build:server`.
import { createReadStream } from 'node:fs'
import { stat } from 'node:fs/promises'
import { createServer, type IncomingMessage, type ServerResponse } from 'node:http'
import { extname, join, normalize, resolve } from 'node:path'
import { handleApi, migrate } from './api'

const PORT = Number(process.env.PORT || 8080)
const ROOT = resolve(process.env.STATIC_DIR || join(__dirname, 'dist'))

const TYPES: Record<string, string> = {
  '.html': 'text/html; charset=utf-8', '.js': 'text/javascript', '.css': 'text/css',
  '.json': 'application/json', '.svg': 'image/svg+xml', '.png': 'image/png', '.ico': 'image/x-icon',
  '.jpg': 'image/jpeg', '.webp': 'image/webp', '.woff2': 'font/woff2', '.txt': 'text/plain',
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
  if (await handleApi(req, res)) return
  if (req.method !== 'GET' && req.method !== 'HEAD') { res.statusCode = 405; return res.end() }
  return serveStatic(url.pathname, res)
}

migrate().then(() => {
  createServer((req, res) => {
    handle(req, res).catch((error: Error & { status?: number }) => {
      if (!error.status) console.error(error)
      if (!res.headersSent) { res.statusCode = error.status ?? 500; res.end() } else res.destroy()
    })
  }).listen(PORT, () => console.log(`faxing listening on :${PORT}, static from ${ROOT}`))
}).catch(error => { console.error('migration failed', error); process.exit(1) })
