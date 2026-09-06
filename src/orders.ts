import type { PriceList } from './pricing/priceList.js'
import { bracketUnitPrice } from './pricing/bracket.js'

export type OrderLine = { style: string; color: string; qty: number }
export type Order = { lines: OrderLine[] }
export type PricedLine = OrderLine & { unitCents: number; cents: number }
export type PricedOrder = { lines: PricedLine[]; totalCents: number }

// The one operation that sets an order's prices (VOCABULARY.md: repriceOrder). Nothing else may.
// The bracket is judged per style across the whole order.
export function priceOrder(order: Order, prices: PriceList): PricedOrder {
  const qtyByStyle = totalsByStyle(order)
  const lines = order.lines.map(l => {
    const row = prices[l.style]
    if (!row) throw new Error(`Unknown style ${l.style}`)
    const unitCents = bracketUnitPrice(row, qtyByStyle[l.style])
    return { ...l, unitCents, cents: unitCents * l.qty }
  })
  return { lines, totalCents: lines.reduce((s, l) => s + l.cents, 0) }
}

function totalsByStyle(order: Order): Record<string, number> {
  const out: Record<string, number> = {}
  for (const l of order.lines) out[l.style] = (out[l.style] ?? 0) + l.qty
  return out
}
