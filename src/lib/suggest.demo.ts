/**
 * Runnable check of the lobby's name suggestions. No framework:  npm run check:rules
 * Each assertion names the silent failure it guards. The names are made up; the real people are in
 * src/data/people.json, and the alias check reads whatever it holds.
 */
import record from '../data/people.json' with { type: 'json' }
import type { ArchivedContestant, FaxingEvent, Gender } from '../types'
import { peopleOf, suggest } from './suggest.ts'

const entry = (name: string, gender: Gender = 'male'): ArchivedContestant =>
  ({ id: name, name, gender, finishedAt: null, disqualified: false, title: null, elapsed: null })

const faxing = (date: number, contestants: ArchivedContestant[]): FaxingEvent =>
  ({ id: String(date), name: 'Faxing', date, official: true, contestants })

const events = [
  faxing(1, [entry('Tora Prøvesen'), entry('Åse Eksempel'), entry('Kira Lie Test'), entry('Kira Schaug-Test')]),
  faxing(2, [entry('tora prøvesen'), entry('åse eksempel')]),
  faxing(3, [entry('Tora Prøvesen')]),
]
const people = peopleOf(events)
const names = (typed: string, inRoom: string[] = []) => suggest(typed, people, inRoom).map(s => s.name)

function expect(label: string, actual: unknown, expected: unknown) {
  if (JSON.stringify(actual) !== JSON.stringify(expected)) throw new Error(`${label}: expected ${JSON.stringify(expected)}, was ${JSON.stringify(actual)}`)
  console.log(`ok  ${label}`)
}

function demo() {
  // Guards against one person filling the list three times over: the list is people, not entries.
  expect('a person attending three times is one person', people.filter(p => p.name.toLowerCase().startsWith('tora')).length, 1)
  expect('and appears under the spelling that is the person key', names('tor'), ['Tora Prøvesen'])

  // Guards against a missing æøå and a slipped letter hiding the person who is plainly there.
  expect('a typo and a missing å still find the person', names('Ase Eksemple'), ['Åse Eksempel'])

  // Guards against the list picking for the person: two Kiras are both offered.
  expect('two people sharing a first name are both offered', names('Kira').sort(), ['Kira Lie Test', 'Kira Schaug-Test'])

  // Guards against offering a name back to someone who has already typed all of it.
  expect('the exact name is not offered back', names('Tora Prøvesen'), [])

  // Guards against a four-letter name matching its near neighbours.
  const blur = peopleOf([faxing(9, [entry('Tara Test'), entry('Tore Test'), entry('Tori Test'), entry('Tora Prøvesen')])])
  expect('a four-letter name is not blurred into its neighbours', suggest('Tora', blur, []).map(s => s.name), ['Tora Prøvesen'])

  // Guards against a one-letter word matching half the chronicle.
  expect('one character suggests nothing', names('a'), [])

  // Guards against a room admitting the same name twice.
  expect('a name already in the room is marked taken', suggest('Tora', people, ['tora prøvesen']).map(s => s.taken), [true])

  // Guards against offering a first name as the person: an alias is offered under the full name
  // the data file gives, even when no entry spells it out.
  const [alias, full] = Object.entries(record.aliases)[0]
  const aliased = peopleOf([faxing(1, [entry(alias)])], [full])
  expect('an alias is offered under its full name', aliased[0].name, full)

  // Guards against a stale gender: the latest recorded one is the one offered.
  const changed = peopleOf([faxing(1, [entry('Robin', 'male')]), faxing(2, [entry('Robin', 'female')])])
  expect('the latest recorded gender is offered', changed[0].gender, 'female')
}
demo()
