# Architecture

How Faxing works. Read [README.md](README.md) first for what it is and how to run a
tournament; read [CLAUDE.md](CLAUDE.md) for the working conventions.

This document is in English while the interface is in archaic Danish. That is deliberate:
the Danish is the product's voice and the titles are domain terms with no English
equivalent, but a document whose job is to stop somebody breaking the titling rules should
be precise before it is charming. Danish terms are used as domain vocabulary throughout and
are glossed in [Vocabulary](#12-vocabulary).

## Contents

1. [The shape of the system](#1-the-shape-of-the-system)
2. [State, and who owns it](#2-state-and-who-owns-it)
3. [The derivation chain](#3-the-derivation-chain)
4. [The titling rules](#4-the-titling-rules)
5. [The tick](#5-the-tick)
6. [Persistence](#6-persistence)
7. [The component tree](#7-the-component-tree)
8. [The visual layer](#8-the-visual-layer)
9. [Invariants](#9-invariants)
10. [Known defects](#10-known-defects)
11. [What is deliberately absent](#11-what-is-deliberately-absent)
12. [Vocabulary](#12-vocabulary)
13. [Where the next change attaches](#13-where-the-next-change-attaches)

## 1. The shape of the system

Faxing is a single-page React application with no backend, no build-time data, no network
calls after its own assets have loaded, and two runtime dependencies. It is about 700 lines
of TypeScript and CSS.

```
index.html
  └── src/main.tsx            mounts <App /> in StrictMode
      └── src/App.tsx         ALL tournament state; the titling rules; the tick
          ├── src/lib/storage.ts        localStorage read/write/clear
          ├── src/types.ts              Contestant, RankedContestant, Title, Gender, Screen
          ├── components/Registration.tsx   screen === 'home'
          └── components/Arena.tsx          screen === 'arena'
              ├── components/GlobalTimer.tsx
              └── components/ContestantCard.tsx   (×N)
```

There are two screens and one switch between them, held in `App.tsx`. There is no router:
the URL never changes, which is a deliberate consequence of the tournament living in
`localStorage` rather than in a shareable address. See
[§11](#11-what-is-deliberately-absent).

The whole application is a projection of **three** pieces of state and **one** clock
reading. Everything else — every title, every rank, every duration, every group on the
board — is derived on each render. That is the central design decision and the rest of this
document is mostly its consequences.

## 2. State, and who owns it

`App.tsx` owns all tournament state. There is no context, no store, no reducer.

```ts
const [screen, setScreen]                     = useState<Screen>(...)             // 'home' | 'arena'
const [contestants, setContestants]           = useState<Contestant[]>(...)       // the roster
const [contestStartTime, setContestStartTime] = useState<number | null>(...)      // epoch ms, or null
const [now, setNow]                           = useState<number>(Date.now())      // the clock reading
```

`Contestant` is the only stored record, and it holds facts rather than conclusions:

```ts
interface Contestant {
  id: string              // crypto.randomUUID()
  name: string            // trimmed at entry, unique case-insensitively
  gender: Gender          // 'male' | 'female' — input to the crown rules
  finishedAt: number | null   // epoch ms, or null if not finished
  disqualified: boolean       // gave up
}
```

**No title is stored anywhere.** `RankedContestant` — which adds `title` and `elapsed` — is
constructed fresh on every render and never written back. This is what makes the titling
rules auditable: there is one function to read, and it is impossible for a stored title to
disagree with the finish instants that should have produced it.

The five mutators in `App.tsx` are the entire write surface: `addContestant`,
`removeContestant`, `markFinished`, `markDisqualified`, `resetContest`, plus `startContest`
which sets the start instant. Every one is a `useCallback` over `setContestants(prev => …)`.
Nothing else in the tree writes state, with one exception: `Arena` holds two pieces of
purely local view state (the search query, and whether the reset confirmation is showing),
neither of which is persisted or observable from outside.

Child components receive data and callbacks. They compute presentation and nothing else.

## 3. The derivation chain

Every duration in the system comes from subtracting two absolute instants. Nothing
accumulates.

```
contestStartTime  (fixed once, at startContest)
now               (re-read every 500 ms)
        │
        ├── elapsedMs   = now - contestStartTime
        ├── remainingMs = CONTEST_DURATION_MS - elapsedMs
        ├── contestOver = elapsedMs >= CONTEST_DURATION_MS
        │
        └── per contestant:
              elapsed = (finishedAt ?? now) - contestStartTime
              title   = f(disqualified, finishedAt, gender, elapsed, crowns already given)
```

`CONTEST_DURATION_MS` is `60 * 60 * 1000`, declared once in `App.tsx`.

The consequence of deriving rather than accumulating is that **the clock keeps running while
nothing is watching**: closed tab, backgrounded app, sleeping laptop. An hour of wall-clock
time is an hour of contest. A counter incremented on an interval would silently stop in
every one of those cases and report a contest as still open after it had expired — which,
for an application whose entire purpose is enforcing a one-hour limit, is the worst
available failure. This is also what lets a reload restore a contest mid-flight
([§6](#6-persistence)) with the clock at the right place rather than at the place it was
interrupted.

`elapsed` for a contestant who has not finished is `now - contestStartTime` — that is, the
global elapsed time, identical for everybody. This is correct and is the source of a
misleading piece of UI; see [D2](#d2-the-per-card-gauge-is-the-global-clock).

## 4. The titling rules

`getRankedContestants()` in `App.tsx` is the only place a title is decided. It runs on every
render.

```
1. If there is no start instant, return everybody with title = null.
2. Sort a copy of the roster:
     both finished        → ascending finishedAt
     one finished         → the finisher first
     neither finished     → 0  (stable sort ⇒ enlistment order preserved)
3. Walk the sorted list, carrying two booleans — faxekongeAwarded, faxedronningAwarded:
     disqualified            → Hestemann
     finished, male, no king → Faxekonge   (claim it)
     finished, female, no q. → Faxedronning (claim it)
     finished                → Faxeridder
     out of time             → Hestemann
     otherwise               → null
```

Three properties are worth naming because each is load-bearing and none is obvious:

**Precedence is decided by `finishedAt`, not by tap order.** The sort runs before the walk,
so an operator who crosses a room and taps the nearer card first does not thereby award the
crown to the wrong person. The recorded instants are the evidence.

**A forfeit is checked first, so it never consumes a crown.** `disqualified` short-circuits
before the crown branches, which means a contestant who gave up does not claim
`Faxekonge` and leave the next finisher as a knight. It matters: the branch order *is* the
rule.

**The two crown flags are function-local.** They are re-initialised on every call, so the
crowns are recomputed from scratch on every render rather than latched. This is what makes
the function a pure projection of state — and also why an acclamation on a crowning needs
its own guard against firing repeatedly (see
[§13](#13-where-the-next-change-attaches)).

The rules are specified independently of this implementation in
[`openspec/specs/title-award/spec.md`](openspec/specs/title-award/spec.md). Where the two
disagree, the spec is right and the code has a defect — there is one, recorded as
[D1](#d1-a-finish-recorded-after-the-hour-earns-a-title).

## 5. The tick

```ts
useEffect(() => {
  const interval = setInterval(() => setNow(Date.now()), 500)
  return () => clearInterval(interval)
}, [])
```

One interval, mounted once, cleared on unmount. It is the only timer in the application.

**500 ms rather than 1000 ms** because a one-second interval drifts against the second
boundary and the displayed seconds digit visibly skips a value — which, on a clock a room
full of people is watching, reads as a broken clock. Sampling twice as fast as the finest
displayed unit is the cheapest fix.

**What the tick costs.** Every tick re-renders `App`, which re-runs `getRankedContestants()`
— a copy, a sort and a map over the roster — and re-renders `Arena`, `GlobalTimer` and every
`ContestantCard`. That is 7,200 renders an hour. At party scale (tens of contestants) this
is free; the sort is over a handful of items and React's reconciliation touches a few dozen
nodes. It is worth knowing about because it constrains what may be computed per render:

- Anything derived per render must be **deterministic**, or it will visibly change twice a
  second. A random value would make the board tremble.
- Anything expensive per render is paid 7,200 times.
- Anything that *fires* per render — an animation, a notification, a write — needs a guard
  against firing on every tick, not merely a condition that happens to be true once.

`Arena` memoises the search filter with `useMemo`, which is the one place memoisation is
present. It is not obviously necessary at this scale; it is also not wrong.

## 6. Persistence

`src/lib/storage.ts` is 30 lines and the entire persistence layer.

```ts
const KEY = 'faxing-state-v1'

interface PersistedState {
  screen: Screen
  contestants: Contestant[]
  contestStartTime: number | null
}
```

**Written** by an effect in `App.tsx` on every change to those three values. There is no
debounce: writes are driven by an operator's finger, not by the clock, and `now` is
deliberately absent from the dependency array — it derives from `contestStartTime` and holds
nothing worth saving. Adding `now` there would turn a handful of writes an hour into 7,200.

**Read** by three lazy `useState` initialisers, so the restore happens *before the first
render*. This is what prevents the enlistment screen appearing for one frame in front of a
contest already under way. (It also means `loadState()` runs three times on mount — see
[D6](#d6-loadstate-runs-three-times-on-mount).)

**Failure is swallowed by design.** Both `loadState` and `saveState` wrap their access in
`try`/`catch`; a failed read is treated as nothing stored and a failed write is ignored.
`localStorage` throws rather than returning an error in several ordinary situations — a
private window, a full quota, a browser set to block site data — and in every one of them
running the tournament without persistence is strictly better than not running it. The
operator is not told, because there is nothing they can do about it mid-contest.

**The key is versioned** so a future change to the shape need not read an older one. Bumping
`-v1` discards old tournaments, which is acceptable — a tournament is an hour long — and is
preferable to migration code for a structure this small.

**No title is persisted.** Titles derive ([§4](#4-the-titling-rules)); persisting them would
create a second source of truth that could disagree with the finish instants.

The consequence of all this is that a tournament lives on exactly one device and one browser
profile. Moving to another device is starting a new tournament. That is not a limitation
being worked around — it is the architecture, and it is why nothing leaves the machine.

## 7. The component tree

**`Registration.tsx`** — the enlistment screen. Holds the name field, the gender toggle and
the validation message as local state. Validation is three rules, all in `handleAdd`: trim,
reject empty, reject a case-insensitive duplicate. The 30-character cap is `maxLength` on
the input and is *not* re-checked in the handler, so it is a UI affordance rather than an
enforced invariant. The start control is genuinely `disabled` when the roster is empty, not
merely styled so.

**`Arena.tsx`** — the live board. Receives the already-ranked list and partitions it into
three groups:

```ts
finished = filtered.filter(c => c.finishedAt)
active   = filtered.filter(c => !c.finishedAt && !c.disqualified && !contestOver)
failed   = filtered.filter(c => c.disqualified || (!c.finishedAt && contestOver))
```

The `!contestOver` term in `active` is what moves every straggler into `failed` the moment
the hour expires — the transition costs nothing and is not an event. An empty group renders
nothing at all, not an empty heading.

The search bar appears only at five or more contestants, because it costs a permanent strip
of screen on a board scrolled with a thumb and below five cards the operator finds the name
faster by looking. Filtering affects only which cards render: ranks and titles are computed
over the whole roster in `App.tsx`, so a filtered board never renumbers.

Reset is the one confirmed action on the board. Finish and forfeit are not, deliberately:
they are pressed in a crowd at arm's length, a confirmation step is a second thing to hit,
and a missed finish loses the instant that decides a crown. Reset is confirmed because it is
the only irreversible one.

**`GlobalTimer.tsx`** — pure presentation. Formats `m:ss`, extending to `h:mm:ss` only while
an hour or more remains, clamps negatives to zero and progress to 100%, and carries two
states: urgent under five minutes remaining, and over at expiry. The two are mutually
exclusive — `urgent` requires `!contestOver` — because a clock that was both would be asking
for action that is no longer possible.

**`ContestantCard.tsx`** — pure presentation. `TITLE_META` maps each title to an emblem, a
colour class and a label; it is the only place the four titles are given visual identity.
`formatElapsed` renders a fixed `mm:ss` for a finisher, computed from the stored instants, so
a finishing time does not continue to advance. `BeerProgress` renders the progress bar — see
[D2](#d2-the-per-card-gauge-is-the-global-clock).

## 8. The visual layer

There is no CSS framework, no preprocessor, no CSS-in-JS and no design-token build step.
`src/index.css` holds a reset, a token block of custom properties, and the `body` ground;
`src/App.css` holds every component rule, about 650 lines, keyed on class names the
components emit. Fonts are four families from Google Fonts, requested in `index.html`.

The token block is the seam that makes the visual layer replaceable: every colour in
`App.css` resolves through a custom property, so re-liveried is twenty-two declarations plus
the rules that need new *structure*. That is the assumption
[`restyle-order-livery`](openspec/changes/restyle-order-livery/) is built on.

The current livery is Faxe brewery livery — a warm brown ground, a gold ramp, two radial
washes, a diamond tile, and the byline `Faxe Bryggeri · Grundlagt 1901 · Danmark` — and is
being replaced; see that change's [proposal](openspec/changes/restyle-order-livery/proposal.md)
for why.

Two facts about the current stylesheet are worth knowing before editing it: `MedievalSharp`
is requested in `index.html` and referenced by no rule, and `Cinzel Decorative` carries only
the wordmark.

## 9. Invariants

These hold today. Most of them fail *silently* when broken, which is why they are written
down rather than left to be inferred.

1. **No title is ever stored.** Titles are computed in `getRankedContestants()` and nowhere
   else. A stored title is a second source of truth that will eventually disagree with the
   finish instants.
2. **All durations derive from two absolute instants.** Nothing accumulates elapsed time. A
   counter would stop when the tab is backgrounded and report an expired contest as open.
3. **`contestStartTime` is written once per contest** — at `startContest`, and cleared at
   `resetContest`. Recomputing it would silently reset every contestant's elapsed time.
4. **A recorded `finishedAt` is never overwritten or cleared.** It is the sole evidence
   behind a crown and there is no audit trail from which its loss could be detected. The
   card's controls disappear once a contestant is resolved, which is the guard.
   ([D3](#d3-markdisqualified-clears-a-recorded-finish) is a latent breach.)
5. **The forfeit branch precedes the crown branches.** Branch order is the rule that stops a
   contestant who gave up from consuming a crown.
6. **Ranks and titles are computed over the whole roster, never over the filtered view.** A
   rank that renumbered under a search would report second place as the winner.
7. **`now` is not in the persistence effect's dependency array.** Putting it there turns a
   handful of writes an hour into 7,200.
8. **Storage access never throws out of `storage.ts`.** Every entry point catches. The
   tournament must run in a private window.
9. **Nothing leaves the device.** No `fetch`, no `XMLHttpRequest`, no WebSocket, no
   analytics, no error reporter. The only network traffic is the app's own assets and the
   Google Fonts request. Contestant names and finish instants are ordinary personal data
   about identifiable people who are drinking, and the architecture's answer is that they
   never go anywhere.
10. **Child components hold no tournament state.** `Arena`'s search query and confirmation
    flag are view state; they are not persisted and nothing outside `Arena` can observe
    them.

## 10. Known defects

Real, reproducible, and none of them fixed by
[`restyle-order-livery`](openspec/changes/restyle-order-livery/), which changes no
behaviour. Each is a candidate for its own change. They are listed worst first.

### D1: A finish recorded after the hour earns a title

**Reachable from the interface.** `ContestantCard` renders its finish and forfeit controls
whenever `!finishedAt && !disqualified`, and that is still true after the hour has expired —
the card has moved into the `failed` group but its controls are intact. Pressing
`🍺 Fuldbragt!` there sets `finishedAt` to the current instant, and `getRankedContestants()`
computes `outOfTime` only for contestants who have *not* finished:

```ts
const finished   = c.finishedAt !== null
const outOfTime  = !finished && elapsed >= CONTEST_DURATION_MS
```

So the late finisher takes the `finished` branch and is awarded `Faxeridder` — or
`Faxekonge`, if no man finished within the hour. A `Hestemann` is promoted to a knight by a
late tap, and if the crown was still vacant, to king.

The tournament's stated rule is *within the hour*, and
[`title-award`](openspec/specs/title-award/spec.md) specifies this explicitly under
*A finish recorded after expiry earns no title*. The code violates the spec.

The fix is one line at the decision site rather than at the control — hiding the buttons
after expiry would leave the same bug reachable by any other path to `markFinished` — but it
needs a decision about what should happen to the tap: refuse it, or record the instant and
still award `Hestemann`. Recording it is better; the instant is evidence, and "finished, but
too late" is a real outcome the board could show.

### D2: The per-card gauge is the global clock

`Arena` passes the **global** `elapsedMs` to every in-progress card:

```tsx
<ContestantCard ... elapsedMs={elapsedMs} durationMs={durationMs} ... />
```

So every active contestant's beer-fill bar and percentage are identical, and they measure
the hour rather than the person. This is not fixable as written: the system records nothing
about how much any individual has drunk, and a contestant's litre is not instrumented.

It is a defect of *presentation*, not of data. A bar filling with beer next to a person's
name, captioned with a percentage, states a measurement that was never taken. The fix is a
caption — and that is the one repair
[`restyle-order-livery`](openspec/changes/restyle-order-livery/) does make, under
*The in-progress indication is a vessel gauge, captioned as the hour*.

### D3: `markDisqualified` clears a recorded finish

```ts
setContestants(prev => prev.map(c =>
  c.id === id ? { ...c, disqualified: true, finishedAt: null } : c
))
```

Unlike `markFinished`, this has no guard on the contestant's current state, and it sets
`finishedAt: null`. Applied to somebody who has already finished, it destroys the instant
that decided their crown — silently, with nothing left from which the loss could be
detected.

**Not currently reachable**, because the card hides both controls once a contestant is
resolved. It is listed because invariant 4 is the one invariant in this system with no
recovery path, and this is a live code path one prop change away from breaching it.

### D4: `crypto.randomUUID()` requires a secure context

`addContestant` calls `crypto.randomUUID()`, which is only available in a secure context —
HTTPS, or `localhost`. It is **not** available over plain HTTP from a LAN address.

This breaks the most natural way to actually use this application: run `npm run dev --host`
on a laptop and open `http://192.168.1.x:5173` on the phone that will be carried around the
room. Enlisting the first contestant throws `crypto.randomUUID is not a function`, and there
is no error boundary, so the screen goes blank.

The workaround today is to run it on the phone's own `localhost`, or to serve over HTTPS, or
to tunnel. The fix is a four-line fallback — `crypto.randomUUID?.() ?? <counter or
timestamp+random>` — and it needs no spec change, since
[`contestant-roster`](openspec/specs/contestant-roster/spec.md) requires only that the
identifier be unique within the tournament and stable across a reload.

### D5: Persisted state is cast, not validated

```ts
return JSON.parse(raw) as PersistedState
```

`as` is an assertion, not a check. Anything that parses as JSON flows into React state
unexamined — a hand-edited value, a partially written record, or a `-v1` payload from a
future version that reused the key. The failure surfaces later and somewhere else: a
`contestants` that is not an array reaches `.map`, and the screen goes blank with a stack
trace pointing at the render rather than at the load.

The versioned key limits *accidental* schema drift, which is what it was for. It does
nothing about a malformed payload.

A shape check at the boundary — array-ness, the four fields, the two gender values — would
turn a blank screen into a fresh tournament, which is the behaviour
[`session-persistence`](openspec/specs/session-persistence/spec.md) already specifies for an
unparseable value.

### D6: `loadState()` runs three times on mount

Three lazy initialisers each call it, so mount does three `localStorage` reads and three
`JSON.parse` calls of the same string.

Harmless — it is one synchronous read of a few hundred bytes, once. It is recorded because
the obvious tidy-up (hoist the call above the component) is subtly wrong: a module-level
call runs at import time rather than at mount, and would return stale data if `App` ever
remounted. The correct tidy-up is one `useState` holding a single restored object, or a
`useMemo`-free `const restored = loadState()` inside the component body. Neither is urgent.

## 11. What is deliberately absent

Naming these stops them being re-proposed as oversights.

**A backend, accounts, and any network call.** Contestant names and finish instants are data
about identifiable people who are drinking. Keeping it on one device is not a limitation
worked around; it is the answer. See invariant 9.

**A router and shareable URLs.** The tournament lives in `localStorage`, so a URL could not
carry it. Adding a route would produce a link that opens an empty tournament on somebody
else's phone, which is worse than no link.

**Multi-device or spectator views.** These require a backend. The board is walked around the
room; that is the interaction the application is designed for, and one device makes it
impossible to be inconsistent rather than merely unreliable.

**A test suite.** There is none. This is the largest genuine gap in the project — see
[CLAUDE.md](CLAUDE.md) — and the titling rules in particular are pure, dependency-free, and
the easiest thing in the world to test. [D1](#d1-a-finish-recorded-after-the-hour-earns-a-title)
is precisely the defect one assertion would have caught.

**Undo.** Reset is confirmed instead. Finish and forfeit are unconfirmed and unreversible by
design; the recovery path for a mis-tap is tolerating a wrong card for an hour.

**Editing a contestant after enlistment.** The roster is frozen when the contest begins,
because every title compares finish times against one common start, and a contestant added
mid-flight would be measured from a start they did not share.

**More than two genders.** There are exactly two crowns, and `gender` is the input to a
titling rule rather than a demographic record. A third value would need a third crown or a
rule for what it does instead — a product decision, not a schema one.

**A pause.** There is no way to stop the clock, because there is no accumulator to stop
([§3](#3-the-derivation-chain)). Pausing would mean storing accumulated elapsed time and
losing the property that makes the clock honest across a reload.

**Theming, dark mode, appearance preferences.** There is one livery.

**State management, a router, a component library, a CSS framework, an icon package, a date
library.** Two runtime dependencies. `Date.now()`, `Intl`-free integer arithmetic and
`localStorage` cover everything here.

## 12. Vocabulary

| Danish | Meaning |
|---|---|
| **Faxing** | The contest: drinking one litre of Faxe Extra Strong (10%) within one hour |
| **Faxekonge** | *Faxe king* — the first man to finish within the hour |
| **Faxedronning** | *Faxe queen* — the first woman to finish within the hour |
| **Faxeridder** | *Faxe knight* — any other contestant who finishes within the hour |
| **Hestemann** | *Horseman* — a contestant who gave up, or who did not finish in time |
| **Kriger** | *Warrior* — a contestant |
| **Innskriv** | *Enlist* — add a contestant to the roster |
| **Begyn Kampen** | *Begin the battle* — start the hour |
| **Fuldbragt** | *Accomplished* — record a finish |
| **Gav Op** | *Gave up* — record a forfeit |
| **Ærens Hal** | *Hall of honour* — the finishers' group on the board |
| **Drikker Endnu** | *Still drinking* — the in-progress group |
| **Ny Turnering** | *New tournament* — reset |
| **Drikk med Maadehold** | *Drink in moderation* — the footer notice |

Two further terms arrive with
[`restyle-order-livery`](openspec/changes/restyle-order-livery/):

| Term | Meaning |
|---|---|
| **In Faxe Veritas** | *In Faxe, truth* — the order's motto, displayed beneath the wordmark |
| **Gloria Faxem!** | *Glory to Faxe!* — the order's chant; starts the contest and acclaims a crown |

## 13. Where the next change attaches

**A visual change** attaches at the token block in `src/index.css` and the rules in
`src/App.css`. Every colour already resolves through a custom property. Components need
touching only where new content appears. This is the seam
[`restyle-order-livery`](openspec/changes/restyle-order-livery/) uses.

**A rules change** attaches at `getRankedContestants()` in `App.tsx` and nowhere else. It is
pure, it takes the roster and two numbers, and it returns titles. Changing a title's
condition is changing one branch.
[`openspec/specs/title-award/spec.md`](openspec/specs/title-award/spec.md) is the contract;
update it first.

**A new field on a contestant** attaches at `Contestant` in `src/types.ts`, the object
literal in `addContestant`, and — if it must survive a reload — nothing else, because
`PersistedState` embeds `Contestant[]` directly. Bump `KEY` to `-v2` if the field is
required rather than optional, or the restore will produce records missing it.

**Anything that fires on a state transition** — an animation, a sound, a notification — must
guard against the tick. Titles are recomputed on every render, so a condition like "a
`Faxekonge` exists" is true for the rest of the hour, and acting on it directly fires 7,200
times. The pattern is a `useRef` recording what has already fired, held in the component
that owns the view; see the acclamation in
[`restyle-order-livery`'s design](openspec/changes/restyle-order-livery/design.md).

**A test suite** attaches most usefully at `getRankedContestants()`, which would need
extracting from `App.tsx` into `src/lib/` first — it closes over nothing but its arguments,
so the extraction is a move. Every defect in [§10](#10-known-defects) except D2 and D4 is
one assertion away from being caught.

**Anything requiring a second device** does not attach. It needs a backend, and that is a
different application; see [§11](#11-what-is-deliberately-absent).
