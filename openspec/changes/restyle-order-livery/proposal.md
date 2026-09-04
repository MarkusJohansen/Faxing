## Why

The interface currently wears a brewery's livery. Warm brown, polished gold, a diamond
tile pattern and the byline *Faxe Bryggeri · Grundlagt 1901 · Danmark* make it read as
promotional material for a real company that has not asked to be represented, and the
gold-on-brown palette is the visual grammar of a slot machine — the least fitting register
available for a tournament whose four outcomes are a crown, a crown, a knighthood and
public disgrace.

The tournament already has better source material of its own. There is a coat of arms:
two rampant lions supporting a bone shield that bears the litre can, crossed swords behind
it, red acanthus mantling, and a blackletter scroll reading **In Faxe Veritas**. There is a
chant, **Gloria Faxem!**. There are Danish titles borrowed from monarchy and chivalry. None
of it is on screen.

This change puts the order's own heraldry on the interface and renders it as pixel art on a
worn CRT — a fortress command terminal for a martial order that happens to venerate a
litre can. It borrows the can's own two colours, black and the red of its band, so the
result still reads as Faxe Extra Strong without borrowing the brewery's identity.

## What Changes

- **A new visual system, `order-livery`**, replacing the brown-and-gold palette with a
  near-black ground carrying bone text, the can's red as the sole alarm colour, brass for
  rank, oxidised iron for structure and dark laurel for confirmation. Colour becomes
  semantic and scarce; nine tenths of the screen is dark.
- **A new atmospheric layer, `crt-display`** — scanlines, phosphor bloom, chromatic
  separation, vignette, mild curvature and a very slow flicker — applied over the whole
  interface, bounded by a hard readability floor and switched off entirely under
  `prefers-reduced-motion` and `prefers-contrast: more`.
- **The order's sigil, drawn as pixel art** in three hand-authored sizes: a full
  achievement (lions, swords, mantling, shield, can, scroll), a compact shield badge, and a
  16×16 mark. Authored as SVG on an explicit pixel grid with `crispEdges`, not as raster.
- **The motto `IN FAXE VERITAS`** takes the place of the brewery byline beneath the
  wordmark, set in pixel blackletter on a parchment scroll.
- **The chant `GLORIA FAXEM!`** becomes the ritual that opens a contest — it is the label
  on the control that starts the hour — and the acclamation that stamps across the board
  when a crown is awarded.
- **Latin inscription plaques** name each region of the interface — `REGISTRUM`,
  `VIGILIA`, `ARENA`, `CHRONICA`, `HESTEMANN` — above the existing Danish headings, which
  stay. Latin labels the furniture; Danish says the words. No prose becomes Latin and no
  paragraph is set in blackletter.
- **Panels become physical**: framed stone and iron plates with chunky engraved borders and
  riveted corners, replacing the current soft-shadowed scroll panels. Buttons become wax
  seals and iron plaques that depress on press. Cards become manuscript leaves that sit at
  fractional angles.
- **Typography is re-cast** onto four families with a defined job each: pixel blackletter
  for the wordmark and motto, Roman inscription capitals for Latin plaques, a CRT terminal
  face for every numeral and stamp, and the existing serif for Danish prose. Two families
  currently loaded and barely used are dropped, so the font budget does not grow.
- **The beer-fill progress bar becomes an iron-framed vessel gauge** — and is explicitly
  re-captioned so that it stops implying it measures an individual's drinking, which it
  never did. This is the one place where the restyle corrects a lie the old styling told.
- **The moderation notice stays**, in bone on the footer plaque. It is not ornament and it
  does not become Latin.
- **Not changed**: every rule, every duration, the titling logic, the persisted shape, the
  storage key, the roster's validation, the search threshold, or any Danish string other
  than the two ceremonial labels named above. No behaviour is added or removed. No
  dependency is added.

## Capabilities

### New Capabilities

- `order-livery`: the order's visual identity — semantic palette, typographic roles, Latin
  plaques, physical panel and control materials, the pixel sigil, the motto, the chant,
  ceremonial states for rare outcomes, and the motion vocabulary.
- `crt-display`: the atmospheric layer that the livery is viewed through — scanlines,
  bloom, chromatic separation, noise, flicker, curvature and vignette — together with the
  readability floor and the accessibility conditions under which the layer is withdrawn.

### Modified Capabilities

None. Every existing requirement in `arena-board`, `contestant-roster`, `contest-clock`,
`title-award` and `session-persistence` survives this change unaltered, and the two new
capabilities are written to sit underneath them.

Three of those requirements constrain this change rather than being changed by it, and the
delta specs cite them so the constraint is not lost:

- `arena-board` requires that a card be distinguishable by title *without reading its
  label*. The old palette did this with gold, pink, silver and grey. The new palette has no
  pink, so the crowns are separated by emblem and metal value instead, and the requirement
  is what forces that to be verified rather than assumed.
- `arena-board` requires that the in-progress indication not imply per-contestant
  measurement. The vessel gauge is a more literal drinking metaphor than the bar it
  replaces, so it needs the caption the old one lacked.
- `contest-clock` requires an urgent state and a distinct expired state. Blood red is the
  reserved alarm colour, so the urgent clock is the one element permitted to pulse — which
  means nothing else may.

## Impact

- `src/index.css` — the token set is replaced: palette, four font roles, the material and
  border scales, the CRT layer's variables. The diamond tile background is replaced with a
  masonry lattice.
- `src/App.css` — every rule is re-grounded on the new tokens; panel, button, card, plaque
  and progress treatments are rewritten. This is the bulk of the change (~650 lines today).
- `src/assets/sigil.svg`, `sigil-badge.svg`, `sigil-mark.svg` — new. Hand-authored pixel
  art on a declared grid.
- `index.html` — the font link is re-cut (drop `MedievalSharp`, `Cinzel Decorative`; add
  `Jacquard 24`, `VT323`); a favicon referencing the 16×16 mark; the CRT overlay's root
  element if it cannot be attached from `App.tsx`.
- `src/App.tsx` — the header's byline becomes the motto and the sigil; the footer plaque.
  No state, no handler and no computation changes.
- `src/components/Registration.tsx` — `REGISTRUM` plaque; the start control carries the
  chant.
- `src/components/Arena.tsx` — `VIGILIA` / `ARENA` / `CHRONICA` / `HESTEMANN` plaques above
  the existing Danish headings; the acclamation banner on a crowning.
- `src/components/ContestantCard.tsx` — the vessel gauge replaces `BeerProgress`; crown
  cards carry the badge sigil; the gauge gains its caption.
- `src/components/GlobalTimer.tsx` — CRT numerals; the urgent pulse.
- No new npm dependency. `package.json` is untouched. Two Google Fonts families are
  exchanged for two others, so the network cost is unchanged.
