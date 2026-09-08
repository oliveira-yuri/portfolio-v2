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
