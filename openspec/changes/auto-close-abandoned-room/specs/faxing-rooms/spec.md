## ADDED Requirements

### Requirement: A room left behind ends itself

The system SHALL close a room that nobody is coming back to, without a host action.

A room whose contest has started SHALL be closed once an hour has passed since its start instant,
on the same path as the host's `close`: titles derived from the recorded instants, the Faxing filed
as `pending`, the room marked closed. A room that never started SHALL be dissolved once 24 hours
have passed since the later of its creation and the last join: marked closed, with no chronicle
event and no titles.

A room whose hour is still running SHALL never be closed automatically, however long it has gone
without a request, because a contest in progress is silent by nature. An automatic close SHALL
carry the same record an equivalent host close would: it may not discard a recorded finish, and a
second attempt on a room already closed SHALL change nothing.

#### Scenario: A started room whose host never returned
- **WHEN** a started room has passed its hour with no host action
- **THEN** the next `GET` closes it: titles are derived from the recorded finishes, a chronicle
  event is filed as pending, and the room is marked closed

#### Scenario: A silent contest is left alone
- **WHEN** a started room is at minute 40 and has received no request for 30 minutes
- **THEN** the room stays open, because silence inside the hour is a normal contest

#### Scenario: A lobby nobody entered
- **WHEN** a room that never started was created 25 hours ago and no one has joined it
- **THEN** it is dissolved: marked closed, with no chronicle event

#### Scenario: A lobby someone just entered
- **WHEN** a room that never started was created 30 hours ago and a participant joined an hour ago
- **THEN** the room stays open, because a fresh join is not an abandoned room

#### Scenario: A recorded finish survives the reaping
- **WHEN** a room is closed automatically after its hour
- **THEN** every finish recorded during the hour is in the frozen event, and the participant who
  finished first holds the crown the equivalent host close would have given them

#### Scenario: Reaping twice writes one Faxing
- **WHEN** two requests trigger the sweep at the same moment, or a host closes a room the sweep has
  already closed
- **THEN** exactly one chronicle event exists for the room and the second close changes nothing

#### Scenario: Devices in a reaped room learn about it
- **WHEN** a room is closed automatically while phones are polling it
- **THEN** each phone shows the room as closed on its next poll and offers the way back home
