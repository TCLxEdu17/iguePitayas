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

  const { data: auditLogs = [] } = useQuery({
    queryKey: ['audit-today'],
    queryFn: () => fetch(getApiUrl('/api/admin/audit')).then(r => r.json()),
    enabled: session?.user?.role === 'ADMIN',
    refetchInterval: 60_000,
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

      <div className="mt-2">
        <div className="rounded-lg border bg-white p-4 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-3">Hoje</p>
          {auditLogs.length === 0 ? (
            <p className="text-sm text-muted-foreground">Nenhuma ação registrada hoje.</p>
          ) : (
            <div className="divide-y">
              {auditLogs.map((log: { id: string; createdAt: string; user: { name: string }; description: string }) => (
                <div key={log.id} className="flex items-start gap-3 py-2 first:pt-0 last:pb-0">
                  <span className="text-xs text-muted-foreground whitespace-nowrap">
                    {new Date(log.createdAt).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                  </span>
                  <span className="text-xs font-medium">{log.user.name}</span>
                  <span className="text-xs text-muted-foreground">→</span>
                  <span className="text-xs">{log.description}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
