# Portfólio + Newsletter (Dados & IA) — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a bilingual (pt/en), statically exported personal portfolio with an MDX-based newsletter, in a dark terminal aesthetic, publishable by `git push`.

**Architecture:** Next.js App Router with `output: 'export'` produces plain HTML — no server, no database. All content lives in `content/` as MDX and typed TS, read exclusively through one module (`lib/content/`) that validates everything with Zod at build time. Routes are `app/[lang]/…` with `generateStaticParams` emitting `pt` and `en`.

**Tech Stack:** Next.js 16.3.4, React 19.2, Tailwind CSS 4.3, `next-mdx-remote` 6 (RSC), `gray-matter`, `remark-gfm`, `rehype-pretty-code`, Zod 4, Vitest 5, Playwright 1.63, `@vercel/analytics` 2.

**Spec:** `docs/superpowers/specs/2026-09-07-portfolio-dados-ia-design.md` — read it alongside this plan.

**Repository:** <https://github.com/oliveira-yuri/portfolio-v2> (branch `main`)

## Global Constraints

Every task's requirements implicitly include this section.

- **Node 20+**, package manager `npm`. Exact versions to install are pinned in Task 1.
- **`output: 'export'` is non-negotiable.** No server actions, no route handlers that are not `force-static`, no `next/image` optimization loader, no middleware. If a feature needs a server, it is out of scope.
- **Languages are exactly `pt` and `en`.** `pt` is the default. The union type `Lang = 'pt' | 'en'` is defined once in `lib/content/types.ts` and imported everywhere; never re-declare it, never widen it to `string`.
- **URL path segments are English in both languages**: `/pt/projects/…`, `/pt/newsletter/…`. Never `/pt/projetos/…`.
- **Pages never read the filesystem.** Only `lib/content/**` uses `node:fs`. A page importing `fs` is a defect.
- **Color tokens (verified WCAG AA, do not alter without re-measuring):**
  `bg #0A0C0B` · `surface #0D1110` · `border #1C2421` · `text #E6F2EB` · `muted #8FA39A` · `dim #6F827A` · `accent #4ADE80`
- **Typography:** single family Recursive via `next/font/google` with `axes: ['CASL','MONO','slnt']`. The `MONO` axis varies by context — mono `1.0` for UI/metadata/code, `0.5` for headings, `0.3` for prose. Prose is 17px / line-height 1.8 / max-width 64ch. These values are load-bearing for readability; do not "simplify" them away.
- **`placeholder: true` content must fail the production build** (implemented in Task 3, enforced from then on).
- **Commit after every task.** Conventional commit prefixes (`feat:`, `test:`, `chore:`, `fix:`).
- **All prose visible to users is written in the content layer, not hardcoded in components.** UI strings live in `lib/i18n/dictionaries.ts`.

---

### Task 1: Project foundation — scaffold, static export, test runner

**Files:**
- Create: `package.json`, `next.config.ts`, `tsconfig.json`, `postcss.config.mjs`, `vitest.config.ts`
- Create: `app/layout.tsx`, `app/globals.css`
- Create: `tests/unit/smoke.test.ts`
- Modify: `.gitignore` (already exists — verify it covers `node_modules`, `.next`, `out`)

**Interfaces:**
- Consumes: nothing (first task).
- Produces: a working `npm run build` that emits `out/`, and `npm run test` running Vitest against `tests/unit/**/*.test.ts`. Path alias `@/*` → repo root.

- [ ] **Step 1: Initialize package.json and install pinned dependencies**

Run from repo root:

```bash
npm init -y
npm install next@16.3.4 react@19.2.8 react-dom@19.2.8
npm install -D typescript@5 @types/node@24 @types/react@19 @types/react-dom@19 \
  tailwindcss@4.3.3 @tailwindcss/postcss@4.3.3 vitest@5.0.0
```

- [ ] **Step 2: Write package.json scripts**

Replace the `"scripts"` block in `package.json` with:

```json
{
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "npx serve out",
    "test": "vitest run",
    "test:watch": "vitest"
  }
}
```

Also add `"private": true` and `"type": "module"` at the top level.

- [ ] **Step 3: Create tsconfig.json**

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "lib": ["dom", "dom.iterable", "ES2022"],
    "allowJs": false,
    "skipLibCheck": true,
    "strict": true,
    "noEmit": true,
    "esModuleInterop": true,
    "module": "esnext",
    "moduleResolution": "bundler",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "jsx": "preserve",
    "incremental": true,
    "plugins": [{ "name": "next" }],
    "paths": { "@/*": ["./*"] }
  },
  "include": ["next-env.d.ts", "**/*.ts", "**/*.tsx", ".next/types/**/*.ts"],
  "exclude": ["node_modules", "out"]
}
```

- [ ] **Step 4: Create next.config.ts for static export**

```ts
import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  output: 'export',
  trailingSlash: true,
  images: { unoptimized: true },
}

export default nextConfig
```

`trailingSlash: true` makes every route emit `<route>/index.html`, which serves correctly on any static host. `images.unoptimized` is required because export has no image optimizer.

- [ ] **Step 5: Create postcss.config.mjs**

```js
export default {
  plugins: {
    '@tailwindcss/postcss': {},
  },
}
```

- [ ] **Step 6: Create app/globals.css (tokens come in Task 2, this is the minimum to build)**

```css
@import "tailwindcss";

body {
  background: #0A0C0B;
  color: #E6F2EB;
}
```

- [ ] **Step 7: Create app/layout.tsx**

```tsx
import type { ReactNode } from 'react'
import './globals.css'

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="pt">
      <body>{children}</body>
    </html>
  )
}
```

- [ ] **Step 8: Create vitest.config.ts**

```ts
import { defineConfig } from 'vitest/config'
import path from 'node:path'

export default defineConfig({
  test: {
    environment: 'node',
    include: ['tests/unit/**/*.test.ts'],
  },
  resolve: {
    alias: { '@': path.resolve(process.cwd()) },
  },
})
```

- [ ] **Step 9: Write a failing smoke test**

`tests/unit/smoke.test.ts`:

```ts
import { describe, expect, it } from 'vitest'
import { LANGS } from '@/lib/content/types'

describe('project foundation', () => {
  it('declares exactly the two supported languages', () => {
    expect(LANGS).toEqual(['pt', 'en'])
  })
})
```

- [ ] **Step 10: Run the test to verify it fails**

Run: `npm run test`
Expected: FAIL — `Failed to resolve import "@/lib/content/types"`.

- [ ] **Step 11: Create lib/content/types.ts with the language constants only**

```ts
export type Lang = 'pt' | 'en'

export const LANGS = ['pt', 'en'] as const satisfies readonly Lang[]

export const DEFAULT_LANG: Lang = 'pt'

export function isLang(value: string): value is Lang {
  return (LANGS as readonly string[]).includes(value)
}
```

- [ ] **Step 12: Run the test to verify it passes**

Run: `npm run test`
Expected: PASS — 1 test.

- [ ] **Step 13: Create a placeholder home page so the build has a route**

`app/page.tsx`:

```tsx
export default function RootPage() {
  return <main>Em construção</main>
}
```

- [ ] **Step 14: Verify the static export builds**

Run: `npm run build`
Expected: build succeeds and `out/index.html` exists.

Confirm with: `ls out/index.html`

- [ ] **Step 15: Verify .gitignore covers build output**

Read `.gitignore`. It must contain `node_modules/`, `.next/`, `out/`. It already does — if any line is missing, add it.

- [ ] **Step 16: Commit**

```bash
git add -A
git commit -m "chore: scaffold Next.js static export with Vitest"
```

---

### Task 2: Design tokens, Recursive font, and an automated contrast gate

**Files:**
- Modify: `app/globals.css`
- Modify: `app/layout.tsx`
- Create: `lib/design/tokens.ts`
- Create: `lib/design/contrast.ts`
- Create: `tests/unit/contrast.test.ts`

**Interfaces:**
- Consumes: `lib/content/types.ts` (nothing yet), the build from Task 1.
- Produces:
  - `lib/design/tokens.ts` exporting `COLORS: Record<'bg'|'surface'|'border'|'text'|'muted'|'dim'|'accent', string>`
  - `lib/design/contrast.ts` exporting `contrastRatio(hexA: string, hexB: string): number`
  - CSS custom properties `--color-bg`, `--color-surface`, `--color-border`, `--color-text`, `--color-muted`, `--color-dim`, `--color-accent`, and `--font-recursive`
  - Utility classes `.u-mono`, `.u-heading`, `.u-prose` used by every later task

The contrast test is the mechanism the spec requires: it makes a palette change that breaks AA fail CI, rather than relying on someone remembering to check.

- [ ] **Step 1: Write the failing contrast test**

`tests/unit/contrast.test.ts`:

```ts
import { describe, expect, it } from 'vitest'
import { COLORS } from '@/lib/design/tokens'
import { contrastRatio } from '@/lib/design/contrast'

const AA_NORMAL = 4.5

describe('contrastRatio', () => {
  it('returns 21 for black on white', () => {
    expect(contrastRatio('#000000', '#FFFFFF')).toBeCloseTo(21, 1)
  })

  it('returns 1 for identical colors', () => {
    expect(contrastRatio('#4ADE80', '#4ADE80')).toBeCloseTo(1, 5)
  })

  it('is order independent', () => {
    expect(contrastRatio('#0A0C0B', '#E6F2EB')).toBeCloseTo(
      contrastRatio('#E6F2EB', '#0A0C0B'),
      5,
    )
  })
})

describe('palette meets WCAG AA on every surface it is used on', () => {
  const foregrounds = ['text', 'muted', 'dim', 'accent'] as const
  const backgrounds = ['bg', 'surface'] as const

  for (const fg of foregrounds) {
    for (const bg of backgrounds) {
      it(`${fg} on ${bg} reaches ${AA_NORMAL}:1`, () => {
        expect(contrastRatio(COLORS[fg], COLORS[bg])).toBeGreaterThanOrEqual(AA_NORMAL)
      })
    }
  }
})
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `npm run test`
Expected: FAIL — cannot resolve `@/lib/design/tokens`.

- [ ] **Step 3: Create lib/design/tokens.ts**

```ts
/**
 * Verified against WCAG AA on 2026-09-07. Changing any value here without
 * re-running tests/unit/contrast.test.ts is a defect.
 */
export const COLORS = {
  bg: '#0A0C0B',
  surface: '#0D1110',
  border: '#1C2421',
  text: '#E6F2EB',
  muted: '#8FA39A',
  dim: '#6F827A',
  accent: '#4ADE80',
} as const

export type ColorToken = keyof typeof COLORS
```

- [ ] **Step 4: Create lib/design/contrast.ts**

```ts
function channelToLinear(channel: number): number {
  const c = channel / 255
  return c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4
}

function relativeLuminance(hex: string): number {
  const normalized = hex.replace('#', '')
  if (!/^[0-9a-fA-F]{6}$/.test(normalized)) {
    throw new Error(`Expected a 6-digit hex color, received: ${hex}`)
  }
  const r = parseInt(normalized.slice(0, 2), 16)
  const g = parseInt(normalized.slice(2, 4), 16)
  const b = parseInt(normalized.slice(4, 6), 16)
  return (
    0.2126 * channelToLinear(r) +
    0.7152 * channelToLinear(g) +
    0.0722 * channelToLinear(b)
  )
}

export function contrastRatio(hexA: string, hexB: string): number {
  const a = relativeLuminance(hexA)
  const b = relativeLuminance(hexB)
  const lighter = Math.max(a, b)
  const darker = Math.min(a, b)
  return (lighter + 0.05) / (darker + 0.05)
}
```

- [ ] **Step 5: Run the test to verify it passes**

Run: `npm run test`
Expected: PASS — 11 tests (3 for `contrastRatio`, 8 palette combinations).

- [ ] **Step 6: Wire the Recursive font into the root layout**

Replace `app/layout.tsx` with:

```tsx
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
```

Note: do **not** pass `weight` — Recursive is variable and `weight` would freeze it.

Heads-up for later: Task 6 moves this font setup into `app/[lang]/layout.tsx` and
deletes `app/layout.tsx`, so that `<html lang>` can be correct per language. It
lives here for now because the project needs a buildable root layout until the
`[lang]` segment exists.

