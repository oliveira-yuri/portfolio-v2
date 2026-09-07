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
