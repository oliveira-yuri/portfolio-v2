import { describe, expect, it } from 'vitest'
import { LANGS } from '@/lib/content/types'

describe('project foundation', () => {
  it('declares exactly the two supported languages', () => {
    expect(LANGS).toEqual(['pt', 'en'])
  })
})
