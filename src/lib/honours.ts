import type { FaxingEvent, RecordedTitle } from '../types'
import { nameKey, personKey } from './people.ts'

export type Honour = 'saint' | 'pope' | 'champion'

/** Highest first: a person holding several shows the first. */
const ORDER: Honour[] = ['saint', 'pope', 'champion']

const CROWNS = new Set<RecordedTitle>(['Faxekonge', 'Faxedronning', 'Erkekonge'])

/**
 * The people the lore names (Lore.tsx), by person key. Lore, not chronicle: no Faxing records a
 * pope or a saint. St. Markus (Markus Johansen) and St. William were canonised by Faxepave
 * Leopold II, who is Gleb Rychkov. The chronicle's bare "Markus" is linked to Markus Johansen by
 * scripts/history/people.json, so the saint is only ever marked under his full name. St. Are is
 * Are Tømmerås, who drank at the first Faxeting (recorded there as "Are Tommerås"). The other
 * elders (Njål, Magne, Ivar) are in no record. The other saints (Njål, Magne, Ivar, Are) were never in a room.
 */
const LORE: Record<string, Honour> = {
  [nameKey('Markus Johansen')]: 'saint',
  [nameKey('William Fagerstrøm')]: 'saint',
  [nameKey('Are Tømmerås')]: 'saint',
  [nameKey('Gleb Rychkov')]: 'pope',
}

/** The lore's people by their full names: a person who exists even where no entry spells it out. */
export const LORE_NAMES: string[] = ['Markus Johansen', 'William Fagerstrøm', 'Are Tømmerås', 'Gleb Rychkov']

export const HONOUR_LABEL: Record<Honour, string> = { saint: 'Helgen', pope: 'Pave', champion: 'Fordums Mester' }
export const HONOUR_GLYPH: Record<Honour, string> = { saint: '✦', pope: '✠', champion: '♛' }

/** Each person's honour, by person key. Derived on every call; nothing is stored. */
export function honoursOf(events: FaxingEvent[]): Map<string, Honour> {
  const held = new Map<string, Set<Honour>>()
  const give = (key: string, honour: Honour) => held.set(key, (held.get(key) ?? new Set()).add(honour))
  for (const [key, honour] of Object.entries(LORE)) give(key, honour)
  for (const event of events) {
    // Official Faxinger only: a crown handed out on a garden-party night is not a championship.
    if (!event.official) continue
    for (const entry of event.contestants) {
      if (entry.title !== null && CROWNS.has(entry.title)) give(personKey(entry), 'champion')
    }
  }
  return new Map([...held].map(([key, honours]) => [key, ORDER.find(honour => honours.has(honour)) as Honour]))
}
