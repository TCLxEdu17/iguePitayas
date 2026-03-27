import { authOptions } from '@/lib/auth'

// Mock db so no real DB connection is needed
jest.mock('@/lib/db', () => ({
  db: {
    user: {
      findUnique: jest.fn(),
    },
  },
}))

describe('authOptions', () => {
  it('has credentials provider', () => {
    expect(authOptions.providers).toHaveLength(1)
    expect(authOptions.providers[0].id).toBe('credentials')
  })

  it('has jwt session strategy', () => {
    expect(authOptions.session?.strategy).toBe('jwt')
  })

  it('has custom login page', () => {
    expect(authOptions.pages?.signIn).toBe('/login')
  })
})
