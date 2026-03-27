import { createActivitySchema } from '@/lib/validations/activity'

const base = {
  localId: 'abc-123',
  plotId: 'plot-1',
  date: '2026-03-26T00:00:00.000Z',
  type: 'ROCAGEM',
  responsible: 'João',
}

describe('createActivitySchema', () => {
  it('accepts valid activity', () => {
    expect(createActivitySchema.safeParse(base).success).toBe(true)
  })

  it('requires localId', () => {
    const { localId, ...rest } = base
    expect(createActivitySchema.safeParse(rest).success).toBe(false)
  })

  it('requires responsible', () => {
    const { responsible, ...rest } = base
    expect(createActivitySchema.safeParse(rest).success).toBe(false)
  })

  it('rejects invalid type', () => {
    expect(createActivitySchema.safeParse({ ...base, type: 'VOAR' }).success).toBe(false)
  })

  it('rejects invalid unit', () => {
    expect(createActivitySchema.safeParse({ ...base, unit: 'KILO' }).success).toBe(false)
  })
})
