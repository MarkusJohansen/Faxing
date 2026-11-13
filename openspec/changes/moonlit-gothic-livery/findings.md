# Findings

Measured or observed on 2026-11-13, headless Chrome on macOS, dev server, at 360×740 and
1280×800 (device scale 2). Screens were checked **by eye from screenshots**; there is no
test suite.

## Pixelify Sans was unreadable for names (font replaced)

The first body face was Pixelify Sans. With font smoothing off, its capital **B** reads as
a **G**: the seeded contestant "Bjørn" displayed as "Gjørn", and the byline as "FAXE
GRYGGERI". A name that reads wrong on a card is a wrong tap waiting to happen, so the face
was dropped.

Replaced with **Jersey 20**. Checked by eye: `B` is unambiguous and `æ ø å Æ Ø Å` render
in the face itself ("Søren Ærlig", "Åse Bjørnsdatter", "Frøya Østergård"), not a fallback.
Jersey 20 ships one weight and has a small x-height, so the base size is 1.25rem and
`font-synthesis: none` stops the browser smearing a faux bold onto it.

Jacquard 24 (headings) rendered `Æ` in "Ærens Hal" correctly. VT323 rendered `ø` in
"Forløpt". Not checked: `Å` and `Ø` capitals in Jacquard 24, which no current heading uses.

## `overflow-wrap: anywhere` split names mid-word

"Åse Bjørnsdatter" broke as "Bjørnsdatte / r" on a 230px card, because `anywhere` lets the
flex item shrink below a word. Changed to `break-word` with `min-width: 0`.

## A 30-character name widened the whole page on a phone

