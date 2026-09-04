## ADDED Requirements

### Requirement: The atmospheric layer sits above the interface and never intercepts it

The CRT treatment SHALL be applied as a layer above the interface's content, and SHALL NOT
intercept pointer or keyboard input.

It SHALL be composed of: faint horizontal scanlines, light phosphor bloom around bright
edges, very subtle chromatic separation on bright edges, minimal analog noise, a gentle
vignette, slight screen curvature and mild image softness.

The layer SHALL be a single element, not a treatment applied per component. A per-component
effect multiplies as panels nest — a card inside a panel inside a page receives the
scanlines three times — and the compounding is what turns atmosphere into fog.

#### Scenario: The layer does not swallow input

- **WHEN** a control beneath the CRT layer is pressed
- **THEN** the press reaches the control

#### Scenario: The layer is not applied twice

- **WHEN** a card nested inside a panel is inspected
- **THEN** the scanline, noise and vignette effects are applied once, at the page level

### Requirement: The glow is bone, amber and blood — never cyan or magenta

Phosphor bloom and chromatic separation SHALL be tinted only within the bone, amber-brass
and blood-red bands.

Cyan and magenta fringing SHALL NOT be used. That particular separation is the signature of
synthwave and of a consumer television, and it drags the whole design toward neon
nostalgia. A bone-and-amber phosphor reads instead as a monochrome laboratory monitor
displaying something it was not built to display, which is the intended effect: ancient
imagery on obsolete hardware.

#### Scenario: Bloom is warm

- **WHEN** a bright edge is inspected
- **THEN** its bloom is tinted bone, amber or blood

#### Scenario: No cool fringing

- **WHEN** the stylesheets are inspected
- **THEN** no cyan, teal, magenta or violet value appears in any glow, shadow or
  separation effect

### Requirement: Text readability is a hard floor the atmosphere may not cross

No atmospheric effect SHALL reduce the contrast of body text below the level required to
read it comfortably at arm's length.

Concretely: scanline opacity, noise opacity, vignette strength and softness SHALL be bounded
such that body text retains a contrast ratio of at least 7:1 against its own ground, and
every other text and meaningful non-text element at least 4.5:1, measured through the
composited layer rather than on the raw token values.

Measuring through the layer is the point. A palette that passes on paper fails on screen
once a scanline mask and a noise field are multiplied over it, and the composited figure is
the only one a reader actually experiences.

Softness SHALL NOT be applied to text at all. A blur on a glyph is indistinguishable from a
rendering fault and is the single fastest way to make a design read as broken.

#### Scenario: Body text through the layer

- **WHEN** body text is measured through the composited atmospheric layer
- **THEN** its contrast against its ground is at least 7:1

#### Scenario: Other text and marks through the layer

- **WHEN** any other text or meaningful mark is measured through the composited layer
- **THEN** its contrast against its ground is at least 4.5:1

#### Scenario: Glyphs are never blurred

- **WHEN** the stylesheets are inspected
- **THEN** no blur or softness filter is applied to a text element

### Requirement: Flicker is slow and shallow, by a stated bound

Luminance flicker SHALL vary by no more than three per cent, and SHALL complete no more
than one cycle every four seconds.

Both bounds are safety bounds, not taste. Flicker in roughly the three-to-sixty hertz range
is the band associated with photosensitive seizures, worst around fifteen to twenty hertz —
which is exactly the range a naive "CRT flicker" animation lands in, because that is where
it looks most like a real CRT. A quarter-hertz drift at three per cent reads as an old tube
warming and cooling and is nowhere near the band.

Analog noise SHALL be animated no faster than the same bound, or SHALL be static.

#### Scenario: Flicker is bounded

- **WHEN** the flicker animation is inspected
- **THEN** its period is at least four seconds and its luminance range is within three per
  cent

#### Scenario: No effect enters the photosensitive band

- **WHEN** every animation in the interface is inspected
- **THEN** none repeats at a frequency between three and sixty hertz

