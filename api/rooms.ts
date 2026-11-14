import type { VercelRequest, VercelResponse } from '@vercel/node'
import { randomInt, randomUUID } from 'node:crypto'
import type { Pool, PoolClient } from 'pg'
import { hashToken, isFaxepave, newToken, requestTokens } from './_auth'
import { pool } from './_db'
import { CONTEST_DURATION_MS } from '../src/lib/contest'
import { rankContestants } from '../src/lib/ranking'
import type { Contestant, Gender, RoomRole, RoomSnapshot, RoomSummary } from '../src/types'

// Four characters, no look-alikes (0/O, 1/I/L), so a code survives being shouted across a room.
const CODE_ALPHABET = 'ABCDEFGHJKMNPQRSTUVWXYZ23456789'
const CODE_LENGTH = 4
const CODE_ATTEMPTS = 10
const NAME_MAX = 30
const TITLE_MAX = 80
const LISTED_ROOMS = 50

type Db = Pool | PoolClient
interface RoomRow { id: string; code: string; title: string; official: boolean; host_token_hash: string; started_at: Date | null; closed_at: Date | null; event_id: string | null }
interface MemberRow { id: string; name: string; gender: string; finished_at: Date | null; disqualified: boolean }
type Body = Record<string, unknown>

class HttpError extends Error { constructor(readonly status: number, message: string) { super(message) } }
const fail = (status: number, message: string): never => { throw new HttpError(status, message) }

const ROOM_COLUMNS = 'id, code, title, official, host_token_hash, started_at, closed_at, event_id'
const MEMBER_COLUMNS = 'id, name, gender, finished_at, disqualified'
const isGender = (value: unknown): value is Gender => value === 'male' || value === 'female' || value === 'other'
const toContestant = (row: MemberRow): Contestant => ({
  id: row.id,
  name: row.name,
  // Rows are only written through isGender below; the fallback keeps a hand-edited row from
  // crashing every phone in the room.
  gender: isGender(row.gender) ? row.gender : 'other',
  finishedAt: row.finished_at ? row.finished_at.getTime() : null,
  disqualified: row.disqualified,
})

function validName(value: unknown): string {
  const name = typeof value === 'string' ? value.trim() : ''
  if (!name) fail(400, 'Et Navn er fornødent, tapre Sjel.')
  if (name.length > NAME_MAX) fail(400, `Et Navn haver høyst ${NAME_MAX} tegn.`)
  return name
}

async function insertMember(db: Db, roomId: string, name: string, gender: unknown, tokenHash: string | null) {
  if (!isGender(gender)) fail(400, 'Velg Herre, Dame eller Annet.')
  try {
    await db.query('INSERT INTO faxing_room_members (id, room_id, name, gender, token_hash) VALUES ($1, $2, $3, $4, $5)', [randomUUID(), roomId, name, gender, tokenHash])
  } catch (error) {
    // The unique index on lower(name) is the duplicate check, so two people typing the same
    // name in the same second cannot both get in.
    if ((error as { code?: string }).code === '23505') fail(409, 'Denne Kriger haver allerede inntatt Rommet.')
    throw error
  }
}

async function roleOf(db: Db, room: RoomRow, req: VercelRequest, extraToken?: string): Promise<RoomRole> {
  const hashes = [...requestTokens(req), ...(extraToken ? [extraToken] : [])].map(hashToken)
  const host = hashes.includes(room.host_token_hash) || (room.official && isFaxepave(req))
  const memberId = hashes.length
    ? (await db.query<{ id: string }>('SELECT id FROM faxing_room_members WHERE room_id = $1 AND token_hash = ANY($2)', [room.id, hashes])).rows[0]?.id ?? null
    : null
  return { host, memberId }
}

async function snapshot(db: Db, room: RoomRow, you: RoomRole): Promise<RoomSnapshot> {
  const members = await db.query<MemberRow>(`SELECT ${MEMBER_COLUMNS} FROM faxing_room_members WHERE room_id = $1 ORDER BY joined_at, id`, [room.id])
  return {
    code: room.code,
    title: room.title,
    official: room.official,
    startedAt: room.started_at ? room.started_at.getTime() : null,
    closedAt: room.closed_at ? room.closed_at.getTime() : null,
    eventId: room.event_id,
    members: members.rows.map(toContestant),
    serverNow: Date.now(),
    you,
  }
}