Probe: a board seeded with two 30-character names with no spaces (the roster's maximum),
at 320px and 360px. `document.documentElement.scrollWidth` was 573 in a 360px viewport: the
phone grid's bare `1fr` track grew to fit the unbroken word. With `minmax(0, 1fr)` the same
probe gives 320/320, 360/360 and 1280/1280. In the same probe the smallest card button, nav
tab and search field measured 44px tall, and the clock's top edge stayed at 0 after
scrolling 600px.

## A button does not inherit the page font

The byline sits inside `.brand-button` and rendered in Arial until `font: inherit` was set.

## Contrast (WCAG 2 ratio, computed from the token values)

| Text | Surface | Ratio | 4.5:1 |
|---|---|---|---|
| moon-100 | stone-700 | 9.53 | pass |
| moon-50 | stone-700 | 12.03 | pass |
| mist-200 | stone-700 | 6.63 | pass |
| mist-200 | stone-600 | 5.34 | pass |
| mist-200 | night-800 | 8.59 | pass |
| mist-200 | night-700 | 7.74 | pass |
| mist-200 | night-900 | 9.29 | pass |
| mist-200 | ember-700 | 5.87 | pass |
| moss-300 | night-800 | 5.85 | pass |
| moon-100 | stone-600 | 7.68 | pass |
| moon-50 | stone-500 | 7.15 | pass |
| moon-50 | stone-400 | 4.97 | pass |
| moon-50 | ember-700 | 10.66 | pass |
| moon-50 | blood-500 | 7.32 | pass |
| moon-50 | blood-700 | 13.82 | pass |
| flame-200 | ember-700 | 8.97 | pass |
| flame-200 | stone-700 | 10.13 | pass |
| lantern-300 | stone-600 | 5.45 | pass |
| lantern-300 | night-800 | 8.78 | pass |
| blood-300 | night-700 | 4.90 | pass |
| blood-300 | blood-700 | 4.82 | pass |
| night-900 | lantern-400 | 6.72 | pass |
| night-900 | moon-100 | 13.37 | pass |

Two pairings failed and were removed from use:

| Text | Surface | Ratio | Was used for | Now |
|---|---|---|---|---|
| moss-300 | stone-600 | 3.63 | disabled button | moss-300 on night-800 (5.85) |
| night-900 | stone-400 | 3.39 | the `Søk` label | moon-50 on stone-500 (7.15) |

`moss-300` is safe only on `night-*` surfaces. It is still used for input placeholders,
which sit on `night-800`.

The table covers pairs by token. It does not prove every rule in `App.css` uses a listed
pair; that was read, not machine-checked.

## Outer shadows do not survive `clip-path`

The first design gave notched boxes a zero-blur `drop-shadow`. `clip-path` is applied after
`filter`, so the shadow is clipped away. Depth is instead a thicker dark bottom border.
Same cause for the headstone: a border cannot follow a clip-path's steps, so the card is
the outline colour and a `::before` inset by one pixel is the face.

## Scene scaling

The scene is 192×64. It is drawn at exactly 3× (192px tall, phones) and 4× (256px, from
900px wide), so its pixels stay square; `slice` scaling to arbitrary widths cut the moon off
at 1280px. Wider than the scene, the sky bands and bridge deck continue as CSS bands. The
dithered seams stop at the scene's edge there; visible if you look for it.

## Second pass: defects fixed, board re-laid (same day)

Fixed to match the existing specs, which already said what was right (no spec change):

- **D1, late finish.** `rankContestants` now treats a finish at or after the deadline as
  `Hestemann`; `markFinished` refuses a tap after the hour; the card offers finish and
  forfeit only while the contestant has no title. Seeded at 62 minutes: zero finish
  controls on the four headstones.
- **D3.** `markDisqualified` no longer clears `finishedAt` and ignores a finisher.
- **D4.** `newId()` falls back to `crypto.getRandomValues` where `randomUUID` is missing
  (plain HTTP on a LAN address). Not exercised from a phone here.
- **Ranks renumbered under a search** (hard rule 5): `Arena` ranked by index in the
  *filtered* list. Ranks now come from the whole roster. Not exercised in a browser.
- **Per-card urgency** past four-fifths of the hour now exists (the wax turns warm). Seen at
  83%.
- **Moderation notice** restored to the footer, in Norwegian.

The titling rules moved to `src/lib/ranking.ts` with a runnable check,
`npm run check:rules`: 7 assertions, all passing, two of them the D1 cases.

Layout, by eye at 360px and 1280px: the board's header keeps only the lower half of the
scene (96px instead of 192px on a phone); the hall is one dense row per finisher; headstones
sit two abreast on a phone. A first three-column row grid squeezed names into wrapping
mid-word ("Bjørnsd/atter") because the undo button set the width of the time column; a
fourth column fixed it.

Left as is: `Angre Fullbragt` and the Faxepave edit tools still clear a recorded
`finishedAt` on purpose. After the hour, undoing a real finish makes that contestant a
`Hestemann` with no way back short of the admin tools.

## Third pass: motion

The scene is now painted in layers (sky, two star sets, clouds, town, glow, flames) so each
can move alone. Measured in headless Chrome via `document.getAnimations()`:

- Home: 13 running animations (`twinkle, drift, fly, flap, fly-back, glow, flicker`).
- Board at 50 minutes with a king and a queen: 17, adding `blink, king-glow, queen-glow`.
- With `prefers-reduced-motion: reduce` emulated: **0** running.
- No horizontal scroll at 360px or 1280px with the animations on.

Seen in a still screenshot only: a bat beside the moon and the cloud layer displaced. The
motion itself was **not watched**; a headless still cannot show whether it reads as alive
or as busy. That needs a person and a screen.

A star layer at `z-index: -1` would have been painted *under* `body`'s own background and
never seen (block backgrounds paint after negative z-index children). The stars sit at
`z-index: auto` and `#root` is lifted to `z-index: 1` instead.

Not measured: battery or frame cost over an hour on a phone. Everything animated is
`opacity`, `transform` or `border-color` on a handful of elements, which is cheap in
principle, but that is reasoning, not a measurement.

## Fourth pass: torches and more living pixel art

Added: two torches at the bridge ends (three flame frames each, on different beats), a
cloaked wanderer with a lantern walking the bridge, fog through the arches, a guttering
window, and a footer graveyard with three swarms of fireflies. Sprites small enough to draw
by hand are typed as rows (`rowsToGrid`); the shared ink table moved to `src/lib/pixelInk.tsx`.

- 28 running animations on the home screen; 0 with reduced motion emulated.
- No horizontal scroll at 360px or 1280px.
- Seen in stills: both torches, the fog, a bat on the moon, the graveyard. **Not seen**: the
  wanderer (behind the wordmark at the moment sampled) and the fireflies (dark in that
  frame). Their animations are running; what they look like is unchecked.
- The wanderer passes *behind* the wordmark for the middle third of his walk, since the
  wordmark is page content over the scene. He is visible only toward the ends of the bridge.
- The torches are drawn at the scene's pixel size (`--scene-h / 64`), not the interface's
  3px, so they match the bridge they stand on at both the 3× and 4× scene.

## Pre-existing, seen while verifying, not changed here (first pass)

- After the hour expires, cards for contestants who never finished still show `Fuldbragt!`
  and `Gav Op`. That is defect D1's surface (a finish after expiry), not a styling fault.
- `ContestantCard` never applies the "urgent past four-fifths" state that `arena-board`
  requires of the per-card progress. The old stylesheet had an unused `.beer-urgent` rule
  for it. Not added here because it is logic.
- The header byline still names the brewery, and the footer has no moderation notice
  although `CLAUDE.md` rule 12 says it stays.
- `CLAUDE.md` and `ARCHITECTURE.md` describe an app with no backend and no `fetch`; the
  code on `main` has an events API, an admin login and three more screens.
