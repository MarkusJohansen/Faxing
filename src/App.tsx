import { useState, useEffect, useMemo, useCallback } from 'react'
import NightScene from './components/NightScene'
import Torch from './components/Torch'
import GraveScene from './components/GraveScene'
import Arena from './components/Arena'
import History from './components/History'
import EventView from './components/EventView'
import EventErrorBoundary from './components/EventErrorBoundary'
import RoomLobby from './components/RoomLobby'
import RoomsPanel from './components/RoomsPanel'
import HostGuide from './components/HostGuide'
import Lore from './components/Lore'
import type { Screen, FaxingEvent } from './types'
import { rankContestants } from './lib/ranking'
import { newId } from './lib/id'
import { CONTEST_DURATION_MS } from './lib/contest'
import { createRoom, useRoom } from './lib/rooms'
import { loadEvents, saveEvent, updateEvent, deleteEvent, adminLogin as adminLoginRequest, adminLogout } from './lib/storage'
import './App.css'

// The room lives in the URL, so a reload, or a link sent round the table, lands in it.
const ROOM_PARAM = 'rom'
const initialRoomCode = () => new URLSearchParams(window.location.search).get(ROOM_PARAM)?.toUpperCase() || null
const setRoomInUrl = (code: string | null) => window.history.replaceState(null, '', code ? `?${ROOM_PARAM}=${code}` : window.location.pathname)

