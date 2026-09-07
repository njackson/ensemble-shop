import type { Model, Msg, Turn } from './model.js'
import { answer, callTool } from './model.js'
import { dollars } from './guardrails.js'

// A null model with a policy and a dial. It reads the customer's email the way a model would — badly,
// sometimes — and answers from tool results. `wobble` is the fraction of runs in which it does one of
// the things real models do: invents a number, skips the tool, or promises a window. Seeded, so an
// eval run is repeatable, and noisy, so Module 13's noise floor is a real thing to measure on a
// laptop with no API key.
export function noisyNullModel(opts: { seed?: number; wobble?: number } = {}): Model {
  const rand = mulberry32(opts.seed ?? 1)
  const wobble = opts.wobble ?? 0.2
  return {
    id: 'null-noisy',
    version: `wobble-${wobble}`,
    async complete(_system, messages: Msg[]): Promise<Turn> {
      const email = firstText(messages)
      const lastResult = lastToolResult(messages)
      const roll = rand()

      if (!lastResult) {
        // First turn: decide whether to use a tool at all.
        const orderId = email.match(/\b(1\d{3})\b/)?.[1]
        const quote = email.match(/\b(\d{1,4})\b[^.]*?\b([A-Z]{1,2}\d{4})\b/) ?? email.match(/\b([A-Z]{1,2}\d{4})\b[^.]*?\b(\d{1,4})\b/)
        if (roll < wobble) return answer(invented(email))          // the classic failure: confident, no tool
        if (orderId) return callTool('lookup_order', { order_id: orderId })
        if (quote) {
          const [style, qty] = /^[A-Z]/.test(quote[1]) ? [quote[1], Number(quote[2])] : [quote[2], Number(quote[1])]
          return callTool('price_quote', { style, qty })
        }
        return answer(noNumbers(email))
      }

      // Second turn: answer from the tool result.
      const r = lastResult
      if ('error' in r) {
        const e = String(r.error)
        if (e.startsWith('No order')) return answer(`Thanks for writing. I can't find that order under your account, so I'm not able to share its details. If it was placed under another email, reply from that address and I'll take a look.\n\nThe shop`)
        return answer(`Thanks for writing. ${e.replace('The shop does not carry', "We don't carry")}, so I can't quote it. If you can tell me the style you meant, I'll get you a price.\n\nThe shop`)
      }
      if (roll < wobble / 2) return answer(`${grounded(r)} You'll have it within 5 business days.\n\nThe shop`)   // grounded, then a promise
      return answer(`${grounded(r)}\n\nThe shop`)
    },
  }
}

function grounded(r: Record<string, unknown>): string {
  if ('order_id' in r) {
    const lines = (r.lines as Array<{ qty: number; style: string; color: string; unit_cents: number }>)
    const per = lines.map(l => `${l.qty} ${l.style} in ${l.color} at ${dollars(l.unit_cents)}`).join(' and ')
    return `Thanks for checking. Order ${r.order_id} is ${r.status}: ${per}, ${dollars(r.total_cents as number)} in all. Past 36 units of a style the bracket price applies.`
  }
  const bracketNote = (r.qty as number) >= (r.bracket_at as number)
    ? `That's at the bracket price, ${dollars(r.bracket_cents as number)} each.`
    : `Under ${r.bracket_at} units the list price of ${dollars(r.list_cents as number)} applies; at ${r.bracket_at} or more it's the bracket price, ${dollars(r.bracket_cents as number)}.`
  return `Thanks for asking. ${r.qty} of the ${r.name} (${r.style}) comes to ${dollars(r.total_cents as number)}, ${dollars(r.unit_cents as number)} each. ${bracketNote}`
}

function invented(email: string): string {
  const n = email.match(/\b(\d{1,4})\b/)?.[1] ?? '47'
  return `Thanks for reaching out! ${n} shirts at our bracket price of $11.99 comes to $${(Number(n) * 11.99).toFixed(2)}. Let me know if you'd like to go ahead.\n\nThe shop`
}

function noNumbers(email: string): string {
  if (/return/i.test(email))
    return `Thanks for asking. Whether an order that drops below the bracket after a return is re-priced is being checked by our finance team right now, so I don't want to guess either way. A person will confirm with you once they have the answer.\n\nThe shop`
  return `Thanks for writing. I want to make sure I answer this properly, so a person on the team will pick it up from here.\n\nThe shop`
}

function firstText(messages: Msg[]): string {
  const b = messages[0]?.content.find(b => b.type === 'text')
  return b && b.type === 'text' ? b.text : ''
}

function lastToolResult(messages: Msg[]): Record<string, unknown> | undefined {
  const last = messages[messages.length - 1]
  const b = last?.role === 'user' ? last.content.find(b => b.type === 'tool_result') : undefined
  return b && b.type === 'tool_result' ? (JSON.parse(b.content) as Record<string, unknown>) : undefined
}

function mulberry32(seed: number) {
  let a = seed >>> 0
  return () => {
    a = (a + 0x6d2b79f5) >>> 0
    let t = a
    t = Math.imul(t ^ (t >>> 15), t | 1)
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}
