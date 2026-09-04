# Session Persistence

## Purpose

A tournament must survive the phone it is being run on.

The operator's device is locked, dropped, backgrounded by an incoming call, or handed to
somebody else who reloads the page out of curiosity. None of that is unusual over an hour
in a room full of people drinking, and all of it destroys a React state tree. Losing a
contest at minute fifty is unrecoverable: the finish instants that decide the crowns exist
nowhere else.

So the tournament is written to the browser's local storage on every change and restored
on load. This is deliberately the *whole* mechanism — there is no server, no account and no
network. The consequence is equally deliberate: a tournament lives on exactly one device,
and moving to another device is starting a new tournament.

## Requirements

### Requirement: The tournament is persisted under a single versioned key

The persisted tournament SHALL consist of the current screen, the roster and the contest's
start instant, written to browser local storage under one key that carries a schema
version.

Titles are absent from the persisted shape because they are derived
([title-award](../title-award/spec.md)); persisting them would create a second source of
truth that could disagree with the finish instants. The current screen is present because
a reload must return the operator to the board rather than to enlistment.

The key is versioned so that a future change to the persisted shape does not have to read
an older one. Bumping the version discards old tournaments, which is acceptable — a
tournament is an hour long — and is preferable to migration code for a structure this
small.

#### Scenario: The shape that is written

- **WHEN** the tournament changes
- **THEN** the screen, the roster and the start instant are written under the versioned key
- **AND** no title is written

### Requirement: A change to the tournament is persisted immediately

Every change to the roster, the current screen or the start instant SHALL be persisted at
once.

There is no debounce. The write is small and infrequent — it is driven by an operator's
finger, not by the clock — and the clock's twice-per-second tick is deliberately excluded
from what triggers it, since the tick derives from the start instant and holds no state
worth saving.

#### Scenario: A finish is persisted at once

- **WHEN** a finish is recorded for a contestant
- **THEN** the finish instant is present in storage before any further interaction

#### Scenario: The clock does not drive writes

- **WHEN** a contest is under way and nothing is interacted with
- **THEN** the clock's advance causes no write

### Requirement: A tournament in progress is restored on load

On load the interface SHALL restore the screen, roster and start instant from storage
before its first render, and SHALL fall back to an empty enlistment screen when there is
nothing stored.

Restoring before the first render rather than after it is what prevents the enlistment
screen appearing for one frame in front of a contest already under way.

Because the start instant is absolute and the clock is derived from it
([contest-clock](../contest-clock/spec.md)), a restored contest resumes at the correct
time rather than at the time it was interrupted.

#### Scenario: Mid-contest reload

- **WHEN** the page is reloaded twenty minutes into a contest
- **THEN** the board is displayed with the same roster, the same recorded finishes, and
  twenty minutes elapsed

#### Scenario: The enlistment screen is restored

- **WHEN** the page is reloaded with a roster assembled but no contest started
- **THEN** the enlistment screen is displayed with that roster

#### Scenario: A first visit

- **WHEN** the page is loaded with nothing stored
- **THEN** the enlistment screen is displayed with an empty roster

#### Scenario: No flash of the wrong screen

- **WHEN** a contest in progress is restored
- **THEN** the enlistment screen is not rendered at any point

### Requirement: Storage failure degrades to a working, unpersisted tournament

A failure to read, parse or write storage SHALL NOT propagate. A failed read SHALL be
treated as nothing stored; a failed write SHALL be ignored.

Local storage throws rather than returning an error in several ordinary situations — a
private browsing window, a quota that is full, a browser configured to block site data —
and in every one of them running the tournament without persistence is strictly better than
not running it. The operator is not told, because there is nothing they can do about it
mid-contest and the alternative is an alarm in the middle of a party.

#### Scenario: Unparseable stored value

- **WHEN** the stored value is not valid JSON
- **THEN** the interface loads as a first visit and does not raise

#### Scenario: Writes are refused

- **WHEN** storage refuses writes
- **THEN** the tournament runs normally for as long as the page is not reloaded

### Requirement: Resetting the tournament clears the persisted tournament

Confirming a reset SHALL remove the persisted tournament from storage, not merely clear the
in-memory state.

#### Scenario: Reset then reload

- **WHEN** a reset is confirmed and the page is reloaded
- **THEN** the enlistment screen is displayed with an empty roster

### Requirement: Persistence is per-device and per-browser profile, and nothing else

The tournament SHALL NOT be transmitted anywhere. The interface SHALL make no network
request beyond loading its own assets.

Two devices watching the same tournament is not a supported arrangement, and the
architecture makes it impossible rather than unreliable. One device is the operator's; the
board is walked around the room.

#### Scenario: No transmission

- **WHEN** a tournament is run
- **THEN** no contestant name or finish instant leaves the device

#### Scenario: A second device is a second tournament

- **WHEN** the page is opened on another device
- **THEN** an empty enlistment screen is displayed, unaffected by the first device's
  contest
