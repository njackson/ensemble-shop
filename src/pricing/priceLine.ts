import type { PriceList } from './priceList.js'
import { bracketUnitPrice } from './bracket.js'

export type Line = { code: string; qty: number }

// Prices one line on its own. Kept for callers that price a single line; orders go through priceOrder,
// which judges the bracket across the whole order. The price list is handed in (the seam).
export function priceLine(line: Line, prices: PriceList): number {
  const row = prices[line.code]
  if (!row) throw new Error(`Unknown style ${line.code}`)
  return bracketUnitPrice(row, line.qty) * line.qty
}
