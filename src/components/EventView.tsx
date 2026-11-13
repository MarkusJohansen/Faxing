import { useEffect, useState } from 'react'
import type { FaxingEvent, RankedContestant } from '../types'

interface Props {
  event: FaxingEvent
  isAdmin: boolean
  onBack?: () => void
  onSave: (event: FaxingEvent) => Promise<void>
  onDelete: (id: string) => Promise<void>
}

const formatTime = (ms: number) => `${Math.floor(ms / 60000)}:${String(Math.floor((ms % 60000) / 1000)).padStart(2, '0')}`
const formatDate = (date: number) => { const timestamp = Number(date); return Number.isFinite(timestamp) && Number.isFinite(new Date(timestamp).getTime()) ? new Intl.DateTimeFormat('da-DK', { day: 'numeric', month: 'long', year: 'numeric' }).format(timestamp) : 'Ukendt dato' }
const formatInputDate = (date: number) => { const timestamp = Number(date); return Number.isFinite(timestamp) && Number.isFinite(new Date(timestamp).getTime()) ? new Date(timestamp).toISOString().slice(0, 10) : '' }

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
    window.alert('Log ind som Faxepave for at redigere denne Faxing.')
  }

  const update = (id: string, patch: Partial<RankedContestant>) => {
    setDraft(value => ({ ...value, contestants: value.contestants.map(contestant => contestant.id === id ? { ...contestant, ...patch } : contestant) }))
    setSavedMessage('')
  }

  const addAttendee = async (eventForm: React.FormEvent) => {
    eventForm.preventDefault()
    const name = newName.trim()
    const minutes = Number(newMinutes)
    const seconds = Number(newSeconds || 0)
    if (!name) return setAddError('Skriv et navn.')
    if (!Number.isInteger(minutes) || minutes < 0) return setAddError('Indtast hele minutter på 0 eller derover.')
    if (!Number.isInteger(seconds) || seconds < 0 || seconds > 59) return setAddError('Sekunder skal være mellem 0 og 59.')

    const attendee: RankedContestant = {
      id: crypto.randomUUID(),
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
      setSavedMessage(`${name} er tilføjet og gemt.`)
    } catch {
      setAddError('Deltageren kunne ikke gemmes. Prøv igen.')
    } finally {
      setSaving(false)
    }
  }

  const save = async () => {
    setSaving(true)
    setSavedMessage('')
    try {
      await onSave(draft)
      setSavedMessage('Ændringerne er gemt i krøniken.')
    } catch {
      setSavedMessage('Ændringerne kunne ikke gemmes. Prøv igen.')
    } finally {
      setSaving(false)
    }
  }

  const sorted = [...draft.contestants].filter(Boolean).map(contestant => ({ elapsed: Number.isFinite(Number(contestant.elapsed)) ? Number(contestant.elapsed) : 0, finishedAt: contestant.finishedAt ?? null, disqualified: Boolean(contestant.disqualified), title: contestant.title ?? null, id: contestant.id, name: contestant.name || 'Ukendt deltager', gender: contestant.gender })).sort((a, b) => (a.finishedAt ? a.elapsed : Number.MAX_SAFE_INTEGER) - (b.finishedAt ? b.elapsed : Number.MAX_SAFE_INTEGER))

  return (
    <div className="event-view scroll-panel">
      <div className="event-view-heading">
        {!isEditing && <div className="event-admin-toolbar"><span className="admin-access-label">Faxepave</span><button className="medieval-btn edit-event-btn" type="button" onClick={openEditor}>Rediger Faxing</button></div>}
        {canEdit && <div className="admin-edit-notice"><span className="eyebrow">Faxepave-værktøj</span><strong>Redigering er aktiv</strong><span>Ændr eventet og tryk “Gem alle ændringer”.</span></div>}
        {canEdit ? (
          <div className="admin-edit-form">
            <label>Eventnavn<input className="medieval-input" value={draft.name} onChange={eventInput => setDraft({ ...draft, name: eventInput.target.value })} /></label>
            <label>Dato<input className="medieval-input" type="date" value={formatInputDate(draft.date)} onChange={eventInput => setDraft({ ...draft, date: new Date(`${eventInput.target.value}T12:00:00`).getTime() })} /></label>
            <label className="check-label"><input type="checkbox" checked={draft.official} onChange={eventInput => setDraft({ ...draft, official: eventInput.target.checked })} /> Officiel Faxing</label>
          </div>
        ) : (
          <>
            <p className="event-date">{formatDate(event.date)} · {event.official ? 'Officiel ordenstvist' : 'Uofficiel samling'}</p>
            <h2 className="panel-title">{event.name}</h2>
          </>
        )}
      </div>
      <p className="panel-desc">{draft.contestants.length} deltagere i denne dyst.</p>

      {canEdit && (
        <form className="admin-add-attendee" onSubmit={addAttendee}>
          <div className="admin-section-heading"><div><span className="eyebrow">Faxepave-værktøj</span><h3>Tilføj deltager</h3></div><span className="admin-section-hint">Gemmes direkte i krøniken</span></div>
          <div className="admin-add-fields">
            <label className="attendee-field attendee-name-field">Navn<input className="medieval-input" placeholder="Fx Anders Jensen" aria-label="Navn på ny deltager" value={newName} onChange={eventInput => setNewName(eventInput.target.value)} /></label>
            <label className="attendee-field">Køn<select className="medieval-input" aria-label="Køn på ny deltager" value={newGender} onChange={eventInput => setNewGender(eventInput.target.value as 'male' | 'female' | 'other')}><option value="male">Mand</option><option value="female">Kvinde</option><option value="other">⚥ Annet</option></select></label>
            <label className="attendee-field time-field">Minutter<input className="medieval-input" inputMode="numeric" placeholder="0" aria-label="Drikketid minutter" value={newMinutes} onChange={eventInput => setNewMinutes(eventInput.target.value)} /></label>
            <label className="attendee-field time-field">Sekunder<input className="medieval-input" inputMode="numeric" placeholder="00" aria-label="Drikketid sekunder" value={newSeconds} onChange={eventInput => setNewSeconds(eventInput.target.value)} /></label>
            <button className="medieval-btn attendee-add-btn" type="submit" disabled={saving}>Tilføj og gem</button>
          </div>
          <p className="attendee-help">Registrér den samlede drikketid. Sekunder skal være mellem 0 og 59.</p>
          {addError && <p className="form-error" role="alert">{addError}</p>}
        </form>
      )}

      <div className="result-toolbar"><span>Resultater</span><span className="result-count">{sorted.length} deltagere</span></div>
      <div className="results-table" role="table" aria-label={`Resultater for ${draft.name}`}><div className="results-table-head" role="row"><span>Plads</span><span>Deltager</span><span>Drikketid</span><span aria-label="Hæder" /></div>{sorted.map((contestant, index) => <ResultRow key={contestant.id} contestant={contestant} index={index} isAdmin={canEdit} onUpdate={update} />)}</div>
      {canEdit && <div className="admin-actions"><button className="medieval-btn" onClick={save} disabled={saving}>{saving ? 'Gemmer…' : 'Gem alle ændringer'}</button><button className="medieval-btn" type="button" onClick={() => { setIsEditing(false); setDraft({ ...event, contestants: Array.isArray(event.contestants) ? event.contestants : [] }) }}>Annuller</button>{savedMessage && <span className="save-message" role="status">{savedMessage}</span>}<button className="medieval-btn danger-btn" type="button" onClick={() => { if (window.confirm('Er du sikker? Faxingen og alle dens deltagere slettes permanent.')) onDelete(draft.id) }}>Slet Faxing</button></div>}
    </div>
  )
}

