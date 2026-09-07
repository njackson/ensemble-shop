import { test, expect } from 'vitest'
import { runningShop } from './shop.js'

// Slices 2 and 3 of checkout (docs/refinement/checkout-slices.md), in Tuesday's words.
const fortySevenShirts = {
  customer: 'ana@example.com',
  lines: [{ style: 'BC3001', color: 'red', qty: 20 }, { style: 'BC3001', color: 'blue', qty: 27 }],
}

test('with bracket pricing released, 47 BC3001 shirts across two colors bill at $610.53', async () => {
  const shop = await runningShop({ flags: { bracketPricing: true } })
  try {
    const order = await (await shop.post('/orders', fortySevenShirts)).json()
    expect(order.lines.map((l: { unitCents: number }) => l.unitCents)).toEqual([1299, 1299])
    expect(order.totalCents).toBe(61053)
  } finally {
    await shop.close()
  }
})

test('with the flag off, the same deploy charges list price: what the shop did before Monday', async () => {
  const shop = await runningShop({ flags: { bracketPricing: false } })
  try {
    const order = await (await shop.post('/orders', fortySevenShirts)).json()
    expect(order.totalCents).toBe(47 * 1450)
  } finally {
    await shop.close()
  }
})

test('a customer can read their order back by id, with its status', async () => {
  const shop = await runningShop({ flags: { bracketPricing: true } })
  try {
    const placed = await (await shop.post('/orders', fortySevenShirts)).json()
    const res = await shop.get(`/orders/${placed.id}`)
    expect(res.status).toBe(200)
    const order = await res.json()
    expect(order.status).toBe('placed')
    expect(order.totalCents).toBe(61053)
    expect((await shop.get('/orders/999999')).status).toBe(404)
  } finally {
    await shop.close()
  }
})
