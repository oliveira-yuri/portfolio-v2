import { profile as ptProfile } from '@/content/profile/pt'
import { profile as enProfile } from '@/content/profile/en'
import { assertPublishable, profileSchema } from './schema'
import type { Lang, Profile } from './types'

const RAW: Record<Lang, unknown> = { pt: ptProfile, en: enProfile }

export function getProfile(lang: Lang): Profile {
  const parsed = profileSchema.safeParse(RAW[lang])

  if (!parsed.success) {
    const details = parsed.error.issues
      .map((issue) => `${issue.path.join('.') || '(raiz)'}: ${issue.message}`)
      .join('; ')
    throw new Error(`Perfil inválido em content/profile/${lang}.ts → ${details}`)
  }

  assertPublishable(parsed.data.placeholder, `content/profile/${lang}.ts`)
  return parsed.data
}
