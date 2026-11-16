## ADDED Requirements

### Requirement: The ten buds stand in the canon's words

The page SHALL show all ten buds of Faxeordenen, numbered and in their order, in the wording of
the canon, its older spellings included, and SHALL NOT reword, correct, translate or leave one
out. The count SHALL be carried by an ordered list, so that what a reader hears matches what a
reader sees.

#### Scenario: A visitor opens the laws

- **WHEN** a visitor opens the page
- **THEN** ten numbered buds are shown, from I to X, in the order the canon gives them

#### Scenario: A bud whose spelling is older than the language

- **WHEN** a bud is shown, such as the third, whose "inntas" is not today's Norwegian
- **THEN** it is shown as the canon has it, and the page marks nowhere that it is a fault

### Requirement: The laws are written on a scroll

The page SHALL be drawn as a scroll of parchment: a sheet of paper wound around a roll at its
head and at its foot, with the order's arms at the head of the sheet, the ten buds below them,
and the Faxepave's seal hanging from the foot roll by its cords. It SHALL be the one screen in
the app that is paper rather than stone.

#### Scenario: The scroll's parts

- **WHEN** the page is shown at any width
- **THEN** the sheet is between its two rolls, the arms are above the title, and the seal hangs
      below the foot of the page rather than over the writing

#### Scenario: Nothing is cut off at the foot

- **WHEN** the page ends
- **THEN** there is room below the scroll for the whole seal, and no part of it is clipped

### Requirement: The arms and the seal are pixels of this palette

The order's arms and the Faxepave's seal SHALL be drawn as pixel art whose every colour is a
palette token, so that neither carries a colour of its own and a restyle of the tokens restyles
them. The art SHALL be committed as the ink grid it is drawn in, not as a picture file, and
SHALL be hidden from a screen reader with its meaning given in words beside it.

#### Scenario: Restyling the palette

- **WHEN** a token the art uses is given another value
- **THEN** both the arms and the seal change colour with it, and no style names a colour

#### Scenario: A reader who cannot see it

- **WHEN** the arms or the seal is reached by a screen reader
- **THEN** it is announced as the order's arms or as the Faxepave's seal, in words

### Requirement: Every visitor can reach the laws

The page SHALL be one screen of the app, offered from the navigation on every screen and to
every visitor, session or no session. It SHALL be static: it SHALL take nothing from the server,
from browser storage, or from any other device, and SHALL add no runtime dependency, because the
laws are already known to the client and a request could only fail.

#### Scenario: A guest's navigation

- **WHEN** a device with no Faxepave session and no room is on any screen
- **THEN** the navigation offers the laws, and pressing it shows them

#### Scenario: The laws with the server away

- **WHEN** the page is opened while the server does not answer
- **THEN** the laws, the arms and the seal are all shown, and nothing on the page reports a
      failure

### Requirement: The page fits a phone

The page SHALL fit a phone without sideways scrolling, keeping a page's margin around the sheet,
and the seal SHALL stay inside the width of the screen.

#### Scenario: At phone width

- **WHEN** the page is shown at a width of 360 pixels
- **THEN** no part of it is wider than the screen, the buds are legible, and the seal is whole
