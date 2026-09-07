import { describe, expect, it } from 'vitest'
import { getProfile } from '@/lib/content/profile'
import { LANGS } from '@/lib/content/types'

describe('getProfile', () => {
  it.each(LANGS)('returns a valid profile for %s', (lang) => {
    const profile = getProfile(lang)
    expect(profile.name.length).toBeGreaterThan(0)
    expect(profile.email).toContain('@')
    expect(profile.linkedinUrl).toMatch(/^https?:\/\//)
    expect(profile.githubUrl).toMatch(/^https?:\/\//)
  })

  it('has a CV path for both languages, and they differ', () => {
    expect(getProfile('pt').cvPath).not.toBe(getProfile('en').cvPath)
  })

  it('exposes at least one skill group, because the section must never render empty', () => {
    for (const lang of LANGS) {
      expect(getProfile(lang).skills.length).toBeGreaterThan(0)
    }
  })
})
