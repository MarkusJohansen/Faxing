#!/usr/bin/env node
/**
 * Links first-name-only chronicle entries to the person they are, by setting `personId`.
 *
 * The record is scripts/history/people.json: a name as written -> the full name it stands for.
 * Run by hand against a running Faxing server, through the Faxepave's door (PUT /api/events), so
 * it needs no database access. It sets `personId` and nothing else: no name, time or title moves.
 *
 *   npm run link:people -- https://faxing.example            show the plan, change nothing
 *   FAXEPAVE_PASSWORD=… npm run link:people -- https://faxing.example --write
 */
import type { ArchivedContestant } from '../src/types'
import { countPeople, nameKey } from '../src/lib/people.ts'
import { LORE_NAMES } from '../src/lib/honours.ts'
import peopleRecord from './history/people.json' with { type: 'json' }

const REQUEST_TIMEOUT_MS = 15_000
const PASSWORD_VARIABLE = 'FAXEPAVE_PASSWORD'
const SESSION_COOKIE = 'faxepave_session'

interface FiledEvent {
  id: string
  title: string
  event_date: string
  official: boolean
  attendees: ArchivedContestant[]
}

function fail(message: string): never {
  throw new Error(message)
}

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

async function logIn(base: URL): Promise<string> {
  const password = process.env[PASSWORD_VARIABLE]
  if (!password) {
    fail(`${PASSWORD_VARIABLE} is not set; filing needs the Faxepave password`)
  }
  const response = await request(new URL('/api/admin', base), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ password }),
  })
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
    if (flag !== '--write') {
      fail(`unknown argument "${flag}"; there is --write`)
    }
  }
  if (targets.length !== 1 || !URL.canParse(targets[0])) {
    fail('name the Faxing server, like https://faxing.example')
  }
  const base = new URL(targets[0])

  const aliases = new Map(Object.entries(peopleRecord.aliases).map(([alias, full]) => [nameKey(alias), full]))
  const events = (await (await request(new URL('/api/events', base))).json()) as FiledEvent[]
  // A name the lore gives in full is a real person even where no entry spells it out.
  const present = new Set([
    ...events.flatMap((event) => event.attendees.map((entry) => nameKey(entry.name))),
    ...LORE_NAMES.map(nameKey),
  ])

  // A full name nobody carries would create a person who was never there: stop before filing.
  for (const [alias, full] of aliases) {
    if (!present.has(nameKey(full))) {
      fail(`"${alias}" points at "${full}", and no chronicle entry or lore person has that name`)
    }
  }

  const before = countPeople(events.map((event) => ({ contestants: event.attendees })))
  const changed = new Map<string, ArchivedContestant[]>()
  for (const event of events) {
    const attendees = event.attendees.map((entry) => {
      const full = aliases.get(nameKey(entry.name))
      if (full === undefined || nameKey(full) === nameKey(entry.name)) return entry
      const key = nameKey(full)
      if (entry.personId === key) return entry
      if (entry.personId !== undefined) {
        console.log(`${event.id}: "${entry.name}" already points at "${entry.personId}", left alone`)
        return entry
      }
      console.log(`${event.id}: "${entry.name}" -> ${full}`)
      return { ...entry, personId: key }
    })
    if (attendees.some((entry, index) => entry !== event.attendees[index])) changed.set(event.id, attendees)
  }

  const after = countPeople(events.map((event) => ({ contestants: changed.get(event.id) ?? event.attendees })))
  console.log(`\nPeople in the chronicle: ${before} -> ${after}`)
  if (changed.size === 0) {
    console.log('Nothing to link.')
    return
  }
  if (!flags.includes('--write')) {
    console.log(`Nothing was written. Add --write to update ${changed.size} event(s).`)
    return
  }

  const cookie = await logIn(base)
  for (const event of events) {
    const attendees = changed.get(event.id)
    if (attendees === undefined) continue
    // The fields the Faxepave's own editor sends, so only the attendees differ.
    await request(new URL(`/api/events?id=${encodeURIComponent(event.id)}`, base), {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', Cookie: cookie },
      body: JSON.stringify({
        title: event.title,
        eventDate: new Date(event.event_date).getTime(),
        official: event.official,
        attendees,
      }),
    })
    console.log(`${event.id}: updated`)
  }
}

main().catch((error: Error) => {
  console.error(`link-people: ${error.message}`)
  process.exitCode = 1
})
