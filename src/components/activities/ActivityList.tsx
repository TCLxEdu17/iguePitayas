'use client'

import { useQuery } from '@tanstack/react-query'
import { useState } from 'react'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { ProductBadge } from '@/components/ui/product-badge'
import { ACTIVITY_LABELS } from '@/types'

export function ActivityList() {
  const [search, setSearch] = useState('')

  const { data: activities, isLoading } = useQuery({
    queryKey: ['activities'],
    queryFn:  () => fetch('/api/activities').then(r => r.json()),
  })

  const filtered = (activities ?? []).filter((a: any) => {
    if (!search) return true
    const q = search.toLowerCase()
    return (
      a.plot?.name?.toLowerCase().includes(q) ||
      a.plot?.code?.toLowerCase().includes(q) ||
      a.responsible?.toLowerCase().includes(q) ||
      ACTIVITY_LABELS[a.type]?.toLowerCase().includes(q)
    )
  })

  if (isLoading) return (
    <div className="space-y-2">
      {[1, 2, 3].map(i => <div key={i} className="h-16 rounded-lg bg-muted animate-pulse" />)}
    </div>
  )

  return (
    <div className="space-y-4">
      <Input
        placeholder="Buscar por talhão, responsável ou tipo..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="max-w-sm"
      />

      {filtered.length === 0 ? (
        <p className="text-center text-muted-foreground py-8 text-sm">
          {search ? 'Nenhuma atividade encontrada com esses filtros.' : 'Nenhuma atividade registrada.'}
        </p>
      ) : (
        <div className="space-y-2">
          {filtered.map((a: any) => (
            <div key={a.id} className="flex items-center justify-between rounded-lg border bg-white p-3 gap-3">
              <div className="space-y-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-medium text-sm">{ACTIVITY_LABELS[a.type] ?? a.type}</span>
                  {a.plot && <ProductBadge productType={a.plot.productType} />}
                </div>
                <p className="text-xs text-muted-foreground truncate">
                  {a.plot?.code} — {a.plot?.name} · {a.responsible}
                </p>
              </div>
              <div className="text-right shrink-0">
                <p className="text-xs text-muted-foreground">
                  {new Date(a.date).toLocaleDateString('pt-BR')}
                </p>
                {a.cost != null && (
                  <p className="text-sm font-medium" style={{ color: 'var(--color-primary)' }}>
                    R$ {a.cost.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </p>
                )}
                <Badge variant={a.confirmed ? 'default' : 'secondary'} className="mt-1">
                  {a.confirmed ? 'Confirmado' : 'Rascunho'}
                </Badge>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
