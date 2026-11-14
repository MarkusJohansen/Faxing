import { useEffect, useState } from 'react'
import type { ArchivedContestant, FaxingEvent, RecordedTitle } from '../types'
import { newId } from '../lib/id'

interface Props {
  event: FaxingEvent
  isAdmin: boolean
  onBack?: () => void
  onSave: (event: FaxingEvent) => Promise<void>
  onDelete: (id: string) => Promise<void>
}

const formatTime = (ms: number) => `${Math.floor(ms / 60000)}:${String(Math.floor((ms % 60000) / 1000)).padStart(2, '0')}`
const formatDate = (date: number) => { const timestamp = Number(date); return Number.isFinite(timestamp) && Number.isFinite(new Date(timestamp).getTime()) ? new Intl.DateTimeFormat('nb-NO', { day: 'numeric', month: 'long', year: 'numeric' }).format(timestamp) : 'Ukjent dato' }
const formatInputDate = (date: number) => { const timestamp = Number(date); return Number.isFinite(timestamp) && Number.isFinite(new Date(timestamp).getTime()) ? new Date(timestamp).toISOString().slice(0, 10) : '' }
const UNKNOWN_TIME = 'Tid ukjent'
/** A duration the record states, or the honest word for one it does not. */
const formatDuration = (ms: number | null) => ms === null ? UNKNOWN_TIME : formatTime(ms)
/** The titles only the old records use: there is no crown to draw, so the row names them. */
const isLegacyTitle = (title: RecordedTitle | null): title is 'Erkekonge' | 'Kronprins' | 'Prins' => title === 'Erkekonge' || title === 'Kronprins' || title === 'Prins'
/** A recorded time or a title is evidence enough to count as finished, even with no instant. */
const hasFinished = (contestant: ArchivedContestant) => !contestant.disqualified && (contestant.finishedAt !== null || contestant.elapsed !== null || contestant.title !== null)

