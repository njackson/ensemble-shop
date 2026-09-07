import { readFileSync } from 'node:fs'
import { draftReply } from './agent.js'
import { fixtureStore, type Fixture } from './fixtures.js'
import { loadPriceList } from '../pricing/priceList.js'
import { noisyNullModel } from './null-model.js'
import { anthropicModel } from './model.js'
import { fileTraceWriter } from './trace.js'

// `pnpm support -- fixtures/support/bracket-charge.json [--model anthropic]`
// One run: the reply, what the guardrail said, and where the trace went.
const file = process.argv[2]
if (!file) { console.error('usage: pnpm support -- <fixture.json> [--model anthropic|null]'); process.exit(2) }
const fixture = JSON.parse(readFileSync(file, 'utf8')) as Fixture
const model = process.argv.includes('anthropic') ? anthropicModel() : noisyNullModel({ seed: Date.now() % 1000 })

const draft = await draftReply({ email: fixture.email, model, tools: { store: fixtureStore(), prices: loadPriceList() }, fixtureId: fixture.id, traceWriter: fileTraceWriter() })
console.log(draft.reply)
console.log('\n---')
console.log(`outcome ${draft.outcome} · tool calls ${draft.toolCalls} · guardrail ${draft.guardrail.tripped ? 'TRIPPED: ' + draft.guardrail.violations.join('; ') : 'clear'}`)
console.log(`trace ${draft.tracePath}`)
