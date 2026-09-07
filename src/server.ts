import { createServer as httpServer, type IncomingMessage, type ServerResponse } from 'node:http'
import type { Order } from './orders.js'
import type { OrderStore } from './store.js'

// The walking skeleton (Module 03): the thinnest path that goes all the way through and is real.
// POST an order, get an id back. It prices nothing yet. That is the point of a skeleton: it proves
// the pipes connect before any of the pipes carry anything.
export type ShopDeps = { store: OrderStore }

export function createShop({ store }: ShopDeps) {
  return httpServer(async (req, res) => {
    try {
      if (req.method === 'POST' && req.url === '/orders') return placeOrder(req, res, store)
      if (req.method === 'GET' && req.url === '/health') return json(res, 200, { ok: true })
      json(res, 404, { error: 'not found' })
    } catch (e) {
      json(res, 500, { error: (e as Error).message })
    }
  })
}

async function placeOrder(req: IncomingMessage, res: ServerResponse, store: OrderStore) {
  const body = JSON.parse(await text(req)) as { customer: string; lines: Order['lines'] }
  const stored = store.put({
    customer: body.customer,
    lines: body.lines.map(l => ({ ...l, unitCents: 0, cents: 0 })),
    totalCents: 0,
    placedAt: new Date().toISOString(),
    status: 'placed',
  })
  json(res, 201, stored)
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
