## Context

`src/components/History.tsx` draws the chronicle as one road through the years, newest first,
grouped by year, and each Faxing as a card. The founding of den andre orden is
`SECOND_ORDER_FOUNDED` in `src/lib/succession.ts`, which `CrownSuccession.tsx` reads to place its
dashed mark among the reigns.

The archive's colours all come from the token block in `src/index.css`: the stone scale for
surfaces, the bevel pair `--bevel-hi` / `--bevel-lo` for the slab's carved edge, and the lantern
warmth that is reserved for crowns and the primary action.

## Decisions

### Age is carried by the card, not by a divider

A dashed line between two cards was tried first: it cut the road the archive calls «en levende
tidslinje» in two, and it had to be drawn from a boundary that shifts whenever an old night is
filed. Colouring the ancient cards says the same thing on every card that needs it, survives any
number of inserted Faxinger, and leaves the road whole.

### A new token group, not the existing ones

`src/index.css` names every colour by role, and each group says where it may be used. Parchment,
ink and brass belong to the scriptorium page; the lantern warmth is reserved for crowns. The
ancient nights therefore get their own group, `--ancient-*`, described as belonging to the
Faxinger of den første orden and to nothing else. Reusing stone or parchment would have made the
token's own comment false.

### The rule is one comparison, kept out of the JSX

`isOfTheFirstOrder(date, founded)` in `src/lib/succession.ts` answers the question, and
`succession.demo.ts` asserts the three cases that matter: an old night is ancient, the founding day
is not, and a night after it is not. A comparison inlined in the render could not be tested, and
this project's only tests run under node.

### Officiality keeps its ground

The archive already tells official from unofficial by the card's ground (`stone-600` against
`stone-700`). An ancient card keeps that difference with a second ancient tone, so an official old
night is lighter than an unofficial one, and both are visibly older than the nights of the second
order. The bevel of an ancient card is brass for both, because age is the reading this change adds.

### The legend earns its third mark

The legend explains the two marks a reader already meets. A colour that means something and is
nowhere named is a colour only its author understands, so «Den første orden» is named beside them.
