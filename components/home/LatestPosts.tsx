import Link from 'next/link'
import { Section } from '@/components/Section'
import type { Lang, PostMeta } from '@/lib/content/types'
import { getDictionary } from '@/lib/i18n/dictionaries'

export function LatestPosts({ lang, posts }: { lang: Lang; posts: PostMeta[] }) {
  const dict = getDictionary(lang)
  if (posts.length === 0) return null

  return (
    <Section id="posts" title={dict.home.latestPosts}>
      <ul className="flex flex-col gap-6">
        {posts.map((post) => (
          <li key={post.slug}>
            <Link href={`/${lang}/newsletter/${post.slug}`} className="group block">
              <p className="u-mono text-[10px] text-[var(--color-dim)]">
                {post.date} · {post.readingMinutes} {dict.post.readingTime}
              </p>
              <h3 className="u-heading mt-1 text-lg group-hover:text-[var(--color-accent)]">
                {post.title}
              </h3>
              <p className="u-prose mt-1 text-[var(--color-muted)]">{post.summary}</p>
            </Link>
          </li>
        ))}
      </ul>

      <Link
        href={`/${lang}/newsletter`}
        className="u-mono mt-8 inline-block text-[11px] text-[var(--color-accent)] hover:underline"
      >
        {dict.home.allPosts} →
      </Link>
    </Section>
  )
}
