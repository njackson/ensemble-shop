import type { PriceList } from './priceList.js'

export type Line = { code: string; qty: number }

// Prices one order line, in cents. Nobody is sure this is right, and nobody wants to find out by
// changing it. It has been this way since the bracket pricing went in.
//
// The price list is now handed in (the seam). Production passes priceListFromDb(); a test can pass
// the real list read from data/prices.json — real enough to be wrong.
export function priceLine(line: Line, prices: PriceList): number {
  const row = prices[line.code]
  if (!row) throw new Error(`Unknown style ${line.code}`)

  let unit = row.listCents
  if (line.qty >= row.bracketAt) unit = row.bracketCents   // bracket applied PER LINE (see Monday)

  return unit * line.qty
}
