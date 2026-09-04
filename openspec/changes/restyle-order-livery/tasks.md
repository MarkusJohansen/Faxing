## 1. The token set

- [ ] 1.1 Replace the twenty-two palette custom properties in `src/index.css` with the
  five-band token set from `design.md`. Keep the role-named form (`--bone`, `--iron-lit`),
  not hue names. Delete `--brown-*`, `--gold-*`, `--red-*`, `--cream`, `--parchment` (old),
  `--silver*`.
- [ ] 1.2 Replace the four font custom properties with the four roles: `--font-sigil`,
  `--font-plaque`, `--font-figure`, `--font-prose`. Give each a real fallback stack; the
  pixel faces fall back to a generic serif, not to nothing.
- [ ] 1.3 Add a comment above the token block stating the five bands and the one meaning
  each carries, so a later addition has somewhere to be justified. Name the rule that red
  and brass are reserved.
- [ ] 1.4 Replace the two warm radial washes and the diamond tile data URI on `body` with
  the masonry lattice data URI. Keep it inline; add no request.
- [ ] 1.5 Grep the whole of `src/` for colour literals (`#`, `rgb(`, `hsl(`) and confirm
  every one that remains is inside the token block or an SVG asset. This is the check for
  the "every colour is a token" scenario and it is the only mechanical check in the change.

## 2. Fonts

- [ ] 2.1 Re-cut the Google Fonts link in `index.html`: drop `MedievalSharp` and
  `Cinzel Decorative`, add `Jacquard 24` and `VT323`, narrow `Cinzel` to weights 400 and
  700, and drop the `IM Fell English` italic axis if nothing uses it.
- [ ] 2.2 Record the request's transfer size before and after in `findings.md`. The
  proposal claims the budget does not grow; either the number supports that or the claim
  gets corrected.
- [ ] 2.3 Point every rule in `App.css` at the correct font role. Confirm by grep that no
  numeral-bearing rule (clock, timings, rank, counts, percentages) resolves to
  `--font-prose` or `--font-sigil`.

## 3. The atmospheric layer

- [ ] 3.1 Build the layer as a single `body::after` — fixed, `inset: 0`,
  `pointer-events: none`, above content. One element, page level. Comment that per-component
  application compounds as panels nest, which is the failure being avoided.
- [ ] 3.2 Scanlines: `repeating-linear-gradient`, 3 px pitch, `--bone` at low alpha.
- [ ] 3.3 Vignette: `radial-gradient` to `--void`, transparent through the middle two
  thirds.
- [ ] 3.4 Noise: static `feTurbulence` SVG data URI at low opacity. Static — comment that
  an animated field repaints against the board's twice-per-second tick.
- [ ] 3.5 Flicker: one `opacity` keyframe, 4.2 s period, 0.985 → 1.0. Comment the bound and
  why it exists — the 3–60 Hz photosensitive band, worst near 15–20 Hz, which is exactly
  where a convincing CRT flicker sits. This comment is not optional; it is the reason the
  value is not "tuned by eye".
- [ ] 3.6 Curvature: `border-radius` plus an inset `box-shadow` on the layer only. Do not
  transform the content. Comment that warping content moves hit areas away from where
  elements are drawn.
- [ ] 3.7 Do **not** set `will-change`. Comment why: promoting a full-viewport layer for a
  4-second opacity drift costs more than it saves on the device this runs on.
- [ ] 3.8 Bloom and separation as warm `text-shadow`/`box-shadow` on bright elements only —
  the clock, plaques, brass edging — one `--faxe-lit` and one `--brass-lit` offset. No
  filter, no channel split, no blur on any glyph.
- [ ] 3.9 `@media (prefers-reduced-motion: reduce)`: `animation: none` on the flicker and on
  every other animation in the file. Verify by grep that no `animation` or `transition`
  survives the query unaccounted for.
- [ ] 3.10 `@media (prefers-contrast: more)`: `display: none` on the layer and remove the
  bloom shadows.
- [ ] 3.11 Confirm no control, setting or stored preference was added for either. Media
  queries only.

## 4. Panels, controls and plaques

- [ ] 4.1 Rewrite the panel treatment: void-band ground, chunky iron border, riveted
  corners, two-tone bevel. Remove every `box-shadow` used as a soft drop shadow, every
  blur, every gloss gradient, and every `border-radius` beyond a single pixel step.
