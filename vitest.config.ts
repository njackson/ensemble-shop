import { defineConfig } from 'vitest/config'
export default defineConfig({ test: { include: ['test/**/*.{test,spec}.ts'], exclude: ['test/tripwire.test.ts', '**/node_modules/**'] } })
