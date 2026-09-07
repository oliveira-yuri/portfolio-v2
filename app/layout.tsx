import type { ReactNode } from 'react'
import { Recursive } from 'next/font/google'
import './globals.css'

const recursive = Recursive({
  subsets: ['latin', 'latin-ext'],
  axes: ['CASL', 'MONO', 'slnt'],
  display: 'swap',
  variable: '--font-recursive',
})

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="pt" className={recursive.variable}>
      <body>{children}</body>
    </html>
  )
}
