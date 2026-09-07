import { test, expect } from 'vitest'
import { draftReply } from '../../src/support/agent.js'
import { noisyNullModel } from '../../src/support/null-model.js'
import { loadFixtures, fixtureStore } from '../../src/support/fixtures.js'
import { loadPriceList } from '../../src/pricing/priceList.js'

// OUTER, in the words of the ticket: "the support agent answers the bracket question from the order,
// and never says a number the order did not." With the null model at wobble 0 — the model behaving —
// so what this test checks is the loop, the tools, the guardrail and the trace, not the model.
test('a customer asking what they were charged for 47 shirts is told $610.53, and nothing the tools did not say', async () => {
  const fixture = loadFixtures().find(f => f.id === 'bracket-charge')!
  const d = await draftReply({ email: fixture.email, model: noisyNullModel({ wobble: 0 }), tools: { store: fixtureStore(), prices: loadPriceList() } })
  expect(d.reply).toContain('$610.53')
  expect(d.reply).toContain('$12.99')
  expect(d.reply).toContain('bracket price')
  expect(d.reply).not.toContain('discount')
  expect(d.guardrail.tripped).toBe(false)
  expect(d.toolCalls).toBe(1)
})
