import { defineConfig, loadEnv, type Plugin, type ConfigEnv } from 'vite'
import react from '@vitejs/plugin-react'

/**
 * Mounts the real api/*.ts handlers on the dev server, through the same adapter the Pi
 * runs (server/api.ts). Dev used to carry its own hand-copied API, which drifted: it had
 * no /api/rooms, so the request fell through to index.html and the home screen crashed.
 */
function localApi(): Plugin {
  return {
    name: 'local-api',
    async configureServer(server) {
      // Imported here, not at the top: api/_db.ts reads DATABASE_URL when it loads, and the
      // .env values are only copied into process.env by the config function below.
      const { handleApi, migrate } = await import('./server/api')
      await migrate().catch((error: Error) => console.warn(`[local-api] migration failed, the API will answer 500: ${error.message}`))
      server.middlewares.use((req, res, next) => {
        handleApi(req, res).then(handled => { if (!handled) next() }).catch((error: Error & { status?: number }) => {
          if (!error.status) console.error('[local-api]', error)
          if (!res.headersSent) { res.statusCode = error.status ?? 500; res.end() } else res.destroy()
        })
      })
    },
  }
}

export default defineConfig(({ mode }: ConfigEnv) => {
  const env = loadEnv(mode, process.cwd(), '')
  for (const key of ['DATABASE_URL', 'POSTGRES_URL', 'FAXEPAVE_PASSWORD']) if (env[key] && !process.env[key]) process.env[key] = env[key]

  return {
    plugins: [react(), localApi()],
    server: {
      host: '0.0.0.0',
      port: 5173,
    },
  }
})
