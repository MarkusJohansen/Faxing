## Why

The interface wears a brewery's livery: warm brown, polished gold, a faint cross-tile and
soft-shadowed "scroll" panels set in Cinzel. It reads as promotional material for a real
company, and as a generic "medieval" template rather than an identity of its own.

The order wants a look with a place in it: an **8-bit gothic night**. Moonlight over spires
and a stone bridge, a muted green palette, and warm lantern light as the only warmth on
screen. This change replaces the visual layer with that, and reshapes the layout around it.

It **supersedes `restyle-order-livery`** (black, bone and can-red heraldry on a CRT). That
change was specified on `main` but never merged; its implementation lives on an unmerged
branch the owner chose not to build on. It should be archived unbuilt, or deleted, once this
one lands.

## What Changes

- **A new visual system, `moonlit-livery`**: a teal-green night palette in stepped pixel
  bands, ranging from green-black stone to pale moon-green highlights. Lantern orange is the
  only warm colour and is reserved for light and glory: flames, the crowns and the primary
  action. A dulled
  blood red marks failure. Every colour resolves through a token in `index.css`.
- **Pixel rendering as a rule**: no rounded corners, no soft blurred shadows, no smooth
  gradients. Edges are stepped (pixel-notched corners, hard offset shadows), shading is
  dithered, and illustrations are drawn on an explicit pixel grid with `crispEdges`.
- **A night scene**: a pixel-art banner with a moon, gothic spires, a bridge and lanterns,
  painted onto a character grid in a component and rendered as SVG. It heads the app, over a fixed banded
  sky. Lantern flicker is the only motion, and it stops under `prefers-reduced-motion`.
- **Typography re-cast onto three families**: pixel blackletter (Jacquard 24) for the
  wordmark and headings, a pixel sans (Jersey 20) for body and controls, and a terminal
  face (VT323) for every numeral. These replace the four families loaded today (Cinzel,
  Cinzel Decorative, IM Fell English and MedievalSharp, the last one unused), all from the
  same Google Fonts host.
- **Layout**:
  - The header becomes the scene banner with the wordmark set into it.
  - The nav becomes tabs on the bridge parapet.
  - On the board, the contest clock sticks to the top while the operator scrolls.
  - A `Hestemann` card is shaped as a headstone.
  - The crowns glow lantern-warm.
  - The per-card progress bar becomes a candle burning down. It is the shared hour, so a
    candle reads as *time*, not as beer drunk. The old "beer fill" styling contradicted the
    `arena-board` spec on exactly this point.
- **Copy**: the brewery byline `Faxe Bryggeri · Grundlagt 1901 · Danmark` is removed, and
  the interface copy moves from Danish to old-fashioned, readable Norwegian (the owner's
  call, made after the restyle was built). Dates format as `nb-NO`. The five titles are
  names and are unchanged, as are stored event names.
- **Not changed**: every rule, duration, title, persisted shape, API call and validation.
  No behaviour is added or removed. No dependency is added.

## Capabilities

### New Capabilities
- `moonlit-livery`: the visual contract. It covers the palette and its semantic roles, the
  pixel-rendering rules, the night scene, typography, title treatments, the clock's states,
  layout at phone and desktop width, reduced motion, and the readability floor.

### Modified Capabilities
<!-- None. The existing visual requirements (distinct title treatments, urgent clock state,
     progress-not-a-measurement) are satisfied in a new way, not changed. -->

## Impact

- `src/index.css` (tokens, base), `src/App.css` (rewritten), `index.html` (font request).
- New `src/components/NightScene.tsx` and `src/lib/pixelArt.ts` (grid-to-SVG helper).
- `App.tsx`, `ContestantCard.tsx`, `GlobalTimer.tsx`: markup and class changes only, for
  the banner, the headstone and the candle. No state, props or logic change.
- No dependency, network host or storage change.
