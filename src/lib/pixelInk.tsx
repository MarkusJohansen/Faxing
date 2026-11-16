import { gridToPaths, type Grid } from './pixelArt'

// Ink key → palette token. Pixel art owns no colour: restyle the tokens and it follows.
export const INKS: Record<string, string> = {
  a: '--night-900',
  b: '--night-800',
  c: '--night-700',
  d: '--stone-700',
  e: '--stone-600',
  f: '--stone-500',
  g: '--stone-400',
  i: '--mist-200',
  j: '--moon-100',
  k: '--moon-50',
  P: '--dusk-700',
  Q: '--dusk-500',
  R: '--dusk-300',
  E: '--ember-500',
  L: '--lantern-400',
  F: '--flame-200',
}

/** A grid as SVG paths, one per ink. */
export const inked = (grid: Grid) => gridToPaths(grid).map(([ink, d]) => <path key={ink} d={d} style={{ fill: `var(${INKS[ink]})` }} />)
