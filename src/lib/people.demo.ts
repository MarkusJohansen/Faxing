/**
 * Runnable check of which chronicle entries are one person. No framework:  npm run check:rules
 * Each assertion names the silent failure it guards.
 */
import { countPeople, personKey, renamed } from './people.ts'

const entry = (name: string, personId?: string) => ({ name, personId })

function demo() {
  // Guards against a case typo splitting one person in two.
  if (personKey(entry('Sivert vårum')) !== personKey(entry(' Sivert  Vårum '))) throw new Error('case and spacing must not split a person')
  console.log('ok  a case typo is the same person')

  // Guards against the link being lost: a first name with a personId must meet its full name.
  if (personKey(entry('Arne', 'arne hildrum')) !== personKey(entry('Arne Hildrum'))) throw new Error('an alias must meet its full name')
  console.log('ok  a linked first name is the full name')

  // Guards against guessing: an unlinked first name shares a first name with others and stays alone.
  const alone = countPeople([{ contestants: [entry('Henrik'), entry('Henrik Moe'), entry('Henrik Jung')] }])
  if (alone !== 3) throw new Error(`an unlinked first name must stay its own person, counted ${alone}`)
  console.log('ok  an unlinked first name is not guessed')

  // Guards against a stale link: a renamed entry must not keep pointing at its old person.
  const moved = renamed(entry('Arne', 'arne hildrum'), 'Ådne')
  if (personKey(moved) !== 'ådne') throw new Error('a renamed entry must drop its link')
  console.log('ok  a rename drops the link')

  const merged = countPeople([{ contestants: [entry('Arne', 'arne hildrum')] }, { contestants: [entry('Arne Hildrum')] }])
  if (merged !== 1) throw new Error(`two entries of one person must count once, counted ${merged}`)
  console.log('ok  the count follows the person, not the name')
}
demo()
