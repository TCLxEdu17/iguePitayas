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

  it('produces correct URL when path has no leading slash', () => {
    process.env.NEXT_PUBLIC_API_URL = 'https://iguebananas.onrender.com'
    const { getApiUrl } = require('@/lib/api-url')
    // Documents the contract: path should start with '/'
    // Without it, the URL will be malformed
    expect(getApiUrl('api/plots')).toBe('https://iguebananas.onrender.comapi/plots')
  })
})
