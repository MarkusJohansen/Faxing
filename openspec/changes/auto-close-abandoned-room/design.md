# Design: a room left behind ends itself

## Context

`close` is host-only, and the Faxepave counts as host only on an official room
(`api/rooms.ts:60`). A room raised and abandoned therefore has no way out: the host token is gone,
the room is not official, and no process reaps it. `listRooms` (`api/rooms.ts:86`) hides rooms older
than a day from the front page, which makes the state worse rather than better — the room is
invisible where people look for it and still alive where they join it by code.

This change stacks on `dissolve-unstarted-room`, which is the reason an unstarted room can be ended
without a chronicle entry at all. Both are unarchived; the requirement this change adds belongs to
the `faxing-rooms` capability whose spec lives in `openspec/changes/faxing-rooms/specs/`.

## Decisions

**The clock, not the traffic, decides.** A running contest is the quietest thing in the app: for an
hour the only writes are finishes, and a room where everyone is drinking and nobody is tapping is
in perfect health. A sweep with an idle timeout shorter than the hour would therefore close live
contests, silently converting a running Faxing into a frozen one. So the sweep has two triggers,
both absolute instants:

| Room | Auto-close when |
| --- | --- |
| `started_at` set | `now - started_at >= CONTEST_DURATION_MS` |
| `started_at` null | `now - last activity >= ABANDONED_ROOM_MS` (24 h) |

The hour is `CONTEST_DURATION_MS`, already declared once in `src/lib/contest.ts`. The comparison
happens in TypeScript, from the room row read under the lock (`abandoned()`), so no SQL states an
hour at all: two declarations of the hour is exactly the drift this app cannot afford.

**The 24 hours are measured from the last join, not from creation.** A room raised on Wednesday for
a Friday party is not abandoned on Thursday, and people joining it is the only activity a lobby has.
`COALESCE(max(joined_at), created_at)` is that instant. The list keeps its own `created_at` horizon
and is unchanged: it is a different question (what to show) and its answer was already decided.

**The sweep reuses `closeRoom`, unchanged.** An automatic close must carry exactly the record a host
close would: ranked from the recorded instants, filed `pending` for the Faxepave. Reimplementing
that as `UPDATE ... SET closed_at = now()` would discard every finish in the room, which is the one
thing this app may not do. One function, one outcome, no second path to keep in step.

**A late close ranks as a late close.** `closeRoom` ranks at `max(now, started_at + hour)`. For a
room reaped two days after its hour, that `now` reaches `rankContestants` as the ranking instant and
inflates the stored `elapsed` of anyone still unfinished. It changes no title: a finished contestant's
`elapsed` comes from `finished_at`, and an unfinished one is a `Hestemann` either way, whose time is
never rendered (`src/components/EventView.tsx:182`). Clamping the ranking instant to the deadline was
rejected as a second, differently-ranking close path for a value nobody reads.

**The sweep runs on read, in the `GET` branch.** There is no scheduler anywhere: the only
`setInterval`s are the 500 ms clock and the 2 s poll, both in `src/`. A `setInterval` in
`server/index.ts` would not exist under `npm run dev`, and a cron would be a new process to deploy,
watch and forget. The `GET` branch is where an abandoned room's own phones already are — they poll
every two seconds — so the room they are stuck in is the room that gets reaped, on the next poll.
Two sweeps cannot race into two Faxings: each room is closed in its own transaction under
`FOR UPDATE`, with `closed_at` re-checked after the lock, which is the same serialisation every
action already uses.

**At most one sweep every 15 seconds, per process.** Without the guard each poll from each phone
runs an open-room scan — twenty phones at 10 req/s of pointless queries. The guard is one module
variable and is safe because the sweep is best effort: a skipped sweep delays a close to the next
window, and the close it would have done is idempotent.

**A failed sweep does not fail the read.** Each room's close is its own transaction; an error is
logged and rolled back, and the request that triggered the sweep returns normally. A device that did
nothing but poll must not receive a 500 because another room's close went wrong.

## Alternatives rejected

- **Let the Faxepave close any room.** A one-line change, and worth having, but it still requires a
  person to notice a ghost room and act. It is not what "automatically" means; it remains available
  as a separate decision.
- **Reap only when someone lists the rooms.** The home screen is the one place nobody in an
  abandoned room is looking. Their phones would keep polling a lobby forever.
- **Hide the room rather than close it.** Hiding is what the 24-hour list filter already does, and
  the room is still joinable and still open: the ghost moves rather than dies.
- **Delete the room.** Discards the member rows, so "what happened to that room" stops being
  answerable, and deletes a started contest's finishes outright.
- **An idle timeout of a few minutes for unstarted rooms.** A room raised before the party starts
  would dissolve while its host was still getting ready. The 24-hour horizon matches the one the
  list already uses.

## Verification

`npm run typecheck`, `npm run check:rules` (42 ok lines, the new one first), `npm run build`,
`openspec validate auto-close-abandoned-room --strict` and `openspec validate --specs --strict` all
pass.

The sweep was driven against a throwaway Postgres 17 (`postgres:17-alpine`) and the built
`server.cjs`, with rooms prepared through the API and backdated in SQL so the clocks could be moved
without waiting:

| Room | Prepared as | After one `GET /api/rooms` |
| --- | --- | --- |
| A | started 61 minutes ago, one finish recorded at minute 20 | `closed_at` set, one event filed `pending`, Brage **Faxekonge** at `elapsed: 1200000`, Sigrid (finished at minute 61) **Hestemann** |
| B | started 40 minutes ago, no finishes | still open, across two sweeps |
| C | lobby created 25 hours ago, last join 25 hours ago | `closed_at` set, `event_id` null: dissolved, no chronicle row |
| D | lobby created 25 hours ago, a join one minute ago | still open |

A second read, after the fifteen-second window, left the event count at one. The list answered with
only the open room, and the snapshots carried `closedAt` and `eventId` exactly as a closed room does,
so a polling phone is told on its next poll. The server log stayed empty.

The artifact under test was `server.cjs` with one transport line removed (`ssl`, because
`api/_db.ts` hard-codes it and the throwaway database did not speak TLS); it was rebuilt from source
afterwards, so nothing in the repository reflects that edit. What was *not* walked is the closed
screen itself at phone and desktop width: no browser automation was available in this session, so
that task stays unticked rather than claimed. The screens it lands on are the pre-existing ones
(`src/App.tsx:70` for dissolved, the event view for a filed Faxing) and no component changed.
