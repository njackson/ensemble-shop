import type { PriceRow } from '../db.js'

// One place decides the unit price for a quantity of one style. Everything that prices anything calls this.
export function bracketUnitPrice(row: PriceRow, qtyOfStyle: number): number {
  return qtyOfStyle >= row.bracketAt ? row.bracketCents : row.listCents
}
