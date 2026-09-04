# ⚔ Faxing-Mesterskapet

> *Eet Gammelnordisk Webbe-Verktøy for afviklingen af een **Faxing**-Turnering — den ædle
> Kunst at fortære een hel Litre Faxe Extra Strong inden Timens Udløb.*
>
> **Drikk med Maadehold. Kjennd Eders Grændser.**

A single-page web application for running one drinking tournament. Enlist the contestants,
start a one-hour clock, tap a card when somebody finishes their litre, and the four titles
fall out on their own.

It runs entirely in one browser on one device. There is no account, no server, and nothing
leaves the phone.

The interface is in archaic Danish. This documentation is in English, because a document
whose job is to stop you breaking the titling rules should be precise before it is charming.
Every Danish term is glossed in [Vocabulary](#vocabulary).

---

## Contents

- [The rules](#the-rules)
- [Where the project is right now](#where-the-project-is-right-now)
- [Quickstart](#quickstart)
- [Running it for real: the phone problem](#running-it-for-real-the-phone-problem)
- [Every command](#every-command)
- [Running a tournament](#running-a-tournament)
- [The titles, precisely](#the-titles-precisely)
- [What survives a reload](#what-survives-a-reload)
- [Repository layout](#repository-layout)
- [Specifications](#specifications)
- [Working on this repository](#working-on-this-repository)
- [Known problems](#known-problems)
- [Vocabulary](#vocabulary)
- [Where to go next](#where-to-go-next)

---

## The rules

One litre of Faxe Extra Strong (10% ABV). One hour. Four possible outcomes.

| Titel | Betingelse |
|---|---|
| 👑 **Faxekonge** | The first **man** to finish within the hour |
| 👑 **Faxedronning** | The first **woman** to finish within the hour |
| ⚔ **Faxeridder** | Any other warrior who finishes within the hour |
| 🐴 **Hestemann** | Gave up, or did not finish before the hour was out |

Each crown is awarded once. If no woman finishes, no `Faxedronning` is crowned — the title
is simply not awarded, and it is never given to a man instead.

Precedence is decided by the **recorded finish instant**, not by the order in which the
operator managed to tap the cards. This matters more than it sounds: the operator is
crossing a crowded room, and taps the nearer card first.

> A litre of 10% beer is roughly eight standard units, and the whole point of this
> application is that people attempt it against a clock. The footer says
> *Drikk med Maadehold* for a reason and it is not decoration.

---

## Where the project is right now

**Working and used.** Enlistment, the hour, the four titles, the live board, search,
reset-with-confirmation, and full survival of a page reload mid-contest.

**Adopted spec-first.** The five existing capabilities have been written up as OpenSpec
specifications in `openspec/specs/`, reverse-engineered from the shipped implementation.
They are the source of truth from here on. See [Specifications](#specifications).

**One change open.** [`restyle-order-livery`](openspec/changes/restyle-order-livery/) —
replacing the brewery livery with the order's own heraldry rendered as pixel art on a CRT.
Specified, not yet implemented. It changes no behaviour.

**Known to be broken in one important way.** Running it over a LAN address — the natural way
to use it, laptop serving and phone operating — crashes on enlisting the first contestant.
See [Known problems](#known-problems). Operate from the device's own `localhost` until it is
fixed.

**No test suite.** This is the largest gap in the project and it is not being hidden.
`npm run typecheck` is the only automated check that exists.

---

## Quickstart

### What you need first

Node 18 or newer, and a browser. That is all — there is no database, no environment file, no
API key and no service to start.

### Two commands to a running tournament

```bash
npm install
npm run dev
```

Open [http://localhost:5173](http://localhost:5173). Enlist a warrior, press
**⚔ Begyn Kampen ⚔**, and the hour starts.

Begivenheds-Historikken trænger en Postgres-Database. Sæt i `.env.local`:

```bash
DATABASE_URL=postgres://user:pass@host:5432/faxing
FAXEPAVE_PASSWORD=...   # Faxepavens Adgangsord for Redigering
```

### Drift

`npm run build` bygger Appen (`dist/`) og API-Serveren (`server.cjs`); `npm start` kører begge paa Port 8080.
Serveren opretter Tabellen `faxing_events` ved Opstart. Paa Raspberry Pi kører den med en Postgres-Beholder, se `deploy/compose.yml`.

---

## Running it for real: the phone problem

The way this application wants to be used is: serve it from a laptop, operate it from a
phone carried around the room.

```bash
npm run dev -- --host      # prints a LAN address, e.g. http://192.168.1.42:5173
```

**This currently crashes on enlisting the first contestant.** `crypto.randomUUID()` is only
available in a secure context — HTTPS or `localhost` — and a plain-HTTP LAN address is
neither. There is no error boundary, so the screen goes blank.

Until it is fixed, the options are:

- **Operate from the serving device itself**, on `localhost`. Works today, and is fine if
  the laptop or phone running the dev server is the one being carried.
- **Serve over HTTPS**, or through a tunnel that terminates TLS.

The fix is a four-line fallback for the identifier and it needs no specification change; see
[ARCHITECTURE.md D4](ARCHITECTURE.md#d4-cryptorandomuuid-requires-a-secure-context).

---

## Every command

```bash
npm install                 # once
npm run dev                 # Vite dev server on :5173
npm run dev -- --host       # also serve on the LAN (see the phone problem above)
npm run typecheck           # tsc --noEmit for app and server, strict — the only automated check
npm run build               # tsc, vite build into dist/, then bundle the API server to server.cjs
npm run preview             # serve the built output
npm start                   # run server.cjs (app + events API) on :8080

openspec list                                # open changes
openspec validate --specs --strict           # the main specifications
openspec validate <change-id> --strict       # one change
openspec status --change <change-id>         # artifact completeness
openspec view                                # interactive dashboard
```

`npm run typecheck` before every commit.

---

## Running a tournament

### Enlisting warriors

Type a name, pick **♂ Herre** or **♀ Dame**, press **+ Innskriv**.

- Names are trimmed and must be unique, compared **without regard to case**. `Anders` and
  `anders` are treated as the same person — because they usually are, and a board with the
  same name on two cards is a board the operator cannot act on.
- Two genuinely different people sharing a first name must be distinguished in the name
  itself. The roster holds no other field.
- Names cap at 30 characters, so that a card does not break.
- **♂/♀ is not a demographic field.** It is the input to the crown rules — there are exactly
  two crowns — and it is why the value is binary.
- Remove anybody with **✕**. No confirmation: nothing has been earned yet, and re-typing a
  name is cheaper than a confirmation step paid on every correction.

### Starting

Press **⚔ Begyn Kampen ⚔**. Disabled until at least one warrior is enlisted.

This records the start instant and moves to the board. **The roster is frozen from here** —
there is no way to add a contestant mid-contest, because every title compares finish times
against one common start, and a latecomer would be measured from a start they did not share.

### The board

Three groups, in a fixed order, so the operator builds muscle memory for where a card lives:

| Group | Contains |
|---|---|
| ⚔ **Ærens Hal** | Everybody who has finished, ranked by finish instant |
| ⏳ **Drikker Endnu** | Everybody still going |
| 🐴 **Hestemann** | Everybody who gave up, plus — once the hour is out — everybody who did not finish |

An empty group is not displayed at all. A heading with nothing under it reads, across a
room, as a card that failed to render.

The timer at the top shows time **remaining** as the main figure, with elapsed time beneath
it — remaining is what the room is acting on, elapsed is the unit the finishing times on the
cards are in. Under five minutes it goes urgent.

### Recording a finish, and a forfeit

When somebody empties their can, press **🍺 Fuldbragt!** on their card. When somebody gives
up, press **✕ Gav Op** — they become a `Hestemann` immediately, regardless of the time left.

Neither is confirmed, deliberately. These are pressed in a crowd at arm's length; a
confirmation is a second thing to hit, and a missed finish loses the instant that decides a
crown. Both controls disappear once a contestant is resolved, which is what stops a card
being pressed twice.

A forfeit does **not** consume a crown. Somebody who gave up did not finish, so the next
man or woman to finish still takes the title.

### Searching

At five or more contestants a search bar appears. Substring match, case-insensitive — the
operator is as likely to have been handed a surname as a first name.

Filtering only hides cards. **Ranks and titles stay computed over the whole roster**, so a
filtered board never renumbers second place into first.

### When the hour is out

The timer declares **⚔ Kampen er Endt ⚔** and every unfinished warrior moves to
`Hestemann`. Nothing needs pressing; the transition is not an event.

### Starting over

**↩ Ny Turnering**, then confirm. This is the one confirmed action on the board, because it
is the only irreversible one: it discards the roster, the start instant and every finish
instant, with no undo and no record kept.

---

## The titles, precisely

The rule the tournament states is *within the hour*, and every title is decided by one pure
function of recorded facts:

```
disqualified                        → Hestemann
finished, male, crown unclaimed     → Faxekonge
finished, female, crown unclaimed   → Faxedronning
finished                            → Faxeridder
not finished, hour expired          → Hestemann
otherwise                           → no title yet
```

Two things follow that are worth stating plainly:

**No title is ever stored.** Titles are recomputed from the finish instants on every render.
That is why a reload restores the same crowns, and why it is impossible for a stored title
to disagree with the facts behind it.

**Holding no title is not the same as being a `Hestemann`.** A contestant who is still
drinking has no title. Rendering that as failure would condemn everybody for the first
fifty-nine minutes.

There is currently **one place where the code disagrees with these rules**: a finish
recorded *after* the hour has expired still earns a knighthood, or a vacant crown. See
[Known problems](#known-problems).

---

## What survives a reload

All of it. The roster, the recorded finishes, the forfeits, which screen you were on, and
the clock — at the right place, not where it was interrupted.

The contest's start is stored as an absolute instant and every duration is derived from it,
so the hour keeps running while the tab is closed, the app is backgrounded or the laptop is
asleep. An hour of wall-clock time is an hour of contest.

The limits are worth knowing:

- **One device, one browser profile.** The tournament is in `localStorage`. Opening the app
  on a second device starts a second, empty tournament. There is no sync and cannot be
  without a backend.
- **A private window may not persist.** If the browser refuses storage, the tournament runs
  normally but will not survive a reload. You are not warned, because there is nothing to be
  done about it mid-contest.
- **Confirming a reset erases it.** That is the point of the confirmation.

---

## Repository layout

```
index.html                     Vite entry; the Google Fonts request
vite.config.ts                 Vite + React plugin. Nothing else.
tsconfig*.json                 Strict, with noUnusedLocals / noUnusedParameters

src/
├── main.tsx                   Mounts <App /> in StrictMode
├── App.tsx                    ALL tournament state, the titling rules, the 500 ms tick
├── types.ts                   Contestant, RankedContestant, Title, Gender, Screen
├── index.css                  Reset, the colour and font token block, the page ground
├── App.css                    Every component rule (~650 lines)
├── lib/
│   └── storage.ts             localStorage read / write / clear. 30 lines.
└── components/
    ├── Registration.tsx       Enlistment screen
    ├── Arena.tsx              Live board: grouping, search, reset confirmation
    ├── GlobalTimer.tsx        The hour, formatted. Pure presentation.
    └── ContestantCard.tsx     One warrior's card. Pure presentation.

openspec/
├── specs/                     The five capabilities — the source of truth
└── changes/                   Open changes, spec-first

ARCHITECTURE.md                How it works, the invariants, the known defects
CLAUDE.md                      Working conventions and the hard rules
```

`App.tsx` is where the tournament is. Everything in `components/` takes props and returns
markup.

---

## Specifications

Behaviour is defined before it is built. The `openspec/specs/` directory is the source of
truth for what this application does — not the code.

| Capability | Covers |
|---|---|
| [`contestant-roster`](openspec/specs/contestant-roster/spec.md) | Enlistment, validation, the start gate |
| [`contest-clock`](openspec/specs/contest-clock/spec.md) | The hour, the tick, urgency, expiry |
| [`title-award`](openspec/specs/title-award/spec.md) | The four titles and who gets them |
| [`arena-board`](openspec/specs/arena-board/spec.md) | The live board, grouping, search, reset |
| [`session-persistence`](openspec/specs/session-persistence/spec.md) | Surviving a reload |

These were written from the shipped implementation when the project adopted OpenSpec, so
they record real behaviour rather than an aspiration. **Where a spec and the code disagree,
the spec is right and the code has a defect.**

Open changes live in `openspec/changes/<id>/` as a proposal, delta specs, a design and a
task list. One is open:

- [**`restyle-order-livery`**](openspec/changes/restyle-order-livery/) — replace the brewery
  livery with the order's own heraldry: a semantic near-black / bone / blood-red palette, a
  CRT atmospheric layer, the pixel-art sigil, the motto *In Faxe Veritas*, and the chant
  *Gloria Faxem!*. Two new capabilities, `order-livery` and `crt-display`. No behaviour
  changes.

---

## Working on this repository

Read [CLAUDE.md](CLAUDE.md) for the conventions and the hard rules, and
[ARCHITECTURE.md](ARCHITECTURE.md) for how the thing actually works. The short version:

- **Two runtime dependencies.** Keep it that way. `Date.now()`, integer arithmetic and
  `localStorage` cover everything here.
- **Never store a title, never accumulate elapsed time, never clear a `finishedAt`.** All
  three fail silently. [ARCHITECTURE.md §9](ARCHITECTURE.md#9-invariants) has the full list
  and the reasoning.
- **The Danish stays Danish.** Every interface string is archaic Danish and that is the
  product's voice. Code, comments and docs are English; the interface is not.
- **Colours go through a token.** Every colour in `App.css` resolves to a custom property in
  `index.css`. That seam is what makes the livery replaceable.
- **Spec it first** unless it is a genuine one-off — and if you skip the spec, say in one
  line why that was safe.

### Technology

- [React 18](https://react.dev/) — two components deep, no context, no store, no router
- [TypeScript 5](https://www.typescriptlang.org/) — strict
- [Vite 6](https://vitejs.dev/)
- Postgres via `api/` (Vercel-style handlers), served by `server/index.ts` in production
- Hand-written CSS, ~700 lines, no framework and no preprocessor
- [OpenSpec](https://github.com/Fission-AI/OpenSpec) for the specifications

---

## Known problems

Real, reproducible, and each one a candidate for its own change. Full write-ups in
[ARCHITECTURE.md §10](ARCHITECTURE.md#10-known-defects).

| | Problem | Effect |
|---|---|---|
| **D1** | A finish recorded after the hour still earns a title | Tapping **🍺 Fuldbragt!** on a `Hestemann` card after expiry promotes them to `Faxeridder` — or to `Faxekonge`, if no man finished in time. The controls are still on the card after the hour. This violates the stated rule and the specification. |
| **D2** | The per-card progress bar is the global clock | Every warrior's beer-fill bar and percentage are identical: it measures the hour, not the person. Nothing about an individual's drinking is recorded, so the bar states a measurement that was never taken. |
| **D3** | `markDisqualified` clears a recorded finish | Not reachable from the interface today, but a live code path one prop change away from destroying the evidence behind a crown. |
| **D4** | `crypto.randomUUID()` needs a secure context | Over a plain-HTTP LAN address, enlisting the first contestant throws and the screen goes blank. This breaks the intended laptop-serves / phone-operates setup. |
| **D5** | Persisted state is cast, not validated | A malformed stored value flows into React state unexamined and fails later, somewhere else, as a blank screen. |
| **D6** | `loadState()` runs three times on mount | Harmless. Noted because the obvious tidy-up — hoisting the call to module scope — is subtly wrong. |

`node_modules/` is also currently tracked in git by mistake. A `.gitignore` now exists;
untracking the 2,430 committed files is a separate, deliberate commit.

---

## Vocabulary

| Danish | Meaning |
|---|---|
| **Faxing** | The contest: one litre of Faxe Extra Strong (10%) within one hour |
| **Faxekonge** | *Faxe king* — first man to finish within the hour |
| **Faxedronning** | *Faxe queen* — first woman to finish within the hour |
| **Faxeridder** | *Faxe knight* — any other warrior who finishes within the hour |
| **Hestemann** | *Horseman* — gave up, or did not finish in time |
| **Kriger** | *Warrior* — a contestant |
| **Herre / Dame** | *Lord / Lady* — the two gender options |
| **Innskriv** | *Enlist* — add a contestant |
| **Begyn Kampen** | *Begin the battle* — start the hour |
| **Fuldbragt** | *Accomplished* — record a finish |
| **Gav Op** | *Gave up* — record a forfeit |
| **Ærens Hal** | *Hall of honour* — the finishers' group |
| **Drikker Endnu** | *Still drinking* — the in-progress group |
| **Kampen er Endt** | *The battle has ended* — the hour is out |
| **Ny Turnering** | *New tournament* — reset |
| **Søk efter en Kriger** | *Search for a warrior* |
| **Drikk med Maadehold** | *Drink in moderation* |

Arriving with [`restyle-order-livery`](openspec/changes/restyle-order-livery/):

| Term | Meaning |
|---|---|
| **In Faxe Veritas** | *In Faxe, truth* — the order's motto |
| **Gloria Faxem!** | *Glory to Faxe!* — the order's chant; opens a contest and acclaims a crown |
| **Registrum / Vigilia / Arena / Chronica** | The Latin plaques naming enlistment, the clock, the in-progress group and the hall of honour |

---

## Where to go next

- **To run one** — [Quickstart](#quickstart), then
  [Running it for real](#running-it-for-real-the-phone-problem).
- **To understand it** — [ARCHITECTURE.md](ARCHITECTURE.md). Start at §2–4: three pieces of
  state, one clock, and everything else derived.
- **To change it** — [CLAUDE.md](CLAUDE.md) for the rules, then `openspec/specs/` for what
  the application is contracted to do.
- **To fix something real** — [Known problems](#known-problems). D1 is the one that gets a
  title wrong; D4 is the one that stops the application being used as intended.

---

*⚜ Drikk med Maadehold ⚜*
