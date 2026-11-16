## Context

`src/components/EventView.tsx` is the Faxepave's one editor for a filed Faxing: name, day,
officiality, each participant's name and standing, adding a participant, and deleting the entry.
Its save is one `PUT /api/events?id=<id>` carrying the whole `attendees` array, so the stored
duration is already written by the server whenever it is in that array — `api/events.ts` accepts
`elapsed` in the JSON as it is sent and does not filter it. What is missing is a way to put a
different duration into the array: the row renders `formatDuration(c.elapsed)` as text and offers
no field.

That is a real gap, not a cosmetic one. The old rows are transcriptions: a time read off a chat
message may be wrong, a participant may have been filed with no time at all because the record
did not say one (`Tid ukjent`), and "under ti minutter" may have been written down as a guess.
Until now the only correction was to delete the Faxing and file it again, which drops the entry's
id and every contestant id with it and changes its place in the chronicle.

## Decisions

### Minutes and seconds, the shape the tool already has

The «Føy til deltager» form takes a time as two boxes, minutes and seconds. The row takes the
same two, with the same labels and the same help sentence, so there is one way a time is written
in this screen. A single `MM:SS` box would need its own parsing and its own explanation.

### Empty means "the record states no time"

Both boxes empty is not zero: it is `Tid ukjent`, the state five of the old rows are in. Correcting
a wrong time and stating that there is none are the same edit, so clearing is offered rather than
being a separate "forget the time" button.

A half-typed time is not a time. Until both boxes hold a valid count (minutes of 0 or more,
seconds between 0 and 59), the row keeps the time it had, so a keystroke that makes no sense
cannot empty or invent a duration. The boxes themselves keep what was typed, so the Faxepave can
see the mistake and correct it.

### The duration is what is written, never a derivation

Nothing in the archive computes a duration from `finishedAt`. A stored time is evidence
(`hasFinished` counts it), and re-deriving it would replace a transcription with arithmetic on an
instant an old record may not have. This is the same rule as the contest's clock: a stored
duration is a fact about the record, not a difference of two instants.

### No bound, and no crown

The contest bounds a duration to under an hour because that is the length of a room. The archive
holds Faxinger of unknown length, so no bound is imposed beyond what a count is (whole minutes,
0–59 seconds).

A corrected time changes no title. The chronicle's titles were frozen when the room closed
(`close` in `api/rooms.ts`), the crown is stored, and this editor does not call
`rankContestants()` — which is the invariant: a title is decided in one place, and correcting a
transcription is not deciding one.

### One press, with the rest of the corrections

The row writes into the component's draft and is stored by «Lagre alle endringer», the same single
`PUT` the editor already sends. Saving per keystroke would put a half-typed time in the chronicle,
and a second endpoint would be a second writer of `attendees`.
