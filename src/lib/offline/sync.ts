import { offlineDb, type LocalSite } from './db'
import { getApiUrl } from '@/lib/api-url'

export async function cacheSite(siteId: string): Promise<void> {
  try {
    const res = await fetch(getApiUrl(`/api/sites/${siteId}`))
    if (!res.ok) return
    const site = await res.json()
    const local: LocalSite = {
      id:          site.id,
      farmId:      site.farmId,
      name:        site.name,
      mapImageUrl: site.mapImageUrl ?? null,
      plots:       (site.plots ?? []).map((p: any) => ({
        id:          p.id,
        siteId:      p.siteId ?? null,
        farmId:      p.farmId,
        code:        p.code,
        name:        p.name,
        area:        p.area ?? null,
        productType: p.productType ?? null,
        status:      p.status,
        polygon:     p.polygon ?? null,
        notes:       p.notes ?? null,
      })),
      cachedAt: Date.now(),
    }
    await offlineDb.sites.put(local)
  } catch {
    // network error — skip cache
  }
}

export async function getCachedSite(siteId: string): Promise<LocalSite | undefined> {
  try {
    return await offlineDb.sites.get(siteId)
  } catch {
    return undefined
  }
}

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
      const res = await fetch(getApiUrl('/api/activities'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(record),
      })

      if (res.ok) {
        await offlineDb.activities.update(record.localId, { syncStatus: 'SYNCED' })
      } else {
        // 409 = conflict, 4xx = validation error — mark as CONFLICT so it doesn't block forever
        await offlineDb.activities.update(record.localId, { syncStatus: 'CONFLICT' })
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
      const res = await fetch(getApiUrl('/api/harvests'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(record),
      })

      if (res.ok) {
        await offlineDb.harvests.update(record.localId, { syncStatus: 'SYNCED' })
      } else {
        await offlineDb.harvests.update(record.localId, { syncStatus: 'CONFLICT' })
      }
    } catch {
      // network error — leave as PENDING
    }
  }
}

export async function syncAll(): Promise<void> {
  await Promise.all([syncActivities(), syncHarvests()])
}
