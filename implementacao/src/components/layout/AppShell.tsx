'use client'

import { Sidebar } from './Sidebar'
import { BottomNav } from './BottomNav'
import { SyncBadge } from './SyncBadge'
import { SplashScreen } from './SplashScreen'
import { PrimaryAdminEffects } from './PrimaryAdminEffects'
import { useUIStore } from '@/stores/ui.store'
import { Menu, X } from 'lucide-react'

export function AppShell({ children }: { children: React.ReactNode }) {
  const { sidebarOpen, toggleSidebar } = useUIStore()

  return (
    <div className="flex min-h-screen" style={{ background: 'var(--color-paper)' }}>
      <SplashScreen />
      <PrimaryAdminEffects />

      {/* gaveta só no desktop; no mobile a navegação é a barra de baixo */}
      <div className="hidden md:flex">
        <Sidebar />
      </div>

      <div className="flex min-w-0 flex-1 flex-col">
        <header
          className="flex items-center gap-3 px-4 py-2 md:sticky md:top-0 md:z-10"
          style={{ minHeight: 48, background: 'var(--color-paper)' }}
        >
          <button
            onClick={toggleSidebar}
            aria-label={sidebarOpen ? 'Fechar menu' : 'Abrir menu'}
            className="hidden h-10 w-10 items-center justify-center rounded-xl md:flex"
            style={{ color: 'var(--color-primary)' }}
          >
            {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
          <div className="flex-1" />
          <SyncBadge />
        </header>

        <main
          className="flex-1 overflow-auto"
          style={{ paddingBottom: 'calc(env(safe-area-inset-bottom) + 5rem)' }}
        >
          {children}
        </main>
      </div>

      <BottomNav />
    </div>
  )
}
