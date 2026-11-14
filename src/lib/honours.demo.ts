/**
 * Runnable check of who carries an honour. No framework:  npm run check:rules
 * Each assertion names the silent failure it guards.
 */
import type { ArchivedContestant, FaxingEvent, RecordedTitle } from '../types'
import { honoursOf } from './honours.ts'
import { personKey } from './people.ts'

const entry = (name: string, title: RecordedTitle | null, personId?: string): ArchivedContestant =>
  ({ id: name, name, gender: 'male', finishedAt: null, disqualified: false, title, elapsed: null, personId })

const faxing = (contestants: ArchivedContestant[], official = true): FaxingEvent =>
  ({ id: 'f', name: 'Faxing', date: 1, official, contestants })

const honours = honoursOf([
  faxing([entry('Hage Hansen', 'Faxekonge')], false),
  faxing([entry('Scott Jennings', 'Erkekonge'), entry('Arne', 'Faxekonge', 'arne hildrum'), entry('Ola Vassbotn', 'Faxeridder'), entry('William Fagerstrøm', 'Faxekonge')]),
])
const of = (name: string, personId?: string) => honours.get(personKey({ name, personId })) ?? null

function expect(label: string, actual: unknown, expected: unknown) {
  if (actual !== expected) throw new Error(`${label}: expected ${expected}, was ${actual}`)
  console.log(`ok  ${label}`)
}

function demo() {
  expect('an old Erkekonge is a champion', of('Scott Jennings'), 'champion')

  // Guards against a garden-party crown counting: only official Faxinger make a champion.
  expect('a crown from an unofficial Faxing is not a championship', of('Hage Hansen'), null)

  // Guards against a crown recorded under a first name losing its king: the link carries it.
  expect('a crown under a linked first name reaches the full name', of('Arne Hildrum'), 'champion')

  // Guards against a knight being dressed as a champion: only crowns count.
  expect('a Faxeridder is nobody special', of('Ola Vassbotn'), null)

  // Guards against the lore losing to the chronicle: the saint is shown over the champion.
  expect('a saint who was also crowned shows the saint', of('William Fagerstrøm'), 'saint')

  // Guards against marking the wrong Markus: only the full name is a saint, and the chronicle's
  // bare "Markus" reaches him through the link, never by its spelling.
  expect('a bare Markus is not the saint', of('Markus'), null)
  expect('Markus Johansen is a saint', of('Markus Johansen'), 'saint')
  expect('a Markus linked to Markus Johansen is the saint', of('Markus', 'markus johansen'), 'saint')

  // Guards against St. Are going unmarked because the record spelled him "Tommerås".
  expect('Are Tommerås, linked to Are Tømmerås, is a saint', of('Are Tommerås', 'are tømmerås'), 'saint')

  expect('the Faxepave is a pope, with no chronicle entry', of('Gleb Rychkov'), 'pope')
  expect('an unknown name has no honour', of('Per Ukjent'), null)
}
demo()
