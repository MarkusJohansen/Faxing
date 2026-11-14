#!/usr/bin/env node
/**
 * Files the Faxings that were recorded outside the application into the chronicle.
 *
 * The record is scripts/history/legacy-events.json; docs/legacy-faxinger.md keeps the
 * original messages beside it and is the record where the two disagree.
 *
 * This is run once, by hand, against a running Faxing server. It goes through the door a
 * Faxepave already has (POST /api/events), so it needs no access to the database, and nothing
 * about it ships in the server: an import that re-ran at every start would bring back an event
 * a Faxepave had deleted.
 *
 * It only adds. An event whose id is in the chronicle is left alone, and one is held back while
 * the chronicle has another event on the same day, because that Faxing may have been entered by
 * hand already. No title is computed here: the fixture states the titles its record states.
 *
 *   npm run seed:history -- --dry-run                    validate the record, print it
 *   npm run seed:history -- https://faxing.example       show what would be filed there
 *   FAXEPAVE_PASSWORD=… npm run seed:history -- https://faxing.example --write
 */
import type { Gender, RecordedTitle } from '../src/types'
import legacyRecord from './history/legacy-events.json' with { type: 'json' }

const HOUR_MS = 60 * 60 * 1000
const REQUEST_TIMEOUT_MS = 15_000
const PASSWORD_VARIABLE = 'FAXEPAVE_PASSWORD'
const SESSION_COOKIE = 'faxepave_session'
/** The calendar the records were kept in, for asking whether a day already has an event. */
const RECORD_TIME_ZONE = 'Europe/Oslo'
const GENDERS = new Set<Gender>(['male', 'female', 'other'])
/**
 * The live titles plus the three the old records use. Erkekonge, Kronprins and Prins are
 * transcribed, never awarded: the ranking rules cannot produce them, and are not called here.
 */
const TITLES = new Set<RecordedTitle>([
  'Faxekonge',
  'Faxedronning',
  'Faxemonark',
  'Faxeridder',
  'Hestemann',
  'Erkekonge',
  'Kronprins',
  'Prins',
])

interface LegacyContestant {
  id: string
  name: string
  gender: Gender
  finishedAt: null
  disqualified: boolean
  title: RecordedTitle | null
  elapsed: number | null
}

interface LegacyEvent {
  id: string
  title: string
  /** The recorded day, YYYY-MM-DD. */
  day: string
  date: number
  official: boolean
  contestants: LegacyContestant[]
}

/** A chronicle row as GET /api/events returns it; only what the comparison needs. */
interface FiledEvent {
  id: string
  title: string
  event_date: string
}

type RawContestant = { name?: unknown; gender?: unknown; title?: unknown; time?: unknown }
type RawEvent = {
  id?: unknown
  title?: unknown
  date?: unknown
  official?: unknown
  contestants?: unknown
}

// A function declaration, not an arrow: TypeScript only narrows `unknown` after a call it can
// see never returns, and it reads that off a declared function.
function fail(message: string): never {
  throw new Error(message)
}

/** "12:34" or "0:56,66" as milliseconds. The records write durations, never clock times. */
function parseTime(value: string, where: string): number {
  const match = /^(\d{1,2}):([0-5]\d)(?:[,.](\d{1,3}))?$/.exec(value)
  if (match === null) {
    fail(`${where}: "${value}" is not a time like 12:34 or 0:56,66`)
  }
  const milliseconds =
    Number(match[1]) * 60_000 + Number(match[2]) * 1_000 + Number((match[3] ?? '').padEnd(3, '0'))
  if (milliseconds >= HOUR_MS) {
    fail(`${where}: "${value}" is not inside the hour`)
  }
  return milliseconds
}

/**
 * Reads the record and returns the events shaped the way `close` writes a chronicle entry.
 * Everything is validated before anything is sent, so a bad line stops the run with nothing
 * filed instead of with half of it.
 */
