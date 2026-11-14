# CLAUDE.md

Instructions for Claude Code working in this repository. They apply to human contributors
too — nothing here is agent-specific except the tone.

Read [README.md](README.md) for what the project is and [ARCHITECTURE.md](ARCHITECTURE.md)
for how it works. This file is the working conventions.

## Orientation

Faxing is a **single-page React application for running one drinking tournament**: enlist
contestants, start a one-hour clock, tap a card when somebody finishes their litre, and let
the four titles fall out. About 700 lines of TypeScript and CSS, two runtime dependencies
(`react`, `react-dom`), no backend, no router, no state library, no CSS framework, and no
network call after its own assets have loaded.

One operator runs it, on one phone, walking around a room. Every design decision in the
project answers to that.

The whole application is a projection of three pieces of state and one clock reading. **No
title is ever stored** — every title, rank, group and duration is derived on each render
from `contestStartTime`, `now`, and the roster. Read
[ARCHITECTURE.md §2–4](ARCHITECTURE.md#2-state-and-who-owns-it) before changing anything in
`App.tsx`.

### This is a party tool, not production software

It runs for an hour at a time, on one device, for people who are drinking. That sets the
bar in both directions:

- **Lower** than production for: scale, concurrency, offline sync, observability, i18n,
  browser support beyond current evergreen mobile Safari and Chrome.
- **Higher** than production for: not losing state. Losing a tournament at minute fifty is
  unrecoverable — the finish instants exist nowhere else, and the room will not re-run it.
  Persistence, the derived clock and the never-overwrite-a-finish rule all exist for that.

Nothing here is worth an abstraction that pays off "later". Later is a different party.

## Commands

```bash
npm install          # once
npm run dev          # Vite dev server on :5173
npm run typecheck    # tsc --noEmit, strict
npm run build        # tsc then vite build
npm run preview      # serve the built output
```

`npm run typecheck` is the only automated check that exists. **Run it before every commit.**
There is no test suite; see [Testing](#testing).

To use it as intended — laptop serving, phone operating — `npm run dev -- --host` and open
the LAN address. Be aware this currently breaks on enlisting the first contestant
([ARCHITECTURE.md D4](ARCHITECTURE.md#d4-cryptorandomuuid-requires-a-secure-context)):
`crypto.randomUUID()` needs a secure context. Until that is fixed, operate from the device's
own `localhost`.

## Hard rules

These are invariants. Most fail *silently* when broken, which is why they are rules rather
than preferences. The full list with its reasoning is
[ARCHITECTURE.md §9](ARCHITECTURE.md#9-invariants).

1. **Never store a title.** Titles are computed in `getRankedContestants()` and nowhere
   else. A stored title is a second source of truth that will eventually disagree with the
   finish instants that should have produced it, and nothing will error.
2. **Never accumulate elapsed time.** Every duration is the difference between two absolute
   instants. A counter incremented on a timer stops when the tab is backgrounded and then
   reports an expired contest as still open — which, in an application whose only purpose is
   enforcing a one-hour limit, is the worst failure available. This is also what makes a
   mid-contest reload correct.
3. **Only a room's host (or Faxepave, for an official room) may change a recorded
   `finishedAt`.** It is the sole evidence behind a crown and there is no audit trail. The
   participant's own `finish`/`forfeit` in `api/rooms.ts` must keep their
   `WHERE finished_at IS NULL AND NOT disqualified` guard; host corrections (`reset`,
   `set-time`, `disqualify`) are the only other writers
   ([faxing-rooms](openspec/changes/faxing-rooms/)).
4. **Keep the forfeit branch ahead of the crown branches** in `getRankedContestants()`.
   Branch order is the rule that stops a contestant who gave up from consuming a crown and
   leaving the next real finisher as a knight.
5. **Compute ranks and titles over the whole roster, never over the filtered view.** A rank
   that renumbered under an active search would report second place as the winner — the one
   number on the board that must never lie.
6. **Never put `now` in the persistence effect's dependency array.** It turns a handful of
   writes an hour into 7,200. `now` derives from `contestStartTime` and holds nothing worth
   saving.
7. **Storage access never throws out of `src/lib/storage.ts`.** Every entry point catches
   and degrades to "nothing stored" or "write ignored". `localStorage` throws in a private
   window, on a full quota, and when a browser blocks site data, and in all three cases
   running the tournament unpersisted beats not running it.
8. **Nothing leaves the device except to our own server.** `fetch` goes only to `/api/*` on
   the Pi. No third-party host, analytics, error reporter or crash service, and no font or
   asset host beyond the existing Google Fonts request. Contestant names and finish instants
   are personal data about identifiable people who are drinking.
9. **Guard anything that fires on a state transition.** Titles recompute on every render, so
   a condition like "a `Faxekonge` exists" is true for the rest of the hour: acting on it
   directly fires 7,200 times. Use a `useRef` recording what has already fired, in the
   component that owns the view.
10. **No new dependency without a reason that survives being asked twice.** There are two.
    `Date.now()`, integer arithmetic and `localStorage` cover everything this application
    does. A restyle, an icon, a date format and an animation are all *not* reasons.
11. **Never commit `node_modules/` or `dist/`.** Both are generated. `node_modules/` is
    currently tracked by mistake and is being removed — do not add to it.
12. **The moderation notice stays.** The footer line advising moderation is not ornament, is
    not translated, and does not become an emblem. This application exists to run a drinking
    contest; the one line telling somebody to be careful is the last thing that should be
    styled away.

## Spec-first

**Behaviour is defined before it is built.** This repository uses OpenSpec, and the specs in
`openspec/specs/` are the source of truth for what the application does — not the code, and
not this file.

Five capabilities are specified:

| Capability | Covers |
|---|---|
| [`contestant-roster`](openspec/specs/contestant-roster/spec.md) | Enlistment, validation, the start gate |
| [`contest-clock`](openspec/specs/contest-clock/spec.md) | The hour, the tick, urgency, expiry |
| [`title-award`](openspec/specs/title-award/spec.md) | The four titles and who gets them |
| [`arena-board`](openspec/specs/arena-board/spec.md) | The live board, grouping, search, reset |
| [`session-persistence`](openspec/specs/session-persistence/spec.md) | Surviving a reload |

These were written from the existing implementation when the project adopted OpenSpec, so
they describe shipped behaviour rather than an aspiration. **Where a spec and the code
disagree, the spec is right and the code has a defect.** There is one such disagreement
today, recorded as [D1](ARCHITECTURE.md#d1-a-finish-recorded-after-the-hour-earns-a-title).

### Workflow

A change lives in `openspec/changes/<id>/` as a proposal, delta specs
(`specs/<capability>/spec.md`, written as ADDED/MODIFIED/REMOVED requirements with
scenarios), a design and a task list. Use the OpenSpec skills — `/opsx:propose`,
`/opsx:apply`, `/opsx:verify`, `/opsx:archive` — rather than improvising the workflow
inline.

```bash
openspec validate --specs --strict          # the main specs
openspec validate <change-id> --strict      # a change
openspec status --change <change-id>        # artifact completeness
openspec list                               # open changes
```

`openspec validate --strict` must pass before a change is treated as done.

Two validator behaviours that will waste your time otherwise:

- A requirement's `SHALL` or `MUST` must appear on the **line immediately after** the
  `### Requirement:` header. It is not enough for it to be somewhere in the body — the
  validator reads only that first line, and the error message ("must contain SHALL or MUST")
  does not say so.
- Scenarios need **exactly four** hashes. Three fails silently.

### When to skip the spec

Skip it for a genuine one-off: a typo, a comment, a dependency bump, an obvious bug with one
correct behaviour. **Say in one line that you are skipping it and why it is safe.**

Spec it when the change adds or alters observable behaviour, touches a capability's
contract, has more than one reasonable design, or spans more than a couple of files. A
visual change *is* observable behaviour — the current
[`restyle-order-livery`](openspec/changes/restyle-order-livery/) change specifies a restyle
that alters no logic at all, because "which colour means failure" is a contract the next
change needs to not break.

### Findings go in `findings.md`

When a change produces a measurement, a failed experiment or a fact pinned to this
environment, record it in the change's `findings.md` **as it happens**, including the
results that killed the idea. A contrast ratio that failed, a font that was unreadable, a
tilt that seamed at 150% zoom — those are the notes worth having, and they are the ones
nobody writes down afterwards.

## Style, as this codebase writes it

Match what is already there. Concretely:

- **The interface speaks old Norwegian.** Every user-facing string is old-fashioned but
  readable Norwegian (`haver`, `ennu`, `påny`, `Eders`), and that is the product's voice,
  not an accident. Do not modernise the spelling, do not slip back into Danish, and do not
  add an English string. The five titles are names and stay as they are. Code, comments, commit messages and documentation are in
  English; the interface is not. New interface copy is written in the same register — if you
  cannot, say so and leave a marker rather than dropping in plain English.
- **Comments justify decisions.** The value of a comment here is the *why*: why 500 ms and
  not 1000, why the forfeit branch is first, why the write effect excludes `now`. A comment
  restating the code is noise.
- **Name the failure mode when it is silent.** Most of what can go wrong in this application
  goes wrong without erroring. If you add a guard, say what it catches.
- **Titles derive; components present.** `App.tsx` owns state and the rules. Every other
  component takes props and returns markup. Do not add state to a child unless it is view
  state that nothing outside that component can observe — the search query and the reset
  confirmation are the two legitimate examples.
- **`useCallback` on every mutator, `setX(prev => …)` for every update.** That is the
  existing pattern in `App.tsx`; follow it.
- **Named constants, not literals.** `CONTEST_DURATION_MS` is declared once. A duration, a
  threshold or a count appearing inline is a value that will be edited in one of its two
  places.
- **Colours resolve through a custom property.** Every colour in `App.css` goes through a
  token in `index.css`. That seam is what makes the visual layer replaceable; a hex literal
  in a component rule breaks it.
- **TypeScript is strict, with `noUnusedLocals` and `noUnusedParameters`.** Do not widen a
  type to get past an error, and do not use `as` to assert a shape you have not checked —
  [D5](ARCHITECTURE.md#d5-persisted-state-is-cast-not-validated) is what that costs.

## Testing

**There is no test suite. This is the largest genuine gap in the project.** Say so honestly
rather than working around it, and do not claim a change is verified when what you did was
look at it.

What exists is `npm run typecheck`. What is missing matters:
`getRankedContestants()` is pure, closes over nothing but its arguments, and encodes every
rule in the tournament — and [D1](ARCHITECTURE.md#d1-a-finish-recorded-after-the-hour-earns-a-title)
is a live rule violation that one assertion would have caught.

If you touch the titling rules, the right thing is to extract `getRankedContestants()` into
`src/lib/` (it is a move, not a refactor) and leave one runnable check behind. No framework:
a `demo()` of assertions run under `node`, in the style the rest of this project would
choose if it chose anything. If you fix a bug, add the assertion that would have caught it
and say in a comment what it guards.

Until a suite exists, **verification is walking the interface**, and it is written into a
change's task list rather than left to discipline. The states that matter are: empty roster,
contest running with a crowded board, a crown just awarded, and the hour expired — at a
phone width and a desktop width.

## Before you say it is done

- `npm run typecheck` passes. `npm run build` passes.
- `openspec validate --specs --strict` passes, and `openspec validate <change-id> --strict`
  if you touched a change.
- Either a spec covers what you changed, or you said in one line why you skipped it.
- No title got stored. No duration got accumulated. No `finishedAt` got cleared.
- No `now` in the persistence effect's dependencies.
- No `fetch`, no new host, nothing leaving the device.
- No new dependency in `package.json`.
- No `node_modules/` or `dist/` staged.
- No hex literal outside the token block in `index.css`.
- Any new interface copy is in the same old-Norwegian register; none in Danish or English.
- Any guard you added says what silent failure it catches.
- Any measurement you claim is one you actually took, and it is written up in the change's
  `findings.md`.
- If you verified by looking at the interface rather than by running a check, say that —
  "verified by eye at phone and desktop width" is a fine sentence. "Verified" alone, when
  there is no suite, is not.
