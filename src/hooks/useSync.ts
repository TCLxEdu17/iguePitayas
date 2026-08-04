'use client'

import { useEffect, useCallback, useRef } from 'react'
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
    } finally {
      await refresh()
      setSyncing(false)
    }
  }, [isSyncing, setSyncing, refresh])

  // Keep a stable ref to sync so the online listener never goes stale
  const syncRef = useRef(sync)
  useEffect(() => { syncRef.current = sync }, [sync])

  useEffect(() => {
    refresh()
    const handler = () => syncRef.current()
    window.addEventListener('online', handler)
    return () => window.removeEventListener('online', handler)
  }, [refresh])

  return { pendingCount, isSyncing, sync, refresh }
}
