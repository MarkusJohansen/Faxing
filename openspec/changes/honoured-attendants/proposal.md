## Why

The lobby and the chronicle list everyone alike. The order's lore gives some of them standing: those
who have worn a crown, the Faxepave, and the canonised former popes. A returning champion who looks
like a first-timer is a missed welcome, and a results page is where the order reads its own history.

## What Changes

- **Three honours**: `champion` for anyone the chronicle shows crowned (Faxekonge, Faxedronning,
  Erkekonge) at an official Faxing, `pope` for the sitting Faxepave, `saint` for the canonised former popes and
  patriarchs. A person with more than one shows the highest: saint, then pope, then champion.
- **Shown in the lobby list, the suggestions and every results page**: a glyph, a text label and a
  distinct edge, so colour is not the only signal.
- **In the right order**: a results page works the honours out as of that Faxing. A champion is
  someone who won at an official Faxing held strictly before it; the pope and the saints show on
  every page.
- **Champions are derived, popes and saints are lore**: the first from the chronicle on every render,
  nothing stored; the others from the lore, named as data in `src/data/people.json`.

## Capabilities

### New Capabilities
- `chronicle-results`: what a Faxing's results page shows about who is on it.

### Modified Capabilities
- `room-lobby`: an attendant entry carries the honour of its person.

## Impact

- New: `src/lib/honours.ts`, `src/lib/honours.demo.ts` (in `check:rules`), `src/components/HonourMark.tsx`.
- `src/components/RoomLobby.tsx`, `src/components/EventView.tsx` (takes the whole chronicle),
  `src/App.tsx`, `src/App.css`; the people are named in `src/data/people.json`, never in code.
- No server change, no schema change, no dependency.
