import fs from 'node:fs'
import path from 'node:path'
import matter from 'gray-matter'
import readingTime from 'reading-time'
import { contentDir } from './paths'
import { assertPublishable, postFrontmatterSchema } from './schema'
import { LANGS, type Lang, type Post, type PostMeta, type TranslationMissing } from './types'

export function isTranslationMissing(value: unknown): value is TranslationMissing {
  return (
    typeof value === 'object' &&
    value !== null &&
    (value as { kind?: unknown }).kind === 'translation-missing'
  )
}

function listSlugs(lang: Lang): string[] {
  const dir = contentDir('posts', lang)
  if (!fs.existsSync(dir)) return []
  return fs
    .readdirSync(dir)
    .filter((file) => file.endsWith('.mdx'))
    .map((file) => file.replace(/\.mdx$/, ''))
}

function readPost(lang: Lang, slug: string): Post | null {
  const file = path.join(contentDir('posts', lang), `${slug}.mdx`)
  if (!fs.existsSync(file)) return null

  const raw = fs.readFileSync(file, 'utf8')
  const { data, content } = matter(raw)
  const parsed = postFrontmatterSchema.safeParse(data)

  if (!parsed.success) {
    const details = parsed.error.issues
      .map((issue) => `${issue.path.join('.') || '(raiz)'}: ${issue.message}`)
      .join('; ')
    throw new Error(`Frontmatter inválido em ${file} → ${details}`)
  }

  assertPublishable(parsed.data.placeholder, file)

  return {
    ...parsed.data,
    slug,
    lang,
    body: content,
    readingMinutes: Math.max(1, Math.ceil(readingTime(content).minutes)),
  }
}

export function getPosts(lang: Lang): PostMeta[] {
  return listSlugs(lang)
    .map((slug) => readPost(lang, slug))
    .filter((post): post is Post => post !== null)
    .map(({ body: _body, ...meta }) => meta)
    .sort((a, b) => b.date.localeCompare(a.date))
}

export function getPost(lang: Lang, slug: string): Post | TranslationMissing | null {
  const direct = readPost(lang, slug)
  if (direct) return direct

  // The probe below reads the post in the other language through readPost,
  // which runs assertPublishable on it. That is deliberate: it means the
  // "read it in the other language" notice can only ever point at an article
  // that is actually publishable — a placeholder-only fallback throws instead
  // of being offered as a substitute. Do not "simplify" this into a bare
  // fs.existsSync check; that would let the notice link to example content in
  // production.
  const fallbackLang = LANGS.find((candidate) => candidate !== lang && readPost(candidate, slug))
  if (!fallbackLang) return null

  return {
    kind: 'translation-missing',
    slug,
    requestedLang: lang,
    availableLang: fallbackLang,
  }
}

export function getPostSlugs(): { lang: Lang; slug: string }[] {
  // Union of slugs across both languages: a slug that exists in only one
  // language still needs a page for the other language so Task 8's
  // "no translation" notice has somewhere to render, instead of 404ing.
  const everySlug = new Set(LANGS.flatMap((lang) => listSlugs(lang)))
  return LANGS.flatMap((lang) => [...everySlug].map((slug) => ({ lang, slug })))
}
