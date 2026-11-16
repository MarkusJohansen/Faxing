import type { ArchivedContestant, FaxingEvent, RecordedTitle } from '../types'

/** The crowns the code awards. A line per crown, in the order they are shown. */
export type Crown = 'Faxekonge' | 'Faxedronning' | 'Faxemonark'

export const CROWN_ORDER: Crown[] = ['Faxekonge', 'Faxedronning', 'Faxemonark']

/**
 * Which recorded titles fill each line. The old Faxinger wrote 'Erkekonge' for the first winner:
 * it is a king's crown, so it stands in the king's line. A crown prince and a prince are not
 * kings, and a knight and a horseman were never crowned, so none of them fill any line.
 */
const LINE_TITLES: Record<Crown, RecordedTitle[]> = {
  Faxekonge: ['Faxekonge', 'Erkekonge'],
  Faxedronning: ['Faxedronning'],
  Faxemonark: ['Faxemonark'],
}

/** One crowned holder at one Faxing: a single node on a line. A repeat winner is two nodes. */
export interface Reign {
  /** The Faxing that crowned this holder, so the node can open it. */
  eventId: string
  eventName: string
  date: number
  name: string
  /** Null when the record states no time: the view says `Tid ukjent`, never `0:00`. */
  elapsed: number | null
  /** The title the record wrote, when it is not the line's own crown (e.g. `Erkekonge`). */
  recordedAs: RecordedTitle | null
  reigning: boolean
}

export interface CrownLine {
  crown: Crown
  reigns: Reign[]
}

/**
 * The day den andre orden was founded at Konsilet på A4. A founding is not a Faxing: it crowned
 * nobody and has no contestants, so it is no chronicle row, and it is stored here rather than in
 * the database. Noon UTC is how a dated event without a clock time is filed, so a Faxing that
 * day falls on the same side of the line the archive puts it.
 */
export const SECOND_ORDER_FOUNDED = Date.UTC(2024, 9, 10, 12)

/** One thing on a crown line: a reign, or the dashed mark where den andre orden begins. */
export type LineNode = { kind: 'reign'; reign: Reign } | { kind: 'founding'; date: number }

/**
 * A line's reigns with the founding mark among them. The mark is drawn only in a line that holds
 * a reign from before the founding: a divider with nothing above it separates nothing. It stands
 * before the first reign of the new order, or after the last of the old when the new order has
 * not yet reached that crown — the line then ends by saying where the order it reads became this
 * one.
 */
export function lineNodes(reigns: Reign[], founded: number = SECOND_ORDER_FOUNDED): LineNode[] {
  const nodes: LineNode[] = reigns.map(reign => ({ kind: 'reign', reign }))
  const firstNew = reigns.findIndex(reign => reign.date >= founded)
  if (firstNew === 0 || reigns.length === 0) return nodes
  nodes.splice(firstNew === -1 ? reigns.length : firstNew, 0, { kind: 'founding', date: founded })
  return nodes
}

/**
 * The succession: who has held each crown, and at which Faxing, oldest first. Derived from the
 * published chronicle on every call; nothing is stored, so a correction to a closed Faxing
 * corrects the line on the next load.
 *
 * Only official Faxinger fill a line, the same rule that decides who reigns: a crown handed out
 * at a garden party is not a reign. Each record's own title is taken as written, never
 * re-derived: the chronicle is the verdict of that night, and a hand-entered Faxing has no
 * start instant to derive from.
 */
export function successionLines(events: FaxingEvent[]): CrownLine[] {
  const official = events.filter(event => event.official)
  const reigningId = latestOfficial(official)?.id ?? null
  // Oldest first. On a shared date the Faxing listed first in the chronicle is the later reign:
  // the same tiebreak reigningTribute() uses to decide who reigns, or the two views would
  // disagree about it. A later position in the chronicle sorts first, so the first-listed one
  // ends up last, as the latest reign.
  const oldestFirst = official
    .map((event, index) => ({ event, index }))
    .sort((a, b) => a.event.date - b.event.date || b.index - a.index)
    .map(({ event }) => event)
  return CROWN_ORDER.map(crown => ({
    crown,
    reigns: oldestFirst.flatMap(event => crowned(event, crown, event.id === reigningId)),
  }))
}

/**
 * The lines the screen shows. Kongerekka and Dronningrekka are always shown, even empty: a night
 * with no queen still has a queen's line, and the line says so. Monarkrekka is shown only once
 * the chronicle records a `Faxemonark`, which is awarded to a contestant recorded as neither man
 * nor woman and can therefore go unawarded for many Faxinger. An empty third line reads as a
 * page that failed to load; an absent one reads as a crown the Order has not yet given.
 */
export function shownLines(lines: CrownLine[]): CrownLine[] {
  return lines.filter(line => line.crown !== 'Faxemonark' || line.reigns.length > 0)
}

/** The latest official Faxing; on a shared date the one the chronicle lists first. */
function latestOfficial(official: FaxingEvent[]): FaxingEvent | null {
  let latest: FaxingEvent | null = null
  for (const event of official) if (latest === null || event.date > latest.date) latest = event
  return latest
}

/** The record's holders of one crown, in the record's own contestant order. */
function crowned(event: FaxingEvent, crown: Crown, reigning: boolean): Reign[] {
  return event.contestants
    .filter((entry): entry is ArchivedContestant & { title: RecordedTitle } => entry.title !== null && LINE_TITLES[crown].includes(entry.title))
    .map(entry => ({
      eventId: event.id,
      eventName: event.name,
      date: event.date,
      name: entry.name,
      elapsed: entry.elapsed,
      recordedAs: entry.title === crown ? null : entry.title,
      reigning,
    }))
}
