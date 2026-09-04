# Arena Board

## Purpose

The live board is the tournament while it is happening: one screen, held by one operator,
walked around a room.

Its shape follows from that. Every design decision here answers the same question — can
somebody standing up, holding a phone, half a metre from a shouting contestant, find the
right card and hit the right control on the first attempt? The board is therefore
organised by *state* rather than by name or by enlistment order, because the operator
arrives at it already knowing which of three things has just happened.

The board renders the titles computed by [title-award](../title-award/spec.md) and reads
the hour from [contest-clock](../contest-clock/spec.md). It owns no rules of its own except
those governing what is displayed and which controls are reachable.

## Requirements

### Requirement: Contestants are grouped by state, in a fixed order

The board SHALL present contestants in three groups, in this order: those who have
finished, those still drinking, and those who have failed. A group with no members SHALL
be omitted entirely rather than displayed empty.

The order is fixed so that the operator builds muscle memory for where a given card lives.
An empty group is omitted because a heading with nothing under it reads, across a room, as
a card that failed to render.

#### Scenario: Three populated groups

- **WHEN** one contestant has finished, one is drinking and one has forfeited
- **THEN** all three groups are displayed in the stated order, each with its one card

#### Scenario: An empty group is absent

- **WHEN** no contestant has finished
- **THEN** no finishers group is displayed, not even as an empty heading

#### Scenario: A contestant appears exactly once

- **WHEN** the board is displayed
- **THEN** each contestant appears in exactly one group

### Requirement: Failure is the union of forfeit and expiry

The failed group SHALL contain every contestant who has forfeited, and — once the hour has
expired — every contestant who has not recorded a finish. While the hour is running, a
contestant who has not finished and has not forfeited SHALL appear in the drinking group.

#### Scenario: Expiry moves the stragglers

- **WHEN** the hour expires with two contestants still in the drinking group
- **THEN** the drinking group is empty and both appear in the failed group

### Requirement: A card carries identity, title, and outcome

Each card SHALL display the contestant's name and a gender mark. A card whose contestant
holds a title SHALL display that title with its emblem. A card whose contestant has
finished SHALL display their finishing time; a card whose contestant has forfeited SHALL
say so.

The gender mark is on the card because it is the input to the crown rules, so an operator
querying why a particular contestant took the crown can see the reason without leaving the
board.

#### Scenario: A crowned finisher

- **WHEN** a contestant holds `Faxekonge`
- **THEN** their card displays the name, the gender mark, the title with its emblem, and
  the finishing time

#### Scenario: A forfeit

- **WHEN** a contestant has forfeited
- **THEN** their card displays `Hestemann` and states that they did not finish, and
  displays no finishing time

### Requirement: A card is visually distinguished by its title

Cards SHALL be visually distinguished by which title they carry, with distinct treatments
for the two crowns, for a knighthood, for failure, and for a contestant still in progress.

#### Scenario: Treatments are distinct

- **WHEN** a `Faxekonge`, a `Faxedronning`, a `Faxeridder` and a `Hestemann` are displayed
- **THEN** each card is distinguishable from the others without reading its label

### Requirement: A contestant in progress shows progress against the hour

A card for a contestant still drinking SHALL display the contest's progress against the
hour, and SHALL mark that indication as urgent past four-fifths of the hour.

This indication is the **shared** contest clock repeated on the card, not a measurement of
that individual contestant. The system holds no per-contestant progress signal — a
contestant's litre is not instrumented, and the only fact recorded about them before they
finish is that they have not finished. The card shows the hour running down beside the
name it is running down for, which is what the operator needs; it must not be captioned or
styled so as to imply that it measures how much that person has drunk.

#### Scenario: Progress is shown while drinking

- **WHEN** a contestant is still drinking with thirty minutes elapsed
- **THEN** their card displays progress at half of the hour

#### Scenario: Progress is not shown once resolved

- **WHEN** a contestant has finished or failed
- **THEN** their card displays no progress indication

#### Scenario: Progress is identical across contestants

- **WHEN** two contestants are still drinking
- **THEN** both cards show the same progress, because the indication is the shared clock

### Requirement: Finish and forfeit are reachable only for unresolved contestants

A card SHALL offer a finish control and a forfeit control while the contestant has neither
finished nor forfeited, and SHALL offer neither once they have. Both controls SHALL act on
the first press, without confirmation.

