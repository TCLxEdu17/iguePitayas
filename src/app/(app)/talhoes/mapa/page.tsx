'use client'

import { useRef, useState } from 'react'
import { PlotMap } from '@/components/plots/PlotMap'
import { Button } from '@/components/ui/button'
import { useSession } from 'next-auth/react'

export default function MapaPage() {
  const inputRef = useRef<HTMLInputElement>(null)
  const [uploading, setUploading] = useState(false)
  const { data: session } = useSession()
  const isAdmin = (session?.user as any)?.role === 'ADMIN'

  async function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setUploading(true)
    const form = new FormData()
    form.append('file', file)
    const res = await fetch('/api/farm/map', { method: 'POST', body: form })
    setUploading(false)
    if (res.ok) window.location.reload()
  }

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6 gap-4">
        <div>
          <h1 className="text-2xl font-bold" style={{ color: 'var(--color-primary)' }}>Mapa do Sítio</h1>
          <p className="text-muted-foreground text-sm">Visualize e marque os talhões na planta</p>
        </div>
        {isAdmin && (
          <div>
            <input ref={inputRef} type="file" accept="image/*" className="hidden" onChange={handleUpload} />
            <Button
              variant="outline"
              onClick={() => inputRef.current?.click()}
              disabled={uploading}
            >
              {uploading ? 'Enviando...' : 'Atualizar planta'}
            </Button>
          </div>
        )}
      </div>
      <PlotMap />
    </div>
  )
}
