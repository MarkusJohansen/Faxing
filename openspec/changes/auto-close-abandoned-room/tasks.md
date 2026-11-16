## 1. The server
- [x] 1.1 `src/lib/contest.ts`: `ABANDONED_ROOM_MS` beside `CONTEST_DURATION_MS`
- [x] 1.2 `api/rooms.ts`: `abandoned()` — the two clock predicates, no interval literal in SQL
- [x] 1.3 `api/rooms.ts`: `reapAbandonedRooms()` — one locked transaction per room, `closeRoom()` reused, a failed close logged and rolled back
- [x] 1.4 `api/rooms.ts`: the `GET` branch sweeps at most once every 15 s, before the list and the snapshot

## 2. The check
- [x] 2.1 `src/lib/contest.demo.ts`: the abandonment horizon is longer than the hour, so the idle
      rule can never close a running contest
- [x] 2.2 `package.json`: `check:rules` runs the new demo

## 3. Documentation
- [x] 3.1 `ARCHITECTURE.md`: the room ladder, the close section, and the `api/rooms.ts` line
      references the new functions shift
- [x] 3.2 `CLAUDE.md`: the demo list in the commands section

## 4. Verification
- [x] 4.1 `npm run typecheck`, `npm run check:rules`, `npm run build`
- [x] 4.2 `openspec validate auto-close-abandoned-room --strict` and `openspec validate --specs --strict`
- [x] 4.3 Drive the API against a throwaway Postgres: a started room past its hour closes and files
      one pending event; a started room inside its hour survives a sweep; an unstarted room older
      than 24 h dissolves; an unstarted room with a fresh join survives; a second sweep writes no
      second event
- [ ] 4.4 Walk the closed screen a reaped room produces at phone (390 px) and desktop (1280 px) width
