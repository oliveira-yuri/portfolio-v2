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
      {/* Certifications without a completed degree is a realistic shape, and
          the heading above is already rendered — so the list is conditional to
          keep an empty <ul> from ever appearing under it. */}
      {education.length > 0 ? (
        <ul className="flex flex-col gap-4">
          {education.map((item) => (
            <li key={`${item.institution}-${item.title}-${item.year}`} className="flex justify-between gap-4">
              <span>
                <span className="text-[var(--color-text)]">{item.title}</span>
                <span className="u-mono ml-3 text-[10px] text-[var(--color-dim)]">
                  {item.institution}
                </span>
              </span>
              <span className="u-mono shrink-0 text-[10px] text-[var(--color-dim)]">
                {item.year}
              </span>
            </li>
          ))}
        </ul>
      ) : null}

      {certifications.length > 0 ? (
        <>
          <h3
            className={`u-mono mb-4 text-[11px] text-[var(--color-dim)] ${
              education.length > 0 ? 'mt-10' : ''
            }`}
          >
            {dict.home.certifications}
          </h3>
          <ul className="flex flex-col gap-4">
            {certifications.map((item) => (
              <li key={`${item.issuer}-${item.title}-${item.year}`} className="flex justify-between gap-4">
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
