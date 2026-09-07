import { createShop } from './server.js'
import { memoryStore } from './store.js'
import { flagsFromEnv } from './flags.js'

// `pnpm start` — the shop, on a port. `BRACKET_PRICING=on pnpm start` releases the bracket rule
// without a second deploy (Module 07).
const port = Number(process.env.PORT ?? 3000)
const flags = flagsFromEnv()
createShop({ store: memoryStore(), flags }).listen(port, () => {
  console.log(`shop listening on http://localhost:${port}  flags=${JSON.stringify(flags)}`)
})
