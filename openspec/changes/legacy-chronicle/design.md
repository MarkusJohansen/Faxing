## Decisions

### A checked-in fixture plus a seeder, not an importer in the interface

The record is four messages, read once. An import screen would be a permanent feature for a
one-time job, and it would have to carry a parser for prose. A JSON file next to a transcript
is reviewable in a pull request, diffable, and can be checked without a database.

The fixture encodes `time` as the record wrote it (`"1:16"`, `"0:56,66"`) rather than as
milliseconds, so a reviewer can compare it with the message line by line. The seeder does the
conversion once, and validation rejects anything that is not a minute-second time inside the
hour.

### `ON CONFLICT DO NOTHING`, not an upsert

The chronicle is a record, and the imported rows become the only copy of those Faxings. An
upsert would let a re-run clobber a Faxepave's correction (a misspelt name, a wrong place), and
the second run would look successful while doing it. Doing nothing on conflict is the safer
default: re-running is how you confirm the import is complete, not how you refresh it.

Ids are stable and derived from the event (`legacy-2026-09-18`) and from the contestant's
position in the record. That keeps a re-run honest for as long as the record's order is
unchanged; reordering a finished event is a deliberate act that deserves a new id.

### Titles are transcribed, not recomputed

The old Faxings were run under rules the application does not implement: the 15 April 2025
record has an `Erkekonge`, a `Kronprins` and a `Prins`, and the 10 September 2025 record names
no titles at all. Recomputing with today's `rankContestants()` would produce a tidy table that
contradicts the record — a crown for a contest whose message never mentions one, and no crown
for the Faxeting that founded the order.

So the fixture stores the title each record states, `close` keeps storing the titles the rules
produced, and the archive shows what was stored. `rankContestants()` is still the only function
that decides a title for a running contest, and it is not called for an imported event.

### No invented finish instants

The records give elapsed times, never a clock time. The archive displays durations, so
`finishedAt` stays empty for imported contestants and the view reads `elapsed`. Filling in
`event_date + elapsed` would put a fabricated instant into the one place where an instant is
supposed to be evidence, and the fabricated value would be indistinguishable from a recorded
one.

The consequence is that a single imported row has a title and a place but no duration at all:
William, the first `Kronprins`, whose time the poem does not give. `elapsed: null` is the
honest encoding, the table shows `Tid ukjent`, and the editor still treats him as finished
because his title is evidence that he finished.

### An order is frozen when the record has a gap

The table normally orders by duration. With a missing duration that ordering is undefined, and
any tie-break would present a guess as a place. The record's own order is the only ranking
available, so the view keeps it whenever a finisher has no duration. That also means the
kronprins stays second, where the record puts him, instead of sinking to the bottom of the
table.

### Gender is inferred, and no title depends on it

The old messages never state a gender. The fixture records the gender a reader would infer from
the name, because the archive's shape requires one; names that could be read either way are
filed as `other`. This is metadata only: every imported title is transcribed, so no imported
crown is decided by an inferred gender, and the inference is repeated in
`docs/legacy-faxinger.md` where the reader can disagree with it.
