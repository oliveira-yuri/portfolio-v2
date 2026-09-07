import { Section } from '@/components/Section'
import type { CertificationItem, EducationItem, Lang } from '@/lib/content/types'
import { getDictionary } from '@/lib/i18n/dictionaries'

export function Credentials({
  lang,
  education,
  certifications,
}: {
  lang: Lang
  education: EducationItem[]
  certifications: CertificationItem[]
}) {
  const dict = getDictionary(lang)
  if (education.length === 0 && certifications.length === 0) return null

  return (
    <Section id="education" title={dict.home.education}>
      <ul className="flex flex-col gap-4">
        {education.map((item) => (
          <li key={`${item.institution}-${item.title}`} className="flex justify-between gap-4">
            <span>
              <span className="text-[var(--color-text)]">{item.title}</span>
              <span className="u-mono ml-3 text-[10px] text-[var(--color-dim)]">
                {item.institution}
              </span>
            </span>
            <span className="u-mono shrink-0 text-[10px] text-[var(--color-dim)]">{item.year}</span>
          </li>
        ))}
      </ul>

      {certifications.length > 0 ? (
        <>
          <h3 className="u-mono mt-10 mb-4 text-[11px] text-[var(--color-dim)]">
            {dict.home.certifications}
          </h3>
          <ul className="flex flex-col gap-4">
            {certifications.map((item) => (
              <li key={`${item.issuer}-${item.title}`} className="flex justify-between gap-4">
                <span>
                  {item.url ? (
                    <a
                      href={item.url}
                      className="text-[var(--color-text)] hover:text-[var(--color-accent)]"
                    >
                      {item.title} ↗
                    </a>
                  ) : (
                    <span className="text-[var(--color-text)]">{item.title}</span>
                  )}
                  <span className="u-mono ml-3 text-[10px] text-[var(--color-dim)]">
                    {item.issuer}
                  </span>
                </span>
                <span className="u-mono shrink-0 text-[10px] text-[var(--color-dim)]">
                  {item.year}
                </span>
              </li>
            ))}
          </ul>
        </>
      ) : null}
    </Section>
  )
}
