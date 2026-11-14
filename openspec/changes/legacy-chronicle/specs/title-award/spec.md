## MODIFIED Requirements

### Requirement: Titles are derived from recorded facts, never stored

A title SHALL be computed from the contestant's finish instant, forfeit flag and gender,
together with the contest's start instant and the current time. No title SHALL be persisted
for a running contest.

The chronicle is the one exception, and it is a record rather than a source of truth: closing
a room freezes the titles that the rules produced at that moment, so a later rule change does
not rewrite history. An imported chronicle entry freezes the titles its own record states, even
when the current rules would award different ones, and those titles SHALL be shown as recorded.

#### Scenario: Titles recompute against the clock

- **WHEN** the hour expires while an unfinished contestant is displayed
- **THEN** that contestant is thereafter attributed `Hestemann` with no other action taken

#### Scenario: Titles survive a reload without being stored

- **WHEN** a contest with a recorded `Faxekonge` is reloaded
- **THEN** the same contestant is again attributed `Faxekonge`, recomputed from the stored
  finish instants

#### Scenario: A chronicle entry keeps the title it recorded

- **WHEN** an archived contest is opened long after it closed
- **THEN** each contestant is shown the title the chronicle stored, and no title is recomputed

#### Scenario: An imported title the rules no longer award

- **WHEN** an imported record names its winner `Erkekonge`
- **THEN** the archive shows `Erkekonge` for that contestant, and a running contest never
  produces that title
