# Architecture

How Faxing works, and why it is shaped the way it is. Read [README.md](README.md) first for
what it is and how to run it. Read [CLAUDE.md](CLAUDE.md) for the rules you must not break.

Every claim here points at code (`file:line`), a test, or a measurement. Where a choice is a
judgement rather than a verified fact, the text says so.

## Contents

| | |
| --- | --- |
| [1. The shape of the system](#1-the-shape-of-the-system) | two runtime modes, the processes, what lives where |
| [2. Client state](#2-client-state) | what `App.tsx` owns, and what is derived |
| [3. Titles](#3-titles) | the one pure function that decides every title |
| [4. A shared room](#4-a-shared-room) | the rooms API: who may do what, and why the server stamps time |
| [5. The chronicle](#5-the-chronicle) | how a closed room becomes history, and where titles get stored |
| [6. Persistence and the database](#6-persistence-and-the-database) | the three tables, the migration, what is local to a device |
| [7. Deployment](#7-deployment) | Docker, the Raspberry Pi, the deploy workflow |
| [8. The visual layer](#8-the-visual-layer) | how the livery is built, and what the stylesheet is coupled to |
| [9. Invariants](#9-invariants) | the properties that must hold, and what enforces each |
| [10. Known defects](#10-known-defects) | what is wrong today, and what was fixed since the last revision |
| [11. Known constraints](#11-known-constraints) | where the system is binding, and the statistics it cannot support |
| [12. What is deliberately absent](#12-what-is-deliberately-absent) | ideas that were considered and rejected, and why |
| [13. Where the next change attaches](#13-where-the-next-change-attaches) | the seam for each kind of work |

---

## 1. The shape of the system

Faxing is a React single-page app with a small Node API beside it. It runs in two modes that
share the same code.

**Production (the Pi):** one Node process, `server/index.ts`, bundled to `server.cjs` by
esbuild (`package.json` `build:server`). It serves the built SPA from `dist/`, mounts the
handlers in `api/` through an adapter (`server/api.ts`), and answers `/healthz`
(`server/index.ts:39`). It talks to one Postgres 17 container.

**Development:** `vite` on `0.0.0.0:5173` (`vite.config.ts`). A small Vite plugin,
`localApi()`, mounts the same `api/` handlers through the same adapter, so dev and production
cannot serve different APIs. The plugin also copies `DATABASE_URL` and `FAXEPAVE_PASSWORD`
from `.env*` into `process.env` before the handlers load (`vite.config.ts`).

```
browser (phone or laptop)
  │  SPA from dist/ ── polls /api/rooms every 2 s
  │
  ▼
server.cjs  (Node 22, one process)
  ├── static files        dist/, index.html fallback for unknown paths
  ├── /healthz            "ok"
  └── /api/*  ── api/*.ts handlers, via server/api.ts
        ├── /api/rooms     live rooms, the only write path during a contest
        ├── /api/events    the chronicle (closed contests), Faxepave writes only
        └── /api/admin     Faxepave login: sets an HMAC session cookie
              │
              ▼
        Postgres 17  (faxing_rooms, faxing_room_members, faxing_events)
```

| Piece | Where | Why it exists |
| --- | --- | --- |
| SPA | `src/` | The screen the room looks at. Everything the operator sees is computed here, from server snapshots. |
| API handlers | `api/*.ts` | Written as Vercel-style `(req, res)` handlers (they import `@vercel/node` types). The Pi is the only deployment this repo configures. |
| Adapter | `server/api.ts` | Reads the body, builds `query`, and maps `HttpError` to status codes. One adapter means dev and prod share one API. |
| Ranking | `src/lib/ranking.ts` | Pure, and imported by **both** the client and `api/rooms.ts`. The server derives titles with the same code the client shows, so the two cannot disagree. |
| Constants | `src/lib/contest.ts` | `CONTEST_DURATION_MS`, declared once so client and server agree on the hour. |

The SPA has no router. The room code lives in the URL query (`?rom=CODE`,
`src/App.tsx:21-23`), so a reload or a link sent round the table lands in the same room.

## 2. Client state

`src/App.tsx` holds the screen state. There is no context, store or reducer.

| State | Where | What it is |
| --- | --- | --- |
| `roomCode` | `src/App.tsx:26` | The room in view. Null on the home and archive screens. |
| `screen` | `src/App.tsx:27` | `home`, `room`, `history`, `event`, or `lore`. |
| `events` | `src/App.tsx:28` | The chronicle, loaded from `/api/events`. |
| `now` | `src/App.tsx:30` | The local clock. Re-read every 500 ms (`src/App.tsx:37`). |
| `isAdmin` | `src/App.tsx:31` | Whether this device holds a Faxepave cookie. |
| `room` | `useRoom` in `src/lib/rooms.ts:73` | The server snapshot, polled every 2 s (`src/lib/rooms.ts:9`, `:98`). |

**The clock is the server's, not the phone's.** Each snapshot carries `serverNow`. `useRoom`
keeps `offset = serverNow - Date.now()` (`src/lib/rooms.ts:87`), and `src/App.tsx:54` computes `roomNow =
now + offset`. A phone with a wrong clock therefore shows the same remaining time as every
other phone in the room.

**Derived, never stored, on the client.** Every rank, title, group and duration is recomputed
on each render from `room.startedAt`, `roomNow`, and `room.members` (`src/App.tsx:55`). Nothing
on the client is a second source of truth.

## 3. Titles

`rankContestants()` in `src/lib/ranking.ts:10` is the only place a title is decided. It is
pure, takes the roster, the start instant, `now` and the duration, and returns ranked
contestants. It is called on the client for display (`src/App.tsx:55`) and on the server when a
room closes (`api/rooms.ts:197`).

The five titles are defined in `src/types.ts`:

| Title | Awarded when | Why it exists |
| --- | --- | --- |
| Faxekonge | first `male` finisher within the hour | one crown per gender |
| Faxedronning | first `female` finisher within the hour | one crown per gender |
| Faxemonark | first `other` finisher within the hour | the third crown, for the `Annet` option |
| Faxeridder | any other finisher within the hour | the reward for finishing |
| Hestemann | forfeited, finished late, or unfinished at expiry | the consequence, and the only title for failure |

The rule has three parts, and each is worth knowing before editing `ranking.ts`:

**Finish time decides precedence, not tap order.** The sort (`src/lib/ranking.ts:16`) orders in-time
finishers by `finishedAt`. Anyone who crosses a room and taps the nearer card first does not
take a crown from the person who finished earlier.

**"Within the hour" is strict.** `finishedInTime` (`src/lib/ranking.ts:14`) requires
`finishedAt - start < durationMs`. A finish at or after the deadline is not a finish. Before
this was enforced, a tap after the hour could promote a `Hestemann` to a knight or award a
vacant crown; `check:rules` now asserts that it cannot.

**The failure branch comes first.** The `if` at `src/lib/ranking.ts:29` tests `disqualified`, a late
finish and expiry before any crown branch. A contestant who gave up does not consume a
crown and leave the next real finisher as a knight. Branch order is the rule.

**No title is ever a stored input.** The crowns are re-claimed inside each call (the `king`,
`queen`, `monarch` flags are local, `src/lib/ranking.ts:15-17`), so the function is a projection of
the facts. The one exception is the chronicle, which freezes titles at close; see
[§5](#5-the-chronicle).

`src/lib/ranking.demo.ts` is the only test. `npm run check:rules` runs seven assertions under
Node, and each names the silent failure it guards. Last run: all seven passed.

## 4. A shared room

A room is one contest that many phones join. This is the path a contest takes in production.

```
create ─► lobby ─► start ─► running ─► close ─► chronicle
(anyone)  (join,   (host,   (finish,   (host;    (faxing_events row,
           add)     ≥1 member) forfeit,   titles    room.event_id set,
                              host fixes) frozen)   clients redirected)
```

### Who may do what

Every write goes through `POST /api/rooms` with an `action` field. The router is one handler,
`api/rooms.ts`, so the permission checks live in one place. `act()` (`api/rooms.ts:107`)
applies the action under a row lock (`FOR UPDATE`, `api/rooms.ts:228`), so two taps in the
same room apply one after another rather than interleaving.

| Action | Who | Condition | Effect |
| --- | --- | --- | --- |
| `create` | anyone | `official` requires Faxepave (`:93`) | new room, host token returned once |
| `join` | anyone, one per device | before start (`:125`) | new member row, participant token returned |
| `finish` / `forfeit` | the participant, for themselves only | running (`:135`) | sets `finished_at` or `disqualified`, guarded by `WHERE finished_at IS NULL AND NOT disqualified` (`:138`) |
| `start` | host | at least one member (`:146`) | sets `started_at` |
| `add` | host | before or after start | new member row, no token |
| `remove` | host | **before start only** (`:157`) | deletes a row |
| `reset` | host | any time | clears `finished_at` and `disqualified` for one member |
| `set-finished` | host | running (`:172`) | stamps a finish at the server's now |
| `set-time` | host | `0 ≤ elapsed < hour` (`:180`) | stamps a finish at a typed time |
| `disqualify` | host | after start | sets `disqualified`, **clears `finished_at`** (`:187`) |
| `close` | host | after start | derives titles, writes the chronicle, closes the room (`:190-201`) |

A "host" is a device holding the host token, **or** a Faxepave session on an official room
(`api/rooms.ts:60`). A member is a device holding a participant token. A device can hold both,
because the host is usually drinking too; the header carries up to two tokens
(`api/_auth.ts:23-26`).

### Why the server stamps every instant

`start`, `finish` and `set-finished` use `Date.now()` on the server (`api/rooms.ts:230`), not
the phone's clock. A phone that is wrong, or sleeping, cannot move a finish. The clients
compare against `serverNow` (see [§2](#2-client-state)). The cost is that the finish is
recorded when the request reaches the Pi, not when the can is empty; over a home network that
is a small delay, and it is the same delay for everyone.

### Why polling, not WebSockets

`POLL_MS = 2000` (`src/lib/rooms.ts:9`). Each poll is one indexed read. The comment at
`src/lib/rooms.ts:7-8` works the numbers: twenty phones at one request every two seconds is ten
requests a second, which the Pi serves without effort. A WebSocket would add a dependency and
a connection to keep alive for an hour-long party. *Measured?* No. The 10 req/s figure is
arithmetic; the Pi load has not been measured under real use.

### Why members are rows, not an array

`faxing_room_members` holds one row per participant (`server/api.ts:73`). A jsonb array on the
room would be read-modify-write: two people finishing in the same second would overwrite each
other. The row lock serialises actions in a room, but rows also keep each finish independent.

### Why tokens, not accounts

The room's creator gets a random 32-byte host token (`api/_auth.ts:18`). The database stores
only its SHA-256 hash (`:20`), so a leaked row cannot be replayed as a host. The client keeps
its tokens in `localStorage` under `faxing-room-tokens` (`src/lib/rooms.ts:10`), keyed by room
code. Losing the token means losing the role, not the contest: the state lives on the server.

## 5. The chronicle

`close` (`api/rooms.ts:190`) is the only place a title is written to the database.

1. It ranks the members with `rankContestants`, using `now = max(now, start + hour)`
   (`api/rooms.ts:197`). Closing early therefore ranks as if the hour had run out: anybody
   still drinking becomes a `Hestemann`.
2. It inserts a `faxing_events` row whose `attendees` is the ranked list, **titles included**
   (`:199`).
3. It sets `closed_at` and `event_id` on the room (`:200`). Every other device sees `eventId`
   on its next poll and moves to the archived event (`src/App.tsx:43-51`).

This is a deliberate exception to "titles are derived". Once a contest is closed the chronicle
is the record, and a record that re-derived its titles would change if the rule ever changed.
The cost is that the chronicle is editable: `PUT /api/events` accepts `attendees` verbatim
(`api/events.ts:30-31`), so a Faxepave session can set any title on a closed event. That is
the intended power of the operator, and it is also the only place a title can be set by hand.

## 6. Persistence and the database

The schema is created on every start by `migrate()` (`server/api.ts:47-85`). Every statement
is `IF NOT EXISTS`, so it is idempotent.

| Table | Holds | Why it exists |
| --- | --- | --- |
| `faxing_events` | the chronicle: title, date, `official`, `attendees` (jsonb) | one row per closed contest, or per event entered by hand |
| `faxing_rooms` | code (unique), title, `official`, host-token hash, `started_at`, `closed_at`, `event_id` | a live contest, until it closes |
| `faxing_room_members` | name, gender, `finished_at`, `disqualified`, token hash | one row per participant, so writes never collide |

Two constraints do real work:

- **`UNIQUE (room_id, lower(name))`** (`server/api.ts:83`). This is the duplicate-name check, so
  two people typing the same name in the same second cannot both get in. The `23505` error is
  turned into a 409 at `api/rooms.ts:53`.
- **`ON DELETE CASCADE`** on members (`server/api.ts:75`). Deleting a room removes its members.

**What lives on the device:** only the room tokens (`localStorage`, `src/lib/rooms.ts:10`), the
Faxepave cookie (HttpOnly, set by `api/admin.ts:9`), and the React state. A contest is not
stored on the phone. If the browser loses its storage, the room is still there; the device
simply stops being the host.

**Pool size.** `pg` is capped at four connections in the app (`api/_db.ts:6`) and one during
migration (`server/api.ts:50`). The Pi's Postgres is set to 20 (`deploy/compose.yml`). These
are configuration values; they have not been tuned against load.

## 7. Deployment

The production image is built and run by three files:

| File | What it does |
| --- | --- |
| `Dockerfile` | two stages: `npm ci` and `npm run build`, then a Node 22 Alpine runtime with `dist/` and `server.cjs` only. Runs as the `node` user. Health check on `/healthz`. |
| `.github/workflows/deploy.yml` | on every push to `main`: build an arm64 image, push it to GHCR as `:main` and `:<sha>`, then ssh to the Pi and run `pi-deploy faxing`. |
| `deploy/compose.yml` | a reference copy of the Pi's compose file: the app on `127.0.0.1:4010`, Postgres beside it. Both capped at 0.3 CPU and 128 MB. |

The compose file's comment is the one thing to read before editing the database URL: the
local database has no TLS, so `sslmode=disable` overrides the `ssl` option in `api/_db.ts:6`.
Without it, the connection fails.

The deploy key can run only `/usr/local/bin/pi-deploy <app>` on the Pi (`deploy.yml` header
comment). That is the whole deployment surface.

**Not verified here:** the deploy workflow itself, the Pi, and the compose file's live state.
This revision read the files; it did not run the pipeline.

## 8. The visual layer

The livery is a moonlit, pixel-art night: a header scene, torches and a graveyard footer
(`src/App.tsx:2-4`, `src/components/NightScene.tsx`, `Torch.tsx`, `GraveScene.tsx`). The pixel-art
helpers are `src/lib/pixelArt.ts` and `src/lib/pixelInk.tsx`; their internals were not read for
this revision.

The stylesheet is `src/App.css` for component rules and `src/index.css` for the reset and
the colour tokens. The intent (recorded in `CLAUDE.md`) is that every colour in `App.css`
resolves through a custom property defined in `index.css`, so that a restyle changes the token
block and not every rule. A search for hex literals in `.tsx` files found none; the same
check on `App.css` was not re-run for this revision.

Two open changes describe the visual direction. `moonlit-gothic-livery` is the implemented
night scene, 19 of 23 tasks done. `restyle-order-livery` (0 of 66 tasks) is a different
palette written before the night scene; its status relative to the implemented livery is an
open question for the author (see [§13](#13-where-the-next-change-attaches)).

## 9. Invariants

These hold in the code today. Most fail **silently** when broken, which is why they are written
down. "Enforced by" names what would catch a break.

1. **No title is computed from stored data, except the chronicle.** Titles come from
   `rankContestants()`. The one stored set is `faxing_events.attendees` at close
   (`api/rooms.ts:199`), and it is frozen by design. *Enforced by:* `check:rules` for the
   function; nothing for the freeze.
2. **Every duration is a difference of two absolute instants.** Nothing accumulates. *Enforced
   by:* the derivation in `src/App.tsx:54-55` and `ranking.ts`, and `check:rules`'s expiry cases.
   A counter would stop when the tab slept and report an expired contest as open.
3. **A recorded `finished_at` changes only through a host correction or a participant's own
   first tap.** Participant `finish` and `forfeit` are guarded by
   `WHERE finished_at IS NULL AND NOT disqualified` (`api/rooms.ts:138`), so a second tap
   changes nothing. Host actions `reset`, `set-finished`, `set-time` and `disqualify` may
   overwrite it, and `disqualify` clears it. *Enforced by:* the SQL guard, the host check in
   `act()`, and the confirmation in `src/components/ContestantCard.tsx:38` before a host clears a finish.
4. **The forfeit branch precedes the crown branches** in `rankContestants()` (`src/lib/ranking.ts:29`).
   *Enforced by:* `check:rules`, case "a forfeit does not consume a crown".
5. **A finish at or after the hour is never a finish.** `finishedInTime` is strict
   (`src/lib/ranking.ts:14`). *Enforced by:* `check:rules`, cases "a finish after the hour earns no
   title" and "a late finish cannot claim a vacant crown". Server side, `set-finished` refuses
   a late finish (`api/rooms.ts:172`).
6. **Ranks and titles are computed over the whole roster, never the filtered view.** *Enforced
   by:* `src/components/Arena.tsx:20`, which builds the rank map from `rankedContestants`, not `filtered`.
7. **A closed room accepts no action.** `act()` fails with 409 when `closed_at` is set
   (`api/rooms.ts:108`).
8. **Only the server's clock decides a finish.** The client sends an action, not an instant
   (except `set-time`, which the host types, bounded by `elapsedMs < hour`). *Enforced by:* the
   `now` in `handler` (`api/rooms.ts:230`).
9. **Nothing leaves the device except to our own server.** The only outbound requests are
   `/api/*` on the same origin and the Google Fonts stylesheet in `index.html`. *Enforced by:*
   a search for `fetch(`, `XMLHttpRequest` and `WebSocket` in `src/`, which finds calls only in
   `App.tsx`, `lib/rooms.ts`, `lib/storage.ts` and `EventView.tsx`, all relative URLs.
10. **Storage in `rooms.ts` never throws out.** `readTokens` and `saveToken` catch every
    `localStorage` error (`src/lib/rooms.ts:18-42`). *Enforced by:* the try/catch, reviewed by
    reading only.
11. **A participant may mark only themselves.** `finish` and `forfeit` reject any `memberId`
    other than the caller's (`api/rooms.ts:134`). Host targets must belong to the same room
    (`:115-120`).

## 10. Known defects

Each is real and reproducible unless marked otherwise. None is fixed in this revision.

**N1: The client trusts the events API's JSON shape.** `loadEvents` in `src/lib/storage.ts`
casts the response with `as ApiEvent[]` and nothing checks it. A malformed row fails later, in
a component, as a blank screen. The chronicle is read-mostly, so the blast radius is small.
*Verified by reading.*

**N2: The per-card candle is the global clock.** `ContestantCard.tsx` draws the candle from
`elapsedMs`, which is the hour's elapsed time (`src/components/Arena.tsx:12`), so every unfinished card shows
the same percentage. `openspec/specs/arena-board` requires "progress against the hour", so the
behaviour is specified. Whether a percentage beside a person's name implies a measurement that
was never taken is a judgement for the author, not a defect the code can settle.

**Resolved since the last revision of these documents:**

- The old `D1` (a late tap awards a title) is fixed: `finishedInTime` is strict, and
  `check:rules` asserts it.
- The old `D4` (`crypto.randomUUID()` fails on plain HTTP) is fixed: `src/lib/id.ts` falls
  back to `crypto.getRandomValues`.
- The old `D6` (`loadState()` runs three times) no longer applies: the local persistence layer
  was removed.
- The old `D3` (`markDisqualified` clears a finish with no guard) is now a host action with a
  confirmation (`src/components/ContestantCard.tsx:38`). It is intended; see [§9](#9-invariants) invariant 3.

## 11. Known constraints

These are stated because they are real, not because they are about to be fixed.

**The contest depends on one Postgres and one Node process.** A database restart or a crash
of the Node process pauses every phone's writes until it returns. The clients poll, so they
recover on their own; actions taken during the outage fail with an error shown on screen.
*Not measured.*

**The Pi is small.** Each container has 0.3 CPU and 128 MB (`deploy/compose.yml`). The load
figure in [§4](#why-polling-not-websockets) is arithmetic. No measurement exists of the Pi under
a real party.

**Statistics.** This project has no measurements that support a performance claim. There is
no benchmark, no load test and no latency figure. The only numbers are the constants in code
(`POLL_MS`, `CONTEST_DURATION_MS`), and their rationale is the comment beside each one.

**No authentication beyond tokens and one password.** Faxepave is a single shared password,
compared in constant time (`api/_auth.ts:15`), with a 24-hour cookie (`api/admin.ts:9`).
Anyone who learns it can write any chronicle event. There is no rate limit on
`/api/admin`.

## 12. What is deliberately absent

Naming these stops them being re-proposed as oversights.

**Accounts.** The host is the device that made the room. A token is the whole identity. This
keeps the friction to "scan a code and type a name".

**Realtime push.** Polling every two seconds is enough for an hour-long contest, and needs no
connection to keep alive. See [§4](#why-polling-not-websockets).

**A clock on the phone.** Times come from the server, so a phone cannot cheat or drift. The
offset (`src/lib/rooms.ts:87`) makes a skewed phone agree with the room.

**An audit log of host corrections.** Host fixes leave no trace. This was an explicit non-goal
in `openspec/changes/faxing-rooms/design.md`: the host is trusted, and the chronicle records
the result, not the history.

**Joining after the start.** Once the clock runs, the roster is frozen for participants.
The host can add a latecomer (`api/rooms.ts:150`), but that person is measured from the common
start, which is what the rule requires.

**A pause.** The clock is derived from one start instant, so there is nothing to stop. A pause
would need an accumulator, which the rule against accumulation forbids.

**More than two genders in the crowns, beyond the `other` title.** There are three crowns:
male, female, other. A fourth option would need a fourth title or a rule for what it does
instead, which is a product decision.

**A test framework.** `check:rules` is the only test, and it is a plain Node script. The
titling function is the one part of the code that a framework would test; it has no
dependencies, so none was added. This is a choice, not an oversight; it is also the largest
gap, since the browser flows have no tests at all.

## 13. Where the next change attaches

**A rules change** attaches at `rankContestants()` in `src/lib/ranking.ts`. Update the spec in
`openspec/specs/title-award/` first, then change the branch, then add a case to
`ranking.demo.ts` that would have failed before.

**A new room action** attaches in `act()` in `api/rooms.ts:107`, in the `switch`, and in the
client's `RoomAction` type (`src/lib/rooms.ts:4`). Decide first which role may use it, and
write that check before the effect.

**A new field on a participant** attaches at `Contestant` in `src/types.ts`, at `toContestant`
(`api/rooms.ts:29`), and at the `faxing_room_members` table in `server/api.ts`. A column added
by `ALTER TABLE ... ADD COLUMN IF NOT EXISTS` in `migrate()` keeps existing rooms working.

**A visual change** attaches at the stylesheet. `openspec/changes/restyle-order-livery` is a
proposal to replace the palette; it has not been implemented, and whether it still applies after
the night-scene change is for the author to decide.

**Anything that fires on a state transition** (an animation, a sound, a banner) must guard
against the one-second poll. Titles are recomputed on every render, so "a `Faxekonge` exists"
is true for the rest of the contest. Record what has already fired in a `useRef` owned by the
component that shows it. No such guard exists yet; the first one added sets the pattern.

**Anything needing a second server or a real-time channel** does not attach to this codebase
without a deliberate change of architecture. The rooms design already assumes one process.
