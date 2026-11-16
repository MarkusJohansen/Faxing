## ADDED Requirements

### Requirement: Only official Faxinger fill the succession

The system SHALL build the succession from the Faxinger in the chronicle that are marked
official. Unofficial Faxinger SHALL NOT contribute a reign, however recent they are.

The system SHALL read each holder's recorded title and SHALL NOT re-derive a crown. A
recorded `Faxekonge` or the old record's `Erkekonge` SHALL fill the king's line; a recorded
`Faxedronning` SHALL fill the queen's line; a recorded `Faxemonark` SHALL fill the monarch's
line. `Kronprins`, `Prins`, `Faxeridder`, `Hestemann` and a contestant with no recorded title
SHALL NOT fill any line.

#### Scenario: An unofficial Faxing crowns nobody in the lines

- **WHEN** a chronicle holds an unofficial Faxing that recorded a `Faxekonge` and an official Faxing that recorded none
- **THEN** the king's line holds no reign, and the unofficial Faxing is not shown

#### Scenario: The old record's king fills the king's line

- **WHEN** an official Faxing records a contestant as `Erkekonge`
- **THEN** that contestant is a reign in the king's line, and the node names the title `Erkekonge`

#### Scenario: A knight is not a crown

- **WHEN** an official Faxing records `Faxeridder` and `Hestemann` titles
- **THEN** neither contestant appears in any line

#### Scenario: The recorded title is shown as recorded

- **WHEN** Faxepave edits a closed Faxing so that a different contestant holds `Faxedronning`
- **THEN** the queen's line shows the contestant the chronicle now records, with no re-derivation

### Requirement: Each crown has its own line, in a fixed order

The system SHALL order the reign lines king, queen, monarch. The king's line and the queen's
line SHALL always be shown, and a line with no crowned holder SHALL state that no holder of
that crown has been crowned yet. The monarch's line SHALL be hidden while it holds no reign,
and SHALL appear, in its place in the order, once the chronicle records a `Faxemonark`.

#### Scenario: The king's and queen's lines show even when empty

- **WHEN** the succession screen is open and no official Faxing has crowned a queen
- **THEN** the queen's line is shown, and states that no queen has been crowned yet

#### Scenario: The monarch's line waits for a monarch

- **WHEN** the succession screen is open and the chronicle records no `Faxemonark` at any official Faxing
- **THEN** no monarch's line is shown, and the king's and queen's lines are shown as usual

#### Scenario: The monarch's line appears with the first monarch

- **WHEN** an official Faxing records a `Faxemonark`
- **THEN** the monarch's line is shown, after the queen's line, with that reign in it

### Requirement: Every crowned holder is one reign

The system SHALL render one node per crowned holder per Faxing. A holder crowned at two
Faxinger SHALL appear as two nodes, in succession order. When one Faxing records two holders
of the same crown, both SHALL appear, in the record's contestant order.

#### Scenario: A repeat winner appears twice

- **WHEN** the same person holds `Faxekonge` at an earlier and a later official Faxing
- **THEN** the king's line shows two nodes for that person, oldest first

#### Scenario: Two holders at one Faxing are both shown

- **WHEN** one official Faxing records two contestants as `Faxekonge`
- **THEN** the king's line shows a node for each, in the order the record lists them

### Requirement: Reigns are ordered oldest first, and a tie follows the chronicle

The system SHALL order each line's reigns by the Faxing's date, oldest first. When two
official Faxinger share a date, the Faxing the chronicle lists first SHALL be treated as the
later reign, matching the tiebreak that decides which Faxing reigns.

#### Scenario: The oldest reign is first

- **WHEN** official Faxinger dated March and July crowned kings
- **THEN** the March reign appears above the July reign

#### Scenario: A tie on date follows the reigning tiebreak

- **WHEN** two official Faxinger share the latest date and the chronicle lists one of them first
- **THEN** the first-listed Faxing's reign is the later node, and it holds the reigning mark

### Requirement: A reign names the Faxing, the date, the holder and the time

The system SHALL show, for each reign, the Faxing's name, its date, the holder's name and the
holder's finishing time as minutes and seconds (`m:ss`). A record that states no duration
SHALL read `Tid ukjent` rather than an empty time or `0:00`.

#### Scenario: A reign shows when and how fast

- **WHEN** Ola won `Faxekonge` at «Sommerfaxing» on 12 July, finishing 14 minutes 32 seconds after the start
- **THEN** his node names «Sommerfaxing», 12 July, Ola and `14:32`

#### Scenario: A record without a duration

- **WHEN** an official Faxing's record states a crown but no time
- **THEN** the node shows `Tid ukjent` for the time

### Requirement: The latest official Faxing's holders are marked as reigning

The system SHALL mark a reign as reigning only when its Faxing is the latest official Faxing
in the chronicle, ties resolved by the reigning tiebreak. If that Faxing crowned no holder of
a line's crown, no reign in that line SHALL be marked, and no earlier reign SHALL be marked
in its place.

#### Scenario: The latest crown is marked

- **WHEN** the latest official Faxing records a king and an earlier one records another
- **THEN** only the latest king's node is marked `Regjerende`

#### Scenario: A contested crown is not marked

- **WHEN** the latest official Faxing crowned a queen but no king
- **THEN** the queen's latest node is marked, and no king's node is marked

#### Scenario: An unofficial Faxing never holds the mark

- **WHEN** the latest Faxing is unofficial and an earlier one is official
- **THEN** the most recent official Faxing's holders keep the mark

### Requirement: The succession is its own screen

The system SHALL offer the succession as its own screen, reachable from the main nav. Each
reign SHALL open the Faxing it belongs to. When no official Faxing has crowned anyone, the
screen SHALL show an empty state instead of three empty lines.

#### Scenario: A reign opens its Faxing

- **WHEN** a reign's node is pressed
- **THEN** the Faxing that crowned that holder is shown

#### Scenario: No official Faxing yet

- **WHEN** the chronicle holds no official Faxing
- **THEN** the screen says the succession is empty yet, and shows no lines

### Requirement: The founding of den andre orden is marked

Each shown line SHALL draw a dashed rule where the first order ended and den andre began: on
10 October 2024, the day Konsilet på A4 founded the order, shown in the archive's date form.
The rule SHALL be drawn only in a line that holds a reign from before the founding, because a
divider with nothing above it separates nothing. It SHALL stand before the first reign dated on
or after the founding, and after the line's last reign when the new order has not reached that
crown. A founding crowns nobody, so it is no chronicle row: the rule SHALL NOT require an event.

#### Scenario: The line crosses at the founding

- **WHEN** the king's line holds a reign from 2022 and one from 2025
- **THEN** the dashed rule stands between them, labelled `Den andre orden stiftes` with
  10 October 2024

#### Scenario: A line that begins with the new order

- **WHEN** a line's every reign is dated after the founding
- **THEN** that line draws no rule

#### Scenario: A line the new order has not reached

- **WHEN** a line holds only reigns dated before the founding
- **THEN** the rule closes the line, after its last reign

#### Scenario: A reign on the founding day

- **WHEN** a Faxing is filed at the noon of 10 October 2024, the instant the archive files a
  day on
- **THEN** its reign stands below the rule, not above it
