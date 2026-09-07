import { createServer as httpServer, type IncomingMessage, type ServerResponse } from 'node:http'
import { priceOrder, type Order, type PricedOrder } from './orders.js'
import { loadPriceList, type PriceList } from './pricing/priceList.js'
import { defaultFlags, type Flags } from './flags.js'
import type { OrderStore } from './store.js'

// The shop over HTTP. Three routes, one per slice in docs/refinement/checkout-slices.md:
//   POST /orders      — the walking skeleton, then priced (slice 2, behind the flag)
//   GET  /orders/:id  — read it back (slice 3)
//   GET  /health
export type ShopDeps = { store: OrderStore; prices?: PriceList; flags?: Flags }

export function createShop({ store, prices = loadPriceList(), flags = defaultFlags }: ShopDeps) {
  return httpServer(async (req, res) => {
    try {
      const url = req.url ?? '/'
      if (req.method === 'POST' && url === '/orders') return placeOrder(req, res, { store, prices, flags })
      if (req.method === 'GET' && url.startsWith('/orders/')) return readOrder(url.slice('/orders/'.length), res, store)
      if (req.method === 'GET' && url === '/health') return json(res, 200, { ok: true, flags })
      json(res, 404, { error: 'not found' })
    } catch (e) {
      json(res, 500, { error: (e as Error).message })
    }
  })
}

async function placeOrder(req: IncomingMessage, res: ServerResponse, d: Required<ShopDeps>) {
  const body = JSON.parse(await text(req)) as { customer: string; lines: Order['lines'] }
  const order: Order = { lines: body.lines }
  // Flag off: every unit at list price, which is what the shop charged before Monday. Flag on: the
  // bracket rule, judged per style across the order — the fix, released separately from its deploy.
  const priced: PricedOrder = d.flags.bracketPricing ? priceOrder(order, d.prices) : atList(order, d.prices)
  const stored = d.store.put({ ...priced, customer: body.customer, placedAt: new Date().toISOString(), status: 'placed' })
  json(res, 201, stored)
}

function atList(order: Order, prices: PriceList): PricedOrder {
  const lines = order.lines.map(l => {
    const row = prices[l.style]
    if (!row) throw new Error(`Unknown style ${l.style}`)
    return { ...l, unitCents: row.listCents, cents: row.listCents * l.qty }
  })
  return { lines, totalCents: lines.reduce((s, l) => s + l.cents, 0) }
}

function readOrder(id: string, res: ServerResponse, store: OrderStore) {
  const order = store.get(id)
  if (!order) return json(res, 404, { error: `no order ${id}` })
  json(res, 200, order)
}

function text(req: IncomingMessage): Promise<string> {
  return new Promise((resolve, reject) => {
    let s = ''
    req.on('data', (c: Buffer) => (s += c))
    req.on('end', () => resolve(s))
    req.on('error', reject)
  })
}

export function json(res: ServerResponse, status: number, body: unknown) {
  res.writeHead(status, { 'content-type': 'application/json' })
  res.end(JSON.stringify(body))
}
