import type { ArchivedContestant } from '../types'
import record from '../data/people.json' with { type: 'json' }

/** A name as compared: surrounding space gone, runs of space collapsed, case ignored. */
export const nameKey = (name: string): string => name.trim().replace(/\s+/g, ' ').toLocaleLowerCase('nb')

const ALIASES = new Map(Object.entries(record.aliases).map(([alias, full]) => [nameKey(alias), full]))

/**
 * The full name a written name stands for, as the data file spells it, or the name itself when
 * nobody has resolved it. This is what a page may show for an entry; the entry keeps what the
 * record wrote.
 */
export const canonicalName = (name: string): string => ALIASES.get(nameKey(name)) ?? name.trim()

/**
 * Who an entry is: the person its name says, after the alias record has had its say. A first name
 * and its full name get the same key; a first name nobody has resolved stays its own person.
 */
export const personKey = (entry: Pick<ArchivedContestant, 'name'>): string => nameKey(canonicalName(entry.name))

export const countPeople = (events: { contestants: Pick<ArchivedContestant, 'name'>[] }[]): number =>
  new Set(events.flatMap(event => event.contestants.map(personKey))).size
