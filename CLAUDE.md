# CLAUDE.md

Working conventions for this repository. They apply to human contributors too: nothing here is
agent-specific except the tone.

Read [README.md](README.md) for what the project is and how to run it, and
[ARCHITECTURE.md](ARCHITECTURE.md) for how it works. This file is the rules.

## Orientation

Faxing runs one drinking contest: a shared room that people join from their phones, a one-hour
clock kept by the server, finishes recorded as they happen, and four titles (five with `Faxemonark`)
decided from the recorded finish times. A React single-page app talks to a small Node server
that writes to Postgres. The server runs on a Raspberry Pi.

Three things are the state of a contest, and everything else is derived on each render:

- the room's `startedAt` instant (set once, by the host, on the server),
- each member's `finishedAt` instant and `disqualified` flag,
- the current server time.

No title, rank, group or duration is stored, except the frozen chronicle written when a room
closes. Read [ARCHITECTURE.md §2–4](ARCHITECTURE.md#2-client-state) before changing
`src/lib/ranking.ts`, `App.tsx` or `api/rooms.ts`.

### This is a party tool

It runs for an hour, for people who are drinking. The bar is set both ways:

- **Lower** than production for: scale, concurrency, observability, i18n, and browsers older
  than current evergreen mobile Safari and Chrome.
- **Higher** than production for: not losing a finish. A recorded instant exists nowhere else,
  and the room will not be run again.

Nothing here is worth an abstraction that pays off "later".

## Commands

```bash
npm install               # once
npm run dev               # Vite on :5173, with the /api handlers mounted (needs DATABASE_URL)
npm run typecheck         # tsc for app and server, strict: run before every commit
npm run check:rules       # the titling rules, seven assertions under node
npm run build             # typecheck app, build dist/, bundle server.cjs
npm start                 # node server.cjs on :8080 (needs dist/, DATABASE_URL, FAXEPAVE_PASSWORD)
```

Needs a running Postgres: `npm run dev`, `npm start`. Needs no service: `typecheck`,
`check:rules`, `build`. `npm run typecheck` and `npm run check:rules` are the two checks to run
before every commit.

`npm run preview` does not mount the API. Use `npm start` to test a production build.

## Hard rules

These are invariants. Most fail **silently** when broken, which is why they are rules. The full
list, with what enforces each, is [ARCHITECTURE.md §9](ARCHITECTURE.md#9-invariants).

1. **Never store a title except at close.** `rankContestants()` in `src/lib/ranking.ts` is the
   only place a title is decided. A stored title is a second source of truth that disagrees
   with the instant it came from, and nothing errors. The one exception is the chronicle: `close`
   in `api/rooms.ts` freezes the ranked list into `faxing_events` on purpose, so a later rule
   change does not rewrite history.

2. **Never accumulate elapsed time.** Every duration is a difference of two absolute instants.
   A counter that ticks stops when the tab sleeps, and then reports an expired contest as open.
   That is the worst failure this app can have.

3. **A recorded `finishedAt` changes only by a participant's own first tap, or by the host.**
   Participant `finish` and `forfeit` in `api/rooms.ts` must keep their
   `WHERE finished_at IS NULL AND NOT disqualified` guard. Host actions (`reset`, `set-finished`,
   `set-time`, `disqualify`) may overwrite or clear a finish, so each must stay behind
   `requireHost()`, and any new clearing path must ask the host first (see `confirmLoss` in
   `ContestantCard.tsx`). A finish is the only evidence behind a crown; there is no audit log.

4. **The forfeit branch stays ahead of the crown branches** in `rankContestants()`. Branch order
   is the rule that stops a contestant who gave up from consuming a crown and leaving the next
   real finisher as a knight.

5. **Rank and title over the whole roster, never the filtered view.** `Arena.tsx` builds its
   rank map from the full ranked list. A rank that renumbered under a search would report second
   place as the winner.

6. **The server stamps every instant.** Actions carry no timestamp, except the host's `set-time`,
   which carries an elapsed time bounded to `0 ≤ elapsed < hour`. A phone's clock cannot move a
   finish. If you add an action that takes a time from the client, bound it and say why.

7. **Browser storage access in `src/lib/rooms.ts` never throws out.** `readTokens` and `saveToken`
   catch every error and degrade to "no token". Losing a token costs the device its host or
   member role, never the contest, which lives on the server.

8. **Nothing leaves the device except to our own server.** `fetch` goes only to same-origin
   `/api/*`. No third-party host, analytics, error reporter, or crash service. The Google Fonts
   stylesheet in `index.html` is the only external request. Names and finish instants are personal
   data about people who are drinking.

9. **Guard anything that fires on a state transition.** Titles recompute on every render, so a
   condition like "a `Faxekonge` exists" stays true for the rest of the contest, and acting on it
   directly fires once per poll. Record what has fired in a `useRef` in the component that shows
   it. No such guard exists yet.

10. **`pg` is server-only.** It is in `dependencies` because the Pi server bundles it. Never
    import `pg`, or anything in `api/` or `server/`, from `src/`: it would ship the database
    driver to every phone.

11. **No new runtime dependency without a reason that survives being asked twice.** There are
    three: `react`, `react-dom`, and `pg`. A restyle, an icon, a date format, or an animation is
    not a reason. `Date.now()` and integer arithmetic cover the clock.

12. **Never commit `node_modules/`, `dist/` or `server.cjs`.** All three are generated, and all
    three are in `.gitignore`. `node_modules/` was untracked in `d3d200f`; do not re-add it.

13. **The moderation notice stays.** The footer line in `App.tsx` (`Drikk med måte, og pass på
    hverandre.`) is not ornament. Do not translate it, restyle it into invisibility, or drop it.

## Spec first

Behaviour is defined before it is built. `openspec/specs/` is the source of truth; where a spec
and the code disagree, the spec is right and the code has a defect. Full workflow, validator
rules and the skip test are in [docs/openspec.md](docs/openspec.md).

Any change that alters observable behaviour gets a spec in `openspec/changes/<id>/` first. A
one-off (a typo, a comment, a dependency bump) skips it; say in one line that you skipped it and
why that is safe.

## Style

Interface copy is old-fashioned Norwegian and stays that way; code and docs are English. The
habits (comments say why, named constants, `useCallback`, strict TypeScript) are in
[docs/style.md](docs/style.md).

## Testing

There is one test: `npm run check:rules`, which runs `src/lib/ranking.demo.ts` under node. It
has seven assertions, and each names the silent failure it guards.

If you change the titling rules, change the function in `ranking.ts` and add an assertion that
would have failed before the change. If you fix a bug, add the assertion that would have caught
it and say in a comment what it guards.

Nothing else is tested automatically: not the server's permission checks, not the room lock, not
the browser flows. Verify those by walking the interface, and say that you did. The states that
matter are: an empty room, a running contest with a crowded board, a finish just recorded, a
forfeit, the hour expired, and a room closed into the chronicle, at a phone width and a desktop
width.

## Before you say it is done

Each line is something you can confirm with one command or one search.

- `npm run typecheck` exits 0.
- `npm run check:rules` prints seven `ok` lines.
- `npm run build` exits 0.
- `openspec validate --specs --strict` passes, and `openspec validate <change-id> --strict`
  passes for any change you touched.
- Either a spec covers what you changed, or you said in one line why you skipped it.
- Titles are decided only by `rankContestants()`, called from the board (`src/App.tsx`) and
  from `close` (`api/rooms.ts:197`): `grep -rn "rankContestants(" src api server` lists those
  call sites and nothing else outside the demo.
- No duration is accumulated: `grep -rn "setInterval" src` shows only the clock tick and the
  room poll, and neither increments a counter.
- No new network target: `grep -rnE "https?://" src api server` shows only the font request
  in `index.html` and documentation links.
- No `pg` import in `src/`: `grep -rn "from 'pg'" src` returns nothing.
- No new dependency: `git diff -- package.json` adds nothing to `dependencies`.
- No generated file staged: `git diff --cached --name-only` contains no `node_modules/`,
  `dist/` or `server.cjs`.
- No hex literal in a component rule: `grep -rnE "#[0-9a-fA-F]{3,6}\b" src --include=*.tsx`
  returns nothing.
- Any new interface copy is in the old-Norwegian register, and the moderation footer is intact.
- If you verified by looking at the interface rather than by running a check, say so: "walked the
  board at phone and desktop width" is an honest sentence. "Verified" alone, with no test suite,
  is not.
