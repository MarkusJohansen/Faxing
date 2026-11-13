## 1. Foundations

- [x] 1.1 Replace the token block in `src/index.css` with the night palette, type and step tokens
- [x] 1.2 Swap the Google Fonts request in `index.html` to Jacquard 24, Jersey 20, VT323
- [x] 1.3 Base styles: banded sky, dither, font smoothing off, inset focus ring, reduced-motion kill switch

## 2. Night scene

- [x] 2.1 Add `src/lib/pixelArt.ts` (character rows to merged SVG rect runs)
- [x] 2.2 Add `src/components/NightScene.tsx` (moon, spires, bridge, lanterns), `aria-hidden`
- [x] 2.3 Mount the scene in the header in `App.tsx`; remove the two sword ornaments

## 3. Stylesheet

- [x] 3.1 Rewrite header, nav, footer, panels, buttons and inputs in `src/App.css`
- [x] 3.2 Rewrite home, lore and registration screens
- [x] 3.3 Rewrite the board: sticky clock with three states, section titles, search, reset
- [x] 3.4 Rewrite cards: crown, queen, knight, in-progress, headstone; candle progress (`beer-*` to `candle-*` in `ContestantCard.tsx`)
- [x] 3.5 Rewrite chronicle, event view, results table and admin tools
- [x] 3.6 Phone layout under 640px: one-row clock, 44px controls, no horizontal scroll at 360px

## 4. Verification

- [x] 4.1 `npm run typecheck` and `npm run build` pass
- [x] 4.2 No hex/rgb/hsl literal outside the token block; no non-zero `border-radius`; no blurred `box-shadow`
- [x] 4.3 Compute contrast for each text/surface token pair and record in `findings.md`
- [x] 4.4 Walk by eye from screenshots: home and lore (360px, 1280px), empty roster (360px), running board with crowns (360px, 1280px), urgent clock and expired hour (360px)
- [ ] 4.5 Walk the chronicle with events, the event view and the Faxepave admin tools (needs the events API and database; not run here)
- [x] 4.6 Check `æøå` and `Æ Å Ø` render in the body face, `Æ` in the heading face, `ø` in the numeral face
- [ ] 4.7 Check reduced motion stops all animation, and keyboard focus is visible on notched controls (not checked in a browser)
- [ ] 4.8 Try it on a real phone: tap targets, sticky clock under mobile Safari's toolbar
- [x] 4.9 `openspec validate moonlit-gothic-livery --strict` passes
