import type { PriceList } from './pricing/priceList.js'

export type OrderLine = { style: string; color: string; qty: number }
export type Order = { lines: OrderLine[] }
export type PricedLine = OrderLine & { unitCents: number; cents: number }
export type PricedOrder = { lines: PricedLine[]; totalCents: number }

// The bracket is judged per style across the whole order (Tuesday, rule 1 and rule 2).
export function priceOrder(order: Order, prices: PriceList): PricedOrder {
  const qtyByStyle: Record<string, number> = {}
  for (const l of order.lines) qtyByStyle[l.style] = (qtyByStyle[l.style] ?? 0) + l.qty
  const lines = order.lines.map(l => {
    const row = prices[l.style]
    if (!row) throw new Error(`Unknown style ${l.style}`)
    const unitCents = qtyByStyle[l.style] >= row.bracketAt ? row.bracketCents : row.listCents
    return { ...l, unitCents, cents: unitCents * l.qty }
  })
  return { lines, totalCents: lines.reduce((s, l) => s + l.cents, 0) }
}
