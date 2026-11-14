// The order's own history, written by hand. Static copy: nothing here is derived or fetched.
import type { ReactNode } from 'react'
import { rowsToGrid } from '../lib/pixelArt'
import { inked } from '../lib/pixelInk'

// One emblem per chapter, drawn with the shared inks so it follows the palette tokens.
const EMBLEMS = {
  can: ['.fgggf.', '.ggggg.', '.kkkkk.', '.kEEEk.', '.kELEk.', '.kEEEk.', '.kkkkk.', '.ggggg.', '.fgggf.'],
  skull: ['..kkkkk..', '.kkkkkkk.', 'kkkkkkkkk', 'kaaakaaak', 'kaaakaaak', '.kkkakkk.', '..kkkkk..', '..kakak..'],
  flame: ['....L....', '...LL....', '...LFL...', '..LLFL...', '..LFFLL..', '.ELFFFLE.', '.ELFkFLE.', '..ELFLE..', '...EEE...'],
  tiara: ['....L....', '...LLL...', '..LLkLL..', '..LkkkL..', '.LLLkLLL.', '.LLkkkLL.', 'LLLLkLLLL', 'EEEEEEEEE', '.EEEEEEE.'],
  crown: ['L...L...L', 'LL.LLL.LL', 'LLLLLLLLL', 'LELLLLLEL', 'LLLLLLLLL', 'EEEEEEEEE'],
  saint: ['..LLLLL..', '.L.....L.', '.L.....L.', '..LLLLL..', '...kkk...', '..kkkkk..', '.kkkkkkk.', '.kk.k.kk.'],
} as const

function Emblem({ name }: { name: keyof typeof EMBLEMS }) {
  const rows = EMBLEMS[name]
  return <svg className="lore-emblem" viewBox={`0 0 ${rows[0].length} ${rows.length}`} width={rows[0].length * 4} height={rows.length * 4} shapeRendering="crispEdges" aria-hidden="true" focusable="false">
    {inked(rowsToGrid([...rows]))}
  </svg>
}

