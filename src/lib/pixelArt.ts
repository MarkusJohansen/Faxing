/**
 * Pixel art as data. A grid is rows of single-character ink keys; `gridToPaths` merges
 * each horizontal run of one key into a sub-path, giving one SVG path per ink.
 *
 * One path per ink (rather than one <rect> per pixel) keeps a 192×64 scene at a dozen DOM
 * nodes instead of twelve thousand, and lets every fill come from a CSS custom property,
 * so the art follows the palette tokens instead of carrying colours of its own.
 */
export type Grid = string[][]

/** The ink that draws nothing: a layer is BLANK wherever the layer beneath shows through. */
export const BLANK = ' '

export function createGrid(width: number, height: number, ink: string = BLANK): Grid {
  return Array.from({ length: height }, () => Array<string>(width).fill(ink))
}

/** A grid plus the three brushes every layer of the scene is painted with. */
export function createLayer(width: number, height: number, ink: string = BLANK) {
  const grid = createGrid(width, height, ink)
  const set = (x: number, y: number, key: string) => {
    if (x >= 0 && x < width && y >= 0 && y < height) grid[y][x] = key
  }
  const rect = (x: number, y: number, w: number, h: number, key: string) => {
    for (let row = y; row < y + h; row++) for (let col = x; col < x + w; col++) set(col, row, key)
  }
  const dither = (x: number, y: number, w: number, h: number, key: string) => {
    for (let row = y; row < y + h; row++) for (let col = x; col < x + w; col++) if ((col + row) % 2 === 0) set(col, row, key)
  }
  return { grid, set, rect, dither }
}

export function gridToPaths(grid: Grid): Array<[ink: string, d: string]> {
  const paths = new Map<string, string>()
  grid.forEach((row, y) => {
    let start = 0
    for (let x = 1; x <= row.length; x++) {
      if (x < row.length && row[x] === row[start]) continue
      const ink = row[start]
      const run = x - start
      if (ink !== BLANK) paths.set(ink, `${paths.get(ink) ?? ''}M${start} ${y}h${run}v1h-${run}z`)
      start = x
    }
  })
  return [...paths]
}

/** A sprite typed as rows of ink keys, with `.` for nothing. For art small enough to draw by hand. */
export function rowsToGrid(rows: string[]): Grid {
  return rows.map(row => [...row].map(cell => (cell === '.' ? BLANK : cell)))
}
