/** Elapsed contest time as m:ss. Shared so the chronicle and the tribute can never disagree. */
export const formatTime = (ms: number) => `${Math.floor(ms / 60000)}:${String(Math.floor((ms % 60000) / 1000)).padStart(2, '0')}`

/** A chronicle date. Hand-entered rows can hold anything, so a bad date reads as unknown instead of throwing a RangeError mid-render. */
export const formatDate = (date: number) => { const timestamp = Number(date); return Number.isFinite(timestamp) && Number.isFinite(new Date(timestamp).getTime()) ? new Intl.DateTimeFormat('nb-NO', { day: 'numeric', month: 'long', year: 'numeric' }).format(timestamp) : 'Ukjent dato' }
