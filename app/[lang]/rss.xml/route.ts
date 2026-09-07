import { LANGS, isLang } from '@/lib/content/types'
import { getPosts } from '@/lib/content/posts'
import { buildRssXml } from '@/lib/feed'

export const dynamic = 'force-static'

export function generateStaticParams() {
  return LANGS.map((lang) => ({ lang }))
}

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ lang: string }> },
) {
  const { lang } = await params
  if (!isLang(lang)) return new Response('Not found', { status: 404 })

  return new Response(buildRssXml(lang, getPosts(lang)), {
    headers: { 'Content-Type': 'application/rss+xml; charset=utf-8' },
  })
}
