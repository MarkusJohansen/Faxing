import type { Crown, CrownLine, Reign } from '../lib/succession'
import { formatDate, formatTime } from '../lib/format'

interface Props {
  lines: CrownLine[]
  onOpen: (eventId: string) => void
}

const LABEL: Record<Crown, string> = { Faxekonge: 'Kongerekka', Faxedronning: 'Dronningrekka', Faxemonark: 'Monarkrekka' }
const NOUN: Record<Crown, string> = { Faxekonge: 'konge', Faxedronning: 'dronning', Faxemonark: 'monark' }

/** Who has held each crown, and at which Faxing. Which Faxinger count is decided in lib/succession. */
export default function CrownSuccession({ lines, onOpen }: Props) {
  const crowned = lines.some(line => line.reigns.length > 0)
  const reigning = lines.some(line => line.reigns.some(reign => reign.reigning))
  return <div className="succession-screen">
    <div className="history-heading"><div><p className="eyebrow">Faxe Ordenens kronefølge</p><h2 className="panel-title">Kronerekka</h2><p className="panel-desc">Hvem som haver båret kronen, og ved hvilken Faxing den blev vundet. Eldst først, i den orden de blev kronet.</p>{reigning && <p className="succession-legend"><span className="royal-crown" aria-hidden="true">♛</span> Den som bærer mærket «Regjerende», blev kronet ved den siste offisielle Faxing.</p>}</div></div>
    {crowned ? <div className="succession-lines">{lines.map(line => <CrownLineView key={line.crown} line={line} onOpen={onOpen} />)}</div> : <div className="scroll-panel timeline-empty-state"><h3>Ingen krone er ennu vunnet</h3><p>Den første Faxing venter på å krone sin konge. Når den er skrevet, står rekka her.</p></div>}
  </div>
}

function CrownLineView({ line, onOpen }: { line: CrownLine; onOpen: (eventId: string) => void }) {
  const { crown, reigns } = line
  return <section className="succession-line" aria-labelledby={`succession-${crown}`}>
    <div className="succession-heading"><span className="royal-crown" aria-hidden="true">♛</span><h3 id={`succession-${crown}`} className="succession-title">{LABEL[crown]}</h3><span className="succession-count">{reigns.length === 0 ? 'ingen kronet' : `${reigns.length} kroning${reigns.length === 1 ? '' : 'er'}`}</span></div>
    {reigns.length === 0
      ? <p className="succession-void">Ingen {NOUN[crown]} er kronet ennu.</p>
      : <ol className="succession-thread">{reigns.map((reign, index) => <ReignNode key={`${reign.eventId}-${index}`} reign={reign} onOpen={onOpen} />)}</ol>}
  </section>
}

function ReignNode({ reign, onOpen }: { reign: Reign; onOpen: (eventId: string) => void }) {
  return <li className={reign.reigning ? 'succession-node succession-node-reigning' : 'succession-node'}>
    <button className="succession-card" onClick={() => onOpen(reign.eventId)}>
      <span className="succession-card-date">{formatDate(reign.date)}</span>
      <strong className="succession-card-name">{reign.name}{reign.recordedAs !== null && <span className="succession-card-legacy"> · {reign.recordedAs}</span>}</strong>
      <span className="succession-card-event">{reign.eventName}</span>
      <span className="succession-card-meta"><span className="succession-card-time">{reign.elapsed === null ? 'Tid ukjent' : formatTime(reign.elapsed)}</span>{reign.reigning && <span className="succession-card-reigning">Regjerende</span>}</span>
    </button>
  </li>
}
