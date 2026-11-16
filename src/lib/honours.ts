import type { FaxingEvent, RecordedTitle } from '../types'
import record from '../data/people.json' with { type: 'json' }
import { nameKey, personKey } from './people.ts'

export type Honour = 'founder' | 'saint' | 'pope' | 'champion'

/** Highest first: a person holding several shows the first. The game's founders stand above all. */
const ORDER: Honour[] = ['founder', 'saint', 'pope', 'champion']

const CROWNS = new Set<RecordedTitle>(['Faxekonge', 'Faxedronning', 'Erkekonge'])

/**
 * The standing the order's lore gives, by person key. Lore, not chronicle: no Faxing records a
 * founder, a pope or a saint, so the people are named in src/data/people.json and never in code.
 * Eldsterådet are the founders: they made the game itself, so no crown and no canonisation reaches
 * above them.
 */
const LORE = new Map<string, Honour>(
  Object.entries(record.honours).map(([name, honour]) => [nameKey(name), honour as Honour]),
)

/** The lore's people by their full names: a person who exists even where no entry spells it out. */
export const LORE_NAMES: string[] = Object.keys(record.honours)

export const HONOUR_LABEL: Record<Honour, string> = { founder: 'Grunnlegger', saint: 'Helgen', pope: 'Pave', champion: 'Fordums Mester' }
export const HONOUR_GLYPH: Record<Honour, string> = { founder: '⚜', saint: '✦', pope: '✠', champion: '♛' }

/**
 * Each person's honour, by person key, as of the instant `before` (default: now, which is what a
 * room being filled today wants). A crown makes a champion only for Faxinger held *after* it was
 * won, so a results page never calls someone a past champion on the night they won. The pope and
 * the saints are lore and hold on every page. Derived on every call; nothing is stored.
 */
export function honoursOf(events: FaxingEvent[], before = Infinity): Map<string, Honour> {
  const held = new Map<string, Set<Honour>>()
  const give = (key: string, honour: Honour) => held.set(key, (held.get(key) ?? new Set()).add(honour))
  for (const [key, honour] of LORE) give(key, honour)
  for (const event of events) {
    // Official Faxinger only: a crown handed out on a garden-party night is not a championship.
    // Strictly earlier only: a crown won on the same day does not count for that day's page.
    if (!event.official || event.date >= before) continue
    for (const entry of event.contestants) {
      if (entry.title !== null && CROWNS.has(entry.title)) give(personKey(entry), 'champion')
    }
  }
  return new Map([...held].map(([key, honours]) => [key, ORDER.find(honour => honours.has(honour)) as Honour]))
}
