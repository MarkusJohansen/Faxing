import { useState, type FormEvent } from 'react'
import type { Contestant, Gender } from '../types'

interface RegistrationProps {
  contestants: Contestant[]
  onAdd: (name: string, gender: Gender) => void
  onRemove: (id: string) => void
  onStart: (name: string, official: boolean, password?: string) => void
  isAdmin: boolean
}

export default function Registration({ contestants, onAdd, onRemove, onStart, isAdmin }: RegistrationProps) {
  const [name, setName] = useState('')
  const [gender, setGender] = useState<Gender>('male')
  const [eventName, setEventName] = useState('')
  const [official, setOfficial] = useState(false)
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')

  const handleAdd = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const trimmed = name.trim()
    if (!trimmed) return setError('Et Navn er fornødent, tappre Sjæl.')
    if (contestants.some((contestant) => contestant.name.toLowerCase() === trimmed.toLowerCase())) {
      return setError('Denne Kriger hath allerede indtaget Arenaen.')
    }
    onAdd(trimmed, gender)
    setName('')
    setError('')
  }

  const handleStart = () => {
    const title = eventName.trim() || (official ? 'Officiel Faxing' : 'Faxing')
    if (official && password.trim().length < 4) {
      setError('Officielle Faxinger kræver et password på mindst 4 tegn.')
      return
    }
    onStart(title, official, password.trim())
  }

  return (
    <div className="registration-screen">
      <div className="scroll-panel">
        <h2 className="panel-title">⚜ Innskriv Eders Krigere ⚜</h2>
        <p className="panel-desc">Hver Kriger maa fortære een Litre Faxe (10% Styrke) inden Timens Udløb. De som lykkes, hædres med Titelen <em>Faxeridder</em>. Den første Herre erholder Titelen <strong>Faxekonge</strong>, og den første Dame — <strong>Faxedronning</strong>.</p>
        <form className="enlist-form" onSubmit={handleAdd}>
          <div className="form-row">
            <input className="medieval-input" type="text" placeholder="Krigerens Navn..." value={name} onChange={(event) => { setName(event.target.value); setError('') }} maxLength={30} />
            <div className="gender-toggle">
              <button type="button" className={`gender-btn ${gender === 'male' ? 'active' : ''}`} onClick={() => setGender('male')}>♂ Herre</button>
              <button type="button" className={`gender-btn ${gender === 'female' ? 'active' : ''}`} onClick={() => setGender('female')}>♀ Dame</button>
              <button type="button" className={`gender-btn ${gender === 'other' ? 'active' : ''}`} onClick={() => setGender('other')}>⚥ Annet</button>
            </div>
            <button type="submit" className="medieval-btn enlist-btn">+ Innskriv</button>
          </div>
          {error && <p className="form-error">{error}</p>}
        </form>
        {contestants.length > 0 && <div className="contestant-list"><h3 className="list-title">Innskrevne Krigere ({contestants.length})</h3><ul>{contestants.map((contestant) => <li key={contestant.id} className="contestant-item"><span className="contestant-gender-icon">{contestant.gender === 'male' ? '♂' : contestant.gender === 'female' ? '♀' : '⚥'}</span><span className="contestant-name">{contestant.name}</span><button className="remove-btn" onClick={() => onRemove(contestant.id)}>✕</button></li>)}</ul></div>}
        <div className="event-setup">
          <input className="medieval-input" placeholder="Begivenhedens navn..." value={eventName} onChange={(event) => setEventName(event.target.value)} />
          {isAdmin ? <label className="official-toggle"><input type="checkbox" checked={official} onChange={(event) => setOfficial(event.target.checked)} /> Officiel Faxing</label> : <p className="admin-only-note">Kun Faxepaven kan oprette en officiel Faxing.</p>}
          {isAdmin && official && <input className="medieval-input" type="password" placeholder="Password til officiel Faxing" value={password} onChange={(event) => setPassword(event.target.value)} />}
          <button className="medieval-btn start-btn" onClick={handleStart} disabled={contestants.length === 0}>Begynd kampen</button>
        </div>
      </div>
    </div>
  )
}
