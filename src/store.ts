import type { PricedOrder } from './orders.js'

// Where placed orders live. In production a database; here, memory. Same shape either way, so the
// server, the support agent and the tests all talk to the same interface.
export type StoredOrder = PricedOrder & { id: string; customer: string; placedAt: string; status: OrderStatus }
export type OrderStatus = 'placed' | 'shipped' | 'delivered'

export interface OrderStore {
  put(order: Omit<StoredOrder, 'id'>): StoredOrder
  get(id: string): StoredOrder | undefined
  byCustomer(customer: string): StoredOrder[]
}

export function memoryStore(seed: StoredOrder[] = []): OrderStore {
  const orders = new Map(seed.map(o => [o.id, o]))
  let next = 1000 + seed.length
  return {
    put(order) {
      const stored = { ...order, id: String(++next) }
      orders.set(stored.id, stored)
      return stored
    },
    get: id => orders.get(id),
    byCustomer: customer => [...orders.values()].filter(o => o.customer === customer),
  }
}
