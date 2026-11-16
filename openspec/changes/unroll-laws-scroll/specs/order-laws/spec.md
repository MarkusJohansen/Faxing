## ADDED Requirements

### Requirement: The scroll is rolled open when the laws are shown

Each time the page is shown, the scroll SHALL begin rolled, its two rolls together, and SHALL be
rolled open: the foot roll SHALL travel down and uncover the writing from the head of the sheet
to its foot, and the seal SHALL travel with the foot roll. The writing SHALL stay where it is on
the sheet while it is uncovered, and the scroll SHALL come to rest exactly as the open scroll is
drawn. The sheet SHALL be fully open within two seconds, after which the seal MAY swing to rest.
The unrolling SHALL need no script, timer or stored state, SHALL NOT move anything else on the
screen, and SHALL NOT keep a visitor from the laws: all ten buds SHALL be in the page from
the first moment, so a reader who hears the page hears them at once.

#### Scenario: A visitor opens the laws

- **WHEN** a visitor presses "10 Bud" from another screen
- **THEN** the scroll is seen rolled, then opens downward until all ten buds, the colophon and
      the seal are shown as on the open scroll

#### Scenario: A visitor comes back to the laws

- **WHEN** a visitor leaves the page for another screen and opens it again
- **THEN** the scroll is rolled open again

#### Scenario: A visitor who has asked for less motion

- **WHEN** the device asks for reduced motion and the page is shown
- **THEN** the scroll is shown open at once, and nothing on it moves

#### Scenario: A reader who cannot see it

- **WHEN** the page is reached by a screen reader while the scroll is still opening
- **THEN** all ten buds are announced, in order
