# Title Award

## Purpose

Four titles, and the rules that decide who holds them.

This is the only capability in the system that encodes a judgement rather than a
mechanism, and it is the reason the application exists: the contest could be run with a
stopwatch and a napkin, but the napkin does not know that the first woman to finish is a
`Faxedronning` even if four men finished before her.

Titles are **derived, never stored**. The roster holds facts — a finish instant, a
forfeit flag, a gender — and the titles are recomputed from those facts on every render
against the current clock. Nothing writes a title anywhere. This is what makes the
awarding rules auditable: there is one function to read, and no possibility of a stored
title disagreeing with the facts that should have produced it.

## Requirements

### Requirement: There are exactly four titles

The system SHALL recognise exactly four titles, and no contestant SHALL hold more than
one:

| Title | Earned by |
|---|---|
| `Faxekonge` | The first male contestant to finish within the hour |
| `Faxedronning` | The first female contestant to finish within the hour |
| `Faxeridder` | Any other contestant who finishes within the hour |
| `Hestemann` | A contestant who forfeits, or who has not finished when the hour expires |

A contestant who has neither finished nor forfeited, while the hour is still running,
SHALL hold no title. Holding no title is a distinct state from holding `Hestemann`: it is
the state of a contest still in progress, and rendering it as failure would condemn every
contestant for the first fifty-nine minutes.

#### Scenario: A contestant in progress holds no title

- **WHEN** a contestant has not finished, has not forfeited, and the hour has not expired
- **THEN** that contestant holds no title

#### Scenario: A title is exclusive

- **WHEN** any contestant is displayed
- **THEN** at most one title is attributed to them

### Requirement: Titles are derived from recorded facts, never stored

A title SHALL be computed from the contestant's finish instant, forfeit flag and gender,
together with the contest's start instant and the current time. No title SHALL be
persisted.

#### Scenario: Titles recompute against the clock

- **WHEN** the hour expires while an unfinished contestant is displayed
- **THEN** that contestant is thereafter attributed `Hestemann` with no other action taken

#### Scenario: Titles survive a reload without being stored

- **WHEN** a contest with a recorded `Faxekonge` is reloaded
- **THEN** the same contestant is again attributed `Faxekonge`, recomputed from the stored
  finish instants

### Requirement: The crown goes to the first finisher of each gender, by finish instant

`Faxekonge` SHALL be awarded to the male contestant with the earliest finish instant, and
`Faxedronning` to the female contestant with the earliest finish instant. Each SHALL be
awarded at most once per contest.

Precedence is decided by comparing recorded finish instants, never by the order in which
an operator happened to tap the interface. The two are usually the same and occasionally
are not — an operator crossing a crowded room taps the nearer card first — and the
recorded instants are the evidence.

#### Scenario: First man and first woman

- **WHEN** a male contestant finishes first and a female contestant finishes second
- **THEN** the man is attributed `Faxekonge` and the woman `Faxedronning`

#### Scenario: Four men then a woman

- **WHEN** four male contestants finish and a female contestant finishes fifth
- **THEN** the first man is `Faxekonge`, the remaining three are `Faxeridder`, and the
  woman is `Faxedronning`

#### Scenario: A crown that is never awarded

- **WHEN** no female contestant finishes within the hour
- **THEN** no `Faxedronning` is attributed and the absence is not filled by a male
  contestant

#### Scenario: The crown is not re-awarded

- **WHEN** several male contestants have finished
- **THEN** exactly one of them is attributed `Faxekonge`

### Requirement: Every other finisher within the hour is a knight

A contestant who finishes within the hour and does not hold a crown SHALL be attributed
`Faxeridder`.

#### Scenario: A later finisher

- **WHEN** a male contestant finishes after another male contestant has taken the crown
- **THEN** that contestant is attributed `Faxeridder`

### Requirement: A forfeit is immediate and terminal

A contestant who forfeits SHALL be attributed `Hestemann` at once, regardless of the time
remaining, and SHALL NOT thereafter be eligible for any other title.

A forfeit is the contestant's own declaration, so it outranks the clock: there is no point
at which the interface should invite somebody who has given up to be marked as having
finished.

A forfeit SHALL NOT consume a crown. A crown is awarded to the first finisher of a gender,
and a contestant who forfeited did not finish.

#### Scenario: A forfeit before the hour is out

- **WHEN** a contestant forfeits with thirty minutes remaining
- **THEN** that contestant is attributed `Hestemann` immediately

#### Scenario: A forfeit does not block a crown

- **WHEN** the only male contestant to forfeit did so before any man had finished
- **THEN** the next man to finish is attributed `Faxekonge`

#### Scenario: A forfeit is not offered a finish

- **WHEN** a contestant has forfeited
- **THEN** the interface offers no means of recording a finish for them

### Requirement: Expiry converts every unfinished contestant to a horseman

On expiry of the hour, every contestant who has not recorded a finish SHALL be attributed
`Hestemann`.

#### Scenario: The hour runs out

- **WHEN** the hour expires with two contestants still drinking
- **THEN** both are attributed `Hestemann`

### Requirement: A finish recorded after expiry earns no title

A finish instant later than the contest's expiry SHALL NOT earn `Faxekonge`,
`Faxedronning` or `Faxeridder`. Such a contestant SHALL remain a `Hestemann`.

The rule the tournament states is *within the hour*, and an operator's tap is not a time
machine. This requirement is stated separately from the expiry rule above because the two
are easy to conflate in an implementation that derives failure from "unfinished and out of
time" — a formulation under which recording a finish late promotes a horseman to a knight.
That is the failure mode this requirement exists to name.

#### Scenario: A late tap

- **WHEN** an operator records a finish for a contestant sixty-one minutes after the start
- **THEN** that contestant is attributed `Hestemann` and no crown or knighthood

#### Scenario: A late tap cannot claim a vacant crown

- **WHEN** no man finished within the hour and a male contestant is marked finished after
  expiry
- **THEN** no `Faxekonge` is attributed

### Requirement: Finishers are ordered by finish instant, and rank is displayed

Finishers SHALL be ordered by ascending finish instant and SHALL be shown a rank
reflecting that order. Contestants who have not finished SHALL be shown no rank and SHALL
be ordered after every finisher, preserving their enlistment order among themselves.

Rank is presentation of the ordering, not a title. The second man to finish is ranked
below the first and is a `Faxeridder` either way; the rank tells him by how much he lost.

#### Scenario: Order follows finish instants

- **WHEN** three contestants have finished
- **THEN** they are displayed in ascending order of finish instant and ranked one, two,
  three

#### Scenario: Unfinished contestants carry no rank

- **WHEN** a contestant is still drinking
- **THEN** no rank is displayed for them

### Requirement: A finisher's own time is displayed to the second

A finisher SHALL be shown the interval between the contest's start instant and their
finish instant, formatted as `mm:ss`.

This figure is fixed at the moment of finishing and SHALL NOT continue to advance with the
clock. A finishing time that keeps counting is the defect this requirement guards.

#### Scenario: A finishing time is fixed

- **WHEN** a contestant finished at twelve minutes and four seconds and a further minute
  passes
- **THEN** their displayed time still reads `12:04`
