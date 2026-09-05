import { priceLine } from './pricing/priceLine.js'
import type { PriceList } from './pricing/priceList.js'

export type OrderLine = { style: string; color: string; qty: number }
export type Order = { lines: OrderLine[] }
export type PricedLine = OrderLine & { unitCents: number; cents: number }
export type PricedOrder = { lines: PricedLine[]; totalCents: number }

// Monday's implementation: each line priced on its own. This is what the outer test is red against.
export function priceOrder(order: Order, prices: PriceList): PricedOrder {
  const lines = order.lines.map(l => {
    const cents = priceLine({ code: l.style, qty: l.qty }, prices)
    return { ...l, unitCents: Math.round(cents / l.qty), cents }
  })
  return { lines, totalCents: lines.reduce((s, l) => s + l.cents, 0) }
}
