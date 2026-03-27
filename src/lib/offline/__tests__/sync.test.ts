/**
 * @jest-environment node
 */
import 'fake-indexeddb/auto'
import { getPendingCount } from '@/lib/offline/sync'
import { offlineDb } from '@/lib/offline/db'

beforeEach(async () => {
  await offlineDb.activities.clear()
  await offlineDb.harvests.clear()
})

describe('getPendingCount', () => {
  it('returns 0 when no pending records', async () => {
    const count = await getPendingCount()
    expect(count).toBe(0)
  })

  it('counts pending activities', async () => {
    await offlineDb.activities.add({
      localId: 'a1', plotId: 'p1', userId: 'u1',
      date: new Date().toISOString(), type: 'ROCAGEM',
      responsible: 'João', confirmed: false,
      syncStatus: 'PENDING', createdAt: new Date().toISOString(),
    })
    const count = await getPendingCount()
    expect(count).toBe(1)
  })

  it('counts pending harvests', async () => {
    await offlineDb.harvests.add({
      localId: 'h1', plotId: 'p1', userId: 'u1',
      date: new Date().toISOString(), quantity: 10,
      unit: 'CAIXA', pricePerUnit: 25, totalRevenue: 250,
      syncStatus: 'PENDING', createdAt: new Date().toISOString(),
    })
    const count = await getPendingCount()
    expect(count).toBe(1)
  })

  it('counts both pending activities and harvests', async () => {
    await offlineDb.activities.add({
      localId: 'a2', plotId: 'p1', userId: 'u1',
      date: new Date().toISOString(), type: 'ROCAGEM',
      responsible: 'Maria', confirmed: false,
      syncStatus: 'PENDING', createdAt: new Date().toISOString(),
    })
    await offlineDb.harvests.add({
      localId: 'h2', plotId: 'p1', userId: 'u1',
      date: new Date().toISOString(), quantity: 5,
      unit: 'CAIXA', pricePerUnit: 30, totalRevenue: 150,
      syncStatus: 'PENDING', createdAt: new Date().toISOString(),
    })
    const count = await getPendingCount()
    expect(count).toBe(2)
  })
})
