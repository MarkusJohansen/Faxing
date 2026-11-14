import { useState, type FormEvent } from 'react'
import type { RankedContestant, Title } from '../types'
import type { ActionExtra, RoomAction } from '../lib/rooms'

interface TitleMeta { icon: string; color: 'gold' | 'rose' | 'silver' | 'grey'; label: string }
const TITLE_META: Record<Title, TitleMeta> = { Faxekonge: { icon: 'K', color: 'gold', label: 'Faxekonge' }, Faxedronning: { icon: 'D', color: 'rose', label: 'Faxedronning' }, Faxemonark: { icon: 'M', color: 'gold', label: 'Faxemonark' }, Faxeridder: { icon: 'R', color: 'silver', label: 'Faxeridder' }, Hestemann: { icon: 'H', color: 'grey', label: 'Hestemann' } }
const formatElapsed = (ms: number | null | undefined) => { if (ms == null || ms < 0) return '--:--'; const s = Math.floor(ms / 1000); return `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}` }
// Past four-fifths of the hour the candle on a card turns urgent, as the board's spec asks.
const URGENT_FROM_PCT = 80
const SECOND = 1000
const MINUTE = 60 * SECOND
const TIME_PATTERN = /^(\d{1,2}):([0-5]\d)$/

interface Props {
  contestant: RankedContestant
  rank: number | null
  elapsedMs: number
  durationMs: number
  /** This card is the viewing device's own participant. */
  isOwn: boolean
  isHost: boolean
  onAct: (action: RoomAction, extra?: ActionExtra) => Promise<boolean>
}

export default function ContestantCard({ contestant, rank, elapsedMs, durationMs, isOwn, isHost, onAct }: Props) {
  const { id, name, gender, finishedAt, disqualified, title, elapsed } = contestant
  const [editing, setEditing] = useState(false)
  const [time, setTime] = useState('')
  const [timeError, setTimeError] = useState('')
  const meta = title ? TITLE_META[title] : null
  const contestOver = elapsedMs >= durationMs
  const isActive = !finishedAt && !disqualified && title === null
  const pct = Math.min((elapsedMs / durationMs) * 100, 100)
  const target = { memberId: id }

  // Clearing a recorded finish destroys the only evidence behind a crown, so the host is
  // asked first. The participant's own taps stay unconfirmed: the host can undo those.
  const confirmLoss = () => finishedAt === null || window.confirm(`${name} haver en fullbragt tid. Skal den slettes?`)
  const submitTime = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const match = TIME_PATTERN.exec(time.trim())
    const elapsedMs = match ? Number(match[1]) * MINUTE + Number(match[2]) * SECOND : NaN
    if (!(elapsedMs >= 0 && elapsedMs < durationMs)) return setTimeError('Skriv tiden som mm:ss, innen Timen.')
    if (await onAct('set-time', { ...target, elapsedMs })) { setEditing(false); setTime(''); setTimeError('') }
  }

  return <div className={`contestant-card ${meta ? `card-${meta.color}` : 'card-active'} ${disqualified ? 'card-disqualified' : ''} ${isOwn ? 'card-own' : ''}`}>
    {rank != null && <div className="card-rank">#{rank}</div>}
    <div className="card-top"><span className="card-gender">{gender === 'male' ? 'M' : gender === 'female' ? 'F' : '⚥'}</span><span className="card-name">{name}{isOwn ? ' (Eder)' : ''}</span></div>
    {meta && <div className={`card-title title-${meta.color}`}>{meta.icon} {meta.label}</div>}
    {finishedAt && <div className="card-time">Fullbragt på <strong>{formatElapsed(elapsed)}</strong></div>}
    {isActive && <div className="candle-wrap"><div className="candle-track"><div className={pct >= URGENT_FROM_PCT ? 'candle-wax candle-urgent' : 'candle-wax'} style={{ width: `${100 - pct}%` }} /></div><span className="candle-pct">{Math.floor(pct)}%</span></div>}
    {disqualified && <div className="card-time shame-text">Fullbragte det ei</div>}

    {isOwn && !isHost && isActive && !contestOver && <div className="card-actions">
      <button className="medieval-btn finish-btn" onClick={() => onAct('finish')}>Fullbragt!</button>
      <button className="medieval-btn dnf-btn" onClick={() => onAct('forfeit')}>Gav Opp</button>
    </div>}
    {isOwn && !isHost && !isActive && !contestOver && <p className="admin-only-note">Feiltrykk? Be Verten sette Eder i gang igjen.</p>}

    {isHost && <div className="card-actions">
      {isActive && !contestOver && <button className="medieval-btn finish-btn" onClick={() => onAct('set-finished', target)}>Fullbragt nu</button>}
      {(finishedAt !== null || disqualified) && <button className="medieval-btn undo-finish-btn" onClick={() => confirmLoss() && onAct('reset', target)}>Sett i gang igjen</button>}
      {!disqualified && <button className="medieval-btn dnf-btn" onClick={() => confirmLoss() && onAct('disqualify', target)}>Merk som Hestemann</button>}
      <button className="medieval-btn" onClick={() => setEditing(value => !value)}>Rett tid</button>
    </div>}
    {isHost && editing && <form className="card-time-form" onSubmit={submitTime}>
      <input className="medieval-input" inputMode="numeric" placeholder="mm:ss" aria-label={`Fullbragt tid for ${name}`} value={time} onChange={event => { setTime(event.target.value); setTimeError('') }} autoFocus />
      <button className="medieval-btn" type="submit">Lagre</button>
      {timeError && <p className="form-error">{timeError}</p>}
    </form>}
  </div>
}
