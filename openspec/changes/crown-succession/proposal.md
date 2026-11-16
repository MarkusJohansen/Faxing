## Why

A crown is the most valuable thing the chronicle records, and today it can only be seen two
ways: the current holders sit in *De Regjerende* on the home screen, and an individual crown
can be found by opening the right Faxing in the archive. Neither answers the question a
drinker asks after the fourth Faxing: who has been king, who has been queen, and when did
each take the crown? That succession is already in the chronicle; it has no view.

The old records call it a *rekke*: the line of people who have held a crown, in the order
they held it. This change adds that view.

## What Changes

- A new screen, **Kongerekka**, reached from the main nav.
- It shows a line per crown, in this order: **Kongerekka**, **Dronningrekka**, **Monarkrekka**.
  The first two are always shown; **Monarkrekka** is hidden until a monarch has been crowned.
- Each line is a threaded timeline in the look of *Faxingens Krønike*: one node per crowned
  holder, oldest first. Each node names the Faxing and its date, the holder, and the
  holder's finishing time. The holder crowned at the most recent official Faxing is marked
  *Regjerende*.
- Only **official** Faxinger fill the lines, the same rule that decides who reigns and who is
  a past champion. The old record's `Erkekonge` fills the king's line; `Kronprins` and
  `Prins` do not.
- A node opens the Faxing it belongs to.
- An empty line says so; the monarch's line is hidden while it is empty, and when no official
  Faxing has crowned anyone, the screen says the succession is empty yet.
- Everything is derived on the client from the chronicle the app already loads. No API,
  storage, column or dependency is added.

## Capabilities

### New Capabilities
- `crown-succession`: which Faxinger fill the lines, what one reign shows, how reigns are
  ordered, who is marked as reigning, and where the lines are shown.

### Modified Capabilities
<!-- None. The change reads the chronicle; it changes no rule of title-award or arena-board. -->

## Impact

- `src/lib/succession.ts` (new): a pure selector from the chronicle to three crown lines,
  `shownLines`, which decides that the monarch's line waits for a monarch, and `lineNodes`,
  which plants the founding mark, with a runnable `node` check beside it in the style of
  `tribute.demo.ts`.
- `src/components/CrownSuccession.tsx` (new): the screen. Props only, no state.
- `src/App.tsx` and `src/types.ts`: the `succession` screen and its nav tab.
- `src/App.css`: the lines and their nodes, in the thread look of `.chronology`, with
  colours from the existing tokens.
- `package.json`: `check:rules` also runs the new check. No dependency changes.

**Pre-existing drift this exposed, not fixed here:** `openspec/specs/title-award/spec.md`
still says "exactly four titles" and omits `Faxemonark`, which the code awards and this view
shows. `reigning-tribute` already recorded the same drift; it should be corrected in the
title-award spec, not in a view of it.
