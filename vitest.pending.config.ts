import { defineConfig } from 'vitest/config'
export default defineConfig({ test: { include: ['test/acceptance/pending/**/*.spec.ts'] } })
