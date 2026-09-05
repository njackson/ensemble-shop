import { expect } from 'vitest'
import { priceOrder, type Order, type PricedOrder } from '../../src/orders.js'
import { loadPriceList, type PriceList } from '../../src/pricing/priceList.js'

// The step helpers. The team writes these; the agent implementing a slice may not edit them.
// They are the only thing between the sentence in the test title and the code.
export function scenario() {
  const prices: PriceList = loadPriceList()
  let result: PricedOrder | undefined
  return {
    given: {
      async productInCatalog(p: { style: string; list: number; bracketAt: number; bracketPrice: number }) {
        prices[p.style] = { name: p.style, listCents: p.list, bracketAt: p.bracketAt, bracketCents: p.bracketPrice }
      },
    },
    when: {
      async customerOrders(order: Order) { result = priceOrder(order, prices) },
    },
    then: {
      async lineTotals(t: { perUnit: number; total: number }) {
        if (!result) throw new Error('no order was placed')
        for (const l of result.lines) expect(l.unitCents, `unit price on ${l.color}`).toBe(t.perUnit)
        expect(result.totalCents, 'order total').toBe(t.total)
      },
    },
  }
}
