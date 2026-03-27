'use client'

import { useQuery } from '@tanstack/react-query'
import { ProductBadge } from '@/components/ui/product-badge'
import { UNIT_LABELS } from '@/types'
import { getApiUrl } from '@/lib/api-url'

export function HarvestList() {
  const { data: harvests, isLoading } = useQuery({
    queryKey: ['harvests'],
    queryFn:  () => fetch(getApiUrl('/api/harvests')).then(r => r.json()),
  })

  const totalRevenue = (harvests ?? []).reduce(
    (sum: number, h: any) => sum + (h.totalRevenue ?? 0), 0
  )

  if (isLoading) return (
    <div className="space-y-2">
      {[1, 2, 3].map(i => <div key={i} className="h-16 rounded-lg bg-muted animate-pulse" />)}
    </div>
  )

  return (
    <div className="space-y-4">
      {(harvests ?? []).length > 0 && (
        <div
          className="rounded-lg p-3 flex items-center justify-between text-sm"
          style={{ backgroundColor: 'color-mix(in srgb, var(--color-primary) 8%, transparent)', border: '1px solid color-mix(in srgb, var(--color-primary) 20%, transparent)' }}
        >
          <span className="text-muted-foreground">Receita total (exibida)</span>
          <span className="font-bold" style={{ color: 'var(--color-primary)' }}>
            R$ {totalRevenue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
          </span>
        </div>
      )}

      {(harvests ?? []).length === 0 && (
        <p className="text-center text-muted-foreground py-8 text-sm">Nenhuma colheita registrada.</p>
      )}

      <div className="space-y-2">
        {(harvests ?? []).map((h: any) => (
          <div key={h.id} className="flex items-center justify-between rounded-lg border bg-white p-3 gap-3">
            <div className="space-y-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="font-medium text-sm">
                  {h.quantity} {UNIT_LABELS[h.unit] ?? h.unit}(s)
                </span>
                {h.plot && <ProductBadge productType={h.plot.productType} />}
              </div>
              <p className="text-xs text-muted-foreground">
                {h.plot?.code} — {h.plot?.name}
              </p>
              <p className="text-xs text-muted-foreground">
                R$ {h.pricePerUnit?.toFixed(2)} / {UNIT_LABELS[h.unit] ?? h.unit}
              </p>
            </div>
            <div className="text-right shrink-0">
              <p className="text-xs text-muted-foreground">
                {new Date(h.date).toLocaleDateString('pt-BR')}
              </p>
              <p className="text-sm font-bold" style={{ color: 'var(--color-primary)' }}>
                R$ {h.totalRevenue?.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
