import { useState, useMemo } from 'react'
import ContestantCard from './ContestantCard'
import GlobalTimer from './GlobalTimer'
import type { RankedContestant, RoomRole } from '../types'
import type { ActionExtra, RoomAction } from '../lib/rooms'

interface Props { title: string; code: string; rankedContestants: RankedContestant[]; contestStartTime: number; now: number; durationMs: number; you: RoomRole; onAct: (action: RoomAction, extra?: ActionExtra) => Promise<boolean> }

export default function Arena({ title, code, rankedContestants, contestStartTime, now, durationMs, you, onAct }: Props) {
  const [showCloseConfirm, setShowCloseConfirm] = useState(false)
  const [search, setSearch] = useState('')
  const elapsedMs = now - contestStartTime
  const contestOver = elapsedMs >= durationMs
  const filtered = useMemo(() => { const q = search.trim().toLowerCase(); return q ? rankedContestants.filter(c => c.name.toLowerCase().includes(q)) : rankedContestants }, [rankedContestants, search])
  // Groups follow the derived title, so the board can never disagree with the rules: a
  // late finish is a Hestemann and sits with them, not in the hall.
  const inHall = (c: RankedContestant) => c.title !== null && c.title !== 'Hestemann'
  // Ranks come from the whole roster, never the filtered view: under a search, second
  // place must still read #2, not renumber to #1.
  const ranks = useMemo(() => new Map(rankedContestants.filter(inHall).map((c, index) => [c.id, index + 1])), [rankedContestants])
  const finished = filtered.filter(inHall)
  const active = filtered.filter(c => c.title === null)
  const failed = filtered.filter(c => c.title === 'Hestemann')
  const card = (c: RankedContestant, rank: number | null) => <ContestantCard key={c.id} contestant={c} rank={rank} elapsedMs={elapsedMs} durationMs={durationMs} isOwn={c.id === you.memberId} isHost={you.host} onAct={onAct} />

  return <div className="arena-screen">
    <p className="eyebrow room-heading">{title} · Kode <strong>{code}</strong></p>
    <GlobalTimer elapsedMs={elapsedMs} durationMs={durationMs} contestOver={contestOver} />
    {rankedContestants.length >= 5 && <div className="search-bar-wrap"><div className="search-bar"><span className="search-icon">Søk</span><input className="search-input" placeholder="Søk efter en Kriger..." value={search} onChange={e => setSearch(e.target.value)} /></div></div>}
    {finished.length > 0 && <section className="arena-section hall"><h2 className="section-title glory">Ærens Hal</h2><div className="cards-grid">{finished.map(c => card(c, ranks.get(c.id) ?? null))}</div></section>}
    {active.length > 0 && <section className="arena-section drinking"><h2 className="section-title active-title">Drikker Ennu</h2><div className="cards-grid">{active.map(c => card(c, null))}</div></section>}
    {failed.length > 0 && <section className="arena-section fallen"><h2 className="section-title shame">Hestemann</h2><div className="cards-grid">{failed.map(c => card(c, null))}</div></section>}
    {you.host && <div className="arena-footer">{!showCloseConfirm
      ? <button className="medieval-btn reset-btn" onClick={() => setShowCloseConfirm(true)}>Avslutt og lagre Faxing</button>
      : <div className="confirm-reset"><p>Er I visse? Rommet stenges og utfallet skrives i krøniken.</p><div className="confirm-btns"><button className="medieval-btn danger-btn" onClick={() => onAct('close')}>Ja, lagre Faxingen</button><button className="medieval-btn" onClick={() => setShowCloseConfirm(false)}>Fortsett</button></div></div>}
    </div>}
  </div>
}