- [ ] **Step 7: Write the design tokens and typography utilities into globals.css**

Replace `app/globals.css` with:

```css
@import "tailwindcss";

@theme {
  --color-bg: #0A0C0B;
  --color-surface: #0D1110;
  --color-border: #1C2421;
  --color-text: #E6F2EB;
  --color-muted: #8FA39A;
  --color-dim: #6F827A;
  --color-accent: #4ADE80;

  /* Consumes the variable next/font defines on <html>. Must NOT be named
     --font-recursive: that name is next/font's, and a token referring to
     itself resolves to nothing and silently falls back to the browser default. */
  --font-mono: var(--font-recursive), ui-monospace, SFMono-Regular, Menlo, monospace;
}

html {
  background: var(--color-bg);
}

body {
  background: var(--color-bg);
  color: var(--color-text);
  font-family: var(--font-mono);
  font-variation-settings: 'MONO' 0.3, 'CASL' 0.3;
  -webkit-font-smoothing: antialiased;
}

/* Mono-pure: navigation, metadata, labels, stack lists, code. */
.u-mono {
  font-variation-settings: 'MONO' 1, 'CASL' 0;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  font-weight: 500;
}

/* Headings: still recognizably terminal, but not full mono. */
.u-heading {
  font-variation-settings: 'MONO' 0.5, 'CASL' 0.2;
  letter-spacing: -0.02em;
  font-weight: 620;
  text-wrap: balance;
}

/* Long-form prose: the three settings that fix monospace reading fatigue. */
.u-prose {
  font-variation-settings: 'MONO' 0.3, 'CASL' 0.3;
  font-size: 17px;
  line-height: 1.8;
  max-width: 64ch;
  font-weight: 380;
}

code, pre {
  font-variation-settings: 'MONO' 1, 'CASL' 0;
  letter-spacing: 0;
  text-transform: none;
}

:focus-visible {
  outline: 2px solid var(--color-accent);
  outline-offset: 2px;
}

/* Terminal cursor in the hero. */
.u-cursor {
  display: inline-block;
  width: 0.5ch;
  height: 0.95em;
  background: var(--color-accent);
  vertical-align: -0.1em;
  margin-left: 0.18em;
}

@keyframes blink { 50% { opacity: 0; } }

@keyframes reveal-in {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: none; }
}

@media (prefers-reduced-motion: no-preference) {
  .u-cursor {
    animation: blink 1.1s steps(1) infinite;
  }

  /* Scroll reveal with zero JavaScript. Browsers without scroll-driven
     animations simply render the content normally — never invisible. */
  @supports (animation-timeline: view()) {
    .reveal {
      animation: reveal-in linear both;
      animation-timeline: view();
      animation-range: entry 8% cover 26%;
    }
  }
}

@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
    scroll-behavior: auto !important;
  }
}
```

The reveal is deliberately wrapped in **both** `prefers-reduced-motion: no-preference` and `@supports`. The default state of `.reveal` is fully visible; the animation only ever gets attached when the browser supports it and the visitor has not asked for less motion. A reveal implemented the usual way — `opacity: 0` by default, removed by JavaScript — leaves the whole page blank when anything fails. This one cannot.

- [ ] **Step 8: Verify the font and tokens render**

Run: `npm run build`
Expected: build succeeds.

Then run `npm run dev`, open `http://localhost:3000`, and confirm in devtools that `body` resolves `font-family` to a `Recursive`-derived family and that `--color-accent` is `#4ADE80`.

- [ ] **Step 9: Commit**

```bash
git add -A
git commit -m "feat: add design tokens, Recursive font, and WCAG contrast gate"
```

---

### Task 3: Content schemas and the placeholder production guard

**Files:**
- Modify: `lib/content/types.ts`
- Create: `lib/content/schema.ts`
- Create: `tests/unit/schema.test.ts`

**Interfaces:**
- Consumes: `Lang`, `LANGS`, `DEFAULT_LANG`, `isLang` from `lib/content/types.ts`.
- Produces:
  - Types `PostMeta`, `Post`, `ProjectMeta`, `Project`, `TranslationMissing`, `Profile` and its sub-types, in `lib/content/types.ts`
  - `postFrontmatterSchema`, `projectFrontmatterSchema`, `profileSchema` in `lib/content/schema.ts`
  - `assertPublishable(placeholder: boolean, sourcePath: string): void` in `lib/content/schema.ts`

- [ ] **Step 1: Write the failing schema test**

`tests/unit/schema.test.ts`:

```ts
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
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `npm run test`
Expected: FAIL — cannot resolve `@/lib/content/schema`.

- [ ] **Step 3: Install Zod**

```bash
npm install zod@4.5.4
```

- [ ] **Step 4: Extend lib/content/types.ts with the content types**

Append to `lib/content/types.ts` (keep the existing language exports):

```ts
export type PostMeta = {
  slug: string
  lang: Lang
  title: string
  summary: string
  date: string
  tags: string[]
  readingMinutes: number
  placeholder: boolean
}

export type Post = PostMeta & { body: string }

export type ProjectMeta = {
  slug: string
  lang: Lang
  title: string
  summary: string
  result: string
  stack: string[]
  order: number
  repoUrl?: string
  demoUrl?: string
  placeholder: boolean
}

export type Project = ProjectMeta & { body: string }

export type TranslationMissing = {
  kind: 'translation-missing'
  slug: string
  requestedLang: Lang
  availableLang: Lang
}

export type ExperienceItem = {
  role: string
  organization: string
  start: string
  end: string | null
  description: string
}

export type EducationItem = {
  title: string
  institution: string
  year: string
}

export type CertificationItem = {
  title: string
  issuer: string
  year: string
  url?: string
}

export type SkillGroup = {
  label: string
  items: string[]
}

export type Profile = {
  name: string
  role: string
  tagline: string
  available: boolean
  stack: string[]
  email: string
  linkedinUrl: string
  githubUrl: string
  cvPath: string
  experience: ExperienceItem[]
  education: EducationItem[]
  certifications: CertificationItem[]
  skills: SkillGroup[]
  placeholder: boolean
}
```

- [ ] **Step 5: Create lib/content/schema.ts**

```ts
import { z } from 'zod'

const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/

const isoDate = z
  .string()
  .regex(ISO_DATE, 'Data deve estar no formato yyyy-mm-dd')
  .refine((value) => {
    const parsed = new Date(`${value}T00:00:00Z`)
    return !Number.isNaN(parsed.getTime()) && parsed.toISOString().startsWith(value)
  }, 'Data inexistente no calendário')

export const postFrontmatterSchema = z.object({
  title: z.string().min(1),
  summary: z.string().min(1),
  date: isoDate,
  tags: z.array(z.string().min(1)).default([]),
  placeholder: z.boolean().default(false),
})

export const projectFrontmatterSchema = z.object({
  title: z.string().min(1),
  summary: z.string().min(1),
  result: z.string().min(1),
  stack: z.array(z.string().min(1)).min(1),
  order: z.number().int().nonnegative(),
  repoUrl: z.string().url().optional(),
  demoUrl: z.string().url().optional(),
  placeholder: z.boolean().default(false),
})

export const profileSchema = z.object({
  name: z.string().min(1),
  role: z.string().min(1),
  tagline: z.string().min(1),
  available: z.boolean(),
  stack: z.array(z.string().min(1)).min(1),
  email: z.string().email(),
  linkedinUrl: z.string().url(),
  githubUrl: z.string().url(),
  cvPath: z.string().min(1),
  experience: z
    .array(
      z.object({
        role: z.string().min(1),
        organization: z.string().min(1),
        start: z.string().min(1),
        end: z.string().min(1).nullable(),
        description: z.string().min(1),
      }),
    )
    .default([]),
  education: z
    .array(
      z.object({
        title: z.string().min(1),
        institution: z.string().min(1),
        year: z.string().min(1),
      }),
    )
    .default([]),
  certifications: z
    .array(
      z.object({
        title: z.string().min(1),
        issuer: z.string().min(1),
        year: z.string().min(1),
        url: z.string().url().optional(),
      }),
    )
    .default([]),
  skills: z
    .array(
      z.object({
        label: z.string().min(1),
        items: z.array(z.string().min(1)).min(1),
      }),
    )
    .default([]),
  placeholder: z.boolean().default(false),
})

/**
 * Example content must never reach production.
 *
 * The trigger is deliberately NOT `NODE_ENV`: `next build` sets NODE_ENV to
 * "production" for every build, including local ones, which would make the
 * project impossible to build while example content exists. Instead:
 *
 *   - `VERCEL_ENV === 'production'` — set by Vercel only on production
 *     deployments, so a real deploy is blocked.
 *   - `STRICT_CONTENT === '1'` — opt-in, so CI and the verification steps in
 *     this plan can prove the guard fires.
 *
 * Local `npm run build` and preview deployments stay unblocked.
 */
function isProductionRelease(): boolean {
  return process.env.VERCEL_ENV === 'production' || process.env.STRICT_CONTENT === '1'
}

export function assertPublishable(placeholder: boolean, sourcePath: string): void {
  if (placeholder && isProductionRelease()) {
    throw new Error(
      `Conteúdo de exemplo não pode ir para produção: ${sourcePath} ` +
        `(remova "placeholder: true" ou substitua por conteúdo real).`,
    )
  }
}
```

- [ ] **Step 6: Run the test to verify it passes**

Run: `npm run test`
Expected: PASS — all schema tests green, plus the earlier smoke and contrast tests.

- [ ] **Step 7: Commit**

```bash
git add -A
git commit -m "feat: add Zod content schemas and production placeholder guard"
```

---

### Task 4: Content reader — posts, ordering, reading time, missing translations

**Files:**
- Create: `lib/content/paths.ts`
- Create: `lib/content/posts.ts`
- Create: `content/posts/pt/exemplo-limpeza-dados.mdx`
- Create: `content/posts/en/exemplo-limpeza-dados.mdx`
- Create: `content/posts/pt/exemplo-somente-portugues.mdx`
- Create: `tests/unit/posts.test.ts`

**Interfaces:**
- Consumes: `Lang`, `LANGS`, `PostMeta`, `Post`, `TranslationMissing` from `lib/content/types.ts`; `postFrontmatterSchema`, `assertPublishable` from `lib/content/schema.ts`.
- Produces:
  - `CONTENT_ROOT: string` and `contentDir(kind: 'posts' | 'projects', lang: Lang): string` in `lib/content/paths.ts`
  - `getPosts(lang: Lang): PostMeta[]` — newest first
  - `getPost(lang: Lang, slug: string): Post | TranslationMissing | null`
  - `getPostSlugs(): { lang: Lang; slug: string }[]`
  - `isTranslationMissing(value: unknown): value is TranslationMissing`

Naming note: the spec sketches this as a single `getAllSlugs(kind)`. It is split
into `getPostSlugs()` and `getProjectSlugs()` because each lives beside the
reader it belongs to, and the split removes a string argument that TypeScript
would otherwise have to narrow. Same behaviour, better call sites.

- [ ] **Step 1: Write the failing posts test**

`tests/unit/posts.test.ts`:

```ts
import { describe, expect, it } from 'vitest'
import { getPost, getPosts, getPostSlugs, isTranslationMissing } from '@/lib/content/posts'

describe('getPosts', () => {
  it('returns Portuguese posts', () => {
    const posts = getPosts('pt')
    expect(posts.length).toBeGreaterThanOrEqual(2)
  })

  it('sorts newest first', () => {
    const dates = getPosts('pt').map((p) => p.date)
    const sorted = [...dates].sort((a, b) => b.localeCompare(a))
    expect(dates).toEqual(sorted)
  })

  it('computes a reading time of at least one minute', () => {
    for (const post of getPosts('pt')) {
      expect(post.readingMinutes).toBeGreaterThanOrEqual(1)
    }
  })

  it('hides a post from the language that has no translation', () => {
    const ptSlugs = getPosts('pt').map((p) => p.slug)
    const enSlugs = getPosts('en').map((p) => p.slug)
    expect(ptSlugs).toContain('exemplo-somente-portugues')
    expect(enSlugs).not.toContain('exemplo-somente-portugues')
  })

  it('tags every post with the language it was read from', () => {
    expect(getPosts('en').every((p) => p.lang === 'en')).toBe(true)
  })
})

