import type { ArchivedContestant } from '../types'

/** A name as compared: surrounding space gone, runs of space collapsed, case ignored. */
export const nameKey = (name: string): string => name.trim().replace(/\s+/g, ' ').toLocaleLowerCase('nb')

/**
 * Who a chronicle entry is. A first-name-only entry carries the key of its full name as
 * `personId`; every other entry is the person its name says.
 */
export const personKey = (entry: Pick<ArchivedContestant, 'name' | 'personId'>): string =>
  entry.personId ?? nameKey(entry.name)

/**
 * An entry under a new name. The link described the old name, so it goes: an entry renamed from
 * "Arne" to "Ådne" must not keep pointing at Arne Hildrum.
 */
export const renamed = <T extends Pick<ArchivedContestant, 'name' | 'personId'>>(entry: T, name: string): T =>
  ({ ...entry, name, personId: undefined })

export const countPeople = (events: { contestants: Pick<ArchivedContestant, 'name' | 'personId'>[] }[]): number =>
  new Set(events.flatMap(event => event.contestants.map(personKey))).size
