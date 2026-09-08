import Link from 'next/link'
import type { Lang } from '@/lib/content/types'
import { getDictionary } from '@/lib/i18n/dictionaries'

export function TranslationMissingNotice({ lang, href }: { lang: Lang; href: string }) {
  const dict = getDictionary(lang)

  return (
    <div
      data-testid="translation-missing"
      className="border border-[var(--color-border)] bg-[var(--color-surface)] p-6"
    >
      <p className="u-mono text-[10px] text-[var(--color-accent)]">
        {dict.translationMissing.title}
      </p>
      <p className="u-prose mt-3 text-[var(--color-muted)]">{dict.translationMissing.body}</p>
      <Link
        href={href}
        className="u-mono mt-5 inline-block text-[11px] text-[var(--color-accent)] hover:underline"
      >
        {dict.translationMissing.cta} →
      </Link>
    </div>
  )
}