export default function EventView({ event, isAdmin, onSave, onDelete }: Props) {
  const [draft, setDraft] = useState(() => ({ ...event, contestants: Array.isArray(event.contestants) ? event.contestants : [] }))
  const [saving, setSaving] = useState(false)
  useEffect(() => { setDraft({ ...event, contestants: Array.isArray(event.contestants) ? event.contestants : [] }) }, [event])
  const [newName, setNewName] = useState('')
  const [newGender, setNewGender] = useState<'male' | 'female' | 'other'>('male')
  const [newMinutes, setNewMinutes] = useState('')
  const [newSeconds, setNewSeconds] = useState('')
  const [addError, setAddError] = useState('')
  const [savedMessage, setSavedMessage] = useState('')
  const [isEditing, setIsEditing] = useState(false)
  const [adminVerified, setAdminVerified] = useState(isAdmin)
  const canEdit = adminVerified && isEditing
  useEffect(() => { setAdminVerified(isAdmin) }, [isAdmin])
  const openEditor = async () => {
    if (adminVerified) { setIsEditing(true); return }
    try {
      const response = await fetch('/api/admin')
      const result = await response.json() as { authenticated?: boolean }
      if (result.authenticated) { setAdminVerified(true); setIsEditing(true); return }
    } catch {
      // Fall through to the login guidance below.
    }
    window.alert('Logg inn som Faxepave for å rette i denne Faxing.')
  }

  const update = (id: string, patch: Partial<ArchivedContestant>) => {
    setDraft(value => ({ ...value, contestants: value.contestants.map(contestant => contestant.id === id ? { ...contestant, ...patch } : contestant) }))
    setSavedMessage('')
  }

  const addAttendee = async (eventForm: React.FormEvent) => {
    eventForm.preventDefault()
    const name = newName.trim()
    const minutes = Number(newMinutes)
    const seconds = Number(newSeconds || 0)
    if (!name) return setAddError('Skriv et navn.')
    if (!Number.isInteger(minutes) || minutes < 0) return setAddError('Skriv hele minutter, 0 eller mer.')
    if (!Number.isInteger(seconds) || seconds < 0 || seconds > 59) return setAddError('Sekunder skal være mellom 0 og 59.')

    const attendee: ArchivedContestant = {
      id: newId(),
      name,
      gender: newGender,
      finishedAt: draft.date,
      disqualified: false,
      title: null,
      elapsed: (minutes * 60 + seconds) * 1000,
    }
    const nextDraft = { ...draft, contestants: [...draft.contestants, attendee] }
    setDraft(nextDraft)
    setAddError('')
    setSaving(true)
    try {
      await onSave(nextDraft)
      setNewName('')
      setNewMinutes('')
      setNewSeconds('')
      setSavedMessage(`${name} er føyet til og lagret.`)
    } catch {
      setAddError('Deltageren lot seg ikke lagre. Prøv påny.')
    } finally {
      setSaving(false)
    }
  }

  const save = async () => {
    setSaving(true)
    setSavedMessage('')
    try {
      await onSave(draft)
      setSavedMessage('Endringene er skrevet i krøniken.')
    } catch {
      setSavedMessage('Endringene lot seg ikke lagre. Prøv påny.')
    } finally {
      setSaving(false)
    }
  }

  // A recorded duration is shown, never re-derived. When a record omits one (William, the first
  // Kronprins), the order it was written in stands: sorting by a time one row does not have
  // would invent a place for it.
  const recorded = [...draft.contestants].filter(Boolean).map(contestant => ({ elapsed: contestant.elapsed !== null && Number.isFinite(Number(contestant.elapsed)) ? Number(contestant.elapsed) : null, finishedAt: contestant.finishedAt ?? null, disqualified: Boolean(contestant.disqualified), title: contestant.title ?? null, id: contestant.id, name: contestant.name || 'Ukjent deltager', gender: contestant.gender }))
  const sorted = recorded.some(contestant => contestant.elapsed === null) ? recorded : [...recorded].sort((a, b) => (a.elapsed ?? 0) - (b.elapsed ?? 0))

  return (
    <div className="event-view scroll-panel">
      <div className="event-view-heading">
        {!isEditing && <div className="event-admin-toolbar"><span className="admin-access-label">Faxepave</span><button className="medieval-btn edit-event-btn" type="button" onClick={openEditor}>Rett i Faxing</button></div>}
        {canEdit && <div className="admin-edit-notice"><span className="eyebrow">Faxepavens verktøy</span><strong>Retting er i gang</strong><span>Rett begivenheten og trykk «Lagre alle endringer».</span></div>}
        {canEdit ? (
          <div className="admin-edit-form">
            <label>Begivenhetens navn<input className="medieval-input" value={draft.name} onChange={eventInput => setDraft({ ...draft, name: eventInput.target.value })} /></label>
            <label>Dato<input className="medieval-input" type="date" value={formatInputDate(draft.date)} onChange={eventInput => setDraft({ ...draft, date: new Date(`${eventInput.target.value}T12:00:00`).getTime() })} /></label>
            <label className="check-label"><input type="checkbox" checked={draft.official} onChange={eventInput => setDraft({ ...draft, official: eventInput.target.checked })} /> Offisiell Faxing</label>
          </div>
        ) : (
          <>
            <p className="event-date">{formatDate(event.date)} · {event.official ? 'Offisiell ordensdyst' : 'Uoffisiell samling'}</p>
            <h2 className="panel-title">{event.name}</h2>
          </>
        )}
      </div>
      <p className="panel-desc">{draft.contestants.length} deltagere i denne dyst.</p>

      {canEdit && (
        <form className="admin-add-attendee" onSubmit={addAttendee}>
          <div className="admin-section-heading"><div><span className="eyebrow">Faxepavens verktøy</span><h3>Føy til deltager</h3></div><span className="admin-section-hint">Skrives straks i krøniken</span></div>
          <div className="admin-add-fields">
            <label className="attendee-field attendee-name-field">Navn<input className="medieval-input" placeholder="F.eks. Anders Jensen" aria-label="Navn på ny deltager" value={newName} onChange={eventInput => setNewName(eventInput.target.value)} /></label>
            <label className="attendee-field">Kjønn<select className="medieval-input" aria-label="Kjønn på ny deltager" value={newGender} onChange={eventInput => setNewGender(eventInput.target.value as 'male' | 'female' | 'other')}><option value="male">Herre</option><option value="female">Dame</option><option value="other">⚥ Annet</option></select></label>
            <label className="attendee-field time-field">Minutter<input className="medieval-input" inputMode="numeric" placeholder="0" aria-label="Drikketid minutter" value={newMinutes} onChange={eventInput => setNewMinutes(eventInput.target.value)} /></label>
            <label className="attendee-field time-field">Sekunder<input className="medieval-input" inputMode="numeric" placeholder="00" aria-label="Drikketid sekunder" value={newSeconds} onChange={eventInput => setNewSeconds(eventInput.target.value)} /></label>
            <button className="medieval-btn attendee-add-btn" type="submit" disabled={saving}>Føy til og lagre</button>
          </div>
          <p className="attendee-help">Skriv inn den samlede drikketid. Sekunder skal være mellom 0 og 59.</p>
          {addError && <p className="form-error" role="alert">{addError}</p>}
        </form>
      )}

      <div className="result-toolbar"><span>Resultater</span><span className="result-count">{sorted.length} deltagere</span></div>
      <div className="results-table" role="table" aria-label={`Resultater for ${draft.name}`}><div className="results-table-head" role="row"><span>Plass</span><span>Deltager</span><span>Drikketid</span><span aria-label="Heder" /></div>{sorted.map((contestant, index) => <ResultRow key={contestant.id} contestant={contestant} index={index} isAdmin={canEdit} onUpdate={update} />)}</div>
      {canEdit && <div className="admin-actions"><button className="medieval-btn" onClick={save} disabled={saving}>{saving ? 'Lagrer…' : 'Lagre alle endringer'}</button><button className="medieval-btn" type="button" onClick={() => { setIsEditing(false); setDraft({ ...event, contestants: Array.isArray(event.contestants) ? event.contestants : [] }) }}>Avbryt</button>{savedMessage && <span className="save-message" role="status">{savedMessage}</span>}<button className="medieval-btn danger-btn" type="button" onClick={() => { if (window.confirm('Er I visse? Faxingen og alle dens deltagere slettes for alltid.')) onDelete(draft.id) }}>Slett Faxing</button></div>}
    </div>
  )
}

