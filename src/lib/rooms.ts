import { useCallback, useEffect, useRef, useState } from 'react'
import type { Gender, RoomSnapshot, RoomSummary } from '../types'

export type RoomAction = 'join' | 'start' | 'finish' | 'forfeit' | 'reset' | 'set-finished' | 'set-time' | 'disqualify' | 'add' | 'remove' | 'close'
export interface ActionExtra { memberId?: string; name?: string; gender?: Gender; elapsedMs?: number }

// Two seconds keeps a finish visible on every phone within the spec's three, at ten
// requests a second for twenty phones, which the Pi serves without noticing.
const POLL_MS = 2000
const TOKENS_KEY = 'faxing-room-tokens'
type RoomTokens = { host?: string; member?: string }

/**
 * Tokens per room code. Every access is caught: localStorage throws in a private window or on
 * a full quota, and losing a token there only costs this device its role, never the contest,
 * which lives on the server.
 */
function readTokens(): Record<string, RoomTokens> {
  try {
    const parsed: unknown = JSON.parse(localStorage.getItem(TOKENS_KEY) ?? '{}')
    if (typeof parsed !== 'object' || parsed === null) return {}
    const tokens: Record<string, RoomTokens> = {}
    for (const [code, value] of Object.entries(parsed)) {
      if (typeof value !== 'object' || value === null) continue
      const { host, member } = value as Record<string, unknown>
      tokens[code] = { host: typeof host === 'string' ? host : undefined, member: typeof member === 'string' ? member : undefined }
    }
    return tokens
  } catch {
    return {}
  }
}

function saveToken(code: string, role: keyof RoomTokens, token: string) {
  try {
    const tokens = readTokens()
    tokens[code] = { ...tokens[code], [role]: token }
    localStorage.setItem(TOKENS_KEY, JSON.stringify(tokens))
  } catch {
    // Write ignored; see readTokens.
  }
}

const tokensFor = (code: string) => Object.values(readTokens()[code] ?? {}).filter((token): token is string => typeof token === 'string')

async function request<T>(code: string | null, body?: object): Promise<T> {
  const tokens = code ? tokensFor(code) : []
  const response = await fetch(code ? `/api/rooms?code=${encodeURIComponent(code)}` : '/api/rooms', {
    method: body ? 'POST' : 'GET',
    headers: { 'Content-Type': 'application/json', ...(tokens.length ? { 'X-Faxing-Token': tokens.join(',') } : {}) },
    body: body ? JSON.stringify(body) : undefined,
  })
  const json: unknown = await response.json().catch(() => null)
  if (!response.ok) {
    const message = typeof json === 'object' && json !== null && 'error' in json && typeof json.error === 'string' ? json.error : 'Rommet lot seg ikke nå. Prøv påny.'
    throw new Error(message)
  }
  // A 200 that is not JSON is the SPA's index.html: the API route is missing. Passing it on
  // as null crashed whichever component read it first.
  if (json === null) throw new Error('Rommene lot seg ikke nå. Prøv påny.')
  return json as T
}

export const listRooms = () => request<RoomSummary[]>(null)

export async function createRoom(title: string, official: boolean): Promise<RoomSnapshot> {
  const room = await request<RoomSnapshot>(null, { action: 'create', title, official })
  if (room.token) saveToken(room.code, 'host', room.token)
  return room
}

/** Polls one room and applies actions to it. Tracks this device's clock offset to the server. */
export function useRoom(code: string | null) {
  const [room, setRoom] = useState<RoomSnapshot | null>(null)
  // Kept apart so a successful poll clears a lost connection but not a refusal the person
  // has not read yet ("Timen er ute"); that one clears on their next action.
  const [loadError, setLoadError] = useState('')
  const [actionError, setActionError] = useState('')
  const offset = useRef(0)
  const latest = useRef(0)

  const accept = useCallback((snapshot: RoomSnapshot) => {
    // A poll that left before an action but lands after it carries an older serverNow;
    // dropping it stops a just-tapped finish from flickering off for two seconds.
    if (snapshot.serverNow < latest.current) return
    latest.current = snapshot.serverNow
    offset.current = snapshot.serverNow - Date.now()
    setRoom(snapshot)
  }, [])

  const closed = room?.closedAt != null
  useEffect(() => {
    if (!code) { setRoom(null); latest.current = 0; return }
    let alive = true
    const load = () => request<RoomSnapshot>(code).then(snapshot => { if (alive) { accept(snapshot); setLoadError('') } }).catch((reason: Error) => { if (alive) setLoadError(reason.message) })
    load()
    if (closed) return () => { alive = false }
    const interval = setInterval(load, POLL_MS)
    return () => { alive = false; clearInterval(interval) }
  }, [code, closed, accept])

  const act = useCallback(async (action: RoomAction, extra: ActionExtra = {}) => {
    if (!code) return false
    try {
      const snapshot = await request<RoomSnapshot>(code, { action, ...extra })
      if (snapshot.token) saveToken(code, 'member', snapshot.token)
      accept(snapshot)
      setActionError('')
      return true
    } catch (reason) {
      setActionError((reason as Error).message)
      return false
    }
  }, [code, accept])

  return { room, error: actionError || loadError, act, offset }
}