const CHAPTERS: { title: string; emblem: keyof typeof EMBLEMS; body: ReactNode }[] = [
  {
    title: 'Pilgrimsreisene til Hoddevik',
    emblem: 'can',
    body: <>
      <p>I eldre dager samlet Linjeforeningen Onlines tropper seg hvert år til pilgrimsreise mot Hoddevik. Utad var det ritualet <em>surfing</em> som ble gjennomført, men turens egentlige mål var noe helt annet: <em>faxing</em>.</p>
      <p>Faxingen ble ledet av dem vi i dag kjenner som <em>Eldsterådet</em>, den gang kalt <em>faxe-gjengen</em>: <strong>Fyrst Njål Sørland</strong>, <strong>Grev Magne av Slaatsveen</strong> og <strong>Hertug Ivar av Hembre</strong>. Ved det siste faxetoktet ble <strong>Markus Johansen</strong> innlemmet i rådet, og han satte seg i respekt ved å tømme boksen sin på <em>15 minutter</em>. Dette øyeblikket regnes som samlingen av <em>den første orden</em>, under <strong>Kong Markus I</strong>.</p>
    </>,
  },
  {
    title: 'Den mørke middelalderen',
    emblem: 'skull',
    body: <>
      <p>Regjeringstiden til Markus I skulle vise seg å bli starten på Faxeordenens mørke middelalder. Linjeforeningen sluttet med pilgrimsreisene til Hoddevik, og medlemmene av Eldsterådet forlot oss, én etter én, på reisen mot <em>det lovede land</em> (også kjent som arbeidslivet). Faxetradisjonen ble sakte, men sikkert et vagt minne som kun levde videre gjennom regenten.</p>
      <p>Den lille gløden som var igjen, ble heldigvis holdt i live av regenten og hans hoff, Profil- og aviskomiteen (prokom), og spesielt av <strong>Jarl Are Tømmerås</strong>. Jarl Are ble det siste medlemmet som offisielt ble innlemmet i den første orden.</p>
    </>,
  },
  {
    title: 'Gjenfødelsen',
    emblem: 'flame',
    body: <>
      <p>Uårene gikk, men gløden sloknet aldri. Høsten 2024, under en skjebnesvanger hyttetur med prokom, ble den til en flamme. Faxingen blomstret opp igjen med hele 8 deltakere, som den gang var rekord. <strong>William Fagerstrøm</strong> tok seieren på under 10 minutter, en sagnomsust grense på den tiden, og ble kronet til <strong>Faxekonge William I</strong>.</p>
      <p>Entusiasmen rundt faxingen økte betraktelig, og kulminerte i det vi i dag omtaler som <em>konsilet på A4</em>.</p>
    </>,
  },
  {
    title: 'Konsilet på A4 og den andre orden',
    emblem: 'tiara',
    body: <>
      <p>Konsilet markerer stiftelsen av <em>den andre orden</em>. Faxekonge William I viste nåde mot kongen han selv hadde avsatt, og opphøyde Markus I til <strong>Pave</strong>, til ære for hans rolle i faxingens overlevelse. Selv tok William tittelen <strong>Den faxumenske patriark</strong>, for å vise at ordenen kan ledes i samarbeid, og at ordenen står over regentene. Regenter er midlertidige. Ordenen er evig.</p>
      <p>Sammen sendte de en brevdue til Backlog med <em>de 10 bud</em>. Budene var muntlig overlevert fra Eldsterådet, som selv fant dem på to steintavler i Hoddevik. Slik ble ordenen en interessegruppe i linjeforeningen.</p>
      <p>Eldsterådet og Jarl Are ble deretter kanonisert av Pave Markus I og Patriark William I, og skal derfor omtales som <strong>St. Njål</strong>, <strong>St. Magne</strong>, <strong>St. Ivar</strong> og <strong>St. Are</strong>.</p>
    </>,
  },
  {
    title: 'Den første kongen av den andre orden',
    emblem: 'crown',
    body: <>
      <p>Med den andre orden stiftet trengte faxingen en ny regent. Det ble avgjort fortere enn noen hadde ventet. I løpet av timens første halvannet minutt var <strong>Scott Jennings</strong> ferdig med sine edle dråper, på <em>ett minutt og 23 sekunder</em>. Slik ble han erkekonge og den første kongen av den andre orden, med kongsnavnet <strong>Fax, den første av hans navn</strong>.</p>
      <p>Kong Fax I nøyde seg ikke med å bære kronen. Han smidde den selv. Med egne hender skapte han <em>faxeregaliene</em>, som siden har fulgt ordenens regenter:</p>
      <ul>
        <li><strong>Faxcalibur</strong>, ordenens sverd</li>
        <li><strong>Kongekronen</strong></li>
        <li><strong>Dronningkronen</strong></li>
      </ul>
    </>,
  },
  {
    title: 'Abdikasjon og arvefølge',
    emblem: 'saint',
    body: <>
      <p>I Faxeordenen er det tradisjon for at paver, patriarker og matriarker abdiserer og trer inn i <em>Faxerådet</em>. Slik unngår ordenen en ny mørk tidsalder som den under Markus I, og slik kan også ordenens ledere ta reisen fra de grå havner (Gløshaugen) mot det lovede land (arbeidslivet).</p>
      <p>Da Markus I og William I abdiserte, tok <strong>Gleb Rychkov</strong> over ansvaret under navnet <strong>Faxepave Leopold II</strong>. Leopold I er en mytisk skikkelse i faxemytologien. Det sies at han var konge, pave og hestemann på én gang!</p>
      <p>Faxepave Leopold II kanoniserte sine forgjengere, som derfor skal omtales som deres hellighet <strong>St. Markus</strong> og <strong>St. William</strong>.</p>
    </>,
  },
]

export default function Lore() {
  return <section className="lore-screen scroll-panel">
    <p className="eyebrow">Faxe Ordenens annaler</p>
    <h2 className="panel-title">Faxekrøniken</h2>
    <p className="panel-desc">Den offisielle historien om faxingen og Faxeordenen.</p>
    <div className="lore-chapters">
      {CHAPTERS.map(chapter => <article key={chapter.title}>
        <header><Emblem name={chapter.emblem} /><h3>{chapter.title}</h3></header>
        {chapter.body}
      </article>)}
    </div>
  </section>
}
