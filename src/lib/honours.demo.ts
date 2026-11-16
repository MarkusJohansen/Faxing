/**
 * Runnable check of who carries an honour. No framework:  npm run check:rules
 * Each assertion names the silent failure it guards. The names here are made up; the lore's people
 * are in src/data/people.json, and the checks about them read whatever it holds.
 */
import record from '../data/people.json' with { type: 'json' }
import type { ArchivedContestant, FaxingEvent, RecordedTitle } from '../types'
import { honoursOf } from './honours.ts'
import { personKey } from './people.ts'

const entry = (name: string, title: RecordedTitle | null): ArchivedContestant =>
  ({ id: name, name, gender: 'male', finishedAt: null, disqualified: false, title, elapsed: null })

const faxing = (contestants: ArchivedContestant[], official = true): FaxingEvent =>
  ({ id: 'f', name: 'Faxing', date: 1, official, contestants, status: 'published' })

// The lore's people and the aliases, taken from the data file.
const lore = Object.entries(record.honours)
const saint = lore.find(([, honour]) => honour === 'saint')![0]
const pope = lore.find(([, honour]) => honour === 'pope')![0]
const honouredNames = new Set(Object.keys(record.honours))
const [crownAlias, crownFull] = Object.entries(record.aliases).find(([, full]) => !honouredNames.has(full))!
const saintAlias = Object.entries(record.aliases).find(([, full]) => record.honours[full as keyof typeof record.honours] === 'saint')?.[0]

const honours = honoursOf([
  faxing([entry('Hedda Hage', 'Faxekonge')], false),
  faxing([entry('Vera Vinner', 'Erkekonge'), entry(crownAlias, 'Faxekonge'), entry('Kåre Knekt', 'Faxeridder'), entry(saint, 'Faxekonge')]),
])
const of = (name: string) => honours.get(personKey({ name })) ?? null

function expect(label: string, actual: unknown, expected: unknown) {
  if (actual !== expected) throw new Error(`${label}: expected ${expected}, was ${actual}`)
  console.log(`ok  ${label}`)
}

function demo() {
  expect('an old Erkekonge is a champion', of('Vera Vinner'), 'champion')

  // Guards against a garden-party crown counting: only official Faxinger make a champion.
  expect('a crown from an unofficial Faxing is not a championship', of('Hedda Hage'), null)

  // Guards against a crown recorded under a first name losing its champion: the alias carries it.
  expect('a crown under an alias reaches the full name', of(crownFull), 'champion')

  // Guards against a knight being dressed as a champion: only crowns count.
  expect('a Faxeridder is nobody special', of('Kåre Knekt'), null)

  // Guards against the lore losing to the chronicle: the saint is shown over the champion.
  expect('a saint who was also crowned shows the saint', of(saint), 'saint')

  // Guards against a saint going unmarked because the old record wrote an alias of the name.
  if (saintAlias !== undefined) expect('an alias of a saint is the saint', of(saintAlias), 'saint')

  // Guards against calling someone a past champion on the night they won, or before: a crown only
  // counts for Faxinger held strictly after it was won. The pope and the saints hold on every page.
  const nights = [
    { ...faxing([entry('Vinnie Vinner', 'Faxekonge')]), id: 'a', date: 100 },
    { ...faxing([entry('Vinnie Vinner', null)]), id: 'b', date: 200 },
  ]
  const at = (before: number, name: string) => honoursOf(nights, before).get(personKey({ name })) ?? null
  expect('not a champion before the win', at(50, 'Vinnie Vinner'), null)
  expect('not a champion on the night of the win', at(100, 'Vinnie Vinner'), null)
  expect('a champion at a later Faxing', at(200, 'Vinnie Vinner'), 'champion')
  expect('a saint holds before any Faxing was held', at(0, saint), 'saint')
  expect('the pope holds on the earliest page too', at(0, pope), 'pope')

  expect('the pope needs no chronicle entry', of(pope), 'pope')
  expect('an unknown name has no honour', of('Per Ukjent'), null)
}
demo()
