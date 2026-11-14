import { useEffect, useState, type FormEvent } from 'react'
import type { RoomSummary } from '../types'
import { listRooms } from '../lib/rooms'

interface Props {
  isAdmin: boolean
  onOpen: (code: string) => void
  onCreate: (title: string, official: boolean) => Promise<void>
}

const ROOM_CODE_LENGTH = 4

/** Ongoing rooms, joining by code, and raising a new room. */
export default function RoomsPanel({ isAdmin, onOpen, onCreate }: Props) {
  const [rooms, setRooms] = useState<RoomSummary[]>([])
  const [code, setCode] = useState('')
  const [title, setTitle] = useState('')
  const [official, setOfficial] = useState(false)
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  // A failed listing leaves the list empty; joining by code and raising a room still work.
  useEffect(() => { listRooms().then(list => setRooms(Array.isArray(list) ? list : [])).catch(() => setRooms([])) }, [])

  const join = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const trimmed = code.trim().toUpperCase()
    if (trimmed.length !== ROOM_CODE_LENGTH) return setError(`En Kode haver ${ROOM_CODE_LENGTH} tegn.`)
    onOpen(trimmed)
  }
  const create = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setBusy(true)
    try { await onCreate(title.trim(), official && isAdmin) } catch (reason) { setError((reason as Error).message) } finally { setBusy(false) }
  }

  return <div className="rooms-panel">
    {rooms.length > 0 && <div className="contestant-list">
      <h3 className="list-title">Faxinger i gang nu</h3>
      <ul>{rooms.map(room => <li key={room.code} className="contestant-item">
        <span className="contestant-gender-icon">{room.official ? '⚜' : '·'}</span>
        <span className="contestant-name">{room.title} · {room.memberCount} innskrevne · {room.startedAt ? 'kampen pågaar' : 'samles ennu'}</span>
        <button className="medieval-btn" onClick={() => onOpen(room.code)}>{room.startedAt ? 'Se' : 'Tre inn'}</button>
      </li>)}</ul>
    </div>}

    <form className="enlist-form" onSubmit={join}>
      <div className="form-row">
        <input className="medieval-input room-code-input" placeholder="Rommets Kode..." value={code} onChange={event => { setCode(event.target.value); setError('') }} maxLength={ROOM_CODE_LENGTH} autoCapitalize="characters" />
        <button type="submit" className="medieval-btn enlist-btn">Tre inn</button>
      </div>
    </form>

    <form className="event-setup" onSubmit={create}>
      <input className="medieval-input" placeholder="Begivenhetens navn..." value={title} onChange={event => setTitle(event.target.value)} maxLength={80} />
      {isAdmin ? <label className="official-toggle"><input type="checkbox" checked={official} onChange={event => setOfficial(event.target.checked)} /> Offisiell Faxing</label> : <p className="admin-only-note">Kun Faxepaven kan reise en offisiell Faxing.</p>}
      <button className="medieval-btn start-btn" type="submit" disabled={busy}>Reis et nytt Rom</button>
    </form>
    {error && <p className="form-error">{error}</p>}
  </div>
}
