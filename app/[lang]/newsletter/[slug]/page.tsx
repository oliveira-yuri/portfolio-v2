import Link from 'next/link'
import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import { isLang } from '@/lib/content/types'
import { getPost, getPostSlugs, isTranslationMissing } from '@/lib/content/posts'
import { getDictionary } from '@/lib/i18n/dictionaries'
import { Mdx } from '@/components/Mdx'
import { TranslationMissingNotice } from '@/components/TranslationMissingNotice'

export function generateStaticParams() {
  return getPostSlugs()
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: string; slug: string }>
}): Promise<Metadata> {
  const { lang, slug } = await params
  if (!isLang(lang)) return {}

  const post = getPost(lang, slug)
  if (!post || isTranslationMissing(post)) return {}

  return { title: post.title, description: post.summary }
}

export default async function PostPage({
  params,
}: {
  params: Promise<{ lang: string; slug: string }>
}) {
  const { lang, slug } = await params
  if (!isLang(lang)) notFound()

  const post = getPost(lang, slug)
  if (!post) notFound()

  const dict = getDictionary(lang)

  if (isTranslationMissing(post)) {
    return (
      <main className="mx-auto max-w-4xl px-6 py-16">
        <TranslationMissingNotice
          lang={lang}
          href={`/${post.availableLang}/newsletter/${post.slug}`}
        />
      </main>
    )
  }

  return (
    <main className="mx-auto max-w-4xl px-6 py-16">
      <article>
        <p className="u-mono text-[10px] text-[var(--color-accent)]">
          {post.date} · {post.readingMinutes} {dict.post.readingTime}
        </p>
        <h1 className="u-heading mt-3 text-3xl leading-[1.15]">{post.title}</h1>
        <div className="mt-10">
          <Mdx source={post.body} />
        </div>
      </article>

      <Link
        href={`/${lang}/newsletter`}
        className="u-mono mt-16 inline-block text-[11px] text-[var(--color-accent)] hover:underline"
      >
        ← {dict.post.backToNewsletter}
      </Link>
    </main>
  )
}
