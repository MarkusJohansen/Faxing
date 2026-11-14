# Style, as this codebase writes it

Match what is already there. The rules that must not break are in
[CLAUDE.md](../CLAUDE.md#hard-rules); these are the habits.

- **The interface speaks old-fashioned Norwegian.** Strings such as `Kriger`, `Innskriv` and
  `Ærens Hal` are the product's voice. Keep the register. Do not add English strings to the
  interface. If you cannot write new copy in that register, leave a marker and say so.
- **Code, comments, commit messages and documentation are in English.**
- **Comments justify decisions.** The useful comment says why: why 500 ms and not 1000, why
  the forfeit branch is first, why the room is locked with `FOR UPDATE`. A comment that restates
  the code is noise.
- **Name the failure when it is silent.** If you add a guard, say what silent failure it
  catches.
- **Components present; the rules live in `lib/`.** `App.tsx` owns screen state and the clock.
  `ranking.ts` owns the titles. Components take props and render. Add state to a component only
  when nothing outside it can observe that state, such as the search query.
- **`useCallback` for handlers passed down, and `setX(prev => …)` for every update.**
- **Named constants.** `CONTEST_DURATION_MS` and `POLL_MS` are declared once. Do not inline a
  duration, threshold, or count.
- **Colours go through a custom property** in `src/index.css`. A hex literal in a component rule
  breaks the seam that makes the livery replaceable.
- **TypeScript is strict** (`noUnusedLocals`, `noUnusedParameters`). Do not widen a type to get
  past an error, and do not use `as` to assert a shape you have not checked. `src/lib/storage.ts`
  does this today; it is a known defect, not a pattern to copy.
- **Server errors are actionable Norwegian messages** (`Et Navn er fornødent`), raised as
  `HttpError` with a status code.
