export type Gender = 'male' | 'female' | 'other'

export type Title =
  | 'Faxekonge'
  | 'Faxedronning'
  | 'Faxemonark'
  | 'Faxeridder'
  | 'Hestemann'

export type Screen = 'home' | 'create' | 'arena' | 'history' | 'event' | 'lore'

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

export interface PersistedState {
  screen: Screen
  contestants: Contestant[]
  contestStartTime: number | null
  events: FaxingEvent[]
  activeEventId: string | null
}
