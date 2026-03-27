import { createPlotSchema, updatePlotSchema } from '@/lib/validations/plot'

describe('plot validation', () => {
  it('requires code, name, productType', () => {
    const result = createPlotSchema.safeParse({})
    expect(result.success).toBe(false)
    const fields = result.error?.issues.map((i: any) => i.path[0])
    expect(fields).toContain('code')
    expect(fields).toContain('name')
    expect(fields).toContain('productType')
  })

  it('accepts valid plot', () => {
    const result = createPlotSchema.safeParse({
      code: 'T01',
      name: 'Talhão 01',
      productType: 'BANANA_PRATA',
      area: 1500,
    })
    expect(result.success).toBe(true)
  })

  it('rejects invalid productType', () => {
    const result = createPlotSchema.safeParse({
      code: 'T01',
      name: 'Talhão 01',
      productType: 'MANGA',
    })
    expect(result.success).toBe(false)
  })

  it('updatePlotSchema allows partial updates', () => {
    const result = updatePlotSchema.safeParse({ name: 'Updated' })
    expect(result.success).toBe(true)
  })
})
