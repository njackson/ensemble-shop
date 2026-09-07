import type { OrderStore } from '../store.js'
import type { PriceList } from '../pricing/priceList.js'
import { bracketUnitPrice } from '../pricing/bracket.js'
import type { ToolDef } from './model.js'

// The support agent's two tools. Policy lives here, not in the prompt: the order tool refuses to show
// an order that is not the customer's, so the model cannot be talked into leaking one (Module 09's
// harness, and Module 10's rule that anything the agent reads is untrusted input — including the
// customer's email).
export const toolDefs: ToolDef[] = [
  {
    name: 'lookup_order',
    description: "Look up one of this customer's orders by id. Returns the lines, unit prices, total and status. Refuses orders that belong to someone else.",
    input_schema: { type: 'object', properties: { order_id: { type: 'string' } }, required: ['order_id'] },
  },
  {
    name: 'price_quote',
    description: 'Quote a quantity of one style: unit price and total, applying the bracket rule. Returns an error for a style the shop does not carry.',
    input_schema: { type: 'object', properties: { style: { type: 'string' }, qty: { type: 'integer' } }, required: ['style', 'qty'] },
  },
]

export type ToolContext = { store: OrderStore; prices: PriceList; customer: string }

export function runTool(name: string, input: Record<string, unknown>, ctx: ToolContext): Record<string, unknown> {
  if (name === 'lookup_order') {
    const order = ctx.store.get(String(input.order_id))
    if (!order || order.customer !== ctx.customer) return { error: `No order ${input.order_id} for this customer` }
    // The bracket rule travels as data, not as a sentence in the prompt: units per style across the
    // whole order, and which price each line was priced at. The first real run got the numbers right
    // and the reason wrong ("neither color reached 36"); this is the fix that held.
    const unitsByStyle: Record<string, number> = {}
    for (const l of order.lines) unitsByStyle[l.style] = (unitsByStyle[l.style] ?? 0) + l.qty
    return {
      order_id: order.id, status: order.status, placed_at: order.placedAt,
      lines: order.lines.map(l => ({
        style: l.style, color: l.color, qty: l.qty, unit_cents: l.unitCents, line_cents: l.cents,
        priced_at: ctx.prices[l.style] && l.unitCents === ctx.prices[l.style].bracketCents ? 'bracket price' : 'list price',
      })),
      units_by_style: unitsByStyle,
      bracket_rule: 'The bracket is judged per style across the whole order, all colors combined, not per line.',
      total_cents: order.totalCents,
    }
  }
  if (name === 'price_quote') {
    const row = ctx.prices[String(input.style)]
    if (!row) return { error: `The shop does not carry ${input.style}` }
    const qty = Number(input.qty)
    const unit = bracketUnitPrice(row, qty)
    return { style: input.style, name: row.name, qty, unit_cents: unit, total_cents: unit * qty, list_cents: row.listCents, bracket_at: row.bracketAt, bracket_cents: row.bracketCents }
  }
  return { error: `Unknown tool ${name}` }
}

// Every cents value a tool returned, for the guardrail: a dollar amount in the reply that is not one
// of these was invented.
export function centsIn(result: Record<string, unknown>): number[] {
  const out: number[] = []
  const walk = (v: unknown, key = '') => {
    if (typeof v === 'number' && key.endsWith('_cents')) out.push(v)
    else if (Array.isArray(v)) v.forEach(x => walk(x))
    else if (v && typeof v === 'object') Object.entries(v).forEach(([k, x]) => walk(x, k))
  }
  walk(result)
  return out
}
