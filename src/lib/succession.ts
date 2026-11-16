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
