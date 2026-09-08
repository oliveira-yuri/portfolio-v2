import path from 'node:path'
import type { Lang } from './types'

/**
 * Where MDX content is read from.
 *
 * `CONTENT_ROOT_OVERRIDE` exists so the unit tests can point the loaders at
 * `tests/fixtures/content` instead of the real `content/` directory. That
 * matters because the site ships with no articles yet: without fixtures, the
 * translation-fallback and sort-order tests would have nothing to run against
 * and would quietly pass on empty input. Nothing in the app or the build sets
 * this variable.
 */
export function contentRoot(): string {
  return process.env.CONTENT_ROOT_OVERRIDE ?? path.join(process.cwd(), 'content')
}

export function contentDir(kind: 'posts' | 'projects', lang: Lang): string {
  return path.join(contentRoot(), kind, lang)
}
