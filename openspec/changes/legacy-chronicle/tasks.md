## 1. The record

- [x] 1.1 Transcribe the four original messages into `docs/legacy-faxinger.md`
- [x] 1.3 Add the 4 November 2025 Faxing from the organizer's table
- [ ] 1.4 Add that Faxing's original message, and confirm Sara's and Brage's times against it
- [x] 1.2 Encode the same results in `scripts/history/legacy-events.json`, names verbatim

## 2. The seeder

- [x] 2.1 `scripts/seed-history.ts`: read, parse `m:ss[,cc]`, validate the whole record first
- [x] 2.2 `--dry-run`: report the planned events without contacting a server
- [x] 2.3 Read the chronicle from the named server and report each event: there, held back, to file
- [x] 2.4 `--write`: log in as Faxepave and file the missing events through `POST /api/events`
- [x] 2.5 `npm run seed:history` in `package.json`
- [x] 2.6 Hold an event back while the chronicle has another event on the same day
- [x] 2.7 Store the date as noon UTC and reject a date that is not a real day

## 3. The archive

- [x] 3.1 `RecordedTitle` and `ArchivedContestant` in `src/types.ts`; `FaxingEvent.contestants` widened
- [x] 3.2 `EventView`: show a recorded legacy title beside the name, `Tid ukjent` for a missing duration
- [x] 3.3 `EventView`: keep the recorded order when a finisher's duration is missing
- [x] 3.4 The editor treats a titled contestant without a duration as finished

## 4. Verification

- [x] 4.1 `npm run typecheck`, `npm run check:rules`, `npm run build`
- [x] 4.2 `openspec validate legacy-chronicle --strict`
- [x] 4.3 `npm run seed:history -- --dry-run`
- [x] 4.4 File into `server.cjs` on a local Postgres and replay the filing cases
- [ ] 4.5 Walk the archive at phone and desktop width with the filed events
- [ ] 4.6 Run it against the Pi: first without `--write`, then with

4.4 was run against a throwaway Postgres behind the built server: a preview, a missing and a
wrong password, a write, a second run, a chronicle that already held a hand-entered event on
18 September 2026, and a deleted event across a server restart. 4.5 and 4.6 are open: nobody has
looked at the filed events in the interface, and nothing has been filed on the Pi.
