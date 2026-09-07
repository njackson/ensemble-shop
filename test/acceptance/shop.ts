import { createShop } from '../../src/server.js'
import { memoryStore, type StoredOrder } from '../../src/store.js'
import { defaultFlags, type Flags } from '../../src/flags.js'
import type { AddressInfo } from 'node:net'

// Runs the real server on an ephemeral port for a test, and tears it down. Sociable: nothing is
// mocked; the only stand-in is the in-memory store, which is the same one `pnpm start` uses.
export async function runningShop(opts: { seed?: StoredOrder[]; flags?: Partial<Flags> } = {}) {
  const store = memoryStore(opts.seed)
  const server = createShop({ store, flags: { ...defaultFlags, ...opts.flags } })
  await new Promise<void>(r => server.listen(0, r))
  const base = `http://localhost:${(server.address() as AddressInfo).port}`
  return {
    base,
    store,
    post: (path: string, body: unknown) =>
      fetch(base + path, { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(body) }),
    get: (path: string) => fetch(base + path),
    close: () => new Promise<void>(r => server.close(() => r())),
  }
}
