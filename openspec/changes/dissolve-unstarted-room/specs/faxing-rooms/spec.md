## MODIFIED Requirements

### Requirement: Closing a room writes it to the chronicle
The system SHALL let the host, or Faxepave for an official room, close a room whether or not the contest has started. Closing a started room SHALL compute titles on the server from the recorded facts and save them as a chronicle event with the room's title, official flag and start instant. Closing a room that never started SHALL instead dissolve it: the room is marked closed and no chronicle event is written, because no finish was ever recorded. A closed room SHALL accept no further changes.

(The header is unchanged from `openspec/changes/faxing-rooms`, where `close` was start-only; the
dissolved room is the exception to "writes it to the chronicle", and the reason is above.)

#### Scenario: The host closes the room
- **WHEN** the host closes a room after the hour
- **THEN** a chronicle event exists with every participant's derived title, and the room is closed

#### Scenario: The host closes before the hour is out
- **WHEN** the host closes a room at minute 30 while Per is still drinking
- **THEN** the chronicle files Per as Hestemann, as if the hour had expired

#### Scenario: The host closes a room that never started
- **WHEN** the host closes a room whose contest has not begun
- **THEN** the room is closed, no chronicle event is written, and the room is no longer listed among the rooms in progress

#### Scenario: A dissolved room is closed for everyone
- **WHEN** a device is in the lobby of a room that another device has dissolved
- **THEN** within three seconds it shows that the room is closed and offers the way back

#### Scenario: A dissolved room accepts nothing
- **WHEN** any device sends an action to a room closed before the start
- **THEN** the request is rejected
