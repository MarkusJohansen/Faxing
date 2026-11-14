## Why

The order's history is older than this application. Four Faxings are recorded only as chat
messages, so the chronicle — the one place a Faxing is documented — begins after them. The only
door into `faxing_events` is closing a room, which a Faxing held before rooms existed cannot do.

## What Changes

- **A checked-in record of the old Faxings**: `docs/legacy-faxinger.md` keeps the original
  messages, and `scripts/history/legacy-events.json` encodes the same results for the machine.
- **An additive seeder**: `npm run seed:history` validates the record and inserts the events
  that are not yet in the chronicle. An id already present is left alone, so re-running never
  undoes a Faxepave's correction.
- **Recorded titles**: a chronicle entry carries the titles its record states, including names
  the current rules no longer award (`Erkekonge`, `Kronprins`, `Prins`). Nothing is derived.
- **An unknown duration**: a finisher whose old record states no time is shown as `Tid ukjent`,
  not as `0:00` and not as a Hestemann.
- **A frozen order**: when a record has a gap, the table keeps the order the record was written
  in, because ranking around a missing time would be a guess.

## Capabilities

### New Capabilities
- `chronicle-import`: filing Faxings that predate the application into the chronicle from a
  checked-in record.

### Modified Capabilities
- `title-award`: a running contest still derives titles on every render, but a chronicle entry
  is allowed to store the titles recorded at the time, including names today's rules do not
  award. The current specification says titles are never stored, which the chronicle has always
  contradicted; this change makes the exception explicit.

## Impact

- New: `docs/legacy-faxinger.md`, `scripts/history/legacy-events.json`, `scripts/seed-history.mjs`,
  `npm run seed:history`.
- `src/types.ts`: `RecordedTitle`, `ArchivedContestant`; `FaxingEvent.contestants` becomes
  `ArchivedContestant[]`.
- `src/components/EventView.tsx`, `src/App.css`: recorded titles, `Tid ukjent`, recorded order.
- `src/lib/storage.ts`: the chronicle's contestant type widened to `ArchivedContestant`.
- Uses the existing `pg` dependency and `DATABASE_URL`. No new dependency, no new network
  target, no schema change: an imported event is a row written the way `close` writes one.
