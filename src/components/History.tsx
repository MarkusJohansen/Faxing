import type { FaxingEvent } from '../types'
import { formatDate } from '../lib/format'
import { isOfTheFirstOrder } from '../lib/succession'

interface HistoryProps {
  events: FaxingEvent[]
  onOpen: (event: FaxingEvent) => void
  onCreate: () => void
  isAdmin?: boolean
}

const yearOf = (date: number) => new Date(date).getFullYear()

export default function History({ events, onOpen, onCreate, isAdmin = false }: HistoryProps) {
  const ordered = [...events].sort((a, b) => b.date - a.date)
  const years = [...new Set(ordered.map(event => yearOf(event.date)))]
  return <div className="history-screen">
    <div className="history-heading"><div><p className="eyebrow">Faxe Ordenens arkiv</p><h2 className="panel-title">Faxingens Krønike</h2><p className="panel-desc">En levende tidslinje over hver dyst, hvert navn og hver dråbe ære.</p><div className="timeline-legend" aria-label="Slags begivenheter"><span><i className="legend-mark legend-mark-official" aria-hidden="true" />Offisielle Faxinger</span><span><i className="legend-mark legend-mark-unofficial" aria-hidden="true" />Andre Faxinger</span><span><i className="legend-mark legend-mark-ancient" aria-hidden="true" />Den første orden</span></div></div>{isAdmin && <button className="medieval-btn start-btn" onClick={onCreate}>+ Føy til gammel Faxing</button>}</div>
    {ordered.length === 0 ? <div className="scroll-panel timeline-empty-state"><h3>Krøniken er ennu tom</h3><p>Den første Faxing venter på å bli nedskrevet.</p></div> : <div className="chronology">{years.map(year => <section className="chronology-year" key={year}><div className="year-marker"><span>{year}</span></div><div className="chronology-events">{ordered.filter(event => yearOf(event.date) === year).map(event => <EventCard key={event.id} event={event} onOpen={onOpen} />)}</div></section>)}</div>}
  </div>
}

function EventCard({ event, onOpen }: { event: FaxingEvent; onOpen: (event: FaxingEvent) => void }) {
  // The nights of den første orden are drawn in older stone, so the run of Faxinger shows where
  // the order changed without a divider being drawn through it.
  const age = isOfTheFirstOrder(event.date) ? 'event-card-ancient' : ''
  return <button className={`event-card ${event.official ? 'event-card-official' : 'event-card-unofficial'} ${age}`} onClick={() => onOpen(event)}><span className="event-card-date">{formatDate(event.date)}</span><strong>{event.name}</strong><span className="event-card-meta">{event.contestants.length} deltagere</span></button>
}
