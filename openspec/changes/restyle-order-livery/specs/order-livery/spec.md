## ADDED Requirements

### Requirement: The palette is a fixed, semantic token set

Every colour in the interface SHALL resolve to a declared token. No colour literal SHALL
appear outside the token declaration.

The set SHALL be organised in five bands, and each band SHALL carry one meaning:

| Band | Meaning |
|---|---|
| Void — near-black through charcoal and stone | Grounds, deep panels, inactive states |
| Bone and parchment | Primary text, neutral information, the material of a document |
| Iron and slate — oxidised metal through cold blue-gray | Structure, borders, secondary and archival information |
| Faxe red and blood | Alarm, urgency, hostility, selection, ceremonial emphasis |
| Brass | Rank, hierarchy, rarity, reward |

Laurel — a dark forest green — SHALL carry confirmation, safety and progression.

The two reds are the can's own: the band red it wears, and a darker blood used for grounds
beneath it. This is the whole of the borrowed identity. No brewery mark, wordmark, byline,
founding date or product photograph SHALL appear.

A saturated hue outside these bands SHALL NOT be introduced. Discipline is the aesthetic:
the interface has four outcomes to communicate and a colour that means nothing spends the
contrast the four real signals need.

#### Scenario: Every colour is a token

- **WHEN** the stylesheets are inspected
- **THEN** every colour value resolves to a token declared in the token block
- **AND** no hex, `rgb()` or named colour appears in a component rule

#### Scenario: Red is reserved

- **WHEN** the interface is inspected
- **THEN** the red band appears only on alarm, urgency, failure, selection and ceremonial
  emphasis
- **AND** it does not appear on ordinary borders, ordinary text, or an idle control

#### Scenario: Brass is reserved

- **WHEN** the interface is inspected
- **THEN** the brass band appears only on rank, the crowns, and rare-state ornament

#### Scenario: The screen stays dark

- **WHEN** any screen is displayed
- **THEN** the majority of its area is drawn from the void band

### Requirement: The brewery livery is withdrawn

The brewery livery SHALL be removed: the warm brown ground, the polished gold ramp, the
diamond tile pattern, and the byline naming the brewery, its founding year and its country.

The interface represents a fictional order that venerates the drink. It does not represent
the company that makes it, and dressing it in that company's colours and founding date
states a relationship that does not exist.

#### Scenario: The byline is gone

- **WHEN** the header is displayed
- **THEN** no brewery name, founding year or country of origin appears

#### Scenario: The brown ground is gone

- **WHEN** any screen is displayed
- **THEN** the ground is drawn from the void band and carries no warm brown radial wash

### Requirement: Typography is four families with one role each

The interface SHALL use exactly four type families, each assigned one role:

| Role | Used for |
|---|---|
| Pixel blackletter | The wordmark and the motto, and nothing else |
| Roman inscription capitals | Latin plaques and ceremonial labels |
| CRT terminal monospace | Every numeral — clock, finishing time, rank, count, percentage — and every metadata stamp |
| Serif prose | All Danish body text, descriptions, hints and validation messages |

Blackletter SHALL NOT be used for any run of text longer than the motto. Inscription
capitals SHALL NOT be used for prose. Numerals SHALL NOT be set in the prose or blackletter
faces.

Numerals get their own monospaced face because they change twice a second: a proportional
figure re-flows the line it sits in on every tick, and a clock whose width breathes is read
as a clock that is malfunctioning.

The font budget SHALL NOT grow. Two families currently loaded — a decorative display face
and a second decorative serif — are dropped in exchange for the blackletter and the
terminal face.

#### Scenario: Each family is confined to its role

- **WHEN** the stylesheets are inspected
- **THEN** each of the four families is used only for the role assigned to it

#### Scenario: Prose is legible

- **WHEN** a Danish paragraph, hint or validation message is displayed
- **THEN** it is set in the serif prose face, not in blackletter or inscription capitals

#### Scenario: Numerals do not re-flow

- **WHEN** the clock advances through a change of digit
- **THEN** the surrounding layout does not shift

#### Scenario: The budget is unchanged

- **WHEN** the font request is inspected
- **THEN** it names four families

### Requirement: Latin plaques name regions; Danish says the words

