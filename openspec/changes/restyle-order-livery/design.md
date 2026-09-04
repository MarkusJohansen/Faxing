## Context

The interface is four components, one stylesheet of about 650 lines, and a token block of
twenty-two custom properties in `src/index.css`. There is no CSS framework, no
preprocessor, no design-token pipeline and no component library. Everything visual is
hand-written CSS keyed on class names that the components already emit.

That is the single most important fact about this change: **it is almost entirely a
stylesheet replacement.** The token block is the seam. Every colour in `App.css` already
resolves through a custom property, so replacing the palette is replacing twenty-two
declarations, and the components need touching only where new *content* appears — a
plaque, a sigil, a caption, the acclamation.

What is on screen today is Faxe brewery livery: `--brown-darkest: #1a0f05` as the ground,
a gold ramp from `#7d5a1e` to `#f5d88a`, two warm radial washes, a diamond tile data URI,
and the header byline `Faxe Bryggeri · Grundlagt 1901 · Danmark`. Four Google Fonts are
loaded — `MedievalSharp`, `Cinzel`, `Cinzel Decorative`, `IM Fell English` — of which
`MedievalSharp` is requested and never referenced by any rule, and `Cinzel Decorative`
carries only the wordmark.

The source material this change draws on is the order's own coat of arms: two rampant
lions in tan-brass supporting a bone shield charged with the litre can, crossed steel
swords behind, red acanthus mantling, and a blackletter scroll reading *In Faxe Veritas*.
The can itself is black, with a red band and a brass viking medallion. Those are the
colours; they are already the answer to "how do we keep this recognisably Faxe without
wearing the brewery's clothes".

Constraints that bound the solution:

- **The board re-renders twice a second.** `App.tsx` ticks `now` on a 500 ms interval and
  `getRankedContestants()` recomputes on every tick. Anything derived per render must be
  deterministic, and anything expensive per render is paid 7,200 times an hour.
- **No behaviour may change.** The five baseline specs in `openspec/specs/` were written
  from the current implementation and validate strictly. Three of their requirements
  actively constrain this change; they are cited in the delta specs rather than restated.
- **No dependency may be added.** The project has two runtime dependencies, `react` and
  `react-dom`. A restyle is the weakest possible justification for a third.
- **`crypto.randomUUID()` already limits deployment** to a secure context, which is a
  separate defect recorded in `ARCHITECTURE.md`. It is not this change's to fix, but the
  card angle derived from the contestant identifier must not assume UUID *shape*.

## Goals / Non-Goals

**Goals:**

- The interface reads as a martial order's command terminal, not as brewery promotion.
- The order's heraldry — sigil, motto, chant — is present and is the identity.
- Black and the can's red remain the dominant accents, so it still reads as Faxe Extra
  Strong.
- Colour becomes semantic and scarce; the screen is mostly dark.
- The CRT atmosphere is convincing and costs nothing per frame.
- Readability and one-handed operability are better than they are today, not worse.
- The whole change is a stylesheet, three SVGs, and small additive component edits.

**Non-Goals:**

- Any rule, duration, title, validation, threshold or persisted shape. Not one.
- Fixing the defects recorded in `ARCHITECTURE.md` — the late-finish promotion, the
  unvalidated persisted shape, the secure-context requirement. Each is its own change.
- A theme system, a light mode, a palette switcher or a stored appearance preference.
  There is one livery. An order does not offer alternative colours.
- A CSS framework, a preprocessor, a token build step, or an icon dependency.
- A raster asset pipeline. No PNG, no sprite sheet, no spritesheet build.
- Per-contestant drink instrumentation. The vessel gauge gets a caption, not a data source.

## Decisions

### The palette is the can, read as heraldry

Twenty-two tokens are replaced by the following. The names are roles, not hues, so a
future adjustment does not require renaming every use site.

