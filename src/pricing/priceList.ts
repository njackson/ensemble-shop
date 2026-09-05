import { readFileSync } from 'node:fs'
import { connect, type PriceRow } from '../db.js'

export type PriceList = Record<string, PriceRow>

// The real price list, read from its real file. Not a stub: it can be wrong, which is the point.
export function loadPriceList(path = new URL('../../data/prices.json', import.meta.url)): PriceList {
  return JSON.parse(readFileSync(path, 'utf8'))
}

// What production hands priceLine: the same shape, backed by the database.
export function priceListFromDb(): PriceList {
  const db = connect()
  return new Proxy({}, { get: (_, code: string) => db.price(code) }) as PriceList
}