describe('getPost', () => {
  it('returns the post body when the translation exists', () => {
    const post = getPost('pt', 'exemplo-limpeza-dados')
    expect(isTranslationMissing(post)).toBe(false)
    expect(post).not.toBeNull()
    if (post && !isTranslationMissing(post)) {
      expect(post.body.length).toBeGreaterThan(0)
      expect(post.title.length).toBeGreaterThan(0)
    }
  })

  it('reports a missing translation instead of failing', () => {
    const post = getPost('en', 'exemplo-somente-portugues')
    expect(isTranslationMissing(post)).toBe(true)
    if (post && isTranslationMissing(post)) {
      expect(post.requestedLang).toBe('en')
      expect(post.availableLang).toBe('pt')
      expect(post.slug).toBe('exemplo-somente-portugues')
    }
  })

  it('returns null for a slug that exists in no language', () => {
    expect(getPost('pt', 'nao-existe-em-lugar-nenhum')).toBeNull()
  })
})

describe('getPostSlugs', () => {
  it('includes every language/slug pair that should be built', () => {
    const pairs = getPostSlugs()
    expect(pairs).toContainEqual({ lang: 'pt', slug: 'exemplo-limpeza-dados' })
    expect(pairs).toContainEqual({ lang: 'en', slug: 'exemplo-limpeza-dados' })
  })

  it('includes the untranslated slug for both languages so the notice page is built', () => {
    const pairs = getPostSlugs()
    expect(pairs).toContainEqual({ lang: 'pt', slug: 'exemplo-somente-portugues' })
    expect(pairs).toContainEqual({ lang: 'en', slug: 'exemplo-somente-portugues' })
  })

  it('does not contain duplicates', () => {
    const pairs = getPostSlugs().map((p) => `${p.lang}/${p.slug}`)
    expect(new Set(pairs).size).toBe(pairs.length)
  })
})
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `npm run test`
Expected: FAIL — cannot resolve `@/lib/content/posts`.

- [ ] **Step 3: Install the MDX reading dependencies**

```bash
npm install gray-matter@4.0.3 reading-time@1.5.0
```

- [ ] **Step 4: Create lib/content/paths.ts**

```ts
import path from 'node:path'
import type { Lang } from './types'

export const CONTENT_ROOT = path.join(process.cwd(), 'content')

export function contentDir(kind: 'posts' | 'projects', lang: Lang): string {
  return path.join(CONTENT_ROOT, kind, lang)
}
```

- [ ] **Step 5: Create the example content files**

`content/posts/pt/exemplo-limpeza-dados.mdx`:

```mdx
---
title: "Como limpei 40 mil linhas sem perder o sono"
summary: "Um roteiro de limpeza que não desfaz o próprio trabalho."
date: "2026-03-14"
tags: ["dados", "pandas"]
placeholder: true
---

O conjunto tinha datas em quatro formatos diferentes, valores negativos onde não
deveria haver, e duplicatas que só apareciam depois que eu normalizava o nome do
cliente.

Comecei mapeando cada problema antes de escrever uma linha de correção, porque
corrigir na ordem errada desfaz o trabalho anterior.

```python
df = df.drop_duplicates(subset=chave)
```

O resultado foi uma base estável, com o número final batendo com o relatório
antigo.
```

`content/posts/en/exemplo-limpeza-dados.mdx`:

```mdx
---
title: "How I cleaned 40,000 rows without losing sleep"
summary: "A cleaning routine that does not undo its own work."
date: "2026-03-14"
tags: ["data", "pandas"]
placeholder: true
---

The dataset had dates in four different formats, negative values where none
should exist, and duplicates that only surfaced after I normalized customer
names.

I mapped every problem before writing a single line of correction, because
fixing them in the wrong order undoes the previous work.

```python
df = df.drop_duplicates(subset=key)
```

The result was a stable dataset whose totals matched the old report.
```

`content/posts/pt/exemplo-somente-portugues.mdx`:

```mdx
---
title: "Um artigo que existe só em português"
summary: "Serve para exercitar a regra de tradução ausente."
date: "2026-02-02"
tags: ["exemplo"]
placeholder: true
---

Este artigo existe apenas em português. Ele prova que a listagem em inglês não o
mostra e que o acesso direto em inglês exibe um aviso com link para a versão
existente, em vez de um erro.
```

- [ ] **Step 6: Create lib/content/posts.ts**

```ts
import fs from 'node:fs'
import path from 'node:path'
import matter from 'gray-matter'
import readingTime from 'reading-time'
import { contentDir } from './paths'
import { assertPublishable, postFrontmatterSchema } from './schema'
import { LANGS, type Lang, type Post, type PostMeta, type TranslationMissing } from './types'

export function isTranslationMissing(value: unknown): value is TranslationMissing {
  return (
    typeof value === 'object' &&
    value !== null &&
    (value as { kind?: unknown }).kind === 'translation-missing'
  )
}

function listSlugs(lang: Lang): string[] {
  const dir = contentDir('posts', lang)
  if (!fs.existsSync(dir)) return []
  return fs
    .readdirSync(dir)
    .filter((file) => file.endsWith('.mdx'))
    .map((file) => file.replace(/\.mdx$/, ''))
}

function readPost(lang: Lang, slug: string): Post | null {
  const file = path.join(contentDir('posts', lang), `${slug}.mdx`)
  if (!fs.existsSync(file)) return null

  const raw = fs.readFileSync(file, 'utf8')
  const { data, content } = matter(raw)
  const parsed = postFrontmatterSchema.safeParse(data)

  if (!parsed.success) {
    const details = parsed.error.issues
      .map((issue) => `${issue.path.join('.') || '(raiz)'}: ${issue.message}`)
      .join('; ')
    throw new Error(`Frontmatter inválido em ${file} → ${details}`)
  }

  assertPublishable(parsed.data.placeholder, file)

  return {
    ...parsed.data,
    slug,
    lang,
    body: content,
    readingMinutes: Math.max(1, Math.ceil(readingTime(content).minutes)),
  }
}

export function getPosts(lang: Lang): PostMeta[] {
  return listSlugs(lang)
    .map((slug) => readPost(lang, slug))
    .filter((post): post is Post => post !== null)
    .map(({ body: _body, ...meta }) => meta)
    .sort((a, b) => b.date.localeCompare(a.date))
}

export function getPost(lang: Lang, slug: string): Post | TranslationMissing | null {
  const direct = readPost(lang, slug)
  if (direct) return direct

  const fallbackLang = LANGS.find((candidate) => candidate !== lang && readPost(candidate, slug))
  if (!fallbackLang) return null

  return {
    kind: 'translation-missing',
    slug,
    requestedLang: lang,
    availableLang: fallbackLang,
  }
}

export function getPostSlugs(): { lang: Lang; slug: string }[] {
  const everySlug = new Set(LANGS.flatMap((lang) => listSlugs(lang)))
  return LANGS.flatMap((lang) => [...everySlug].map((slug) => ({ lang, slug })))
}
```

Note `getPostSlugs` deliberately returns every slug for **both** languages: the untranslated ones still need a built page so the notice from Task 8 has somewhere to render.

- [ ] **Step 7: Run the test to verify it passes**

Run: `npm run test`
Expected: PASS — all `posts.test.ts` cases green.

- [ ] **Step 8: Verify the production guard actually blocks the example content**

Bash / Git Bash:

```bash
STRICT_CONTENT=1 npx vitest run tests/unit/posts.test.ts
```

PowerShell:

```powershell
$env:STRICT_CONTENT='1'; npx vitest run tests/unit/posts.test.ts; $env:STRICT_CONTENT=$null
```

Expected: FAIL with `Conteúdo de exemplo não pode ir para produção: …exemplo-limpeza-dados.mdx`.

This failure is the correct behavior — it proves the guard works. Do not "fix" it,
and do not leave `STRICT_CONTENT` set afterwards: the ordinary `npm run test` and
`npm run build` must keep passing.

- [ ] **Step 9: Commit**

```bash
git add -A
git commit -m "feat: read posts with validation, reading time, and translation fallback"
```

---

### Task 5: Content reader — projects and profile

**Files:**
- Create: `lib/content/projects.ts`
- Create: `lib/content/profile.ts`
- Create: `content/projects/pt/exemplo-churn.mdx`
- Create: `content/projects/en/exemplo-churn.mdx`
- Create: `content/profile/pt.ts`
- Create: `content/profile/en.ts`
- Create: `tests/unit/projects.test.ts`
- Create: `tests/unit/profile.test.ts`

**Interfaces:**
- Consumes: everything from Tasks 3 and 4, including `isTranslationMissing` from `lib/content/posts.ts`.
- Produces:
  - `getProjects(lang: Lang): ProjectMeta[]` — ascending by `order`
  - `getProject(lang: Lang, slug: string): Project | TranslationMissing | null`
  - `getProjectSlugs(): { lang: Lang; slug: string }[]`
  - `getProfile(lang: Lang): Profile`

- [ ] **Step 1: Write the failing projects test**

`tests/unit/projects.test.ts`:

```ts
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
```

- [ ] **Step 2: Write the failing profile test**

`tests/unit/profile.test.ts`:

```ts
import { describe, expect, it } from 'vitest'
import { getProfile } from '@/lib/content/profile'
import { LANGS } from '@/lib/content/types'

describe('getProfile', () => {
  it.each(LANGS)('returns a valid profile for %s', (lang) => {
    const profile = getProfile(lang)
    expect(profile.name.length).toBeGreaterThan(0)
    expect(profile.email).toContain('@')
    expect(profile.linkedinUrl).toMatch(/^https?:\/\//)
    expect(profile.githubUrl).toMatch(/^https?:\/\//)
  })

  it('has a CV path for both languages, and they differ', () => {
    expect(getProfile('pt').cvPath).not.toBe(getProfile('en').cvPath)
  })

  it('exposes at least one skill group, because the section must never render empty', () => {
    for (const lang of LANGS) {
      expect(getProfile(lang).skills.length).toBeGreaterThan(0)
    }
  })
})
```

- [ ] **Step 3: Run both tests to verify they fail**

Run: `npm run test`
Expected: FAIL — cannot resolve `@/lib/content/projects` and `@/lib/content/profile`.

- [ ] **Step 4: Create the example project content**

`content/projects/pt/exemplo-churn.mdx`:

```mdx
---
title: "Previsão de churn em base de assinaturas"
summary: "Modelo que antecipa cancelamento com 30 dias de folga."
result: "Recall de 0.81 na base de validação, contra 0.62 da regra manual anterior."
stack: ["Python", "pandas", "scikit-learn"]
order: 1
repoUrl: "https://github.com/oliveira-yuri/exemplo-churn"
placeholder: true
---

## Contexto

A operação identificava risco de cancelamento por uma regra manual baseada em
dias sem acesso, que só percebia o problema quando já era tarde.

## Decisões técnicas

Escolhi começar por regressão logística em vez de um modelo mais complexo,
porque o time precisava explicar cada alerta para o cliente. Um modelo que
ninguém consegue justificar não é usado.

## Resultado

Recall subiu de 0.62 para 0.81, mantendo a explicabilidade que a operação
exigia.
```

`content/projects/en/exemplo-churn.mdx`:

```mdx
---
title: "Churn prediction on a subscription base"
summary: "A model that flags cancellation 30 days ahead."
result: "Recall of 0.81 on the validation set, against 0.62 for the previous manual rule."
stack: ["Python", "pandas", "scikit-learn"]
order: 1
repoUrl: "https://github.com/oliveira-yuri/exemplo-churn"
placeholder: true
---

## Context

The team flagged cancellation risk with a manual rule based on days without
access, which only noticed the problem when it was already too late.

## Technical decisions

I started with logistic regression rather than something heavier, because the
team had to explain each alert to the customer. A model nobody can justify does
not get used.

## Result

Recall rose from 0.62 to 0.81 while keeping the explainability the team needed.
```

