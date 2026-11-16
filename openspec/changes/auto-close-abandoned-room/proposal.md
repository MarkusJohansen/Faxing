## Why

`close` needs the host's token, and the Faxepave is a host only on an official room
(`api/rooms.ts:60`). A room whose host raised it and walked away therefore cannot be closed by
anyone — not by the Faxepave, not by its members — and nothing in the system ever closes it on its
own. The 24-hour line in `listRooms` (`api/rooms.ts:86`) only hides the room from the front page:
the code still resolves, a lobby still takes joins, and every device in it polls a room that will
never begin or never end.

Nobody is coming back for it. The room should end itself.

## What Changes

- **A started room closes once its hour is out**, on the same path as the host's `close`: titles
  are derived from the recorded instants and the Faxing is filed as `pending` on the loft. No
  finish is lost and nothing is decided that the recorded instants do not already say.
- **A room that never began dissolves 24 hours after anyone last touched it**: `closed_at` only, no
  chronicle entry, exactly the branch `dissolve-unstarted-room` added for the host's own close.
- **A running contest is never auto-closed.** Silence is what a contest looks like; the sweep keys
  on the clock, never on how long ago the last request arrived.
- **The sweep runs on read**, inside `GET /api/rooms`, at most once every 15 seconds per process.
  No scheduler is added, and a device in an abandoned room is already polling the endpoint that
  reaps it.

## Capabilities

### Modified Capabilities
- `faxing-rooms`: a room ends without its host when its hour has run out, or when a lobby nobody
  touched for a day is deserted.

## Impact

- `api/rooms.ts`: `reapAbandonedRooms()` and `abandoned()`, called from the `GET` branch;
  `closeRoom()` is reused unchanged, so an automatic close and a host's close have one outcome.
- `src/lib/contest.ts`: `ABANDONED_ROOM_MS` beside `CONTEST_DURATION_MS`.
- `src/lib/contest.demo.ts` (new) and `package.json`'s `check:rules`: the assertion that the two
  thresholds cannot overlap.
- `ARCHITECTURE.md` §4–5 and the line references it carries.
- No schema change, no migration, no endpoint, no dependency, no new network target, no client
  change: a closed room already shows its closed screen (`src/App.tsx:70`).
- The branch is a permission-and-flow check, which `check:rules` does not reach; it is verified by
  driving the API and the interface (see `tasks.md`).
