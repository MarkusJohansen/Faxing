## 1. Selection rule

- [x] 1.1 Move `formatTime` and `formatDate` from `EventView.tsx` (and `History.tsx`'s unguarded `formatDate`) to `src/lib/format.ts`; import them there
- [x] 1.2 Add `reigningTribute(events)` to `src/lib/tribute.ts`: latest official by date (ties: first listed), crowns in order Faxekonge, Faxedronning, Faxemonark, `null` when none
- [x] 1.3 Add `src/lib/tribute.demo.ts`, assertions run under `node`: unofficial later event ignored; knights and Hestemann excluded; crown order fixed; no fallback when the latest official crowned nobody; empty list → null
- [x] 1.4 Make `npm run check:rules` run both demos

## 2. Panel

- [x] 2.1 Add `src/components/ReigningTribute.tsx` (props only): the Faxing's name and date, then one row per crown with title, name and `m:ss`; old-Norwegian copy
- [x] 2.2 Render it in `App.tsx` between `.home-stats` and `RoomsPanel`, using a value memoised on `events`
- [x] 2.3 Style it in `App.css` with existing tokens from `index.css`, and no hex literals

## 3. Verify

- [x] 3.1 `npm run typecheck`, `npm run build`, `npm run check:rules` pass
- [x] 3.2 `openspec validate reigning-tribute --strict` and `openspec validate --specs --strict` pass
- [x] 3.3 Walk it by eye at phone and desktop width: no official Faxing (no panel), one crown, all three crowns, a newer unofficial Faxing present