```
/* Void — grounds, deep panels, inactive */
--void:       #08090a   /* page ground */
--pitch:      #101215   /* deep panel */
--charcoal:   #191c21   /* raised panel */
--stone:      #2b2f36   /* panel edge, inset */

/* Iron & slate — structure, secondary information */
--iron:       #454a52   /* borders, frames, the swords */
--iron-lit:   #6b7178   /* lit bevel edge */
--slate:      #8a9099   /* secondary and archival text */

/* Bone & parchment — primary text, document material */
--bone:       #e9e5d9   /* primary text */
--parchment:  #d8ceb0   /* card and scroll ground */
--vellum:     #c4b894   /* parchment shade */

/* Faxe red & blood — alarm, urgency, selection, ceremony */
--faxe:       #c9382a   /* the can's band; the order's red */
--faxe-lit:   #e8543f   /* lit edge, bloom */
--blood:      #6e1512   /* deep ground beneath the red */

/* Brass — rank, hierarchy, rarity, reward */
--brass:      #a3803c   /* the lions, the medallion */
--brass-lit:  #d2ad66   /* crowned edging */
--brass-dim:  #63501f   /* seated brass, focus ring at rest */

/* Laurel — confirmed, active, safe, progression */
--laurel:     #24402b
--laurel-lit: #4a7a55
```

Two reds rather than one because the band red at `#c9382a` is too bright to use as a
*ground* — an alarm panel filled with it is unreadable — and `--blood` gives the darker
field the bright red sits on. That pairing is what the coat of arms already does: bright
acanthus against dark negative space.

`--laurel` earns its place on exactly two things today: the confirmed/finished state and
the decline control on the reset confirmation. It is nearly unused, and that is correct —
green means *safe*, and very little in this interface is safe.

### The crowns separate by emblem and metal, because the palette took the pink away

Today the four titles are gold, pink, silver, grey. `arena-board` requires a card to be
identifiable by title without reading its label, and the new palette has exactly one warm
metal, so pink is gone and gold and silver collapse toward brass and iron.

The replacement is heraldic rather than chromatic:

| Title | Metal | Charge |
|---|---|---|
| `Faxekonge` | `--brass-lit` on `--pitch` | Crown over a shield, filled |
| `Faxedronning` | `--bone` on `--pitch`, brass rule | Crown over a shield, voided (outline) |
| `Faxeridder` | `--iron-lit` on `--charcoal` | Crossed swords |
| `Hestemann` | `--slate` on `--void`, no bevel | Horse's head, unlit |

Filled versus voided is real heraldic grammar for distinguishing two bearers of the same
charge, it survives greyscale, and it survives the atmospheric layer being withdrawn. The
alternative considered — a cooler metal such as pewter for the queen — was rejected because
`--iron-lit` already carries the knighthood, and three metals in one hue family is three
things that look the same across a room.

### The sigil is SVG on an integer grid, not raster, and each size is drawn separately

Three files: `sigil.svg` at 64 × 72, `sigil-badge.svg` at 32 × 32, `sigil-mark.svg` at
16 × 16. Each has `viewBox="0 0 W H"`, `shape-rendering="crispEdges"`, and is composed of
integer-aligned `<rect>` runs — one rect per horizontal run of same-coloured pixels, which
is both how pixel art compresses naturally and what keeps the files a few kilobytes.

SVG rather than PNG because one file is crisp at every size, needs no `@2x`, no build step,
no loader and no dependency, and can inherit interface tokens through `currentColor` where
a single-colour mark is wanted. `image-rendering: pixelated` on a raster would have worked
for the achievement but not for the 16 × 16 mark, which must stay sharp when it is scaled
*up* into a plaque end.

Each size is drawn by hand because downsampling pixel art destroys it. At 16 × 16 there is
no room for a lion at all — the mark is a shield silhouette with the can's red band across
it, which is the one feature that survives. The badge at 32 × 32 keeps the shield and the
can and drops the supporters. Only the 64 × 72 achievement carries lions, swords, mantling
and scroll.

Twelve colours is the cap, and the ramp is drawn from the tokens above: void, pitch, iron,
iron-lit, bone, parchment, vellum, faxe, faxe-lit, blood, brass, brass-lit. That is exactly
twelve, which is not a coincidence — the cap was set to the ramp the palette already
provides.

### Fonts: four families, four jobs, no net growth

