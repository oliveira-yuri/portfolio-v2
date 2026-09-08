import type { Metadata } from 'next'
import type { ReactNode } from 'react'
import { notFound } from 'next/navigation'
import { Recursive } from 'next/font/google'
import { Analytics } from '@vercel/analytics/next'
import { LANGS, isLang, type Lang } from '@/lib/content/types'
import { SiteHeader } from '@/components/SiteHeader'
import { getDictionary } from '@/lib/i18n/dictionaries'
import { SITE_NAME, SITE_URL } from '@/lib/site'
import '../globals.css'

const recursive = Recursive({
  subsets: ['latin', 'latin-ext'],
  axes: ['CASL', 'MONO', 'slnt'],
  display: 'swap',
  variable: '--font-recursive',
})

const OG_LOCALES: Record<Lang, string> = { pt: 'pt_BR', en: 'en_US' }

// The description reaches search results and link previews, so it is
// interface text and therefore mandatory in both languages (spec §3.4).
// A static `metadata` export cannot see `params`, which is why this is a
// `generateMetadata` — do not fold it back into a constant.
export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: string }>
}): Promise<Metadata> {
  const { lang } = await params
  if (!isLang(lang)) notFound()

  const dict = getDictionary(lang)

  return {
    metadataBase: new URL(SITE_URL),
    title: { default: SITE_NAME, template: `%s · ${SITE_NAME}` },
    description: dict.home.siteDescription,
    openGraph: {
      type: 'website',
      siteName: SITE_NAME,
      locale: OG_LOCALES[lang],
      description: dict.home.siteDescription,
    },
    twitter: { card: 'summary_large_image', description: dict.home.siteDescription },
  }
}

export function generateStaticParams() {
  return LANGS.map((lang) => ({ lang }))
}

export default async function LangLayout({
  children,
  params,
}: {
  children: ReactNode
  params: Promise<{ lang: string }>
}) {
  const { lang } = await params
  if (!isLang(lang)) notFound()

  return (
    <html lang={lang} className={recursive.variable}>
      <body>
        <div className="min-h-screen">
          <SiteHeader lang={lang} />
          {children}
        </div>
        <Analytics />
      </body>
    </html>
  )
}
