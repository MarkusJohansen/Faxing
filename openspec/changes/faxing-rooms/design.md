## Context

The app already runs as a client plus a Node server on a Raspberry Pi (`server/index.ts`)
with Postgres and a Faxepave cookie login (`api/admin.ts`). The contest itself is still
held in one browser and posted to `api/events` when it is saved. The Pi runs the server at
0.3 CPU and 128 MB.

## Goals / Non-Goals

**Goals:** shared rooms, self-join, host administration, server-stamped instants, no new
dependency.

**Non-Goals:** accounts, push/WebSocket realtime, an audit log of host corrections,
joining after the start (the host adds latecomers), expiring abandoned rooms.

## Decisions

**Members are rows, not a JSON array.** `faxing_room_members` holds one row per
participant. Two people joining or finishing in the same second update different rows, so
neither write is lost. A jsonb array on the room would be read-modify-write and drop one.

**Bearer tokens, hashed at rest.** Create returns a random 32-byte host token, join
returns a participant token. The client keeps them in localStorage keyed by room code and
sends them as `x-faxing-token`. The server stores only the SHA-256 hash. No accounts: the
device that made the room is the host. Faxepave (existing cookie) is the recovery path for
official rooms.

**The server stamps every instant.** Start and self-finish use the server's `Date.now()`.
Each GET returns `serverNow`; the client keeps `offset = serverNow - Date.now()` and ticks
`now = Date.now() + offset`. Durations are still differences of absolute instants (rule 2).

**Polling, every 2 s.** One indexed query per poll. Twenty phones are ten requests a
second, well within the Pi. WebSocket would add a dependency and a connection to babysit
for a one-hour party. Alternative rejected.

**One handler, `/api/rooms`, with `action` in the body.** The server's router matches exact
paths; one handler keeps the auth checks in one place. Actions: `create`, `join`, `start`,
`finish`, `forfeit`, `reset`, `set-finished`, `set-time`, `disqualify`, `add`, `remove`,
`close`.

**Titles are computed on the server at close** with the existing pure `rankContestants`, so
no client can submit a title.

**Codes:** four characters from an alphabet without look-alikes (no 0/O/1/I/L), retried on
collision.

## Risks / Trade-offs

- [The host's device is the only key to an unofficial room] → the token survives reloads;
  a lost phone means the room can be read but not administered. Faxepave covers official
  rooms.
- [Host corrections leave no trace] → accepted for a party tool; noted as a non-goal.
- [A wrong code can be guessed] → codes are short by design so they can be read aloud; the
  worst a guesser can do is join with a name, which the host can remove.
- [Open rooms accumulate] → the home screen lists only rooms from the last 24 hours.

## Migration Plan

`CREATE TABLE IF NOT EXISTS` in the existing start-up migration. Rollback is redeploying
the previous image; the new tables are ignored.
