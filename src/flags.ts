// Feature flags (Module 07: deployment is not release). A slice is deployed with its flag off and
// turned on separately — for one customer, then a few, then everyone — without another deploy.
// The flag is read once at startup from the environment; a running shop does not change its mind.
export type Flags = { bracketPricing: boolean }

export const defaultFlags: Flags = { bracketPricing: false }

export function flagsFromEnv(env: NodeJS.ProcessEnv = process.env): Flags {
  return { bracketPricing: env.BRACKET_PRICING === 'on' }
}
