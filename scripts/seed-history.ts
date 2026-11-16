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
 * It adds. An event whose id is in the chronicle is left alone, and one is held back while the
 * chronicle has another event on the same day, because that Faxing may have been entered by
 * hand already. No title is computed here: the fixture states the titles its record states.
 *
 * A record can still be corrected after it was filed — a crown the organizer supplied later.
 * `--update` rewrites the contestants of the events it is given by name, and nothing else: the
 * row keeps the title, day and official flag the chronicle has, so a Faxepave's renaming is not
 * undone, and an event nobody named is still untouched.
 *
 *   npm run seed:history -- --dry-run                    validate the record, print it
 *   npm run seed:history -- https://faxing.example       show what would be filed there
 *   FAXEPAVE_PASSWORD=… npm run seed:history -- https://faxing.example --write
 *   FAXEPAVE_PASSWORD=… npm run seed:history -- https://faxing.example --write --update legacy-2025-09-10
 */import type { Gender, RecordedTitle } from '../src/types'
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
  official: boolean
  attendees: FiledContestant[]
}

/** A contestant as the chronicle stores it. The old rows carry a duration and no instant. */
interface FiledContestant {
  id?: string
  name?: string
  gender?: string
  title?: string | null
  elapsed?: number | null
  disqualified?: boolean
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

/** "12:34.5" as a duration the way the archive reads it, for a report that says what moved. */
const asDuration = (milliseconds: number | null | undefined): string => {
  if (milliseconds === null || milliseconds === undefined) return 'no time'
  const seconds = milliseconds / 1000
  const minutes = Math.floor(seconds / 60)
  return `${minutes}:${seconds - minutes * 60 < 10 ? '0' : ''}${(seconds - minutes * 60).toFixed(3).replace(/0+$/, '').replace(/\.$/, '')}`
}

/**
 * What the chronicle would gain or lose if this row were rewritten from the record, one line per
 * difference. Empty means the row already says what the record says. A person common to both is
 * matched by name: names are unique within an event, and the record's ids are positional.
 */
function contestantChanges(record: LegacyContestant[], filed: FiledContestant[]): string[] {
  const byName = (person: { name?: string }) => String(person.name ?? '').trim().toLowerCase()
  const there = new Map(filed.map(person => [byName(person), person]))
  const recorded = new Set(record.map(byName))
  const changes: string[] = []
  for (const person of record) {
    const filedPerson = there.get(byName(person))
    const title = person.title === null ? 'no title' : person.title
    if (filedPerson === undefined) {
      changes.push(`+ ${person.name} (${title})`)
      continue
    }
    const filedTitle = filedPerson.title == null ? 'no title' : filedPerson.title
    if (String(filedPerson.name) !== person.name) changes.push(`${filedPerson.name} → ${person.name}`)
    if (filedTitle !== title) changes.push(`${person.name}: ${filedTitle} → ${title}`)
    if (filedPerson.gender !== person.gender) changes.push(`${person.name}: ${filedPerson.gender} → ${person.gender}`)
    if ((filedPerson.elapsed ?? null) !== person.elapsed) {
      changes.push(`${person.name}: ${asDuration(filedPerson.elapsed)} → ${asDuration(person.elapsed)}`)
    }
    if (Boolean(filedPerson.disqualified) !== person.disqualified) {
      changes.push(`${person.name}: ${person.disqualified ? 'now a Hestemann' : 'no longer a Hestemann'}`)
    }
  }
  for (const person of filed) {
    if (!recorded.has(byName(person))) changes.push(`- ${person.name} (only in the chronicle)`)
  }
  return changes
}

/** The record's contestants, keeping the id the chronicle already gave a name. */
function withFiledIds(record: LegacyContestant[], filed: FiledContestant[]): LegacyContestant[] {
  const ids = new Map(
    filed.map(person => [String(person.name ?? '').trim().toLowerCase(), person.id] as const),
  )
  return record.map(person => {
    const id = ids.get(person.name.toLowerCase())
    return id === undefined ? person : { ...person, id }
  })
}

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

/** The server to file into. A name that is not a URL stops the run before anything is sent. */
function parseServer(value: string): URL {
  try {
    return new URL(value)
  } catch {
    return fail(`"${value}" is not a server, like https://faxing.example`)
  }
}

/** An event named for --update that the chronicle does not already state correctly. */
interface Rewrite {
  event: LegacyEvent
  row: FiledEvent
}

/**
 * Compares the events named for --update with the chronicle and prints what each would change.
 * Returns only the rows that need rewriting. The row's own name, day and official flag are
 * reported and left alone: the Faxepave may have renamed the night, and an update is about who
 * was crowned, not about what the night was called.
 */
function planUpdates(events: LegacyEvent[], filed: FiledEvent[], named: string[]): Rewrite[] {
  const rewrites: Rewrite[] = []
  for (const id of named) {
    const event = events.find((candidate) => candidate.id === id)
    const row = filed.find((candidate) => candidate.id === id)
    if (event === undefined) fail(`--update ${id}: the record has no event with that id`)
    if (row === undefined) {
      console.log(`\n${id}: not in the chronicle yet, so there is nothing to update`)
      continue
    }
    if (row.title !== event.title) {
      console.log(`${id}: the chronicle calls it "${row.title}"; the record's heading is "${event.title}". The row keeps its name.`)
    }
    if (dayInNorway(row.event_date) !== event.day) {
      console.log(`${id}: the chronicle dates it ${dayInNorway(row.event_date)}; the record says ${event.day}. The row keeps its date.`)
    }
    if (row.official !== event.official) {
      console.log(`${id}: the chronicle marks it ${row.official ? 'official' : 'unofficial'}; the record says the opposite. The row keeps its flag.`)
    }
    const changes = contestantChanges(event.contestants, row.attendees)
    if (changes.length === 0) {
      console.log(`${id}: already says what the record says, left alone`)
      continue
    }
    console.log(`\n${id}: ${changes.length} change${changes.length === 1 ? '' : 's'} to the contestants`)
    for (const change of changes) console.log(`  ${change}`)
    rewrites.push({ event, row })
  }
  return rewrites
}

/** Sends what the plan settled on: the events the chronicle lacks, then the named rewrites. */
async function writeChronicle(base: URL, missing: LegacyEvent[], rewrites: Rewrite[]): Promise<void> {
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
  for (const { event, row } of rewrites) {
    // PUT replaces the contestants; the title, day and flag sent back are the row's own.
    // The events API names a row by query, not by path: `/api/events?id=…` is the only route
    // that reaches PUT, and a path segment answers 405.
    await request(new URL(`/api/events?id=${encodeURIComponent(event.id)}`, base), {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', Cookie: cookie },
      body: JSON.stringify({
        title: row.title,
        eventDate: Date.parse(row.event_date),
        official: row.official,
        attendees: withFiledIds(event.contestants, row.attendees),
      }),
    })
    console.log(`${event.id}: updated`)
  }
}

async function main(): Promise<void> {
  const args = process.argv.slice(2)
  const flags = args.filter((arg) => arg.startsWith('--'))
  const targets = args.filter((arg) => !arg.startsWith('--'))
  for (const flag of flags) {
    if (flag !== '--dry-run' && flag !== '--write' && flag !== '--update') {
      fail(`unknown argument "${flag}"; there are --dry-run, --write and --update`)
    }
  }
  const named = targets.slice(1)
  if (flags.includes('--update') && named.length === 0) {
    fail('--update rewrites the events it is given by name, and none was named: add the ids, like --update legacy-2025-09-10')
  }
  if (!flags.includes('--update') && named.length > 0) {
    fail(`"${named[0]}" is not a server; to rewrite a filed event, add --update before naming it`)
  }

  const events = readRecord(legacyRecord)
  describeRecord(events)

  if (flags.includes('--dry-run')) {
    console.log('\nDry run: the record is valid, and no server was contacted.')
    return
  }
  if (targets.length === 0) {
    fail('name the Faxing server to file into, like https://faxing.example, or pass --dry-run')
  }
  const base = parseServer(targets[0])

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
  }

  // Only the events named after --update are compared and, with --write, rewritten. The default
  // run stays additive, so a record edit cannot quietly undo a correction made in the interface.
  const rewrites = planUpdates(events, filed, named)

  if (missing.length === 0 && rewrites.length === 0) return
  if (!flags.includes('--write')) {
    const parts = [
      missing.length > 0 ? `file ${missing.length}` : '',
      rewrites.length > 0 ? `update ${rewrites.length}` : '',
    ].filter(Boolean)
    console.log(`\nNothing was written. Add --write to ${parts.join(' and ')}.`)
    return
  }

  await writeChronicle(base, missing, rewrites)
}

main().catch((error: Error) => {
  console.error(`seed-history: ${error.message}`)
  process.exitCode = 1
})
