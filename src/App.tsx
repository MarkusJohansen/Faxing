import { useState, useEffect, useCallback } from 'react'
import Registration from './components/Registration'
import Arena from './components/Arena'
import History from './components/History'
import EventView from './components/EventView'
import EventErrorBoundary from './components/EventErrorBoundary'
import type { Contestant, RankedContestant, Screen, Title, FaxingEvent } from './types'
import { loadEvents, saveEvent, updateEvent, deleteEvent, adminLogin as adminLoginRequest, adminLogout } from './lib/storage'
import './App.css'

const CONTEST_DURATION_MS = 60 * 60 * 1000
const ACTIVE_FAXING_KEY = 'faxing-active-event'
type ActiveFaxingDraft = { name: string; official: boolean; password: string; contestants: Contestant[]; contestStartTime: number }
type ActiveEventDetails = { name: string; official: boolean; password?: string }

function parseActiveEventDetails(value: string | null): ActiveEventDetails | null {
  if (!value?.startsWith('{')) return null
  try {
    const parsed = JSON.parse(value) as Partial<ActiveEventDetails>
    return typeof parsed.name === 'string' && typeof parsed.official === 'boolean' ? parsed as ActiveEventDetails : null
  } catch {
    return null
  }
}

export default function App() {
  const [screen, setScreen] = useState<Screen>('home')
  const [contestants, setContestants] = useState<Contestant[]>([])
  const [contestStartTime, setContestStartTime] = useState<number | null>(null)
  const [events, setEvents] = useState<FaxingEvent[]>([])
  const [activeEventId, setActiveEventId] = useState<string | null>(null)
  const [now, setNow] = useState(Date.now())
  const [isAdmin, setIsAdmin] = useState(false)
  const [loginOpen, setLoginOpen] = useState(false)
  const [loginInput, setLoginInput] = useState('')
  const [loginError, setLoginError] = useState('')

  useEffect(() => { const interval = setInterval(() => setNow(Date.now()), 500); return () => clearInterval(interval) }, [])
  useEffect(() => { loadEvents().then(setEvents).catch(error => console.error('[v0] Could not load events:', error)); fetch('/api/admin').then(response => response.json()).then(result => setIsAdmin(result.authenticated === true)).catch(() => setIsAdmin(false)) }, [])
  useEffect(() => {
    const rawDraft = localStorage.getItem(ACTIVE_FAXING_KEY)
    if (!rawDraft) return
    try {
      const draft = JSON.parse(rawDraft) as ActiveFaxingDraft
      if (draft.contestStartTime && draft.name && draft.contestants?.length) {
        setContestants(draft.contestants)
        setContestStartTime(draft.contestStartTime)
        setActiveEventId(JSON.stringify({ name: draft.name, official: draft.official, password: draft.password }))
        setScreen('arena')
      } else localStorage.removeItem(ACTIVE_FAXING_KEY)
    } catch {
      localStorage.removeItem(ACTIVE_FAXING_KEY)
    }
  }, [])
  useEffect(() => {
    if (!activeEventId || !contestStartTime || !contestants.length || screen === 'history' || screen === 'event') return
    const details = parseActiveEventDetails(activeEventId)
    if (!details) return
    const draft: ActiveFaxingDraft = { ...details, password: details.password ?? '', contestants, contestStartTime }
    localStorage.setItem(ACTIVE_FAXING_KEY, JSON.stringify(draft))
  }, [activeEventId, contestStartTime, contestants, screen])

  const startContest = useCallback((name: string, official: boolean, password?: string) => { if (!contestants.length) return; setContestStartTime(Date.now()); setScreen('arena'); setActiveEventId(JSON.stringify({ name, official, password: password ?? '' })) }, [contestants])
  const addContestant = useCallback((name: string, gender: Contestant['gender']) => setContestants(value => [...value, { id: crypto.randomUUID(), name, gender, finishedAt: null, disqualified: false }]), [])
  const removeContestant = useCallback((id: string) => setContestants(value => value.filter(contestant => contestant.id !== id)), [])
  const markFinished = useCallback((id: string) => setContestants(value => value.map(contestant => contestant.id === id && !contestant.finishedAt && !contestant.disqualified ? { ...contestant, finishedAt: Date.now() } : contestant)), [])
  const markDisqualified = useCallback((id: string) => setContestants(value => value.map(contestant => contestant.id === id ? { ...contestant, disqualified: true, finishedAt: null } : contestant)), [])
  const editContestant = useCallback((id: string, patch: Partial<Contestant>) => setContestants(value => value.map(contestant => contestant.id === id ? { ...contestant, ...patch } : contestant)), [])
  const ranked = useCallback((): RankedContestant[] => { let king = false; let queen = false; let monarch = false; return [...contestants].sort((a, b) => (a.finishedAt && b.finishedAt ? a.finishedAt - b.finishedAt : a.finishedAt ? -1 : b.finishedAt ? 1 : 0)).map(contestant => { const elapsed = (contestant.finishedAt ?? now) - (contestStartTime ?? now); let title: Title | null = null; if (contestant.disqualified || (!contestant.finishedAt && contestStartTime && elapsed >= CONTEST_DURATION_MS)) title = 'Hestemann'; else if (contestant.finishedAt && contestant.gender === 'male' && !king) { title = 'Faxekonge'; king = true } else if (contestant.finishedAt && contestant.gender === 'female' && !queen) { title = 'Faxedronning'; queen = true } else if (contestant.finishedAt && contestant.gender === 'other' && !monarch) { title = 'Faxemonark'; monarch = true } else if (contestant.finishedAt) title = 'Faxeridder'; return { ...contestant, title, elapsed: contestant.finishedAt ? contestant.finishedAt - (contestStartTime ?? contestant.finishedAt) : Math.max(0, elapsed) } }) }, [contestants, contestStartTime, now])

  const finishEvent = async () => { if (!activeEventId || !contestStartTime) return; const details = parseActiveEventDetails(activeEventId); if (!details) return; try { const saved = await saveEvent({ id: crypto.randomUUID(), name: details.name, official: details.official, password: details.password, date: contestStartTime, contestants: ranked() }); localStorage.removeItem(ACTIVE_FAXING_KEY); setEvents(value => [saved, ...value]); setContestants([]); setContestStartTime(null); setActiveEventId(null); setScreen('history') } catch (error) { console.error('[v0] Could not save event:', error); alert('Faxingen kunne ikke gemmes. Dine deltagere er stadig gemt lokalt — prøv igen.') } }
  const activeEvent = events.find(event => event.id === activeEventId)
  const completed = events.reduce((total, event) => total + event.contestants.length, 0)
  const navigate = (next: Screen) => setScreen(next)
  const adminLogin = async (event: React.FormEvent) => { event.preventDefault(); try { await adminLoginRequest(loginInput); setIsAdmin(true); setLoginOpen(false); setLoginInput(''); setLoginError('') } catch { setLoginError('Forkert password.') } }
  const logout = async () => { await adminLogout(); setIsAdmin(false) }
  const saveAdminEvent = async (event: FaxingEvent) => { const saved = await updateEvent(event); setEvents(value => value.map(item => item.id === saved.id ? saved : item)) }
  const removeAdminEvent = async (id: string) => { await deleteEvent(id); setEvents(value => value.filter(event => event.id !== id)); setScreen('history'); setActiveEventId(null) }
  const ongoingDetails = parseActiveEventDetails(activeEventId)
  const addPastEvent = async () => { const name = window.prompt('Navn på den gamle Faxing')?.trim(); if (!name) return; const dateValue = window.prompt('Dato (YYYY-MM-DD)', new Date().toISOString().slice(0, 10)); if (!dateValue) return; const official = window.confirm('Skal dette være en officiel Faxing?'); const saved = await saveEvent({ id: crypto.randomUUID(), name, date: new Date(`${dateValue}T12:00:00`).getTime(), official, contestants: [] }); setEvents(value => [saved, ...value]); setActiveEventId(saved.id); setScreen('event') }

  return <div className="app-root"><header className="app-header"><div className="header-ornament left">⚔</div><div className="header-center"><button className="brand-button" onClick={() => navigate('home')}><h1 className="app-title">Faxing</h1><p className="app-subtitle">Faxe Bryggeri · Grundlagt 1901 · Danmark</p></button></div><div className="header-ornament right">⚔</div><button className="admin-login-button" onClick={() => isAdmin ? logout() : setLoginOpen(value => !value)}>{isAdmin ? 'Faxepave · Log ud' : 'Faxepave login'}</button>{loginOpen && <form className="admin-login-popover" onSubmit={adminLogin}><label htmlFor="admin-password">Faxepave password</label><input id="admin-password" className="medieval-input" type="password" autoFocus value={loginInput} onChange={event => setLoginInput(event.target.value)} /><button className="medieval-btn" type="submit">Log ind</button>{loginError && <p className="form-error">{loginError}</p>}</form>}<nav className="main-nav"><button className={screen === 'home' ? 'nav-link active' : 'nav-link'} onClick={() => navigate('home')}>Hjem</button><button className={screen === 'history' || screen === 'event' ? 'nav-link active' : 'nav-link'} onClick={() => navigate('history')}>Faxinger</button><button className={screen === 'lore' ? 'nav-link active' : 'nav-link'} onClick={() => navigate('lore')}>Historie</button></nav></header><main className="app-main">{screen === 'home' && <section className="home-screen scroll-panel"><p className="eyebrow">Faxe Ordenens samlingssted</p><h2 className="panel-title">Velkommen til Faxing</h2><p className="panel-desc">Her samles ordenens gamle krøniker, nye dyster og de navne, der har drukket sig ind i historien.</p>{screen === 'home' && ongoingDetails && <div className="ongoing-event-banner"><div><span className="eyebrow">I gang nu</span><strong>{ongoingDetails.name}</strong><span>{contestants.length} deltagere er registreret</span></div><button className="medieval-btn" onClick={() => setScreen('arena')}>Se deltagere</button></div>}<div className="home-stats"><div><strong>{events.length}</strong><span>Faxinger afholdt</span></div><div><strong>{completed}</strong><span>Navne i krøniken</span></div><div><strong>{events.filter(event => event.official).length}</strong><span>Officielle dyster</span></div></div><button className="medieval-btn start-btn" onClick={() => navigate('create')}>Start en ny Faxing</button></section>}{screen === 'create' && <Registration contestants={contestants} onAdd={addContestant} onRemove={removeContestant} onStart={startContest} isAdmin={isAdmin} />}{screen === 'arena' && contestStartTime && <Arena rankedContestants={ranked()} contestStartTime={contestStartTime} now={now} durationMs={CONTEST_DURATION_MS} onFinish={markFinished} onDisqualify={markDisqualified} onReset={finishEvent} canManage={isAdmin && (parseActiveEventDetails(activeEventId)?.official ?? false) === true} canMarkProgress={!(parseActiveEventDetails(activeEventId)?.official ?? false) || isAdmin} isAdmin={isAdmin && (parseActiveEventDetails(activeEventId)?.official ?? false) === true} onEditContestant={editContestant} />}{screen === 'history' && <History events={events} onOpen={event => { setActiveEventId(event.id); setScreen('event') }} onCreate={addPastEvent} isAdmin={isAdmin && (parseActiveEventDetails(activeEventId)?.official ?? false) === true} />}{screen === 'event' && screen === 'event' && !activeEvent ? <section className="event-loading scroll-panel"><p className="eyebrow">Faxe Ordenens arkiv</p><h2 className="panel-title">Indlæser Faxing…</h2><button className="back-link" onClick={() => setScreen('history')}>Tilbage til krøniken</button></section> : activeEvent && <EventErrorBoundary><EventView event={activeEvent} isAdmin={isAdmin && (parseActiveEventDetails(activeEventId)?.official ?? false) === true} onBack={() => navigate('history')} onSave={saveAdminEvent} onDelete={removeAdminEvent} /></EventErrorBoundary>}{screen === 'lore' && <section className="lore-screen scroll-panel"><p className="eyebrow">Faxe Ordenens annaler</p><h2 className="panel-title">Historien om Faxe Ordenen</h2><p className="panel-desc">En orden bygget på fællesskab, mod og den ædle kunst at tømme en Faxe inden timens udløb.</p><div className="lore-grid"><article><span className="lore-year">1901</span><h3>Ordenen grundlægges</h3><p>De første riddere samles ved bryggeriet og formulerer den ældgamle ed.</p></article><article><span className="lore-year">Hvert semester</span><h3>Den officielle dyst</h3><p>En ny konge og dronning indskrives i krøniken.</p></article><article><span className="lore-year">I dag</span><h3>Traditionen lever</h3><p>Alle kan føje deres navn til historien.</p></article></div></section>}</main><footer className="app-footer">Faxe Ordenens officielle arkiv · Brygget med ære</footer></div>
}
