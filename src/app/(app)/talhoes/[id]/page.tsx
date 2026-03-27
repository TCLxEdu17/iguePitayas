// src/app/(app)/talhoes/[id]/page.tsx
'use client'

import { use } from 'react'
import { useQuery } from '@tanstack/react-query'
import { getApiUrl } from '@/lib/api-url'
import { PRODUCT_LABELS, PRODUCT_COLORS } from '@/types'
import type { ProductType } from '@/types'

interface Plot {
  id: string
  code: string
  name: string
  area: number | null
  productType: ProductType
  status: string
  notes: string | null
  activities: { id: string }[]
  harvests: { id: string }[]
}

export async function generateStaticParams() {
  try {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL ?? ''
    const res = await fetch(`${apiUrl}/api/plots`)
    if (!res.ok) return []
    const plots: { id: string }[] = await res.json()
    return plots.map((p) => ({ id: p.id }))
  } catch {
    return []
  }
}

export default function TalhaoDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)

  const { data: plot, isLoading, isError } = useQuery<Plot>({
    queryKey: ['plot', id],
    queryFn: () =>
      fetch(getApiUrl(`/api/plots/${id}`)).then((r) => {
        if (!r.ok) throw new Error('Plot not found')
        return r.json()
      }),
  })

  if (isLoading) {
    return <div className="p-6 text-gray-500">Carregando talhão...</div>
  }

  if (isError || !plot) {
    return <div className="p-6 text-red-500">Talhão não encontrado.</div>
  }

  return (
    <main className="p-6 space-y-6">
      <div className="flex items-center gap-3">
        <h1 className="text-2xl font-bold">{plot.name}</h1>
        <span
          className="text-sm px-2 py-1 rounded-full text-white"
          style={{ backgroundColor: PRODUCT_COLORS[plot.productType] }}
        >
          {PRODUCT_LABELS[plot.productType]}
        </span>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg p-4 shadow-sm">
          <p className="text-sm text-gray-500">Código</p>
          <p className="font-semibold">{plot.code}</p>
        </div>
        <div className="bg-white rounded-lg p-4 shadow-sm">
          <p className="text-sm text-gray-500">Área</p>
          <p className="font-semibold">{plot.area ? `${plot.area} m²` : '—'}</p>
        </div>
        <div className="bg-white rounded-lg p-4 shadow-sm">
          <p className="text-sm text-gray-500">Status</p>
          <p className="font-semibold">{plot.status}</p>
        </div>
        <div className="bg-white rounded-lg p-4 shadow-sm">
          <p className="text-sm text-gray-500">Atividades</p>
          <p className="font-semibold">{plot.activities.length}</p>
        </div>
      </div>
      {plot.notes && (
        <div className="bg-white rounded-lg p-4 shadow-sm">
          <p className="text-sm text-gray-500 mb-1">Notas</p>
          <p>{plot.notes}</p>
        </div>
      )}
    </main>
  )
}
