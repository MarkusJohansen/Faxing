<h1 align="center">Faxing</h1>

<p align="center">
  <strong>A shared scoreboard for a one-hour drinking contest: the room joins from their own
  phones, the clock is the server's, and the four titles fall out of recorded finish times.<br>
  The titles are worked out by one pure function, and the test for it runs in under a second.</strong>
</p>

<!-- Text, not shields.io. Remote badge images would be remote fetches at the top of the file,
     and they rot silently when a service changes. Keep these local. -->
<p align="center">
  <code>node&nbsp;22</code> &nbsp;
  <code>react&nbsp;18</code> &nbsp;
  <code>3&nbsp;runtime&nbsp;deps</code> &nbsp;
  <code>no&nbsp;test&nbsp;runner</code> &nbsp;
  <code>private&nbsp;project</code>
</p>

---

## Contents

| | |
| --- | --- |
| [Why this exists](#why-this-exists) | the constraint that shapes the whole design |
| [How it works](#how-it-works) | the flow from a join to a closed chronicle |
| [Where the project is right now](#where-the-project-is-right-now) | what runs, what is unmeasured, what is open |
| [Quickstart](#quickstart) | what you need, and the commands to a running room |
| [Every command](#every-command) | the full entry-point table |
| [Repository layout](#repository-layout) | the map, with the reason each file exists |
| [Configuration](#configuration) | the environment variables, and what is enforced about them |
| [Measuring it](#measuring-it) | what the one check can establish, and what it cannot |
| [Working on this repository](#working-on-this-repository) | the pre-commit step, and the rules that fail silently |
| [Vocabulary](#vocabulary) | the Norwegian terms in the interface |
| [Where to go next](#where-to-go-next) | the other documents, each with a reason |

---

## Why this exists

A drinking contest has one fact that matters: **who finished inside the hour, and in what
order.** The organiser is walking a crowded room with a phone, and has to record finishes
fast, without a second tap to confirm, and without anyone being able to argue the time
afterwards.

That constraint produces the design:

- **The finish instant is the evidence.** Titles are never stored; they are recomputed from
  the recorded instants on every render. A stored title could disagree with the instant it
  came from, and nothing would error.
- **Time comes from the server, not the phone.** Once several phones share one room, a skewed
  clock on one of them must not move a finish.
- **Losing a contest is the worst outcome.** So the server holds the state, and a phone
  reload, a sleeping laptop or a closed tab does not lose it.

The cost is that the app needs a server and a Postgres database. Earlier versions were a
single-page app with `localStorage` only; that was removed when the contest moved into a
shared room.

---

## How it works

One finish, from a participant's phone to the board:

```
participant taps "Fullbragt!"
   │
   ▼
POST /api/rooms  { action: "finish" }      carries the device's member token
   │
   ▼
server: lock the room row, check the caller owns the row,
        check the hour has not run out, stamp finished_at = server now
   │
   ▼
every phone polls GET /api/rooms every 2 s
   │
   ▼
rankContestants(members, start, serverNow)  ──►  title, rank, group, for every card
```

Two decisions in that path are easy to get wrong:

**The server stamps the time.** The phone sends an action, not a timestamp. A phone whose
clock is wrong, or which is asleep, cannot move a finish. Each poll also carries the server's
time, so every phone shows the same remaining time.

**The same ranking function runs on the phone and on the server.** `src/lib/ranking.ts` is
imported by both. The server uses it to write the chronicle when a room closes, so the titles
in the archive are the titles the room saw.

The full path, with the permission table and the schema, is in
[ARCHITECTURE.md](ARCHITECTURE.md).

---

## Where the project is right now

| Workstream | Status | What backs it |
| --- | --- | --- |
| Shared rooms: join by code, host runs the start and corrections, close into the chronicle | **Built** | `openspec/changes/faxing-rooms` marked complete; commit `3dd4747` |
| Titles: five crowns and their rules, with the forfeit and late-finish cases | **Built** | `npm run check:rules`, 7 assertions, all passing |
| The chronicle: archive list, event view, Faxepave-only edits | **Built** | `api/events.ts`, `src/components/History.tsx`, `EventView.tsx` |
| Moonlit night livery: header scene, torches, graveyard footer | **Built, 19 of 23 tasks** | `openspec/changes/moonlit-gothic-livery` |
| Heraldry livery (`restyle-order-livery`) | **Specified, not built**, 0 of 66 tasks | `openspec/changes/restyle-order-livery`. Whether it still applies after the night livery is open (see below). |
| Automated tests for the browser flows | **None** | nothing in the repo. Verification is by walking the interface. |

**Not measured.** There are no load figures for the Pi, no latency figures, and no
benchmark. The numbers in the code (`POLL_MS = 2000`, the 0.3 CPU and 128 MB limits) were
chosen on arithmetic and have not been tested under a real party.

**Open questions for the author.** Whether `restyle-order-livery` is still wanted now that the
night livery exists. Whether the interface should be Norwegian or Danish: the strings are old
Norwegian, and the earlier documentation said Danish.

---

## Quickstart

### What you need first

- **Node 22.** It is what the Docker image uses and what the server bundle targets. Newer
  Node versions build; this was checked on Node 26.
- **A Postgres 17 database** for anything beyond the static page. Rooms, the chronicle and
  the admin login all need it. Without one, the app opens, but every room and archive request
  returns `503`.
- A browser, and a phone if you want to test the join flow.

### Running it

```bash
npm install
```

Create `.env.local` in the repository root. Use `sslmode=disable` as the compose file does for
its local database (its comment is the reason; this was not re-tested against a live server):

```bash
DATABASE_URL=postgres://faxing:faxing@localhost:5432/faxing?sslmode=disable
FAXEPAVE_PASSWORD=choose-a-password-for-local-use
```

```bash
npm run dev
```

Open [http://localhost:5173](http://localhost:5173). The dev server creates the three tables on
start (see [ARCHITECTURE.md §6](ARCHITECTURE.md#6-persistence-and-the-database)). Create a room
from the home screen; the room has a code, and a second device can join with it.

### Before you trust anything downstream

These checks prove the install is real. Run them in order.

```bash
npm run typecheck     # no output and exit 0
npm run check:rules   # seven lines beginning "ok"
curl -s -w ' [%{http_code}]\n' http://localhost:5173/api/rooms
```

The last command returns `[200]` with a JSON list (possibly `[]`) when the database is
configured. If it returns `[503]` with `Database connection is not configured`, the
`.env.local` file was not read: restart `npm run dev` after creating it.

**Not verified in this revision:** a full run against a live Postgres with two browsers. The
checks above were run; the room flow in a browser was not.

---

## Every command

```bash
npm install                  # once
npm run dev                  # Vite on 0.0.0.0:5173, with the /api handlers mounted
npm run typecheck            # tsc for the app and for the server, strict
npm run check:rules          # the titling rules, as seven assertions under Node
npm run build                # typecheck app, Vite build to dist/, bundle server.cjs
npm run build:server         # only the server bundle, from server/index.ts
npm run preview              # serves dist/ only: no /api, see the note below
npm start                    # node server.cjs: the app and the API on :8080 (needs dist/ and the env)

openspec list                                # open changes
openspec validate --specs --strict           # the five main specifications
openspec validate <change-id> --strict       # one change
openspec status --change <change-id>         # which artifacts a change still lacks
```

`npm run preview` does not mount the API: the handlers are attached only to the dev server
(`vite.config.ts`, the `configureServer` hook). To test a production build with its API, use
`npm run build && npm start` with the environment set.

`npm run dev -- --host` is not needed: the dev server already listens on every interface
(`vite.config.ts`).

---

## Repository layout

```
index.html                    the page shell, and the Google Fonts request
vite.config.ts                Vite, the React plugin, and the dev-only /api mount
tsconfig*.json                app and server configs, both strict
package.json                  the scripts, and three runtime deps: react, react-dom, pg

src/
├── main.tsx                  mounts <App /> in StrictMode
├── App.tsx                   screen state, the clock, the room in view, and the chronicle links
├── types.ts                  the contestant, title and room shapes, shared with the server
├── index.css                 the reset and the colour tokens
├── App.css                   every component rule
├── lib/
│   ├── ranking.ts            the only place a title is decided: pure, shared with the server
│   ├── ranking.demo.ts       the seven assertions behind npm run check:rules
│   ├── contest.ts            CONTEST_DURATION_MS, declared once for client and server
│   ├── rooms.ts              room polling, actions, and the tokens kept on the device
│   ├── storage.ts            fetch wrappers for the chronicle (/api/events, /api/admin)
│   ├── id.ts                 a UUID that works on plain HTTP, where randomUUID is missing
│   └── pixelArt.ts, pixelInk.tsx   pixel-art helpers for the livery
└── components/
    ├── RoomsPanel.tsx        the home screen's room list and create button (src/App.tsx:73)
    ├── RoomLobby.tsx         the room before the start, while startedAt is null (src/App.tsx:78)
    ├── Arena.tsx             the live board: groups, search, close (src/App.tsx:79)
    ├── ContestantCard.tsx    one card: finish, forfeit, and the host's corrections
    ├── GlobalTimer.tsx       the hour: remaining time, urgency, expiry
    ├── History.tsx, EventView.tsx   the chronicle list, and one archived contest (src/App.tsx:81-82)
    └── NightScene, Torch, GraveScene, HostGuide   the livery, and the host's how-to (not read in detail)

api/                          Vercel-style handlers, run unchanged by the Pi server
├── rooms.ts                  the room actions, with the permission checks in one place
├── events.ts                 the chronicle: reads are open, writes need Faxepave
├── admin.ts                  Faxepave login: sets the session cookie
├── _auth.ts                  tokens, hashes, and the Faxepave check (underscore: not a route)
└── _db.ts                    one Postgres pool per process

server/
├── api.ts                    maps the handlers onto plain Node, and creates the schema
└── index.ts                  the production server: static files, /healthz, and /api

deploy/compose.yml            the Pi's compose file, as a reference copy
Dockerfile                    the two-stage image: build, then run server.cjs
.github/workflows/deploy.yml  build an arm64 image, push it, and deploy to the Pi

openspec/
├── specs/                    the five capabilities: the source of truth for behaviour
└── changes/                  work in progress, each with a proposal, deltas and tasks
```

---

## Configuration

Two environment variables matter. Both are read from `.env*` files in development and from the
process environment in production.

| Variable | Read by | What it does |
| --- | --- | --- |
| `DATABASE_URL` (or `POSTGRES_URL`) | `api/_db.ts`, `server/api.ts` | The database. Absent means every `/api` request returns `503`. |
| `FAXEPAVE_PASSWORD` | `api/admin.ts`, `api/_auth.ts` | The operator's password. Absent means **nobody can log in** and no official room can be made. |

Two things are enforced about them, and both fail quietly:

- **The session cookie is an HMAC of the password.** Changing `FAXEPAVE_PASSWORD` logs every
  device out. That is the intended effect, and it is also why a rotation during a live
  contest is disruptive.
- **The database URL's TLS setting.** The pool asks for TLS with `rejectUnauthorized: false`
  (`api/_db.ts`). A URL with `sslmode=disable` overrides that. The local compose database has no
  TLS, so omitting it fails the connection.

There are no other configuration files. The timing constants are code, not settings:
`CONTEST_DURATION_MS` in `src/lib/contest.ts`, `POLL_MS` in `src/lib/rooms.ts`.

---

## Measuring it

**What exists:** `npm run check:rules` runs seven assertions over the titling function under
Node. It covers the four titles, the still-drinking and expired cases, the forfeit that does
not consume a crown, the late finish that cannot claim one, and the board's order. Each
assertion names the silent failure it guards.

**What it can establish:** that the titling function gives the right answer for the cases it
lists.

**What it structurally cannot establish:** anything about the server (the permission checks,
the row lock, the chronicle write), anything in the browser, and anything about performance.
There are no benchmarks and no load tests. The stated limits, such as the Pi's 0.3 CPU and 128
MB, are configuration, not measurements.

**Results so far:** seven of seven assertions pass as of this revision. Nothing else is
measured.

---

## The one hard problem

A fresh clone has everything it needs to build and to run the static page, and **nothing** of
the live contest. Rooms, the chronicle and the login all live in a Postgres database that you
must run and configure yourself. The repository holds no data, so a fresh clone cannot show
the chronicle of past contests.

---

## Working on this repository

Read [CLAUDE.md](CLAUDE.md) for the conventions and the hard rules. Before you commit, run
`npm run typecheck`.

The rules whose violation **fails silently** are the ones to remember:

- **Never compute a title anywhere except `rankContestants()`.** Storing one creates a second
  source of truth. The chronicle is the single exception, and it freezes titles at close.
- **Never count time up.** Every duration is a difference of two absolute instants. A timer
  that counts ticks stops when the tab sleeps and reports an expired contest as open.
- **A forfeit is checked before the crown branches.** Otherwise a contestant who gave up takes
  a crown and the next real finisher is left a knight.
- **Titles and ranks are computed over the whole roster, not the filtered view.** Otherwise a
  search renumbers second place as first.

---

## Vocabulary

The interface is in old-fashioned Norwegian. Code, comments and documentation are in English.
These are the terms a developer will meet in the interface and the code.

| Term | Meaning |
| --- | --- |
| **Faxing** | the contest: one litre of strong beer, within one hour |
| **Faxekonge** | first man to finish within the hour |
| **Faxedronning** | first woman to finish within the hour |
| **Faxemonark** | first `Annet` (other) finisher within the hour |
| **Faxeridder** | any other finisher within the hour |
| **Hestemann** | gave up, finished late, or did not finish in time: the failure title |
| **Faxepave** | the operator, who logs in with `FAXEPAVE_PASSWORD` |
| **Verten** | the host: the device that created the room, or Faxepave for an official room |
| **Kriger** | a contestant |
| **Ærens Hal** | the board group for finishers |
| **Drikker Ennu** | the board group for people still going |
| **Fullbragt** | finished (the button is *Fullbragt!*) |
| **Gav Opp** | gave up (the button is *Gav Opp*) |

---

## Where to go next

- **[ARCHITECTURE.md](ARCHITECTURE.md)** for how the system fits together: the state, the
  rooms API, the schema, the known defects, and the decisions that were rejected.
- **[CLAUDE.md](CLAUDE.md)** for the working rules and the list to check before you call a
  change finished.
- **`openspec/specs/`** for what the application is specified to do. Where a spec and the code
  disagree, the spec is the intended behaviour.
- **`openspec/changes/faxing-rooms/`** for why rooms exist and what was decided for them.
- **[ARCHITECTURE.md §10](ARCHITECTURE.md#10-known-defects)** for the defects still open.
