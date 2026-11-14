# Findings

## Visual walk (task 3.3), 2026-11-14

Verified by eye, not by a check. Vite dev server, with `/api/events`, `/api/admin` and
`/api/rooms` stubbed by Playwright route interception (no dev database here), headless
Chromium at 390×844 and 1280×900, device scale 2.

| Scenario | Expected | Seen |
|---|---|---|
| Official «Sommerfaxing» with Konge, Dronning, Monark, a knight and a horseman; a newer unofficial Faxing; an older official one | The three crowns of «Sommerfaxing», in that order | As expected |
| One official Faxing, one crown | Faxekonge only, no empty rows | As expected |
| Only an unofficial Faxing | No panel | No panel; rooms panel follows the stats |

At phone width the row stacks the title above the name, with the time on the right, so a
long name wraps instead of pushing the time off screen. Screenshots are in `screenshots/`.

Mutation check of `tribute.demo.ts`: each of these mutations to `tribute.ts` made it fail:
dropping the `official` filter, `>` → `>=` on date, returning an empty tribute instead of
null, and letting every titled contestant through instead of crowns only.
