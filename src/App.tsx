import { useState, useEffect, useMemo, useCallback } from 'react'
import NightScene from './components/NightScene'
import Torch from './components/Torch'
import GraveScene from './components/GraveScene'
import Arena from './components/Arena'
import History from './components/History'
import EventView from './components/EventView'
import EventErrorBoundary from './components/EventErrorBoundary'
import FaxepaveLoft from './components/FaxepaveLoft'
import RoomLobby from './components/RoomLobby'
import RoomsPanel from './components/RoomsPanel'
import HostGuide from './components/HostGuide'
import ReigningTribute from './components/ReigningTribute'
import { reigningTribute } from './lib/tribute'
import Lore from './components/Lore'
import type { EventStatus, Screen, FaxingEvent } from './types'
import { rankContestants } from './lib/ranking'
import { newId } from './lib/id'
import { countPeople } from './lib/people'
import { CONTEST_DURATION_MS } from './lib/contest'
import { createRoom, useRoom } from './lib/rooms'
import { getEvent, loadEvents, saveEvent, updateEvent, deleteEvent, setEventStatus, adminLogin as adminLoginRequest, adminLogout } from './lib/storage'
import './App.css'

// The room lives in the URL, so a reload, or a link sent round the table, lands in it.
const ROOM_PARAM = 'rom'
const initialRoomCode = () => new URLSearchParams(window.location.search).get(ROOM_PARAM)?.toUpperCase() || null
const setRoomInUrl = (code: string | null) => window.history.replaceState(null, '', code ? `?${ROOM_PARAM}=${code}` : window.location.pathname)
/** The chronicle reads newest first; a decided or filed Faxing keeps that order. */
const newestFirst = (list: FaxingEvent[]) => [...list].sort((a, b) => b.date - a.date)