Each region of the interface SHALL be titled by a Latin inscription plaque set in
capitals. The existing Danish heading SHALL be retained beneath or beside it.

The plaques SHALL be:

| Region | Plaque |
|---|---|
| Enlistment | `REGISTRUM` |
| The clock | `VIGILIA` |
| Contestants still drinking | `ARENA` |
| Contestants who have finished | `CHRONICA` |
| Contestants who have failed | `HESTEMANN` |

`HESTEMANN` is left in Danish deliberately. It is the tournament's own word, it is the
punchline, and a Latin translation of it would be the change taking itself seriously.

No Danish string other than the two ceremonial labels defined in this specification —
the motto and the chant — SHALL be replaced by Latin. Validation messages, hints, button
labels, descriptions and the moderation notice remain as they are.

A plaque SHALL be rendered as an engraved title bar: a framed strip, letter-spaced
capitals, a thin ornamental rule, and a small heraldic mark at each end.

#### Scenario: A region carries both

- **WHEN** the finishers group is displayed
- **THEN** the plaque reads `CHRONICA` and the existing Danish heading is still present

#### Scenario: Prose is untouched

- **WHEN** a validation message or description is displayed
- **THEN** it is the same Danish string as before this change

#### Scenario: Plaques appear only on regions

- **WHEN** the interface is inspected
- **THEN** inscription capitals appear on region titles and ceremonial labels, and not as
  a body or control typeface

### Requirement: The order's sigil is hand-authored pixel art in three sizes

The order's coat of arms SHALL be rendered as pixel art in three separately authored
sizes, and SHALL depict: two rampant lions as supporters in brass, two crossed swords
behind the shield in iron, red acanthus mantling, a bone shield charged with the litre can
in black with a red band, and a parchment scroll beneath.

| Asset | Grid | Contents | Used for |
|---|---|---|---|
| Achievement | 64 × 72 | The full arms including supporters, swords, mantling and scroll | The header |
| Badge | 32 × 32 | Shield and can only, within a plain border | Crown cards, the acclamation |
| Mark | 16 × 16 | A shield silhouette bearing the can's red band | Plaque ends, the favicon |

Each size SHALL be drawn for that size. A smaller size SHALL NOT be produced by scaling a
larger one down. Pixel art loses its silhouette when resampled, and a lion rendered at 8
pixels tall by an algorithm is a smudge; at 8 pixels tall by hand it is a shape.

Assets SHALL be authored as SVG on the declared integer grid with `shape-rendering:
crispEdges`, so that a single file is crisp at every rendered size without a raster
pipeline, a build step or a dependency.

The palette of each asset SHALL be drawn from the interface's own tokens and SHALL NOT
exceed twelve colours.

The depiction SHALL be original. It SHALL NOT reproduce a real brewery's trade dress,
label artwork, or any existing historical or contemporary insignia.

#### Scenario: Three assets exist

- **WHEN** the assets are inspected
- **THEN** three files exist on the declared grids, each authored for its own size

#### Scenario: Pixels stay square

- **WHEN** the achievement is rendered at any size
- **THEN** its edges are hard and no pixel is interpolated

#### Scenario: The palette is bounded

- **WHEN** an asset is inspected
- **THEN** it uses at most twelve colours and every one resolves to an interface token

#### Scenario: The charge is legible at the smallest size

- **WHEN** the 16 × 16 mark is displayed
- **THEN** a shield silhouette carrying a red band is recognisable

### Requirement: The motto stands beneath the wordmark

`IN FAXE VERITAS` SHALL be displayed beneath the wordmark, set in pixel blackletter on a
parchment scroll, in the position the brewery byline occupied.

It SHALL be presented as the order's standing motto — always visible, never animated, never
a notification. A motto that moves is a slogan.

#### Scenario: The motto is displayed

- **WHEN** any screen is displayed
- **THEN** `IN FAXE VERITAS` appears beneath the wordmark in blackletter on a scroll

#### Scenario: The motto is still

- **WHEN** the interface is observed over time
- **THEN** the motto does not animate, pulse or cycle

### Requirement: The chant opens the contest and acclaims a crown

