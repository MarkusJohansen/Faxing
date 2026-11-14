## 1. The record

- [x] 1.1 Transcribe the four original messages into `docs/legacy-faxinger.md`
- [x] 1.2 Encode the same results in `scripts/history/legacy-events.json`, names verbatim

## 2. The seeder

- [x] 2.1 `scripts/seed-history.mjs`: read, parse `m:ss[,cc]`, validate the whole record first
- [x] 2.2 `--dry-run`: report the planned events without a database
- [x] 2.3 Insert with `ON CONFLICT (id) DO NOTHING`, report inserted and already present
- [x] 2.4 `npm run seed:history` in `package.json`

## 3. The archive

- [x] 3.1 `RecordedTitle` and `ArchivedContestant` in `src/types.ts`; `FaxingEvent.contestants` widened
- [x] 3.2 `EventView`: show a recorded legacy title beside the name, `Tid ukjent` for a missing duration
- [x] 3.3 `EventView`: keep the recorded order when a finisher's duration is missing
- [x] 3.4 The editor treats a titled contestant without a duration as finished

## 4. Verification

- [x] 4.1 `npm run typecheck`, `npm run check:rules`, `npm run build`
- [x] 4.2 `openspec validate legacy-chronicle --strict`
- [x] 4.3 `npm run seed:history -- --dry-run`
- [ ] 4.4 Seed a local Postgres once, then walk the archive at phone and desktop width

4.4 is open because this checkout has no Postgres: the record was validated and rendered from
the fixture, but the insert itself has never run against a database.
