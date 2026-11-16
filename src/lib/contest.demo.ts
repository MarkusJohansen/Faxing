/**
 * Runnable check of the two clock horizons a room is judged by. No framework:  npm run check:rules
 * The assertion names the silent failure it guards.
 */
import { ABANDONED_ROOM_MS, CONTEST_DURATION_MS } from './contest.ts'

// The idle rule only ever applies to a room that never started, but the two horizons are one edit
// apart in one small file. If abandonment ever fell inside the hour, a sweep keyed on silence could
// close a contest that is merely quiet — for an hour the only writes are finishes — and the frozen
// Faxing would lose every finish still to come.
if (ABANDONED_ROOM_MS <= CONTEST_DURATION_MS) {
  throw new Error(`a room abandoned for ${ABANDONED_ROOM_MS} ms would be reaped inside the ${CONTEST_DURATION_MS} ms hour`)
}
console.log('ok  the abandonment horizon lies beyond the hour')
