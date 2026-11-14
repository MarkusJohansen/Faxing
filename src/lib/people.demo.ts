/**
 * Runnable check of which chronicle entries are one person. No framework:  npm run check:rules
 * Each assertion names the silent failure it guards. The names here are made up; the real people
 * are in src/data/people.json, and the alias checks read whatever it holds.
 */
import record from '../data/people.json' with { type: 'json' }
import { canonicalName, countPeople, personKey } from './people.ts'

const entry = (name: string) => ({ name })

function demo() {
  // Guards against a case typo splitting one person in two.
  if (personKey(entry('Eva Eksempel')) !== personKey(entry(' eva  EKSEMPEL '))) throw new Error('case and spacing must not split a person')
  console.log('ok  a case typo is the same person')

  // Guards against the alias record not being read: every alias in the data file must meet its
  // full name, however it is cased or spaced.
  for (const [alias, full] of Object.entries(record.aliases)) {
    if (personKey(entry(alias)) !== personKey(entry(full))) throw new Error(`"${alias}" must meet its full name`)
    if (personKey(entry(`  ${alias.toUpperCase()} `)) !== personKey(entry(full))) throw new Error(`"${alias}" is compared like a name, not as typed`)
  }
  console.log('ok  every alias in the data file is its full name')

  // Guards against a full name that no alias points at being swallowed: a name is only ever
  // merged into the person the data file says.
  const lone = 'Zzyzx Ingenting'
  if (personKey(entry(lone)) !== 'zzyzx ingenting' || canonicalName(` ${lone} `) !== lone) throw new Error('an unknown name must stay itself')
  console.log('ok  an unknown name is left alone')

  // Guards against guessing: first names nobody resolved share a first name with others and stay alone.
  const alone = countPeople([{ contestants: [entry('Qux'), entry('Qux Foo'), entry('Qux Bar')] }])
  if (alone !== 3) throw new Error(`an unresolved first name must stay its own person, counted ${alone}`)
  console.log('ok  an unresolved first name is not guessed')

  // Guards against the count following entries: one person under two spellings counts once.
  const [alias, full] = Object.entries(record.aliases)[0]
  const merged = countPeople([{ contestants: [entry(alias)] }, { contestants: [entry(full)] }])
  if (merged !== 1) throw new Error(`two entries of one person must count once, counted ${merged}`)
  console.log('ok  the count follows the person, not the name')
}
demo()
