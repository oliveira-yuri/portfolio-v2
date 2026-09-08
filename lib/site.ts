/**
 * Set NEXT_PUBLIC_SITE_URL in Vercel to the production domain once it is
 * registered. The fallback keeps local builds and tests deterministic.
 */
export const SITE_URL = (
  process.env.NEXT_PUBLIC_SITE_URL ?? 'https://portfolio-v2.vercel.app'
).replace(/\/$/, '')

export const SITE_NAME = 'Yuri Oliveira'
