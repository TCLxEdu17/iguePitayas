'use client'

import { useQuery } from '@tanstack/react-query'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { getApiUrl } from '@/lib/api-url'

interface Plot {
  id:          string
  code:        string
  name:        string
  area:        number | null
  productType: string
  status:      string
}

interface SiteDetail {
  id:    string
  name:  string
  plots: Plot[]
}

const PRODUCT_LABELS: Record<string, string> = {
  BANANA_PRATA:  'Banana Prata',
  BANANA_NANICA: 'Banana Nanica',
  PITAYA:        'Pitaya',
}

const PRODUCT_COLORS: Record<string, string> = {
  BANANA_PRATA:  '#8DB87A',
  BANANA_NANICA: '#D4A843',
  PITAYA:        '#E91E8C',
}

export default function SitePage() {
  const params = useParams()
  const id     = params.id as string

  const { data: site, isLoading } = useQuery<SiteDetail>({
    queryKey: ['site', id],
    queryFn:  () => fetch(getApiUrl(`/api/sites/${id}`)).then(r => r.json()),
  })

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="h-8 w-48 bg-muted rounded animate-pulse mb-4" />
        <div className="grid grid-cols-2 gap-3">
          {[1, 2, 3].map(i => <div key={i} className="h-24 bg-muted rounded-xl animate-pulse" />)}
        </div>
      </div>
    )
  }

  if (!site) return <div className="p-6 text-muted-foreground">Sítio não encontrado.</div>

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold" style={{ color: 'var(--color-primary)' }}>
            🌿 {site.name}
          </h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            {site.plots.length} talhão{site.plots.length !== 1 ? 'ões' : ''} cadastrado{site.plots.length !== 1 ? 's' : ''}
          </p>
        </div>
        <Link
          href={`/sitios/${id}/mapa`}
          className="rounded-lg px-4 py-2 text-sm font-medium text-white transition-colors"
          style={{ backgroundColor: 'var(--color-primary)' }}
        >
          🗺️ Ver Mapa
        </Link>
      </div>

      {site.plots.length === 0 ? (
        <div
          className="rounded-xl p-8 text-center border border-dashed"
          style={{ borderColor: '#D4B896', color: '#8A7A6A' }}
        >
          <p className="text-4xl mb-3">🌱</p>
          <p className="font-medium">Nenhum talhão neste sítio ainda.</p>
          <p className="text-sm mt-1">Crie talhões em <Link href="/talhoes/novo" className="underline">Talhões → Novo</Link> e associe a este sítio.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {site.plots.map(plot => (
            <Link key={plot.id} href={`/talhoes/${plot.id}`}>
              <div
                className="rounded-xl p-4 border cursor-pointer hover:shadow-md transition-all"
                style={{ backgroundColor: '#FAFAF7', borderColor: '#D4B896' }}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="font-mono text-xs font-bold" style={{ color: 'var(--color-accent)' }}>
                    {plot.code}
                  </span>
                  <span
                    className="text-xs px-2 py-0.5 rounded-full text-white"
                    style={{ backgroundColor: PRODUCT_COLORS[plot.productType] ?? '#888' }}
                  >
                    {PRODUCT_LABELS[plot.productType] ?? plot.productType}
                  </span>
                </div>
                <p className="font-semibold text-sm" style={{ color: 'var(--color-dark)' }}>
                  {plot.name}
                </p>
                {plot.area && (
                  <p className="text-xs text-muted-foreground mt-1">{plot.area} ha</p>
                )}
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
