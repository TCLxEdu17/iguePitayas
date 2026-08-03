'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useSession } from 'next-auth/react'
import {
  Map, Plus, ClipboardList, User, Home, Leaf, BarChart3, Settings,
} from 'lucide-react'
import type { LucideIcon } from 'lucide-react'

type Item = { label: string; href: string; icon: LucideIcon }

const OPERATOR_ITEMS: Item[] = [
  { label: 'Mapa',   href: '/mapa',                  icon: Map },
  { label: 'Lançar', href: '/atividades/novo',        icon: Plus },
  { label: 'Meus',   href: '/atividades/historico',  icon: ClipboardList },
  { label: 'Perfil', href: '/configuracoes',         icon: User },
]

const ADMIN_ITEMS: Item[] = [
  { label: 'Início',     href: '/dashboard',            icon: Home },
  { label: 'Atividades', href: '/atividades/historico', icon: ClipboardList },
  { label: 'Produção',   href: '/producao/historico',   icon: Leaf },
  { label: 'Relatórios', href: '/relatorios',           icon: BarChart3 },
  { label: 'Config',     href: '/configuracoes',        icon: Settings },
]

export function BottomNav() {
  const pathname = usePathname()
  const { data: session } = useSession()
  const isAdmin = (session?.user as any)?.role === 'ADMIN'
  const items = isAdmin ? ADMIN_ITEMS : OPERATOR_ITEMS

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-50 flex md:hidden"
      style={{
        background: 'var(--color-canopy)',
        borderTop: '1px solid rgba(232,223,198,.1)',
        paddingTop: 8,
        paddingBottom: 'calc(env(safe-area-inset-bottom) + 14px)',
      }}
    >
      {items.map(({ label, href, icon: Icon }) => {
        const active = pathname === href || pathname.startsWith(href + '/')
        return (
          <Link
            key={href}
            href={href}
            className="flex flex-1 flex-col items-center justify-center gap-1"
            style={{ minHeight: 56, color: active ? 'var(--color-gold)' : 'rgba(245,236,215,.55)' }}
          >
            <Icon size={22} strokeWidth={1.9} />
            <span className="text-[10.5px] font-semibold">{label}</span>
          </Link>
        )
      })}
    </nav>
  )
}
