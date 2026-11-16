## 1. The materials
- [x] 1.1 `src/index.css`: parchment, ink, brass, steel and wax tokens in one scriptorium group
- [x] 1.2 `src/lib/pixelInk.tsx`: ten ink keys (`P G D S T K R W U Q`) bound to them
- [x] 1.3 `src/lib/orderArms.ts`: `ORDER_ARMS` (128×128) and `PAPAL_SEAL` (32×43) as ink grids,
      each with the ink legend beside it

## 2. The page
- [x] 2.1 `src/components/TenBuds.tsx`: the ten buds verbatim, the arms, the rubric, the colophon,
      the ordered list with Roman numerals
- [x] 2.2 `src/types.ts`: the `laws` screen id
- [x] 2.3 `src/App.tsx`: a "10 Bud" nav button between Historie and Loftet, and the render line

## 3. The scroll
- [x] 3.1 `src/App.css`: the sheet, its ruling, the two rolls and their caps, the arms, the rubric,
      the canon list and the colophon
- [x] 3.2 The seal hangs from the foot roll, inside the room the scroll reserves below itself
- [x] 3.3 Phone rules: a narrower gutter for the numbers, a page margin kept for the sheet, the
      title scaled to fit

## 4. Before it is called done
- [x] 4.1 `npm run typecheck`, `npm run check:rules`, `npm run build` exit 0
- [x] 4.2 `openspec validate order-laws --strict` and `openspec validate --specs --strict` pass
- [ ] 4.3 The page looked at on a phone and at desktop width, at a 360-pixel width and a wide
      one. This one needs a human eye: the art was drawn blind, so what it looks like is a guess
      until somebody sees it.
