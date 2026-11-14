## Why

The lobby lists everyone who has enlisted alike. The order's lore gives some of them standing: those
who have worn a crown, the Faxepave, and the canonised former popes. A returning king who looks
like a first-timer is a missed welcome.

## What Changes

- **Three honours**: `champion` for anyone the chronicle shows crowned (Faxekonge, Faxedronning,
  Erkekonge) at an official Faxing, `pope` for the sitting Faxepave, `saint` for the canonised former popes and
  patriarchs. A person with more than one shows the highest: saint, then pope, then champion.
- **Shown in the lobby list and the suggestions**: a glyph, a text label and a distinct border, so
  colour is not the only signal.
- **Champions are derived, popes and saints are lore**: the first from the chronicle on every render,
  nothing stored; the others from a short table in `src/lib/honours.ts` taken from `Lore.tsx`.

## Capabilities

### Modified Capabilities
- `room-lobby`: an attendant entry carries the honour of its person.

## Impact

- New: `src/lib/honours.ts`, `src/lib/honours.demo.ts` (in `check:rules`).
- `src/components/RoomLobby.tsx`, `src/App.css`. No server change, no schema change, no dependency.
