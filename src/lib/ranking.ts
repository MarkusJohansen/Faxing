import type { Contestant, RankedContestant, Title } from '../types'

/**
 * Every title in the tournament is decided here and nowhere else. Pure: the result depends
 * only on the arguments, so it can be checked under node (see ranking.demo.ts).
 *
 * Returned order: finishers within the hour by finish instant, then everyone else in
 * roster order.
 */
export function rankContestants(contestants: Contestant[], contestStartTime: number | null, now: number, durationMs: number): RankedContestant[] {
  const start = contestStartTime ?? now
  // "Within the hour" is strict: a finish at or after the deadline is not a finish. A late
  // tap must not promote a horseman to a knight, or claim a crown nobody won in time.
  const finishedInTime = (contestant: Contestant) =>
    contestant.finishedAt !== null && !contestant.disqualified && (contestStartTime === null || contestant.finishedAt - start < durationMs)
  const sortKey = (contestant: Contestant) => (finishedInTime(contestant) && contestant.finishedAt !== null ? contestant.finishedAt : Infinity)

  let king = false
  let queen = false
  let monarch = false
  return [...contestants]
    .sort((a, b) => (sortKey(a) === sortKey(b) ? 0 : sortKey(a) - sortKey(b)))
    .map(contestant => {
      const inTime = finishedInTime(contestant)
      const outOfTime = contestStartTime !== null && now - start >= durationMs
      let title: Title | null = null
      // The failure branch stays first: a contestant who gave up, or finished late, must
      // not consume a crown and leave the next real finisher a knight.
      if (contestant.disqualified || (contestant.finishedAt !== null && !inTime) || (contestant.finishedAt === null && outOfTime)) title = 'Hestemann'
      else if (inTime && contestant.gender === 'male' && !king) { title = 'Faxekonge'; king = true }
      else if (inTime && contestant.gender === 'female' && !queen) { title = 'Faxedronning'; queen = true }
      else if (inTime && contestant.gender === 'other' && !monarch) { title = 'Faxemonark'; monarch = true }
      else if (inTime) title = 'Faxeridder'
      const elapsed = contestant.finishedAt !== null ? contestant.finishedAt - start : Math.max(0, now - start)
      return { ...contestant, title, elapsed }
    })
}
