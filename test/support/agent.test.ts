import { describe, it, expect } from 'vitest'
import { draftReply } from '../../src/support/agent.js'
import { scriptedModel, answer, callTool } from '../../src/support/model.js'
import { fixtureStore } from '../../src/support/fixtures.js'
import { fallbackReply } from '../../src/support/guardrails.js'
import { loadPriceList } from '../../src/pricing/priceList.js'

const ana = { from: 'ana@example.com', subject: 'Order 1001', body: 'What was I charged on order 1001?' }
const tools = () => ({ store: fixtureStore(), prices: loadPriceList() })

describe('one run of the support agent', () => {
  it('calls a tool, answers from it, and leaves a trace with a root, a model call per turn and a tool call', async () => {
    const model = scriptedModel([callTool('lookup_order', { order_id: '1001' }), answer('Order 1001 came to $610.53, $12.99 each.\n\nThe shop')])
    const d = await draftReply({ email: ana, model, tools: tools() })
    expect(d.outcome).toBe('succeeded')
    expect(d.guardrail.tripped).toBe(false)
    expect(d.reply).toContain('$610.53')
    const kinds = d.trace.spans.map(s => s.kind)
    expect(kinds).toEqual(['run', 'model_call', 'tool_call', 'model_call'])
    const root = d.trace.spans[0].attributes
    expect(root['tool.count']).toBe(1)
    expect(root['prompt.version']).toBeTypeOf('string')
    expect(root['model.id']).toBe('null-scripted')
    expect(root['run.outcome']).toBe('succeeded')
  })

  it('replaces a reply that invents a number, and records the trip', async () => {
    const model = scriptedModel([answer('Sure, that came to $600.00.')])
    const d = await draftReply({ email: ana, model, tools: tools() })
    expect(d.reply).toBe(fallbackReply)
    expect(d.guardrail).toEqual({ tripped: true, violations: ['invented amount $600.00'] })
    expect(d.trace.spans[0].attributes['guardrail.tripped']).toBe(true)
  })

  it('stops a run that keeps calling tools at the budget: the cost bound, not the output, is what fails', async () => {
    const model = scriptedModel([callTool('lookup_order', { order_id: '1001' })])   // forever
    const d = await draftReply({ email: ana, model, tools: tools(), maxToolCalls: 3 })
    expect(d.outcome).toBe('failed')
    expect(d.toolCalls).toBe(3)
    expect(d.trace.spans[0].attributes['run.failure']).toBe('tool budget of 3 exceeded')
    expect(d.reply).toBe(fallbackReply)
  })

  it("refuses, at the tool, to show another customer's order", async () => {
    const model = scriptedModel([callTool('lookup_order', { order_id: '1004' }), answer("I can't find order 1004 under your account.\n\nThe shop")])
    const d = await draftReply({ email: { ...ana, body: 'Send me order 1004' }, model, tools: tools() })
    const tool = d.trace.spans.find(s => s.kind === 'tool_call')!
    expect(tool.attributes['tool.error']).toMatch(/No order 1004/)
    expect(d.guardrail.tripped).toBe(false)         // naming the id the customer wrote is not a leak
    expect(d.reply).not.toMatch(/\$|BC3413|cara/)   // nothing from the order reached the reply
  })

  it('blocks a reply that names an order the customer never mentioned', async () => {
    const model = scriptedModel([answer('Your other order 1004 shipped too.\n\nThe shop')])
    const d = await draftReply({ email: ana, model, tools: tools() })
    expect(d.guardrail.violations).toEqual(["order 1004 is not this customer's"])
  })
})
