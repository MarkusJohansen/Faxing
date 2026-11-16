## ADDED Requirements

### Requirement: A recorded time is corrected from the row

The archive SHALL let the Faxepave write each participant's drinking time while the edit form is
open, as whole minutes and seconds, and SHALL store what is written. Both boxes empty SHALL record
that the record states no time, which the archive shows as `Tid ukjent`. Only a device holding the
Faxepave session SHALL be offered the boxes; a reader SHALL see the time as text.

#### Scenario: Correcting a time

- **WHEN** the Faxepave opens a filed Faxing, types a new time into a row, and presses «Lagre alle endringer»
- **THEN** the row shows the new time before saving and the chronicle holds it after

#### Scenario: A time with no seconds

- **WHEN** the Faxepave writes minutes and leaves the seconds box empty
- **THEN** the seconds count as zero and the row reads that many minutes

#### Scenario: Stating that the record has no time

- **WHEN** the Faxepave empties both boxes of a row that held a time and saves
- **THEN** the row reads `Tid ukjent`, and the stored duration is gone

#### Scenario: Something that is not a count

- **WHEN** a box holds a value that is not a whole non-negative number, or seconds of 60 or more
- **THEN** the row keeps the time it last held, and the boxes keep what was typed so it can be corrected

#### Scenario: A reader without the session

- **WHEN** a device without the Faxepave session opens the Faxing
- **THEN** every time is text and no box is offered

### Requirement: A corrected time crowns no one

A time written from the archive SHALL store that duration only. It SHALL NOT change any stored
title, because a filed Faxing's titles were decided when its room closed and are frozen with it.

#### Scenario: A crowned row gets a slower time

- **WHEN** the Faxepave writes a slower time for a participant stored as `Faxekonge`
- **THEN** the title is unchanged and the crown still stands in the row

#### Scenario: A worded title

- **WHEN** the Faxepave corrects the time of a row whose title is a word one (`Erkekonge`, `Kronprins`, `Prins`)
- **THEN** the word is unchanged
