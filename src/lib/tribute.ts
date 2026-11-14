import type { FaxingEvent, RankedContestant, Title } from '../types'

/** The crowns, in the order they are honoured. Knights and Hestemann are not crowns. */
const CROWNS: readonly Title[] = ['Faxekonge', 'Faxedronning', 'Faxemonark']

export interface Tribute {
  event: FaxingEvent
  crowns: RankedContestant[]
}

/**
 * The crowns of the most recent official Faxing, or null when nobody reigns. Pure, checked
 * under node (see tribute.demo.ts).
 *
 * Reads the title the chronicle recorded rather than re-deriving it: the chronicle is the
 * verdict of that night, Faxepave's corrections included, and hand-entered Faxinger have no
 * start instant to derive from.
 */
export function reigningTribute(events: FaxingEvent[]): Tribute | null {
  // Strictly greater, so a tie on date goes to the event listed first.
  let reigning: FaxingEvent | null = null
  for (const event of events) if (event.official && (reigning === null || event.date > reigning.date)) reigning = event
  if (reigning === null) return null
  const contestants = Array.isArray(reigning.contestants) ? reigning.contestants : []
  // No fallback to an earlier Faxing: a latest official Faxing that crowned nobody has
  // contested the crowns, and reaching back would honour a crown already lost.
  const crowns = CROWNS.flatMap(title => contestants.filter(contestant => contestant.title === title))
  return crowns.length > 0 ? { event: reigning, crowns } : null
}
