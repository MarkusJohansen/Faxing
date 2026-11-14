## Context

The home screen already loads the whole chronicle (`loadEvents()` → `GET /api/events`,
ordered `event_date DESC`) into `events` in `App.tsx`. Each `FaxingEvent` carries `official`,
`date`, `name` and `contestants: RankedContestant[]`, and every contestant already has a
`title` and an `elapsed`. For a Faxing that came from a room, both were derived on the server
at close by `rankContestants`; for one Faxepave entered by hand, they are whatever Faxepave
recorded. So everything the tribute needs is already in memory on the home screen.

## Goals / Non-Goals

**Goals:** honour the crowns of the latest official Faxing on the home screen; add no API,
storage or dependency; keep the selection rule pure and checked under `node`.

**Non-Goals:** a hall of fame across all Faxinger, records (fastest time ever), showing the
tribute inside rooms or on other screens, knights.

## Decisions

**Read the recorded title; don't re-derive.** A chronicle entry is the verdict of that night,
including any correction Faxepave made. Re-deriving would need the contest's start instant,
which hand-entered Faxinger don't have, and could disagree with what the chronicle shows one
click away. Rule 1 ("never store a title") governs the live contest; the chronicle already
stores the result at close, and this change adds no new store.

**A pure selector in `src/lib/tribute.ts`.** `reigningTribute(events)` returns
`{ event, crowns } | null`. It picks the official event with the greatest `date`, then
filters its contestants to the three crown titles in the fixed order. Being pure, it gets a
`tribute.demo.ts` of assertions run by `npm run check:rules`. That is the only automated
check this project has, and the rule "an unofficial Faxing must not unseat the crowns" is
exactly the kind that breaks silently.

**Ties on date: the first one in the list wins.** The selector scans in the order it is
given and keeps an event only if its date is strictly greater, so a tie goes to the event
listed first. Faxinger from rooms are dated to the millisecond, so a tie only happens for two
Faxinger entered by hand on the same day. Not worth a tiebreak column.

**No fallback to an earlier Faxing.** If the latest official Faxing crowned nobody, nobody
reigns. Reaching back would honour a crown that has already been contested and lost.

**`formatTime` moves to `src/lib/format.ts`.** `EventView` already formats `elapsed` as
`m:ss`. The tribute needs the same format, so the formatter moves rather than being copied
(two copies of one format drift apart). `formatDate` moves with it for the same reason.

**The panel is a presentational component.** `ReigningTribute` takes the selector's result
and renders it, and holds no state. `App.tsx` computes the result with `useMemo` on `events`,
so it is not recomputed on every 500 ms tick.

## Risks / Trade-offs

- [Faxepave can make an old Faxing official, or change its date, and so move the crowns] →
  intended: the chronicle is the source of truth and Faxepave is its keeper.
- [Hand-entered Faxinger may carry a crown with `elapsed` 0] → shown as `0:00`, the same as
  the chronicle shows it. A data problem, not a tribute problem.
- [The chronicle loads once, on mount] → a Faxing closed on another device doesn't show up
  until reload. Closing a room on this device already reloads events, which covers the host.
