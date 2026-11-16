## Context

The chronicle is already in memory: `App.tsx` loads published Faxinger with `loadEvents()`
into `events`, and passes that list to the archive and the tribute. Each `FaxingEvent` carries
`official`, `date`, `name` and `contestants: ArchivedContestant[]`, and each contestant carries
the `title` the record wrote. Nothing needs to be fetched, derived from a clock, or stored.

Two existing selectors read the same facts and set the conventions this change follows:

- `reigningTribute` (`src/lib/tribute.ts`) picks the official Faxing with the latest date,
  ties to the one the chronicle lists first, and reads the recorded titles rather than
  re-deriving them.
- `honoursOf` (`src/lib/honours.ts`) counts `Faxekonge`, `Faxedronning` and `Erkekonge` at
  official Faxinger as championships.

## Goals / Non-Goals

**Goals:** a pure selector to three ordered lines; one screen that shows them in the
chronicle's thread look; no new API, storage, state or dependency.

**Non-Goals:** reign *spans* (a start and end date per holder), ranks or totals across lines,
records, a hall of fame for knights, and any change to the title rules. The view reads the
chronicle; it does not judge it.

## Decisions

**Derive from the recorded title; never re-derive a crown.** The chronicle is the verdict of
that night, Faxepave's corrections included, and a hand-entered Faxing has no start instant to
derive from. This is the same decision `reigningTribute` made, for the same reason.

**Official Faxinger only.** A crown handed out at a garden party is not a reign: the same rule
already governs *De Regjerende* (`reigningTribute`) and the champion mark (`honoursOf`). An
unofficial Faxing still shows its titles in the archive; it simply never enters a line.

**`Erkekonge` is a king, `Kronprins` and `Prins` are not.** The old records use `Erkekonge`
for the first Faxeting's winner, and `honoursOf` already counts it as a crown. A crown prince
is not a king, so the two other legacy titles stay out of every line. The UI names a legacy
title when it differs from the line's own, so the record is not silently rewritten.

**One reign per crowned holder per Faxing.** A person who wins twice appears twice, because
the line is a succession, not a leaderboard. If the record names two holders of the same crown
at one Faxing, both are listed in the record's order: the archive is editable, and the view's
job is to show what it says.

**Oldest first; a tie on date follows the reigning rule.** Faxinger are ordered by ascending
`date`, so the line reads as a succession. When two official Faxinger share a date, the one
the chronicle lists first is the *later* reign, which is exactly how `reigningTribute` breaks
the same tie for "latest". One tiebreak rule for both views, or they would disagree about who
reigns.

**The reigning mark comes from the latest official Faxing, not from the last row.** A reign is
marked *Regjerende* only when its Faxing is the latest official one. If that Faxing crowned no
king, no king in the line is marked — reaching back would honour a crown the latest Faxing
contested, the same mistake `reigningTribute` refuses to make.

**No reign spans.** A span needs an end instant, and the record has none: it says which Faxing
crowned a holder, not when a crown was lost. A Faxing that crowns nobody would need an
"abdicated" or "vacant" rule the chronicle never states. The date of the Faxing is the "when"
the record supports.

**A presentational component with the chronicle's look.** `CrownSuccession` takes the computed
lines and an `onOpen` callback. `App.tsx` memoises the selector on `events`, so the 500 ms clock
tick does not rebuild it. The thread is the `.chronology` pattern: a dithered vertical line,
a marker per node, cards built from the existing `.event-card` slab. No new colour is
introduced.

**Three lines always, even when one is empty.** Kongerekka, Dronningrekka and Monarkrekka are
the three crowns the code awards. Hiding an empty line would make a night with no queen look
like a night with no queen's *line*; the line says "ingen dronning er kronet ennu" instead.
When no official Faxing has crowned anyone, the whole screen is the empty state.

## Risks / Trade-offs

- [Faxepave can make an old Faxing official, change its date, or correct a title, and so
  rewrite the succession] → intended: the chronicle is the source of truth, and the view is a
  projection of it. Nothing is stored, so the line corrects itself on the next load.
- [A three-column thread at desktop width is narrow for a long name] → names wrap
  (`overflow-wrap: anywhere`, as `.event-card strong` already does); the lines stack on a phone.
- [A sixth nav tab crowds the phone nav] → the two long labels already decide this: below
  640 px the nav wraps rather than squashing its labels. Verified by eye, not by a test.
- [The chronicle loads once, on mount] → a Faxing that closes on another device appears in the
  line after the next load, the same staleness the archive and the tribute already have.
