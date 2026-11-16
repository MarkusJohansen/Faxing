/**
 * Runnable check of the crown succession. No framework:  npm run check:rules
 * Each assertion names the silent failure it guards.
 */
import { CROWN_ORDER, successionLines } from './succession.ts'
import { reigningTribute } from './tribute.ts'
import type { ArchivedContestant, FaxingEvent, RecordedTitle } from '../types'
import type { CrownLine } from './succession.ts'

const day = (year: number, month: number, date: number) => Date.UTC(year, month - 1, date)

const crowned = (name: string, title: RecordedTitle, elapsed: number | null = 15 * 60_000): ArchivedContestant =>
  ({ id: `${name}-${title}`, name, gender: 'male', finishedAt: 1, disqualified: false, title, elapsed })

const faxing = (name: string, date: number, official: boolean, contestants: ArchivedContestant[]): FaxingEvent =>
  ({ id: name, name, date, official, contestants, status: 'published' })

const yearOf = (date: number) => new Date(date).getUTCFullYear()

/** Each line as `crown year:name(recorded title)* …`; `*` is the reigning holder, `-` is no reign. */
const show = (lines: CrownLine[]) => lines.map(line =>
  `${line.crown} ${line.reigns.map(reign => `${yearOf(reign.date)}:${reign.name}${reign.recordedAs === null ? '' : `(${reign.recordedAs})`}${reign.reigning ? '*' : ''}`).join(' ') || '-'}`,
).join(' | ')

const EMPTY = 'Faxekonge - | Faxedronning - | Faxemonark -'

function assertLine(label: string, events: FaxingEvent[], expected: string) {
  const actual = show(successionLines(events))
  if (actual !== expected) throw new Error(`${label}: expected ${expected}, was ${actual}`)
  console.log(`ok  ${label}`)
}

function demo() {
  // Guards the shape: three lines, always in king, queen, monarch order, even with nothing to show.
  assertLine('no Faxinger, three empty lines', [], EMPTY)

  // Guards against crowning a garden party: only official Faxinger fill a line or hold the mark.
  assertLine('an unofficial Faxing fills no line, and never holds the reigning mark',
    [faxing('Hagefest', day(2024, 6, 1), false, [crowned('Per', 'Faxekonge')]), faxing('Sommer', day(2024, 5, 1), true, [crowned('Ola', 'Faxekonge')])],
    'Faxekonge 2024:Ola* | Faxedronning - | Faxemonark -')

  // Guards against hiding the old record's king: the first Faxeting's winner was an Erkekonge.
  assertLine('Erkekonge fills the king\'s line, named as the record wrote it',
    [faxing('Første', day(2021, 1, 1), true, [crowned('William', 'Erkekonge')])],
    'Faxekonge 2021:William(Erkekonge)* | Faxedronning - | Faxemonark -')

  // Guards against reading an heir or a knight as a crown.
  assertLine('crown princes, princes, knights and horsemen fill no line',
    [faxing('Gammel', day(2020, 1, 1), true, [crowned('Ola', 'Kronprins'), crowned('Per', 'Prins'), crowned('Kim', 'Faxeridder'), crowned('Sen', 'Hestemann')])],
    EMPTY)

  // Guards against a crown landing in the wrong line.
  assertLine('each crown fills only its own line',
    [faxing('Sommer', day(2024, 5, 1), true, [crowned('Kari', 'Faxedronning'), crowned('Kim', 'Faxemonark')])],
    'Faxekonge - | Faxedronning 2024:Kari* | Faxemonark 2024:Kim*')

  // Guards against turning the line into a leaderboard: a succession counts every crowning.
  // The list arrives newest first, so this also guards the oldest-first order.
  assertLine('a repeat winner is one node per crowning, oldest first',
    [faxing('Ny', day(2024, 5, 1), true, [crowned('Ola', 'Faxekonge')]), faxing('Gammel', day(2022, 5, 1), true, [crowned('Ola', 'Faxekonge')])],
    'Faxekonge 2022:Ola 2024:Ola* | Faxedronning - | Faxemonark -')

  // Guards against dropping a second holder the record names: the chronicle is editable.
  assertLine('two holders of one crown at one Faxing are both shown, in the record\'s order',
    [faxing('Sommer', day(2024, 5, 1), true, [crowned('Per', 'Faxekonge'), crowned('Ola', 'Faxekonge')])],
    'Faxekonge 2024:Per* 2024:Ola* | Faxedronning - | Faxemonark -')

  // Guards against reaching back: a crown contested at the latest Faxing and lost is not reigning.
  assertLine('a crown the latest official Faxing contested and did not award is not marked',
    [faxing('Vår', day(2022, 5, 1), true, [crowned('Ola', 'Faxekonge')]), faxing('Høst', day(2024, 9, 1), true, [crowned('Kari', 'Faxedronning'), crowned('Sen', 'Hestemann')])],
    'Faxekonge 2022:Ola | Faxedronning 2024:Kari* | Faxemonark -')

  // Guards against the two views disagreeing: on a shared date the first-listed Faxing is latest.
  const tie = [faxing('Første', day(2024, 5, 1), true, [crowned('Ola', 'Faxekonge')]), faxing('Andre', day(2024, 5, 1), true, [crowned('Per', 'Faxekonge')])]
  assertLine('a shared date follows the reigning tiebreak: the first-listed Faxing is the later reign',
    tie,
    'Faxekonge 2024:Per 2024:Ola* | Faxedronning - | Faxemonark -')
  if (reigningTribute(tie)?.event.name !== 'Første') throw new Error('the succession and the reigning tribute disagree about a shared date')
  console.log('ok  the succession and the reigning tribute agree on a shared date')

  // Guards against reading a missing time as a real one: one old record has no time at all.
  const missing = successionLines([faxing('Gammel', day(2020, 1, 1), true, [crowned('William', 'Erkekonge', null)])])
  if (missing[0].reigns[0]?.elapsed !== null) throw new Error('a record with no time must stay null, not 0:00')
  console.log('ok  a record with no time stays null')

  // Guards the line order itself, whatever the data.
  const order = successionLines([]).map(line => line.crown).join(',')
  if (order !== CROWN_ORDER.join(',')) throw new Error(`lines out of order: ${order}`)
  console.log('ok  the lines stay in king, queen, monarch order')
}

demo()
