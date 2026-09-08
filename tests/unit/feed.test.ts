import { describe, expect, it } from 'vitest'
import { buildRssXml } from '@/lib/feed'
import type { PostMeta } from '@/lib/content/types'

const posts: PostMeta[] = [
  {
    slug: 'primeiro',
    lang: 'pt',
    title: 'Título com & e <tags>',
    summary: 'Resumo com "aspas" e & comercial',
    date: '2026-03-14',
    tags: ['dados'],
    readingMinutes: 8,
    placeholder: false,
  },
]

describe('buildRssXml', () => {
  const xml = buildRssXml('pt', posts)

  it('declares an RSS 2.0 document', () => {
    expect(xml).toContain('<?xml version="1.0" encoding="UTF-8"?>')
    expect(xml).toContain('<rss version="2.0"')
  })

  it('escapes XML-significant characters in the title, and nothing else', () => {
    expect(xml).toContain('Título com &amp; e &lt;tags&gt;')
    expect(xml).not.toContain('<tags>')
  })

  it('keeps astral characters intact instead of emitting lone surrogate references', () => {
    const withEmoji = buildRssXml('pt', [
      { ...posts[0], slug: 'emoji', title: 'Deploy 🚀 em produção' },
    ])

    expect(withEmoji).toContain('<title>Deploy 🚀 em produção</title>')
    // A surrogate pair escaped code-unit by code-unit would appear as
    // `&#55357;&#56960;` — both halves start with `&#5`.
    expect(withEmoji).not.toContain('&#5')
    expect(withEmoji).not.toMatch(/&#\d+;/)
  })

  it('emits one item per post', () => {
    expect(xml.match(/<item>/g)?.length).toBe(1)
  })

  it('uses absolute links', () => {
    expect(xml).toMatch(/<link>https?:\/\/[^<]+\/pt\/newsletter\/primeiro<\/link>/)
  })

  it('formats pubDate as RFC 822', () => {
    expect(xml).toMatch(/<pubDate>\w{3}, \d{2} \w{3} \d{4}/)
  })

  it('produces an empty but valid feed when there are no posts', () => {
    const empty = buildRssXml('en', [])
    expect(empty).toContain('<channel>')
    expect(empty).not.toContain('<item>')
  })
})
