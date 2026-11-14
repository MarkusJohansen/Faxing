import { useState, type FormEvent } from 'react'
import type { Gender, RoomSnapshot } from '../types'
import type { ActionExtra, RoomAction } from '../lib/rooms'

interface Props {
  room: RoomSnapshot
  onAct: (action: RoomAction, extra?: ActionExtra) => Promise<boolean>
}

const GENDER_ICON: Record<Gender, string> = { male: '♂', female: '♀', other: '⚥' }

export default function RoomLobby({ room, onAct }: Props) {
  const [name, setName] = useState('')
  const [gender, setGender] = useState<Gender>('male')
  const { host, memberId } = room.you
  // A device joins itself once; after that the host's form enlists people without a phone.
  const action: RoomAction | null = !memberId ? 'join' : host ? 'add' : null
  const link = `${window.location.origin}/?rom=${room.code}`

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!action) return
    if (await onAct(action, { name: name.trim(), gender })) setName('')
  }

  return (
    <div className="registration-screen">
      <div className="scroll-panel">
        <p className="eyebrow">{room.official ? 'Offisiell Faxing' : 'Faxing'}</p>
        <h2 className="panel-title">⚜ {room.title} ⚜</h2>
        <div className="room-code-box">
          <span className="eyebrow">Rommets Kode</span>
          <strong className="room-code">{room.code}</strong>
          <button type="button" className="back-link" onClick={() => navigator.clipboard?.writeText(link).catch(() => undefined)}>Kopier lenken</button>
        </div>
        <p className="panel-desc">Hver Kriger innskriver seg selv fra sin egen innretning. Verten begynner kampen naar alle er samlet.</p>

        {action && <form className="enlist-form" onSubmit={submit}>
          <div className="form-row">
            <input className="medieval-input" type="text" placeholder={action === 'join' ? 'Eders Navn...' : 'En Kriger uten telefon...'} value={name} onChange={event => setName(event.target.value)} maxLength={30} />
            <div className="gender-toggle">
              <button type="button" className={`gender-btn ${gender === 'male' ? 'active' : ''}`} onClick={() => setGender('male')}>♂ Herre</button>
              <button type="button" className={`gender-btn ${gender === 'female' ? 'active' : ''}`} onClick={() => setGender('female')}>♀ Dame</button>
              <button type="button" className={`gender-btn ${gender === 'other' ? 'active' : ''}`} onClick={() => setGender('other')}>⚥ Annet</button>
            </div>
            <button type="submit" className="medieval-btn enlist-btn">{action === 'join' ? 'Tre inn' : '+ Innskriv'}</button>
          </div>
        </form>}
        {memberId && !host && <p className="admin-only-note">I er innskrevet. Vent paa at Verten begynner kampen.</p>}

        {room.members.length > 0 && <div className="contestant-list">
          <h3 className="list-title">Innskrevne Krigere ({room.members.length})</h3>
          <ul>{room.members.map(member => <li key={member.id} className="contestant-item">
            <span className="contestant-gender-icon">{GENDER_ICON[member.gender]}</span>
            <span className="contestant-name">{member.name}{member.id === memberId ? ' (Eder)' : ''}</span>
            {host && <button className="remove-btn" aria-label={`Stryk ${member.name}`} onClick={() => onAct('remove', { memberId: member.id })}>✕</button>}
          </li>)}</ul>
        </div>}

        {host
          ? <button className="medieval-btn start-btn" onClick={() => onAct('start')} disabled={room.members.length === 0}>Begynn kampen</button>
          : <p className="admin-only-note">Kun Verten kan begynne kampen.</p>}
      </div>
    </div>
  )
}
