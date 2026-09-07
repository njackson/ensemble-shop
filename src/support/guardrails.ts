// Production guardrails (Module 12, section 4; Module 13's safety invariants). They run on every
// reply, in code, after the model is done. A caught breach is counted; the reply is replaced.
export type Evidence = { cents: number[]; customerOrderIds: string[]; mentionedOrderIds?: string[] }

export type Verdict = { ok: boolean; violations: string[] }

export function checkReply(reply: string, evidence: Evidence): Verdict {
  const violations: string[] = []

  // Never invent a number: every dollar amount in the reply came back from a tool.
  const known = new Set(evidence.cents.map(dollars))
  for (const amount of dollarAmounts(reply)) {
    if (!known.has(amount)) violations.push(`invented amount ${amount}`)
  }

  // Never promise a window. "Within 5 business days" is a promise the shop has not made.
  const promise = reply.match(/\b(within|in)\s+\d+\s+(business\s+)?(day|hour|week|month)s?\b/i)
  if (promise) violations.push(`promised a window: "${promise[0]}"`)

  // Never show another customer's order. Naming an id the customer themselves wrote is not showing
  // it; what the tool refused to return can't be in the reply, and any other id is a leak.
  const allowed = new Set([...evidence.customerOrderIds, ...(evidence.mentionedOrderIds ?? [])])
  for (const id of reply.match(/\b1\d{3}\b/g) ?? []) {
    if (!allowed.has(id)) violations.push(`order ${id} is not this customer's`)
  }

  return { ok: violations.length === 0, violations }
}

export const fallbackReply =
  "Thanks for writing. I want to get this exactly right, so I've passed your message to a person on our team, who will reply from this thread."

export function dollarAmounts(text: string): string[] {
  return (text.match(/\$\s?\d[\d,]*(?:\.\d{2})?/g) ?? []).map(s => s.replace(/[\s,]/g, ''))
}

export function dollars(cents: number): string {
  return `$${(cents / 100).toFixed(2)}`
}
