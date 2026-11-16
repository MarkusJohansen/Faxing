## Why

A room is raised before anyone is sure the evening happens, and a room that was raised by mistake,
or whose plan collapsed, cannot be got rid of. `close` requires a start (`api/rooms.ts`), so the
only way out is to start a contest nobody wants, and a room that is never closed sits in
"Faxinger i gang nu" for a day, inviting people into a lobby that will not begin.

Closing is the right verb for that exit; filing a chronicle entry is not. A room that never began
recorded no finish, and a Faxing where nobody drank is not history.

## What Changes

- **Close without a start**: the host, or Faxepave for an official room, may close a room in the
  lobby. It is marked closed and disappears from the list, the board and every other device.
- **No chronicle entry**: a room closed before the start writes no `faxing_events` row and freezes
  no attendees. The room rows stay in the database; nothing is deleted.
- **A closed lobby says so**: a device on a dissolved room shows that the room is closed and the
  way back, instead of a lobby whose every action would be refused.
- **A started room closes as before**: ranked from the recorded instants, frozen into the chronicle.

## Capabilities

### Modified Capabilities
- `faxing-rooms`: closing a room no longer requires a start, and a room that never started is
  dissolved rather than chronicled.

## Impact

- `api/rooms.ts`: `close` no longer calls `requireStarted()`; the unchronicled branch sets only
  `closed_at`.
- `src/components/RoomLobby.tsx`: host close with the same two-tap confirmation as the arena.
- `src/App.tsx`: a closed room without an `eventId` shows the closed screen.
- `ARCHITECTURE.md`: the action table and the close section.
- No schema change, no endpoint, no dependency, no new network target.
- The close branch is a permission-and-flow check, which `check:rules` does not reach; it is
  verified by driving the API and the interface (see tasks).
