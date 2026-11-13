## ADDED Requirements

### Requirement: Colour is a night palette with semantic roles
The interface SHALL draw every colour from a fixed token set declared once in
`src/index.css`, in which green-black to moon-green tones carry structure and text,
lantern orange carries light (flames), glory and the primary action, and blood red
carries failure.

Warmth is scarce on purpose: if orange decorates, it stops meaning "a crown" at a glance
across a room.

#### Scenario: A component rule names no colour of its own
- **WHEN** `src/App.css` and the components are searched for hex, `rgb()` or `hsl()` literals
- **THEN** none is found outside the token block in `src/index.css`

#### Scenario: Orange is reserved
- **WHEN** the board shows a crowned card, a knight's card and a card in progress
- **THEN** only the crowned card, primary actions and candle flames carry lantern orange

### Requirement: Surfaces are rendered as pixel art
Panels, cards, controls and illustrations SHALL be rendered with hard edges: no rounded
corners, no blurred shadows and no smooth gradients; corners are stepped, shadows are
solid offsets, and shading is banded or dithered.

#### Scenario: No soft edges
- **WHEN** `src/App.css` is searched
- **THEN** it contains no non-zero `border-radius` and no `box-shadow` with a blur radius

#### Scenario: Illustration stays crisp when scaled
- **WHEN** the night scene is displayed at any viewport width
- **THEN** its pixels have hard edges, with no interpolation between them

### Requirement: A night scene heads the interface
The header SHALL present a pixel-art night scene (a moon, gothic spires, a bridge and lit
lanterns) with the wordmark `Faxing` set into it, and the scene SHALL be decorative: hidden
from assistive technology and never the only carrier of information.

#### Scenario: The scene is decorative
- **WHEN** the header is read by a screen reader
- **THEN** the wordmark and navigation are announced and the scene is not

#### Scenario: The scene fits a phone
- **WHEN** the viewport is 360 CSS pixels wide
- **THEN** the scene, wordmark and navigation are fully visible without horizontal scrolling

### Requirement: Type has three faces, each with one job
The interface SHALL set the wordmark and headings in a pixel blackletter, body text and
controls in a pixel sans, and every numeral (clock, times, ranks, counts) in a monospaced
terminal face, with no body text or name set in blackletter.

Names are typed by people at a party and read at arm's length; blackletter is for words
already known.

#### Scenario: A contestant's name is legible
- **WHEN** a contestant card is displayed
- **THEN** the name is set in the pixel sans, not the blackletter

#### Scenario: Danish letters render
- **WHEN** a heading or name contains `æ`, `ø` or `å`
- **THEN** the letter renders in the same face as its neighbours, not a fallback

### Requirement: Each title has its own treatment
Cards SHALL be told apart by shape and tone as well as label: the crowns lit lantern-warm,
a knight in moon-pale steel, a contestant in progress in plain stone with a burning candle,
and a `Hestemann` as a headstone in dulled red.

#### Scenario: Failure reads without colour
- **WHEN** a `Hestemann` card is shown beside a knight's card in greyscale
- **THEN** the headstone outline still distinguishes it

#### Scenario: The two crowns differ
- **WHEN** a `Faxekonge` and a `Faxedronning` are shown
- **THEN** their cards differ from each other as well as from a knight's

### Requirement: Progress on a card reads as time, not drink
The progress indication on a card in progress SHALL be drawn as a candle burning down
through the hour, and SHALL NOT be drawn as a vessel filling or emptying.

#### Scenario: The candle shortens
- **WHEN** thirty minutes have elapsed
- **THEN** the candle on every card in progress is at half its full length

### Requirement: The clock stays in sight and declares its state
The contest clock SHALL remain visible at the top of the board while the board scrolls,
and SHALL have three distinguishable states: running in moon-green, urgent in lantern
orange, and expired in blood red.

#### Scenario: The clock follows the operator
- **WHEN** the operator scrolls to the last card on a crowded board
- **THEN** the remaining time is still on screen

#### Scenario: Urgency is not conveyed by motion alone
- **WHEN** fewer than five minutes remain and reduced motion is requested
- **THEN** the clock is still distinguishable as urgent by its colour

### Requirement: Motion is ornamental and can be switched off
Animation SHALL be limited to lantern flicker and the urgent clock's pulse, and SHALL stop
entirely when the user requests reduced motion.

#### Scenario: Reduced motion
- **WHEN** `prefers-reduced-motion: reduce` is set
- **THEN** no element animates

### Requirement: Text meets a readability floor
Body text and control labels SHALL meet a contrast ratio of at least 4.5:1 against their
surface, and controls SHALL be at least 44 CSS pixels tall on a phone.

The operator is walking round a dim room with a phone; atmosphere that costs a mis-tap
costs a title.

#### Scenario: Contrast is measured
- **WHEN** each text token is paired with each surface token it is used on
- **THEN** the ratio is at least 4.5:1, and the measurements are recorded in `findings.md`

#### Scenario: Finish is tappable
- **WHEN** a card in progress is shown at 360 CSS pixels wide
- **THEN** its finish and forfeit controls are each at least 44 CSS pixels tall
