import { PRODUCT_LABELS, PRODUCT_COLORS, ACTIVITY_LABELS, UNIT_LABELS } from '@/types'

describe('type constants', () => {
  it('has all product labels', () => {
    expect(PRODUCT_LABELS.BANANA_PRATA).toBe('Banana Prata')
    expect(PRODUCT_LABELS.BANANA_NANICA).toBe('Banana Nanica')
    expect(PRODUCT_LABELS.PITAYA).toBe('Pitaya')
  })

  it('has all product colors', () => {
    expect(PRODUCT_COLORS.BANANA_PRATA).toBe('#27AE60')
    expect(PRODUCT_COLORS.PITAYA).toBe('#E91E8C')
  })

  it('has all activity labels', () => {
    expect(ACTIVITY_LABELS.PULVERIZACAO).toBe('Pulverização')
    expect(ACTIVITY_LABELS.OUTRO).toBe('Outro')
  })

  it('has unit labels', () => {
    expect(UNIT_LABELS.CAIXA).toBe('Caixa')
    expect(UNIT_LABELS.UNIDADE).toBe('Unidade')
  })
})