- [ ] **Step 5: Create the profile content files**

`content/profile/pt.ts`:

```ts
import type { Profile } from '@/lib/content/types'

export const profile: Profile = {
  name: 'Yuri Oliveira',
  role: 'Dados & Inteligência Artificial',
  tagline: 'Transformo dados confusos em decisões.',
  available: true,
  stack: ['Python', 'SQL', 'pandas', 'scikit-learn'],
  email: 'yuri.oliveira.silva.24@gmail.com',
  linkedinUrl: 'https://www.linkedin.com/in/oliveira-yuri',
  githubUrl: 'https://github.com/oliveira-yuri',
  cvPath: '/cv/curriculo-pt.pdf',
  experience: [
    {
      role: 'Cargo de exemplo',
      organization: 'Organização de exemplo',
      start: '2025-01',
      end: null,
      description:
        'Substituir por experiência real: o que você fez e qual foi o efeito disso.',
    },
  ],
  education: [
    {
      title: 'Curso de exemplo',
      institution: 'Instituição de exemplo',
      year: '2026',
    },
  ],
  certifications: [
    {
      title: 'Certificação de exemplo',
      issuer: 'Emissor de exemplo',
      year: '2026',
    },
  ],
  skills: [
    { label: 'Linguagens', items: ['Python', 'SQL'] },
    { label: 'Análise', items: ['pandas', 'NumPy'] },
    { label: 'Ferramentas', items: ['Git', 'Jupyter'] },
  ],
  placeholder: true,
}
```

`content/profile/en.ts`:

```ts
import type { Profile } from '@/lib/content/types'

export const profile: Profile = {
  name: 'Yuri Oliveira',
  role: 'Data & Artificial Intelligence',
  tagline: 'I turn messy data into decisions.',
  available: true,
  stack: ['Python', 'SQL', 'pandas', 'scikit-learn'],
  email: 'yuri.oliveira.silva.24@gmail.com',
  linkedinUrl: 'https://www.linkedin.com/in/oliveira-yuri',
  githubUrl: 'https://github.com/oliveira-yuri',
  cvPath: '/cv/curriculo-en.pdf',
  experience: [
    {
      role: 'Example role',
      organization: 'Example organization',
      start: '2025-01',
      end: null,
      description: 'Replace with real experience: what you did and what changed because of it.',
    },
  ],
  education: [
    {
      title: 'Example programme',
      institution: 'Example institution',
      year: '2026',
    },
  ],
  certifications: [
    {
      title: 'Example certification',
      issuer: 'Example issuer',
      year: '2026',
    },
  ],
  skills: [
    { label: 'Languages', items: ['Python', 'SQL'] },
    { label: 'Analysis', items: ['pandas', 'NumPy'] },
    { label: 'Tooling', items: ['Git', 'Jupyter'] },
  ],
  placeholder: true,
}
```

Every array must have at least one entry, so no home section ever renders empty.

- [ ] **Step 6: Create lib/content/projects.ts**

```ts
import fs from 'node:fs'
import path from 'node:path'
import matter from 'gray-matter'
import { contentDir } from './paths'
import { assertPublishable, projectFrontmatterSchema } from './schema'
import { LANGS, type Lang, type Project, type ProjectMeta, type TranslationMissing } from './types'

function listSlugs(lang: Lang): string[] {
  const dir = contentDir('projects', lang)
  if (!fs.existsSync(dir)) return []
  return fs
    .readdirSync(dir)
    .filter((file) => file.endsWith('.mdx'))
    .map((file) => file.replace(/\.mdx$/, ''))
}

function readProject(lang: Lang, slug: string): Project | null {
  const file = path.join(contentDir('projects', lang), `${slug}.mdx`)
  if (!fs.existsSync(file)) return null

  const { data, content } = matter(fs.readFileSync(file, 'utf8'))
  const parsed = projectFrontmatterSchema.safeParse(data)

  if (!parsed.success) {
    const details = parsed.error.issues
      .map((issue) => `${issue.path.join('.') || '(raiz)'}: ${issue.message}`)
      .join('; ')
    throw new Error(`Frontmatter inválido em ${file} → ${details}`)
  }

  assertPublishable(parsed.data.placeholder, file)

  return { ...parsed.data, slug, lang, body: content }
}

export function getProjects(lang: Lang): ProjectMeta[] {
  return listSlugs(lang)
    .map((slug) => readProject(lang, slug))
    .filter((project): project is Project => project !== null)
    .map(({ body: _body, ...meta }) => meta)
    .sort((a, b) => a.order - b.order)
}

export function getProject(lang: Lang, slug: string): Project | TranslationMissing | null {
  const direct = readProject(lang, slug)
  if (direct) return direct

  const fallbackLang = LANGS.find(
    (candidate) => candidate !== lang && readProject(candidate, slug),
  )
  if (!fallbackLang) return null

  return { kind: 'translation-missing', slug, requestedLang: lang, availableLang: fallbackLang }
}

export function getProjectSlugs(): { lang: Lang; slug: string }[] {
  const everySlug = new Set(LANGS.flatMap((lang) => listSlugs(lang)))
  return LANGS.flatMap((lang) => [...everySlug].map((slug) => ({ lang, slug })))
}
```

- [ ] **Step 7: Create lib/content/profile.ts**

```ts
import { profile as ptProfile } from '@/content/profile/pt'
import { profile as enProfile } from '@/content/profile/en'
import { assertPublishable, profileSchema } from './schema'
import type { Lang, Profile } from './types'

const RAW: Record<Lang, unknown> = { pt: ptProfile, en: enProfile }

export function getProfile(lang: Lang): Profile {
  const parsed = profileSchema.safeParse(RAW[lang])

  if (!parsed.success) {
    const details = parsed.error.issues
      .map((issue) => `${issue.path.join('.') || '(raiz)'}: ${issue.message}`)
      .join('; ')
    throw new Error(`Perfil inválido em content/profile/${lang}.ts → ${details}`)
  }

  assertPublishable(parsed.data.placeholder, `content/profile/${lang}.ts`)
  return parsed.data
}
```

The profile is imported statically rather than read from disk, so a missing language is a TypeScript error rather than a runtime surprise — this is what the spec means by "obrigatório nos dois idiomas".

- [ ] **Step 8: Run the tests to verify they pass**

Run: `npm run test`
Expected: PASS — projects and profile suites green.

- [ ] **Step 9: Commit**

```bash
git add -A
git commit -m "feat: read projects and profile with schema validation"
```

---

### Task 6: Bilingual routing shell, UI dictionary, and language switcher

**Files:**
- Create: `lib/i18n/dictionaries.ts`
- Create: `app/[lang]/layout.tsx`
- Create: `app/[lang]/page.tsx` (temporary body, replaced in Task 7)
- Create: `components/SiteHeader.tsx`
- Create: `components/LanguageSwitcher.tsx`
- Create: `tests/unit/dictionaries.test.ts`
- Delete: `app/layout.tsx` and `app/page.tsx` — `app/[lang]/layout.tsx` becomes the root layout

**Interfaces:**
- Consumes: `Lang`, `LANGS`, `isLang` from `lib/content/types.ts`; `getProfile` from `lib/content/profile.ts`.
- Produces:
  - `getDictionary(lang: Lang): Dictionary` where `Dictionary` has the keys listed in Step 3
  - `<SiteHeader lang={lang} />` and `<LanguageSwitcher lang={lang} />` React server components
  - The `app/[lang]/` segment with `generateStaticParams` returning `[{ lang: 'pt' }, { lang: 'en' }]`

- [ ] **Step 1: Write the failing dictionary test**

`tests/unit/dictionaries.test.ts`:

```ts
import { describe, expect, it } from 'vitest'
import { getDictionary } from '@/lib/i18n/dictionaries'
import { LANGS } from '@/lib/content/types'

describe('getDictionary', () => {
  it('returns different copy per language', () => {
    expect(getDictionary('pt').nav.newsletter).not.toBe(getDictionary('en').nav.newsletter)
  })

  it('defines the same keys for every language, so no string falls back silently', () => {
    const flatten = (value: unknown, prefix = ''): string[] =>
      typeof value === 'object' && value !== null
        ? Object.entries(value).flatMap(([key, inner]) => flatten(inner, `${prefix}${key}.`))
        : [prefix.slice(0, -1)]

    const [first, ...rest] = LANGS.map((lang) => flatten(getDictionary(lang)).sort())
    for (const other of rest) {
      expect(other).toEqual(first)
    }
  })

  it('has no empty strings', () => {
    const values = (value: unknown): string[] =>
      typeof value === 'string'
        ? [value]
        : typeof value === 'object' && value !== null
          ? Object.values(value).flatMap(values)
          : []

    for (const lang of LANGS) {
      for (const text of values(getDictionary(lang))) {
        expect(text.trim().length).toBeGreaterThan(0)
      }
    }
  })
})
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `npm run test`
Expected: FAIL — cannot resolve `@/lib/i18n/dictionaries`.

- [ ] **Step 3: Create lib/i18n/dictionaries.ts**

```ts
import type { Lang } from '@/lib/content/types'

export type Dictionary = {
  nav: { projects: string; newsletter: string; contact: string }
  home: {
    availableNow: string
    featuredProjects: string
    experience: string
    education: string
    certifications: string
    skills: string
    latestPosts: string
    allPosts: string
    contact: string
    downloadCv: string
    present: string
    viewCaseStudy: string
  }
  post: { readingTime: string; backToNewsletter: string; subscribeRss: string }
  project: { result: string; stack: string; repository: string; demo: string }
  translationMissing: { title: string; body: string; cta: string }
  languageSwitch: { label: string; pt: string; en: string }
}

const pt: Dictionary = {
  nav: { projects: 'Projetos', newsletter: 'Newsletter', contact: 'Contato' },
  home: {
    availableNow: 'disponível para oportunidades',
    featuredProjects: 'Projetos',
    experience: 'Experiência',
    education: 'Formação',
    certifications: 'Certificações',
    skills: 'Habilidades',
    latestPosts: 'Últimos artigos',
    allPosts: 'Ver todos os artigos',
    contact: 'Contato',
    downloadCv: 'Baixar currículo',
    present: 'atual',
    viewCaseStudy: 'Ver estudo de caso',
  },
  post: {
    readingTime: 'min de leitura',
    backToNewsletter: 'Voltar para a newsletter',
    subscribeRss: 'Assinar por RSS',
  },
  project: { result: 'Resultado', stack: 'Stack', repository: 'Repositório', demo: 'Demonstração' },
  translationMissing: {
    title: 'Sem tradução',
    body: 'Este conteúdo está disponível apenas em inglês.',
    cta: 'Ler em inglês',
  },
  languageSwitch: { label: 'Idioma', pt: 'PT', en: 'EN' },
}

const en: Dictionary = {
  nav: { projects: 'Projects', newsletter: 'Newsletter', contact: 'Contact' },
  home: {
    availableNow: 'available for opportunities',
    featuredProjects: 'Projects',
    experience: 'Experience',
    education: 'Education',
    certifications: 'Certifications',
    skills: 'Skills',
    latestPosts: 'Latest articles',
    allPosts: 'See all articles',
    contact: 'Contact',
    downloadCv: 'Download résumé',
    present: 'present',
    viewCaseStudy: 'View case study',
  },
  post: {
    readingTime: 'min read',
    backToNewsletter: 'Back to the newsletter',
    subscribeRss: 'Subscribe via RSS',
  },
  project: { result: 'Result', stack: 'Stack', repository: 'Repository', demo: 'Demo' },
  translationMissing: {
    title: 'No translation',
    body: 'This content is available in Portuguese only.',
    cta: 'Read in Portuguese',
  },
  languageSwitch: { label: 'Language', pt: 'PT', en: 'EN' },
}

const DICTIONARIES: Record<Lang, Dictionary> = { pt, en }

export function getDictionary(lang: Lang): Dictionary {
  return DICTIONARIES[lang]
}
```

Note the `translationMissing.body` strings intentionally name the *other* language: the Portuguese page says the content is English-only, and vice versa.

- [ ] **Step 4: Run the test to verify it passes**

Run: `npm run test`
Expected: PASS.

- [ ] **Step 5: Create components/LanguageSwitcher.tsx**

```tsx
import Link from 'next/link'
import { LANGS, type Lang } from '@/lib/content/types'
import { getDictionary } from '@/lib/i18n/dictionaries'

