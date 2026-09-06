import { test } from 'vitest'
import { scenario } from './helpers.js'

// OUTER — written first, in the words agreed on Tuesday. Red until the slice is done.
// It moved out of pending/ the moment it went green. It has not been edited.
test('an order of 47 BC3001 shirts across two colors bills at the bracket price: $610.53', async () => {
  const { given, when, then } = scenario()
  await given.productInCatalog({ style: 'BC3001', list: 1450, bracketAt: 36, bracketPrice: 1299 })
  await when.customerOrders({ lines: [
    { style: 'BC3001', color: 'red',  qty: 20 },
    { style: 'BC3001', color: 'blue', qty: 27 },
  ] })
  await then.lineTotals({ perUnit: 1299, total: 61053 })
})