`GLORIA FAXEM!` SHALL be the label on the control that starts the contest, and SHALL be
displayed as an acclamation when a crown is awarded.

The chant is the order's cry, so it belongs on the two moments that are ceremonies rather
than operations: the hour beginning, and a crown being taken. It SHALL NOT appear on any
other control, heading or state.

As the start control it SHALL be the most emphatic element on the enlistment screen — a
wax-sealed plate in blood ground with brass edging — and SHALL carry the disabled
treatment defined for controls when the roster is empty. Making the chant the start control
replaces the existing Danish start label; this is one of the two ceremonial substitutions
this change is permitted.

As an acclamation it SHALL stamp across the board when a contestant is first attributed
`Faxekonge` or `Faxedronning`, carry the badge sigil, and withdraw of its own accord. It
SHALL NOT block a control, cover a card's finish or forfeit control, or require dismissal —
the operator's hands are busy and the next contestant may finish during it.

The acclamation SHALL be raised once per crown. Because titles are derived and recomputed
on every tick, a naive implementation raises it twice a second for the rest of the hour;
that is the failure this requirement names.

#### Scenario: The chant starts the hour

- **WHEN** the enlistment screen is displayed with at least one contestant
- **THEN** the start control reads `GLORIA FAXEM!` and is the screen's most emphatic
  element

#### Scenario: The chant is disabled with an empty roster

- **WHEN** the roster is empty
- **THEN** the start control reads `GLORIA FAXEM!` and carries the disabled treatment

#### Scenario: A crown is acclaimed

- **WHEN** a contestant is first attributed `Faxekonge`
- **THEN** the acclamation stamps across the board bearing the badge sigil and then
  withdraws without being dismissed

#### Scenario: The acclamation does not repeat

- **WHEN** a crown has been acclaimed and the clock continues to advance
- **THEN** the acclamation is not raised again for that crown

#### Scenario: Both crowns are acclaimed

- **WHEN** a `Faxekonge` and later a `Faxedronning` are attributed
- **THEN** each is acclaimed once

#### Scenario: The acclamation never blocks the board

- **WHEN** the acclamation is displayed
- **THEN** every finish and forfeit control remains visible and pressable

### Requirement: Panels are physical plates, not floating surfaces

A panel SHALL be rendered as a constructed object: a ground drawn from the void band with a
stylised stone or iron texture, a chunky engraved border in the iron band, and riveted
corners.

Borders SHALL be thick enough to read as a frame rather than a hairline. Soft drop
shadows, blur, translucency, glassmorphism, rounded corners beyond a single pixel step, and
gradients used to simulate gloss SHALL NOT be used. Depth SHALL be expressed by a
two-tone bevel — a lit upper edge and a darkened lower edge — as pixel art does it.

#### Scenario: A panel is framed

- **WHEN** a panel is displayed
- **THEN** it carries a chunky engraved border with riveted corners

#### Scenario: No glass

- **WHEN** the stylesheets are inspected
- **THEN** no rule applies a blur filter, a translucent panel ground, or a gloss gradient

#### Scenario: Depth is bevelled

- **WHEN** a raised element is displayed
- **THEN** its depth reads from a lit upper edge and a dark lower edge, not from a shadow

### Requirement: Controls are physical objects that move by whole pixels

A control SHALL be rendered as a physical medieval object — a wax-sealed tab, an engraved
metal plaque, a wooden token or a shield-shaped plate — and SHALL respond mechanically.

| State | Treatment |
|---|---|
| Rest | Bevelled, lit upper edge, seated |
| Hover | Rises by one to two whole pixels, upper edge brightens, a small heraldic mark appears |
| Press | Compresses downward, darkens, border flashes once, snaps into place |
| Disabled | Unlit, desaturated toward the void band, no bevel, no hover response |
| Focus | A visible ring in the brass band, distinct from hover and never removed |

Movement SHALL be in whole pixel steps. Sub-pixel easing, elastic overshoot and floating
transitions SHALL NOT be used: the vocabulary is a lock engaging, not a bubble rising.

Focus treatment SHALL NOT be suppressed. The board is operated at speed and a control whose
focus cannot be seen is a control that cannot be found by keyboard.

#### Scenario: A control rises on hover

