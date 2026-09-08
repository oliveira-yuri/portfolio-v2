import { ImageResponse } from 'next/og'
import { LANGS, isLang } from '@/lib/content/types'
import { getProfile } from '@/lib/content/profile'
import { SITE_URL } from '@/lib/site'

// `alt` has to be a static export — it cannot see `params`, and the
// generateImageMetadata alternative that can is rejected by the static export
// ("Cannot find module for page: /[lang]/opengraph-image"). So this string is
// deliberately language-neutral rather than Portuguese served to English
// readers; the image itself is per-language.
export const alt = 'Yuri Oliveira — Dados & IA / Data & AI'
export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'

// One image per language, generated at build time so `output: 'export'` can
// emit it as a static file (spec §7: the link has to look presentable when
// shared on LinkedIn).
export function generateStaticParams() {
  return LANGS.map((lang) => ({ lang }))
}

/**
 * Hardcoded hex is correct here, and only here. Satori (the renderer behind
 * ImageResponse) resolves a deliberately small CSS subset: flexbox only, no
 * CSS custom properties, no stylesheets, no class names. The `--color-*`
 * tokens from app/globals.css simply do not exist in this rendering context,
 * so the values from lib/design/tokens.ts are inlined literally. If the
 * palette changes there, change it here too.
 *
 * The type is Satori's built-in sans rather than Recursive: embedding the site
 * font would mean shipping a font file just for this one image. The palette
 * carries the terminal identity on its own here.
 */
const BG = '#0A0C0B'
const TEXT = '#E6F2EB'
const ACCENT = '#4ADE80'
const DIM = '#6F827A'
const BORDER = '#1C2421'

export default async function OpengraphImage({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params
  const profile = getProfile(isLang(lang) ? lang : 'pt')
  const host = SITE_URL.replace(/^https?:\/\//, '')

  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          backgroundColor: BG,
          color: TEXT,
          padding: '72px 80px',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', fontSize: 26, color: DIM }}>
          <span style={{ color: ACCENT, marginRight: 16 }}>$</span>
          <span>{host}</span>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <div style={{ display: 'flex', fontSize: 76, fontWeight: 700, letterSpacing: '-0.02em' }}>
            {profile.name}
          </div>
          <div style={{ display: 'flex', fontSize: 36, color: ACCENT, marginTop: 20 }}>
            {profile.role}
          </div>
          <div style={{ display: 'flex', fontSize: 30, color: DIM, marginTop: 24 }}>
            {profile.tagline}
          </div>
        </div>

        <div
          style={{
            display: 'flex',
            borderTop: `2px solid ${BORDER}`,
            paddingTop: 28,
            fontSize: 24,
            color: DIM,
          }}
        >
          {profile.stack.slice(0, 5).join('  ·  ')}
        </div>
      </div>
    ),
    size,
  )
}