async function listRooms(db: Db): Promise<RoomSummary[]> {
  // Only the last day: an abandoned room should not haunt the front page forever.
  const result = await db.query<{ code: string; title: string; official: boolean; started_at: Date | null; members: string }>(
    `SELECT r.code, r.title, r.official, r.started_at, (SELECT count(*) FROM faxing_room_members m WHERE m.room_id = r.id) AS members
       FROM faxing_rooms r WHERE r.closed_at IS NULL AND r.created_at > now() - interval '24 hours'
      ORDER BY r.created_at DESC LIMIT ${LISTED_ROOMS}`)
  return result.rows.map(row => ({ code: row.code, title: row.title, official: row.official, startedAt: row.started_at ? row.started_at.getTime() : null, memberCount: Number(row.members) }))
}

async function createRoom(db: Db, req: VercelRequest, body: Body) {
  const official = body.official === true
  if (official && !isFaxepave(req)) fail(403, 'Kun Faxepaven kan reise et offisielt Rom.')
  const title = (typeof body.title === 'string' ? body.title.trim().slice(0, TITLE_MAX) : '') || (official ? 'Offisiell Faxing' : 'Faxing')
  const token = newToken()
  for (let attempt = 0; attempt < CODE_ATTEMPTS; attempt++) {
    const code = Array.from({ length: CODE_LENGTH }, () => CODE_ALPHABET[randomInt(CODE_ALPHABET.length)]).join('')
    const result = await db.query<RoomRow>(
      `INSERT INTO faxing_rooms (id, code, title, official, host_token_hash) VALUES ($1, $2, $3, $4, $5) ON CONFLICT (code) DO NOTHING RETURNING ${ROOM_COLUMNS}`,
      [randomUUID(), code, title, official, hashToken(token)])
    if (result.rows[0]) return { ...(await snapshot(db, result.rows[0], { host: true, memberId: null })), token }
  }
  return fail(503, 'Fant ingen ledig Kode. Prøv påny.')
}

