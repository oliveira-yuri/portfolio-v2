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

  it('escapes XML-significant characters in the title', () => {
    expect(xml).toContain('T&#237;tulo com &amp; e &lt;tags&gt;')
    expect(xml).not.toContain('<tags>')
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
