/**
 * Runnable check of which crowns reign. No framework:  npm run check:rules
 * Each assertion names the silent failure it guards.
 */
import { reigningTribute } from './tribute.ts'
import type { FaxingEvent, RankedContestant, Title } from '../types'

const crowned = (name: string, title: Title | null): RankedContestant =>
  ({ id: name, name, gender: 'male', finishedAt: 1, disqualified: false, title, elapsed: 0 })

const faxing = (name: string, date: number, official: boolean, contestants: RankedContestant[]): FaxingEvent =>
  ({ id: name, name, date, official, contestants })

function expect(label: string, events: FaxingEvent[], expected: string | null) {
  const tribute = reigningTribute(events)
  const actual = tribute === null ? null : `${tribute.event.name}: ${tribute.crowns.map(c => `${c.title} ${c.name}`).join(', ')}`
  if (actual !== expected) throw new Error(`${label}: expected ${expected}, was ${actual}`)
  console.log(`ok  ${label}`)
}

function demo() {
  expect('no Faxinger, no tribute', [], null)

  // Guards against honouring a garden party: only official Faxinger hand out crowns that reign.
  expect('a later unofficial Faxing does not unseat the crowns',
    [faxing('Hagefest', 300, false, [crowned('Per', 'Faxekonge')]), faxing('Sommer', 200, true, [crowned('Ola', 'Faxekonge')])],
    'Sommer: Faxekonge Ola')

  // Guards against trusting list order: the chronicle may arrive in any order.
  expect('the latest official Faxing reigns, whatever the list order',
    [faxing('Vår', 100, true, [crowned('Per', 'Faxekonge')]), faxing('Sommer', 200, true, [crowned('Ola', 'Faxekonge')])],
    'Sommer: Faxekonge Ola')

  expect('crowns in fixed order; knights and horsemen left out',
    [faxing('Sommer', 200, true, [crowned('Kim', 'Faxemonark'), crowned('Rolf', 'Faxeridder'), crowned('Kari', 'Faxedronning'), crowned('Sen', 'Hestemann'), crowned('Ola', 'Faxekonge')])],
    'Sommer: Faxekonge Ola, Faxedronning Kari, Faxemonark Kim')

  // Guards against reaching back: a crown contested and lost must not reappear.
  expect('a latest official Faxing that crowned nobody means no tribute',
    [faxing('Høst', 300, true, [crowned('Sen', 'Hestemann')]), faxing('Sommer', 200, true, [crowned('Ola', 'Faxekonge')])],
    null)

  expect('a tie on date goes to the Faxing listed first',
    [faxing('Første', 200, true, [crowned('Ola', 'Faxekonge')]), faxing('Andre', 200, true, [crowned('Per', 'Faxekonge')])],
    'Første: Faxekonge Ola')
}

demo()
