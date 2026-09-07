import { describe, it, expect } from 'vitest'
import { runTool } from '../../src/support/tools.js'
import { fixtureStore } from '../../src/support/fixtures.js'
import { loadPriceList } from '../../src/pricing/priceList.js'

describe('the order tool', () => {
  it('carries the bracket rule as data: units per style across the order, and the price each line got', () => {
    const r = runTool('lookup_order', { order_id: '1001' }, { store: fixtureStore(), prices: loadPriceList(), customer: 'ana@example.com' })
    expect(r.units_by_style).toEqual({ BC3001: 47 })
    expect((r.lines as Array<{ priced_at: string }>).map(l => l.priced_at)).toEqual(['bracket price', 'bracket price'])
    expect(r.bracket_rule).toMatch(/whole order/)
  })
  it("refuses another customer's order", () => {
    const r = runTool('lookup_order', { order_id: '1004' }, { store: fixtureStore(), prices: loadPriceList(), customer: 'ana@example.com' })
    expect(r).toEqual({ error: 'No order 1004 for this customer' })
  })
})
