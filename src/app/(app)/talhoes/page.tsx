'use client'

import { useState } from 'react'
import { useSession } from 'next-auth/react'
import { Button } from '@/components/ui/button'
import { PlotList } from '@/components/plots/PlotList'
import { SiteFilter } from '@/components/common/SiteFilter'
import { PageTitle } from '@/components/layout/PageTitle'
import Link from 'next/link'

export default function TalhoesPage() {
  const [selectedSiteId, setSelectedSiteId] = useState<string | null>(null)
  const { data: session } = useSession()
  const isAdmin = session?.user?.role === 'ADMIN'

  return (
    <div className="p-4 md:p-6">
      <div className="flex flex-col gap-3 mb-6 sm:flex-row sm:items-center sm:justify-between">
        <PageTitle title="Talhões" subtitle="Gerencie os talhões do sítio" />
        <div className="flex gap-2">
          {isAdmin && (
            <Button asChild size="sm">
              <Link href="/talhoes/novo">+ Novo Talhão</Link>
            </Button>
          )}
          <Button asChild variant="outline" size="sm">
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
