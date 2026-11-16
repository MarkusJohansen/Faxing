## 1. Specification

- [x] 1.1 Write the requirement for the archive's founding line in `specs/chronicle-timeline/spec.md`
- [x] 1.2 Record in `design.md` why the mark reads one constant, why it lives in `succession.ts`, and why it is absent when nothing is above it

## 2. The mark

- [x] 2.1 Add `foundingBoundary(events, founded)` to `src/lib/succession.ts`, returning the newest Faxing of the first order when a Faxing of the second is above it
- [x] 2.2 Draw the dashed line in `src/components/History.tsx` above that Faxing, labelled «Den andre orden stiftes» with the day from `SECOND_ORDER_FOUNDED`
- [x] 2.3 Style it in `src/App.css` from the existing tokens, matching the mark the crown lines draw
- [x] 2.4 Assert in `src/lib/succession.demo.ts` the boundary, both one-sided chronicles, and a Faxing held on the founding day

## 3. Verification

- [x] 3.1 `npm run typecheck`, `npm run check:rules`, `npm run build`
- [x] 3.2 `openspec validate mark-the-founding-in-the-archive --strict`
- [x] 3.3 Read the live chronicle through `foundingBoundary`: the line falls between 15 April 2025 and 30 September 2024
- [x] 3.4 Not walked in a browser: there is no Postgres and no dev server here, so the drawing itself is unverified on screen

## Notes

The day the line names is the one the crown lines name, both read from `SECOND_ORDER_FOUNDED`.
The live chronicle holds seven Faxinger, so the boundary falls between 2025-04-15 and
2024-09-30, inside the archive's year sections.