### Requirement: Curvature and vignette are geometric hints, not a simulated tube

Screen curvature SHALL be suggested — a slight rounding and inset at the outer frame, a
gentle darkening toward the edges — and SHALL NOT be implemented as a geometric warp of the
content.

Warping the content deforms text toward the edges, breaks hit areas away from where
elements are drawn, and defeats the readability floor at exactly the corners where the
vignette is already darkest. The frame can be curved; the page inside it stays flat.

#### Scenario: Content is not warped

- **WHEN** a control near the edge of the viewport is pressed at its drawn position
- **THEN** the press registers

#### Scenario: Curvature reads at the frame

- **WHEN** the interface is displayed
- **THEN** the outer frame suggests a curved tube while the content within it remains
  geometrically flat

### Requirement: The layer withdraws under reduced-motion and elevated-contrast preferences

The layer SHALL withdraw in proportion to the preference the browser reports.

Under `prefers-reduced-motion: reduce`, every animated component — flicker, noise
animation, shimmer and background drift — SHALL stop. The static components — scanlines,
vignette, curvature at the frame — MAY remain.

Under `prefers-contrast: more`, the atmospheric layer SHALL be withdrawn entirely:
scanlines, noise, bloom, chromatic separation, vignette and softness all removed, leaving
the livery's palette and materials on a plain ground.

These SHALL be satisfied by media queries alone. No control, setting or stored preference
SHALL be introduced for them.

The reason is that the people who need this most are already telling the browser so. A
bespoke toggle asks somebody to find and operate a control on a page that is, for them,
already unusable — and it is a preference to persist, a control to lay out, and a state to
restore, none of which a media query needs.

#### Scenario: Reduced motion stops the movement

- **WHEN** the interface is displayed under `prefers-reduced-motion: reduce`
- **THEN** no flicker, noise animation, shimmer or drift occurs
- **AND** the interface remains fully usable

#### Scenario: Elevated contrast removes the atmosphere

- **WHEN** the interface is displayed under `prefers-contrast: more`
- **THEN** no scanline, noise, bloom, separation, vignette or softness is applied

#### Scenario: No preference control is added

- **WHEN** the interface is inspected
- **THEN** it offers no control for disabling the atmospheric layer

### Requirement: The interface is fully usable with the layer removed

Every state, distinction and signal in the interface SHALL remain readable when the
atmospheric layer is withdrawn.

The layer is atmosphere. Nothing SHALL depend on it: no state distinguished only by its
glow, no boundary drawn only by its vignette, no urgency conveyed only by its flicker.

#### Scenario: Every state survives removal

- **WHEN** the atmospheric layer is removed
- **THEN** all four titles, the urgent clock, the expired clock, the disabled control and
  the in-progress card remain distinguishable

#### Scenario: No signal is carried by atmosphere alone

- **WHEN** the interface is inspected
- **THEN** no meaningful state is conveyed solely by bloom, flicker, noise or vignette

### Requirement: The layer costs nothing per frame that the clock will pay twice a second

The atmospheric layer SHALL be implemented in CSS, using compositor-friendly properties,
and SHALL NOT introduce a per-frame script, a canvas, a WebGL context or a dependency.

The board already re-renders on a twice-per-second tick and is run on a phone that is being
held in one hand for an hour. An effect layer that repaints with each of those ticks turns
an idle page into a warm battery.

The layer SHALL NOT be re-created or re-measured when the interface re-renders.

#### Scenario: No new dependency

- **WHEN** the manifest is inspected
- **THEN** no dependency has been added for the atmospheric layer

#### Scenario: No per-frame script

- **WHEN** the implementation is inspected
- **THEN** the layer is CSS, with no animation frame loop, canvas or WebGL context

#### Scenario: The layer is stable across re-renders

- **WHEN** the clock advances and the board re-renders
- **THEN** the atmospheric layer is not rebuilt and its noise field does not jump
