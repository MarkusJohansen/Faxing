import { rowsToGrid } from '../lib/pixelArt'
import { inked } from '../lib/pixelInk'

// Three frames of one flame: upright, leaning, and low and wide. Cycled, they read as fire.
const FLAME_FRAMES = [
  ['....L....', '...LL....', '...LFL...', '..LLFL...', '..LFFLL..', '.ELFFFLE.', '.ELFkFLE.', '..ELFLE..', '...EEE...'],
  ['.....L...', '....LL...', '...LFL...', '...LFLL..', '..LLFFL..', '.ELFFFLE.', '.ELFkFLE.', '..ELFLE..', '...EEE...'],
  ['.........', '....L....', '...LLL...', '..LLFL...', '..LFFFL..', '.ELFFFLE.', 'ELFFkFFLE', '.ELFFFLE.', '..EEEEE..'],
].map(rows => inked(rowsToGrid(rows)))
const FLAME_ROWS = 9
const HANDLE = inked(rowsToGrid(['..ggggg..', '..aaaaa..', '...aga...', '...aga...', '...aga...', '...aga...', '....a....']))

/** A wall torch. Decorative; with motion reduced it shows its first frame, still. */
export default function Torch({ className = '' }: { className?: string }) {
  return (
    <svg className={`torch ${className}`} viewBox="0 0 9 16" shapeRendering="crispEdges" aria-hidden="true" focusable="false">
      <g transform={`translate(0 ${FLAME_ROWS})`}>{HANDLE}</g>
      {FLAME_FRAMES.map((frame, index) => <g key={index} className={`torch-frame frame-${index}`}>{frame}</g>)}
    </svg>
  )
}