function ResultRow({ contestant: c, index, isAdmin, onUpdate }: { contestant: ArchivedContestant; index: number; isAdmin: boolean; onUpdate: (id: string, patch: Partial<ArchivedContestant>) => void }) {
  return <div className={`result-row ${c.title === 'Faxekonge' || c.title === 'Faxedronning' ? 'royal-result' : ''}`} role="row"><span className="result-rank" role="cell">{index + 1}</span><span className="result-person" role="cell">{isAdmin ? <input aria-label={`Navn på deltager ${index + 1}`} className="medieval-input admin-name-input" value={c.name} onChange={event => onUpdate(c.id, { name: event.target.value })} /> : <span className="result-name">{c.name}</span>}{isLegacyTitle(c.title) && <span className="result-recorded-title">{c.title}</span>}{isAdmin && <select aria-label={`Status for ${c.name}`} className="medieval-input admin-status" value={c.disqualified ? 'out' : hasFinished(c) ? 'done' : 'active'} onChange={event => onUpdate(c.id, event.target.value === 'out' ? { disqualified: true, finishedAt: null } : event.target.value === 'done' ? { disqualified: false, finishedAt: c.finishedAt ?? Date.now() } : { disqualified: false, finishedAt: null })}><option value="done">Fullbragt</option><option value="active">Ikke fullbragt</option><option value="out">Hestemann</option></select>}</span><strong role="cell" className={c.title === 'Hestemann' || c.disqualified ? 'result-time result-shame' : 'result-time'}>{c.title === 'Hestemann' || c.disqualified ? 'Hestemann' : formatDuration(c.elapsed)}</strong><span role="cell" className="result-title">{c.title === 'Faxekonge' || c.title === 'Faxedronning' ? <span className="royal-crown" aria-label={c.title} title={c.title}>♛</span> : '—'}</span></div>
}
