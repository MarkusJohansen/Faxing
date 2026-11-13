/**
 * Pixel art as data. A grid is rows of single-character ink keys; `gridToPaths` merges
 * each horizontal run of one key into a sub-path, giving one SVG path per ink.
 *
 * One path per ink (rather than one <rect> per pixel) keeps a 192×64 scene at a dozen DOM
 * nodes instead of twelve thousand, and lets every fill come from a CSS custom property,
 * so the art follows the palette tokens instead of carrying colours of its own.
 */
export type Grid = string[][]

export function createGrid(width: number, height: number, ink: string): Grid {
  return Array.from({ length: height }, () => Array<string>(width).fill(ink))
}

export function gridToPaths(grid: Grid): Map<string, string> {
  const paths = new Map<string, string>()
  grid.forEach((row, y) => {
    let start = 0
    for (let x = 1; x <= row.length; x++) {
      if (x < row.length && row[x] === row[start]) continue
      const ink = row[start]
      const run = x - start
      paths.set(ink, `${paths.get(ink) ?? ''}M${start} ${y}h${run}v1h-${run}z`)
      start = x
    }
  })
  return paths
}