export function LanguageSwitcher({ lang }: { lang: Lang }) {
  const dict = getDictionary(lang)

  return (
    <nav aria-label={dict.languageSwitch.label} className="u-mono flex items-center gap-2 text-[11px]">
      {LANGS.map((candidate) => (
        <Link
          key={candidate}
          href={`/${candidate}`}
          aria-current={candidate === lang ? 'true' : undefined}
          className={
            candidate === lang
              ? 'text-[var(--color-accent)]'
              : 'text-[var(--color-dim)] hover:text-[var(--color-text)]'
          }
        >
          {dict.languageSwitch[candidate]}
        </Link>
      ))}
    </nav>
  )
}
```

The switcher links to the language home rather than the equivalent page. Mapping the current route across languages requires the pathname, which is client-only; sending the visitor to the home of the other language is the honest static behavior. The Playwright test in Task 11 asserts exactly this.

- [ ] **Step 6: Create components/SiteHeader.tsx**

```tsx
import Link from 'next/link'
import type { Lang } from '@/lib/content/types'
import { getDictionary } from '@/lib/i18n/dictionaries'
import { getProfile } from '@/lib/content/profile'
import { LanguageSwitcher } from './LanguageSwitcher'

export function SiteHeader({ lang }: { lang: Lang }) {
  const dict = getDictionary(lang)
  const profile = getProfile(lang)

  return (
    <header className="border-b border-[var(--color-border)]">
      <div className="mx-auto flex max-w-4xl items-center justify-between px-6 py-5">
        <Link href={`/${lang}`} className="u-mono text-[11px] text-[var(--color-text)]">
          <span className="text-[var(--color-accent)]">$</span> {profile.name}
        </Link>
        <div className="flex items-center gap-6">
          <nav className="u-mono flex gap-5 text-[11px] text-[var(--color-dim)]">
            <Link href={`/${lang}#projects`} className="hover:text-[var(--color-text)]">
              {dict.nav.projects}
            </Link>
            <Link href={`/${lang}/newsletter`} className="hover:text-[var(--color-text)]">
              {dict.nav.newsletter}
            </Link>
            <Link href={`/${lang}#contact`} className="hover:text-[var(--color-text)]">
              {dict.nav.contact}
            </Link>
          </nav>
          <LanguageSwitcher lang={lang} />
        </div>
      </div>
    </header>
  )
}
```

- [ ] **Step 7: Create app/[lang]/layout.tsx as the root layout**

This layout owns `<html>` and `<body>`, which is what lets `lang` be correct per
language. `app/layout.tsx` from Task 1 is deleted in Step 9 — this file replaces
it. That is the pattern Next's own i18n example uses, and the only way a static
export can emit `<html lang="en">` on the English pages.

```tsx
import type { ReactNode } from 'react'
import { notFound } from 'next/navigation'
import { Recursive } from 'next/font/google'
import { LANGS, isLang } from '@/lib/content/types'
import { SiteHeader } from '@/components/SiteHeader'
import '../globals.css'

const recursive = Recursive({
  subsets: ['latin', 'latin-ext'],
  axes: ['CASL', 'MONO', 'slnt'],
  display: 'swap',
  variable: '--font-recursive',
})

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
```

`params` is a Promise in this Next version — it must be awaited. Forgetting this is the most common error in this codebase.

- [ ] **Step 8: Create a temporary app/[lang]/page.tsx**

```tsx
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
```

- [ ] **Step 9: Delete the old root layout and placeholder root page**

```bash
rm app/layout.tsx app/page.tsx
```

`app/[lang]/layout.tsx` is now the only root layout. Root `/` gets its redirect
in Task 12; it needs no page of its own.

- [ ] **Step 10: Verify the bilingual build and the lang attribute**

Run: `npm run build`
Expected: succeeds, and both `out/pt/index.html` and `out/en/index.html` exist.

```bash
ls out/pt/index.html out/en/index.html
grep -o '<html lang="[a-z]*"' out/pt/index.html
grep -o '<html lang="[a-z]*"' out/en/index.html
```

Expected: `<html lang="pt"` for the first, `<html lang="en"` for the second. If
both say `pt`, an `app/layout.tsx` survived the delete in Step 9 and is still
winning as the root layout.

- [ ] **Step 11: Commit**

```bash
git add -A
git commit -m "feat: add bilingual routing shell, UI dictionary, and language switcher"
```

---

### Task 7: The home page — all seven sections

**Files:**
- Create: `components/Section.tsx`
- Create: `components/home/Hero.tsx`
- Create: `components/home/FeaturedProjects.tsx`
- Create: `components/home/Timeline.tsx`
- Create: `components/home/Credentials.tsx`
- Create: `components/home/Skills.tsx`
- Create: `components/home/LatestPosts.tsx`
- Create: `components/home/Contact.tsx`
- Modify: `app/[lang]/page.tsx`

**Interfaces:**
- Consumes: `getProfile`, `getProjects`, `getPosts`, `getDictionary`, all color tokens and the `.u-mono` / `.u-heading` / `.u-prose` classes.
- Produces: a home page whose seven sections carry the DOM ids `hero`, `projects`, `experience`, `education`, `skills`, `posts`, `contact`. Task 11's Playwright test asserts all seven exist.

- [ ] **Step 1: Create the shared Section wrapper**

`components/Section.tsx`:

```tsx
import type { ReactNode } from 'react'

export function Section({
  id,
  title,
  children,
}: {
  id: string
  title?: string
  children: ReactNode
}) {
  return (
    <section id={id} className="reveal border-t border-[var(--color-border)] py-14">
      {title ? (
        <h2 className="u-mono mb-8 text-[11px] text-[var(--color-dim)]">{title}</h2>
      ) : null}
      {children}
    </section>
  )
}
```

- [ ] **Step 2: Create the Hero**

`components/home/Hero.tsx`:

```tsx
import type { Lang, Profile } from '@/lib/content/types'
import { getDictionary } from '@/lib/i18n/dictionaries'

export function Hero({ lang, profile }: { lang: Lang; profile: Profile }) {
  const dict = getDictionary(lang)

  return (
    <section id="hero" className="py-16">
      {profile.available ? (
        <p className="u-mono mb-6 text-[10px] text-[var(--color-accent)]">
          ● {dict.home.availableNow}
        </p>
      ) : null}

      <h1 className="u-heading text-4xl leading-[1.08] sm:text-5xl">
        {profile.tagline}
        <span className="u-cursor" aria-hidden="true" />
      </h1>

      <p className="u-prose mt-5 text-[var(--color-muted)]">{profile.role}</p>

      <ul className="u-mono mt-8 flex flex-wrap gap-x-3 gap-y-2 text-[10px] text-[var(--color-dim)]">
        {profile.stack.map((item) => (
          <li key={item}>{item}</li>
        ))}
      </ul>

      <a
        href={profile.cvPath}
        className="u-mono mt-9 inline-block border border-[var(--color-accent)] px-4 py-2 text-[11px] text-[var(--color-accent)] transition-colors hover:bg-[var(--color-accent)] hover:text-[var(--color-bg)]"
      >
        {dict.home.downloadCv} ↓
      </a>
    </section>
  )
}
```

- [ ] **Step 3: Create FeaturedProjects**

`components/home/FeaturedProjects.tsx`:

```tsx
import Link from 'next/link'
import { Section } from '@/components/Section'
import type { Lang, ProjectMeta } from '@/lib/content/types'
import { getDictionary } from '@/lib/i18n/dictionaries'

export function FeaturedProjects({
  lang,
  projects,
}: {
  lang: Lang
  projects: ProjectMeta[]
}) {
  const dict = getDictionary(lang)
  if (projects.length === 0) return null

  return (
    <Section id="projects" title={dict.home.featuredProjects}>
      <div className="flex flex-col gap-5">
        {projects.map((project) => (
          <article
            key={project.slug}
            className="border border-[var(--color-border)] bg-[var(--color-surface)] p-6"
          >
            <h3 className="u-heading text-xl">{project.title}</h3>
            <p className="u-prose mt-2 text-[var(--color-muted)]">{project.summary}</p>

            <p className="mt-4 text-sm text-[var(--color-text)]">
              <span className="u-mono mr-2 text-[10px] text-[var(--color-accent)]">
                {dict.project.result}
              </span>
              {project.result}
            </p>

            <ul className="u-mono mt-4 flex flex-wrap gap-x-3 gap-y-2 text-[10px] text-[var(--color-dim)]">
              {project.stack.map((tech) => (
                <li key={tech}>{tech}</li>
              ))}
            </ul>

            <Link
              href={`/${lang}/projects/${project.slug}`}
              className="u-mono mt-6 inline-block text-[11px] text-[var(--color-accent)] hover:underline"
            >
              {dict.home.viewCaseStudy} →
            </Link>
          </article>
        ))}
      </div>
    </Section>
  )
}
```

Cards are stacked full-width, not a grid — with one to three projects a grid would leave visible holes.

- [ ] **Step 4: Create Timeline (experience)**

`components/home/Timeline.tsx`:

```tsx
import { Section } from '@/components/Section'
import type { ExperienceItem, Lang } from '@/lib/content/types'
import { getDictionary } from '@/lib/i18n/dictionaries'

export function Timeline({ lang, items }: { lang: Lang; items: ExperienceItem[] }) {
  const dict = getDictionary(lang)
  if (items.length === 0) return null

  return (
    <Section id="experience" title={dict.home.experience}>
      <ol className="flex flex-col gap-8">
        {items.map((item) => (
          <li key={`${item.organization}-${item.start}`} className="border-l border-[var(--color-border)] pl-5">
            <p className="u-mono text-[10px] text-[var(--color-dim)]">
              {item.start} — {item.end ?? dict.home.present}
            </p>
            <h3 className="u-heading mt-2 text-lg">{item.role}</h3>
            <p className="u-mono mt-1 text-[10px] text-[var(--color-accent)]">{item.organization}</p>
            <p className="u-prose mt-3 text-[var(--color-muted)]">{item.description}</p>
          </li>
        ))}
      </ol>
    </Section>
  )
}
```

- [ ] **Step 5: Create Credentials (education + certifications)**

`components/home/Credentials.tsx`:

```tsx
import { Section } from '@/components/Section'
import type { CertificationItem, EducationItem, Lang } from '@/lib/content/types'
import { getDictionary } from '@/lib/i18n/dictionaries'

export function Credentials({
  lang,
  education,
  certifications,
}: {
  lang: Lang
  education: EducationItem[]
  certifications: CertificationItem[]
}) {
  const dict = getDictionary(lang)
  if (education.length === 0 && certifications.length === 0) return null

  return (
    <Section id="education" title={dict.home.education}>
      <ul className="flex flex-col gap-4">
        {education.map((item) => (
          <li key={`${item.institution}-${item.title}`} className="flex justify-between gap-4">
            <span>
              <span className="text-[var(--color-text)]">{item.title}</span>
              <span className="u-mono ml-3 text-[10px] text-[var(--color-dim)]">
                {item.institution}
              </span>
            </span>
            <span className="u-mono shrink-0 text-[10px] text-[var(--color-dim)]">{item.year}</span>
          </li>
        ))}
      </ul>

      {certifications.length > 0 ? (
        <>
          <h3 className="u-mono mt-10 mb-4 text-[11px] text-[var(--color-dim)]">
            {dict.home.certifications}
          </h3>
          <ul className="flex flex-col gap-4">
            {certifications.map((item) => (
              <li key={`${item.issuer}-${item.title}`} className="flex justify-between gap-4">
                <span>
                  {item.url ? (
                    <a
                      href={item.url}
                      className="text-[var(--color-text)] hover:text-[var(--color-accent)]"
                    >
                      {item.title} ↗
                    </a>
                  ) : (
                    <span className="text-[var(--color-text)]">{item.title}</span>
                  )}
                  <span className="u-mono ml-3 text-[10px] text-[var(--color-dim)]">
                    {item.issuer}
                  </span>
                </span>
                <span className="u-mono shrink-0 text-[10px] text-[var(--color-dim)]">
                  {item.year}
                </span>
              </li>
            ))}
          </ul>
        </>
      ) : null}
    </Section>
  )
}
```

- [ ] **Step 6: Create Skills**

`components/home/Skills.tsx`:

```tsx
import { Section } from '@/components/Section'
import type { Lang, SkillGroup } from '@/lib/content/types'
import { getDictionary } from '@/lib/i18n/dictionaries'