export default function App() {
  const [roomCode, setRoomCode] = useState<string | null>(initialRoomCode)
  const [screen, setScreen] = useState<Screen>(() => (initialRoomCode() ? 'room' : 'home'))
  // The chronicle: published Faxinger only. Everything counted or crowned reads this list.
  const [events, setEvents] = useState<FaxingEvent[]>([])
  // What this device may see outside the chronicle: the Faxepave's queue, or the one Faxing the
  // room on this phone just closed. Never counted, never crowned.
  const [awaiting, setAwaiting] = useState<FaxingEvent[]>([])
  const [activeEventId, setActiveEventId] = useState<string | null>(null)
  // A Faxing filed from the loft opens straight into the editor, so attendees can follow it.
  const [editRequest, setEditRequest] = useState<string | null>(null)
  const [now, setNow] = useState(Date.now())
  const [isAdmin, setIsAdmin] = useState(false)
  const [loginOpen, setLoginOpen] = useState(false)
  const [loginInput, setLoginInput] = useState('')
  const [loginError, setLoginError] = useState('')
  const { room, error: roomError, act, offset } = useRoom(roomCode)

  useEffect(() => { const interval = setInterval(() => setNow(Date.now()), 500); return () => clearInterval(interval) }, [])
  useEffect(() => { loadEvents().then(setEvents).catch(error => console.error('Could not load events:', error)); fetch('/api/admin').then(response => response.json()).then(result => setIsAdmin(result.authenticated === true)).catch(() => setIsAdmin(false)) }, [])

  // The queue, for a Faxepave only. Reloaded on each screen change so a Faxing that closed while
  // the loft sat open is not missed; a guest keeps whatever the close below put there.
  useEffect(() => {
    if (!isAdmin) return
    Promise.all([loadEvents('pending'), loadEvents('denied')])
      .then(([pending, denied]) => setAwaiting([...pending, ...denied]))
      .catch(error => console.error('Could not load the loft:', error))
  }, [isAdmin, screen])

  // Closing a room happens once, on whichever device the host holds; every other device sees
  // eventId appear on its next poll. The effect keys on eventId, so it fires on that
  // transition only, not on every tick after it. The filed Faxing is not in the chronicle yet,
  // so it is read by its own link and kept aside; the room's devices still get their result.
  const closedEventId = room?.eventId ?? null
  useEffect(() => {
    if (!closedEventId) return
    loadEvents().then(setEvents).catch(error => console.error('Could not load events:', error))
    getEvent(closedEventId).then(filed => setAwaiting(value => [...value.filter(item => item.id !== filed.id), filed])).catch(error => console.error('Could not load the filed Faxing:', error))
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

  // The chronicle first, then the queue: a Faxing that waits is still openable by its own link.
  const activeEvent = events.find(event => event.id === activeEventId) ?? awaiting.find(event => event.id === activeEventId)
  // Keyed on events, not the 500 ms tick: the crowns change only when the chronicle does, and a
  // Faxing that waits or was refused is not in it.
  const tribute = useMemo(() => reigningTribute(events), [events])
  // People, not entries: someone who attended three Faxinger is one name in the chronicle.
  const peopleCount = useMemo(() => countPeople(events), [events])
  const waitingCount = awaiting.filter(event => event.status === 'pending').length
  const navigate = (next: Screen) => { setScreen(next); if (next !== 'event') setEditRequest(null) }
  const adminLogin = async (event: React.FormEvent) => { event.preventDefault(); try { await adminLoginRequest(loginInput); setIsAdmin(true); setLoginOpen(false); setLoginInput(''); setLoginError('') } catch { setLoginError('Galt løsen.') } }
  // A guest's queue died with the session; the chronicle is public and stays.
  const logout = async () => { await adminLogout(); setIsAdmin(false); setAwaiting([]) }
  // A save may land on an entry that is not in the chronicle, so both lists are updated by id.
  const saveAdminEvent = async (event: FaxingEvent) => { const saved = await updateEvent(event); setEvents(value => value.map(item => item.id === saved.id ? saved : item)); setAwaiting(value => value.map(item => item.id === saved.id ? saved : item)) }
  const decideAdminEvent = async (id: string, status: Extract<EventStatus, 'published' | 'denied'>) => {
    const decided = await setEventStatus(id, status)
    setAwaiting(value => status === 'published' ? value.filter(event => event.id !== id) : [...value.filter(event => event.id !== id), decided])
    setEvents(value => status === 'published' ? newestFirst([...value.filter(event => event.id !== id), decided]) : value.filter(event => event.id !== id))
  }
  const removeAdminEvent = async (id: string, after: Screen = 'history') => { await deleteEvent(id); setEvents(value => value.filter(event => event.id !== id)); setAwaiting(value => value.filter(event => event.id !== id)); setActiveEventId(null); setScreen(after) }
  const filePastEvent = async (name: string, date: string, official: boolean) => {
    const saved = await saveEvent({ id: newId(), name, date: new Date(`${date}T12:00:00`).getTime(), official, contestants: [], status: 'published' })
    setEvents(value => newestFirst([...value, saved]))
    setActiveEventId(saved.id)
    setEditRequest(saved.id)
    setScreen('event')
  }

  return <div className={`app-root screen-${screen}`}>
    <header className="app-header"><NightScene /><div className="header-center"><button className="brand-button" onClick={() => navigate('home')}><h1 className="app-title">Faxing</h1></button></div><button className="admin-login-button" onClick={() => isAdmin ? logout() : setLoginOpen(value => !value)}>{isAdmin ? 'Faxepave · Logg ut' : 'Faxepave · Logg inn'}</button>{loginOpen && <form className="admin-login-popover" onSubmit={adminLogin}><label htmlFor="admin-password">Faxepavens løsen</label><input id="admin-password" className="medieval-input" type="password" autoFocus value={loginInput} onChange={event => setLoginInput(event.target.value)} /><button className="medieval-btn" type="submit">Logg inn</button>{loginError && <p className="form-error">{loginError}</p>}</form>}<nav className="main-nav"><Torch className="torch-left" /><Torch className="torch-right" /><button className={screen === 'home' ? 'nav-link active' : 'nav-link'} onClick={() => navigate('home')}>Hjem</button><button className={screen === 'history' || screen === 'event' ? 'nav-link active' : 'nav-link'} onClick={() => navigate('history')}>Faxinger</button><button className={screen === 'lore' ? 'nav-link active' : 'nav-link'} onClick={() => navigate('lore')}>Historie</button>{isAdmin && <button className={screen === 'loft' ? 'nav-link active' : 'nav-link'} onClick={() => navigate('loft')}>Loftet{waitingCount > 0 && <span className="nav-count" aria-label={`${waitingCount} venter`}>{waitingCount}</span>}</button>}</nav></header>
    <main className="app-main">
      {screen === 'home' && <section className="home-screen scroll-panel"><p className="eyebrow">Faxe Ordenens samlingssted</p><h2 className="panel-title">Velkommen til Faxing</h2><p className="panel-desc">Her samles Ordenens gamle krøniker, nye dyster og de navn som haver drukket seg inn i historien.</p>{roomCode && room && <div className="ongoing-event-banner"><div><span className="eyebrow">I gang nu</span><strong>{room.title}</strong><span>{room.members.length} deltagere er innskrevet</span></div><button className="medieval-btn" onClick={() => setScreen('room')}>Tilbake til Rommet</button></div>}<div className="home-stats"><div><strong>{events.length}</strong><span>Faxinger avholdt</span></div><div><strong>{peopleCount}</strong><span>Navn i krøniken</span></div><div><strong>{events.filter(event => event.official).length}</strong><span>Offisielle dyster</span></div></div>{tribute && <ReigningTribute tribute={tribute} />}<RoomsPanel isAdmin={isAdmin} onOpen={openRoom} onCreate={startRoom} /><HostGuide /></section>}
      {screen === 'room' && <>
        {roomError && <p className="form-error room-error" role="alert">{roomError}</p>}
        {!room && !roomError && <section className="event-loading scroll-panel"><h2 className="panel-title">Henter Rommet…</h2></section>}
        {!room && roomError && <section className="event-loading scroll-panel"><button className="back-link" onClick={leaveRoom}>Tilbake til samlingsstedet</button></section>}
        {room && room.startedAt === null && <RoomLobby room={room} events={events} onAct={act} />}
        {room && room.startedAt !== null && <Arena title={room.title} code={room.code} rankedContestants={ranked} contestStartTime={room.startedAt} now={roomNow} durationMs={CONTEST_DURATION_MS} you={room.you} onAct={act} />}
      </>}
      {screen === 'history' && <History events={events} onOpen={event => { setActiveEventId(event.id); setScreen('event') }} onCreate={() => navigate('loft')} isAdmin={isAdmin} />}
      {screen === 'loft' && isAdmin && <FaxepaveLoft awaiting={awaiting} onDecide={decideAdminEvent} onOpen={event => { setActiveEventId(event.id); setScreen('event') }} onDelete={id => removeAdminEvent(id, 'loft')} onFile={filePastEvent} />}
      {screen === 'loft' && !isAdmin && <section className="event-loading scroll-panel"><p className="eyebrow">Faxe Ordenens vaktkammer</p><h2 className="panel-title">Loftet er stengt</h2><p className="panel-desc">Bare Faxepaven råder her. Logg inn for å se hva som venter.</p><button className="back-link" onClick={() => setScreen('home')}>Tilbake til samlingsstedet</button></section>}
      {screen === 'event' && !activeEvent ? <section className="event-loading scroll-panel"><p className="eyebrow">Faxe Ordenens arkiv</p><h2 className="panel-title">Henter Faxing…</h2><button className="back-link" onClick={() => setScreen('history')}>Tilbake til krøniken</button></section> : screen === 'event' && activeEvent && <EventErrorBoundary><EventView event={activeEvent} events={events} isAdmin={isAdmin} startEditing={editRequest === activeEvent.id} onBack={() => navigate('history')} onSave={saveAdminEvent} onDelete={removeAdminEvent} onDecide={decideAdminEvent} /></EventErrorBoundary>}
      {screen === 'lore' && <Lore />}
    </main>
    <footer className="app-footer"><GraveScene /><p>Faxe Ordenens offisielle arkiv · Brygget med ære</p><p className="moderation-notice">Drikk med måte, og pass på hverandre.</p></footer>
  </div>
}
