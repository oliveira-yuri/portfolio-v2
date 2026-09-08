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

  // The two languages are allowed to share one file. There is only a
  // Portuguese résumé today, and pointing the English profile at it beats
  // offering a download that 404s. That the file exists and is a real PDF is
  // checked in published-content.test.ts.
  it('has a CV path for both languages', () => {
    for (const lang of LANGS) {
      expect(getProfile(lang).cvPath).toMatch(/^\/cv\/.+\.pdf$/)
    }
  })

  it('exposes at least one skill group, because the section must never render empty', () => {
    for (const lang of LANGS) {
      expect(getProfile(lang).skills.length).toBeGreaterThan(0)
    }
  })
})
