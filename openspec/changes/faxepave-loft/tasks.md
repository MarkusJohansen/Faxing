## 1. The record
- [x] 1.1 `faxing_events.status` (`pending` | `published` | `denied`, default `published`) in
      `server/api.ts:migrate`, added with `ADD COLUMN IF NOT EXISTS`
- [x] 1.2 `close` in `api/rooms.ts` files the entry as `pending`
- [x] 1.3 `api/events.ts`: list published only; `?status=` needs Faxepave; read one entry by id;
      `PATCH` decides; a denied entry answers 404 without a session

## 2. The client
- [x] 2.1 `EventStatus` and `FaxingEvent.status` in `src/types.ts`; `fromApiEvent` defaults a
      missing status to `published`
- [x] 2.2 `src/lib/storage.ts`: `loadEvents(status)`, `getEvent`, `setEventStatus`
- [x] 2.3 `src/App.tsx`: one `awaiting` list, the chronicle list filtered by the API, close
      fetches the filed entry, logout clears the queue

## 3. The screens
- [x] 3.1 `src/components/FaxepaveLoft.tsx`: what waits, what was refused, decide in one press,
      restore, delete with a confirmation, the old-Faxing form
- [x] 3.2 Nav offers the loft only with a session; History's "Føy til gammel Faxing" leads there
- [x] 3.3 `EventView` says a Faxing awaits the Faxepave, and offers approve/deny to a Faxepave
- [x] 3.4 `Arena`'s close confirmation says the outcome is sent to the Faxepave
- [x] 3.5 `src/App.css`: the loft's rows, the approval notices, tokens only

## 4. The record of decisions
- [x] 4.1 README, ARCHITECTURE (§4, §5, §6, §9) and CLAUDE.md rule 1 say what approval means
- [x] 4.2 `npm run typecheck`, `npm run check:rules`, `npm run build`,
      `openspec validate --specs --strict`, `openspec validate faxepave-loft --strict`
- [x] 4.3 Walk the API against a real Postgres: close files pending, the chronicle hides it, a
      non-Faxepave decision is refused, approve lists it, deny hides and keeps it
- [x] 4.4 Walk the loft, a results page and the close confirmation at phone and desktop width
      (done headlessly: DOM text, stacking and overflow measured at 390 px and 1280 px)
