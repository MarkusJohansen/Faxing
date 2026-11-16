/**
 * Runnable check of the crown succession. No framework:  npm run check:rules
 * Each assertion names the silent failure it guards.
 */
import { CROWN_ORDER, SECOND_ORDER_FOUNDED, foundingBoundary, lineNodes, shownLines, successionLines } from './succession.ts'
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

function assertShown(label: string, events: FaxingEvent[], expected: string) {
  const actual = show(shownLines(successionLines(events)))
  if (actual !== expected) throw new Error(`${label}: expected ${expected}, was ${actual}`)
  console.log(`ok  ${label}`)
}

/** The king's line as its nodes: `year:name`, with `|` for the founding mark. */
const kingNodes = (events: FaxingEvent[]) => {
  const king = successionLines(events).find(line => line.crown === 'Faxekonge')
  if (king === undefined) throw new Error('the succession has no king\'s line')
  return lineNodes(king.reigns)
    .map(node => node.kind === 'founding' ? '|' : `${yearOf(node.reign.date)}:${node.reign.name}`)
    .join(' ')
}

function assertNodes(label: string, events: FaxingEvent[], expected: string) {
  const actual = kingNodes(events)
  if (actual !== expected) throw new Error(`${label}: expected ${expected}, was ${actual}`)
  console.log(`ok  ${label}`)
}

const LAST_OF_THE_FIRST_ORDER = faxing('Eldsterådets siste', day(2022, 10, 29), true, [crowned('Markus', 'Faxekonge')])

function demo() {
  // Guards the shape: three lines, always in king, queen, monarch order, even with nothing to show.
  assertLine('no Faxinger, three empty lines', [], EMPTY)
  // Guards against showing a Monarkrekka nobody has filled: Faxemonark can go unawarded for a
  // long run, and an empty third line reads as a page that failed to load. The other two lines
  // stay, because a night with no queen still has a queen's line.
  assertShown('an empty Monarkrekka is hidden, while the king\'s and queen\'s empty lines stay', [],
    'Faxekonge - | Faxedronning -')

  // Guards against hiding the line once a monark exists: the crown earned is the crown shown.
  assertShown('a Monarkrekka with a monark is shown',
    [faxing('Sommer', day(2024, 5, 1), true, [crowned('Kim', 'Faxemonark')])],
    'Faxekonge - | Faxedronning - | Faxemonark 2024:Kim*')

  // Guards the day itself: the divider must fall on 10 October 2024, the day Konsilet på A4
  // founded den andre orden, at the noon the archive files a dateless day on.
  if (SECOND_ORDER_FOUNDED !== Date.UTC(2024, 9, 10, 12)) throw new Error(`the founding mark is on the wrong day: ${new Date(SECOND_ORDER_FOUNDED).toISOString()}`)
  console.log('ok  the founding mark falls on 10 October 2024')

  // Guards the mark's place: the first order's last two kings, the dashed line, then the new
  // order's first king.
  assertNodes('the founding mark stands between the first order\'s kings and the second\'s',
    [LAST_OF_THE_FIRST_ORDER, faxing('Gjenfødelsen', day(2024, 9, 30), true, [crowned('William', 'Faxekonge')]),
     faxing('Første Faxeting', day(2025, 4, 15), true, [crowned('Scott', 'Erkekonge')])],
    '2022:Markus 2024:William | 2025:Scott')

  // Guards against a divider with nothing above it: a crown that begins with the second order
  // is all new, and the mark would separate nothing.
  assertNodes('no founding mark in a line whose first reign is from the second order',
    [faxing('Første Faxeting', day(2025, 4, 15), true, [crowned('Scott', 'Erkekonge')])],
    '2025:Scott')

  // Guards the end of a line the new order has not reached: the mark still says where the
  // order that line reads ended.
  assertNodes('the founding mark ends a line that holds no reign from the second order',
    [LAST_OF_THE_FIRST_ORDER],
    '2022:Markus |')

  // Guards the boundary itself: a Faxing filed at the noon of the founding day is the new
  // order's, and stands below the mark rather than above it.
  assertNodes('a Faxing on the founding day stands below the mark',
    [LAST_OF_THE_FIRST_ORDER, faxing('Stiftelsesdagen', Date.UTC(2024, 9, 10, 12), true, [crowned('Scott', 'Erkekonge')])],
    '2022:Markus | 2024:Scott')

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

  // Guards the archive's dashed founding line: it must stand above the newest Faxing of the first
  // order, and only when a Faxing of the second is above it. The archive lists newest first.
  const chronicle = [
    { id: 'nyest', date: day(2026, 10, 10) },
    { id: 'ny', date: day(2025, 4, 15) },
    { id: 'siste-av-forste', date: day(2024, 9, 30) },
    { id: 'gjenfodelsen', date: day(2022, 10, 29) },
  ]
  if (foundingBoundary(chronicle) !== 'siste-av-forste') throw new Error(`the founding mark sits above ${foundingBoundary(chronicle)}`)
  console.log('ok  the archive marks the founding above the newest Faxing of the first order')
  if (foundingBoundary(chronicle.slice(0, 2)) !== null) throw new Error('a chronicle of the second order alone must carry no founding mark')
  console.log('ok  no founding mark when every Faxing is of the second order')
  if (foundingBoundary(chronicle.slice(2)) !== null) throw new Error('a chronicle of the first order alone must carry no founding mark')
  console.log('ok  no founding mark when every Faxing is of the first order')
  // Guards the midnight edge: a Faxing filed at noon on the founding day is of the second order.
  if (foundingBoundary([{ id: 'stiftelsesdagen', date: SECOND_ORDER_FOUNDED }, { id: 'gammel', date: day(2022, 10, 29) }]) !== 'gammel') throw new Error('the founding day itself must sit on the second order\'s side of the mark')
  console.log('ok  the founding day itself is of the second order')

  // Guards the line order itself, whatever the data.
  const order = successionLines([]).map(line => line.crown).join(',')
  if (order !== CROWN_ORDER.join(',')) throw new Error(`lines out of order: ${order}`)
  console.log('ok  the lines stay in king, queen, monarch order')
}

demo()
