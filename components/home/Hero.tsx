import type { Lang, Profile } from '@/lib/content/types'
import { getDictionary } from '@/lib/i18n/dictionaries'

export function Hero({ lang, profile }: { lang: Lang; profile: Profile }) {
  const dict = getDictionary(lang)

  return (
    <section id="hero" className="py-16">
      {profile.available ? (
        <p className="u-mono mb-6 text-[10px] text-[var(--color-accent)]">
          ● {dict.home.availableNow}
        </p>
      ) : null}

      <h1 className="u-heading text-4xl leading-[1.08] sm:text-5xl">
        {profile.tagline}
        <span className="u-cursor" aria-hidden="true" />
      </h1>

      <p className="u-prose mt-5 text-[var(--color-muted)]">{profile.role}</p>

      <ul className="u-mono mt-8 flex flex-wrap gap-x-3 gap-y-2 text-[10px] text-[var(--color-dim)]">
        {profile.stack.map((item) => (
          <li key={item}>{item}</li>
        ))}
      </ul>

      <a
        href={profile.cvPath}
        className="u-mono mt-9 inline-block border border-[var(--color-accent)] px-4 py-2 text-[11px] text-[var(--color-accent)] transition-colors hover:bg-[var(--color-accent)] hover:text-[var(--color-bg)]"
      >
        {dict.home.downloadCv} ↓
      </a>
    </section>
  )
}
