'use client'

import { Sidebar } from './Sidebar'
import { BottomNav } from './BottomNav'
import { SyncBadge } from './SyncBadge'
import { PrimaryAdminEffects } from './PrimaryAdminEffects'

export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen">
      <PrimaryAdminEffects />
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <header
          className="flex items-center justify-end gap-2 px-4 py-2 border-b bg-white md:sticky md:top-0 md:z-10"
          style={{ minHeight: '48px' }}
        >
          <SyncBadge />
        </header>
        <main className="flex-1 overflow-auto pb-16 md:pb-0">
          {children}
        </main>
      </div>
      <BottomNav />
    </div>
  )
}
