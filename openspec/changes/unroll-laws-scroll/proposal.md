## Why

The laws are drawn as a scroll, but the scroll arrives already open, like any other panel. A
scroll is a thing that is opened. Rolling it open when the page is shown is the one motion
that says what the object is.

## What Changes

- **The scroll is rolled open each time the laws are shown.** It starts rolled, the two rolls
  together; the foot roll travels down and uncovers the writing from the head to the foot, and
  the seal rides with it and swings to rest.
- **The motion is ornament.** The ten buds are in the page from the first moment, and a visitor
  who has asked for less motion gets the open scroll at once.

## Capabilities

### Modified Capabilities
- `order-laws`: gains the unrolling. Its other requirements stand as written.

## Impact

- Client only: `src/components/TenBuds.tsx` gains one box that carries the foot roll and the
  seal, and `src/App.css` gains the keyframes. No script, no timer, no state, no dependency.
