'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { PlotList } from '@/components/plots/PlotList'
import { SiteFilter } from '@/components/common/SiteFilter'
import Link from 'next/link'

export default function TalhoesPage() {
  const [selectedSiteId, setSelectedSiteId] = useState<string | null>(null)

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6 gap-4">
        <div>
          <h1 className="text-2xl font-bold" style={{ color: 'var(--color-primary)' }}>Talhões</h1>
          <p className="text-muted-foreground text-sm">Gerencie os talhões do sítio</p>
        </div>
        <div className="flex gap-2 flex-wrap">
          <Button asChild variant="outline">
            <Link href="/talhoes/mapa">Ver Mapa</Link>
          </Button>
        </div>
      </div>
      <div className="mb-4">
        <SiteFilter value={selectedSiteId} onChange={setSelectedSiteId} />
      </div>
      <PlotList siteId={selectedSiteId} />
    </div>
  )
}
