import { createGrid, gridToPaths, type Grid } from '../lib/pixelArt'

const WIDTH = 192
const HEIGHT = 64

// Ink key → palette token. The scene owns no colour: restyle the tokens and it follows.
const INKS: Record<string, string> = {
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
}
// Lit inks are drawn in their own group so that only they flicker.
const LIT_INKS = new Set(['L', 'F'])

const STARS: Array<[number, number]> = [
  [6, 4], [31, 9], [47, 3], [62, 14], [75, 6], [121, 5], [133, 12], [150, 4], [166, 10], [185, 6], [40, 19], [158, 21],
]
const CRATERS: Array<[number, number]> = [
  [100, 13], [101, 13], [101, 14], [92, 22], [93, 22], [99, 24], [104, 19], [89, 15],
]
const FAR_SPIRES: Array<[number, number, number]> = [
  [22, 30, 3], [36, 35, 2], [58, 28, 4], [72, 37, 2], [118, 33, 3], [136, 27, 4], [154, 36, 2], [170, 31, 3],
]
const LIT_WINDOWS: Array<[number, number]> = [[7, 34], [12, 42], [180, 38], [186, 30]]
const ARCH_CENTRES = [48, 96, 144]
const LANTERN_POSTS = [30, 52, 74, 118, 140, 162]
const MOON = { x: 96, y: 18, radius: 12 }

function paintScene(): Grid {
  const grid = createGrid(WIDTH, HEIGHT, 'c')
  const set = (x: number, y: number, ink: string) => {
    if (x >= 0 && x < WIDTH && y >= 0 && y < HEIGHT) grid[y][x] = ink
  }
  const rect = (x: number, y: number, w: number, h: number, ink: string) => {
    for (let row = y; row < y + h; row++) for (let col = x; col < x + w; col++) set(col, row, ink)
  }
  const dither = (x: number, y: number, w: number, h: number, ink: string) => {
    for (let row = y; row < y + h; row++) for (let col = x; col < x + w; col++) if ((col + row) % 2 === 0) set(col, row, ink)
  }

  // Sky: bands lightening toward the horizon, each seam dithered.
  dither(0, 12, WIDTH, 2, 'd')
  rect(0, 14, WIDTH, HEIGHT - 14, 'd')
  dither(0, 28, WIDTH, 2, 'e')
  rect(0, 30, WIDTH, HEIGHT - 30, 'e')
  dither(0, 42, WIDTH, 2, 'f')
  rect(0, 44, WIDTH, HEIGHT - 44, 'f')
  STARS.forEach(([x, y]) => set(x, y, 'i'))

  // Moon: dithered halo, pale disc, brighter upper-left, a few craters.
  for (let y = MOON.y - 17; y <= MOON.y + 17; y++) {
    for (let x = MOON.x - 17; x <= MOON.x + 17; x++) {
      const distance = Math.hypot(x - MOON.x, y - MOON.y)
      if (distance <= MOON.radius) set(x, y, Math.hypot(x - (MOON.x - 3), y - (MOON.y - 3)) <= 7 ? 'k' : 'j')
      else if (distance <= MOON.radius + 4 && (x + y) % 2 === 0) set(x, y, 'e')
    }
  }
  CRATERS.forEach(([x, y]) => set(x, y, 'i'))

  // Cloud streaks, one crossing the moon's lower limb.
  const cloud = (x: number, y: number, length: number, ink: string) => {
    rect(x, y, length, 1, ink)
    rect(x + 3, y + 1, length - 7, 1, ink)
  }
  cloud(82, 23, 30, 'g')
  cloud(18, 10, 24, 'd')
  cloud(140, 16, 28, 'e')
  cloud(50, 33, 22, 'f')

  // A spire is a stepped roof over a straight shaft running off the bottom of the scene.
  const spire = (centre: number, top: number, half: number, ink: string) => {
    const roof = half * 4
    set(centre, top - 2, ink)
    rect(centre - 1, top - 1, 3, 1, ink)
    for (let y = top; y < HEIGHT; y++) {
      const width = y < top + roof ? Math.floor(((y - top) * half) / roof) : half
      rect(centre - width, y, width * 2 + 1, 1, ink)
    }
  }
  FAR_SPIRES.forEach(([centre, top, half]) => spire(centre, top, half, 'c'))

  // Near towers frame the scene, with lit windows.
  spire(9, 6, 10, 'a')
  spire(183, 10, 10, 'a')
  LIT_WINDOWS.forEach(([x, y]) => {
    rect(x, y, 2, 3, 'L')
    set(x, y + 1, 'F')
  })

  // Bridge: parapet, deck, and three arches open to the mist beyond.
  for (let x = 0; x < WIDTH; x += 4) rect(x, 49, 2, 1, 'a')
  rect(0, 50, WIDTH, 3, 'a')
  rect(0, 53, WIDTH, HEIGHT - 53, 'b')
  ARCH_CENTRES.forEach(centre => {
    for (let y = 54; y < HEIGHT; y++) {
      for (let x = centre - 16; x <= centre + 16; x++) {
        if (((x - centre) / 16) ** 2 + ((y - HEIGHT) / 10) ** 2 <= 1) set(x, y, y > 59 && (x + y) % 2 === 0 ? 'e' : 'd')
      }
    }
  })

  // Lanterns on the parapet: an ember halo, a post, a flame.
  LANTERN_POSTS.forEach(x => {
    for (let dy = -3; dy <= 1; dy++) {
      for (let dx = -2; dx <= 2; dx++) {
        if ((dx + dy) % 2 !== 0 && Math.abs(dx) + Math.abs(dy) <= 3) set(x + dx, 46 + dy, 'E')
      }
    }
    rect(x, 47, 1, 3, 'a')
    set(x, 46, 'L')
    set(x, 45, 'F')
  })
  return grid
}

// Painted once at module load: the scene has no inputs, so there is nothing to recompute.
const PATHS = [...gridToPaths(paintScene())]
const inkPath = ([ink, d]: [string, string]) => <path key={ink} d={d} style={{ fill: `var(${INKS[ink]})` }} />

/** The header's night scene. Decorative only, so it is hidden from assistive technology. */
export default function NightScene() {
  return (
    <svg className="night-scene" viewBox={`0 0 ${WIDTH} ${HEIGHT}`} preserveAspectRatio="xMidYMax slice" shapeRendering="crispEdges" aria-hidden="true" focusable="false">
      {PATHS.filter(([ink]) => !LIT_INKS.has(ink)).map(inkPath)}
      <g className="scene-flames">{PATHS.filter(([ink]) => LIT_INKS.has(ink)).map(inkPath)}</g>
    </svg>
  )
}
