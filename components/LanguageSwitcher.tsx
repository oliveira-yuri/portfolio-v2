'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { LANGS, isLang, type Lang } from '@/lib/content/types'
import { getDictionary } from '@/lib/i18n/dictionaries'

/**
 * The only client component in the project. It exists because spec §6 requires
 * the switcher to keep the visitor on the equivalent page, which means reading
 * the current path — and `usePathname()` works fine under `output: 'export'`,
 * it is just resolved in the browser instead of at build time.
 *
 * Do not add `'use client'` anywhere else; everything else is a server
 * component and should stay one.
 */

/**
 * Swap the leading language segment for `target`, keeping the rest of the path
 * and its trailing slash (`trailingSlash: true` is in effect), so
 * `/pt/newsletter/foo/` becomes `/en/newsletter/foo/`.
 *
 * Anything unexpected — an empty path, or a first segment that is not a known
 * language — falls back to that language's home.
 */
function swapLangSegment(pathname: string | null, target: Lang): string {
  const home = `/${target}/`
  if (!pathname || !pathname.startsWith('/')) return home

  const segments = pathname.split('/')
  if (!isLang(segments[1] ?? '')) return home

  segments[1] = target
  return segments.join('/')
}

export function LanguageSwitcher({ lang }: { lang: Lang }) {
  const dict = getDictionary(lang)
  const pathname = usePathname()

  // The server-rendered markup deliberately points at each language's home, so
  // the links are useful before hydration and with JavaScript disabled. Once
  // mounted, the path-preserving href takes over.
  const [hydrated, setHydrated] = useState(false)
  useEffect(() => setHydrated(true), [])

  return (
    <nav aria-label={dict.languageSwitch.label} className="u-mono flex items-center gap-2 text-[11px]">
      {LANGS.map((candidate) => (
        <Link
          key={candidate}
          href={hydrated ? swapLangSegment(pathname, candidate) : `/${candidate}/`}
          aria-current={candidate === lang ? 'page' : undefined}
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
