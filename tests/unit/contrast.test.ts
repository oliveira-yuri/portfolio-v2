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
