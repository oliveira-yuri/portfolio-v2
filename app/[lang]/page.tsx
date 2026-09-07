import { notFound } from 'next/navigation'
import { isLang } from '@/lib/content/types'
import { getProfile } from '@/lib/content/profile'

export default async function HomePage({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params
  if (!isLang(lang)) notFound()
  const profile = getProfile(lang)

  return (
    <main className="mx-auto max-w-4xl px-6 py-16">
      <h1 className="u-heading text-4xl">{profile.tagline}</h1>
    </main>
  )
}
