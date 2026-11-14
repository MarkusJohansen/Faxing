#!/usr/bin/env node
/**
 * Files the Faxings that were recorded outside the application into the chronicle (faxing_events).
 *
 * The record is scripts/history/legacy-events.json; docs/legacy-faxinger.md keeps the
 * original messages beside it and is the record where the two disagree.
 *
 * The write is additive. An event id that is already in the chronicle is left untouched,
 * so running this twice changes nothing and never overwrites a correction made in the
 * interface. No title is computed here: the fixture states the titles its record states.
 *
 *   npm run seed:history -- --dry-run   validate the record, print the planned rows
 *   npm run seed:history                insert the events that are not there yet
 *
 * Needs DATABASE_URL (or POSTGRES_URL) for the write, and the schema created by the server.
 */
import { readFile } from 'node:fs/promises'
import { fileURLToPath, pathToFileURL } from 'node:url'

const RECORD_PATH = fileURLToPath(new URL('./history/legacy-events.json', import.meta.url))
const HOUR_MS = 60 * 60 * 1000
const GENDERS = new Set(['male', 'female', 'other'])
/**
 * The live titles plus the three the old records use. Erkekonge, Kronprins and Prins are
 * transcribed, never awarded: rankContestants() cannot produce them, and is not called here.
 */
const TITLES = new Set([
  'Faxekonge',
  'Faxedronning',
  'Faxemonark',
  'Faxeridder',
  'Hestemann',
  'Erkekonge',
  'Kronprins',
  'Prins',
])
const DATABASE_VARIABLES = ['DATABASE_URL', 'POSTGRES_URL']

const fail = (message) => {
  throw new Error(message)
}

