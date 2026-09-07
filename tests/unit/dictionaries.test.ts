import { describe, expect, it } from 'vitest'
import { getDictionary } from '@/lib/i18n/dictionaries'
import { LANGS } from '@/lib/content/types'

describe('getDictionary', () => {
  it('returns different copy per language', () => {
    expect(getDictionary('pt').nav.projects).not.toBe(getDictionary('en').nav.projects)
  })

  it('defines the same keys for every language, so no string falls back silently', () => {
    const flatten = (value: unknown, prefix = ''): string[] =>
      typeof value === 'object' && value !== null
        ? Object.entries(value).flatMap(([key, inner]) => flatten(inner, `${prefix}${key}.`))
        : [prefix.slice(0, -1)]

    const [first, ...rest] = LANGS.map((lang) => flatten(getDictionary(lang)).sort())
    for (const other of rest) {
      expect(other).toEqual(first)
    }
  })

  it('has no empty strings', () => {
    const values = (value: unknown): string[] =>
      typeof value === 'string'
        ? [value]
        : typeof value === 'object' && value !== null
          ? Object.values(value).flatMap(values)
          : []

    for (const lang of LANGS) {
      for (const text of values(getDictionary(lang))) {
        expect(text.trim().length).toBeGreaterThan(0)
      }
    }
  })
})
