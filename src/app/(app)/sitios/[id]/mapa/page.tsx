'use client'

import { useRef, useState } from 'react'
import { useParams } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { PlotMap } from '@/components/plots/PlotMap'
import { ActivityForm } from '@/components/activities/ActivityForm'
import { Button } from '@/components/ui/button'
import { getApiUrl } from '@/lib/api-url'

interface PlotData { id: string; name: string; code: string; area?: number | null }

export default function SiteMapaPage() {
  const params   = useParams()
  const siteId   = params.id as string
  const inputRef = useRef<HTMLInputElement>(null)
  const [uploading, setUploading]       = useState(false)
  const [selectedPlot, setSelectedPlot] = useState<PlotData | null>(null)
  const { data: session } = useSession()
  const isAdmin = (session?.user as any)?.role === 'ADMIN'

  async function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setUploading(true)
    const form = new FormData()
    form.append('file', file)
    form.append('siteId', siteId)
    const res = await fetch(getApiUrl('/api/farm/map'), { method: 'POST', body: form })
    setUploading(false)
    if (res.ok) window.location.reload()
  }

  return (
    <div className="p-4 md:p-6 space-y-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold" style={{ color: 'var(--color-primary)' }}>
            Mapa do Sítio
          </h1>
          <p className="text-muted-foreground text-sm">
            Selecione um talhão para registrar uma atividade
          </p>
        </div>
        {isAdmin && (
          <div>
            <input ref={inputRef} type="file" accept="image/*" className="hidden" onChange={handleUpload} />
            <Button variant="outline" onClick={() => inputRef.current?.click()} disabled={uploading}>
              {uploading ? 'Enviando...' : 'Atualizar planta'}
            </Button>
          </div>
        )}
      </div>

      <PlotMap siteId={siteId} onSelectPlot={setSelectedPlot} />

      {selectedPlot && (
        <div
          className="rounded-xl border p-5 space-y-4"
          style={{ borderColor: '#D4B896', backgroundColor: '#FAFAF7' }}
        >
          <div className="flex items-center justify-between">
            <div>
              <h2 className="font-bold text-base" style={{ color: 'var(--color-primary)' }}>
                Registrar atividade
              </h2>
              <p className="text-sm text-muted-foreground">
                Talhão: <strong>{selectedPlot.name}</strong>
                {selectedPlot.area ? ` · ${selectedPlot.area.toLocaleString('pt-BR')} pés` : ''}
              </p>
            </div>
            <button
              onClick={() => setSelectedPlot(null)}
              className="text-muted-foreground hover:text-foreground text-lg leading-none"
            >
              ✕
            </button>
          </div>

          <ActivityForm
            defaultPlotId={selectedPlot.id}
            onSuccess={() => setSelectedPlot(null)}
          />
        </div>
      )}
    </div>
  )
}
