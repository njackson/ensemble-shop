import { describe, it, expect } from 'vitest'
import { priceLine } from '../../src/pricing/priceLine.js'
import { loadPriceList } from '../../src/pricing/priceList.js'

// Characterization: what priceLine does TODAY, bugs included. A record, not a judgement.
// Every expected value below was pasted from a failure message, not worked out.
const prices = loadPriceList()

describe('priceLine, as it is', () => {
  it('47 × BC3001', () => {
    // Was 61242: a $1.89 carton fee from 2019 that Priya confirmed was retired in 2021.
    // Changed on purpose, in this commit, and nowhere else.
    expect(priceLine({ code: 'BC3001', qty: 47 }, prices)).toBe(61053)
  })
  it('1 × BC3001', () => { expect(priceLine({ code: 'BC3001', qty: 1 }, prices)).toBe(1450) })
  it('12 × BC3001', () => { expect(priceLine({ code: 'BC3001', qty: 12 }, prices)).toBe(17400) })
  it('36 × BC3001 — at the bracket', () => { expect(priceLine({ code: 'BC3001', qty: 36 }, prices)).toBe(46764) })
  it('37 × BC3001 — no fee any more', () => { expect(priceLine({ code: 'BC3001', qty: 37 }, prices)).toBe(48063) })
  it('unknown style throws', () => { expect(() => priceLine({ code: 'NOPE', qty: 1 }, prices)).toThrow() })
})