- **WHEN** a control is hovered
- **THEN** it rises by a whole number of pixels and its upper edge brightens

#### Scenario: A control depresses on press

- **WHEN** a control is pressed
- **THEN** it compresses, darkens, and its border flashes once

#### Scenario: A disabled control does not respond

- **WHEN** a disabled control is hovered
- **THEN** it does not rise, brighten or reveal a mark

#### Scenario: Focus is always visible

- **WHEN** a control receives keyboard focus
- **THEN** a brass focus ring is displayed, distinguishable from the hover treatment

#### Scenario: Motion is mechanical

- **WHEN** the stylesheets are inspected
- **THEN** no transition uses an elastic, bouncing or overshooting easing curve

### Requirement: Cards are manuscript leaves, set at fractional angles

A contestant card SHALL be rendered as a document — a parchment or plate leaf with a
decorative border, an emblem, the name as its title, the title as its rank line, and its
metadata rendered as stamps in the terminal face.

Cards SHALL sit at small, fractional and non-uniform angles, no greater than one degree,
so that a grid of them reads as objects laid on a table rather than as a table of rows.

The angle SHALL be derived deterministically from the contestant's identifier, so that a
card does not jump to a new angle on every render — the clock re-renders the whole board
twice a second, and a randomly re-rolled angle produces a board that visibly trembles.

Rotation SHALL NOT compromise the hit area of a card's controls.

#### Scenario: A card is a document

- **WHEN** a card is displayed
- **THEN** it carries an emblem, a bordered leaf ground, a title line and stamped metadata

#### Scenario: Angles are varied

- **WHEN** several cards are displayed
- **THEN** they sit at different angles, none exceeding one degree

#### Scenario: An angle is stable across renders

- **WHEN** the clock advances and the board re-renders
- **THEN** every card keeps the angle it had

#### Scenario: Controls stay pressable

- **WHEN** a rotated card's finish control is pressed at any point within its visible bounds
- **THEN** the press registers

### Requirement: The crowns are separated by emblem and metal, not by hue

`Faxekonge` and `Faxedronning` SHALL be distinguishable from each other, and from
`Faxeridder` and `Hestemann`, without their labels being read.

The palette contains no second warm hue to pair against brass — the pink that previously
distinguished the queen's card is outside the token set. The two crowns SHALL therefore be
separated by **emblem and metal value**: distinct original heraldic charges, and a bright
brass treatment against a paler bone-and-brass treatment. `Faxeridder` SHALL be iron.
`Hestemann` SHALL be unlit — the void band, no metal, no bevel.

This requirement exists because `arena-board` requires cards to be distinguishable without
their labels, and this change removes the mechanism that satisfied it. Substituting a
palette is not permitted to quietly drop an existing requirement.

#### Scenario: Four cards, four readings

- **WHEN** a `Faxekonge`, a `Faxedronning`, a `Faxeridder` and a `Hestemann` are displayed
  together
- **THEN** each is distinguishable from the others without its label being read

#### Scenario: The crowns differ

- **WHEN** the two crowns are displayed
- **THEN** they carry different heraldic charges and different metal treatments

#### Scenario: Failure is unlit

- **WHEN** a `Hestemann` card is displayed
- **THEN** it carries no metal, no bevel and no illumination

### Requirement: A crown receives ceremonial treatment, and only a crown

A card holding `Faxekonge` or `Faxedronning` SHALL receive ceremonial treatment: an
animated brass pixel edging, the badge sigil set behind the card as a faint watermark, and
an illuminated border.

Ceremonial treatment SHALL be confined to the crowns. `Faxeridder` and `Hestemann` SHALL
NOT receive it. A rare state applied to a common one stops being a signal — and in a
tournament of thirty, `Faxeridder` is the common case.

#### Scenario: A crown is illuminated

- **WHEN** a crowned card is displayed
- **THEN** it carries animated brass edging and the badge sigil as a watermark

#### Scenario: A knighthood is not

- **WHEN** a `Faxeridder` card is displayed
- **THEN** it carries no animated edging and no watermark

### Requirement: The in-progress indication is a vessel gauge, captioned as the hour

The in-progress indication on a card SHALL be rendered as an iron-framed vessel gauge, and
SHALL be captioned so as to name the hour rather than the contestant.

