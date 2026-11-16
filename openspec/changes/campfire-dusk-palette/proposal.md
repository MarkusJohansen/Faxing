## Why

The moonlit livery reads green and cold. The reference for the next look is a pixel-art
campfire at dusk: an indigo night, slate-blue mountains, steel-silver armour, a sky that
burns plum to amber at the horizon, and a campfire as the brightest thing in the frame.

## What Changes

- Retune every token in `src/index.css`: night to deep indigo, stone to slate blue,
  moonlight to steel and silver, lantern to campfire orange and yellow, blood to a cooler
  crimson. Token names and roles are unchanged, so no component rule moves.
- Add three `--dusk-*` tokens for the header sky, used by `NightScene` (new inks `P`,
  `Q`, `R`) and the header's flat sky continuation in `App.css`.
- Narrow "warmth is scarce" to the board: the header sky may be warm, cards may not.

## Impact

- `src/index.css`, `src/App.css`, `src/lib/pixelInk.tsx`, `src/components/NightScene.tsx`.
- No behaviour, copy, or dependency change.
