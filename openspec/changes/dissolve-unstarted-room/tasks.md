## 1. The server
- [x] 1.1 `close` in `api/rooms.ts`: host only, start or not; a never-started room sets `closed_at` and writes no event
- [x] 1.2 A started room still ranks, freezes and closes by `rankContestants()`

## 2. The interface
- [x] 2.1 `RoomLobby.tsx`: host "Steng Rommet" behind a two-tap confirmation
- [x] 2.2 `App.tsx`: a closed room with no `eventId` shows the closed screen and the way home

## 3. Documentation
- [x] 3.1 `ARCHITECTURE.md`: the state ladder, the action table, §5, and the line references the
      new `closeRoom()` shifted
- [x] 3.2 `CLAUDE.md`: the `rankContestants` call site is now `closeRoom`

## 4. Verification
- [x] 4.1 `npm run typecheck`, `npm run check:rules`, `npm run build`, `openspec validate` on the
      change and on the specs
- [x] 4.2 Drive the API: dissolve a room with no members and one with members; a member's close is
      refused; a dissolved room refuses a join; a started room still writes its chronicle
- [x] 4.3 Walk the lobby and the closed screen at phone (390 px) and desktop (1280 px) width

The checks in 4.2 and 4.3 were run by hand against a throwaway Postgres, with a temporary CDP
script; neither is committed, because `check:rules` covers `src/lib` only and nothing in this repo
spins up a browser or a database. The evidence is recorded in `design.md` and `findings.md`.
