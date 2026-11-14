export type Gender = 'male' | 'female' | 'other'

export type Title =
  | 'Faxekonge'
  | 'Faxedronning'
  | 'Faxemonark'
  | 'Faxeridder'
  | 'Hestemann'

export type Screen = 'home' | 'room' | 'history' | 'event' | 'lore'

export interface Contestant {
  id: string
  name: string
  gender: Gender
  finishedAt: number | null
  disqualified: boolean
}

export interface RankedContestant extends Contestant {
  title: Title | null
  elapsed: number
}

export interface FaxingEvent {
  id: string
  name: string
  date: number
  official: boolean
  contestants: RankedContestant[]
  password?: string
}

/** What this device may do in a room. Both can hold: the host is usually drinking too. */
export interface RoomRole {
  host: boolean
  memberId: string | null
}

export interface RoomSummary {
  code: string
  title: string
  official: boolean
  startedAt: number | null
  memberCount: number
}

/** A room as the server sees it. Titles are absent on purpose: the client derives them. */
export interface RoomSnapshot {
  code: string
  title: string
  official: boolean
  startedAt: number | null
  closedAt: number | null
  eventId: string | null
  members: Contestant[]
  serverNow: number
  you: RoomRole
  token?: string
}