`arena-board` requires that this indication not imply per-contestant measurement: it is the
shared clock repeated beside a name, and the system records nothing about how much any
individual has drunk. A vessel that fills is a more literal drinking metaphor than the bar
it replaces, so it is more likely to be misread, and the caption is what stops that. The
old beer-fill bar carried no caption and did imply it.

The gauge SHALL take the alarm treatment past four-fifths of the hour, consistent with the
clock's urgency.

#### Scenario: The gauge is captioned as the hour

- **WHEN** an in-progress card is displayed
- **THEN** its gauge is labelled as the contest's remaining hour, not as the contestant's
  progress

#### Scenario: The gauge agrees with the clock

- **WHEN** thirty minutes have elapsed
- **THEN** every in-progress gauge stands at half, matching the clock

#### Scenario: The gauge alarms with the clock

- **WHEN** more than four-fifths of the hour has elapsed
- **THEN** the gauge carries the alarm treatment

### Requirement: The urgent clock is the only pulsing element

The clock's urgent state SHALL be the sole element in the interface permitted a repeating
attention animation.

`contest-clock` requires the final five minutes to be marked as urgent. Red is the reserved
alarm colour and a pulse is the strongest signal available, so spending either anywhere
else devalues the one moment the interface genuinely needs to shout.

#### Scenario: The clock pulses

- **WHEN** fewer than five minutes remain
- **THEN** the clock pulses in the red band

#### Scenario: Nothing else pulses

- **WHEN** the interface is inspected
- **THEN** no element other than the urgent clock carries a repeating attention animation
- **AND** the crowns' brass edging is a continuous ornament, not an attention pulse

### Requirement: The ground carries a masonry lattice, not a tile pattern

The page ground SHALL carry a very low-contrast, large-scale pixel pattern suggesting
fortress masonry or a monastery floor, replacing the existing diamond tile.

The pattern SHALL sit below the readability floor defined by `crt-display` and SHALL be
built as an inline data URI, without adding a request or a dependency.

Large areas of undecorated dark ground SHALL be preserved. Ornament SHALL be applied to
frames, plaques and corners and SHALL NOT be applied across open field.

#### Scenario: The ground is masonry

- **WHEN** any screen is displayed
- **THEN** the ground carries a low-contrast masonry lattice and no diamond tile

#### Scenario: Emptiness is preserved

- **WHEN** any screen is displayed
- **THEN** substantial areas of undecorated dark ground remain

### Requirement: The moderation notice survives, in plain Danish

The footer notice advising moderation SHALL be retained, set in the serif prose face in
the bone band on a footer plaque, and SHALL remain legible against every atmospheric
effect.

It SHALL NOT be translated into Latin, set in blackletter, reduced to an emblem, or styled
as ornament. This application exists to run a drinking contest; the one line that tells
somebody to be careful is the last thing that should become decorative.

#### Scenario: The notice is present and plain

- **WHEN** any screen is displayed
- **THEN** the moderation notice is displayed in Danish, in the prose face, in the bone band

#### Scenario: The notice is not ornament

- **WHEN** the footer is inspected
- **THEN** the notice is legible text and not an emblem, a Latin phrase or blackletter

### Requirement: The interface remains responsive and operable one-handed

The livery SHALL NOT reduce the interface's fitness for its actual use: one operator,
holding a phone, standing in a crowd.

Framed panels SHALL reflow rather than scroll horizontally. A card's controls SHALL remain
large enough to hit at arm's length. Plaques SHALL remain legible at the narrowest
supported width. Ornament that cannot survive a narrow viewport SHALL be dropped at that
width rather than shrunk into illegibility.

#### Scenario: A narrow viewport

- **WHEN** the interface is displayed at a phone's width
- **THEN** no region scrolls horizontally and every plaque is legible

#### Scenario: Controls stay reachable

- **WHEN** a card is displayed at a phone's width
- **THEN** its finish and forfeit controls remain large enough to press without precision

#### Scenario: Ornament yields first

- **WHEN** the viewport is too narrow for a plaque's heraldic end marks
- **THEN** the marks are dropped and the inscription remains at full legibility
