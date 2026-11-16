# Design: dissolve a room that never started

## Context

`close` was host-only *and* start-only (`requireStarted()`), so a room raised by mistake could
only be got rid of by starting a contest nobody wanted. The room list shows every room whose
`closed_at` is null, so an abandoned room sits in "Faxinger i gang nu" and invites people into a
lobby that will never begin.

The requirement this change modifies is written in `openspec/changes/faxing-rooms/specs/faxing-rooms/spec.md`
(a complete change that was never archived into `openspec/specs/`). Archive that change first, or
fold its delta into the tree, or this MODIFIED requirement has nothing to modify.

## Decisions

**Dissolve, not chronicle.** A chronicle entry is the record of a contest: who finished, when, and
what they earned. A room where nobody started has no finish to record, and an entry for it would be
a Faxing that never happened, permanently in the archive people browse as history. The room is
marked closed and nothing else is written.

**One verb, two outcomes, decided by `started_at`.** `close` keeps its name and its host check; the
branch is one `if` on a column the handler already reads under the row lock. A separate `dissolve`
action was rejected: the host's intent is the same (this room is over), and a client holding a stale
snapshot would call the wrong one.

**`closed_at` only, no `event_id`.** Every read path already treats `closed_at` as "closed" and
`event_id` as "chronicled": the list, the 409 in `act()`, and the redirect in `App.tsx`. So the
dissolve branch needs no schema change, no migration, and no new field. The room and member rows
stay; nothing is deleted, so "what happened to that room" is still answerable.

**The closed screen is the client's inference.** `closedAt != null && eventId === null` — because
the effect that follows `eventId` cannot fire when there is no event. The alternative (a
`dissolved` boolean from the server) would be a second field meaning what two existing fields
already say.

**A two-tap confirmation in the lobby, as in the arena.** Dissolving destroys no data but is
irreversible: no action clears `closed_at`. The lobby's confirm names the consequence ("ingen
Faxing skrives i krøniken") rather than asking a bare "are you sure".

## Alternatives rejected

- **Let the host start and close immediately.** Produces a chronicle entry where every member is a
  Hestemann — a fake contest in the archive, for a room where nobody drank.
- **Auto-close rooms after N hours.** Hides the room instead of letting its host end it, and would
  invent a close instant nobody chose.
- **Delete the room.** Loses the member rows and any evidence that the room existed.

## Verification

No automated test reaches the server's close branch (`check:rules` runs `src/lib/*.demo.ts` only),
so it was driven against a live server (`node server.cjs`) and a throwaway Postgres:

| Case | Result |
| --- | --- |
| Dissolve an empty room | `closedAt` set, `eventId` null, gone from `GET /api/rooms`, `join` → 409 |
| A member sends `close` | 403 |
| Dissolve a room with one member | `closedAt` set, `eventId` null, chronicle unchanged, member row kept |
| Close a started room | chronicle row written; the earlier finisher is Faxekonge, the one still drinking Hestemann |

Then walked in headless Chrome against the built `dist/` at 390 px and 1280 px: the host's lobby
shows "Begynn kampen" above "Steng Rommet" with no overlap and no horizontal overflow; the confirm
appears and "Fortsett" restores the button; confirming shows the closed screen ("Faxingen ble aldri
holdt … Intet ble skrevet i krøniken") with the way home, no lobby, and the room gone from the API
list. Measured, not eyeballed: this session could not view a screenshot.
