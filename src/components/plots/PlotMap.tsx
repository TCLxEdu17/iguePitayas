'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import dynamic from 'next/dynamic'
import { getApiUrl } from '@/lib/api-url'

// Single dynamic import — avoids race conditions on mobile
const KonvaMapInner = dynamic(() => import('./KonvaMapInner'), {
  ssr:     false,
  loading: () => <div className="w-full rounded-xl bg-muted animate-pulse" style={{ height: 400 }} />,
})

interface Point    { x: number; y: number }
interface PlotData { id: string; code: string; name: string; productType: string; polygon: Point[] | null }
interface FarmData { mapImageUrl?: string | null; plots: PlotData[] }

async function fetchFarm(): Promise<FarmData | null> {
  const res = await fetch(getApiUrl('/api/farm'))
  if (!res.ok) return null
  return res.json()
}

async function savePlotPolygon({ plotId, polygon }: { plotId: string; polygon: Point[] }) {
  const res = await fetch(getApiUrl(`/api/plots/${plotId}`), {
    method:  'PUT',
    headers: { 'Content-Type': 'application/json' },
    body:    JSON.stringify({ polygon }),
  })
  return res.json()
}

export function PlotMap({ siteId }: { siteId?: string } = {}) {
  const queryClient = useQueryClient()

  const { data: farm, isLoading } = useQuery({
    queryKey: ['farm'],
    queryFn:  fetchFarm,
  })

  const saveMutation = useMutation({
    mutationFn: savePlotPolygon,
    onSuccess:  () => queryClient.invalidateQueries({ queryKey: ['farm', 'plots'] }),
  })

  if (isLoading) return (
    <div className="w-full rounded-xl bg-muted animate-pulse" style={{ height: 400 }} />
  )

  const plots = farm?.plots ?? []

  return (
    <KonvaMapInner
      plots={plots}
      mapImageUrl={farm?.mapImageUrl}
      onSave={(plotId, polygon) => saveMutation.mutate({ plotId, polygon })}
      saving={saveMutation.isPending}
    />
  )
}
