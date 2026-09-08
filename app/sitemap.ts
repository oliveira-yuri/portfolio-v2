import type { MetadataRoute } from 'next'
import { LANGS } from '@/lib/content/types'
import { getPosts } from '@/lib/content/posts'
import { getProjects } from '@/lib/content/projects'
import { SITE_URL } from '@/lib/site'

export const dynamic = 'force-static'

export default function sitemap(): MetadataRoute.Sitemap {
  // Home and newsletter index genuinely re-render whenever any content
  // changes, so the build time is their real modification time.
  const roots = LANGS.flatMap((lang) => [
    { url: `${SITE_URL}/${lang}`, priority: 1, lastModified: new Date() },
    { url: `${SITE_URL}/${lang}/newsletter`, priority: 0.8, lastModified: new Date() },
  ])

  // Built from getPosts/getProjects, not the slug lists: those emit every slug
  // for BOTH languages, including pages that only render a "no translation"
  // notice. Submitting those to search engines would index placeholders as
  // content. These readers already filter to translations that exist.
  //
  // Posts carry their own frontmatter date, so lastModified reflects when
  // the content actually changed rather than when the site was last built.
  const posts = LANGS.flatMap((lang) =>
    getPosts(lang).map((post) => ({
      url: `${SITE_URL}/${lang}/newsletter/${post.slug}`,
      priority: 0.6,
      lastModified: new Date(post.date),
    })),
  )

  // Projects have no date field in their frontmatter. Stamping them with the
  // build time or a made-up date would be a worse lie than saying nothing —
  // lastModified is optional, so these entries omit it entirely. Do not
  // "complete" this later by adding a build-time or invented date.
  const projects = LANGS.flatMap((lang) =>
    getProjects(lang).map((project) => ({
      url: `${SITE_URL}/${lang}/projects/${project.slug}`,
      priority: 0.7,
    })),
  )

  return [...roots, ...projects, ...posts]
}
