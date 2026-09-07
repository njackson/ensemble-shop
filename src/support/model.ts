// The model behind the support agent, as a seam. Two implementations: the real one, over the
// Anthropic API, and a null one (Shore's nullable, Module 05) that runs the same loop with no network
// and no key, so the agent's behavior can be tested and the eval can run on a laptop.

export type ToolDef = { name: string; description: string; input_schema: Record<string, unknown> }

export type Block =
  | { type: 'text'; text: string }
  | { type: 'tool_use'; id: string; name: string; input: Record<string, unknown> }
  | { type: 'tool_result'; tool_use_id: string; content: string }

export type Msg = { role: 'user' | 'assistant'; content: Block[] }

export type Turn = {
  blocks: Block[]
  stop: 'end_turn' | 'tool_use' | 'max_tokens'
  usage: { input: number; output: number }
}

export interface Model {
  readonly id: string
  readonly version: string
  complete(system: string, messages: Msg[], tools: ToolDef[]): Promise<Turn>
}

// The real thing. Needs ANTHROPIC_API_KEY. Never used by the tests.
export function anthropicModel(opts: { model?: string } = {}): Model {
  const id = opts.model ?? 'claude-sonnet-5'
  return {
    id,
    version: id,
    async complete(system, messages, tools) {
      const { default: Anthropic } = await import('@anthropic-ai/sdk')
      const client = new Anthropic()
      const res = await client.messages.create({
        model: id,
        max_tokens: 600,
        system,
        // Our block shapes are the API's block shapes; the cast is about the SDK's stricter unions.
        messages: messages as unknown as Parameters<typeof client.messages.create>[0]['messages'],
        tools: tools as unknown as NonNullable<Parameters<typeof client.messages.create>[0]['tools']>,
      })
      return {
        blocks: res.content.map(b =>
          b.type === 'text' ? { type: 'text', text: b.text }
          : b.type === 'tool_use' ? { type: 'tool_use', id: b.id, name: b.name, input: b.input as Record<string, unknown> }
          : { type: 'text', text: '' }),
        stop: res.stop_reason === 'tool_use' ? 'tool_use' : res.stop_reason === 'max_tokens' ? 'max_tokens' : 'end_turn',
        usage: { input: res.usage.input_tokens, output: res.usage.output_tokens },
      }
    },
  }
}

// A null model that plays a script: one Turn per call, in order. For tests that need the loop to do
// something specific — ask for a tool, answer, run out of budget.
export function scriptedModel(turns: Turn[], id = 'null-scripted'): Model {
  let i = 0
  return {
    id,
    version: 'script',
    async complete() {
      const t = turns[Math.min(i, turns.length - 1)]
      i++
      return t
    },
  }
}

export const text = (t: string): Block => ({ type: 'text', text: t })
export const toolUse = (name: string, input: Record<string, unknown>, id = `tu_${name}_${Math.random().toString(36).slice(2, 8)}`): Block =>
  ({ type: 'tool_use', id, name, input })
export const answer = (t: string, usage = { input: 400, output: 80 }): Turn => ({ blocks: [text(t)], stop: 'end_turn', usage })
export const callTool = (name: string, input: Record<string, unknown>, usage = { input: 400, output: 40 }): Turn =>
  ({ blocks: [toolUse(name, input)], stop: 'tool_use', usage })
