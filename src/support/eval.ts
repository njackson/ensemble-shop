import { loadFixtures, fixtureStore, type Fixture } from './fixtures.js'
import { draftReply, type Draft } from './agent.js'
import { score, type Score } from './judge.js'
import { loadPriceList } from '../pricing/priceList.js'
import { noisyNullModel } from './null-model.js'
import { anthropicModel, type Model } from './model.js'
import { fileTraceWriter, nullTraceWriter, type TraceWriter } from './trace.js'

// Module 13's loop, the measuring half: run the unchanged system N times over every fixture and look
// at the spread before believing any single number. Median beside minimum, because the customer
// meets the worst run. The safety set gates: one trip in N is a fail.
export type FixtureResult = { id: string; runs: Score[]; median: number; min: number; max: number; spread: number; safetyFails: number; toolCalls: number[] }
export type EvalResult = { model: string; runs: number; fixtures: FixtureResult[]; safetyPass: boolean }

export async function evaluate(opts: { runs: number; model: Model; fixtures?: Fixture[]; traceWriter?: TraceWriter }): Promise<EvalResult> {
  const fixtures = opts.fixtures ?? loadFixtures()
  const prices = loadPriceList()
  const results: FixtureResult[] = []
  for (const f of fixtures) {
    const runs: Score[] = []
    const toolCalls: number[] = []
    for (let i = 0; i < opts.runs; i++) {
      const store = fixtureStore()
      const draft: Draft = await draftReply({ email: f.email, model: opts.model, tools: { store, prices }, fixtureId: f.id, traceWriter: opts.traceWriter ?? nullTraceWriter })
      runs.push(score(f, draft))
      toolCalls.push(draft.toolCalls)
    }
    const totals = runs.map(r => r.total).sort((a, b) => a - b)
    const median = totals[Math.floor(totals.length / 2)]
    results.push({ id: f.id, runs, median, min: totals[0], max: totals[totals.length - 1], spread: totals[totals.length - 1] - totals[0], safetyFails: runs.filter(r => !r.safetyPass).length, toolCalls })
  }
  return { model: opts.model.id, runs: opts.runs, fixtures: results, safetyPass: results.every(r => r.safetyFails === 0) }
}

export function table(r: EvalResult): string {
  const rows = r.fixtures.map(f => `${f.id.padEnd(18)} ${String(f.median).padStart(6)} ${String(f.min).padStart(5)} ${String(f.max).padStart(5)} ${String(f.spread).padStart(6)}  ${String(f.safetyFails).padStart(3)}/${r.runs}   ${f.toolCalls.join(',')}`)
  return [
    `model ${r.model} · ${r.runs} runs per fixture`,
    `${'fixture'.padEnd(18)} median   min   max  spread  safety   tool calls`,
    ...rows,
    r.safetyPass ? 'safety set: PASS' : 'safety set: FAIL — a trip in N is a fail, whatever the median says',
  ].join('\n')
}

// `pnpm eval -- --runs 5 [--model anthropic] [--seed 7] [--wobble 0.2] [--traces]`
if (process.argv[1] && process.argv[1].endsWith('eval.ts')) {
  const arg = (k: string, d: string) => { const i = process.argv.indexOf(`--${k}`); return i > 0 ? process.argv[i + 1] : d }
  const runs = Number(arg('runs', '5'))
  const model = arg('model', 'null') === 'anthropic' ? anthropicModel() : noisyNullModel({ seed: Number(arg('seed', '1')), wobble: Number(arg('wobble', '0.2')) })
  const traceWriter = process.argv.includes('--traces') ? fileTraceWriter() : nullTraceWriter
  evaluate({ runs, model, traceWriter }).then(r => { console.log(table(r)); process.exitCode = r.safetyPass ? 0 : 1 })
}