export function Skills({ lang, groups }: { lang: Lang; groups: SkillGroup[] }) {
  const dict = getDictionary(lang)
  if (groups.length === 0) return null

  return (
    <Section id="skills" title={dict.home.skills}>
      <div className="flex flex-col gap-6">
        {groups.map((group) => (
          <div key={group.label}>
            <h3 className="u-mono mb-2 text-[10px] text-[var(--color-accent)]">{group.label}</h3>
            <ul className="flex flex-wrap gap-x-4 gap-y-2 text-sm text-[var(--color-muted)]">
              {group.items.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </Section>
  )
}
```

No percentage bars — the spec forbids them, because "85% Python" carries no information.

- [ ] **Step 7: Create LatestPosts**

`components/home/LatestPosts.tsx`:

```tsx
import Link from 'next/link'
import { Section } from '@/components/Section'
import type { Lang, PostMeta } from '@/lib/content/types'
import { getDictionary } from '@/lib/i18n/dictionaries'

export function LatestPosts({ lang, posts }: { lang: Lang; posts: PostMeta[] }) {
  const dict = getDictionary(lang)
  if (posts.length === 0) return null

  return (
    <Section id="posts" title={dict.home.latestPosts}>
      <ul className="flex flex-col gap-6">
        {posts.map((post) => (
          <li key={post.slug}>
            <Link href={`/${lang}/newsletter/${post.slug}`} className="group block">
              <p className="u-mono text-[10px] text-[var(--color-dim)]">
                {post.date} · {post.readingMinutes} {dict.post.readingTime}
              </p>
              <h3 className="u-heading mt-1 text-lg group-hover:text-[var(--color-accent)]">
                {post.title}
              </h3>
              <p className="u-prose mt-1 text-[var(--color-muted)]">{post.summary}</p>
            </Link>
          </li>
        ))}
      </ul>

      <Link
        href={`/${lang}/newsletter`}
        className="u-mono mt-8 inline-block text-[11px] text-[var(--color-accent)] hover:underline"
      >
        {dict.home.allPosts} →
      </Link>
    </Section>
  )
}
```

- [ ] **Step 8: Create Contact**

`components/home/Contact.tsx`:

```tsx
import { Section } from '@/components/Section'
import type { Lang, Profile } from '@/lib/content/types'
import { getDictionary } from '@/lib/i18n/dictionaries'

export function Contact({ lang, profile }: { lang: Lang; profile: Profile }) {
  const dict = getDictionary(lang)

  const links = [
    { label: 'Email', href: `mailto:${profile.email}`, text: profile.email },
    { label: 'LinkedIn', href: profile.linkedinUrl, text: profile.linkedinUrl },
    { label: 'GitHub', href: profile.githubUrl, text: profile.githubUrl },
    { label: 'CV', href: profile.cvPath, text: dict.home.downloadCv },
  ]

  return (
    <Section id="contact" title={dict.home.contact}>
      <ul className="flex flex-col gap-3">
        {links.map((link) => (
          <li key={link.label} className="flex gap-4">
            <span className="u-mono w-20 shrink-0 text-[10px] text-[var(--color-dim)]">
              {link.label}
            </span>
            <a href={link.href} className="text-sm text-[var(--color-text)] hover:text-[var(--color-accent)]">
              {link.text}
            </a>
          </li>
        ))}
      </ul>
    </Section>
  )
}
```

- [ ] **Step 9: Assemble the home page**

Replace `app/[lang]/page.tsx`:

```tsx
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
```

- [ ] **Step 10: Verify the build and inspect the page**

Run: `npm run build`
Expected: succeeds.

Run `npm run dev` and open `http://localhost:3000/pt`. Confirm every section renders with content, then open `http://localhost:3000/en` and confirm the English copy appears.

- [ ] **Step 11: Commit**

```bash
git add -A
git commit -m "feat: build the long-form home page with all seven sections"
```

---

### Task 8: Newsletter — listing, article rendering, and the missing-translation notice

**Files:**
- Create: `components/Mdx.tsx`
- Create: `components/TranslationMissingNotice.tsx`
- Create: `app/[lang]/newsletter/page.tsx`
- Create: `app/[lang]/newsletter/[slug]/page.tsx`
- Modify: `app/globals.css` (code block styling)

**Interfaces:**
- Consumes: `getPosts`, `getPost`, `getPostSlugs`, `isTranslationMissing`, `getDictionary`.
- Produces:
  - `<Mdx source={string} />` — renders MDX with GFM and syntax highlighting
  - `<TranslationMissingNotice lang result href />` — used by both the article and the case study pages

- [ ] **Step 1: Install the MDX rendering dependencies**

```bash
npm install next-mdx-remote@6.0.0 remark-gfm@4.0.1 rehype-pretty-code@0.14.5 shiki@4.4.3
```

- [ ] **Step 2: Create components/Mdx.tsx**

```tsx
import { MDXRemote } from 'next-mdx-remote/rsc'
import remarkGfm from 'remark-gfm'
import rehypePrettyCode from 'rehype-pretty-code'

export function Mdx({ source }: { source: string }) {
  return (
    <div className="u-prose mdx text-[var(--color-muted)]">
      <MDXRemote
        source={source}
        options={{
          mdxOptions: {
            remarkPlugins: [remarkGfm],
            rehypePlugins: [
              [rehypePrettyCode, { theme: 'github-dark-default', keepBackground: false }],
            ],
          },
        }}
      />
    </div>
  )
}
```

- [ ] **Step 3: Add MDX content styling to globals.css**

Append to `app/globals.css`:

```css
.mdx h2 {
  font-variation-settings: 'MONO' 0.5, 'CASL' 0.2;
  font-weight: 620;
  letter-spacing: -0.02em;
  font-size: 1.4rem;
  color: var(--color-text);
  margin: 2.5rem 0 0.9rem;
}

.mdx h3 {
  font-variation-settings: 'MONO' 0.5, 'CASL' 0.2;
  font-weight: 600;
  font-size: 1.1rem;
  color: var(--color-text);
  margin: 2rem 0 0.7rem;
}

.mdx p {
  margin: 0 0 1.25rem;
}

.mdx a {
  color: var(--color-accent);
  text-underline-offset: 3px;
  text-decoration: underline;
}

.mdx ul, .mdx ol {
  margin: 0 0 1.25rem 1.25rem;
  list-style: disc;
}

.mdx ol { list-style: decimal; }
.mdx li { margin-bottom: 0.4rem; }

.mdx pre {
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-left: 2px solid var(--color-accent);
  padding: 1rem 1.1rem;
  overflow-x: auto;
  font-size: 13px;
  line-height: 1.7;
  margin: 0 0 1.5rem;
  max-width: 100%;
}

.mdx :not(pre) > code {
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  padding: 0.1rem 0.35rem;
  font-size: 0.9em;
}

.mdx blockquote {
  border-left: 2px solid var(--color-border);
  padding-left: 1rem;
  color: var(--color-dim);
  margin: 0 0 1.25rem;
}
```

- [ ] **Step 4: Create components/TranslationMissingNotice.tsx**

```tsx
import Link from 'next/link'
import type { Lang } from '@/lib/content/types'
import { getDictionary } from '@/lib/i18n/dictionaries'

export function TranslationMissingNotice({ lang, href }: { lang: Lang; href: string }) {
  const dict = getDictionary(lang)

  return (
    <div
      data-testid="translation-missing"
      className="border border-[var(--color-border)] bg-[var(--color-surface)] p-6"
    >
      <p className="u-mono text-[10px] text-[var(--color-accent)]">
        {dict.translationMissing.title}
      </p>
      <p className="u-prose mt-3 text-[var(--color-muted)]">{dict.translationMissing.body}</p>
      <Link
        href={href}
        className="u-mono mt-5 inline-block text-[11px] text-[var(--color-accent)] hover:underline"
      >
        {dict.translationMissing.cta} →
      </Link>
    </div>
  )
}
```

- [ ] **Step 5: Create the newsletter listing page**

`app/[lang]/newsletter/page.tsx`:

```tsx
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { LANGS, isLang } from '@/lib/content/types'
import { getPosts } from '@/lib/content/posts'
import { getDictionary } from '@/lib/i18n/dictionaries'

export function generateStaticParams() {
  return LANGS.map((lang) => ({ lang }))
}

export default async function NewsletterPage({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params
  if (!isLang(lang)) notFound()

  const dict = getDictionary(lang)
  const posts = getPosts(lang)

  return (
    <main className="mx-auto max-w-4xl px-6 py-16">
      <h1 className="u-heading text-3xl">{dict.nav.newsletter}</h1>

      <ul className="mt-12 flex flex-col gap-10">
        {posts.map((post) => (
          <li key={post.slug}>
            <Link href={`/${lang}/newsletter/${post.slug}`} className="group block">
              <p className="u-mono text-[10px] text-[var(--color-dim)]">
                {post.date} · {post.readingMinutes} {dict.post.readingTime}
              </p>
              <h2 className="u-heading mt-1 text-xl group-hover:text-[var(--color-accent)]">
                {post.title}
              </h2>
              <p className="u-prose mt-2 text-[var(--color-muted)]">{post.summary}</p>
              {post.tags.length > 0 ? (
                <ul className="u-mono mt-3 flex flex-wrap gap-3 text-[10px] text-[var(--color-dim)]">
                  {post.tags.map((tag) => (
                    <li key={tag}>#{tag}</li>
                  ))}
                </ul>
              ) : null}
            </Link>
          </li>
        ))}
      </ul>

      <a
        href={`/${lang}/rss.xml`}
        className="u-mono mt-14 inline-block text-[11px] text-[var(--color-accent)] hover:underline"
      >
        {dict.post.subscribeRss} →
      </a>
    </main>
  )
}
```

- [ ] **Step 6: Create the article page**

`app/[lang]/newsletter/[slug]/page.tsx`:

```tsx
import Link from 'next/link'
import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import { isLang } from '@/lib/content/types'
import { getPost, getPostSlugs, isTranslationMissing } from '@/lib/content/posts'
import { getDictionary } from '@/lib/i18n/dictionaries'
import { Mdx } from '@/components/Mdx'
import { TranslationMissingNotice } from '@/components/TranslationMissingNotice'

export function generateStaticParams() {
  return getPostSlugs()
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: string; slug: string }>
}): Promise<Metadata> {
  const { lang, slug } = await params
  if (!isLang(lang)) return {}

  const post = getPost(lang, slug)
  if (!post || isTranslationMissing(post)) return {}

  return { title: post.title, description: post.summary }
}

export default async function PostPage({
  params,
}: {
  params: Promise<{ lang: string; slug: string }>
}) {
  const { lang, slug } = await params
  if (!isLang(lang)) notFound()

  const post = getPost(lang, slug)
  if (!post) notFound()

  const dict = getDictionary(lang)

  if (isTranslationMissing(post)) {
    return (
      <main className="mx-auto max-w-4xl px-6 py-16">
        <TranslationMissingNotice
          lang={lang}
          href={`/${post.availableLang}/newsletter/${post.slug}`}
        />
      </main>
    )
  }

  return (
    <main className="mx-auto max-w-4xl px-6 py-16">
      <article>
        <p className="u-mono text-[10px] text-[var(--color-accent)]">
          {post.date} · {post.readingMinutes} {dict.post.readingTime}
        </p>
        <h1 className="u-heading mt-3 text-3xl leading-[1.15]">{post.title}</h1>
        <div className="mt-10">
          <Mdx source={post.body} />
        </div>
      </article>

      <Link
        href={`/${lang}/newsletter`}
        className="u-mono mt-16 inline-block text-[11px] text-[var(--color-accent)] hover:underline"
      >
        ← {dict.post.backToNewsletter}
      </Link>
    </main>
  )
}
```

- [ ] **Step 7: Verify the build renders MDX and highlights code**

Run: `npm run build`
Expected: succeeds, and `out/pt/newsletter/exemplo-limpeza-dados/index.html` exists.

Confirm the syntax highlighter ran:

```bash
grep -c 'data-rehype-pretty-code' out/pt/newsletter/exemplo-limpeza-dados/index.html
```

Expected: a count of 1 or greater. If it is 0, the rehype plugin did not run — check the `options.mdxOptions.rehypePlugins` wiring in `components/Mdx.tsx` before continuing.

- [ ] **Step 8: Verify the missing-translation page was generated**

```bash
grep -c 'translation-missing' out/en/newsletter/exemplo-somente-portugues/index.html
```

Expected: 1 or greater.

- [ ] **Step 9: Commit**

```bash
git add -A
git commit -m "feat: add newsletter listing, article rendering, and translation notice"
```

---

### Task 9: Case study pages

**Files:**
- Create: `app/[lang]/projects/[slug]/page.tsx`

**Interfaces:**
- Consumes: `getProject`, `getProjectSlugs` from `lib/content/projects.ts`; `isTranslationMissing` from `lib/content/posts.ts`; `Mdx` and `TranslationMissingNotice` from Task 8.
- Produces: `/[lang]/projects/[slug]` for every project in both languages.

- [ ] **Step 1: Create the case study page**

`app/[lang]/projects/[slug]/page.tsx`:

```tsx
import Link from 'next/link'
import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import { isLang } from '@/lib/content/types'
import { getProject, getProjectSlugs } from '@/lib/content/projects'
import { isTranslationMissing } from '@/lib/content/posts'
import { getDictionary } from '@/lib/i18n/dictionaries'
import { Mdx } from '@/components/Mdx'
import { TranslationMissingNotice } from '@/components/TranslationMissingNotice'

export function generateStaticParams() {
  return getProjectSlugs()
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: string; slug: string }>
}): Promise<Metadata> {
  const { lang, slug } = await params
  if (!isLang(lang)) return {}

  const project = getProject(lang, slug)
  if (!project || isTranslationMissing(project)) return {}

  return { title: project.title, description: project.summary }
}

export default async function ProjectPage({
  params,
}: {
  params: Promise<{ lang: string; slug: string }>
}) {
  const { lang, slug } = await params
  if (!isLang(lang)) notFound()

  const project = getProject(lang, slug)
  if (!project) notFound()

  const dict = getDictionary(lang)

  if (isTranslationMissing(project)) {
    return (
      <main className="mx-auto max-w-4xl px-6 py-16">
        <TranslationMissingNotice
          lang={lang}
          href={`/${project.availableLang}/projects/${project.slug}`}
        />
      </main>
    )
  }

  return (
    <main className="mx-auto max-w-4xl px-6 py-16">
      <article>
        <h1 className="u-heading text-3xl leading-[1.15]">{project.title}</h1>
        <p className="u-prose mt-3 text-[var(--color-muted)]">{project.summary}</p>

        <dl className="mt-8 flex flex-col gap-4 border-y border-[var(--color-border)] py-6">
          <div className="flex gap-4">
            <dt className="u-mono w-24 shrink-0 text-[10px] text-[var(--color-dim)]">
              {dict.project.result}
            </dt>
            <dd className="text-sm text-[var(--color-text)]">{project.result}</dd>
          </div>
          <div className="flex gap-4">
            <dt className="u-mono w-24 shrink-0 text-[10px] text-[var(--color-dim)]">
              {dict.project.stack}
            </dt>
            <dd className="u-mono text-[10px] text-[var(--color-muted)]">
              {project.stack.join(' · ')}
            </dd>
          </div>
        </dl>

        <div className="mt-10">
          <Mdx source={project.body} />
        </div>

        <div className="u-mono mt-10 flex gap-6 text-[11px]">
          {project.repoUrl ? (
            <a href={project.repoUrl} className="text-[var(--color-accent)] hover:underline">
              {dict.project.repository} ↗
            </a>
          ) : null}
          {project.demoUrl ? (
            <a href={project.demoUrl} className="text-[var(--color-accent)] hover:underline">
              {dict.project.demo} ↗
            </a>
          ) : null}
        </div>
      </article>

      <Link
        href={`/${lang}#projects`}
        className="u-mono mt-16 inline-block text-[11px] text-[var(--color-accent)] hover:underline"
      >
        ← {dict.home.featuredProjects}
      </Link>
    </main>
  )
}
```

- [ ] **Step 2: Verify the build**

Run: `npm run build`
Expected: succeeds, `out/pt/projects/exemplo-churn/index.html` and `out/en/projects/exemplo-churn/index.html` both exist.

- [ ] **Step 3: Commit**

```bash
git add -A
git commit -m "feat: add case study pages"
```

---

### Task 10: RSS, sitemap, robots, and metadata

**Files:**
- Create: `lib/site.ts`
- Create: `lib/feed.ts`
- Create: `app/[lang]/rss.xml/route.ts`
- Create: `app/sitemap.ts`
- Create: `app/robots.ts`
- Modify: `app/[lang]/layout.tsx`
- Create: `tests/unit/feed.test.ts`

**Interfaces:**
- Consumes: `getPosts`, `getProjects`, `getProfile`, `LANGS`.
- Produces:
  - `SITE_URL: string` and `SITE_NAME: string` in `lib/site.ts`
  - `buildRssXml(lang: Lang, posts: PostMeta[]): string` in `lib/feed.ts`

- [ ] **Step 1: Write the failing feed test**

`tests/unit/feed.test.ts`:

```ts
import { describe, expect, it } from 'vitest'
import { buildRssXml } from '@/lib/feed'
import type { PostMeta } from '@/lib/content/types'

const posts: PostMeta[] = [
  {
    slug: 'primeiro',
    lang: 'pt',
    title: 'Título com & e <tags>',
    summary: 'Resumo com "aspas" e & comercial',
    date: '2026-03-14',
    tags: ['dados'],
    readingMinutes: 8,
    placeholder: false,
  },
]

describe('buildRssXml', () => {
  const xml = buildRssXml('pt', posts)

  it('declares an RSS 2.0 document', () => {
    expect(xml).toContain('<?xml version="1.0" encoding="UTF-8"?>')
    expect(xml).toContain('<rss version="2.0"')
  })

  it('escapes XML-significant characters in the title', () => {
    expect(xml).toContain('T&#237;tulo com &amp; e &lt;tags&gt;')
    expect(xml).not.toContain('<tags>')
  })

  it('emits one item per post', () => {
    expect(xml.match(/<item>/g)?.length).toBe(1)
  })

  it('uses absolute links', () => {
    expect(xml).toMatch(/<link>https?:\/\/[^<]+\/pt\/newsletter\/primeiro<\/link>/)
  })

  it('formats pubDate as RFC 822', () => {
    expect(xml).toMatch(/<pubDate>\w{3}, \d{2} \w{3} \d{4}/)
  })

  it('produces an empty but valid feed when there are no posts', () => {
    const empty = buildRssXml('en', [])
    expect(empty).toContain('<channel>')
    expect(empty).not.toContain('<item>')
  })
})
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `npm run test`
Expected: FAIL — cannot resolve `@/lib/feed`.

- [ ] **Step 3: Create lib/site.ts**

```ts
/**
 * Set NEXT_PUBLIC_SITE_URL in Vercel to the production domain once it is
 * registered. The fallback keeps local builds and tests deterministic.
 */
export const SITE_URL = (
  process.env.NEXT_PUBLIC_SITE_URL ?? 'https://portfolio-v2.vercel.app'
).replace(/\/$/, '')

export const SITE_NAME = 'Yuri Oliveira'
```

- [ ] **Step 4: Create lib/feed.ts**

```ts
import { SITE_NAME, SITE_URL } from './site'
import type { Lang, PostMeta } from './content/types'

function escapeXml(value: string): string {
  // Escapes the five XML-significant characters, plus every character
  // outside printable ASCII as a numeric entity, for maximum feed-reader
  // compatibility. Written as [^ -~] on purpose: an \xNN range here is easy
  // to corrupt into literal control bytes that are invisible in a source
  // file and silently change what the character class matches.
  return value.replace(/[<>&'"]|[^ -~]/g, (char) => {
    if (char === '<') return '&lt;'
    if (char === '>') return '&gt;'
    if (char === '&') return '&amp;'
    if (char === "'") return '&apos;'
    if (char === '"') return '&quot;'
    return `&#${char.charCodeAt(0)};`
  })
}

