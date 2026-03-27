'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'

const BOTTOM_ITEMS = [
  { label: 'Dashboard',  href: '/dashboard',            icon: '📊' },
  { label: 'Talhões',    href: '/talhoes',              icon: '🗺️' },
  { label: 'Registrar',  href: '/atividades/novo',      icon: '➕' },
  { label: 'Produção',   href: '/producao/historico',   icon: '🍌' },
  { label: 'Relatórios', href: '/relatorios',           icon: '📈' },
]

export function BottomNav() {
  const pathname = usePathname()

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-50 flex md:hidden border-t"
      style={{ backgroundColor: 'var(--color-primary)', borderColor: 'rgba(255,255,255,0.1)' }}
    >
      {BOTTOM_ITEMS.map((item) => {
        const isActive = pathname.startsWith(item.href)
        return (
          <Link
            key={item.href}
            href={item.href}
            className="flex flex-1 flex-col items-center gap-1 py-2 text-xs transition-colors"
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
