## 1. Specification

- [x] 1.1 Write the requirement for a corrected time in `specs/chronicle-corrections/spec.md`
- [x] 1.2 Record in `design.md` why the row takes minutes and seconds, why empty means `Tid ukjent`, and why no title moves

## 2. The row

- [x] 2.1 Render the time as two boxes in `src/components/EventView.tsx` while the edit form is open, and as text otherwise
- [x] 2.2 Hold the boxes' text in the row, so a keystroke that is not a count leaves the stored time alone
- [x] 2.3 Write the duration into the component's draft; «Lagre alle endringer» sends it in the one `PUT` the editor already makes
- [x] 2.4 Empty both boxes means no time, and the row reads `Tid ukjent`
- [x] 2.5 Style the boxes in `src/App.css` from the existing tokens, so the column holds them

## 3. Verification

- [x] 3.1 `npm run typecheck`, `npm run check:rules`, `npm run build`
- [x] 3.2 `openspec validate chronicle-corrections --strict`
- [x] 3.3 Sent the editor's own payload for a live row back unchanged through `PUT /api/events?id=…` and read it back from `GET /api/events`: the durations and the contestant ids come back identical (2022's row kept `Markus Johansen=900000`)
- [x] 3.4 Not walked in a browser: there is no Postgres and no dev server here, so the two boxes are unverified on screen

## Notes

The stored duration is written by the server already: `api/events.ts`'s `PUT` stores the whole
`attendees` array as sent, so no endpoint changed. This change is the client's side of a field
the chronicle always had.
