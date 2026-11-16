import { useState } from 'react'
import type { FaxingEvent } from '../types'
import { formatDate } from '../lib/format'

interface Props {
  /** The Faxepave's queue: every Faxing waiting for a decision, and every one refused. */
  awaiting: FaxingEvent[]
  onDecide: (id: string, status: 'published' | 'denied') => Promise<void>
  onOpen: (event: FaxingEvent) => void
  onDelete: (id: string) => Promise<void>
  onFile: (name: string, date: string, official: boolean) => Promise<void>
}

/** Today, for the date field: the commonest old Faxing is one from earlier this evening. */
const today = () => new Date().toISOString().slice(0, 10)
const countLabel = (count: number) => count === 0 ? 'Ingen venter' : count === 1 ? '1 venter' : `${count} venter`

/**
 * The Faxepave's own screen. A closed room files its Faxing here instead of straight into the
 * chronicle, so this is where the archive is curated: one press to admit a Faxing, one to refuse
 * it (the row is kept, so a stray press is undone by "Ta inn likevel"), and one form for the old
 * Faxinger that were never in a room at all.
 */
export default function FaxepaveLoft({ awaiting, onDecide, onOpen, onDelete, onFile }: Props) {
  const pending = awaiting.filter(event => event.status === 'pending')
  const denied = awaiting.filter(event => event.status === 'denied')
  const [busyId, setBusyId] = useState<string | null>(null)
  const [error, setError] = useState('')
  const [name, setName] = useState('')
  const [date, setDate] = useState(today)
  const [official, setOfficial] = useState(true)
  const [filing, setFiling] = useState(false)

  const decide = async (event: FaxingEvent, status: 'published' | 'denied') => {
    setBusyId(event.id)
    setError('')
    try { await onDecide(event.id, status) } catch { setError('Avgjørelsen lot seg ikke føre. Prøv påny.') } finally { setBusyId(null) }
  }

  // Deleting is the one action here that cannot be undone, so it is the one that asks first.
  const remove = async (event: FaxingEvent) => {
    if (!window.confirm(`Er I visse? «${event.name}» og alle dens deltagere slettes for alltid.`)) return
    setBusyId(event.id)
    setError('')
    try { await onDelete(event.id) } catch { setError('Slettingen lot seg ikke føre. Prøv påny.') } finally { setBusyId(null) }
  }

  const file = async (form: React.FormEvent) => {
    form.preventDefault()
    if (!name.trim()) return setError('Faxingen trenger et navn.')
    if (!date) return setError('Faxingen trenger en dato.')
    setFiling(true)
    setError('')
    try { await onFile(name.trim(), date, official) } catch { setError('Innføringen lot seg ikke gjøre. Prøv påny.') } finally { setFiling(false) }
  }

  return <div className="loft-screen">
    <div className="history-heading loft-heading">
      <div>
        <p className="eyebrow">Faxe Ordenens vaktkammer</p>
        <h2 className="panel-title">Faxepavens loft</h2>
        <p className="panel-desc">Hver Faxing som stenges, kommer hit først. Ingen kommer i krøniken uten et ord fra deg.</p>
      </div>
      <span className={pending.length > 0 ? 'loft-badge loft-badge-waiting' : 'loft-badge'} aria-live="polite">{countLabel(pending.length)}</span>
    </div>

    <section className="scroll-panel loft-section" aria-labelledby="loft-pending">
      <div className="admin-section-heading">
        <div><span className="eyebrow">Til avgjørelse</span><h3 id="loft-pending">Venter på ditt ord</h3></div>
        <span className="admin-section-hint">Stengte Rom</span>
      </div>
      {pending.length === 0
        ? <p className="loft-empty">Ingen Faxinger venter. Når et Rom stenges, havner Faxingen her.</p>
        : <ul className="loft-list">{pending.map(event => <li className="loft-row" key={event.id}>
            <div className="loft-row-main">
              <strong>{event.name}</strong>
              <span className="loft-meta">{formatDate(event.date)} · {event.official ? 'Offisiell' : 'Uoffisiell'} · {event.contestants.length} deltagere</span>
            </div>
            <div className="loft-actions">
              <button className="medieval-btn" type="button" onClick={() => onOpen(event)}>Åpne</button>
              <button className="medieval-btn" type="button" onClick={() => decide(event, 'published')} disabled={busyId === event.id}>Ta inn i krøniken</button>
              <button className="medieval-btn danger-btn" type="button" aria-label={`Avvis ${event.name}`} onClick={() => decide(event, 'denied')} disabled={busyId === event.id}>Avvis</button>
            </div>
          </li>)}</ul>}
    </section>

    {denied.length > 0 && <section className="scroll-panel loft-section" aria-labelledby="loft-denied">
      <div className="admin-section-heading">
        <div><span className="eyebrow">Utenfor krøniken</span><h3 id="loft-denied">Avviste Faxinger</h3></div>
        <span className="admin-section-hint">Ikke slettet, bare holdt utenfor</span>
      </div>
      <ul className="loft-list">{denied.map(event => <li className="loft-row loft-row-denied" key={event.id}>
        <div className="loft-row-main">
          <strong>{event.name}</strong>
          <span className="loft-meta">{formatDate(event.date)} · {event.official ? 'Offisiell' : 'Uoffisiell'} · {event.contestants.length} deltagere</span>
        </div>
        <div className="loft-actions">
          <button className="medieval-btn" type="button" onClick={() => onOpen(event)}>Åpne</button>
          <button className="medieval-btn" type="button" onClick={() => decide(event, 'published')} disabled={busyId === event.id}>Ta inn likevel</button>
          <button className="medieval-btn danger-btn" type="button" aria-label={`Slett ${event.name}`} onClick={() => remove(event)} disabled={busyId === event.id}>Slett</button>
        </div>
      </li>)}</ul>
    </section>}

    <section className="scroll-panel loft-section" aria-labelledby="loft-file">
      <div className="admin-section-heading">
        <div><span className="eyebrow">Gammelt stoff</span><h3 id="loft-file">Før inn en gammel Faxing</h3></div>
        <span className="admin-section-hint">Skrives straks i krøniken</span>
      </div>
      <form className="loft-file-form" onSubmit={file}>
        <label className="attendee-field">Navn på Faxingen<input className="medieval-input" placeholder="F.eks. Hagefesten" value={name} onChange={event => setName(event.target.value)} /></label>
        <label className="attendee-field">Dato<input className="medieval-input" type="date" value={date} onChange={event => setDate(event.target.value)} /></label>
        <label className="check-label"><input type="checkbox" checked={official} onChange={event => setOfficial(event.target.checked)} /> Offisiell Faxing</label>
        <button className="medieval-btn" type="submit" disabled={filing}>{filing ? 'Fører inn…' : 'Før inn i krøniken'}</button>
      </form>
      <p className="attendee-help">Deltagerne legger du til på Faxingens egen side etterpå.</p>
      {error && <p className="form-error" role="alert">{error}</p>}
    </section>
  </div>
}
