export type Lang = 'pt' | 'en'

export const LANGS = ['pt', 'en'] as const satisfies readonly Lang[]

export const DEFAULT_LANG: Lang = 'pt'

export function isLang(value: string): value is Lang {
  return (LANGS as readonly string[]).includes(value)
}

export type PostMeta = {
  slug: string
  lang: Lang
  title: string
  summary: string
  date: string
  tags: string[]
  readingMinutes: number
  placeholder: boolean
}

export type Post = PostMeta & { body: string }

export type ProjectMeta = {
  slug: string
  lang: Lang
  title: string
  summary: string
  result: string
  stack: string[]
  order: number
  repoUrl?: string
  demoUrl?: string
  placeholder: boolean
}

export type Project = ProjectMeta & { body: string }

export type TranslationMissing = {
  kind: 'translation-missing'
  slug: string
  requestedLang: Lang
  availableLang: Lang
}

export type ExperienceItem = {
  role: string
  organization: string
  start: string
  end: string | null
  description: string
}

export type EducationItem = {
  title: string
  institution: string
  year: string
}

export type CertificationItem = {
  title: string
  issuer: string
  year: string
  url?: string
}

export type SkillGroup = {
  label: string
  items: string[]
}

export type Profile = {
  name: string
  role: string
  tagline: string
  available: boolean
  stack: string[]
  email: string
  linkedinUrl: string
  githubUrl: string
  cvPath: string
  experience: ExperienceItem[]
  education: EducationItem[]
  certifications: CertificationItem[]
  skills: SkillGroup[]
  placeholder: boolean
}
