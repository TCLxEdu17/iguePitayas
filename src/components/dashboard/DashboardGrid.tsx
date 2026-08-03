'use client'

import { useQuery } from '@tanstack/react-query'
import { useState } from 'react'
import { KPICard } from './KPICard'
import { Button } from '@/components/ui/button'
import { ACTIVITY_LABELS, UNIT_LABELS } from '@/types'
import type { ActivityType } from '@/types'
import { getApiUrl } from '@/lib/api-url'
import { WeatherWidget } from './WeatherWidget'
import { DailyTipCard } from './DailyTipCard'
import { SiteFilter } from '@/components/common/SiteFilter'
import { useSession } from 'next-auth/react'

const PERIODS = [
  { value: 'day',   label: 'Hoje'   },
  { value: 'week',  label: '7 dias' },
  { value: 'month', label: 'Mês'    },
]

function fmt(n: number) {
  return n.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
}

const TYPE_COLORS: Record<string, string> = {
  RETIRADA_BANANA: '#27AE60',
  RETIRADA_CAIXAS: '#F39C12',
  PULVERIZACAO:    '#3498DB',
  ROCAGEM:         '#9B59B6',
  OUTRO:           '#95A5A6',
}

function RecentActivityCard({ a, isAdmin }: { a: any; isAdmin: boolean }) {
  const [open, setOpen] = useState(false)
  const color = TYPE_COLORS[a.type] ?? '#95A5A6'
  const siteName = a.plot?.site?.name

  return (
    <div
      className="rounded-lg border bg-white overflow-hidden cursor-pointer select-none"
      style={{ borderColor: open ? color : undefined }}
      onClick={() => setOpen(o => !o)}
    >
      {/* Collapsed row */}
      <div className="flex items-center gap-3 p-3">
        <span
          className="w-1.5 self-stretch rounded-full shrink-0"
          style={{ backgroundColor: color }}
        />
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold leading-tight">
            {ACTIVITY_LABELS[a.type as ActivityType] ?? a.type}
          </p>
          <p className="text-xs text-muted-foreground truncate">
            {siteName ? `${siteName} — ` : ''}{a.plot?.name}
            {' · '}{a.responsible}
          </p>
        </div>
        <div className="text-right shrink-0 flex flex-col items-end gap-1">
          <p className="text-xs text-muted-foreground">
            {new Date(a.date).toLocaleDateString('pt-BR')}
          </p>
          <span
            className="text-[10px] font-medium px-1.5 py-0.5 rounded-full"
            style={{ backgroundColor: color + '22', color }}
          >
            {a.plot?.code}
          </span>
        </div>
        <span className="text-muted-foreground text-xs ml-1">{open ? '▲' : '▼'}</span>
      </div>

      {/* Expanded detail */}
      {open && (
        <div
          className="px-4 pb-4 pt-1 space-y-2 text-sm border-t"
          style={{ borderColor: color + '33', backgroundColor: color + '08' }}
          onClick={e => e.stopPropagation()}
        >
          <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-xs">
            <div>
              <span className="text-muted-foreground">Talhão</span>
              <p className="font-medium">{a.plot?.code} — {a.plot?.name}</p>
            </div>
            {siteName && (
              <div>
                <span className="text-muted-foreground">Sítio</span>
                <p className="font-medium">{siteName}</p>
              </div>
            )}
            <div>
              <span className="text-muted-foreground">Responsável</span>
              <p className="font-medium">{a.responsible}</p>
            </div>
            <div>
              <span className="text-muted-foreground">Data</span>
              <p className="font-medium">{new Date(a.date).toLocaleDateString('pt-BR')}</p>
            </div>
            {a.quantity != null && (
              <div>
                <span className="text-muted-foreground">Quantidade</span>
                <p className="font-medium">
                  {a.quantity.toLocaleString('pt-BR')}
                  {a.unit ? ` ${UNIT_LABELS[a.unit as keyof typeof UNIT_LABELS] ?? a.unit}` : ''}
                </p>
              </div>
            )}
            {isAdmin && a.cost != null && (
              <div>
                <span className="text-muted-foreground">Valor</span>
                <p className="font-medium" style={{ color }}>
                  {fmt(a.cost)}
                </p>
              </div>
            )}
          </div>
          {a.notes && (
            <div className="text-xs">
              <span className="text-muted-foreground">Observações</span>
              <p className="mt-0.5 text-foreground">{a.notes}</p>
            </div>
          )}
          <div className="flex items-center gap-2 pt-1">
            <span
              className="text-[10px] px-2 py-0.5 rounded-full border"
              style={a.confirmed
                ? { borderColor: '#27AE60', color: '#27AE60', backgroundColor: '#27AE6011' }
                : { borderColor: '#95A5A6', color: '#95A5A6', backgroundColor: '#95A5A611' }
              }
            >
              {a.confirmed ? 'Confirmado' : 'Rascunho'}
            </span>
          </div>
        </div>
      )}
    </div>
  )
}

export function DashboardGrid() {
  const [period, setPeriod] = useState('month')
  const [selectedSiteId, setSelectedSiteId] = useState<string | null>(null)
  const { data: session } = useSession()
  const isAdmin = (session?.user as any)?.role === 'ADMIN'

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
      {/* Recent activities — topo */}
      {(isLoading || data?.recentActivities?.length > 0) && (
        <div>
          <h2 className="text-xs font-semibold text-muted-foreground mb-3 uppercase tracking-wide">
            Últimas atividades
          </h2>
          {isLoading ? (
            <div className="space-y-2">
              {[1, 2, 3].map(i => <div key={i} className="h-14 rounded-lg bg-muted animate-pulse" />)}
            </div>
          ) : (
            <div className="space-y-2">
              {data.recentActivities.map((a: any) => (
                <RecentActivityCard key={a.id} a={a} isAdmin={isAdmin} />
              ))}
            </div>
          )}
        </div>
      )}

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
          <KPICard label="Receita"  value={fmt(data?.totalRevenue ?? 0)} icon="💰" />
          <KPICard label="Custo"    value={fmt(data?.totalCost ?? 0)}    icon="📉" />
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
    </div>
  )
}
