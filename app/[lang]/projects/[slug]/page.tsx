import Link from 'next/link'
import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import { isLang } from '@/lib/content/types'
import { getProject, getProjectSlugs } from '@/lib/content/projects'
import { isTranslationMissing } from '@/lib/content/posts'
import { getDictionary } from '@/lib/i18n/dictionaries'
import { Mdx } from '@/components/Mdx'
import { TranslationMissingNotice } from '@/components/TranslationMissingNotice'

export function generateStaticParams() {
  return getProjectSlugs()
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: string; slug: string }>
}): Promise<Metadata> {
  const { lang, slug } = await params
  if (!isLang(lang)) return {}

  const project = getProject(lang, slug)
  if (!project || isTranslationMissing(project)) return {}

  return { title: project.title, description: project.summary }
}

export default async function ProjectPage({
  params,
}: {
  params: Promise<{ lang: string; slug: string }>
}) {
  const { lang, slug } = await params
  if (!isLang(lang)) notFound()

  const project = getProject(lang, slug)
  if (!project) notFound()

  const dict = getDictionary(lang)

  if (isTranslationMissing(project)) {
    return (
      <main className="mx-auto max-w-4xl px-6 py-16">
        <TranslationMissingNotice
          lang={lang}
          href={`/${project.availableLang}/projects/${project.slug}`}
        />
      </main>
    )
  }

  return (
    <main className="mx-auto max-w-4xl px-6 py-16">
      <article>
        <h1 className="u-heading text-3xl leading-[1.15]">{project.title}</h1>
        <p className="u-prose mt-3 text-[var(--color-muted)]">{project.summary}</p>

        <dl className="mt-8 flex flex-col gap-4 border-y border-[var(--color-border)] py-6">
          <div className="flex gap-4">
            <dt className="u-mono w-24 shrink-0 text-[10px] text-[var(--color-dim)]">
              {dict.project.result}
            </dt>
            <dd className="text-sm text-[var(--color-text)]">{project.result}</dd>
          </div>
          <div className="flex gap-4">
            <dt className="u-mono w-24 shrink-0 text-[10px] text-[var(--color-dim)]">
              {dict.project.stack}
            </dt>
            <dd className="u-mono text-[10px] text-[var(--color-muted)]">
              {project.stack.join(' · ')}
            </dd>
          </div>
        </dl>

        <div className="mt-10">
          <Mdx source={project.body} />
        </div>

        <div className="u-mono mt-10 flex gap-6 text-[11px]">
          {project.repoUrl ? (
            <a href={project.repoUrl} className="text-[var(--color-accent)] hover:underline">
              {dict.project.repository} ↗
            </a>
          ) : null}
          {project.demoUrl ? (
            <a href={project.demoUrl} className="text-[var(--color-accent)] hover:underline">
              {dict.project.demo} ↗
            </a>
          ) : null}
        </div>
      </article>

      <Link
        href={`/${lang}#projects`}
        className="u-mono mt-16 inline-block text-[11px] text-[var(--color-accent)] hover:underline"
      >
        ← {dict.home.featuredProjects}
      </Link>
    </main>
  )
}
