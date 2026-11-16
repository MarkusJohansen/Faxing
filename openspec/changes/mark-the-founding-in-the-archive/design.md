## Context

`src/components/History.tsx` renders the chronicle as year sections on a road: newest Faxing
first, each year marked with a lantern. The founding of den andre orden is already a constant,
`SECOND_ORDER_FOUNDED` in `src/lib/succession.ts`, and `CrownSuccession.tsx` draws it as a dashed
line among the reigns. The archive has the same day and no mark for it.

## Decisions

### One constant, two views

The archive reads `SECOND_ORDER_FOUNDED` rather than its own date, so the crown lines and the
chronology cannot disagree about when the order began. A second literal would be a second source
of truth for the one fact both views describe.

### The mark is a boundary id, not a comparison at render time

`foundingBoundary(events, founded)` returns the id of the newest Faxing older than the founding,
and `null` when there is no Faxing on the newer side. `History.tsx` draws the mark above that card.
Keeping the decision in `src/lib/succession.ts` makes it assertable in `succession.demo.ts` without
a browser, which is the only place this project tests.

Comparing each card's date against the founding inside the render would have spread the same rule
over the JSX, where the demo cannot reach it.

### No mark when nothing is above it

A chronicle holding only Faxinger of the second order has no first order to end, and a chronicle
holding only the first order has no second to begin. Drawing the line either way would separate
nothing, which is the rule chosen for the crown lines (`openspec/changes/crown-succession`). The
archive keeps the same rule.

### The year grouping is left alone

The mark sits inside whatever year section the boundary falls in, so a chronicle with Faxinger on
both sides of 10 October 2024 shows the line mid-year. Splitting the year section in two would
break the road and the lantern, which are drawn per year, for one line that reads fine in the
middle of a section.
