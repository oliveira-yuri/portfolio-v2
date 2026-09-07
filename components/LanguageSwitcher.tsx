import Link from 'next/link'
import { LANGS, type Lang } from '@/lib/content/types'
import { getDictionary } from '@/lib/i18n/dictionaries'

export function LanguageSwitcher({ lang }: { lang: Lang }) {
  const dict = getDictionary(lang)

  return (
    <nav aria-label={dict.languageSwitch.label} className="u-mono flex items-center gap-2 text-[11px]">
      {LANGS.map((candidate) => (
        <Link
          key={candidate}
          href={`/${candidate}`}
          aria-current={candidate === lang ? 'true' : undefined}
          className={
            candidate === lang
              ? 'text-[var(--color-accent)]'
              : 'text-[var(--color-dim)] hover:text-[var(--color-text)]'
          }
        >
          {dict.languageSwitch[candidate]}
        </Link>
      ))}
    </nav>
  )
}
