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
    <div className="p-3 md:p-6 space-y-4">
      {/* Cabeçalho compacto no mobile */}
      <div className="flex items-start justify-between gap-2">
        <div>
          <h1 className="text-lg md:text-2xl font-bold leading-tight" style={{ color: 'var(--color-primary)' }}>
            Mapa do Sítio
          </h1>
          <p className="text-muted-foreground text-xs md:text-sm">
            Toque em um talhão para registrar atividade
          </p>
        </div>
        {isAdmin && (
          <>
            <input ref={inputRef} type="file" accept="image/*" className="hidden" onChange={handleUpload} />
            <Button
              variant="outline"
              size="sm"
              onClick={() => inputRef.current?.click()}
              disabled={uploading}
              className="shrink-0 text-xs"
            >
              {uploading ? 'Enviando...' : 'Atualizar planta'}
            </Button>
          </>
        )}
      </div>

      {/* Mapa */}
      <PlotMap siteId={siteId} onSelectPlot={setSelectedPlot} />

      {/* Painel de registro — aparece ao selecionar talhão */}
      {selectedPlot && (
        <div
          className="rounded-xl border p-4 space-y-3"
          style={{ borderColor: '#D4B896', backgroundColor: '#FAFAF7' }}
        >
          <div className="flex items-start justify-between gap-2">
            <div>
              <h2 className="font-bold text-sm md:text-base" style={{ color: 'var(--color-primary)' }}>
                Registrar atividade
              </h2>
              <p className="text-xs text-muted-foreground">
                <strong>{selectedPlot.name}</strong>
                {selectedPlot.area ? ` · ${selectedPlot.area.toLocaleString('pt-BR')} pés` : ''}
              </p>
            </div>
            <button
              onClick={() => setSelectedPlot(null)}
              className="text-muted-foreground hover:text-foreground text-lg leading-none shrink-0 mt-0.5"
              aria-label="Fechar"
            >
              ✕
            </button>
          </div>

          <ActivityForm />
        </div>
      )}
    </div>
  )
}