function toRfc822(isoDate: string): string {
  return new Date(`${isoDate}T00:00:00Z`).toUTCString()
}

export function buildRssXml(lang: Lang, posts: PostMeta[]): string {
  const feedUrl = `${SITE_URL}/${lang}/rss.xml`
  const homeUrl = `${SITE_URL}/${lang}`

  const items = posts
    .map((post) => {
      const url = `${SITE_URL}/${lang}/newsletter/${post.slug}`
      return [
        '    <item>',
        `      <title>${escapeXml(post.title)}</title>`,
        `      <link>${url}</link>`,
        `      <guid isPermaLink="true">${url}</guid>`,
        `      <description>${escapeXml(post.summary)}</description>`,
        `      <pubDate>${toRfc822(post.date)}</pubDate>`,
        '    </item>',
      ].join('\n')
    })
    .join('\n')

  const head = [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">',
    '  <channel>',
    `    <title>${escapeXml(SITE_NAME)}</title>`,
    `    <link>${homeUrl}</link>`,
    `    <description>${escapeXml(SITE_NAME)}</description>`,
    `    <language>${lang}</language>`,
    `    <atom:link href="${feedUrl}" rel="self" type="application/rss+xml"/>`,
  ]

  const tail = ['  </channel>', '</rss>', '']

  return [...head, ...(items ? [items] : []), ...tail].join('
')
}
```

- [ ] **Step 5: Run the test to verify it passes**

Run: `npm run test`
Expected: PASS — 6 feed tests.

- [ ] **Step 6: Create the static RSS route**

`app/[lang]/rss.xml/route.ts`:

```ts
import { LANGS, isLang } from '@/lib/content/types'
import { getPosts } from '@/lib/content/posts'
import { buildRssXml } from '@/lib/feed'

export const dynamic = 'force-static'

export function generateStaticParams() {
  return LANGS.map((lang) => ({ lang }))
}

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ lang: string }> },
) {
  const { lang } = await params
  if (!isLang(lang)) return new Response('Not found', { status: 404 })

  return new Response(buildRssXml(lang, getPosts(lang)), {
    headers: { 'Content-Type': 'application/rss+xml; charset=utf-8' },
  })
}
```

- [ ] **Step 7: Create app/sitemap.ts**

```ts
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
```

- [ ] **Step 8: Create app/robots.ts**

```ts
import type { MetadataRoute } from 'next'
import { SITE_URL } from '@/lib/site'

