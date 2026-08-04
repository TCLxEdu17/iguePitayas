'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { useQuery } from '@tanstack/react-query'
import { getApiUrl } from '@/lib/api-url'
import { cn } from '@/lib/utils'
import { useUIStore } from '@/stores/ui.store'

// Admin: recebe informações, não cadastra
const ADMIN_NAV = [
  { label: 'Dashboard',  href: '/dashboard',            icon: '📊' },
  { label: 'Atividades', href: '/atividades/historico', icon: '📋' },
  { label: 'Produção',   href: '/producao/historico',   icon: '🍌' },
  { label: 'Relatórios', href: '/relatorios',           icon: '📈' },
]

const OPERATOR_NAV = [
  { label: 'Atividades', href: '/atividades/historico', icon: '📋' },
  { label: 'Produção',   href: '/producao/historico',   icon: '🍌' },
]

const ADMIN_ITEMS = [
  { label: 'Usuários',      href: '/admin/usuarios', icon: '👥' },
  { label: 'Configurações', href: '/configuracoes',  icon: '⚙️' },
]

interface Site { id: string; name: string }

export function Sidebar() {
  const pathname  = usePathname()
  const { data: session } = useSession()
  const role      = session?.user?.role
  const isPrimary = (session?.user as any)?.isPrimaryAdmin === true
  const { sidebarOpen, toggleSidebar } = useUIStore()

  const { data: sites = [] } = useQuery<Site[]>({
    queryKey:  ['sites'],
    queryFn:   () => fetch(getApiUrl('/api/sites')).then(r => r.ok ? r.json() : []),
    staleTime: 5 * 60 * 1000,
  })

  const navItems   = role === 'ADMIN' ? ADMIN_NAV : OPERATOR_NAV
  const adminItems = role === 'ADMIN' ? ADMIN_ITEMS : []

  function NavLink({ item }: { item: { label: string; href: string; icon: string } }) {
    const isActive = pathname === item.href || pathname.startsWith(item.href + '/')
    return (
      <Link
        href={item.href}
        onClick={() => { if (window.innerWidth < 768) toggleSidebar() }}
        className={cn(
          'flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors',
          isActive ? 'font-medium' : 'opacity-60 hover:opacity-90'
        )}
        style={isActive ? {
          backgroundColor: 'rgba(193,122,74,0.18)',
          color: '#D4A843',
        } : { color: '#E8D5B0' }}
      >
        <span>{item.icon}</span>
        {item.label}
      </Link>
    )
  }

  return (
    <aside
      className={cn(
        // Mobile: fixed overlay on left, z-40
        'fixed top-0 left-0 h-full z-40 flex flex-col w-64 p-4 transition-transform duration-200',
        // Desktop: static in flow
        'md:static md:translate-x-0 md:z-auto md:w-60',
        // Toggle: hide/show
        sidebarOpen ? 'translate-x-0' : '-translate-x-full md:-translate-x-full',
        !sidebarOpen && 'md:hidden'
      )}
      style={{ backgroundColor: 'var(--color-sidebar-bg, #1F2E15)', color: '#E8D5B0' }}
    >
      {/* Header */}
      <div className="mb-6 flex items-start justify-between">
        <div>
          <img src="/logo.png" alt="IGUE Bananas" style={{ height: 48, width: 'auto' }} />
          <div className={cn('flex items-center gap-2 mt-3', isPrimary && 'primary-admin-glow p-1 -ml-1')}>
            <div
              className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0"
              style={{ backgroundColor: 'rgba(193,122,74,0.3)', color: '#D4A843' }}
            >
              {session?.user?.name?.[0]?.toUpperCase() ?? '?'}
            </div>
            <div className="flex items-center gap-1 min-w-0">
              <p className="text-xs font-medium truncate" style={{ color: '#E8D5B0' }}>
                {session?.user?.name}
              </p>
              {isPrimary && (
                <span className="primary-admin-leaf text-sm flex-shrink-0" title="Admin Principal">🌿</span>
              )}
            </div>
          </div>
        </div>
        {/* Close button — visible on mobile */}
        <button
          onClick={toggleSidebar}
          className="md:hidden mt-1 text-lg leading-none opacity-60 hover:opacity-100"
          aria-label="Fechar menu"
        >
          ✕
        </button>
      </div>

      {/* Navegação principal */}
      <nav className="flex flex-col gap-0.5">
        {navItems.map(item => <NavLink key={item.href} item={item} />)}
      </nav>

      {/* Seção Sítios — links direto ao mapa de cada sítio */}
      {sites.length > 0 && (
        <div className="mt-5">
          <p className="text-xs uppercase tracking-widest mb-2 px-3" style={{ color: 'rgba(232,213,176,0.45)' }}>
            Sítios
          </p>
          <nav className="flex flex-col gap-0.5">
            {sites.map(site => (
              <NavLink
                key={site.id}
                item={{ label: site.name, href: `/sitios/${site.id}/mapa`, icon: '🌿' }}
              />
            ))}
          </nav>
        </div>
      )}

      {/* Seção Admin */}
      {adminItems.length > 0 && (
        <div className="mt-5">
          <p className="text-xs uppercase tracking-widest mb-2 px-3" style={{ color: 'rgba(232,213,176,0.45)' }}>
            Admin
          </p>
          <nav className="flex flex-col gap-0.5">
            {adminItems.map(item => <NavLink key={item.href} item={item} />)}
          </nav>
        </div>
      )}
    </aside>
  )
}
