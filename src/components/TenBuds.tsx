// The order's law as the Eldsterådet set it down: ten buds on a parchment scroll, under the
// arms of the order and the Faxepave's seal. Static copy — nothing here is derived or fetched.
import crest from '../assets/faxing-crest.svg'
import { ORDER_ARMS, PAPAL_SEAL } from '../lib/orderArms'
import { rowsToGrid } from '../lib/pixelArt'
import { inked } from '../lib/pixelInk'

/**
 * The ten buds, word for word as they came down from Hoddevik. The spelling is the canon's
 * own and is not to be corrected: «inntas», «indens» and «aldrig» are how the order wrote them.
 */
const BUDS = [
  'Du skal ære Faxe over alt andet brygg.',
  'Du skal ej åbne din Faxe før timen er kommen.',
  'Du skal tømme din Faxe på én time, og drikken skal inntas fra boksen.',
  'Du skal aldrig tukle med Faxe-boksen, hverken før eller efter åbning.',
  'De første som tømmer, blir Faxekonge og Faxedronning.',
  'Den som tømmer inden timen, skal kaldes ridder.',
  'Den som ej fuldfører på timen, forblir hestemann.',
  'Du skal hædre dine brødre og søstre i Faxe Ordenen.',
  'Du skal aldrig lade Faxe gå til spilde.',
  'Den, som kaster op indens Faxens time, skal kaldes hestemann.',
]

/** Roman capitals, as a scribe numbers a canon. The list itself carries the count. */
const NUMERALS = ['I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX', 'X']

export default function TenBuds() {
  return <section className="laws-screen">
    <article className="laws-scroll" aria-labelledby="laws-title">
      <div className="laws-roll laws-roll-head" aria-hidden="true" />
      <div className="laws-sheet">
        <svg className="laws-arms" viewBox="0 0 128 128" shapeRendering="crispEdges" role="img" aria-label="Faxeordenens våpen: to kryssede sverd bak et skjold med en Faxe-boks, holdt av to løver" focusable="false">
          {inked(rowsToGrid(ORDER_ARMS))}
        </svg>
        <h2 className="laws-title" id="laws-title">De 10 Bud</h2>
        <p className="laws-rubric">Nedskrevet efter Eldsterådets to steintavler</p>
        <ol className="laws-list" role="list">
          {BUDS.map((bud, index) => <li key={bud}>
            <span className="laws-number" aria-hidden="true">{NUMERALS[index]}</span>
            <span className="laws-bud">{bud}</span>
          </li>)}
        </ol>
        <p className="laws-colophon">Sendt med brevdue til Backlog, og siden aldrig forandret.</p>
      </div>
      {/* The foot roll and the seal travel together when the scroll is rolled open, in a box as
          tall as the scroll, so "its own height" is the distance they have to go. */}
      <div className="laws-foot">
        <div className="laws-roll laws-roll-foot" aria-hidden="true" />
        <svg className="laws-seal" viewBox="0 0 32 43" shapeRendering="crispEdges" role="img" aria-label="Faxepavens segl i rødt voks, med ordenens skjold" focusable="false">
          {inked(rowsToGrid(PAPAL_SEAL))}
          <image className="laws-seal-crest" href={crest} x="5" y="16" width="22" height="22" />
        </svg>
      </div>
    </article>
  </section>
}
