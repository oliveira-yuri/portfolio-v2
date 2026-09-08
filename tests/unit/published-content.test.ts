import fs from 'node:fs'
import path from 'node:path'
import { describe, expect, it } from 'vitest'
import { getPosts } from '@/lib/content/posts'
import { getProjects } from '@/lib/content/projects'
import { getProfile } from '@/lib/content/profile'
import { LANGS } from '@/lib/content/types'

// This file reads the real `content/` directory on purpose — posts.test.ts uses
// fixtures so its assertions stay meaningful, which leaves nothing watching
// what is actually published. These are the checks that catch a broken article
// or a broken download after a real commit.
describe('published content', () => {
  it.each(LANGS)('parses every %s article without throwing', (lang) => {
    expect(() => getPosts(lang)).not.toThrow()
  })

  it.each(LANGS)('parses every %s project without throwing', (lang) => {
    expect(() => getProjects(lang)).not.toThrow()
  })

  it.each(LANGS)('offers a CV file that exists and is a real PDF in %s', (lang) => {
    const { cvPath } = getProfile(lang)
    const file = path.join(process.cwd(), 'public', cvPath)

    expect(fs.existsSync(file)).toBe(true)
    // The stub that shipped before real content was a 15-byte file whose only
    // content was the PDF header and EOF marker. A size floor is what tells a
    // truncated placeholder apart from a document.
    expect(fs.statSync(file).size).toBeGreaterThan(10_000)
    expect(fs.readFileSync(file).subarray(0, 4).toString()).toBe('%PDF')
  })
})