function readRecord(raw: unknown): LegacyEvent[] {
  if (raw === null || typeof raw !== 'object' || !Array.isArray((raw as { events?: unknown }).events)) {
    fail('the record has no events array')
  }
  const events = (raw as { events: RawEvent[] }).events
  if (events.length === 0) {
    fail('the record has no events array')
  }

  const eventIds = new Set<string>()

  return events.map((event, eventIndex) => {
    const rawId = event.id
    const where = typeof rawId === 'string' ? rawId : `event ${eventIndex + 1}`

    if (typeof rawId !== 'string' || !/^[a-z0-9][a-z0-9-]{2,63}$/.test(rawId)) {
      fail(`${where}: id must be lower-case letters, digits and dashes`)
    }
    if (eventIds.has(rawId)) {
      fail(`${where}: the id appears twice`)
    }
    eventIds.add(rawId)

    const eventTitle = event.title
    if (typeof eventTitle !== 'string' || eventTitle.trim() === '') {
      fail(`${where}: title is empty`)
    }
    const rawDate = event.date
    if (typeof rawDate !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(rawDate)) {
      fail(`${where}: date must be written as YYYY-MM-DD`)
    }

    // Noon, because none of the records gives a clock time. The value only groups the event
    // under a day in the archive; the contestant's own instant is never invented.
    // Noon UTC, stated: without the Z the instant would follow the clock of whichever machine
    // ran this. Noon UTC is the same day in Norway all year. The round trip catches
    // 30 February, which Date rolls into March.
    const date = new Date(`${rawDate}T12:00:00Z`)
    if (Number.isNaN(date.getTime()) || date.toISOString().slice(0, 10) !== rawDate) {
      fail(`${where}: ${rawDate} is not a real calendar date`)
    }
    const official = event.official
    if (typeof official !== 'boolean') {
      fail(`${where}: official must be true or false`)
    }
    if (!Array.isArray(event.contestants) || event.contestants.length === 0) {
      fail(`${where}: contestants is empty`)
    }

    const names = new Set<string>()
    const contestants = (event.contestants as RawContestant[]).map((contestant, index) => {
      const at = `${where}, contestant ${index + 1}`
      const name = typeof contestant?.name === 'string' ? contestant.name.trim() : ''
      if (name === '') {
        fail(`${at}: the name is empty`)
      }
      if (names.has(name.toLowerCase())) {
        fail(`${at}: "${name}" appears twice`)
      }
      names.add(name.toLowerCase())

      const gender = contestant.gender
      if (typeof gender !== 'string' || !GENDERS.has(gender as Gender)) {
        fail(`${at}: gender must be one of ${[...GENDERS].join(', ')}`)
      }

      const title = (contestant.title ?? null) as RecordedTitle | null
      if (title !== null && !TITLES.has(title)) {
        fail(`${at}: "${title}" is not a title this archive knows`)
      }

      const elapsed = contestant.time == null ? null : parseTime(String(contestant.time), at)
      if (title === 'Hestemann' && elapsed !== null) {
        fail(`${at}: the old records give a Hestemann no time; drop "time" or the title`)
      }

      const recorded: LegacyContestant = {
        // Derived from the event and the recorded position, so the id means the same every run.
        id: `${rawId}-${String(index + 1).padStart(2, '0')}`,
        name,
        gender: gender as Gender,
        // The record states a duration, not an instant. The archive displays the duration,
        // so no finishedAt is fabricated.
        finishedAt: null,
        disqualified: title === 'Hestemann',
        title,
        elapsed,
      }
      return recorded
    })

    return {
      id: rawId,
      title: eventTitle.trim(),
      day: rawDate,
      date: date.getTime(),
      official,
      contestants,
    }
  })
}

function describeRecord(events: LegacyEvent[]): void {
  for (const event of events) {
    const timed = event.contestants.filter((contestant) => contestant.elapsed !== null).length
    const kind = event.official ? 'official' : 'unofficial'
    console.log(
      `${event.id.padEnd(20)} ${event.day}  ${kind.padEnd(10)} ${String(event.contestants.length).padStart(3)} people, ${String(timed).padStart(3)} timed  ${event.title}`,
    )
  }
}

