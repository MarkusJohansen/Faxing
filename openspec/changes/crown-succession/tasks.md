## 1. Selection rule

- [x] 1.1 Add `successionLines(events)` to `src/lib/succession.ts`: three crown lines in the order king, queen, monarch; official Faxinger only; `Erkekonge` fills the king's line; oldest first, ties resolving the way `reigningTribute` does
- [x] 1.2 Mark a reign `reigning` only from the latest official Faxing, and only for the crown it crowned
- [x] 1.3 Add `src/lib/succession.demo.ts` with the assertions that guard the silent failures: an unofficial Faxing excluded, `Erkekonge` admitted, a knight excluded, repeat winners listed twice, the reigning mark absent when the latest Faxing crowned nobody, ties matching the tribute
- [x] 1.4 Make `npm run check:rules` run the new demo

## 2. The screen

- [x] 2.1 Add `src/components/CrownSuccession.tsx` (props only): three threaded lines, each node a card with date, Faxing, holder, `m:ss`, the `Regjerende` mark and any legacy title; a node opens its Faxing
- [x] 2.2 Add the `succession` screen to `src/types.ts` and `src/App.tsx`, with a nav tab and a memoised selector
- [x] 2.3 Style the lines in `App.css` on the `.chronology` thread pattern and existing tokens; no hex literals
- [x] 2.4 Give each shown line an empty-line sentence, and the screen an empty state when no official Faxing has crowned anyone
- [x] 2.5 Let the nav wrap instead of squashing at phone width, now that it carries six tabs

## 3. Verify

- [x] 3.1 `npm run typecheck`, `npm run check:rules`, `npm run build` pass
- [x] 3.2 `openspec validate crown-succession --strict` and `openspec validate --specs --strict` pass
- [x] 3.3 Walk the screen at phone and desktop width: no official Faxing, one king, a queen, a monarch, a repeat winner, a legacy `Erkekonge`, a Faxing whose node opens

## 4. The monarch's line waits for a monarch

- [x] 4.1 Hide Monarkrekka while it holds no reign, by `shownLines` in `src/lib/succession.ts`; the king's and queen's lines stay shown even when empty
- [x] 4.2 Guard it in `src/lib/succession.demo.ts`: an uncrowned monarch's line hidden, a crowned one shown
- [x] 4.3 `npm run typecheck`, `npm run check:rules` and `npm run build` pass, and `openspec validate crown-succession --strict` passes

## 5. The founding of den andre orden

- [x] 5.1 `SECOND_ORDER_FOUNDED` (10 October 2024, noon UTC) and `lineNodes` in `src/lib/succession.ts`; the dashed rule drawn in `CrownSuccession.tsx`
- [x] 5.2 Style the rule and its label in `App.css` from the existing tokens, reaching back across the thread's hairline; no hex literal
- [x] 5.3 Guard it in `src/lib/succession.demo.ts`: the day, the place between the orders, no rule in a line that begins with the new order, the rule closing a line the new order has not reached, and a reign on the founding day below the rule
- [x] 5.4 `npm run typecheck`, `npm run check:rules` and `npm run build` pass, and `openspec validate crown-succession --strict` passes
