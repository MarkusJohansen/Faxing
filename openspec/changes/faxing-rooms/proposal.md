## Why

A Faxing is run by one phone today: the operator types every name, taps every finish, and
the server only hears about it when the hour is saved. Nobody else in the room can see the
board or mark themselves done, an operator's dead battery loses the contest, and the
"official" flag is whatever the client sends — `POST /api/events` checks no login.

## What Changes

- **BREAKING** The single-device create flow (`Registration` + localStorage draft) is
  replaced by **rooms held on the server**. Any visitor can create a room; only a signed-in
  Faxepave can make it *official*.
- A room has a short code and a link. People **join themselves** from their own phone with a
  name and a gender, until the host starts the contest.
- The **host** (whoever created the room) starts the contest and administers it. Faxepave
  can administer any official room, so a host's lost phone does not orphan an official
  contest.
- A participant marks **themselves** finished, or gives up, from their own device.
- The host can **reset** a participant (misclick), mark someone **finished now**, **correct**
  a finish time, mark someone **Hestemann**, add someone without a phone, and remove
  somebody before the start.
- Every instant (start, finish) is stamped by the **server clock**, so phones with skewed
  clocks cannot reorder crowns. Clients poll the room every two seconds.
- Closing the room computes titles on the server and writes the result to the chronicle.
- `POST /api/events` now requires Faxepave (it was open to anyone, official flag included).

## Capabilities

### New Capabilities
- `faxing-rooms`: creating, joining, hosting and administering a shared contest room.

### Modified Capabilities
- `arena-board`: a recorded finish may now be altered, but only by the room's host or
  Faxepave, never by the participant's own controls.
- `session-persistence`: the contest is held by the server, not by one device.

## Impact

- New `api/rooms.ts` handler, two new tables (`faxing_rooms`, `faxing_room_members`) created
  by the existing idempotent migration in `server/index.ts`.
- `api/events.ts`: POST gated on Faxepave.
- `src/App.tsx`, new `src/components/RoomView.tsx`/`RoomLobby.tsx`, `src/lib/rooms.ts`;
  `Registration.tsx` and the localStorage draft are removed.
- `ranking.ts` is reused by the server at close; no new dependency.
- CLAUDE.md hard rule 3 (never clear a `finishedAt`) is narrowed to "only the host may".
