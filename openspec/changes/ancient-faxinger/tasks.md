## 1. Specification

- [x] 1.1 Write the requirement for the ancient nights in `specs/chronicle-timeline/spec.md`
- [x] 1.2 Record in `design.md` why age is carried by the card rather than a divider, why the tokens are a new group, and why officiality keeps its ground

## 2. The colour

- [x] 2.1 Add the `--ancient-*` token group to `src/index.css`, described as belonging to the Faxinger of den første orden
- [x] 2.2 Add `isOfTheFirstOrder(date, founded)` to `src/lib/succession.ts`, reading `SECOND_ORDER_FOUNDED`
- [x] 2.3 Draw the card as ancient in `src/components/History.tsx`, and name the reading in the legend
- [x] 2.4 Style the ancient card in `src/App.css`, with the official night keeping its lighter ground
- [x] 2.5 Assert in `src/lib/succession.demo.ts` an old night, the founding day, and a night after it

## 3. Verification

- [x] 3.1 `npm run typecheck`, `npm run check:rules`, `npm run build`
- [x] 3.2 `openspec validate ancient-faxinger --strict`
- [x] 3.3 Read the live chronicle through `isOfTheFirstOrder`: two nights are ancient (2022-10-29 and 2024-09-30) and the five from 2025 and 2026 are not
- [x] 3.4 Not walked in a browser: there is no Postgres and no dev server here, so the colour itself is unverified on screen

## Notes

The dashed mark the crown lines carry is untouched: this change is about the run of Faxinger in the
archive, where a line through the road was refused in favour of the cards' own colour.
