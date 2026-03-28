'use client'

import { useSession } from 'next-auth/react'
import { useQuery } from '@tanstack/react-query'
import { getApiUrl } from '@/lib/api-url'

export default function ConfiguracoesPage() {
  const { data: session, status } = useSession()

  const { data: farm } = useQuery({
    queryKey: ['farm'],
    queryFn: () => fetch(getApiUrl('/api/farm')).then(r => r.json()),
    enabled: session?.user?.role === 'ADMIN',
  })

  if (status === 'loading') return null
  if (session?.user?.role !== 'ADMIN') return (
    <div className="p-6">
      <p className="text-muted-foreground">Acesso restrito.</p>
    </div>
  )

  return (
    <div className="p-6 max-w-lg">
      <div className="mb-6">
        <h1 className="text-2xl font-bold" style={{ color: 'var(--color-primary)' }}>Configurações</h1>
        <p className="text-muted-foreground text-sm">Informações da fazenda e conta</p>
      </div>

      <div className="space-y-4">
        <div className="rounded-lg border bg-white p-4 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-3">Fazenda</p>
          <p className="text-sm font-medium">{farm?.name ?? '—'}</p>
        </div>

        <div className="rounded-lg border bg-white p-4 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-3">Conta</p>
          <p className="text-sm font-medium">{session?.user?.name ?? '—'}</p>
          <p className="text-sm text-muted-foreground">{session?.user?.email ?? '—'}</p>
          <p className="text-xs text-muted-foreground mt-1">{session?.user?.role ?? '—'}</p>
        </div>
      </div>
    </div>
  )
}
