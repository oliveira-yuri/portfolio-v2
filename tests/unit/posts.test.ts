import { describe, expect, it } from 'vitest'
import { getPost, getPosts, getPostSlugs, isTranslationMissing } from '@/lib/content/posts'

describe('getPosts', () => {
  it('returns Portuguese posts', () => {
    const posts = getPosts('pt')
    expect(posts.length).toBeGreaterThanOrEqual(2)
  })

  it('sorts newest first', () => {
    const dates = getPosts('pt').map((p) => p.date)
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
    expect(ptSlugs).toContain('exemplo-somente-portugues')
    expect(enSlugs).not.toContain('exemplo-somente-portugues')
  })

  it('tags every post with the language it was read from', () => {
    expect(getPosts('en').every((p) => p.lang === 'en')).toBe(true)
  })
})

describe('getPost', () => {
  it('returns the post body when the translation exists', () => {
    const post = getPost('pt', 'exemplo-limpeza-dados')
    expect(isTranslationMissing(post)).toBe(false)
    expect(post).not.toBeNull()
    if (post && !isTranslationMissing(post)) {
      expect(post.body.length).toBeGreaterThan(0)
      expect(post.title.length).toBeGreaterThan(0)
    }
  })

  it('reports a missing translation instead of failing', () => {
    const post = getPost('en', 'exemplo-somente-portugues')
    expect(isTranslationMissing(post)).toBe(true)
    if (post && isTranslationMissing(post)) {
      expect(post.requestedLang).toBe('en')
      expect(post.availableLang).toBe('pt')
      expect(post.slug).toBe('exemplo-somente-portugues')
    }
  })

  it('returns null for a slug that exists in no language', () => {
    expect(getPost('pt', 'nao-existe-em-lugar-nenhum')).toBeNull()
  })
})

describe('getPostSlugs', () => {
  it('includes every language/slug pair that should be built', () => {
    const pairs = getPostSlugs()
    expect(pairs).toContainEqual({ lang: 'pt', slug: 'exemplo-limpeza-dados' })
    expect(pairs).toContainEqual({ lang: 'en', slug: 'exemplo-limpeza-dados' })
  })

  it('includes the untranslated slug for both languages so the notice page is built', () => {
    const pairs = getPostSlugs()
    expect(pairs).toContainEqual({ lang: 'pt', slug: 'exemplo-somente-portugues' })
    expect(pairs).toContainEqual({ lang: 'en', slug: 'exemplo-somente-portugues' })
  })

  it('does not contain duplicates', () => {
    const pairs = getPostSlugs().map((p) => `${p.lang}/${p.slug}`)
    expect(new Set(pairs).size).toBe(pairs.length)
  })
})
