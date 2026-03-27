import Link from 'next/link'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { ProductBadge } from '@/components/ui/product-badge'

interface Plot {
  id: string
  code: string
  name: string
  productType: string
  area?: number | null
  status: string
  _count?: { activities: number; harvests: number }
}

const STATUS_LABELS: Record<string, string> = {
  ACTIVE:      'Ativo',
  INACTIVE:    'Inativo',
  MAINTENANCE: 'Manutenção',
}

export function PlotCard({ plot }: { plot: Plot }) {
  return (
    <Link href={`/talhoes/${plot.id}`}>
      <Card className="hover:shadow-md transition-shadow cursor-pointer h-full">
        <CardHeader className="pb-2">
          <div className="flex items-start justify-between gap-2">
            <div>
              <span className="text-xs font-mono text-muted-foreground">{plot.code}</span>
              <h3 className="font-semibold" style={{ color: 'var(--color-primary)' }}>{plot.name}</h3>
            </div>
            <Badge variant={plot.status === 'ACTIVE' ? 'default' : 'secondary'}>
              {STATUS_LABELS[plot.status] ?? plot.status}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-2">
          <ProductBadge productType={plot.productType} />
          {plot.area != null && (
            <p className="text-sm text-muted-foreground">
              {plot.area.toLocaleString('pt-BR')} m²
            </p>
          )}
          {plot._count && (
            <p className="text-xs text-muted-foreground">
              {plot._count.activities} atividades · {plot._count.harvests} colheitas
            </p>
          )}
        </CardContent>
      </Card>
    </Link>
  )
}