| Role | Family | Why |
|---|---|---|
| Wordmark, motto | `Jacquard 24` | A genuine pixel blackletter. Blackletter carries the manuscript register; the bitmap grid carries the CRT one. One face does both, so no compromise is needed. |
| Latin plaques | `Cinzel` | Already loaded. Roman inscriptional capitals — literally a stone-carving face, which is what a plaque is. |
| Numerals, stamps | `VT323` | A DEC VT-series terminal face. Monospaced, so the clock does not re-flow on every tick; and it *is* the CRT reference rather than an imitation of one. |
| Danish prose | `IM Fell English` | Already loaded. A seventeenth-century press face — period-correct, and legible at paragraph length, which blackletter is not. |

`MedievalSharp` is dropped because no rule references it, and `Cinzel Decorative` because
`Jacquard 24` takes the wordmark. Four families in, four families out. The weight range on
`Cinzel` narrows to 400 and 700 — nothing uses 600 or 900 — which recovers most of the
bytes the two new faces cost.

Every family gets a real fallback stack, and the pixel faces fall back to a generic serif
rather than to nothing: a missing blackletter should degrade to a readable wordmark, not to
Times at the wrong size.

### The CRT layer is one fixed pseudo-element, and it is CSS only

A single `body::after` — `position: fixed`, `inset: 0`, `pointer-events: none`, a high
`z-index` — carries the whole atmospheric layer:

- **Scanlines**: a `repeating-linear-gradient` at 3 px pitch, `--bone` at very low alpha.
- **Vignette**: a `radial-gradient` to `--void`, transparent through the middle two thirds.
- **Bloom and separation**: not on this layer. Bloom is a warm `text-shadow` and `box-shadow`
  on the elements that are actually bright — the clock, the plaques, brass edging — because a
  global bloom is a blur, and a blur over text is forbidden by the readability floor. The
  "chromatic separation" is two offset warm shadows, one `--faxe-lit` and one `--brass-lit`,
  at sub-pixel offsets on bright edges only. This is the decision that keeps the effect out
  of cyan/magenta territory: there is no channel-splitting filter to tint, just two warm
  shadows chosen by hand.
- **Noise**: a static SVG `feTurbulence` data URI at low opacity. Static, so it costs one
  paint.
- **Flicker**: one keyframe animation on the layer's `opacity`, 4.2 s period, 0.985 → 1.0.
  That is 1.5 % — half the specified bound — at a quarter hertz.
- **Curvature**: `border-radius` and an inset `box-shadow` on the layer, so the *frame*
  curves. The content is never transformed.

`will-change` is deliberately **not** set. The layer's only animation is a slow opacity
drift; promoting a full-viewport element to its own compositor layer to serve a 4-second
fade costs more memory than it saves paint, on precisely the phone this runs on.

Two media queries do the withdrawing: `prefers-reduced-motion: reduce` sets
`animation: none` on the flicker; `prefers-contrast: more` sets `display: none` on the
whole layer and strips the bloom shadows. No JavaScript, no toggle, no stored preference.

### The card angle is hashed from the contestant identifier

Cards must sit at fractional angles, and the board re-renders twice a second, so a random
angle would make the board tremble. The angle is derived: a small integer hash of the
contestant's `id`, taken modulo a range, mapped into ±0.8°.

The hash reads the string byte by byte and must not assume the id is a UUID — the same
identifier field is what a future change to `crypto.randomUUID()` would alter, and a hash
that indexes fixed character positions would silently start returning one angle for every
card.

This is computed in the component from a prop that is already there. No new state, no memo,
no id-to-angle map.

### Latin plaques are additive markup, and that is the whole component change

The plaques, the sigils, the gauge caption and the acclamation are the only reasons any
`.tsx` file is touched. Concretely: a `<Plaque>` presentational component (roughly fifteen
lines — an inscription, a rule, and two mark slots), used five times; the sigil imported as
three static SVG URLs; one caption string on the gauge; and the acclamation.

No handler, no state shape, no computation and no prop threading changes, with one
exception below.

### The acclamation is derived from the board, and needs one piece of state to fire once

