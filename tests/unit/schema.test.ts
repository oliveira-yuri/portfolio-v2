import { afterEach, describe, expect, it, vi } from 'vitest'
import {
  assertPublishable,
  postFrontmatterSchema,
  projectFrontmatterSchema,
} from '@/lib/content/schema'

const validPost = {
  title: 'Como limpei 40 mil linhas',
  summary: 'Um roteiro de limpeza que não desfaz o próprio trabalho.',
  date: '2026-03-14',
  tags: ['dados', 'pandas'],
}

describe('postFrontmatterSchema', () => {
  it('accepts valid frontmatter', () => {
    const parsed = postFrontmatterSchema.parse(validPost)
    expect(parsed.title).toBe(validPost.title)
  })

  it('defaults placeholder to false when absent', () => {
    expect(postFrontmatterSchema.parse(validPost).placeholder).toBe(false)
  })

  it('defaults tags to an empty array when absent', () => {
    const { tags, ...withoutTags } = validPost
    expect(postFrontmatterSchema.parse(withoutTags).tags).toEqual([])
  })

  it('rejects a missing title', () => {
    const { title, ...withoutTitle } = validPost
    expect(() => postFrontmatterSchema.parse(withoutTitle)).toThrow()
  })

  it('rejects an empty title', () => {
    expect(() => postFrontmatterSchema.parse({ ...validPost, title: '' })).toThrow()
  })

  it('rejects a date that is not ISO yyyy-mm-dd', () => {
    expect(() => postFrontmatterSchema.parse({ ...validPost, date: '14/03/2026' })).toThrow()
  })

  it('rejects a calendar-invalid date', () => {
    expect(() => postFrontmatterSchema.parse({ ...validPost, date: '2026-02-30' })).toThrow()
  })
})

describe('projectFrontmatterSchema', () => {
  const validProject = {
    title: 'Previsão de churn',
    summary: 'Modelo que antecipa cancelamento em 30 dias.',
    result: 'Recall de 0.81 na base de validação.',
    stack: ['Python', 'scikit-learn'],
    order: 1,
  }

  it('accepts valid frontmatter', () => {
    expect(projectFrontmatterSchema.parse(validProject).order).toBe(1)
  })

  it('requires a result, because a case study without one proves nothing', () => {
    const { result, ...withoutResult } = validProject
    expect(() => projectFrontmatterSchema.parse(withoutResult)).toThrow()
  })

  it('rejects an empty stack', () => {
    expect(() => projectFrontmatterSchema.parse({ ...validProject, stack: [] })).toThrow()
  })
})

describe('assertPublishable', () => {
  afterEach(() => {
    vi.unstubAllEnvs()
  })

  it('allows placeholder content on an ordinary build', () => {
    expect(() => assertPublishable(true, 'content/posts/pt/exemplo.mdx')).not.toThrow()
  })

  it('allows placeholder content on a Vercel preview deployment', () => {
    vi.stubEnv('VERCEL_ENV', 'preview')
    expect(() => assertPublishable(true, 'content/posts/pt/exemplo.mdx')).not.toThrow()
  })

  it('throws on a Vercel production deployment, naming the file', () => {
    vi.stubEnv('VERCEL_ENV', 'production')
    expect(() => assertPublishable(true, 'content/posts/pt/exemplo.mdx')).toThrow(
      /content\/posts\/pt\/exemplo\.mdx/,
    )
  })

  it('throws when STRICT_CONTENT is opted into', () => {
    vi.stubEnv('STRICT_CONTENT', '1')
    expect(() => assertPublishable(true, 'content/posts/pt/exemplo.mdx')).toThrow()
  })

  it('allows real content on a production deployment', () => {
    vi.stubEnv('VERCEL_ENV', 'production')
    expect(() => assertPublishable(false, 'content/posts/pt/real.mdx')).not.toThrow()
  })
})
