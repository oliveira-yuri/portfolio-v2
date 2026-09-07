import type { Metadata } from 'next'
import type { ReactNode } from 'react'
import { notFound } from 'next/navigation'
import { Recursive } from 'next/font/google'
import { LANGS, isLang } from '@/lib/content/types'
import { SiteHeader } from '@/components/SiteHeader'
import { SITE_NAME, SITE_URL } from '@/lib/site'
import '../globals.css'

const recursive = Recursive({
  subsets: ['latin', 'latin-ext'],
  axes: ['CASL', 'MONO', 'slnt'],
  display: 'swap',
  variable: '--font-recursive',
})

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: { default: SITE_NAME, template: `%s · ${SITE_NAME}` },
  description: 'Portfólio e newsletter sobre dados e inteligência artificial.',
  openGraph: { type: 'website', siteName: SITE_NAME },
  twitter: { card: 'summary_large_image' },
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
      </body>
    </html>
  )
}
