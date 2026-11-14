## ADDED Requirements

### Requirement: Anyone can create a room; only Faxepave can make it official
The system SHALL let any visitor create a room with a title, and SHALL reject creating an official room unless the request carries a valid Faxepave session.

The creator becomes the room's host and receives a host token that only their device holds.

#### Scenario: A guest creates a room
- **WHEN** a visitor without a Faxepave session creates a room titled "Fredagsfaxing"
- **THEN** a room exists with a short join code, `official` false, and that visitor as host

#### Scenario: A guest asks for an official room
- **WHEN** a visitor without a Faxepave session creates a room with `official` true
- **THEN** the request is rejected and no room is created

#### Scenario: Faxepave creates an official room
- **WHEN** a signed-in Faxepave creates a room with `official` true
- **THEN** the room is official and the Faxepave is its host

### Requirement: People join a room themselves before it starts
The system SHALL let anyone holding the room code join with a name and a gender while the room has not started, and SHALL reject a join after the start.

Names are trimmed, 1–30 characters, and unique within the room ignoring case. A device that joined receives a participant token tied to that one participant.

#### Scenario: Joining an open room
- **WHEN** a visitor enters code "KQ7M", the name "Ola" and gender male
- **THEN** Ola appears on the room's roster and the visitor's device is bound to Ola

#### Scenario: A taken name
- **WHEN** "ola" tries to join a room where "Ola" already is
- **THEN** the join is rejected with a message in the interface's register

#### Scenario: Joining after the start
- **WHEN** a visitor tries to join a room whose contest has begun
- **THEN** the join is rejected; only the host can still add somebody

### Requirement: Only the host can start the contest
The system SHALL start a room's contest only on a request from its host, or from Faxepave for an official room, and only when the roster is non-empty. The start instant SHALL be the server's clock.

#### Scenario: The host starts
- **WHEN** the host starts a room with three participants
- **THEN** the room's start instant is set from the server clock and every device's board shows the hour running

#### Scenario: A participant tries to start
- **WHEN** a participant who is not the host sends a start request
- **THEN** the request is rejected and the room stays unstarted

### Requirement: A participant marks only themselves
The system SHALL let a participant's device record a finish or a forfeit for that participant only, at the server's clock, and only while the hour is running and the participant is unresolved.

#### Scenario: Marking oneself finished
- **WHEN** Ola's device sends "finished" at minute 12
- **THEN** Ola's finish instant is the server's clock at receipt

#### Scenario: Marking somebody else
- **WHEN** Ola's device sends "finished" for Kari
- **THEN** the request is rejected and Kari is unchanged

#### Scenario: Marking after the hour
- **WHEN** Ola's device sends "finished" after the hour has expired
- **THEN** no finish is recorded

#### Scenario: A second tap
- **WHEN** Ola has a finish recorded and his device sends "finished" again
- **THEN** the recorded finish instant is unchanged

### Requirement: The host administers participants
The system SHALL let the host of a room, or Faxepave for an official room, perform these actions on any participant: reset (clear finish and forfeit), mark finished now, set a finish time as an elapsed duration within the hour, mark as Hestemann, add a participant, and remove a participant before the start. No other caller SHALL perform them.

These are the only paths by which a recorded finish can change. Titles still derive from the recorded facts on every render; a correction re-awards crowns by itself.

#### Scenario: Undoing a misclick
- **WHEN** Per tapped finished by mistake and the host resets Per
- **THEN** Per has no finish and no forfeit, and his device offers the finish control again

#### Scenario: Correcting a time
- **WHEN** the host sets Kari's time to 9:30
- **THEN** Kari's finish instant is the start instant plus 9 minutes 30 seconds, and the crowns re-derive from it

#### Scenario: A time outside the hour
- **WHEN** the host sets a time of 61:00
- **THEN** the request is rejected

#### Scenario: Marking a Hestemann
- **WHEN** the host marks Per as Hestemann
- **THEN** Per is forfeited and holds no finish

#### Scenario: A participant tries a host action
- **WHEN** a participant's device sends a reset for somebody
- **THEN** the request is rejected

### Requirement: Every device shows the same board
The system SHALL let any device holding the room code read the room's roster, start instant and the server's current time, and the client SHALL refresh it at least every three seconds while the room is open.

The client derives elapsed time from the server's start instant and its own clock corrected by the offset to the server's clock, so a phone with a wrong clock shows the same remaining time as everyone else.

#### Scenario: A finish appears elsewhere
- **WHEN** Ola marks himself finished
- **THEN** within three seconds every other device viewing the room shows Ola in the hall

### Requirement: Closing a room writes it to the chronicle
The system SHALL let the host, or Faxepave for an official room, close a started room. Closing SHALL compute titles on the server from the recorded facts and save them as a chronicle event with the room's title, official flag and start instant. A closed room SHALL accept no further changes.

#### Scenario: The host closes the room
- **WHEN** the host closes a room after the hour
- **THEN** a chronicle event exists with every participant's derived title, and the room is closed

#### Scenario: The host closes before the hour is out
- **WHEN** the host closes a room at minute 30 while Per is still drinking
- **THEN** the chronicle files Per as Hestemann, as if the hour had expired

### Requirement: The host token survives a reload
The client SHALL keep each room's host or participant token in the browser so that reopening the room's link on the same device restores the same role.

#### Scenario: The host reloads
- **WHEN** the host reloads the page at minute 40
- **THEN** the room reopens with the host controls and the clock at minute 40

### Requirement: Saving a chronicle event requires Faxepave
The system SHALL reject a direct `POST /api/events` without a valid Faxepave session. Contests reach the chronicle by closing a room.

#### Scenario: An anonymous direct save
- **WHEN** a request without a Faxepave session posts an official event
- **THEN** it is rejected with 401

### Requirement: The home screen explains how to host a Faxing
The home screen SHALL offer a guide, folded by default, that walks through hosting a room in order: raising it, gathering participants by code or link, starting, self-marking, the host's corrections, and closing. It SHALL warn that the host role lives on the device that raised the room.

#### Scenario: A first-time host
- **WHEN** a visitor unfolds "Slik holdes en Faxing" on the home screen
- **THEN** they see the six steps in order and the warning to keep the hosting phone
