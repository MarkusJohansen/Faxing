## Why

A crown won at an official Faxing is the most valuable thing the application records, and
right now it is buried: once the room closes, the only way to see who reigns is to open the
chronicle and find the right event. The holders of the crowns should be honoured where
everyone arrives, the home screen, until the next official Faxing takes the crowns from them.

## What Changes

- The home screen gains a **"De Regjerende"** tribute panel, between the stats and the rooms
  panel.
- It honours the crowned contestants of the **most recent official Faxing** in the chronicle:
  `Faxekonge`, `Faxedronning` and `Faxemonark`. Knights and `Hestemann` are not listed.
- For each crown it shows the title, the holder's name and their finishing time (`m:ss`),
  and it names the Faxing they won at, with its date.
- When there is no official Faxing yet, or the latest one crowned nobody, the panel is not
  shown at all. An empty tribute would honour nobody.
- Everything is derived on the client from the events list the home screen already loads.
  There is no new API, storage, column or dependency.

## Capabilities

### New Capabilities
- `reigning-tribute`: which Faxing's crowns reign, who is honoured, what is shown about
  them, and when the tribute is absent.

### Modified Capabilities
<!-- None. The tribute reads the chronicle; it changes no rule of title-award or arena-board. -->

## Impact

- `src/lib/tribute.ts` (new): a pure function that selects the reigning crowns from the
  events list, with a runnable `node` check next to it in the style of `ranking.demo.ts`.
- `src/components/ReigningTribute.tsx` (new): the panel. It takes props and returns markup.
- `src/App.tsx`: renders the panel on the home screen.
- `src/App.css` / `src/index.css`: panel styles, with colours taken from existing tokens.
- `package.json`: `check:rules` also runs the new check. No dependency changes.

**Pre-existing drift this exposed:** `openspec/specs/title-award/spec.md` says there are
"exactly four titles" and leaves out `Faxemonark`, which the code awards (`src/lib/ranking.ts`).
This change honours `Faxemonark` as a crown because the code awards it; the title-award
spec should be corrected separately.
