## Why

Recurring attendants type themselves in at every Faxing, and they type differently: "Arne",
"arne h", "Arne Hildrum". The chronicle then holds several names for one person, and the
`person-identity` change can only repair that afterwards. Offering the names already in the
chronicle while someone types stops the split where it starts.

## What Changes

- **Suggestions while typing**: the lobby's name field lists up to five people from the chronicle
  whose name resembles what has been typed, tolerating a missed letter, a swapped letter, a
  missing æøå and a half-typed name.
- **Choosing one fills in the person**: their full name and the gender last recorded for them. Both
  stay editable. The stored name is then the full name, so the existing person key
  (`chronicle-people`) joins the entries with no new field.
- **Nothing is forced**: a new name is still accepted as typed, and a suggestion already in this
  room is shown as taken.

## Capabilities

### New Capabilities
- `room-lobby`: how a person gets into a room.

## Impact

- New: `src/lib/suggest.ts`, `src/lib/suggest.demo.ts` (in `check:rules`).
- `src/components/RoomLobby.tsx`, `src/App.tsx` (passes the chronicle), `src/App.css`.
- Reads the chronicle the app already loads: no new endpoint, no server change, no schema
  change, no dependency, no new network target. Fuzzy matching is a small function, not a library.
