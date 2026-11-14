## Decisions

### A checked-in fixture plus a seeder, not an importer in the interface

The record is five Faxings, read once. An import screen would be a permanent feature for a
one-time job, and it would have to carry a parser for prose. A JSON file next to a transcript
is reviewable in a pull request, diffable, and can be checked without a database.

The fixture encodes `time` as the record wrote it (`"1:16"`, `"0:56,66"`) rather than as
milliseconds, so a reviewer can compare it with the message line by line. The seeder does the
conversion once, and validation rejects anything that is not a minute-second time inside the
hour.

### Add only, never an upsert

The chronicle is a record, and the imported rows become the only copy of those Faxings. An
upsert would let a re-run clobber a Faxepave's correction (a misspelt name, a wrong place), and
the second run would look successful while doing it. So the seeder reads the chronicle first and
sends only the events whose id is missing: re-running is how you confirm the import is complete,
not how you refresh it. The server backs this up, because `faxing_events.id` is the primary key
and a second insert of an id is refused.

Ids are stable and derived from the event (`legacy-2026-09-18`) and from the contestant's
position in the record. That keeps a re-run honest for as long as the record's order is
unchanged; reordering a finished event is a deliberate act that deserves a new id.

### Filed through the API by hand, not by the server at start

The Pi's Postgres listens only inside its compose network, and the deploy key may only run
`pi-deploy faxing`, so no command can be run against the production database. But the database is
not the only way in: a Faxepave can already `POST /api/events`. The seeder logs in with the
Faxepave password and uses that, from any machine that can reach the site.

Filing from `migrate()` at every start was built first and removed. It needed the record bundled
into `server.cjs`, and because it re-ran unattended it needed a ledger table so that an event a
Faxepave deleted did not return at the next deploy. That is permanent machinery for five rows
written once, the same objection this design raises against an import screen. A command run once
needs neither, and the person running it sees what happened.

What is given up: a rebuilt database does not refill itself; the command is run again. And the
five requests are not one transaction, so a failure part-way leaves some events filed. That is
harmless, because the next run files only the ones still missing.

### An event is held back when its day is taken

The production chronicle is older than this record, so an old Faxing may already be in it,
entered by hand under a random id. A second entry for the same night would be a duplicate nobody
asked for, and comparing ids cannot see it. The seeder therefore holds an event back while the
chronicle has any other event on that calendar day in Norway, and names it, so a person decides
which of the two stays. A day is a blunt match, but two Faxings on one night have not happened,
and holding back loses nothing. The command writes only with `--write`, so the first run against
a server is always a look.

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

### Gender comes from the organizer, and no title depends on it

The old messages never state a gender, and a name does not settle one. Rather than read a gender
off a name, the fixture stores the one the organizer gave: Kvartvar (`Halvis (kvartvar)`, where
the parenthesis is his first name), Magnus Ouren, Sepanta Ganjei and Kirisan Premakanth are male,
and Sopika Visvalingam is female. This is metadata only: every imported title is transcribed, so
no imported crown is decided by a gender.

### One name is completed, not invented

The 10 September 2025 list gives "Ouren" by surname. The organizer supplied Magnus Ouren, so the
fixture stores the full name while the message in `docs/legacy-faxinger.md` keeps what was
posted. Every other name is the record's, nicknames and typos included; nothing else is
corrected.
