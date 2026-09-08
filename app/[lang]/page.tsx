import { notFound } from 'next/navigation'
import { isLang } from '@/lib/content/types'
import { getProfile } from '@/lib/content/profile'
import { getProjects } from '@/lib/content/projects'
import { getPosts } from '@/lib/content/posts'
import { Hero } from '@/components/home/Hero'
import { FeaturedProjects } from '@/components/home/FeaturedProjects'
import { Timeline } from '@/components/home/Timeline'
import { Credentials } from '@/components/home/Credentials'
import { Skills } from '@/components/home/Skills'
import { LatestPosts } from '@/components/home/LatestPosts'
import { Contact } from '@/components/home/Contact'

export default async function HomePage({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params
  if (!isLang(lang)) notFound()

  const profile = getProfile(lang)

  return (
    <main className="mx-auto max-w-4xl px-6 pb-24">
      <Hero lang={lang} profile={profile} />
      <FeaturedProjects lang={lang} projects={getProjects(lang)} />
      <Timeline lang={lang} items={profile.experience} />
      <Credentials
        lang={lang}
        education={profile.education}
        certifications={profile.certifications}
      />
      <Skills lang={lang} groups={profile.skills} />
      <LatestPosts lang={lang} posts={getPosts(lang).slice(0, 3)} />
      <Contact lang={lang} profile={profile} />
    </main>
  )
}