/** "12:34" or "0:56,66" as milliseconds. The records write durations, never clock times. */
function parseTime(value, where) {
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
 * Everything is validated before anything is written: a half-imported record is worse than
 * none, because the next run would skip the half that landed.
 */
export function readRecord(raw) {
  if (raw === null || typeof raw !== 'object' || !Array.isArray(raw.events) || raw.events.length === 0) {
    fail('the record has no events array')
  }

  const eventIds = new Set()

  return raw.events.map((event, eventIndex) => {
    const where = typeof event?.id === 'string' ? event.id : `event ${eventIndex + 1}`

    if (typeof event.id !== 'string' || !/^[a-z0-9][a-z0-9-]{2,63}$/.test(event.id)) {
      fail(`${where}: id must be lower-case letters, digits and dashes`)
    }
    if (eventIds.has(event.id)) {
      fail(`${where}: the id appears twice`)
    }
    eventIds.add(event.id)

    if (typeof event.title !== 'string' || event.title.trim() === '') {
      fail(`${where}: title is empty`)
    }
    if (typeof event.date !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(event.date)) {
      fail(`${where}: date must be written as YYYY-MM-DD`)
    }

    // Noon, because none of the records gives a clock time. The value only groups the event
    // under a day in the archive; the contestant's own instant is never invented.
    const date = new Date(`${event.date}T12:00:00`)
    if (Number.isNaN(date.getTime())) {
      fail(`${where}: ${event.date} is not a real calendar date`)
    }
    if (typeof event.official !== 'boolean') {
      fail(`${where}: official must be true or false`)
    }
    if (!Array.isArray(event.contestants) || event.contestants.length === 0) {
      fail(`${where}: contestants is empty`)
    }

    const names = new Set()
    const contestants = event.contestants.map((contestant, index) => {
      const at = `${where}, contestant ${index + 1}`
      const name = typeof contestant?.name === 'string' ? contestant.name.trim() : ''
      if (name === '') {
        fail(`${at}: the name is empty`)
      }
      if (names.has(name.toLowerCase())) {
        fail(`${at}: "${name}" appears twice`)
      }
      names.add(name.toLowerCase())

      if (!GENDERS.has(contestant.gender)) {
        fail(`${at}: gender must be one of ${[...GENDERS].join(', ')}`)
      }

      const title = contestant.title ?? null
      if (title !== null && !TITLES.has(title)) {
        fail(`${at}: "${title}" is not a title this archive knows`)
      }

      const elapsed = contestant.time == null ? null : parseTime(String(contestant.time), at)
      if (title === 'Hestemann' && elapsed !== null) {
        fail(`${at}: the old records give a Hestemann no time; drop "time" or the title`)
      }

      return {
        // Derived from the event and the recorded position, so a re-run targets the same row.
        id: `${event.id}-${String(index + 1).padStart(2, '0')}`,
        name,
        gender: contestant.gender,
        // The record states a duration, not an instant. The archive displays the duration,
        // so no finishedAt is fabricated.
        finishedAt: null,
        disqualified: title === 'Hestemann',
        title,
        elapsed,
      }
    })

    return {
      id: event.id,
      title: event.title.trim(),
      date: date.getTime(),
      official: event.official,
      contestants,
    }
  })
}

function describe(events) {
  for (const event of events) {
    const timed = event.contestants.filter((contestant) => contestant.elapsed !== null).length
    const day = new Date(event.date).toISOString().slice(0, 10)
    const kind = event.official ? 'official' : 'unofficial'
    console.log(
      `${event.id.padEnd(20)} ${day}  ${kind.padEnd(10)} ${String(event.contestants.length).padStart(3)} people, ${String(timed).padStart(3)} timed  ${event.title}`,
    )
  }
}

async function write(events) {
  const variable = DATABASE_VARIABLES.find((name) => process.env[name])
  if (variable === undefined) {
    fail(`neither ${DATABASE_VARIABLES.join(' nor ')} is set; set one, or pass --dry-run`)
  }

  const pg = await import('pg')
  const Pool = pg.Pool ?? pg.default?.Pool
  if (typeof Pool !== 'function') {
    fail('the pg package does not export Pool')
  }

  const pool = new Pool({ connectionString: process.env[variable] })
  const client = await pool.connect()

  try {
    const { rows } = await client.query("SELECT to_regclass('public.faxing_events') AS table")
    if (rows[0]?.table === null) {
      fail('faxing_events does not exist; start the server once so its migration creates it')
    }

    await client.query('BEGIN')

    let inserted = 0
    const present = []
    for (const event of events) {
      const result = await client.query(
        `INSERT INTO faxing_events (id, title, event_date, official, attendees)
         VALUES ($1, $2, $3, $4, $5::jsonb)
         ON CONFLICT (id) DO NOTHING
         RETURNING id`,
        [event.id, event.title, new Date(event.date), event.official, JSON.stringify(event.contestants)],
      )
      if (result.rowCount === 1) {
        inserted += 1
      } else {
        present.push(event.id)
      }
    }

    await client.query('COMMIT')

    console.log(`\n${inserted} inserted, ${present.length} already present.`)
    if (present.length > 0) {
      console.log(`Left untouched: ${present.join(', ')}`)
    }
  } catch (error) {
    await client.query('ROLLBACK').catch(() => {})
    throw error
  } finally {
    client.release()
    await pool.end()
  }
}

async function loadRecord() {
  try {
    return JSON.parse(await readFile(RECORD_PATH, 'utf8'))
  } catch (error) {
    fail(`cannot read ${RECORD_PATH}: ${error.message}`)
  }
}

async function main() {
  const args = process.argv.slice(2)
  for (const arg of args) {
    if (arg !== '--dry-run') {
      fail(`unknown argument "${arg}"; the only one is --dry-run`)
    }
  }
  const dryRun = args.includes('--dry-run')

  const events = readRecord(await loadRecord())
  describe(events)

  if (dryRun) {
    console.log('\nDry run: nothing was written. Remove --dry-run to file them.')
    return
  }

  await write(events)
}

// Run only when invoked as a script, so importing readRecord to check a record has no effect.
if (process.argv[1] !== undefined && import.meta.url === pathToFileURL(process.argv[1]).href) {
  main().catch((error) => {
    console.error(`seed-history: ${error.message}`)
    process.exitCode = 1
  })
}
