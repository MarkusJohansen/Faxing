## MODIFIED Requirements

### Requirement: Colour is a night palette with semantic roles
The interface SHALL draw every colour from a fixed token set declared once in
`src/index.css`, in which indigo-black to slate-blue tones carry structure, steel to
silver tones carry text, campfire orange carries light (flames), glory and the primary
action, dusk tones (plum, rust, amber) carry only the header sky, and crimson carries
failure.

Warmth on the board is scarce on purpose: if orange decorates a card, it stops meaning "a
crown" at a glance across a room. The dusk sky is scenery above the board, and no card,
control or board surface uses a dusk token.

#### Scenario: A component rule names no colour of its own
- **WHEN** `src/App.css` and the components are searched for hex, `rgb()` or `hsl()` literals
- **THEN** none is found outside the token block in `src/index.css`

#### Scenario: Dusk stays in the sky
- **WHEN** `src/App.css` and `src/components` are searched for `--dusk-` and the dusk inks
- **THEN** the only users are the header background and the night scene's sky and arches
