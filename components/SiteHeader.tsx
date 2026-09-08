import Link from 'next/link'
import type { Lang } from '@/lib/content/types'
import { getDictionary } from '@/lib/i18n/dictionaries'
import { getProfile } from '@/lib/content/profile'
import { LanguageSwitcher } from './LanguageSwitcher'

export function SiteHeader({ lang }: { lang: Lang }) {
  const dict = getDictionary(lang)
  const profile = getProfile(lang)

  return (
    <header className="border-b border-[var(--color-border)]">
      <div className="mx-auto flex max-w-4xl items-center justify-between px-6 py-5">
        <Link href={`/${lang}`} className="u-mono text-[11px] text-[var(--color-text)]">
          <span className="text-[var(--color-accent)]">$</span> {profile.name}
        </Link>
        <div className="flex items-center gap-6">
          <nav className="u-mono flex gap-5 text-[11px] text-[var(--color-dim)]">
            <Link href={`/${lang}#projects`} className="hover:text-[var(--color-text)]">
              {dict.nav.projects}
            </Link>
            <Link href={`/${lang}/newsletter`} className="hover:text-[var(--color-text)]">
              {dict.nav.newsletter}
            </Link>
            <Link href={`/${lang}#contact`} className="hover:text-[var(--color-text)]">
              {dict.nav.contact}
            </Link>
          </nav>
          <LanguageSwitcher lang={lang} />
        </div>
      </div>
    </header>
  )
}
