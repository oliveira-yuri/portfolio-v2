import { SITE_NAME, SITE_URL } from './site'
import type { Lang, PostMeta } from './content/types'

function escapeXml(value: string): string {
  return value.replace(/[<>&'"]|[^ -~]/g, (char) => {
    if (char === '<') return '&lt;'
    if (char === '>') return '&gt;'
    if (char === '&') return '&amp;'
    if (char === "'") return '&apos;'
    if (char === '"') return '&quot;'
    return `&#${char.charCodeAt(0)};`
  })
}

function toRfc822(isoDate: string): string {
  return new Date(`${isoDate}T00:00:00Z`).toUTCString()
}

export function buildRssXml(lang: Lang, posts: PostMeta[]): string {
  const feedUrl = `${SITE_URL}/${lang}/rss.xml`
  const homeUrl = `${SITE_URL}/${lang}`

  const items = posts
    .map((post) => {
      const url = `${SITE_URL}/${lang}/newsletter/${post.slug}`
      return [
        '    <item>',
        `      <title>${escapeXml(post.title)}</title>`,
        `      <link>${url}</link>`,
        `      <guid isPermaLink="true">${url}</guid>`,
        `      <description>${escapeXml(post.summary)}</description>`,
        `      <pubDate>${toRfc822(post.date)}</pubDate>`,
        '    </item>',
      ].join('\n')
    })
    .join('\n')

  const head = [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">',
    '  <channel>',
    `    <title>${escapeXml(SITE_NAME)}</title>`,
    `    <link>${homeUrl}</link>`,
    `    <description>${escapeXml(SITE_NAME)}</description>`,
    `    <language>${lang}</language>`,
    `    <atom:link href="${feedUrl}" rel="self" type="application/rss+xml"/>`,
  ]

  const tail = ['  </channel>', '</rss>', '']

  return [...head, ...(items ? [items] : []), ...tail].join('\n')
}
