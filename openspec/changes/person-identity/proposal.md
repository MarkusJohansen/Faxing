## Why

The chronicle keeps a name string per entry, and nothing says two entries are one person. The old
Faxings were written down by hand, some by first name only, so "Arne" and "Arne Hildrum" count as
two of the 132 registered names. Rewriting the short names to the full ones would erase what the
record said, so the link is stored beside the name instead.

## What Changes

- **A person key**: a chronicle entry may carry `personId`, the normalised full name of the person
  it is. Without one, the person is the normalised name, so a repeated name and a case typo
  (`Sivert vårum`) merge with no correction at all.
- **An alias record**: `scripts/history/people.json` maps a name as written to the full name it
  stands for. Only first-name-only entries and typos go in it; ambiguous ones stay out until a
  person decides.
- **A correction run, by hand**: `npm run link:people -- <server>` reads the chronicle and, with
  `--write`, files `personId` onto the matching entries through the Faxepave's `PUT /api/events`.
  It only sets `personId`; names, times and titles are never touched.

## Capabilities

### New Capabilities
- `chronicle-people`: deciding which chronicle entries are the same person.

## Impact

- `src/components/EventView.tsx`: renaming an entry drops its `personId`.
- New: `src/lib/people.ts`, `src/lib/people.demo.ts` (in `check:rules`),
  `scripts/history/people.json`, `scripts/link-people.ts`, `npm run link:people`.
- `src/types.ts`: optional `ArchivedContestant.personId`.
- No schema change (it lives in the existing jsonb), no server code, no new dependency, no new
  network target.
