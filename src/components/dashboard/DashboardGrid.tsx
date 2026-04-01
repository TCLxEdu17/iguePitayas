'use client'

import { useQuery } from '@tanstack/react-query'
import { useState } from 'react'
import { KPICard } from './KPICard'
import { Button } from '@/components/ui/button'
import { ACTIVITY_LABELS } from '@/types'
import type { Activity } from '@/types'
import { getApiUrl } from '@/lib/api-url'
import { WeatherWidget } from './WeatherWidget'
import { DailyTipCard } from './DailyTipCard'
import { SiteFilter } from '@/components/common/SiteFilter'

type ActivityType = Activity['type']

const PERIODS = [
  { value: 'day',   label: 'Hoje'   },
  { value: 'week',  label: '7 dias' },
  { value: 'month', label: 'Mês'    },
]

function fmt(n: number) {
  return n.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
}

export function DashboardGrid() {
  const [period, setPeriod] = useState('month')
  const [selectedSiteId, setSelectedSiteId] = useState<string | null>(null)

  const { data, isLoading } = useQuery({
    queryKey:        ['dashboard', period, selectedSiteId],
    queryFn:         () => {
      const url = selectedSiteId
        ? getApiUrl(`/api/dashboard?period=${period}&siteId=${selectedSiteId}`)
        : getApiUrl(`/api/dashboard?period=${period}`)
      return fetch(url).then(r => r.json())
    },
    refetchInterval: 60_000,
  })

  return (
    <div className="space-y-6">
      {/* Weather */}
      <WeatherWidget />

      {/* Period selector */}
      <div className="flex items-center gap-3 flex-wrap">
        <div className="flex gap-2">
          {PERIODS.map(p => (
            <Button
              key={p.value}
              size="sm"
              variant={period === p.value ? 'default' : 'outline'}
              onClick={() => setPeriod(p.value)}
              style={period === p.value
                ? { backgroundColor: 'var(--color-primary)', color: 'white' }
                : {}}
            >
              {p.label}
            </Button>
          ))}
        </div>
        <SiteFilter value={selectedSiteId} onChange={setSelectedSiteId} />
      </div>

      {/* KPI grid */}
      {isLoading ? (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="h-28 rounded-lg bg-muted animate-pulse" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <KPICard
            label="Receita"
            value={fmt(data?.totalRevenue ?? 0)}
            icon="💰"
          />
          <KPICard
            label="Custo"
            value={fmt(data?.totalCost ?? 0)}
            icon="📉"
          />
          <KPICard
            label="Margem"
            value={fmt(data?.margin ?? 0)}
            icon="📊"
            positive={(data?.margin ?? 0) >= 0}
          />
          <KPICard
            label="Colheitas"
            value={data?.totalHarvests ?? 0}
            icon="🍌"
            subtitle={`${data?.totalActivities ?? 0} atividades`}
          />
        </div>
      )}

      {/* Daily tip */}
      <DailyTipCard />

      {/* Recent activities */}
      {data?.recentActivities?.length > 0 && (
        <div>
          <h2 className="text-sm font-semibold text-muted-foreground mb-3 uppercase tracking-wide">
            Últimas atividades
          </h2>
          <div className="space-y-2">
            {data.recentActivities.map((a: any) => (
              <div key={a.id} className="flex items-center justify-between rounded-lg border bg-white p-3">
                <div>
                  <p className="text-sm font-medium">{ACTIVITY_LABELS[a.type as ActivityType] ?? a.type}</p>
                  <p className="text-xs text-muted-foreground">{a.plot?.code} — {a.responsible}</p>
                </div>
                <p className="text-xs text-muted-foreground">
                  {new Date(a.date).toLocaleDateString('pt-BR')}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
