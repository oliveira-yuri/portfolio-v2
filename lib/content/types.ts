export type Lang = 'pt' | 'en'

export const LANGS = ['pt', 'en'] as const satisfies readonly Lang[]

export const DEFAULT_LANG: Lang = 'pt'

export function isLang(value: string): value is Lang {
  return (LANGS as readonly string[]).includes(value)
}
