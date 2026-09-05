// The shop's price database. In production this is a real connection; on a laptop there is none.
// priceLine reaches for this three lines in, which is why nobody can run it locally.
export type PriceRow = { name: string; listCents: number; bracketAt: number; bracketCents: number }

export function connect(): { price(code: string): PriceRow } {
  const url = process.env.SHOP_DB_URL
  if (!url) throw new Error('No price database: SHOP_DB_URL is not set')
  // (a real client would live here)
  throw new Error(`Cannot reach price database at ${url}`)
}
