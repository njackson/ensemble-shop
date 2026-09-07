import { createShop } from './server.js'
import { memoryStore } from './store.js'

// `pnpm start` — the shop, on a port. Deploying this is the first thing a slice does (Module 03).
const port = Number(process.env.PORT ?? 3000)
createShop({ store: memoryStore() }).listen(port, () => {
  console.log(`shop listening on http://localhost:${port}`)
})
