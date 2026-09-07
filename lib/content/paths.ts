import path from 'node:path'
import type { Lang } from './types'

export const CONTENT_ROOT = path.join(process.cwd(), 'content')

export function contentDir(kind: 'posts' | 'projects', lang: Lang): string {
  return path.join(CONTENT_ROOT, kind, lang)
}
