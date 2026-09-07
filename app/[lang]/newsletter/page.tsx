import Link from 'next/link'
import { notFound } from 'next/navigation'
import { LANGS, isLang } from '@/lib/content/types'
import { getPosts } from '@/lib/content/posts'
import { getDictionary } from '@/lib/i18n/dictionaries'

export function generateStaticParams() {
  return LANGS.map((lang) => ({ lang }))
}

export default async function NewsletterPage({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params
  if (!isLang(lang)) notFound()

  const dict = getDictionary(lang)
  const posts = getPosts(lang)

  return (
    <main className="mx-auto max-w-4xl px-6 py-16">
      <h1 className="u-heading text-3xl">{dict.nav.newsletter}</h1>

      <ul className="mt-12 flex flex-col gap-10">
        {posts.map((post) => (
          <li key={post.slug}>
            <Link href={`/${lang}/newsletter/${post.slug}`} className="group block">
              <p className="u-mono text-[10px] text-[var(--color-dim)]">
                {post.date} · {post.readingMinutes} {dict.post.readingTime}
              </p>
              <h2 className="u-heading mt-1 text-xl group-hover:text-[var(--color-accent)]">
                {post.title}
              </h2>
              <p className="u-prose mt-2 text-[var(--color-muted)]">{post.summary}</p>
              {post.tags.length > 0 ? (
                <ul className="u-mono mt-3 flex flex-wrap gap-3 text-[10px] text-[var(--color-dim)]">
                  {post.tags.map((tag) => (
                    <li key={tag}>#{tag}</li>
                  ))}
                </ul>
              ) : null}
            </Link>
          </li>
        ))}
      </ul>

      <a
        href={`/${lang}/rss.xml`}
        className="u-mono mt-14 inline-block text-[11px] text-[var(--color-accent)] hover:underline"
      >
        {dict.post.subscribeRss} →
      </a>
    </main>
  )
}
