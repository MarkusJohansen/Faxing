import { Pool } from 'pg'

// One pool per process, shared by every handler: the Pi's Postgres allows 20 connections.
const databaseUrl = process.env.POSTGRES_URL || process.env.DATABASE_URL || process.env.POSTGRES_PRISMA_URL
export const pool = databaseUrl
  ? new Pool({ connectionString: databaseUrl, max: 4, connectionTimeoutMillis: 10000, idleTimeoutMillis: 10000, ssl: { rejectUnauthorized: false } })
  : null
