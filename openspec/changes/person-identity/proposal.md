## Why

The chronicle keeps a name string per entry, and nothing says two entries are one person. The old
Faxings were written down by hand, some by first name only, so "Tora" and "Tora Prøvesen" count as
two of the 132 names on the home screen. A person who came three times also counts three times.

## What Changes

- **A person key**: the person an entry is, is its name trimmed and lower-cased, after an alias
  record has had its say. A repeated name or a case typo merges with no correction at all.
- **An alias record, as data**: `src/data/people.json` maps a name as the old records wrote it (a
  first name only, a typo, an older spelling) to the full name it stands for. Only names with one
  candidate, typos and confirmed cases go in it; ambiguous ones stay out until a person decides.
  No source file names a person: the code reads the data file, and the checks use made-up names.
- **Read, never written back**: the record is applied when the chronicle is read. No `PUT` rewrites
  an event, so a recorded finish can never be touched by it, and the live data needs no migration.
- **The home count is people**, not entries.
- **A results page shows the full name**, with the spelling the record wrote beside it
  ("skrevet «Tora»"); the stored name is unchanged.

## Capabilities

### New Capabilities
- `chronicle-people`: deciding which chronicle entries are the same person.

## Impact

- New: `src/lib/people.ts`, `src/lib/people.demo.ts` (in `check:rules`), `src/data/people.json`.
- `src/components/EventView.tsx` shows the full name; `src/App.tsx` counts people;
  `tsconfig.app.json` allows importing JSON.
- No schema change, no server code, no new dependency, no new network target.
