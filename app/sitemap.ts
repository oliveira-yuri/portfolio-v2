import type { MetadataRoute } from 'next'
import { LANGS } from '@/lib/content/types'
import { getPosts } from '@/lib/content/posts'
import { getProjects } from '@/lib/content/projects'
import { SITE_URL } from '@/lib/site'

export const dynamic = 'force-static'

export default function sitemap(): MetadataRoute.Sitemap {
  const roots = LANGS.flatMap((lang) => [
    { url: `${SITE_URL}/${lang}`, priority: 1 },
    { url: `${SITE_URL}/${lang}/newsletter`, priority: 0.8 },
  ])

  // Built from getPosts/getProjects, not the slug lists: those emit every slug
  // for BOTH languages, including pages that only render a "no translation"
  // notice. Submitting those to search engines would index placeholders as
  // content. These readers already filter to translations that exist.
  const posts = LANGS.flatMap((lang) =>
    getPosts(lang).map((post) => ({
      url: `${SITE_URL}/${lang}/newsletter/${post.slug}`,
      priority: 0.6,
    })),
  )

  const projects = LANGS.flatMap((lang) =>
    getProjects(lang).map((project) => ({
      url: `${SITE_URL}/${lang}/projects/${project.slug}`,
      priority: 0.7,
    })),
  )

  return [...roots, ...projects, ...posts].map((entry) => ({
    ...entry,
    lastModified: new Date(),
  }))
}
