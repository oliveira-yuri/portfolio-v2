import fs from 'node:fs'
import path from 'node:path'
import matter from 'gray-matter'
import { contentDir } from './paths'
import { assertPublishable, projectFrontmatterSchema } from './schema'
import { LANGS, type Lang, type Project, type ProjectMeta, type TranslationMissing } from './types'

function listSlugs(lang: Lang): string[] {
  const dir = contentDir('projects', lang)
  if (!fs.existsSync(dir)) return []
  return fs
    .readdirSync(dir)
    .filter((file) => file.endsWith('.mdx'))
    .map((file) => file.replace(/\.mdx$/, ''))
}

function readProject(lang: Lang, slug: string): Project | null {
  const file = path.join(contentDir('projects', lang), `${slug}.mdx`)
  if (!fs.existsSync(file)) return null

  const { data, content } = matter(fs.readFileSync(file, 'utf8'))
  const parsed = projectFrontmatterSchema.safeParse(data)

  if (!parsed.success) {
    const details = parsed.error.issues
      .map((issue) => `${issue.path.join('.') || '(raiz)'}: ${issue.message}`)
      .join('; ')
    throw new Error(`Frontmatter inválido em ${file} → ${details}`)
  }

  assertPublishable(parsed.data.placeholder, file)

  return { ...parsed.data, slug, lang, body: content }
}

export function getProjects(lang: Lang): ProjectMeta[] {
  return listSlugs(lang)
    .map((slug) => readProject(lang, slug))
    .filter((project): project is Project => project !== null)
    .map(({ body: _body, ...meta }) => meta)
    .sort((a, b) => a.order - b.order)
}

export function getProject(lang: Lang, slug: string): Project | TranslationMissing | null {
  const direct = readProject(lang, slug)
  if (direct) return direct

  // The probe below calls readProject on the fallback language, which itself
  // calls assertPublishable. So this "no translation" notice can only point
  // at content that is actually publishable — a placeholder-only fallback
  // throws instead of being offered as a substitute. Do not "simplify" this
  // into a raw file check; that would let the notice link to example content
  // in production.
  const fallbackLang = LANGS.find(
    (candidate) => candidate !== lang && readProject(candidate, slug),
  )
  if (!fallbackLang) return null

  return { kind: 'translation-missing', slug, requestedLang: lang, availableLang: fallbackLang }
}

export function getProjectSlugs(): { lang: Lang; slug: string }[] {
  const everySlug = new Set(LANGS.flatMap((lang) => listSlugs(lang)))
  return LANGS.flatMap((lang) => [...everySlug].map((slug) => ({ lang, slug })))
}
