'use client'

import { useEffect, useCallback } from 'react'
import { useSyncStore } from '@/stores/sync.store'
import { getPendingCount, syncAll } from '@/lib/offline/sync'

export function useSync() {
  const { pendingCount, isSyncing, setPending, setSyncing } = useSyncStore()

  const refresh = useCallback(async () => {
    try {
      const count = await getPendingCount()
      setPending(count)
    } catch {
      // IndexedDB not available (SSR)
    }
  }, [setPending])

  const sync = useCallback(async () => {
    if (isSyncing) return
    setSyncing(true)
    try {
      await syncAll()
      await refresh()
    } finally {
      setSyncing(false)
    }
  }, [isSyncing, setSyncing, refresh])

  useEffect(() => {
    refresh()
    window.addEventListener('online', sync)
    return () => window.removeEventListener('online', sync)
  }, [refresh, sync])

  return { pendingCount, isSyncing, sync, refresh }
}