- [ ] 4.2 Rewrite the control treatment across the five states in the spec's table — rest,
  hover, press, disabled, focus. Whole-pixel movement only; no elastic or overshooting
  easing.
- [ ] 4.3 Give focus a visible brass ring, distinct from hover, on every interactive
  element. Confirm nothing suppresses an outline.
- [ ] 4.4 Add the `Plaque` presentational component: an inscription in `--font-plaque`,
  letter-spaced capitals, a thin rule, and a mark slot at each end taking the 16 × 16 sigil.
- [ ] 4.5 Wire the five plaques — `REGISTRUM` in `Registration.tsx`; `VIGILIA`, `ARENA`,
  `CHRONICA`, `HESTEMANN` in `Arena.tsx` — **above** the existing Danish headings. Do not
  replace a Danish string.
- [ ] 4.6 At the narrowest supported width, drop the plaque end marks rather than shrinking
  them. Ornament yields before the inscription does.

## 5. Cards

- [ ] 5.1 Rewrite the card as a document leaf: parchment or plate ground, decorative
  border, emblem, name as title, title as rank line, metadata stamped in `--font-figure`.
- [ ] 5.2 Replace the four title colour classes with the metal-and-charge table from
  `design.md`. The two crowns differ by filled versus voided charge **and** by metal;
  `Faxeridder` is iron; `Hestemann` is unlit with no bevel.
- [ ] 5.3 Verify the four titles are distinguishable from one another in greyscale and with
  the atmospheric layer withdrawn. This is the `arena-board` requirement this change nearly
  broke by removing the pink — if it fails, the charges are wrong, not the palette.
- [ ] 5.4 Derive the card angle from a byte-wise hash of the contestant `id`, mapped into
  ±0.8°. Comment that the angle must not be random because the board re-renders twice a
  second and a re-rolled angle makes it tremble, and that the hash must not index fixed
  character positions because the id's shape is not guaranteed.
- [ ] 5.5 Confirm a rotated card's finish and forfeit controls register a press anywhere in
  their visible bounds, at two zoom levels on a crowded board.
- [ ] 5.6 Ceremonial treatment on the crowns only: animated brass edging, badge sigil as a
  faint watermark, illuminated border. Confirm `Faxeridder` and `Hestemann` receive none of
  it.

## 6. The clock and the gauge

- [ ] 6.1 Set every numeral in `GlobalTimer.tsx` in `--font-figure`. Confirm the layout does
  not shift as digits change — this is what the monospaced face is for.
- [ ] 6.2 Urgent state: pulse in the red band. Then grep the stylesheet and confirm nothing
  else carries a repeating attention animation. The crowns' brass edging is continuous
  ornament and must not read as a pulse.
- [ ] 6.3 Expired state: the terminal declaration, distinct from urgent, no pulse.
- [ ] 6.4 Replace `BeerProgress` with the iron-framed vessel gauge. Keep the props exactly
  as they are — it already receives the global `elapsedMs` and that is correct.
- [ ] 6.5 Add the caption naming the contest's hour. State in a comment that the gauge is
  the shared clock, that the system records nothing per contestant, and that the caption
  exists because a filling vessel implies a measurement the old bar only hinted at.
- [ ] 6.6 Alarm treatment on the gauge past four-fifths of the hour, consistent with the
  clock.

## 7. Header, motto, footer

- [ ] 7.1 Replace the header byline with `IN FAXE VERITAS` in `--font-sigil` on a parchment
  scroll. Delete the brewery name, the founding year and the country.
- [ ] 7.2 Place the achievement sigil in the header, replacing the two `⚔` ornaments.
- [ ] 7.3 Set the wordmark in `--font-sigil`. If it proves unreadable, fall back to
  letter-spaced `Cinzel` capitals and keep the blackletter on the motto only — record which
  was chosen, and why, in `findings.md`.
- [ ] 7.4 Keep the moderation notice in Danish, in `--font-prose`, in `--bone`, on a footer
  plaque. Do not translate it, do not set it in blackletter, do not reduce it to an emblem.
- [ ] 7.5 Confirm the motto does not animate.

## 8. The chant