`GLORIA FAXEM!` must stamp across the board when a crown is *first* awarded. Titles are
recomputed on every tick, so "a crown exists" is true for the rest of the hour and firing
on it directly means the banner is raised 7,200 times.

The mechanism is a `useRef` in `Arena` holding the set of crowns already acclaimed, and a
short-lived piece of state holding the crown currently being acclaimed. When the ranked
list contains a crown whose title is not in the ref, the ref records it and the state is
set; a timeout clears the state. This is the only state this change adds, it lives in
`Arena` where the board is, and it is deliberately *not* persisted — a reload mid-hour
should not replay the ceremony.

The banner is `position: fixed`, `pointer-events: none`, and anchored away from the card
grid's controls, so the specified requirement that it never block a finish control is
satisfied structurally rather than by choosing a duration short enough to get away with.

### The gauge gets a caption because the metaphor got stronger

The existing `BeerProgress` receives the *global* `elapsedMs`, so every in-progress card
shows an identical bar. `arena-board` records this and requires that the indication not
imply per-contestant measurement.

A filling vessel is a much more literal drinking metaphor than a bar, so replacing one with
the other makes an existing misreading more likely, not less. The gauge therefore carries an
explicit label naming the hour — the label the old bar never had. This is the one place
where the restyle repairs something rather than only re-dressing it, and it is worth stating
plainly: the old styling implied a measurement the system has never taken.

## Risks / Trade-offs

**The atmosphere ruins the legibility and nobody notices until it is on a phone in a dark
room.** This is the main risk, and it is why the readability floor is specified as a
composited measurement rather than as taste. The mitigation is to measure through the layer
— screenshot the composited result and sample it — rather than to check the token values,
which will pass while the screen fails. Accepted risk: the measurement is manual, because
adding a headless browser to a two-dependency project to check contrast is a worse trade
than doing it by eye once with a colour picker.

**Hand-drawing three pixel assets is the longest task by far, and it is the one that cannot
be estimated.** Everything else is mechanical. If the achievement proves too slow, the
fallback is to ship the badge and the mark first and let the header carry the badge until
the achievement exists — the motto and the wordmark already give the header its identity.
The change is structured so the achievement is last for exactly this reason.

**Four hundred lines of CSS get rewritten with no test coverage.** There is no test suite
in this project at all, so nothing catches a rule that stops applying. Mitigation: the
change is verified by walking the interface in the four states that matter — empty roster,
contest running, crown awarded, hour expired — at a phone width and a desktop width, with
the atmospheric layer both on and withdrawn. That is eight passes and it is written into
the task list rather than left to discipline.

**Trading `MedievalSharp` and `Cinzel Decorative` for `Jacquard 24` and `VT323` is
described as free, and it is not exactly.** The two new faces are different byte counts to
the two dropped, and narrowing `Cinzel` to two weights is what makes the claim roughly
true. If the measured request grows materially, the honest fix is to drop the `Cinzel`
italic and the `IM Fell English` italic, neither of which the interface uses.

**The pixel-blackletter wordmark may simply be hard to read.** Blackletter is the least
legible register available and a bitmap grid does not help. It is confined to the wordmark
and the motto, both of which are known strings the reader does not need to parse, and the
mitigation if it fails is to keep `Jacquard 24` for the motto and set the wordmark in
letter-spaced `Cinzel` capitals instead.

**Fractional card rotation can clip a neighbour or produce a sub-pixel seam** on some
browsers at some zoom levels. Bound is ±0.8°, cards keep their existing gap, and the
verification pass includes a crowded board at two zoom levels. If it seams, the angle goes
to zero on the failing state; the tilt is the most disposable thing in the change.

**Making the chant the start control removes a plain Danish instruction.** `⚔ Begyn Kampen
⚔` tells a first-time operator what the button does; `GLORIA FAXEM!` does not. The existing
hint beneath it ("enlist at least one warrior") stays, the control remains the only
emphatic element on the screen, and the register is the point of the change — but this is a
deliberate trade of clarity for ceremony, and it is the one place in this change where
ceremony wins.