/** Applies one action to a locked room. Returns a token when the action issues one. */
async function act(db: PoolClient, room: RoomRow, action: unknown, body: Body, you: RoomRole, now: number): Promise<string | undefined> {
  if (room.closed_at) fail(409, 'Rommet er stengt.')
  const start = room.started_at?.getTime() ?? null
  const running = start !== null && now - start < CONTEST_DURATION_MS
  const requireHost = () => { if (!you.host) fail(403, 'Kun Verten kan gjøre dette.') }
  const requireStarted = (): number => start ?? fail(409, 'Kampen er ennu ikke begynt.')
  // Host actions name their target; it must belong to this room, or a host of one room could
  // edit a participant in another by guessing an id.
  const target = async () => {
    const id = typeof body.memberId === 'string' ? body.memberId : ''
    const found = await db.query('SELECT 1 FROM faxing_room_members WHERE id = $1 AND room_id = $2', [id, room.id])
    if (!found.rowCount) fail(404, 'Ingen slik Kriger i Rommet.')
    return id
  }
  const update = (sql: string, params: unknown[]) => db.query(`UPDATE faxing_room_members SET ${sql}`, params)

  switch (action) {
    case 'join': {
      if (start !== null) fail(409, 'Kampen er alt begynt. Kun Verten kan nu innskrive nye.')
      if (you.memberId) fail(409, 'Denne innretning er alt innskrevet.')
      const token = newToken()
      await insertMember(db, room.id, validName(body.name), body.gender, hashToken(token))
      return token
    }
    case 'finish':
    case 'forfeit': {
      if (!you.memberId) fail(403, 'Innskriv Eder først.')
      if (body.memberId !== undefined && body.memberId !== you.memberId) fail(403, 'Kun Eders egen innskrivning kan merkes.')
      if (!running) fail(409, start === null ? 'Kampen er ennu ikke begynt.' : 'Timen er ute.')
      // The WHERE clause is the never-overwrite guard: a second tap, or a tap racing a host's
      // Hestemann, finds the row already resolved and changes nothing.
      await update(`${action === 'finish' ? 'finished_at = $2' : 'disqualified = true'} WHERE id = $1 AND finished_at IS NULL AND NOT disqualified`,
        action === 'finish' ? [you.memberId, new Date(now)] : [you.memberId])
      return
    }
    case 'start': {
      requireHost()
      if (start !== null) fail(409, 'Kampen er alt begynt.')
      const count = await db.query('SELECT 1 FROM faxing_room_members WHERE room_id = $1 LIMIT 1', [room.id])
      if (!count.rowCount) fail(409, 'Ingen Krigere er innskrevet.')
      await db.query('UPDATE faxing_rooms SET started_at = $2 WHERE id = $1', [room.id, new Date(now)])
      return
    }
    case 'add': {
      requireHost()
      await insertMember(db, room.id, validName(body.name), body.gender, null)
      return
    }
    case 'remove': {
      requireHost()
      // After the start a row is evidence; striking it would silently hand its crown onward.
      if (start !== null) fail(409, 'Kampen er begynt; merk heller som Hestemann.')
      await db.query('DELETE FROM faxing_room_members WHERE id = $1', [await target()])
      return
    }
    case 'reset': {
      requireHost()
      await update('finished_at = NULL, disqualified = false WHERE id = $1', [await target()])
      return
    }
    case 'set-finished': {
      requireHost()
      requireStarted()
      // A finish stamped after the hour is a Hestemann anyway; refusing it tells the host to
      // enter the real time instead of silently recording a late one.
      if (!running) fail(409, 'Timen er ute — rett tiden i stedet.')
      await update('finished_at = $2, disqualified = false WHERE id = $1', [await target(), new Date(now)])
      return
    }
    case 'set-time': {
      requireHost()
      const begun = requireStarted()
      const elapsed = body.elapsedMs
      if (typeof elapsed !== 'number' || !Number.isInteger(elapsed) || elapsed < 0 || elapsed >= CONTEST_DURATION_MS) fail(400, 'Tiden maa ligge innen Timen.')
      await update('finished_at = $2, disqualified = false WHERE id = $1', [await target(), new Date(begun + (elapsed as number))])
      return
    }
    case 'disqualify': {
      requireHost()
      requireStarted()
      await update('finished_at = NULL, disqualified = true WHERE id = $1', [await target()])
      return
    }
    case 'close': {
      requireHost()
      const begun = requireStarted()
      const members = await db.query<MemberRow>(`SELECT ${MEMBER_COLUMNS} FROM faxing_room_members WHERE room_id = $1 ORDER BY joined_at, id`, [room.id])
      // Titles are derived here, from the rows: no client can file one. Closing ends the
      // contest, so it is ranked as if the hour had run out; ranked at `now`, anybody still
      // drinking at an early close was filed with no title and their unfinished time.
      const ranked = rankContestants(members.rows.map(toContestant), begun, Math.max(now, begun + CONTEST_DURATION_MS), CONTEST_DURATION_MS)
      const eventId = randomUUID()
      await db.query('INSERT INTO faxing_events (id, title, event_date, official, attendees) VALUES ($1, $2, $3, $4, $5::jsonb)', [eventId, room.title, new Date(begun), room.official, JSON.stringify(ranked)])
      await db.query('UPDATE faxing_rooms SET closed_at = $2, event_id = $3 WHERE id = $1', [room.id, new Date(now), eventId])
      return
    }
    default:
      fail(400, 'Ukjent handling.')
  }
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    if (!pool) return res.status(503).json({ error: 'Database connection is not configured' })
    const code = typeof req.query.code === 'string' ? req.query.code.trim().toUpperCase() : ''
    if (req.method === 'GET') {
      if (!code) return res.status(200).json(await listRooms(pool))
      const room = (await pool.query<RoomRow>(`SELECT ${ROOM_COLUMNS} FROM faxing_rooms WHERE code = $1`, [code])).rows[0]
      if (!room) return res.status(404).json({ error: 'Intet Rom haver denne Kode.' })
      return res.status(200).json(await snapshot(pool, room, await roleOf(pool, room, req)))
    }
    if (req.method !== 'POST') { res.setHeader('Allow', 'GET, POST'); return res.status(405).json({ error: 'Method not allowed' }) }
    const body: Body = typeof req.body === 'object' && req.body !== null ? req.body as Body : {}
    if (body.action === 'create') return res.status(201).json(await createRoom(pool, req, body))
    if (!code) return res.status(400).json({ error: 'Rommets Kode mangler.' })

    const client = await pool.connect()
    try {
      await client.query('BEGIN')
      // The row lock serialises every action in one room, so a self-finish and a host
      // correction landing together apply one after the other rather than interleaving.
      const room = (await client.query<RoomRow>(`SELECT ${ROOM_COLUMNS} FROM faxing_rooms WHERE code = $1 FOR UPDATE`, [code])).rows[0]
      if (!room) fail(404, 'Intet Rom haver denne Kode.')
      const now = Date.now()
      const token = await act(client, room, body.action, body, await roleOf(client, room, req), now)
      const fresh = (await client.query<RoomRow>(`SELECT ${ROOM_COLUMNS} FROM faxing_rooms WHERE id = $1`, [room.id])).rows[0]
      const result = await snapshot(client, fresh, await roleOf(client, fresh, req, token))
      await client.query('COMMIT')
      return res.status(200).json(token ? { ...result, token } : result)
    } catch (error) {
      await client.query('ROLLBACK').catch(() => undefined)
      throw error
    } finally {
      client.release()
    }
  } catch (error) {
    if (error instanceof HttpError) return res.status(error.status).json({ error: error.message })
    console.error('[rooms]', error)
    return res.status(500).json({ error: 'Rommet lot seg ikke nå. Prøv påny.' })
  }
}
