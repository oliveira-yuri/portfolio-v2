import { Section } from '@/components/Section'
import type { Lang, SkillGroup } from '@/lib/content/types'
import { getDictionary } from '@/lib/i18n/dictionaries'

export function Skills({ lang, groups }: { lang: Lang; groups: SkillGroup[] }) {
  const dict = getDictionary(lang)
  if (groups.length === 0) return null

  return (
    <Section id="skills" title={dict.home.skills}>
      <div className="flex flex-col gap-6">
        {groups.map((group) => (
          <div key={group.label}>
            <h3 className="u-mono mb-2 text-[10px] text-[var(--color-accent)]">{group.label}</h3>
            <ul className="flex flex-wrap gap-x-4 gap-y-2 text-sm text-[var(--color-muted)]">
              {group.items.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </Section>
  )
}
