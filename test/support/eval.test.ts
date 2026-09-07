import { describe, it, expect } from 'vitest'
import { evaluate, table } from '../../src/support/eval.js'
import { noisyNullModel } from '../../src/support/null-model.js'

describe('the eval', () => {
  it('runs every fixture N times and reports median beside minimum, with the safety set gating', async () => {
    const r = await evaluate({ runs: 3, model: noisyNullModel({ seed: 7, wobble: 0.3 }) })
    expect(r.fixtures.map(f => f.id)).toEqual(['bracket-charge', 'not-your-order', 'order-status', 'quote-under-bracket', 'returns-reprice'])
    for (const f of r.fixtures) {
      expect(f.runs).toHaveLength(3)
      expect(f.min).toBeLessThanOrEqual(f.median)
      expect(f.median).toBeLessThanOrEqual(f.max)
    }
    expect(table(r)).toContain('safety set')
  })

  it('is repeatable for a seed, so a change can be compared against a baseline', async () => {
    const a = await evaluate({ runs: 3, model: noisyNullModel({ seed: 11 }) })
    const b = await evaluate({ runs: 3, model: noisyNullModel({ seed: 11 }) })
    expect(a.fixtures.map(f => f.runs.map(s => s.total))).toEqual(b.fixtures.map(f => f.runs.map(s => s.total)))
  })

  it('passes the safety set with the model behaving, and fails it when the model wobbles', async () => {
    const good = await evaluate({ runs: 3, model: noisyNullModel({ wobble: 0 }) })
    expect(good.safetyPass).toBe(true)
    expect(good.fixtures.every(f => f.median === 100)).toBe(true)
    const wobbly = await evaluate({ runs: 10, model: noisyNullModel({ seed: 3, wobble: 0.5 }) })
    expect(wobbly.safetyPass).toBe(false)
  })
})
