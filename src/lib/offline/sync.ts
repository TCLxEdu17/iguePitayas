import { offlineDb } from './db'

export async function getPendingCount(): Promise<number> {
  const [activities, harvests] = await Promise.all([
    offlineDb.activities.where('syncStatus').equals('PENDING').count(),
    offlineDb.harvests.where('syncStatus').equals('PENDING').count(),
  ])
  return activities + harvests
}

export async function syncActivities(): Promise<void> {
  const pending = await offlineDb.activities
    .where('syncStatus').equals('PENDING')
    .toArray()

  for (const record of pending) {
    try {
      const res = await fetch('/api/activities', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(record),
      })

      if (res.status === 409) {
        await offlineDb.activities.update(record.localId, { syncStatus: 'CONFLICT' })
      } else if (res.ok) {
        await offlineDb.activities.update(record.localId, { syncStatus: 'SYNCED' })
      }
    } catch {
      // network error — leave as PENDING
    }
  }
}

export async function syncHarvests(): Promise<void> {
  const pending = await offlineDb.harvests
    .where('syncStatus').equals('PENDING')
    .toArray()

  for (const record of pending) {
    try {
      const res = await fetch('/api/harvests', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(record),
      })

      if (res.status === 409) {
        await offlineDb.harvests.update(record.localId, { syncStatus: 'CONFLICT' })
      } else if (res.ok) {
        await offlineDb.harvests.update(record.localId, { syncStatus: 'SYNCED' })
      }
    } catch {
      // network error — leave as PENDING
    }
  }
}

export async function syncAll(): Promise<void> {
  await Promise.all([syncActivities(), syncHarvests()])
}
