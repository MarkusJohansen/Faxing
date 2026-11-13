## Context

The visual layer is `src/index.css` (tokens, base) and one 826-line `src/App.css` with 22
hex literals outside the token block. Markup is in six components plus `App.tsx`, which
renders header, nav, home and lore inline. The reference is a single pixel-art image: a
moonlit gothic street in muted greens, lit only by orange lanterns.

Constraints from `CLAUDE.md`: no new dependency, no new network host (Google Fonts is the
one allowed), every colour through a token, Danish copy untouched, components present and
`App.tsx` owns state.

## Goals / Non-Goals

**Goals:**
- The reference's mood on every screen: night greens, lantern warmth, hard pixels.
- Layout that suits one operator on a phone: clock always in sight, big tap targets.
- A visual layer that stays replaceable: tokens in one block, one stylesheet.

**Non-Goals:**
- Any rule, state, prop, storage or API change.
- New copy, or translating or correcting existing copy (the brewery byline included).
- Raster assets, sprite sheets, an icon set, or an animation library.
- Carrying anything over from the `restyle-order-livery` branch.

## Decisions

**1. Palette: nine greens, four warms, one red; named by role, not hue.**
Tokens are `--night-*` (ground), `--stone-*` (surfaces and borders), `--moon-*` (text and
highlights), `--lantern-*` (glory, primary action) and `--blood-*` (failure). Component
rules use those; alpha overlays are built with `color-mix()` on a token, so no literal
leaks. Alternative considered: keeping the old `--gold-*` names with new values. Rejected:
a token called gold that is orange is a trap for the next change.

**2. Pixel art is authored as character maps and rendered to SVG rects.**
`src/lib/pixelArt.ts` turns rows of characters plus a `char → token` map into merged
horizontal runs of `<rect>`. `NightScene.tsx` paints the grid with a few helpers (rect, dither, spire) rather than by
hand-typed rows: a 192×64 scene is 12,288 characters, and a typo in one is invisible. SVG with
`shape-rendering="crispEdges"` scales to any width with hard edges and takes its fills from
CSS variables, so the scene follows the tokens. Alternatives: a PNG (a second colour source
outside the token seam, and blurry unless every consumer sets `image-rendering`), or CSS
`box-shadow` pixel art (unmaintainable past a few dozen pixels).

**3. Pixel edges come from `clip-path` notches and solid offset shadows.**
A shared `--notch` step clips each corner of panels, cards and buttons into a 2-step
stair. Depth is a solid `box-shadow` offset with zero blur, or an inset pair for a bevel.
`clip-path` cuts outer shadows (and a `filter` shadow too, since clipping runs after it),
so depth is a thicker dark bottom border instead. Alternative: `border-image` with a 9-slice SVG.
Rejected as harder to recolour per title.

**4. Dither and banding are CSS patterns, not images.**
The sky is a stepped `linear-gradient` with hard stops. Dither is a 2×2 `conic-gradient`
checker tiled at 4px, mixed from two neighbouring tokens.

**5. Fonts: Jacquard 24, Jersey 20, VT323.**
All on Google Fonts, the host already in use; the request drops four families and adds
three. Jacquard 24 is a pixel blackletter made for large sizes; Jersey 20 replaced Pixelify Sans, whose capital B read
as a G (see `findings.md`); VT323 gives tabular numerals so the clock does not jitter.
Font smoothing is turned off where the platform allows. Alternative: Press Start 2P for
everything. Rejected: too wide for names on a 360px card.

**6. The scene is drawn at integer scales only.** 192px tall (3×) on phones and 256px
(4×) from 900px wide, never resampled; wider than the scene, CSS bands continue the sky.

**7. The clock is `position: sticky`, in CSS only.**
`.global-timer` sticks to the top of the board. No scroll listener, no state.

**8. Markup changes stay cosmetic.**
`App.tsx` gains `<NightScene />` in the header and loses the two `⚔` ornaments.
`ContestantCard` renames the `beer-*` classes to `candle-*` and sets the wax width to the
share of the hour that is left. `GlobalTimer` is untouched apart from class hooks already there.
Glyph-like strings that are copy (`⚜`, `⚔` inside Danish labels) stay.

## Risks / Trade-offs

- [Pixel fonts cost legibility at small sizes] → body never below 16px; names in the sans;
  contrast measured and logged in `findings.md`.
- [Jacquard 24 or Jersey 20 may lack a Danish glyph] → check `æøåÆØÅ` in the browser;
  if one falls back, swap that face and record it.
- [`clip-path` hides focus outlines] → focus is drawn as an inset ring, inside the clip.
- [Sticky clock eats phone height] → it compacts to one row under 640px.
- [No test suite] → verification is by eye at phone and desktop width across the four
  states the project names; said as such, not as "verified".
- [The header still carries the brewery byline, and the footer has no moderation notice
  although `CLAUDE.md` rule 12 says it stays] → both are copy, out of scope here; raised
  with the owner as open questions.

## Open Questions

- Should the byline `Faxe Bryggeri · Grundlagt 1901 · Danmark` go? It is the last piece of
  the brewery's identity on screen.
- The moderation notice is missing from the footer on `main`. Restore it, and with what
  wording?