function ResultRow({ contestant: c, index, isAdmin, onUpdate }: { contestant: RankedContestant; index: number; isAdmin: boolean; onUpdate: (id: string, patch: Partial<RankedContestant>) => void }) {
  return <div className={`result-row ${c.title === 'Faxekonge' || c.title === 'Faxedronning' ? 'royal-result' : ''}`} role="row"><span className="result-rank" role="cell">{index + 1}</span><span className="result-person" role="cell">{isAdmin ? <input aria-label={`Navn på deltager ${index + 1}`} className="medieval-input admin-name-input" value={c.name} onChange={event => onUpdate(c.id, { name: event.target.value })} /> : <span className="result-name">{c.name}</span>}{isAdmin && <select aria-label={`Status for ${c.name}`} className="medieval-input admin-status" value={c.disqualified ? 'out' : c.finishedAt ? 'done' : 'active'} onChange={event => onUpdate(c.id, event.target.value === 'out' ? { disqualified: true, finishedAt: null } : event.target.value === 'done' ? { disqualified: false, finishedAt: c.finishedAt ?? Date.now() } : { disqualified: false, finishedAt: null })}><option value="done">Færdig</option><option value="active">Ikke færdig</option><option value="out">Hestemann</option></select>}</span><strong role="cell" className={c.title === 'Hestemann' || c.disqualified ? 'result-time result-shame' : 'result-time'}>{c.title === 'Hestemann' || c.disqualified ? 'Hestemann' : formatTime(c.elapsed)}</strong><span role="cell" className="result-title">{c.title === 'Faxekonge' || c.title === 'Faxedronning' ? <span className="royal-crown" aria-label={c.title} title={c.title}>♛</span> : '—'}</span></div>
}
