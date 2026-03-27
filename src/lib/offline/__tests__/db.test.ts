/**
 * @jest-environment node
 */
import 'fake-indexeddb/auto'
import { offlineDb } from '@/lib/offline/db'

describe('offlineDb', () => {
  it('has activities table', () => {
    expect(offlineDb.activities).toBeDefined()
  })

  it('has harvests table', () => {
    expect(offlineDb.harvests).toBeDefined()
  })

  it('can add and retrieve an activity', async () => {
    const record = {
      localId: 'test-1',
      plotId: 'plot-1',
      userId: 'user-1',
      date: new Date().toISOString(),
      type: 'ROCAGEM',
      responsible: 'João',
      confirmed: false,
      syncStatus: 'PENDING' as const,
      createdAt: new Date().toISOString(),
    }
    await offlineDb.activities.add(record)
    const found = await offlineDb.activities.get('test-1')
    expect(found?.localId).toBe('test-1')
    expect(found?.syncStatus).toBe('PENDING')
  })
})
