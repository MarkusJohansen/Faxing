/**
 * Runnable check of the lobby's name suggestions. No framework:  npm run check:rules
 * Each assertion names the silent failure it guards.
 */
import type { ArchivedContestant, FaxingEvent, Gender } from '../types'
import { peopleOf, suggest } from './suggest.ts'

const entry = (name: string, gender: Gender = 'male', personId?: string): ArchivedContestant =>
  ({ id: name, name, gender, finishedAt: null, disqualified: false, title: null, elapsed: null, personId })

const faxing = (date: number, contestants: ArchivedContestant[]): FaxingEvent =>
  ({ id: String(date), name: 'Faxing', date, official: true, contestants })

const events = [
  faxing(1, [entry('Arne', 'male', 'arne hildrum'), entry('Sivert Vårum'), entry('Kasper Lie Nordbø'), entry('Kasper Schaug-Pettersen')]),
  faxing(2, [entry('Arne Hildrum'), entry('Sivert vårum')]),
  faxing(3, [entry('Arne Hildrum')]),
]
const people = peopleOf(events)
const names = (typed: string, inRoom: string[] = []) => suggest(typed, people, inRoom).map(s => s.name)

function expect(label: string, actual: unknown, expected: unknown) {
  if (JSON.stringify(actual) !== JSON.stringify(expected)) throw new Error(`${label}: expected ${JSON.stringify(expected)}, was ${JSON.stringify(actual)}`)
  console.log(`ok  ${label}`)
}

function demo() {
  // Guards against one person filling the list three times over: the list is people, not entries.
  expect('a person attending three times is one person', people.filter(p => p.name.startsWith('Arne')).length, 1)
  expect('and appears under the full name', names('arn'), ['Arne Hildrum'])

  // Guards against a missing æøå on a phone keyboard hiding the person who is plainly there.
  expect('a typo and a missing å still find the person', names('Sivert Varum'), ['Sivert Vårum'])

  // Guards against the list picking for the person: two Kaspers are both offered.
  expect('two people sharing a first name are both offered', names('Kasper').sort(), ['Kasper Lie Nordbø', 'Kasper Schaug-Pettersen'])

  // Guards against offering a name back to someone who has already typed all of it.
  expect('the exact name is not offered back', names('Arne Hildrum'), [])

  // Guards against a four-letter name matching its near neighbours.
  const blur = peopleOf([faxing(9, [entry('Ådne Svendstrud'), entry('Anne Nilsen'), entry('Are Tømmerås'), entry('Arne Hildrum')])])
  expect('a four-letter name is not blurred into its neighbours', suggest('Arne', blur, []).map(s => s.name), ['Arne Hildrum'])

  // Guards against a one-letter word matching half the chronicle.
  expect('one character suggests nothing', names('a'), [])

  // Guards against a room admitting the same name twice.
  expect('a name already in the room is marked taken', suggest('Arne', people, ['arne hildrum']).map(s => s.taken), [true])

  // Guards against offering a first name as the person: with no full-name entry, the canonical name is shown.
  const linked = peopleOf([faxing(1, [entry('Markus', 'male', 'markus johansen')])], ['Markus Johansen'])
  expect('a linked first name is offered under the full canonical name', linked[0].name, 'Markus Johansen')

  // Guards against a stale gender: the latest recorded one is the one offered.
  const changed = peopleOf([faxing(1, [entry('Robin', 'male')]), faxing(2, [entry('Robin', 'female')])])
  expect('the latest recorded gender is offered', changed[0].gender, 'female')
}
demo()
