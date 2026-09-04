# Contest Clock

## Purpose

One hour, shared by everybody, counted from a single instant.

The clock is the tournament's only real constraint — the rule that turns drinking a litre
into a contest — so it is specified separately from the board that displays it. Every
title in [title-award](../title-award/spec.md) is a function of this clock: who beat it,
who did not, and in what order.

The clock is derived, never accumulated. Nothing in the system holds a running total that
could be paused, resumed or stepped; there is one recorded start instant and one reading
of the current time, and every displayed duration is the difference. This is the property
that makes the clock honest across a page reload and across a laptop lid being closed.

## Requirements

### Requirement: The contest lasts one hour

The contest duration SHALL be one hour, expressed as a single named constant in the source
rather than as a literal at each point of use.

#### Scenario: The clock is read against the hour

- **WHEN** the board is displayed
- **THEN** the time remaining is one hour less the time elapsed since the start instant

### Requirement: Elapsed time is derived from an absolute start instant

Elapsed time SHALL be computed as the difference between the current wall-clock instant
and the recorded start instant. The system SHALL NOT maintain an accumulating counter of
elapsed time.

The consequence is deliberate and is the point of the design: the clock continues to run
while the page is closed, while the tab is in the background, and while the device is
asleep. An hour of wall-clock time is an hour of contest, regardless of whether anything
was watching. A counter incremented on a timer would silently stop in every one of those
cases and would report a contest as still open after it had expired.

#### Scenario: The clock survives a reload

- **WHEN** a contest has been running for twenty minutes and the page is reloaded
- **THEN** the board reports twenty minutes elapsed and forty minutes remaining

#### Scenario: The clock does not pause when unobserved

- **WHEN** a contest is left unattended past its hour and the page is reopened
- **THEN** the contest is reported as expired

### Requirement: The displayed clock advances at least twice per second

The interface SHALL re-read the current time on a fixed interval no slower than twice per
second while a contest is displayed, and SHALL release that interval when it is no longer
needed.

Twice per second is chosen so that the seconds digit never appears to skip a value, which
it does at a one-second interval as soon as the interval drifts against the second
boundary. A skipping clock reads as a broken clock in a room full of people watching it.

#### Scenario: Seconds advance without skipping

- **WHEN** a contest is under way
- **THEN** the displayed remaining time decrements through every second

#### Scenario: The interval is released

- **WHEN** the timer is removed from the interface
- **THEN** its interval is cleared

### Requirement: Remaining time is displayed, with elapsed time subordinate to it

The primary reading SHALL be the time remaining. The time elapsed SHALL also be displayed,
in a subordinate position.

Remaining time is the number the room is acting on. Elapsed time is shown because it is
the number a contestant's own finishing time will be measured in, so seeing both makes the
finishing figures on the cards legible.

Durations SHALL be formatted as `m:ss`, extended to `h:mm:ss` only while an hour or more
remains, so that the leading `1:` does not occupy the reading for the first second of the
contest and then vanish.

#### Scenario: Under an hour

- **WHEN** fifty-nine minutes and five seconds remain
- **THEN** the remaining time reads `59:05`

#### Scenario: At the hour

- **WHEN** the full hour remains
- **THEN** the remaining time reads `1:00:00`

#### Scenario: Elapsed time is shown alongside

- **WHEN** a contest is under way
- **THEN** the elapsed time is displayed in addition to the remaining time

### Requirement: Negative remaining time is never displayed

A remaining time computed as negative SHALL be treated as zero for display, and the
progress indication SHALL be clamped to complete.

#### Scenario: Past the hour

- **WHEN** the current time is past the contest's expiry
- **THEN** no negative duration and no over-full progress bar is displayed

### Requirement: The final five minutes are marked as urgent

The clock SHALL enter a visually distinct urgent state when fewer than five minutes
remain, and SHALL leave that state when the hour expires.

Urgency is a state of the clock rather than of a contestant, and it is the one moment in
the contest at which the interface is entitled to raise its voice. It ends at expiry
because the expired clock has its own, terminal treatment; a clock that was both urgent
and finished would be asking for action that is no longer possible.

#### Scenario: Urgency begins

- **WHEN** four minutes and fifty-nine seconds remain
- **THEN** the clock is displayed in its urgent state

#### Scenario: Urgency ends at expiry

- **WHEN** the hour has expired
- **THEN** the clock is displayed in its expired state and not in its urgent state

### Requirement: Expiry is a declared state, not merely a zero reading

On expiry the clock SHALL replace its numeric reading with a terminal declaration that the
contest has ended, and SHALL show its progress indication as complete.

The distinction matters because `00:00` is ambiguous between "about to expire" and
"expired", and expiry is the instant at which every unfinished contestant becomes a
`Hestemann`. The clock states the transition rather than leaving it to be inferred from a
row of zeroes.

#### Scenario: The contest ends

- **WHEN** the hour elapses
- **THEN** the clock declares the contest ended in place of its numeric reading
- **AND** its progress indication is complete

### Requirement: Progress against the hour is shown as a proportion

The clock SHALL display elapsed time as a proportion of the hour, clamped to the range
zero to complete, and SHALL carry the urgent and expired states in that indication as well
as in the numeric reading.

The proportion is shown because a bar is read across a room at a glance and a numeral is
not.

#### Scenario: Half the hour

- **WHEN** thirty minutes have elapsed
- **THEN** the progress indication is at half

#### Scenario: Progress does not exceed complete

- **WHEN** more than an hour has elapsed
- **THEN** the progress indication is at complete and no further
