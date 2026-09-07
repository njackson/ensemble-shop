import type { Model, Msg, Block } from './model.js'
import { toolDefs, runTool, centsIn, type ToolContext } from './tools.js'
import { checkReply, fallbackReply } from './guardrails.js'
import { startTrace, costUsd, nullTraceWriter, type Trace, type TraceWriter } from './trace.js'
import { systemPrompt, PROMPT_VERSION } from './prompt.js'

export type Email = { from: string; subject: string; body: string }

export type DraftInput = {
  email: Email
  model: Model
  tools: Omit<ToolContext, 'customer'>
  fixtureId?: string
  traceWriter?: TraceWriter
  maxToolCalls?: number   // the cost bound (Module 09): a run that needs more than this is broken, whatever it says
}

export type Draft = {
  reply: string
  outcome: 'succeeded' | 'failed'
  guardrail: { tripped: boolean; violations: string[] }
  toolCalls: number
  trace: Trace
  tracePath?: string
}

// One run of the support agent: read the email, call tools until the model answers, check the answer
// against what the tools said, record everything. The loop is code; the model chooses tools and words.
export async function draftReply(input: DraftInput): Promise<Draft> {
  const { email, model, maxToolCalls = 6, traceWriter = nullTraceWriter } = input
  const ctx: ToolContext = { ...input.tools, customer: email.from }
  const customerOrderIds = ctx.store.byCustomer(email.from).map(o => o.id)

  const t = startTrace('support.draft_reply', {
    'model.id': model.id, 'model.version': model.version, 'prompt.version': PROMPT_VERSION,
    'tool.schema_hash': hash(JSON.stringify(toolDefs)), 'fixture.id': input.fixtureId ?? null,
    'customer.pseudo_id': hash(email.from), 'human.intervened': false,
  })

  const messages: Msg[] = [{ role: 'user', content: [{ type: 'text', text: `From: ${email.from}\nSubject: ${email.subject}\n\n${email.body}` }] }]
  const evidence: number[] = []
  const toolNames: string[] = []
  let usage = { input: 0, output: 0 }
  let reply = ''
  let outcome: Draft['outcome'] = 'succeeded'
  let failure: string | undefined

  for (let turn = 0; ; turn++) {
    const call = t.child('model_call', 'model.complete', { 'turn.index': turn, 'context.blocks': messages.reduce((n, m) => n + m.content.length, 0) })
    const res = await model.complete(systemPrompt, messages, toolDefs)
    usage = { input: usage.input + res.usage.input, output: usage.output + res.usage.output }
    t.close(call, { 'stop.reason': res.stop, 'usage.input': res.usage.input, 'usage.output': res.usage.output })
    messages.push({ role: 'assistant', content: res.blocks })

    const uses = res.blocks.filter((b): b is Extract<Block, { type: 'tool_use' }> => b.type === 'tool_use')
    if (res.stop !== 'tool_use' || uses.length === 0) {
      reply = res.blocks.filter(b => b.type === 'text').map(b => (b as { text: string }).text).join('\n').trim()
      if (res.stop === 'max_tokens') { outcome = 'failed'; failure = 'max_tokens' }
      break
    }
    if (toolNames.length + uses.length > maxToolCalls) {
      outcome = 'failed'; failure = `tool budget of ${maxToolCalls} exceeded`
      reply = fallbackReply
      break
    }
    const results: Block[] = []
    for (const u of uses) {
      const span = t.child('tool_call', `tool.${u.name}`, { 'tool.name': u.name, 'tool.input': u.input }, call)
      const result = runTool(u.name, u.input, ctx)
      evidence.push(...centsIn(result))
      toolNames.push(u.name)
      t.close(span, { 'tool.error': 'error' in result ? result.error : null })
      results.push({ type: 'tool_result', tool_use_id: u.id, content: JSON.stringify(result) })
    }
    messages.push({ role: 'user', content: results })
  }

  const verdict = outcome === 'succeeded' ? checkReply(reply, { cents: evidence, customerOrderIds, mentionedOrderIds: email.body.match(/\b1\d{3}\b/g) ?? [] }) : { ok: true, violations: [] }
  if (!verdict.ok) reply = fallbackReply

  const trace = t.end({
    'run.outcome': outcome, 'run.failure': failure ?? null,
    'tool.count': toolNames.length, 'tool.names': toolNames,
    'context.tokens': usage.input, 'cost.usd': Number(costUsd(model.id, usage).toFixed(5)),
    'guardrail.tripped': !verdict.ok, 'guardrail.violations': verdict.violations,
    'reply.words': reply.split(/\s+/).filter(Boolean).length,
    // The blob (Module 12, section 2): what the model saw and what it said, kept with the trace so a
    // bad run can be read, not only found. In production this is stored separately, redacted, and
    // linked by trace id; here it rides along, because nothing in this repository is a real person.
    'blob.email': email, 'blob.reply': reply,
  })
  const tracePath = traceWriter.write(trace)
  return { reply, outcome, guardrail: { tripped: !verdict.ok, violations: verdict.violations }, toolCalls: toolNames.length, trace, tracePath }
}

function hash(s: string): string {
  let h = 2166136261
  for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619) }
  return (h >>> 0).toString(16).padStart(8, '0')
}
