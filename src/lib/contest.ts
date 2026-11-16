/** The hour. Declared once: the client's clock and the server's checks must agree on it. */
export const CONTEST_DURATION_MS = 60 * 60 * 1000

/**
 * How long a room that never began may sit untouched before it dissolves itself. Deliberately
 * longer than the hour: a running contest is silent by nature, so the only idle horizon safe to
 * reap on is one no live contest can reach. `contest.demo.ts` holds that ordering.
 */
export const ABANDONED_ROOM_MS = 24 * 60 * 60 * 1000
