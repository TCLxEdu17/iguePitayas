import { createHarvestSchema } from '@/lib/validations/harvest'

const base = {
  localId: 'h-123',
  plotId: 'p1',
  date: '2026-03-26T00:00:00.000Z',
  quantity: 50,
  unit: 'CAIXA',
  pricePerUnit: 25,
  totalRevenue: 1250,
}

describe('createHarvestSchema', () => {
  it('accepts valid harvest', () => {
    expect(createHarvestSchema.safeParse(base).success).toBe(true)
  })

  it('rejects negative quantity', () => {
    expect(createHarvestSchema.safeParse({ ...base, quantity: -1 }).success).toBe(false)
  })

  it('rejects zero quantity', () => {
    expect(createHarvestSchema.safeParse({ ...base, quantity: 0 }).success).toBe(false)
  })

  it('rejects invalid unit', () => {
    expect(createHarvestSchema.safeParse({ ...base, unit: 'KILO' }).success).toBe(false)
  })

  it('accepts UNIDADE unit', () => {
    expect(createHarvestSchema.safeParse({ ...base, unit: 'UNIDADE' }).success).toBe(true)
  })
})
