import path from 'node:path'
import { afterAll, beforeAll, describe, expect, it, vi } from 'vitest'
import { getPost, getPosts, getPostSlugs, isTranslationMissing } from '@/lib/content/posts'

// The site ships with no articles yet, so these tests read from
// `tests/fixtures/content` instead of `content/`. Pointing them at real content
// would make every assertion below vacuous the moment the newsletter is empty —
// "sorted" and "hides the untranslated post" are both trivially true of an
// empty list. The fixtures keep the behaviour under test regardless of what is
// published.
beforeAll(() => {
  vi.stubEnv('CONTENT_ROOT_OVERRIDE', path.join(process.cwd(), 'tests', 'fixtures', 'content'))
})

afterAll(() => {
  vi.unstubAllEnvs()
})

describe('getPosts', () => {
  it('returns Portuguese posts', () => {
    const posts = getPosts('pt')
    expect(posts.length).toBeGreaterThanOrEqual(2)
  })

  it('sorts newest first', () => {
    const dates = getPosts('pt').map((p) => p.date)
    // Guard against the assertion below going vacuous: with fewer than two
    // entries, any order trivially counts as sorted.
    expect(dates.length).toBeGreaterThanOrEqual(2)
    const sorted = [...dates].sort((a, b) => b.localeCompare(a))
    expect(dates).toEqual(sorted)
  })

  it('computes a reading time of at least one minute', () => {
    for (const post of getPosts('pt')) {
      expect(post.readingMinutes).toBeGreaterThanOrEqual(1)
    }
  })

  it('hides a post from the language that has no translation', () => {
    const ptSlugs = getPosts('pt').map((p) => p.slug)
    const enSlugs = getPosts('en').map((p) => p.slug)
    expect(ptSlugs).toContain('so-em-portugues')
    expect(enSlugs).not.toContain('so-em-portugues')
  })

  it('tags every post with the language it was read from', () => {
    expect(getPosts('en').every((p) => p.lang === 'en')).toBe(true)
  })
})

describe('getPost', () => {
  it('returns the post body when the translation exists', () => {
    const post = getPost('pt', 'artigo-traduzido')
    expect(isTranslationMissing(post)).toBe(false)
    expect(post).not.toBeNull()
    if (post && !isTranslationMissing(post)) {
      expect(post.body.length).toBeGreaterThan(0)
      expect(post.title.length).toBeGreaterThan(0)
    }
  })

  it('reports a missing translation instead of failing', () => {
    const post = getPost('en', 'so-em-portugues')
    expect(isTranslationMissing(post)).toBe(true)
    if (post && isTranslationMissing(post)) {
      expect(post.requestedLang).toBe('en')
      expect(post.availableLang).toBe('pt')
      expect(post.slug).toBe('so-em-portugues')
    }
  })

  it('returns null for a slug that exists in no language', () => {
    expect(getPost('pt', 'nao-existe-em-lugar-nenhum')).toBeNull()
  })
})

describe('getPostSlugs', () => {
  it('includes every language/slug pair that should be built', () => {
    const pairs = getPostSlugs()
    expect(pairs).toContainEqual({ lang: 'pt', slug: 'artigo-traduzido' })
    expect(pairs).toContainEqual({ lang: 'en', slug: 'artigo-traduzido' })
  })

  it('includes the untranslated slug for both languages so the notice page is built', () => {
    const pairs = getPostSlugs()
    expect(pairs).toContainEqual({ lang: 'pt', slug: 'so-em-portugues' })
    expect(pairs).toContainEqual({ lang: 'en', slug: 'so-em-portugues' })
  })

  it('does not contain duplicates', () => {
    const pairs = getPostSlugs().map((p) => `${p.lang}/${p.slug}`)
    expect(new Set(pairs).size).toBe(pairs.length)
  })
})
