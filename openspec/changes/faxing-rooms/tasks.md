## 1. Server

- [x] 1.1 Add `faxing_rooms` and `faxing_room_members` to the start-up migration
- [x] 1.2 Extract the Faxepave session check into one shared helper used by events and rooms
- [x] 1.3 Gate `POST /api/events` on Faxepave
- [x] 1.4 Implement `api/rooms.ts`: list, read, create, join, start, finish, forfeit
- [x] 1.5 Implement host actions: reset, set-finished, set-time, disqualify, add, remove, close
- [x] 1.6 Route `/api/rooms` in `server/index.ts`

## 2. Client

- [x] 2.1 `src/lib/rooms.ts`: API calls and token storage per room code
- [x] 2.2 Home: list open rooms, join by code, create a room (official toggle for Faxepave)
- [x] 2.3 Lobby: roster, self-join form, host add/remove, host start
- [x] 2.4 Running board: clock from server offset; own card gets finish/forfeit; host gets reset, finish now, set time, Hestemann
- [x] 2.5 Host closes the room; client opens the chronicle event
- [x] 2.6 Remove `Registration.tsx` and the localStorage draft; open `?rom=CODE` links

## 3. Verification

- [x] 3.1 `npm run typecheck`, `npm run build`, `npm run check:rules`
- [x] 3.2 Drive the API against a local Postgres: create, join two, start, self-finish, foreign-finish rejected, reset, set-time, close
- [x] 3.3 Walk the interface: lobby, running board as host and as participant, closed — at phone and desktop width
- [x] 3.4 Update CLAUDE.md rules 3 and 8 to match
