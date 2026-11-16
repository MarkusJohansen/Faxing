## Context

The app's livery is stone, moss and lantern light: every screen is a slab, and `src/index.css`
holds the only hex values in the project. Titles are derived, never stored, and the lore already
tells how the buds reached Backlog. What was missing is the page itself.

## Decisions

### The one screen that is paper

Parchment is a departure, and departures need a reason that survives being asked twice. The
reason is the object: the law is a document, kept and sealed, not a notification from the room.
Paper also does the work a frame would otherwise have to: the sheet's edge, its ruling and the
two rolls say "document" without a single ornament. Thirteen tokens were added for it
(`--parchment-100…400`, `--ink-900`, `--brass-400/600`, `--steel-400/200`, `--wax-300/500/700/900`),
named for the material rather than the part that uses them, so the next paper screen reuses them.

The shield's field is `--parchment-100`, one step brighter than the sheet's `--parchment-200`.
Argent on parchment with no border reads as a shape cut out of the page, which is how the arms
are drawn here.

### The art is a grid, not a picture

The arms came as a traced 128×128 SVG of sixteen colours; committing it would have added a
68 KB picture whose colours cannot follow a restyle, and the page would then hold two palettes.
It was parsed into pixels once (each path is run-merged one-pixel rects, so the parse is exact),
sixteen colours were quantised to eight inks, and the grid was committed in
`src/lib/orderArms.ts` where it can be edited by hand. The seal was drawn in the same ink grid
at 32×43: eleven rows of cord above a 32×32 disc, with the order's arms cut into the wax.

Multi-tone art needed a home of its own. `src/components/Lore.tsx` keeps its nine-row emblems in
one flat map with a hardcoded scale, and stretching that to two large multi-ink drawings would
have changed a working pattern to fit an unrelated one. The grids live in `src/lib/` with the
other drawing primitives, and `pixelInk` binds their keys to the tokens like every other sprite.

The seal is not rotated. A tilt would blur a pixel seal into an anti-aliased smear, which is the
opposite of what the rest of the livery does; it hangs centred instead, at the foot of the
colophon where a document is stamped.

### Numerals

The buds are numbered in Roman numerals, cast in the title face, because the page is a document
of the order and the rubric — the heading, the numbers, the colophon — is written in red, as a
manuscript's is. The ordered list still carries the count, so a reader who cannot see the
numerals hears "3 of 10".

## Risks

- The pencil-thin `--px` (3px) drives the rolls' height and the ruling; on a very wide screen the
  scroll stays 760px and the rolls are unchanged, so there is one appearance, not several.
- The seal's cords are hidden behind the foot roll by overlap rather than by masking. If the
  roll's height token changes, the seal's `top` must change with it; both read `--px`.
