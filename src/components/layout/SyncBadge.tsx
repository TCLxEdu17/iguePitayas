'use client'

interface SyncBadgeProps {
  pendingCount?: number
}

export function SyncBadge({ pendingCount = 0 }: SyncBadgeProps) {
  if (pendingCount === 0) return null

  return (
    <div
      className="flex items-center gap-1 rounded-full px-2 py-0.5 text-xs text-white"
      style={{ backgroundColor: 'var(--color-sync-pending)' }}
    >
      <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
          d="M3 15a4 4 0 004 4h9a5 5 0 10-.1-9.999 5.002 5.002 0 10-9.78 2.096A4.001 4.001 0 003 15z" />
      </svg>
      {pendingCount}
    </div>
  )
}