export default function App() {
  const [roomCode, setRoomCode] = useState<string | null>(initialRoomCode)
  const [screen, setScreen] = useState<Screen>(() => (initialRoomCode() ? 'room' : 'home'))
  const [events, setEvents] = useState<FaxingEvent[]>([])
  const [activeEventId, setActiveEventId] = useState<string | null>(null)
  const [now, setNow] = useState(Date.now())
  const [isAdmin, setIsAdmin] = useState(false)
  const [loginOpen, setLoginOpen] = useState(false)
  const [loginInput, setLoginInput] = useState('')
  const [loginError, setLoginError] = useState('')
  const { room, error: roomError, act, offset } = useRoom(roomCode)

  useEffect(() => { const interval = setInterval(() => setNow(Date.now()), 500); return () => clearInterval(interval) }, [])
  useEffect(() => { loadEvents().then(setEvents).catch(error => console.error('Could not load events:', error)); fetch('/api/admin').then(response => response.json()).then(result => setIsAdmin(result.authenticated === true)).catch(() => setIsAdmin(false)) }, [])

  // Closing a room happens once, on whichever device the host holds; every other device sees
  // eventId appear on its next poll. The effect keys on eventId, so it fires on that
  // transition only, not on every tick after it.
  const closedEventId = room?.eventId ?? null
  useEffect(() => {
    if (!closedEventId) return
    loadEvents().then(setEvents).catch(error => console.error('Could not load events:', error))
    setActiveEventId(closedEventId)
    setRoomCode(null)
    setRoomInUrl(null)
    setScreen('event')
  }, [closedEventId])

  // The server's clock, not this phone's: offset is measured on every poll.
  const roomNow = now + offset.current
  const ranked = useMemo(() => room?.startedAt != null ? rankContestants(room.members, room.startedAt, roomNow, CONTEST_DURATION_MS) : [], [room, roomNow])

  const openRoom = useCallback((code: string) => { setRoomCode(code); setRoomInUrl(code); setScreen('room') }, [])
  const startRoom = useCallback(async (title: string, official: boolean) => { const created = await createRoom(title, official); openRoom(created.code) }, [openRoom])
  const leaveRoom = () => { setRoomCode(null); setRoomInUrl(null); setScreen('home') }

  const activeEvent = events.find(event => event.id === activeEventId)
  const completed = events.reduce((total, event) => total + event.contestants.length, 0)
  const navigate = (next: Screen) => setScreen(next)
  const adminLogin = async (event: React.FormEvent) => { event.preventDefault(); try { await adminLoginRequest(loginInput); setIsAdmin(true); setLoginOpen(false); setLoginInput(''); setLoginError('') } catch { setLoginError('Galt løsen.') } }
  const logout = async () => { await adminLogout(); setIsAdmin(false) }
  const saveAdminEvent = async (event: FaxingEvent) => { const saved = await updateEvent(event); setEvents(value => value.map(item => item.id === saved.id ? saved : item)) }
  const removeAdminEvent = async (id: string) => { await deleteEvent(id); setEvents(value => value.filter(event => event.id !== id)); setScreen('history'); setActiveEventId(null) }
  const addPastEvent = async () => { const name = window.prompt('Navn på den gamle Faxing')?.trim(); if (!name) return; const dateValue = window.prompt('Dato (YYYY-MM-DD)', new Date().toISOString().slice(0, 10)); if (!dateValue) return; const official = window.confirm('Skal dette være en offisiell Faxing?'); const saved = await saveEvent({ id: newId(), name, date: new Date(`${dateValue}T12:00:00`).getTime(), official, contestants: [] }); setEvents(value => [saved, ...value]); setActiveEventId(saved.id); setScreen('event') }

  return <div className={`app-root screen-${screen}`}>
    <header className="app-header"><NightScene /><div className="header-center"><button className="brand-button" onClick={() => navigate('home')}><h1 className="app-title">Faxing</h1></button></div><button className="admin-login-button" onClick={() => isAdmin ? logout() : setLoginOpen(value => !value)}>{isAdmin ? 'Faxepave · Logg ut' : 'Faxepave · Logg inn'}</button>{loginOpen && <form className="admin-login-popover" onSubmit={adminLogin}><label htmlFor="admin-password">Faxepavens løsen</label><input id="admin-password" className="medieval-input" type="password" autoFocus value={loginInput} onChange={event => setLoginInput(event.target.value)} /><button className="medieval-btn" type="submit">Logg inn</button>{loginError && <p className="form-error">{loginError}</p>}</form>}<nav className="main-nav"><Torch className="torch-left" /><Torch className="torch-right" /><button className={screen === 'home' ? 'nav-link active' : 'nav-link'} onClick={() => navigate('home')}>Hjem</button><button className={screen === 'history' || screen === 'event' ? 'nav-link active' : 'nav-link'} onClick={() => navigate('history')}>Faxinger</button><button className={screen === 'lore' ? 'nav-link active' : 'nav-link'} onClick={() => navigate('lore')}>Historie</button></nav></header>
    <main className="app-main">
      {screen === 'home' && <section className="home-screen scroll-panel"><p className="eyebrow">Faxe Ordenens samlingssted</p><h2 className="panel-title">Velkommen til Faxing</h2><p className="panel-desc">Her samles Ordenens gamle krøniker, nye dyster og de navn som haver drukket seg inn i historien.</p>{roomCode && room && <div className="ongoing-event-banner"><div><span className="eyebrow">I gang nu</span><strong>{room.title}</strong><span>{room.members.length} deltagere er innskrevet</span></div><button className="medieval-btn" onClick={() => setScreen('room')}>Tilbake til Rommet</button></div>}<div className="home-stats"><div><strong>{events.length}</strong><span>Faxinger avholdt</span></div><div><strong>{completed}</strong><span>Navn i krøniken</span></div><div><strong>{events.filter(event => event.official).length}</strong><span>Offisielle dyster</span></div></div><RoomsPanel isAdmin={isAdmin} onOpen={openRoom} onCreate={startRoom} /><HostGuide /></section>}
      {screen === 'room' && <>
        {roomError && <p className="form-error room-error" role="alert">{roomError}</p>}
        {!room && !roomError && <section className="event-loading scroll-panel"><h2 className="panel-title">Henter Rommet…</h2></section>}
        {!room && roomError && <section className="event-loading scroll-panel"><button className="back-link" onClick={leaveRoom}>Tilbake til samlingsstedet</button></section>}
        {room && room.startedAt === null && <RoomLobby room={room} onAct={act} />}
        {room && room.startedAt !== null && <Arena title={room.title} code={room.code} rankedContestants={ranked} contestStartTime={room.startedAt} now={roomNow} durationMs={CONTEST_DURATION_MS} you={room.you} onAct={act} />}
      </>}
      {screen === 'history' && <History events={events} onOpen={event => { setActiveEventId(event.id); setScreen('event') }} onCreate={addPastEvent} isAdmin={isAdmin} />}
      {screen === 'event' && !activeEvent ? <section className="event-loading scroll-panel"><p className="eyebrow">Faxe Ordenens arkiv</p><h2 className="panel-title">Henter Faxing…</h2><button className="back-link" onClick={() => setScreen('history')}>Tilbake til krøniken</button></section> : screen === 'event' && activeEvent && <EventErrorBoundary><EventView event={activeEvent} isAdmin={isAdmin} onBack={() => navigate('history')} onSave={saveAdminEvent} onDelete={removeAdminEvent} /></EventErrorBoundary>}
      {screen === 'lore' && <Lore />}
    </main>
    <footer className="app-footer"><GraveScene /><p>Faxe Ordenens offisielle arkiv · Brygget med ære</p><p className="moderation-notice">Drikk med måte, og pass på hverandre.</p></footer>
  </div>
}
