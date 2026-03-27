'use client'

import { useSync } from '@/hooks/useSync'

export function SyncBadge() {
  const { pendingCount, isSyncing, sync } = useSync()

  if (pendingCount === 0 && !isSyncing) return null

  return (
    <button
      onClick={sync}
      disabled={isSyncing}
      className="flex items-center gap-1 rounded-full px-2 py-0.5 text-xs text-white hover:opacity-90 disabled:opacity-60 transition-opacity"
      style={{ backgroundColor: 'var(--color-sync-pending)' }}
      title={isSyncing ? 'Sincronizando...' : `${pendingCount} registro(s) pendente(s). Clique para sincronizar`}
    >
      <svg
        className={`h-3 w-3 ${isSyncing ? 'animate-spin' : ''}`}
        fill="none" viewBox="0 0 24 24" stroke="currentColor"
      >
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
          d="M3 15a4 4 0 004 4h9a5 5 0 10-.1-9.999 5.002 5.002 0 10-9.78 2.096A4.001 4.001 0 003 15z" />
      </svg>
      {isSyncing ? '...' : pendingCount}
    </button>
  )
}
