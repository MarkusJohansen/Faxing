# Findings

## Dissolving a started-looking room is not the same as closing it

Measured against a live server and a throwaway Postgres (see `design.md` § Verification). The two
paths differ in exactly one observable way — no `faxing_events` row — and every other behaviour
(list membership, the 409 on later actions, the roster) is unchanged, which is why the branch could
reuse `closed_at` instead of a new column.

## The lobby and the host guide were unstyled, and the cause was one missing brace

While walking the dissolve screen the lobby rendered with the step titles glued to their text and
no spacing, and the user had reported the same in `HostGuide`. `src/App.css` had 400 `{` against
399 `}`: the `@media (max-width: 480px)` block opened at line 1763 was never closed, so every rule
after it — the `min-width: 900px` and `max-width: 640px` blocks, `.rooms-panel`, `.room-code-box`,
`.room-code`, `.host-guide` — was nested inside a phone-width media query and dead on any screen
wider than 480 px. Measured before: `.host-guide li strong` computed `display: inline` and the
guide's `ol` had no row gap. After closing the block: `display: block`, 3 px from title to text,
`14.4px` row gap at 390, 480, 640 and 1280 px, and no horizontal overflow at any of them.

That is a typo with one correct outcome, so it was fixed without a spec of its own. Recording it
here because it is the reason the visual pass was worth doing: a missing brace fails silently, and
the same rules it swallowed include the lobby this change adds a button to.
