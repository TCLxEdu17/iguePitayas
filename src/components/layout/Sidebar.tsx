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

const ADMIN_ITEMS = [
  { label: 'Usuários',      href: '/admin/usuarios', icon: '👥' },
  { label: 'Configurações', href: '/configuracoes',  icon: '⚙️' },
]

export function Sidebar() {
  const pathname = usePathname()
  const { data: session } = useSession()
  const role = session?.user?.role

  const items = role === 'ADMIN' ? [...NAV_ITEMS, ...ADMIN_ITEMS] : NAV_ITEMS

  return (
    <aside
      className="hidden md:flex flex-col w-60 min-h-screen p-4"
      style={{ backgroundColor: 'var(--color-primary)', color: 'white' }}
    >
      <div className="mb-8">
        <h1 className="text-xl font-bold" style={{ color: 'var(--color-accent)' }}>IGUE Bananas</h1>
        <p className="text-xs mt-1 opacity-70">{session?.user?.name}</p>
      </div>

      <nav className="flex flex-col gap-1">
        {items.map((item) => {
          const isActive = pathname.startsWith(item.href)
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors',
                isActive
                  ? 'font-medium'
                  : 'opacity-70 hover:opacity-100'
              )}
              style={isActive ? {
                backgroundColor: 'rgba(0,0,0,0.2)',
                color: 'var(--color-accent)',
              } : {}}
            >
              <span>{item.icon}</span>
              {item.label}
            </Link>
          )
        })}
      </nav>
    </aside>
  )
}
