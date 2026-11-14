## MODIFIED Requirements

### Requirement: Finish and forfeit are reachable only for unresolved contestants

A card SHALL offer a finish control and a forfeit control while the contestant has neither
finished nor forfeited, and SHALL offer neither once they have. Both controls SHALL act on
the first press, without confirmation. These controls are offered only on the participant's
own card, on their own device.

The controls are unconfirmed because they are pressed in a crowd, at arm's length, and a
confirmation step is a second thing to hit; a mis-tap is recoverable by the host resetting
the participant (see [faxing-rooms](../faxing-rooms/spec.md)). The controls disappear once
the contestant is resolved so that a card cannot be pressed twice.

#### Scenario: An unresolved contestant

- **WHEN** a contestant is still drinking
- **THEN** their card offers both a finish and a forfeit control

#### Scenario: A resolved contestant

- **WHEN** a contestant has finished
- **THEN** their card offers neither control

#### Scenario: A finish is recorded once

- **WHEN** a finish is recorded for a contestant
- **THEN** the recorded finish instant is not subsequently altered, except by the room's host or Faxepave
