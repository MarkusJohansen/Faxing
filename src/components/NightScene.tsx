import { createLayer, rowsToGrid } from '../lib/pixelArt'
import { inked } from '../lib/pixelInk'

const WIDTH = 192
const HEIGHT = 64

const STARS: Array<[number, number]> = [
  [6, 4], [31, 9], [47, 3], [62, 14], [75, 6], [121, 5], [133, 12], [150, 4], [166, 10], [185, 6], [40, 19], [158, 21],
]
const CRATERS: Array<[number, number]> = [
  [100, 13], [101, 13], [101, 14], [92, 22], [93, 22], [99, 24], [104, 19], [89, 15],
]
const CLOUDS: Array<[x: number, y: number, length: number, ink: string]> = [
  [82, 23, 30, 'g'], [18, 10, 24, 'd'], [140, 16, 28, 'e'], [50, 33, 22, 'f'],
]
const FAR_SPIRES: Array<[number, number, number]> = [
  [22, 30, 3], [36, 35, 2], [58, 28, 4], [72, 37, 2], [118, 33, 3], [136, 27, 4], [154, 36, 2], [170, 31, 3],
]
// Two sets of windows, so that one can gutter while the other burns steady.
const WINDOW_SETS: Array<Array<[number, number]>> = [
  [[7, 34], [186, 30]],
  [[12, 42], [180, 38]],
]
const ARCH_CENTRES = [48, 96, 144]
// The two outermost posts of the bridge carry the header's large torches instead.
const LANTERN_POSTS = [52, 74, 118, 140]
const FOG_BANKS: Array<[x: number, y: number, length: number]> = [[10, 58, 34], [70, 60, 46], [128, 57, 30], [160, 61, 26]]
const MOON = { x: 96, y: 18, radius: 12 }

// A bat in two frames, wings up and wings down.
const BAT_FRAMES = [
  ['a.....a', 'aa.a.aa', '.aaaaa.'],
  ['.......', '.aaaaa.', 'aa.a.aa'],
].map(rows => inked(rowsToGrid(rows)))

// A cloaked wanderer with a lantern, mid-stride and feet together.
const WANDERER_BODY = ['...a...', '..aaa..', '.aaaaa.', '..aaa..', '.aaaaa.', '.aaaaaa', '.aaaaaL', '.aaaaaF', '.aaaaa.']
const WANDERER_FRAMES = [
  [...WANDERER_BODY, '..a.a..', '..a.a..'],
  [...WANDERER_BODY, '..aaa..', '...a...'],
].map(rows => inked(rowsToGrid(rows)))
// Feet on the bridge deck, which is row 50.
const WANDERER_TOP = 50 - WANDERER_BODY.length - 2

/**
 * The scene is painted in layers, back to front, so that each can move on its own:
 * sky and moon, stars (two sets that twinkle out of step), clouds (drifting, behind the
 * buildings), the town, fog, lantern glow, windows and flame.
 */
