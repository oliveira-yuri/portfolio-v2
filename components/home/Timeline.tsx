import { Section } from '@/components/Section'
import type { ExperienceItem, Lang } from '@/lib/content/types'
import { getDictionary } from '@/lib/i18n/dictionaries'

export function Timeline({ lang, items }: { lang: Lang; items: ExperienceItem[] }) {
  const dict = getDictionary(lang)
  if (items.length === 0) return null

  return (
    <Section id="experience" title={dict.home.experience}>
      <ol className="flex flex-col gap-8">
        {items.map((item) => (
          <li key={`${item.organization}-${item.start}`} className="border-l border-[var(--color-border)] pl-5">
            <p className="u-mono text-[10px] text-[var(--color-dim)]">
              {item.start} — {item.end ?? dict.home.present}
            </p>
            <h3 className="u-heading mt-2 text-lg">{item.role}</h3>
            <p className="u-mono mt-1 text-[10px] text-[var(--color-accent)]">{item.organization}</p>
            <p className="u-prose mt-3 text-[var(--color-muted)]">{item.description}</p>
          </li>
        ))}
      </ol>
    </Section>
  )
}
