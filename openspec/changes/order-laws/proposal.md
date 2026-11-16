## Why

The order's law has lived only in conversation and in the lore's mention of two stone tablets
carried by a carrier pigeon to Backlog. A contest whose whole rule set is the ten buds decides
titles from finishers and forfeits, and the people in the room are never shown the words the
titles come from. It is also the one thing in the app worth printing and pinning to a wall.

The law is not a feature of a contest, so it does not belong to a room, a Faxing, or the
chronicle. It is one page, always the same, that anyone can open.

## What Changes

- **A page of laws**, reached from the navigation on every screen: the ten buds, numbered, in
  the canon's words, including their older spellings.
- **It is a scroll, not a slab.** The sheet is paper between two rolls, and it is the only
  screen in the app that is not stone. Parchment, ink, brass, steel and wax join the palette as
  tokens of their own.
- **The order's arms and the Faxepave's seal hang on it.** The arms sit at the head of the
sheet; the seal hangs from the foot roll by its cords. Both are pixel art drawn from the
palette tokens, so neither owns a colour.
- **Nothing is fetched.** The page is static: no request, no storage, no dependency.

## Capabilities

### New Capabilities
- `order-laws`: the ten buds, shown as the page the order keeps them on.

## Impact

- Client only. `src/types.ts` gains the `laws` screen id; `src/App.tsx` gains a nav button and a
  render line; a new `src/components/TenBuds.tsx` holds the page and the canon's text; a new
  `src/lib/orderArms.ts` holds the two ink grids; `src/lib/pixelInk.tsx` binds ten ink keys to
  ten new tokens in `src/index.css`; `src/App.css` gains the scroll, and phone rules for it.
- Server, Postgres, `api/` and `server/` are untouched. No new dependency.