function paintScene() {
  const sky = createLayer(WIDTH, HEIGHT, 'c')
  // Sky: bands lightening toward the horizon, each seam dithered.
  sky.dither(0, 12, WIDTH, 2, 'd')
  sky.rect(0, 14, WIDTH, HEIGHT - 14, 'd')
  sky.dither(0, 28, WIDTH, 2, 'e')
  sky.rect(0, 30, WIDTH, HEIGHT - 30, 'e')
  sky.dither(0, 42, WIDTH, 2, 'f')
  sky.rect(0, 44, WIDTH, HEIGHT - 44, 'f')
  // Moon: dithered halo, pale disc, brighter upper-left, a few craters.
  for (let y = MOON.y - 17; y <= MOON.y + 17; y++) {
    for (let x = MOON.x - 17; x <= MOON.x + 17; x++) {
      const distance = Math.hypot(x - MOON.x, y - MOON.y)
      if (distance <= MOON.radius) sky.set(x, y, Math.hypot(x - (MOON.x - 3), y - (MOON.y - 3)) <= 7 ? 'k' : 'j')
      else if (distance <= MOON.radius + 4 && (x + y) % 2 === 0) sky.set(x, y, 'e')
    }
  }
  CRATERS.forEach(([x, y]) => sky.set(x, y, 'i'))

  const starSets = [createLayer(WIDTH, HEIGHT), createLayer(WIDTH, HEIGHT)]
  STARS.forEach(([x, y], index) => starSets[index % 2].set(x, y, 'i'))

  const clouds = createLayer(WIDTH, HEIGHT)
  CLOUDS.forEach(([x, y, length, ink]) => {
    clouds.rect(x, y, length, 1, ink)
    clouds.rect(x + 3, y + 1, length - 7, 1, ink)
  })

  const town = createLayer(WIDTH, HEIGHT)
  // A spire is a stepped roof over a straight shaft running off the bottom of the scene.
  const spire = (centre: number, top: number, half: number, ink: string) => {
    const roof = half * 4
    town.set(centre, top - 2, ink)
    town.rect(centre - 1, top - 1, 3, 1, ink)
    for (let y = top; y < HEIGHT; y++) {
      const width = y < top + roof ? Math.floor(((y - top) * half) / roof) : half
      town.rect(centre - width, y, width * 2 + 1, 1, ink)
    }
  }
  FAR_SPIRES.forEach(([centre, top, half]) => spire(centre, top, half, 'c'))
  // Near towers frame the scene.
  spire(9, 6, 10, 'a')
  spire(183, 10, 10, 'a')
  // Bridge: parapet, deck, and three arches open to the mist beyond.
  for (let x = 0; x < WIDTH; x += 4) town.rect(x, 49, 2, 1, 'a')
  town.rect(0, 50, WIDTH, 3, 'a')
  town.rect(0, 53, WIDTH, HEIGHT - 53, 'b')
  ARCH_CENTRES.forEach(centre => {
    for (let y = 54; y < HEIGHT; y++) {
      for (let x = centre - 16; x <= centre + 16; x++) {
        if (((x - centre) / 16) ** 2 + ((y - HEIGHT) / 10) ** 2 <= 1) town.set(x, y, y > 59 && (x + y) % 2 === 0 ? 'e' : 'd')
      }
    }
  })
  LANTERN_POSTS.forEach(x => town.rect(x, 47, 1, 3, 'a'))

  // Fog: dithered banks low over the water, in front of the bridge.
  const fog = createLayer(WIDTH, HEIGHT)
  FOG_BANKS.forEach(([x, y, length]) => {
    fog.dither(x, y, length, 2, 'g')
    fog.dither(x + 4, y - 1, length - 9, 1, 'g')
  })

  // Light: an ember halo round each lantern, the flames, and the lit windows.
  const glow = createLayer(WIDTH, HEIGHT)
  const flames = createLayer(WIDTH, HEIGHT)
  LANTERN_POSTS.forEach(x => {
    for (let dy = -3; dy <= 1; dy++) {
      for (let dx = -2; dx <= 2; dx++) {
        if ((dx + dy) % 2 !== 0 && Math.abs(dx) + Math.abs(dy) <= 3) glow.set(x + dx, 46 + dy, 'E')
      }
    }
    flames.set(x, 46, 'L')
    flames.set(x, 45, 'F')
  })
  const windowSets = WINDOW_SETS.map(windows => {
    const layer = createLayer(WIDTH, HEIGHT)
    windows.forEach(([x, y]) => {
      layer.rect(x, y, 2, 3, 'L')
      layer.set(x, y + 1, 'F')
    })
    return inked(layer.grid)
  })

  return {
    sky: inked(sky.grid),
    starSets: starSets.map(set => inked(set.grid)),
    clouds: inked(clouds.grid),
    town: inked(town.grid),
    fog: inked(fog.grid),
    glow: inked(glow.grid),
    flames: inked(flames.grid),
    windowSets,
  }
}

// Painted once at module load: the scene has no inputs, so there is nothing to recompute.
const LAYERS = paintScene()

function Bat({ className }: { className: string }) {
  return (
    <g className={`scene-bat ${className}`}>
      <g className="two-frame frame-a">{BAT_FRAMES[0]}</g>
      <g className="two-frame frame-b">{BAT_FRAMES[1]}</g>
    </g>
  )
}

/** The header's night scene. Decorative only, so it is hidden from assistive technology. */
export default function NightScene() {
  return (
    <svg className="night-scene" viewBox={`0 0 ${WIDTH} ${HEIGHT}`} preserveAspectRatio="xMidYMax slice" shapeRendering="crispEdges" aria-hidden="true" focusable="false">
      {LAYERS.sky}
      <g className="scene-stars stars-a">{LAYERS.starSets[0]}</g>
      <g className="scene-stars stars-b">{LAYERS.starSets[1]}</g>
      {/* Drawn twice, one scene-width apart, so the drift wraps without a seam. */}
      <g className="scene-clouds">
        {LAYERS.clouds}
        <g transform={`translate(${-WIDTH} 0)`}>{LAYERS.clouds}</g>
      </g>
      <Bat className="bat-one" />
      <Bat className="bat-two" />
      {LAYERS.town}
      {/* The outer group carries the walk along the bridge, the inner one his height. */}
      <g className="scene-wanderer">
        <g transform={`translate(0 ${WANDERER_TOP})`}>
          <g className="two-frame frame-a slow-step">{WANDERER_FRAMES[0]}</g>
          <g className="two-frame frame-b slow-step">{WANDERER_FRAMES[1]}</g>
        </g>
      </g>
      <g className="scene-glow">{LAYERS.glow}</g>
      <g className="scene-flames">{LAYERS.flames}</g>
      <g className="scene-flames">{LAYERS.windowSets[0]}</g>
      <g className="scene-window-guttering">{LAYERS.windowSets[1]}</g>
      <g className="scene-fog">
        {LAYERS.fog}
        <g transform={`translate(${WIDTH} 0)`}>{LAYERS.fog}</g>
      </g>
    </svg>
  )
}
