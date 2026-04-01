'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { cn } from '@/lib/utils'

const NAV_ITEMS = [
  { label: 'Dashboard',   href: '/dashboard',            icon: '📊' },
  { label: 'Talhões',     href: '/talhoes',              icon: '🗺️' },
  { label: 'Atividades',  href: '/atividades/historico', icon: '📋' },
  { label: 'Produção',    href: '/producao/historico',   icon: '🍌' },
  { label: 'Relatórios',  href: '/relatorios',           icon: '📈' },
]

const SITE_ITEMS = [
  { label: 'Sítio 1', href: '/sitios/site-1', icon: '🌿' },
  { label: 'Sítio 2', href: '/sitios/site-2', icon: '🌿' },
  { label: 'Sítio 3', href: '/sitios/site-3', icon: '🌿' },
]

const ADMIN_ITEMS = [
  { label: 'Usuários',      href: '/admin/usuarios', icon: '👥' },
  { label: 'Configurações', href: '/configuracoes',  icon: '⚙️' },
]

export function Sidebar() {
  const pathname   = usePathname()
  const { data: session } = useSession()
  const role       = session?.user?.role
  const isPrimary  = (session?.user as any)?.isPrimaryAdmin === true

  const adminItems = role === 'ADMIN' ? ADMIN_ITEMS : []

  function NavLink({ item }: { item: { label: string; href: string; icon: string } }) {
    const isActive = pathname.startsWith(item.href)
    return (
      <Link
        key={item.href}
        href={item.href}
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
      className="hidden md:flex flex-col w-60 min-h-screen p-4"
      style={{ backgroundColor: 'var(--color-sidebar-bg, #1F2E15)', color: '#E8D5B0' }}
    >
      {/* Header */}
      <div className="mb-6">
        <h1
          className="text-lg font-bold tracking-wide"
          style={{ color: '#D4A843' }}
        >
          🌾 IGUE Bananas
        </h1>

        {/* Avatar do usuário com glow se isPrimaryAdmin */}
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
              <span className="primary-admin-leaf text-sm flex-shrink-0" title="Admin Principal">
                🌿
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Navegação principal */}
      <nav className="flex flex-col gap-0.5">
        {NAV_ITEMS.map(item => <NavLink key={item.href} item={item} />)}
      </nav>

      {/* Seção Sítios */}
      <div className="mt-5">
        <p className="text-xs uppercase tracking-widest mb-2 px-3" style={{ color: 'rgba(232,213,176,0.45)' }}>
          Sítios
        </p>
        <nav className="flex flex-col gap-0.5">
          {SITE_ITEMS.map(item => <NavLink key={item.href} item={item} />)}
        </nav>
      </div>

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
