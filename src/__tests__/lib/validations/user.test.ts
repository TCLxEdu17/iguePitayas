import { createUserSchema, updateUserSchema } from '@/lib/validations/user'

describe('createUserSchema', () => {
  it('accepts valid input', () => {
    const result = createUserSchema.safeParse({
      name: 'João Silva',
      email: 'joao@farm.com',
      password: 'secret123',
      role: 'OPERATOR',
    })
    expect(result.success).toBe(true)
  })

  it('rejects name shorter than 2 chars', () => {
    const result = createUserSchema.safeParse({
      name: 'J',
      email: 'joao@farm.com',
      password: 'secret123',
      role: 'ADMIN',
    })
    expect(result.success).toBe(false)
  })

  it('rejects invalid email', () => {
    const result = createUserSchema.safeParse({
      name: 'João',
      email: 'not-an-email',
      password: 'secret123',
      role: 'VIEWER',
    })
    expect(result.success).toBe(false)
  })

  it('rejects password shorter than 6 chars', () => {
    const result = createUserSchema.safeParse({
      name: 'João',
      email: 'joao@farm.com',
      password: '12345',
      role: 'ADMIN',
    })
    expect(result.success).toBe(false)
  })

  it('rejects invalid role', () => {
    const result = createUserSchema.safeParse({
      name: 'João',
      email: 'joao@farm.com',
      password: 'secret123',
      role: 'SUPERADMIN',
    })
    expect(result.success).toBe(false)
  })

  it('accepts all valid roles', () => {
    for (const role of ['ADMIN', 'OPERATOR', 'VIEWER'] as const) {
      const result = createUserSchema.safeParse({
        name: 'João',
        email: 'joao@farm.com',
        password: 'secret123',
        role,
      })
      expect(result.success).toBe(true)
    }
  })
})

describe('updateUserSchema', () => {
  it('accepts empty object (all fields optional)', () => {
    expect(updateUserSchema.safeParse({}).success).toBe(true)
  })

  it('accepts partial update with only name', () => {
    expect(updateUserSchema.safeParse({ name: 'Maria' }).success).toBe(true)
  })

  it('accepts partial update with only active', () => {
    expect(updateUserSchema.safeParse({ active: false }).success).toBe(true)
  })

  it('rejects invalid email when provided', () => {
    expect(updateUserSchema.safeParse({ email: 'bad' }).success).toBe(false)
  })

  it('rejects password shorter than 6 chars when provided', () => {
    expect(updateUserSchema.safeParse({ password: '123' }).success).toBe(false)
  })
})
