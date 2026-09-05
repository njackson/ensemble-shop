import { describe, it, expect } from 'vitest'
import { catalog } from '../src/catalog.js'

describe('the shop', () => {
  it('lists the styles the story uses', () => {
    expect(catalog).toContain('BC3001')
  })
})
