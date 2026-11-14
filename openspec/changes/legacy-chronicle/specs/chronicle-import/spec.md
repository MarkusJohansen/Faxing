## ADDED Requirements

### Requirement: The old Faxings are kept as a checked-in record
The repository SHALL hold the old Faxings in two forms: `docs/legacy-faxinger.md` with the
original messages, and `scripts/history/legacy-events.json` with the same results encoded for
the seeder.

An encoded event SHALL carry a stable id, a title, a date, an `official` flag, and its
contestants in recorded order. A contestant SHALL carry the name as the record wrote it, a
gender, the title the record awards (or none), and the elapsed time the record states (or none).
Times SHALL keep the precision the record gives, including hundredths of a second.

A name SHALL be stored exactly as written, except where the organizer has since supplied the full
name of an entry the record gave only a surname. That full name SHALL be stored, and the message
in `docs/legacy-faxinger.md` SHALL keep the short form, so the correction can be seen against the
source.

#### Scenario: A nickname survives transcription
- **WHEN** the 10 September 2025 record lists "Sofie venninna til Eline" and "Halvis (kvartvar)"
- **THEN** the encoded event carries those names unchanged, in the order the record lists them

#### Scenario: A time with hundredths
- **WHEN** the record writes "0:56,66 Jennings"
- **THEN** the encoded contestant's duration is 56660 ms, and the archive still shows it as
  `0:56`

#### Scenario: A name the organizer completed
- **WHEN** the 10 September 2025 record lists "34:55 Ouren" and the organizer supplies
  "Magnus Ouren"
- **THEN** the encoded name is "Magnus Ouren", and the message in `docs/legacy-faxinger.md` still
  reads "Ouren"

#### Scenario: The record can be audited against its source
- **WHEN** a reader compares an encoded event with the message in `docs/legacy-faxinger.md`
- **THEN** every place, time and stated title can be found in that message, and every name either
  appears there or is a name the file records as completed by the organizer

### Requirement: Seeding is additive and repeatable
`npm run seed:history` SHALL validate the whole record before writing anything, then insert the
events whose id is not already in `faxing_events`. An event id that exists SHALL be left
untouched, so a second run changes nothing and a Faxepave's correction is never overwritten.

The command SHALL accept `--dry-run`, which validates and reports the planned rows without
connecting to a database. A record that fails validation SHALL stop the run with a message
naming the event and the contestant, and SHALL write no rows.

#### Scenario: First run
- **WHEN** `npm run seed:history` runs against a chronicle that has none of the four events
- **THEN** four rows are inserted and the command reports four inserted, none present

#### Scenario: Second run
- **WHEN** the same command runs again
- **THEN** no row changes, and the command reports zero inserted, four already present

#### Scenario: A malformed time
- **WHEN** an encoded time is `"1:75"`
- **THEN** the run stops before connecting, naming that event and contestant, and inserts nothing

#### Scenario: Previewing without a database
- **WHEN** `--dry-run` is passed and `DATABASE_URL` is unset
- **THEN** the command reports the planned rows and exits successfully

### Requirement: An imported title is transcribed, never derived
The seeder SHALL store the title the record states for each contestant and SHALL NOT call
`rankContestants()`. A record that names no titles SHALL leave every title empty rather than
invent one.

Chronicle titles SHALL therefore be allowed to include `Erkekonge`, `Kronprins` and `Prins`,
names the live rules do not award, and the archive SHALL show them as recorded. `Hestemann`
SHALL be stored with `disqualified` true, and an event's `official` flag SHALL be transcribed
with it.

#### Scenario: The first Faxeting
- **WHEN** the 15 April 2025 event is seeded
- **THEN** Scott Jennings is `Erkekonge`, William is `Kronprins`, Martin Rustad is `Prins`, and
  the remaining finishers carry no title

#### Scenario: A silent record
- **WHEN** the 10 September 2025 event, whose message names no titles, is seeded
- **THEN** none of its finishers carries a title, and the archive shows no crown for that event

#### Scenario: An unofficial Faxing
- **WHEN** the office event is seeded
- **THEN** its row has `official` false and the archive lists it as unofficial

#### Scenario: A re-run after a rule change
- **WHEN** the ranking rules change and the seeder runs again
- **THEN** no stored title changes, because no imported title was derived

### Requirement: A missing time is shown as unknown
A contestant with no recorded duration SHALL be displayed as `Tid ukjent` in the archive. The
absence SHALL NOT be rendered as `0:00`, SHALL NOT be rendered as `Hestemann`, and SHALL NOT be
treated as an unfinished contestant in the archive's editor.

#### Scenario: The kronprins without a time
- **WHEN** the 15 April 2025 event is opened
- **THEN** William's row shows `Tid ukjent`, his title `Kronprins`, and his recorded place

#### Scenario: A Hestemann is not an unknown time
- **WHEN** an event has both a Hestemann and a finisher with no time
- **THEN** only the Hestemann row reads `Hestemann`; the finisher reads `Tid ukjent`

### Requirement: A record with a gap keeps its recorded order
The archive SHALL order an event by duration when every finisher has one, and SHALL keep the
record's own order when any finisher's duration is missing. A gap cannot be re-ranked, and
re-sorting around it would report a guess as a place.

#### Scenario: A complete record
- **WHEN** the 18 September 2026 event, where every finisher has a time, is opened
- **THEN** the table runs from 1:16 to 59:30 with the Hestemenn after the finishers

#### Scenario: A record with a gap
- **WHEN** the 15 April 2025 event is opened
- **THEN** the table keeps the order Scott, William, Martin, Ådne, …, as the record wrote it

### Requirement: Importing adds no network target and no dependency
The seeder SHALL talk only to the database named by `DATABASE_URL` (or `POSTGRES_URL`) and SHALL
use the existing `pg` dependency. It SHALL NOT be imported from `src/`, and it SHALL NOT add a
runtime dependency, an external service, or a captured clock value.

#### Scenario: A machine with no database
- **WHEN** the seeder runs without `DATABASE_URL` and without `--dry-run`
- **THEN** it stops with a message naming the variable, and writes nothing
