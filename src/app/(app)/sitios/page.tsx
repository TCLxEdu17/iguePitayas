'use client'

import { useQuery } from '@tanstack/react-query'
import { getApiUrl } from '@/lib/api-url'
import Link from 'next/link'

interface Site {
  id:   string
  name: string
  _count: { plots: number }
}

export default function SitiosPage() {
  const { data: sites = [], isLoading } = useQuery<Site[]>({
    queryKey: ['sites'],
    queryFn:  () => fetch(getApiUrl('/api/sites')).then(r => r.json()),
  })

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-1" style={{ color: 'var(--color-primary)' }}>
        Sítios
      </h1>
      <p className="text-muted-foreground text-sm mb-6">
        Selecione um sítio para ver mapa e talhões
      </p>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-32 rounded-xl bg-muted animate-pulse" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {sites.map(site => (
            <Link key={site.id} href={`/sitios/${site.id}/mapa`}>
              <div
                className="rounded-xl p-5 border cursor-pointer transition-all hover:shadow-md hover:-translate-y-0.5"
                style={{ backgroundColor: '#F5ECD7', borderColor: '#D4B896' }}
              >
                <div className="text-3xl mb-2">🌿</div>
                <h2 className="font-bold text-lg" style={{ color: 'var(--color-dark)' }}>
                  {site.name}
                </h2>
                <p className="text-sm mt-1" style={{ color: 'var(--color-accent)' }}>
                  {site._count.plots} {site._count.plots !== 1 ? 'talhões' : 'talhão'}
                </p>
                <p className="text-xs mt-3 font-medium" style={{ color: 'var(--color-primary)' }}>
                  Ver mapa e talhões →
                </p>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
