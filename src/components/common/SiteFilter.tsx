'use client'

import { useQuery } from '@tanstack/react-query'
import { getApiUrl } from '@/lib/api-url'

interface SiteFilterProps {
  value:    string | null
  onChange: (id: string | null) => void
}

interface Site {
  id:   string
  name: string
  _count: { plots: number }
}

export function SiteFilter({ value, onChange }: SiteFilterProps) {
  const { data: sites = [] } = useQuery<Site[]>({
    queryKey: ['sites'],
    queryFn:  () => fetch(getApiUrl('/api/sites')).then(r => r.json()),
    staleTime: 60_000,
  })

  return (
    <select
      value={value ?? ''}
      onChange={e => onChange(e.target.value || null)}
      className="text-sm rounded-lg border px-3 py-1.5 bg-white"
      style={{ borderColor: 'var(--color-muted-custom)', color: 'var(--color-dark)' }}
    >
      <option value="">Todos os sítios</option>
      {sites.map(s => (
        <option key={s.id} value={s.id}>
          {s.name} ({s._count.plots} talhões)
        </option>
      ))}
    </select>
  )
}
