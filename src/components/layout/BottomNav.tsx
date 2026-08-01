'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { cn } from '@/lib/utils'

const ADMIN_ITEMS = [
  { label: 'Dashboard',  href: '/dashboard',            icon: '📊' },
  { label: 'Talhões',    href: '/talhoes',              icon: '🗺️' },
  { label: 'Registrar',  href: '/atividades/novo',      icon: '➕' },
  { label: 'Produção',   href: '/producao/historico',   icon: '🍌' },
  { label: 'Relatórios', href: '/relatorios',           icon: '📈' },
]

const OPERATOR_ITEMS = [
  { label: 'Sítios',     href: '/sitios',               icon: '🌿' },
  { label: 'Registrar',  href: '/atividades/novo',      icon: '➕' },
  { label: 'Atividades', href: '/atividades/historico', icon: '📋' },
  { label: 'Produção',   href: '/producao/historico',   icon: '🍌' },
]

export function BottomNav() {
  const pathname = usePathname()
  const { data: session } = useSession()
  const role = (session?.user as any)?.role
  const items = role === 'ADMIN' ? ADMIN_ITEMS : OPERATOR_ITEMS

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-50 flex md:hidden border-t"
      style={{
        backgroundColor: 'var(--color-primary)',
        borderColor: 'rgba(255,255,255,0.1)',
        paddingBottom: 'env(safe-area-inset-bottom)',
      }}
    >
      {items.map((item) => {
        const isActive = pathname.startsWith(item.href)
        return (
          <Link
            key={item.href}
            href={item.href}
            className="flex flex-1 flex-col items-center gap-1 pt-2 pb-1 text-xs transition-colors"
            style={{ color: isActive ? 'var(--color-accent)' : 'rgba(255,255,255,0.7)' }}
          >
            <span className="text-lg">{item.icon}</span>
            {item.label}
          </Link>
        )
      })}
    </nav>
  )
}
