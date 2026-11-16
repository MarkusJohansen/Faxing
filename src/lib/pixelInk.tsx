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
  E: '--ember-500',
  L: '--lantern-400',
  F: '--flame-200',
  // The 10 Bud page's own materials: the parchment it is written on, its ink, the brass and
  // steel of the arms, and the wax of the Faxepave's seal. `orderArms` draws only with these.
  P: '--parchment-100',
  G: '--brass-400',
  D: '--brass-600',
  S: '--steel-400',
  T: '--steel-200',
  K: '--ink-900',
  R: '--wax-300',
  W: '--wax-500',
  U: '--wax-700',
  Q: '--wax-900',
}

/** A grid as SVG paths, one per ink. */
export const inked = (grid: Grid) => gridToPaths(grid).map(([ink, d]) => <path key={ink} d={d} style={{ fill: `var(${INKS[ink]})` }} />)
