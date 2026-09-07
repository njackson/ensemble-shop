import { test, expect } from 'vitest'
import { runningShop } from './shop.js'

// The skeleton's one test (Module 03): a customer can place an order and get an id back. It asserts
// nothing about prices, because the skeleton prices nothing. Its job is to prove the pipes connect.
test('a customer can place an order and get an order id back', async () => {
  const shop = await runningShop()
  try {
    const res = await shop.post('/orders', { customer: 'ana@example.com', lines: [{ style: 'BC3001', color: 'red', qty: 12 }] })
    expect(res.status).toBe(201)
    const order = await res.json()
    expect(order.id).toMatch(/^\d+$/)
    expect(shop.store.get(order.id)?.customer).toBe('ana@example.com')
  } finally {
    await shop.close()
  }
})
