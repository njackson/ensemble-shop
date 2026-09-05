import { connect } from '../db.js'

export type Line = { code: string; qty: number }

// Prices one order line, in cents. Nobody is sure this is right, and nobody wants to find out by
// changing it. It has been this way since the bracket pricing went in.
export function priceLine(line: Line): number {
  const db = connect()                       // reaches for the database: no seam
  const row = db.price(line.code)
  if (!row) throw new Error(`Unknown style ${line.code}`)

  let unit = row.listCents
  if (line.qty >= row.bracketAt) unit = row.bracketCents   // bracket applied PER LINE (see Monday)

  let total = unit * line.qty
  if (line.qty > 36) total += 189             // carton handling, added 2019 — nobody remembers by whom
  return total
}
