'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import { useSession } from 'next-auth/react'
import { Sidebar } from './Sidebar'
import { BottomNav } from './BottomNav'
import { SyncBadge } from './SyncBadge'
import { PrimaryAdminEffects } from './PrimaryAdminEffects'
import { VersionBadge } from './VersionBadge'
import { useUIStore } from '@/stores/ui.store'
import { useSyncStore } from '@/stores/sync.store'
import { Menu, X } from 'lucide-react'

export function AppShell({ children }: { children: React.ReactNode }) {
  const { sidebarOpen, toggleSidebar } = useUIStore()
  const { data: session } = useSession()
  const isOperator = (session?.user as any)?.role === 'OPERATOR'
  const [showSheet, setShowSheet] = useState(false)

  // ── Faixa offline (todos os perfis) ──────────────────────────────────
  const pendingCount = useSyncStore(s => s.pendingCount)
  const [isOnline,   setIsOnline]   = useState(true)
  const [demoOffline, setDemoOffline] = useState(false)
  const [stripState, setStripState] = useState<'hidden' | 'offline' | 'syncing' | 'synced'>('hidden')
  const stripTimer   = useRef<ReturnType<typeof setTimeout> | null>(null)
  const prevOffline  = useRef(false)

  useEffect(() => {
    const upd = () => setIsOnline(navigator.onLine)
    window.addEventListener('online',  upd)
    window.addEventListener('offline', upd)
    setIsOnline(navigator.onLine)
    return () => { window.removeEventListener('online', upd); window.removeEventListener('offline', upd) }
  }, [])

  useEffect(() => {
    const offline = demoOffline || !isOnline || pendingCount > 0
    if (offline) {
      prevOffline.current = true
      setStripState('offline')
    } else if (prevOffline.current) {
      prevOffline.current = false
      setStripState('syncing')
      if (stripTimer.current) clearTimeout(stripTimer.current)
      stripTimer.current = setTimeout(() => {
        setStripState('synced')
        stripTimer.current = setTimeout(() => setStripState('hidden'), 2000)
      }, 1200)
    }
    return () => { if (stripTimer.current) clearTimeout(stripTimer.current) }
  }, [isOnline, demoOffline, pendingCount])

  const showStrip = stripState !== 'hidden'

  return (
    <div className="flex min-h-screen" style={{ background: 'var(--color-paper)' }}>
      <PrimaryAdminEffects />

      {/* gaveta só no desktop; no mobile a navegação é a barra de baixo */}
      <div className="hidden md:flex">
        <Sidebar />
      </div>

      <div className="flex min-w-0 flex-1 flex-col">
        {/* 3. Faixa offline — todos os perfis */}
        <div style={{
          overflow: 'hidden',
          maxHeight: showStrip ? 52 : 0,
          opacity:   showStrip ? 1 : 0,
          transition: 'max-height 240ms ease, opacity 240ms ease',
          padding:   showStrip ? '6px 16px' : '0 16px',
        }}>
          <div style={{
            borderRadius: 12,
            background:   stripState === 'synced' ? '#EEF1EA' : '#F7EFDF',
            padding:      '7px 12px',
            display:      'flex',
            alignItems:   'center',
            gap:          8,
          }}>
            <div style={{
              width: 6, height: 6, borderRadius: '50%', flexShrink: 0,
              background: stripState === 'synced' ? '#4E6B3C' : '#B8801E',
            }} />
            <span style={{ fontSize: 12.5, color: stripState === 'synced' ? '#4E6B3C' : '#7A5A14', flex: 1 }}>
              {stripState === 'syncing'
                ? 'Sincronizando…'
                : stripState === 'synced'
                  ? 'Tudo sincronizado'
                  : `Sem sinal · ${pendingCount} lançamento${pendingCount !== 1 ? 's' : ''} aguardando envio`}
            </span>
            <button
              onClick={() => setDemoOffline(v => !v)}
              style={{ fontSize: 10, color: '#A3A199', background: 'none', border: 'none', cursor: 'pointer', padding: '2px 4px', minHeight: 'auto' }}
            >
              demo
            </button>
          </div>
        </div>

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
      <VersionBadge />

      {/* FAB — só para operadores */}
      {isOperator && (
        <>
          <button
            onClick={() => setShowSheet(true)}
            aria-label="Novo lançamento"
            style={{
              position:       'fixed',
              right:          20,
              bottom:         'calc(env(safe-area-inset-bottom) + 88px)',
              width:          58,
              height:         58,
              minHeight:      58,
              borderRadius:   '50%',
              background:     '#4E6B3C',
              border:         'none',
              cursor:         'pointer',
              display:        'flex',
              alignItems:     'center',
              justifyContent: 'center',
              boxShadow:      '0 8px 20px -8px rgba(28,28,26,.45)',
              zIndex:         40,
              transition:     'background 120ms ease, transform 120ms ease',
            }}
            onPointerDown={e  => { e.currentTarget.style.background = '#3E5730'; e.currentTarget.style.transform = 'scale(.94)' }}
            onPointerUp={e    => { e.currentTarget.style.background = '#4E6B3C'; e.currentTarget.style.transform = 'scale(1)'   }}
            onPointerLeave={e => { e.currentTarget.style.background = '#4E6B3C'; e.currentTarget.style.transform = 'scale(1)'   }}
          >
            <svg width="22" height="22" viewBox="0 0 22 22" fill="none" aria-hidden>
              <line x1="11" y1="3" x2="11" y2="19" stroke="#F7F6F2" strokeWidth="2.2" strokeLinecap="round"/>
              <line x1="3"  y1="11" x2="19" y2="11" stroke="#F7F6F2" strokeWidth="2.2" strokeLinecap="round"/>
            </svg>
          </button>

          {showSheet && (
            <div
              onClick={() => setShowSheet(false)}
              style={{ position: 'fixed', inset: 0, background: 'rgba(28,28,26,.28)', zIndex: 60 }}
            />
          )}

          <div style={{
            position:      'fixed',
            left:          0,
            right:         0,
            bottom:        0,
            background:    '#FFFFFF',
            borderRadius:  '22px 22px 0 0',
            zIndex:        61,
            transform:     showSheet ? 'translateY(0)' : 'translateY(100%)',
            transition:    'transform 280ms cubic-bezier(.2,.9,.2,1)',
            paddingBottom: 'calc(env(safe-area-inset-bottom) + 8px)',
          }}>
            <div style={{ display: 'flex', justifyContent: 'center', padding: '12px 0 4px' }}>
              <div style={{ width: 36, height: 4, borderRadius: 999, background: '#E4E2DA' }} />
            </div>
            <p style={{
              fontFamily: 'var(--font-bricolage)',
              fontSize: 17, fontWeight: 700, color: '#1C1C1A',
              padding: '8px 20px 12px', margin: 0, letterSpacing: '-.02em',
            }}>
              Novo lançamento
            </p>
            {[
              { label: 'Colheita',     href: '/producao/novo'   },
              { label: 'Adubação',     href: '/atividades/novo' },
              { label: 'Pulverização', href: '/atividades/novo' },
              { label: 'Outro',        href: '/atividades/novo' },
            ].map((item, i, arr) => (
              <Link
                key={item.label}
                href={item.href}
                onClick={() => setShowSheet(false)}
                style={{
                  display:        'flex',
                  alignItems:     'center',
                  minHeight:      54,
                  padding:        '0 20px',
                  borderBottom:   i < arr.length - 1 ? '1px solid #E4E2DA' : 'none',
                  textDecoration: 'none',
                  fontSize:       15,
                  fontWeight:     700,
                  color:          '#1C1C1A',
                }}
              >
                {item.label}
              </Link>
            ))}
          </div>
        </>
      )}
    </div>
  )
}
