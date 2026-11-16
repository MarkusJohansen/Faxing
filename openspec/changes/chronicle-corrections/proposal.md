## Why

The Faxepave can already correct a filed Faxing's name, its day, its officiality, and each
participant's name and standing. One field is read-only: the drinking time. That is the field an
old record most often gets wrong — a time read off a chat message with no seconds, a name filed
with no time at all, "under ti minutter" written down as a number — and today the only way to
change it is to delete the Faxing and file it again, which loses its place in the chronicle and
its contestant ids.

## What Changes

- **A time is written from the row.** In the Faxepave's edit form each participant's drinking
  time is two boxes, minutes and seconds, in the same shape the "føy til deltager" form uses.
  What is typed is what the row stores; pressing «Lagre alle endringer» writes it with the rest of
  the corrections, in the one `PUT` the editor already sends.
- **A time can be cleared.** Emptying both boxes records that the record states no time, and the
  row reads `Tid ukjent` after saving. Correcting a wrong time and stating that there is none are
  the same edit.
- **No crown moves.** A corrected time changes who finished when, never who was crowned: the
  titles in a filed Faxing were frozen when it closed, and this change adds no path that
  recomputes them.

Nothing about the reader's view changes: a guest still sees the time as text.
