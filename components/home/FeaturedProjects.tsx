import Link from 'next/link'
import { Section } from '@/components/Section'
import type { Lang, ProjectMeta } from '@/lib/content/types'
import { getDictionary } from '@/lib/i18n/dictionaries'

export function FeaturedProjects({
  lang,
  projects,
}: {
  lang: Lang
  projects: ProjectMeta[]
}) {
  const dict = getDictionary(lang)
  if (projects.length === 0) return null

  return (
    <Section id="projects" title={dict.home.featuredProjects}>
      <div className="flex flex-col gap-5">
        {projects.map((project) => (
          <article
            key={project.slug}
            className="border border-[var(--color-border)] bg-[var(--color-surface)] p-6"
          >
            <h3 className="u-heading text-xl">{project.title}</h3>
            <p className="u-prose mt-2 text-[var(--color-muted)]">{project.summary}</p>

            <p className="mt-4 text-sm text-[var(--color-text)]">
              <span className="u-mono mr-2 text-[10px] text-[var(--color-accent)]">
                {dict.project.result}
              </span>
              {project.result}
            </p>

            <ul className="u-mono mt-4 flex flex-wrap gap-x-3 gap-y-2 text-[10px] text-[var(--color-dim)]">
              {project.stack.map((tech) => (
                <li key={tech}>{tech}</li>
              ))}
            </ul>

            <Link
              href={`/${lang}/projects/${project.slug}`}
              className="u-mono mt-6 inline-block text-[11px] text-[var(--color-accent)] hover:underline"
            >
              {dict.home.viewCaseStudy} →
            </Link>
          </article>
        ))}
      </div>
    </Section>
  )
}
