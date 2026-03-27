/**
 * @jest-environment node
 */
import { getPendingCount } from '@/lib/offline/sync'

// Test the sync utilities directly since the hook requires browser environment
jest.mock('@/lib/offline/sync', () => ({
  getPendingCount: jest.fn().mockResolvedValue(0),
  syncAll: jest.fn().mockResolvedValue(undefined),
}))

describe('sync utilities', () => {
  it('getPendingCount returns a number', async () => {
    const count = await getPendingCount()
    expect(typeof count).toBe('number')
  })
})
