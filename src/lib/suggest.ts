import type { FaxingEvent, Gender } from '../types'
import { nameKey, personKey } from './people.ts'

export const MAX_SUGGESTIONS = 5
const MIN_QUERY = 2
/**
 * A word this long may carry one mistyped letter; a shorter one must match exactly or as a start.
 * At four letters one slip matched a first name to its near neighbours (Tora to Tara, Tore, Tori).
 */
const FUZZY_FROM = 5

export interface Person {
  key: string
  /** The full name: the entry whose own name is the person key, else the most written one. */
  name: string
  /** As last recorded, because the chronicle holds no other. */
  gender: Gender
  appearances: number
}

export interface Suggestion extends Person {
  /** Already in this room, which admits a name once. */
  taken: boolean
}

/** Lower case, no diacritics, and Norwegian letters spelled the way a phone keyboard lacks them. */
const fold = (text: string): string =>
  nameKey(text)
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/ø/g, 'o')
    .replace(/æ/g, 'ae')

const words = (text: string): string[] => fold(text).split(/[\s-]+/).filter(Boolean)

/** Edits between two words, a swapped pair of neighbours counting as one. */
function distance(a: string, b: string): number {
  const rows: number[][] = Array.from({ length: a.length + 1 }, (_, i) => [i, ...Array<number>(b.length).fill(0)])
  for (let j = 1; j <= b.length; j++) rows[0][j] = j
  for (let i = 1; i <= a.length; i++) {
    for (let j = 1; j <= b.length; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1
      rows[i][j] = Math.min(rows[i - 1][j] + 1, rows[i][j - 1] + 1, rows[i - 1][j - 1] + cost)
      if (i > 1 && j > 1 && a[i - 1] === b[j - 2] && a[i - 2] === b[j - 1]) rows[i][j] = Math.min(rows[i][j], rows[i - 2][j - 2] + 1)
    }
  }
  return rows[a.length][b.length]
}

/** How well one typed word fits one word of a name: 3 exact, 2 a start of it, 1 a slip, 0 none. */
function wordScore(typed: string, known: string): number {
  if (typed === known) return 3
  if (known.startsWith(typed)) return 2
  if (typed.length < FUZZY_FROM) return 0
  const slip = distance(typed, known) <= 1 || distance(typed, known.slice(0, typed.length)) <= 1
  return slip ? 1 : 0
}

/** Every typed word must find its own word in the name; the score is how well they all fit. */
function nameScore(typed: string[], name: string): number {
  const free = words(name)
  let total = 0
  for (const word of typed) {
    let best = 0
    let at = -1
    free.forEach((candidate, index) => {
      const score = wordScore(word, candidate)
      if (score > best) { best = score; at = index }
    })
    if (best === 0) return 0
    free.splice(at, 1)
    total += best
  }
  return total
}

/** The people the chronicle holds, each once, however often and however they were written. */
/**
 * `canonical` are full names that may exist as a person with no entry spelling them out: the
 * chronicle wrote a first name, the person is the full name in src/data/people.json, and that is
 * the name to offer.
 */
export function peopleOf(events: FaxingEvent[], canonical: string[] = []): Person[] {
  const fullNames = new Map(canonical.map(name => [nameKey(name), name]))
  const groups = new Map<string, { names: Map<string, number>; gender: Gender; appearances: number }>()
  // Oldest first, so the gender kept for a person is the latest one recorded.
  for (const event of [...events].sort((a, b) => a.date - b.date)) {
    for (const entry of event.contestants) {
      const key = personKey(entry)
      const group = groups.get(key) ?? { names: new Map(), gender: entry.gender, appearances: 0 }
      group.names.set(entry.name.trim(), (group.names.get(entry.name.trim()) ?? 0) + 1)
      group.gender = entry.gender
      group.appearances += 1
      groups.set(key, group)
    }
  }
  return [...groups].map(([key, group]) => {
    const written = [...group.names].sort((a, b) => b[1] - a[1] || b[0].length - a[0].length)
    const own = written.find(([name]) => nameKey(name) === key)
    return { key, name: own?.[0] ?? fullNames.get(key) ?? written[0][0], gender: group.gender, appearances: group.appearances }
  })
}

/** Up to five people resembling what was typed, best first. Nothing for a name typed in full. */
export function suggest(typed: string, people: Person[], inRoom: string[]): Suggestion[] {
  const query = words(typed)
  if (fold(typed).length < MIN_QUERY) return []
  const taken = new Set(inRoom.map(nameKey))
  return people
    .filter(person => nameKey(person.name) !== nameKey(typed))
    .map(person => ({ person, score: nameScore(query, person.name) }))
    .filter(match => match.score > 0)
    .sort((a, b) => b.score - a.score || b.person.appearances - a.person.appearances || a.person.name.localeCompare(b.person.name, 'nb'))
    .slice(0, MAX_SUGGESTIONS)
    .map(({ person }) => ({ ...person, taken: taken.has(nameKey(person.name)) }))
}
