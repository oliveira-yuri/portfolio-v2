import { Section } from '@/components/Section'
import type { Lang, Profile } from '@/lib/content/types'
import { getDictionary } from '@/lib/i18n/dictionaries'

export function Contact({ lang, profile }: { lang: Lang; profile: Profile }) {
  const dict = getDictionary(lang)

  const links = [
    { label: dict.home.emailLabel, href: `mailto:${profile.email}`, text: profile.email },
    // 'LinkedIn' and 'GitHub' are proper nouns spelled the same in every
    // language — they stay hardcoded rather than living in the dictionary,
    // where someone could "translate" a brand name.
    { label: 'LinkedIn', href: profile.linkedinUrl, text: profile.linkedinUrl },
    { label: 'GitHub', href: profile.githubUrl, text: profile.githubUrl },
    { label: dict.home.cvLabel, href: profile.cvPath, text: dict.home.downloadCv },
  ]

  return (
    <Section id="contact" title={dict.home.contact}>
      <ul className="flex flex-col gap-3">
        {links.map((link) => (
          <li key={link.label} className="flex gap-4">
            <span className="u-mono w-20 shrink-0 text-[10px] text-[var(--color-dim)]">
              {link.label}
            </span>
            <a href={link.href} className="text-sm text-[var(--color-text)] hover:text-[var(--color-accent)]">
              {link.text}
            </a>
          </li>
        ))}
      </ul>
    </Section>
  )
}
