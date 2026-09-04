# Contestant Roster

## Purpose

The roster is the tournament before it starts: the set of warriors (*Krigere*) who have
been enlisted, and the gate that decides whether a contest may begin at all.

It exists as a capability separate from the live board because enlistment is the only
phase in which the set of contestants may change. Once the hour begins, the roster is
frozen — a contestant cannot be added to a contest already under way, because their
elapsed time would be measured from a start they did not share, and every title in
[title-award](../title-award/spec.md) is decided by comparing finish times against one
common start.

## Requirements

### Requirement: A contestant is a name and a gender

A contestant SHALL be identified by a display name and a gender of exactly `male` or
`female`. Both SHALL be captured at enlistment and SHALL NOT be editable afterwards.

Gender is not decorative metadata. `Faxekonge` and `Faxedronning` are awarded per gender,
so the field is the input to a titling rule rather than a demographic record. The binary
domain is a consequence of there being exactly two such titles.

Each contestant SHALL carry an identifier that is unique within the tournament and stable
across a page reload, so that the board's per-contestant actions address the same
contestant after the roster has been restored from storage.

#### Scenario: A contestant is enlisted

- **WHEN** an operator submits a name with a gender selected
- **THEN** a contestant with that name, that gender, no finish time and no forfeit is
  appended to the roster
- **AND** the contestant receives an identifier unique within the tournament

#### Scenario: The name field is cleared for the next entry

- **WHEN** a contestant is successfully enlisted
- **THEN** the name field is empty and ready for the next warrior
- **AND** the gender selection is left as it was, because a queue of people is commonly
  enlisted in runs of the same gender

### Requirement: A name is trimmed and must not be empty

Surrounding whitespace SHALL be removed from a submitted name before it is stored or
compared. A name that is empty after trimming SHALL be refused, and the operator SHALL be
told so in the interface's own voice rather than by silent inaction.

#### Scenario: Whitespace-only name

- **WHEN** an operator submits a name consisting only of spaces
- **THEN** no contestant is enlisted
- **AND** a message stating that a name is required is displayed

#### Scenario: Padded name is stored trimmed

- **WHEN** an operator submits a name with leading or trailing spaces
- **THEN** the contestant is enlisted under the trimmed name

### Requirement: Names are unique, compared case-insensitively

A name that already belongs to an enlisted contestant SHALL be refused, comparing the
trimmed candidate against existing names without regard to case. The operator SHALL be
told that the warrior is already in the arena.

The comparison ignores case because the roster is read aloud and typed in haste by
somebody standing up. Two rows reading `Anders` and `anders` are one person's name entered
twice far more often than they are two people, and the board's per-contestant actions
become a guessing game the moment a name appears twice.

#### Scenario: Exact duplicate

- **WHEN** an operator submits a name identical to an enlisted contestant's
- **THEN** no contestant is enlisted and a duplicate message is displayed

#### Scenario: Duplicate differing only in case

- **WHEN** an operator submits `ANDERS` and `Anders` is already enlisted
- **THEN** no contestant is enlisted and a duplicate message is displayed

#### Scenario: Two genuinely different people sharing a first name

- **WHEN** two people of the same first name are to be enlisted
- **THEN** the second must be distinguished in the name itself, as the roster holds no
  other field by which two contestants could be told apart

### Requirement: A name has a bounded length

The name input SHALL cap entry at 30 characters.

The bound is a layout constraint, not a domain one: a contestant's name is rendered on a
card in display type, and an unbounded name breaks the card rather than the tournament.

#### Scenario: Entry stops at the cap

- **WHEN** an operator types beyond 30 characters into the name field
- **THEN** no further characters are accepted

### Requirement: A validation message clears as soon as it is acted on

A displayed validation message SHALL be cleared when the operator next edits the name
field, and on the next successful enlistment.

A message that outlives the problem it describes trains the operator to ignore messages.

#### Scenario: Editing clears the message

- **WHEN** a duplicate-name message is displayed and the operator types in the name field
- **THEN** the message is no longer displayed

### Requirement: A contestant may be struck from the roster before the contest begins

The interface SHALL offer removal of any enlisted contestant while the roster is being
assembled. Removal SHALL take effect without confirmation.

Removal is unconfirmed deliberately: before the hour starts nothing has been earned, so
the cost of an accidental strike is re-typing a name, which is cheaper than a confirmation
step paid on every correction. Compare [arena-board](../arena-board/spec.md), where
resetting a contest in progress destroys results and is therefore confirmed.

#### Scenario: A contestant is struck

- **WHEN** an operator removes an enlisted contestant
- **THEN** that contestant is no longer on the roster
- **AND** the displayed roster count decreases by one

### Requirement: The roster count is displayed while it is non-empty

The interface SHALL display the number of enlisted contestants whenever at least one is
enlisted, and SHALL display no roster section when none are.

#### Scenario: Count tracks the roster

- **WHEN** three contestants are enlisted
- **THEN** the roster section reports three

#### Scenario: An empty roster shows no section

- **WHEN** no contestants are enlisted
- **THEN** no roster listing is displayed

### Requirement: A contest cannot begin with an empty roster

Starting a contest SHALL be refused while the roster is empty. The control SHALL be
visibly disabled rather than merely inert, and the interface SHALL state that at least one
warrior must be enlisted.

A contest with no contestants would start a clock that can never produce a title, and the
only exit would be the reset path.

#### Scenario: Start is refused when empty

- **WHEN** the roster is empty
- **THEN** the start control is disabled and a hint naming the requirement is displayed

#### Scenario: Start is permitted with one contestant

- **WHEN** exactly one contestant is enlisted
- **THEN** the start control is enabled

### Requirement: Starting a contest fixes the start instant and opens the board

Starting a contest SHALL record the current wall-clock instant as the contest's start and
SHALL move the interface to the live board.

The instant is recorded once, as an absolute time, and never recomputed. Every duration in
the system — the hour remaining, a contestant's finishing time, whether the hour has
expired — is derived by subtracting it from the current time, which is what allows
[session-persistence](../session-persistence/spec.md) to restore a contest mid-flight
without the clock having drifted or paused.

#### Scenario: The contest begins

- **WHEN** an operator starts a contest with a non-empty roster
- **THEN** the start instant is recorded and the live board is displayed

#### Scenario: The roster is frozen once the contest begins

- **WHEN** a contest is under way
- **THEN** the interface offers no means of enlisting or striking a contestant
