import { getApiUrl } from '@/lib/api-url'

describe('getApiUrl', () => {
  const OLD_ENV = process.env

  beforeEach(() => {
    jest.resetModules()
    process.env = { ...OLD_ENV }
  })

  afterAll(() => {
    process.env = OLD_ENV
  })

  it('returns relative path when NEXT_PUBLIC_API_URL is not set', () => {
    delete process.env.NEXT_PUBLIC_API_URL
    const { getApiUrl } = require('@/lib/api-url')
    expect(getApiUrl('/api/plots')).toBe('/api/plots')
  })

  it('returns absolute URL when NEXT_PUBLIC_API_URL is set', () => {
    process.env.NEXT_PUBLIC_API_URL = 'https://iguebananas.onrender.com'
    const { getApiUrl } = require('@/lib/api-url')
    expect(getApiUrl('/api/plots')).toBe('https://iguebananas.onrender.com/api/plots')
  })

  it('does not double-slash', () => {
    process.env.NEXT_PUBLIC_API_URL = 'https://iguebananas.onrender.com'
    const { getApiUrl } = require('@/lib/api-url')
    expect(getApiUrl('/api/plots')).not.toMatch(/\/\/(?!iguebananas)/)
  })
})