- [ ] 8.1 Make `GLORIA FAXEM!` the start control's label in `Registration.tsx`: a
  wax-sealed plate, blood ground, brass edging, the most emphatic element on the screen.
  Keep the existing empty-roster hint beneath it.
- [ ] 8.2 Confirm the disabled treatment still applies with an empty roster, and that the
  control is still genuinely disabled and not merely styled so.
- [ ] 8.3 Add the acclamation to `Arena.tsx`: a `useRef` holding the crowns already
  acclaimed, plus short-lived state for the crown being acclaimed, cleared by a timeout.
  Comment that titles recompute on every tick, so firing on "a crown exists" raises the
  banner 7,200 times an hour — that is the failure the ref prevents.
- [ ] 8.4 Render the banner `position: fixed`, `pointer-events: none`, anchored clear of the
  card grid, bearing the badge sigil. It must not need dismissing.
- [ ] 8.5 Do not persist the acclamation. A reload mid-hour must not replay the ceremony.
- [ ] 8.6 Verify: a `Faxekonge` is acclaimed once; a later `Faxedronning` is acclaimed once;
  neither repeats; every finish and forfeit control stays pressable throughout.
- [ ] 8.7 Confirm the chant appears nowhere else — no other control, heading or state.

## 9. The sigil

- [ ] 9.1 Draw `src/assets/sigil-mark.svg` at 16 × 16 first: a shield silhouette with the
  can's red band. Confirm it is recognisable at 16 px and still sharp scaled up into a
  plaque end.
- [ ] 9.2 Draw `src/assets/sigil-badge.svg` at 32 × 32: shield and can within a plain
  border. No supporters at this size.
- [ ] 9.3 Draw `src/assets/sigil.svg` at 64 × 72: two rampant lions in brass supporting a
  bone shield charged with the can, crossed iron swords behind, red acanthus mantling, a
  parchment scroll beneath. This is the longest task in the change; it is last so that
  nothing is blocked on it.
- [ ] 9.4 Each file: `viewBox` on its own integer grid, `shape-rendering="crispEdges"`,
  integer-aligned `<rect>` runs. No `<path>` with fractional coordinates, no filter, no
  gradient.
- [ ] 9.5 Confirm each asset uses at most twelve colours and every one is a token value from
  `design.md`.
- [ ] 9.6 Draw each size by hand. Do not produce a smaller one by scaling a larger one — a
  resampled lion is a smudge.
- [ ] 9.7 Confirm the depiction is original: no brewery trade dress, no label artwork, no
  existing historical or contemporary insignia reproduced.
- [ ] 9.8 Add the 16 × 16 mark as the favicon in `index.html`.

## 10. Verification

- [ ] 10.1 Walk the interface in four states — empty roster, contest running with a crowded
  board, a crown just awarded, the hour expired — at a phone width and a desktop width, with
  the atmospheric layer both applied and withdrawn. Eight passes. Record what broke.
- [ ] 10.2 Measure contrast **through the composited layer**, not on token values: sample a
  screenshot. Body text at or above 7:1; every other text and meaningful mark at or above
  4.5:1. Record the measured figures in `findings.md`.
- [ ] 10.3 Confirm no region scrolls horizontally at a phone width, and every plaque is
  legible there.
- [ ] 10.4 Confirm every state, distinction and signal survives the layer being withdrawn —
  four titles, urgent clock, expired clock, disabled control, in-progress card. Nothing may
  be carried by bloom, flicker, noise or vignette alone.
- [ ] 10.5 Confirm no animation in the interface repeats at between 3 and 60 Hz.
- [ ] 10.6 `npm run typecheck` and `npm run build` pass.
- [ ] 10.7 Confirm `package.json` is unchanged — no dependency was added.
- [ ] 10.8 Confirm no behaviour changed: the five baseline specs in `openspec/specs/` still
  describe the interface exactly. Walk each of the three requirements cited in the proposal
  and confirm it still holds.

## 11. Record

- [ ] 11.1 Write `findings.md`: the measured font transfer size against the "no growth"
  claim; the composited contrast figures; whether the greyscale test of the four titles
  passed on the first set of charges; whether the wordmark stayed blackletter; whether the
  card tilt seamed at any zoom level. Include the results that went against the design —
  those are the ones worth having.
