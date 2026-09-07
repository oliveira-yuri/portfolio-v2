import { describe, expect, it } from 'vitest'
import { getProject, getProjects, getProjectSlugs } from '@/lib/content/projects'
import { isTranslationMissing } from '@/lib/content/posts'

describe('getProjects', () => {
  it('returns projects for both languages', () => {
    expect(getProjects('pt').length).toBeGreaterThanOrEqual(1)
    expect(getProjects('en').length).toBeGreaterThanOrEqual(1)
  })

  it('sorts ascending by order', () => {
    const orders = getProjects('pt').map((p) => p.order)
    expect(orders).toEqual([...orders].sort((a, b) => a - b))
  })

  it('always carries a result, since a case study without one proves nothing', () => {
    for (const project of getProjects('pt')) {
      expect(project.result.length).toBeGreaterThan(0)
    }
  })
})

describe('getProject', () => {
  it('returns a project with a body', () => {
    const project = getProject('pt', 'exemplo-churn')
    expect(project).not.toBeNull()
    if (project && !isTranslationMissing(project)) {
      expect(project.body.length).toBeGreaterThan(0)
      expect(project.stack.length).toBeGreaterThan(0)
    }
  })

  it('returns null for an unknown slug', () => {
    expect(getProject('pt', 'projeto-inexistente')).toBeNull()
  })
})

describe('getProjectSlugs', () => {
  it('has no duplicates', () => {
    const pairs = getProjectSlugs().map((p) => `${p.lang}/${p.slug}`)
    expect(new Set(pairs).size).toBe(pairs.length)
  })
})
