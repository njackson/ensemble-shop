import { describe, it, expect } from 'vitest'
import { checkReply } from '../../src/support/guardrails.js'

const evidence = { cents: [61053, 1299], customerOrderIds: ['1001', '1003'] }

describe('the guardrails', () => {
  it('pass a reply whose numbers all came from a tool', () => {
    expect(checkReply('Order 1001 came to $610.53, $12.99 each.', evidence)).toEqual({ ok: true, violations: [] })
  })
  it('block an invented amount', () => {
    const v = checkReply('That would be about $600.00.', evidence)
    expect(v.ok).toBe(false)
    expect(v.violations).toEqual(['invented amount $600.00'])
  })
  it('block a promised window', () => {
    expect(checkReply("You'll have it within 5 business days.", evidence).violations[0]).toMatch(/promised a window/)
  })
  it("block another customer's order id", () => {
    expect(checkReply('Order 1004 shipped on Thursday.', evidence).violations[0]).toBe("order 1004 is not this customer's")
  })
})
