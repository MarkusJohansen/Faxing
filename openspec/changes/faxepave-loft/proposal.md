## Why

Today a closed room writes itself straight into the chronicle. Whoever held the host token on
that device decided what the archive contains — including a room raised by mistake, a test with
two names in it, or a "Faxing" that was really a joke. The Faxepave, who keeps the archive, only
finds out afterwards, and deleting the entry by hand is the only correction.

The Faxepave's tools also grew where they were needed rather than where they belong: editing
lives on an event's page, adding an old Faxing goes through three browser prompt dialogs, and
nothing anywhere shows what is waiting to be dealt with.

## What Changes

- **Closing a room files a Faxing for approval, not in the chronicle.** The titles are still
  derived on the server at close, and the entry is still frozen; only its admission to the
  chronicle now waits for the Faxepave. The room's devices still land on the results page, which
  says the Faxing awaits the Faxepave.
- **The chronicle lists approved Faxings only.** The home screen's counts and the reigning tribute
  follow the same list, so a waiting Faxing cannot crown anyone.
- **The Faxepave approves or denies.** A denial removes the entry from the chronicle and keeps the
  row, so a mistaken denial can be restored and nothing recorded at close is destroyed.
- **A loft.** One screen for the Faxepave: what waits, what was refused, one press to decide, and
  a form for filing an old Faxing instead of three prompt dialogs. It is reachable from the nav
  only while the session is held.
- **A Faxing filed by hand is approved as written.** The Faxepave writing it is the decision.

## Capabilities

### New Capabilities
- `chronicle-approval`: a closed room waits for the Faxepave before it enters the chronicle.
- `faxepave-loft`: the operator's screen for deciding, restoring and filing old Faxinger.

## Impact

- Server: `faxing_events.status` (`pending` | `published` | `denied`), added by
  `ALTER TABLE ... ADD COLUMN IF NOT EXISTS` in `server/api.ts:migrate`; `api/rooms.ts:close`;
  `api/events.ts` (list filter, read by id, `PATCH` to decide).
- Client: `src/types.ts` (`EventStatus`), `src/lib/storage.ts`, `src/App.tsx` (screen state, the
  approval queue, nav), a new `src/components/FaxepaveLoft.tsx`, `src/components/EventView.tsx`
  (the approval notice), and the close copy in `src/components/Arena.tsx`.
- No new dependency, no new network target, no change to how a title is derived.
- This supersedes "Closing a room writes it to the chronicle" in
  `openspec/changes/faxing-rooms/specs/faxing-rooms/spec.md`, which describes the behaviour before
  this change. The `chronicle-approval` spec is the one to keep when that change is archived.

## Non-goals

- Approving a Faxing attendee by attendee: a Faxing is accepted or refused whole.
- A notification when a Faxing waits. There is no push channel and no mail; the count is on the
  loft, and the room's own devices see the results at once.
- Letting a host withdraw a closed room, or edit an entry after it is in the chronicle. Those stay
  the Faxepave's powers.
- A second password, a role table or accounts. One Faxepave password is the whole operator model.