export const dynamic = 'force-static'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: { userAgent: '*', allow: '/' },
    sitemap: `${SITE_URL}/sitemap.xml`,
  }
}
```

- [ ] **Step 9: Add site-wide metadata to the root layout**

In `app/[lang]/layout.tsx` (the root layout since Task 6), add above the
component and export it:

```tsx
import type { Metadata } from 'next'
import { SITE_NAME, SITE_URL } from '@/lib/site'

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: { default: SITE_NAME, template: `%s · ${SITE_NAME}` },
  description: 'Portfólio e newsletter sobre dados e inteligência artificial.',
  openGraph: { type: 'website', siteName: SITE_NAME },
  twitter: { card: 'summary_large_image' },
}
```

- [ ] **Step 10: Verify all generated files exist**

Run: `npm run build`

Then confirm each file:

```bash
ls out/sitemap.xml out/robots.txt
find out -name 'rss.xml*' -o -path '*rss.xml*' -name 'index.html'
```

Expected: `sitemap.xml` and `robots.txt` exist, and the feed appears once per
language.

Two things can go wrong here:

- **Nothing named `rss.xml` at all** — the route handler was not treated as
  static. Verify `export const dynamic = 'force-static'` is present.
- **The feed landed at `out/pt/rss.xml/index.html`** — `trailingSlash: true`
  applied to the route handler. That still serves correctly at `/pt/rss.xml/`,
  but feed readers expect `/pt/rss.xml`. If this happens, change the newsletter
  page's RSS link and `lib/feed.ts`'s `feedUrl` to the trailing-slash form so the
  advertised URL and the real file agree. Do not remove `trailingSlash` — the
  rest of the site depends on it.

- [ ] **Step 11: Commit**

```bash
git add -A
git commit -m "feat: add per-language RSS feeds, sitemap, robots, and metadata"
```

---

### Task 11: Playwright smoke tests

**Files:**
- Create: `playwright.config.ts`
- Create: `tests/e2e/site.spec.ts`
- Modify: `package.json` (add `test:e2e` script)
- Modify: `.gitignore` (add Playwright output dirs)
- Create: `public/cv/curriculo-pt.pdf`, `public/cv/curriculo-en.pdf` (placeholders until the real files arrive)

**Interfaces:**
- Consumes: the built `out/` directory from every previous task.
- Produces: `npm run test:e2e` — runs the built static site and asserts the spec's five smoke criteria.

- [ ] **Step 1: Install Playwright**

```bash
npm install -D @playwright/test@1.63.0 serve@14
npx playwright install chromium
```

- [ ] **Step 2: Add the e2e script to package.json**

Add to `"scripts"`:

```json
"test:e2e": "playwright test"
```

- [ ] **Step 3: Create placeholder CV files so the download assertion has a target**

```bash
mkdir -p public/cv
printf '%%PDF-1.4\n%%%%EOF\n' > public/cv/curriculo-pt.pdf
printf '%%PDF-1.4\n%%%%EOF\n' > public/cv/curriculo-en.pdf
```

These are minimal valid-enough stubs to prove the route serves. Replace them with the real résumés before going live.

- [ ] **Step 4: Create playwright.config.ts**

```ts
import { defineConfig } from '@playwright/test'

export default defineConfig({
  testDir: './tests/e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  use: { baseURL: 'http://127.0.0.1:4321', trace: 'on-first-retry' },
  webServer: {
    command: 'npx serve out -l 4321 --no-clipboard',
    url: 'http://127.0.0.1:4321/pt/',
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
  },
})
```

The suite runs against the **built export**, not the dev server — that is the only way to catch breakage that only appears in static output.

- [ ] **Step 5: Write the smoke tests**

`tests/e2e/site.spec.ts`:

```ts
import { expect, test } from '@playwright/test'

const SECTIONS = ['hero', 'projects', 'experience', 'education', 'skills', 'posts', 'contact']

test.describe('home', () => {
  for (const lang of ['pt', 'en']) {
    test(`renders all seven sections in ${lang}`, async ({ page }) => {
      await page.goto(`/${lang}/`)
      for (const id of SECTIONS) {
        await expect(page.locator(`#${id}`)).toHaveCount(1)
      }
    })
  }

  test('shows different copy per language', async ({ page }) => {
    await page.goto('/pt/')
    const pt = await page.locator('#contact h2').textContent()
    await page.goto('/en/')
    const en = await page.locator('#contact h2').textContent()
    expect(pt).not.toBe(en)
  })
})

test('the language switcher moves the visitor to the other language', async ({ page }) => {
  await page.goto('/pt/')
  await page.getByRole('link', { name: 'EN', exact: true }).click()
  await expect(page).toHaveURL(/\/en\/?$/)
})

test('an article opens from the newsletter listing', async ({ page }) => {
  await page.goto('/pt/newsletter/')
  await page.locator('main ul li a').first().click()
  await expect(page.locator('article h1')).toBeVisible()
})

test('an untranslated article shows the notice and links to the version that exists', async ({
  page,
}) => {
  await page.goto('/en/newsletter/exemplo-somente-portugues/')
  const notice = page.getByTestId('translation-missing')
  await expect(notice).toBeVisible()
  await notice.getByRole('link').click()
  await expect(page).toHaveURL(/\/pt\/newsletter\/exemplo-somente-portugues/)
})

test('a case study opens from the home page', async ({ page }) => {
  await page.goto('/pt/')
  await page.locator('#projects a').first().click()
  await expect(page).toHaveURL(/\/pt\/projects\//)
  await expect(page.locator('article h1')).toBeVisible()
})

test('the CV is downloadable', async ({ page, request }) => {
  await page.goto('/pt/')
  const href = await page.locator('#contact a[href$=".pdf"]').first().getAttribute('href')
  expect(href).toBeTruthy()
  const response = await request.get(href as string)
  expect(response.status()).toBe(200)
})
```

- [ ] **Step 6: Add Playwright output to .gitignore**

Append to `.gitignore`:

```
/test-results/
/playwright-report/
/blob-report/
/.playwright/
```

- [ ] **Step 7: Build and run the e2e suite**

```bash
npm run build
npm run test:e2e
```

Expected: all tests pass.

If the untranslated-article test fails with a 404, the page was not generated — re-check that `getPostSlugs()` returns both languages for every slug (Task 4, Step 6).

- [ ] **Step 8: Commit**

```bash
git add -A
git commit -m "test: add Playwright smoke suite against the static export"
```

---

### Task 12: Deployment configuration and README

**Files:**
- Create: `vercel.json`
- Create: `app/[lang]/not-found.tsx`
- Modify: `app/[lang]/layout.tsx` (add Analytics)
- Create: `README.md`

**Interfaces:**
- Consumes: everything.
- Produces: a repository that deploys to Vercel on push, redirects `/` to `/pt/`, and documents how to publish an article.

- [ ] **Step 1: Install Vercel Analytics**

```bash
npm install @vercel/analytics@2.0.1
```

- [ ] **Step 2: Add Analytics to the root layout**

In `app/[lang]/layout.tsx`, import and render it inside `<body>`:

```tsx
import { Analytics } from '@vercel/analytics/next'
```

and change the body to:

```tsx
      <body>
        <div className="min-h-screen">
          <SiteHeader lang={lang} />
          {children}
        </div>
        <Analytics />
      </body>
```

- [ ] **Step 3: Create vercel.json with the root redirect**

```json
{
  "redirects": [
    {
      "source": "/",
      "destination": "/pt/",
      "permanent": false
    }
  ]
}
```

`permanent: false` (a 307) is deliberate: if the default language ever changes, a permanent redirect would already be cached in visitors' browsers.

- [ ] **Step 4: Create a not-found page**

It lives at `app/[lang]/not-found.tsx`, inside the language segment, because the
root layout lives there too — a root-level `not-found.tsx` would have no layout
to render into.

`app/[lang]/not-found.tsx`:

```tsx
import Link from 'next/link'

export default function NotFound() {
  return (
    <main className="mx-auto flex min-h-screen max-w-4xl flex-col justify-center px-6">
      <p className="u-mono text-[10px] text-[var(--color-accent)]">erro 404</p>
      <h1 className="u-heading mt-3 text-3xl">Página não encontrada</h1>
      <Link
        href="/pt/"
        className="u-mono mt-8 inline-block text-[11px] text-[var(--color-accent)] hover:underline"
      >
        ← Voltar ao início
      </Link>
    </main>
  )
}
```

- [ ] **Step 5: Write the README**

`README.md`:

````markdown
# Portfólio + Newsletter — Yuri Oliveira

Site estático bilíngue (pt/en) construído com Next.js e exportado como HTML puro.
Publicar um artigo custa um commit.

## Rodar localmente

```bash
npm install
npm run dev      # http://localhost:3000/pt
```

## Comandos

| Comando | O que faz |
|---|---|
| `npm run dev` | servidor de desenvolvimento |
| `npm run build` | gera o site estático em `out/` |
| `npm run test` | testes unitários (Vitest) |
| `npm run test:e2e` | testes de ponta a ponta (Playwright, roda sobre `out/`) |

## Publicar um artigo

1. Crie `content/posts/pt/<slug>.mdx` (e `content/posts/en/<slug>.mdx` se houver tradução).
2. Preencha o frontmatter:

```yaml
---
title: "Título do artigo"
summary: "Uma frase que aparece na listagem."
date: "2026-03-14"
tags: ["dados"]
---
```

3. `git commit && git push`. A Vercel publica sozinha.

Um artigo que existe em um idioma só não aparece na listagem do outro; quem chegar
por link direto vê um aviso com link para a versão existente.

## Conteúdo de exemplo

Arquivos com `placeholder: true` no frontmatter **quebram o deploy de produção**
na Vercel. Isso é intencional: impede que conteúdo de exemplo vá ao ar por
esquecimento. Builds locais e deploys de preview continuam funcionando
normalmente; para reproduzir a falha de propósito, rode `STRICT_CONTENT=1 npm run build`.

Antes de publicar, substitua-os por conteúdo real e remova a marcação. Os arquivos
atuais marcados assim são:

- `content/posts/pt/exemplo-limpeza-dados.mdx` e a versão `en`
- `content/posts/pt/exemplo-somente-portugues.mdx`
- `content/projects/pt/exemplo-churn.mdx` e a versão `en`
- `content/profile/pt.ts` e `content/profile/en.ts`

Substitua também `public/cv/curriculo-pt.pdf` e `public/cv/curriculo-en.pdf` pelos
currículos reais.

## Variáveis de ambiente

| Variável | Onde | Valor |
|---|---|---|
| `NEXT_PUBLIC_SITE_URL` | Vercel → Settings → Environment Variables | o domínio final, ex. `https://seudominio.dev` |
| `STRICT_CONTENT` | opcional, local | `1` para fazer o build falhar em conteúdo de exemplo, como falharia em produção |

Sem ela, links absolutos no RSS e no sitemap apontam para o domínio `.vercel.app`.

## Design

Direção visual, paleta e regras de tipografia estão em
`docs/superpowers/specs/2026-09-07-portfolio-dados-ia-design.md`. A paleta é
verificada por teste automatizado — alterar cores sem rodar `npm run test` quebra
o contraste WCAG AA.
````

- [ ] **Step 6: Verify everything still builds and passes**

```bash
npm run build
npm run test
npm run test:e2e
```

Expected: all three succeed.

- [ ] **Step 7: Verify the production placeholder guard fires**

Bash / Git Bash:

```bash
STRICT_CONTENT=1 npm run build
```

PowerShell:

```powershell
$env:STRICT_CONTENT='1'; npm run build; $env:STRICT_CONTENT=$null
```

Expected: **build FAILS** with `Conteúdo de exemplo não pode ir para produção: …`.

That failure is the correct final state of this plan: it proves the site cannot
go live carrying example content. A plain `npm run build` must still succeed —
if it does not, the guard is keying off the wrong variable (see Task 3).

- [ ] **Step 8: Commit and push**

```bash
git add -A
git commit -m "feat: add deployment config, analytics, 404 page, and README"
git push origin main
```

- [ ] **Step 9: Connect Vercel (manual, done by the repository owner)**

1. On vercel.com, import `oliveira-yuri/portfolio-v2`.
2. Framework preset: Next.js. Leave build command and output directory at their defaults — Vercel detects `output: 'export'`.
3. Add `NEXT_PUBLIC_SITE_URL` with the final domain.
4. Point the registered domain at the project in Settings → Domains.

Note: the first deploy will fail while example content is still marked `placeholder: true`. That is the guard working as designed — it clears once real content lands.

---

## Notes for the implementer

**The three things most likely to trip you up:**

1. **`params` is a Promise.** Every page and route handler must `await params`. This is the most common error in this codebase.
2. **Static export forbids servers.** No server actions, no dynamic route handlers. Route handlers need `export const dynamic = 'force-static'`.
3. **Do not "fix" the placeholder build failure.** `STRICT_CONTENT=1 npm run build` failing on example content is the designed behavior, verified in Task 12 Step 7. A plain `npm run build` must keep succeeding — if it starts failing on placeholder content, the guard is keying off `NODE_ENV`, which `next build` always sets to `production`.

**Content dependency:** Tasks 1–12 are fully implementable with the example content in this plan. The real content (Section 9 of the spec) is needed only to go live.
