'use client'

import { useEffect, useState } from 'react'
import dynamic from 'next/dynamic'
import { getApiUrl } from '@/lib/api-url'
import { cacheSite, getCachedSite } from '@/lib/offline/sync'

const KonvaMapInner = dynamic(() => import('./KonvaMapInner'), {
  ssr:     false,
  loading: () => <div className="w-full rounded-xl bg-muted animate-pulse" style={{ height: 400 }} />,
})

interface Point    { x: number; y: number }
interface PlotData { id: string; code: string; name: string; productType: string | null; polygon: Point[] | null; area?: number | null }
interface SiteData { id: string; name: string; mapImageUrl?: string | null; plots: PlotData[] }

async function fetchSite(siteId: string): Promise<SiteData | null> {
  try {
    const res = await fetch(getApiUrl(`/api/sites/${siteId}`))
    if (!res.ok) return null
    return res.json()
  } catch {
    return null
  }
}

async function savePlotPolygon(plotId: string, polygon: Point[]) {
  await fetch(getApiUrl(`/api/plots/${plotId}`), {
    method:  'PUT',
    headers: { 'Content-Type': 'application/json' },
    body:    JSON.stringify({ polygon }),
  })
}

interface PlotMapProps {
  siteId:         string
  onSelectPlot?:  (plot: PlotData | null) => void
}

export function PlotMap({ siteId, onSelectPlot }: PlotMapProps) {
  const [site, setSite]       = useState<SiteData | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving]   = useState(false)

  useEffect(() => {
    let cancelled = false

    async function load() {
      setLoading(true)

      // Try online first
      const online = await fetchSite(siteId)
      if (online) {
        if (!cancelled) setSite(online)
        // Cache for offline use
        await cacheSite(siteId)
      } else {
        // Fallback to offline cache
        const cached = await getCachedSite(siteId)
        if (!cancelled && cached) {
          setSite({
            id:          cached.id,
            name:        cached.name,
            mapImageUrl: cached.mapImageUrl,
            plots:       cached.plots,
          })
        }
      }

      if (!cancelled) setLoading(false)
    }

    load()
    return () => { cancelled = true }
  }, [siteId])

  if (loading) return <div className="w-full rounded-xl bg-muted animate-pulse" style={{ height: 400 }} />

  async function handleSave(plotId: string, polygon: Point[]) {
    setSaving(true)
    await savePlotPolygon(plotId, polygon)
    // Refresh site data and update cache
    const updated = await fetchSite(siteId)
    if (updated) {
      setSite(updated)
      await cacheSite(siteId)
    }
    setSaving(false)
  }

  function handleSelectPlot(plotId: string | null) {
    if (!onSelectPlot) return
    const plot = plotId ? (site?.plots ?? []).find(p => p.id === plotId) ?? null : null
    onSelectPlot(plot)
  }

  return (
    <KonvaMapInner
      plots={site?.plots ?? []}
      mapImageUrl={site?.mapImageUrl}
      onSave={handleSave}
      saving={saving}
      onSelectPlot={onSelectPlot ? handleSelectPlot : undefined}
    />
  )
}
