import { readFileSync, readdirSync } from 'node:fs'
import { join } from 'node:path'
import { memoryStore, type StoredOrder } from '../store.js'
import type { Email } from './agent.js'

// A fixture is a real-shaped situation, saved: the email, whose it is, and what a good reply must and
// must not contain. `mustMention` and `mustAvoid` are regular expressions the judge applies; the
// rubric in fixtures/support/rubric.md says what they stand for.
export type Fixture = {
  id: string
  email: Email
  mustMention: string[]
  mustAvoid: string[]
  note?: string
}

export const fixturesDir = new URL('../../fixtures/support/', import.meta.url).pathname

export function loadFixtures(dir = fixturesDir): Fixture[] {
  return readdirSync(dir)
    .filter(f => f.endsWith('.json') && f !== 'orders.json')
    .sort()
    .map(f => JSON.parse(readFileSync(join(dir, f), 'utf8')) as Fixture)
}

// The orders the fixtures refer to, in the same store the server uses.
export function fixtureStore(dir = fixturesDir) {
  const orders = JSON.parse(readFileSync(join(dir, 'orders.json'), 'utf8')) as StoredOrder[]
  return memoryStore(orders)
}
