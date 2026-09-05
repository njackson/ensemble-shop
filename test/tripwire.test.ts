import { it, expect } from 'vitest'
// This test must always fail. CI asserts that it does. If it ever passes, the gate has stopped being able to.
it('tripwire: the gate can fail', () => { expect(true).toBe(false) })
