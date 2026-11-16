## Context

The chronicle is one table, `faxing_events`, written in exactly one place: `close` in
`api/rooms.ts`. Its rows are the frozen record, titles included (ARCHITECTURE §5). The Faxepave
already edits and deletes those rows through `api/events.ts`. What is missing is a state between
"the room closed" and "the archive says so".

## Decisions

### A status column, not a second table

`faxing_events.status` holds `pending`, `published` or `denied`, defaulting to `published` so
every existing row keeps the meaning it had. A separate `faxing_pending` table would duplicate
the shape, and an entry that is approved would have to be copied from one table to the other: two
rows that can disagree, which is the failure the chronicle is written to avoid.

The column is added with `ALTER TABLE ... ADD COLUMN IF NOT EXISTS`, so `migrate()` stays
idempotent and a running Pi upgrades on the next release. There is no `CHECK` constraint, because
Postgres does not support `ADD CONSTRAINT IF NOT EXISTS`; the API validates the three values and
it is the only writer.

### Closing files, the Faxepave admits

`close` keeps deriving titles and writing the frozen entry. It writes `status = 'pending'`
instead of nothing. The rule that a title is decided only by `rankContestants()` is untouched;
what changed is who may put the resulting record in the public list.

Every close of a started room is filed for approval, including an official room and a room the
Faxepave closed themselves; a room closed before its start is dissolved with no entry at all
(`openspec/changes/dissolve-unstarted-room`). The alternative — publish when the closer holds a
Faxepave session — was rejected:
it makes the rule depend on which device pressed the button, so the same room would be reviewed
or not depending on who was holding the phone at the end of an hour of drinking. A uniform gate
also means the loft always shows what happened, which is what the operator asked for.

### Denying keeps the row

`denied` is a state, not a delete. A close has already destroyed nothing, and the entry is the
only record of a contest that will not be run again; a denial must be undoable. The refused entry
stays out of the chronicle, answers 404 to a device without a Faxepave session, and is listed on
the loft with a way back. Deleting stays a separate, confirmed action.

### The room's own devices still see the outcome

The client already redirects a closed room to the event it just produced, by id. With the entry
unlisted, that redirect would land on nothing. So `GET /api/events?id=…` reads one entry whatever
its status (except a denied one for a device without a session): the record is reachable at its
link, it is simply not listed. Approval decides what the archive shows, not whether the people who
drank can read their own result.

### One list in the client, filtered in the API

`GET /api/events` returns published entries; `?status=pending` and `?status=denied` need a
Faxepave session. The client keeps one `awaiting` list holding what it has been allowed to read
outside the chronicle — the Faxepave's queue, or the single entry a device just closed — and looks
up the event in view in the chronicle first and there second. The home counts, the tribute and the
loft's own counts all read the chronicle list, so no pending entry can be counted.

### A loft screen, not more popovers

The Faxepave's work was spread over an event page, a login popover and three `window.prompt`
dialogs on the chronicle screen. The loft collects the decisions and the one creation form in one
place, and the nav shows it only with a session. Editing an approved Faxing stays on its page: it
is a property of that record, not of the queue.

## Risks

- **A Faxepave who never opens the loft leaves Faxinger unlisted.** The failure is quiet in the
  archive and loud to the room, whose results page says the Faxing awaits the Faxepave. Accepted:
  the alternative is a public chronicle nobody curates.
- **The approval state is one more thing on the close path.** The write is a single extra column
  on an insert that already happens under the room lock, so a close cannot half-succeed.
- **No test covers the server.** `check:rules` runs the `src/lib` demos and nothing else; the
  permission checks and the new status filter are verified by walking the API, and the documents
  say so.

## Alternatives considered

- **Moderate rooms before they start.** More useful for stopping a joke room early, but it breaks
  the whole point of a room: anyone can raise one and join from a phone without an operator in
  the loop. Approval at close keeps the friction off the party.
- **Delete on deny.** Destroys the only record of a contest, and makes the more likely mistake
  (a stray tap) unrecoverable.
- **A review screen per attendee.** The unit of the archive is the Faxing; a half-accepted Faxing
  is not a thing anyone can rule on.