/** One request to the Faxing server. A refusal is an error carrying what the server said. */
async function request(url: URL, init: RequestInit = {}): Promise<Response> {
  let response: Response
  try {
    response = await fetch(url, { ...init, signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS) })
  } catch (error) {
    fail(`cannot reach ${url.origin}: ${(error as Error).message}`)
  }
  if (!response.ok) {
    const body = await response.text().catch(() => '')
    fail(`${init.method ?? 'GET'} ${url.pathname} answered ${response.status} ${body.slice(0, 200)}`.trim())
  }
  return response
}

const json = (body: unknown, cookie?: string): RequestInit => ({
  method: 'POST',
  headers: { 'Content-Type': 'application/json', ...(cookie === undefined ? {} : { Cookie: cookie }) },
  body: JSON.stringify(body),
})

/** The day in Norway on which an instant falls, YYYY-MM-DD (the Swedish locale writes it so). */
const dayInNorway = (instant: string): string =>
  new Intl.DateTimeFormat('sv-SE', { timeZone: RECORD_TIME_ZONE }).format(new Date(instant))

/** Logs in as Faxepave and returns the session cookie the events API asks for. */
async function logIn(base: URL): Promise<string> {
  const password = process.env[PASSWORD_VARIABLE]
  if (!password) {
    fail(`${PASSWORD_VARIABLE} is not set; filing needs the Faxepave password`)
  }
  const response = await request(new URL('/api/admin', base), json({ password }))
  const cookie = response.headers
    .getSetCookie()
    .map((value) => value.split(';')[0])
    .find((value) => value.startsWith(`${SESSION_COOKIE}=`))
  return cookie ?? fail('the server accepted the password but sent no session')
}

async function main(): Promise<void> {
  const args = process.argv.slice(2)
  const flags = args.filter((arg) => arg.startsWith('--'))
  const targets = args.filter((arg) => !arg.startsWith('--'))
  for (const flag of flags) {
    if (flag !== '--dry-run' && flag !== '--write') {
      fail(`unknown argument "${flag}"; there are --dry-run and --write`)
    }
  }

  const events = readRecord(legacyRecord)
  describeRecord(events)

  if (flags.includes('--dry-run')) {
    console.log('\nDry run: the record is valid, and no server was contacted.')
    return
  }
  if (targets.length !== 1 || !URL.canParse(targets[0])) {
    fail('name the Faxing server to file into, like https://faxing.example, or pass --dry-run')
  }
  const base = new URL(targets[0])

  const filed = (await (await request(new URL('/api/events', base))).json()) as FiledEvent[]
  const filedIds = new Set(filed.map((event) => event.id))

  const missing: LegacyEvent[] = []
  console.log(`\nEvents in the chronicle at ${base.origin}: ${filed.length}`)
  for (const event of events) {
    const sameDay = filed.find((other) => dayInNorway(other.event_date) === event.day)
    if (filedIds.has(event.id)) {
      console.log(`${event.id}: already there, left alone`)
    } else if (sameDay !== undefined) {
      // The chronicle is older than this record. A second entry for the same night would be a
      // duplicate nobody asked for, so a person decides which of the two stays.
      console.log(`${event.id}: held back, that day already has "${sameDay.title}" (${sameDay.id})`)
    } else {
      console.log(`${event.id}: to file`)
      missing.push(event)
    }
  }

  if (missing.length === 0) {
    console.log('\nNothing to file.')
    return
  }
  if (!flags.includes('--write')) {
    console.log(`\nNothing was written. Add --write to file ${missing.length}.`)
    return
  }

  const cookie = await logIn(base)
  for (const event of missing) {
    // One request per event, so a failure part-way leaves the earlier ones filed. That is
    // safe: the next run finds them and files only the rest.
    await request(
      new URL('/api/events', base),
      json(
        {
          id: event.id,
          title: event.title,
          eventDate: event.date,
          official: event.official,
          attendees: event.contestants,
        },
        cookie,
      ),
    )
    console.log(`${event.id}: filed`)
  }
}

main().catch((error: Error) => {
  console.error(`seed-history: ${error.message}`)
  process.exitCode = 1
})
