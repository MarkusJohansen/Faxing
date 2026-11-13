/**
 * Runnable check of the titling rules. No framework:  npm run check:rules
 * Each assertion names the silent failure it guards.
 */
import { rankContestants } from './ranking.ts'
import type { Contestant, Gender } from '../types'

const MINUTE = 60_000
const HOUR = 60 * MINUTE
const START = 1_000_000

const person = (name: string, gender: Gender, finishedAtMinute: number | null, disqualified = false): Contestant => ({
  id: name,
  name,
  gender,
  finishedAt: finishedAtMinute === null ? null : START + finishedAtMinute * MINUTE,
  disqualified,
})

function expectTitles(label: string, roster: Contestant[], nowMinute: number, expected: Record<string, string | null>) {
  const actual = Object.fromEntries(rankContestants(roster, START, START + nowMinute * MINUTE, HOUR).map(c => [c.name, c.title]))
  for (const [name, title] of Object.entries(expected)) {
    if (actual[name] !== title) throw new Error(`${label}: ${name} should be ${title}, was ${actual[name]}`)
  }
  console.log(`ok  ${label}`)
}

function demo() {
  expectTitles('first of each gender is crowned, the rest are knights',
    [person('Kari', 'female', 6), person('Ola', 'male', 4), person('Per', 'male', 9), person('Kim', 'other', 12)], 30,
    { Ola: 'Faxekonge', Kari: 'Faxedronning', Per: 'Faxeridder', Kim: 'Faxemonark' })

  expectTitles('still drinking inside the hour has no title',
    [person('Ola', 'male', null)], 59, { Ola: null })

  expectTitles('unfinished at expiry is a horseman',
    [person('Ola', 'male', null)], 60, { Ola: 'Hestemann' })

  // Guards D1: a tap after the hour used to promote a horseman to a knight.
  expectTitles('a finish after the hour earns no title',
    [person('Ola', 'male', 4), person('Per', 'male', 61)], 62, { Ola: 'Faxekonge', Per: 'Hestemann' })

  // Guards D1: a late tap used to claim a crown nobody won in time.
  expectTitles('a late finish cannot claim a vacant crown',
    [person('Per', 'male', 61)], 62, { Per: 'Hestemann' })

  // Guards branch order: a forfeit must not consume the crown.
  expectTitles('a forfeit does not consume a crown',
    [person('Ola', 'male', 3, true), person('Per', 'male', 5)], 30, { Ola: 'Hestemann', Per: 'Faxekonge' })

  const order = rankContestants([person('Sen', 'male', 61), person('Per', 'male', 9), person('Ola', 'male', 4)], START, START + 62 * MINUTE, HOUR).map(c => c.name)
  // Guards the hall's order: a late finisher sorted among real finishers would take a rank.
  if (order.join() !== 'Ola,Per,Sen') throw new Error(`order: expected Ola,Per,Sen, was ${order.join()}`)
  console.log('ok  finishers in time come first, by finish instant')
}

demo()
