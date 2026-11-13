import { createLayer } from '../lib/pixelArt'
import { inked } from '../lib/pixelInk'

const WIDTH = 192
const HEIGHT = 14
const GROUND = 12
const HEADSTONES = [14, 41, 67, 98, 131, 160, 181]
const CROSSES = [27, 83, 117, 146]
// Three swarms, so that they can blink and wander out of step with each other.
const FIREFLY_SWARMS: Array<Array<[number, number]>> = [
  [[20, 4], [90, 7], [152, 3]],
  [[52, 6], [110, 2], [174, 8]],
  [[35, 2], [74, 9], [138, 6]],
]

function paintGraveyard() {
  const yard = createLayer(WIDTH, HEIGHT)
  yard.rect(0, GROUND, WIDTH, HEIGHT - GROUND, 'c')
  for (let x = 2; x < WIDTH; x += 7) yard.set(x + (x % 3), GROUND - 1, 'e')
  HEADSTONES.forEach(x => {
    yard.rect(x + 1, GROUND - 6, 3, 1, 'f')
    yard.rect(x, GROUND - 5, 5, 5, 'd')
    yard.rect(x, GROUND - 5, 1, 5, 'e')
    yard.rect(x + 1, GROUND - 3, 3, 1, 'c')
  })
  CROSSES.forEach(x => {
    yard.rect(x, GROUND - 6, 1, 6, 'd')
    yard.rect(x - 1, GROUND - 4, 3, 1, 'd')
  })
  const swarms = FIREFLY_SWARMS.map(swarm => {
    const layer = createLayer(WIDTH, HEIGHT)
    swarm.forEach(([x, y]) => layer.set(x, y, 'F'))
    return inked(layer.grid)
  })
  return { yard: inked(yard.grid), swarms }
}

const GRAVEYARD = paintGraveyard()

/** The footer's graveyard, with fireflies. Decorative only. */
export default function GraveScene() {
  return (
    <svg className="grave-scene" viewBox={`0 0 ${WIDTH} ${HEIGHT}`} shapeRendering="crispEdges" aria-hidden="true" focusable="false">
      {GRAVEYARD.yard}
      {GRAVEYARD.swarms.map((swarm, index) => <g key={index} className={`firefly swarm-${index}`}>{swarm}</g>)}
    </svg>
  )
}