The controls are unconfirmed because they are pressed in a crowd, at arm's length, and a
confirmation step is a second thing to hit; a mis-tap is recoverable by resetting or by
tolerating a wrong card, whereas a missed finish loses the finish instant that decides a
crown. The controls disappear once the contestant is resolved so that a card cannot be
pressed twice, which is also the guard against a recorded finish being overwritten.

#### Scenario: An unresolved contestant

- **WHEN** a contestant is still drinking
- **THEN** their card offers both a finish and a forfeit control

#### Scenario: A resolved contestant

- **WHEN** a contestant has finished
- **THEN** their card offers neither control

#### Scenario: A finish is recorded once

- **WHEN** a finish is recorded for a contestant
- **THEN** the recorded finish instant is not subsequently altered

### Requirement: A forfeit never discards a recorded finish

Recording a forfeit for a contestant who has already recorded a finish SHALL NOT clear
that finish instant.

The interface does not offer this transition, so the requirement guards a latent path
rather than a reachable one. It is stated because the finish instant is the sole evidence
behind a crown: a code path that clears it silently converts a `Faxekonge` into a
`Hestemann` with no trace, and the roster holds nothing from which the loss could be
detected afterwards.

#### Scenario: A forfeit applied to a finisher

- **WHEN** a forfeit is recorded for a contestant holding a finish instant
- **THEN** the finish instant is preserved

### Requirement: A search filter appears once the board is crowded

The board SHALL offer a name filter when five or more contestants are enlisted, and SHALL
NOT offer one below that.

The threshold exists because the filter costs a permanent strip of screen on a board that
is scrolled with a thumb, and below five cards the operator finds the name faster by
looking than by typing.

#### Scenario: A small tournament

- **WHEN** four contestants are enlisted
- **THEN** no filter is displayed

#### Scenario: A crowded tournament

- **WHEN** five contestants are enlisted
- **THEN** a filter is displayed

### Requirement: The filter matches any part of a name, ignoring case

The filter SHALL retain contestants whose name contains the query as a substring, compared
without regard to case, and SHALL ignore surrounding whitespace in the query. An empty
query SHALL retain every contestant.

Substring rather than prefix matching, because the operator is as likely to have been
given a surname as a first name.

#### Scenario: Substring match

- **WHEN** the query is `nde` and `Anders` is enlisted
- **THEN** `Anders` is retained

#### Scenario: Case is ignored

- **WHEN** the query is `ANDERS` and `Anders` is enlisted
- **THEN** `Anders` is retained

#### Scenario: An empty query filters nothing

- **WHEN** the query is empty or only whitespace
- **THEN** every contestant is retained

### Requirement: The filter reports what it is hiding, and can be cleared in one action

While a query is active the board SHALL report how many of the total contestants are being
shown, and SHALL offer a single control that clears the query.

A filtered board that does not say it is filtered is a board with contestants missing from
it, which the operator will read as data loss.

#### Scenario: The count is reported

- **WHEN** a query retains two of nine contestants
- **THEN** the board reports two of nine

#### Scenario: No matches

- **WHEN** a query retains no contestants
- **THEN** the board states that no warrior of that name is in the arena

#### Scenario: The query is cleared

- **WHEN** the clear control is pressed
- **THEN** the query is empty and every contestant is displayed again

### Requirement: Filtering hides cards without altering ranks or titles

The filter SHALL affect only which cards are displayed. Ranks and titles SHALL remain those
computed over the whole roster.

A rank that renumbered itself under a filter would report the second-place finisher as the
winner, which is the one number on the board that must never lie.

#### Scenario: Rank survives filtering

- **WHEN** a query retains only the second finisher
- **THEN** that card still displays rank two

### Requirement: Resetting the tournament is confirmed before it destroys anything

The board SHALL offer a reset that returns the interface to an empty roster, and SHALL
require an explicit confirmation before doing so. The confirmation SHALL state that
progress will be lost and SHALL offer an equally reachable way to decline.

Reset is the one irreversible action on the board — it discards the roster, the start
instant and every finish instant, and there is no undo and no record kept — which is
precisely why it is the one action that is confirmed. Contrast the finish and forfeit
controls above, which are not.

#### Scenario: Reset asks first

- **WHEN** the reset control is pressed
- **THEN** a confirmation stating that progress will be lost is displayed, offering both
  to proceed and to decline

#### Scenario: Reset is declined

- **WHEN** the confirmation is declined
- **THEN** the contest is unchanged and the board is displayed as before

#### Scenario: Reset is confirmed

- **WHEN** the confirmation is accepted
- **THEN** the roster is empty, no start instant is recorded, the interface shows the
  enlistment screen, and the persisted contest is discarded
