# IGUE Bananas — Phase 4: Dashboard + History + Reports

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Dashboard com KPIs em tempo real, histórico de atividades/colheitas com filtros, e relatórios diário/semanal/mensal por produto e talhão.

**Architecture:** Reports calculados via queries Prisma agregadas (sem tabela própria). Dashboard usa TanStack Query com refetch periódico. Filtros de relatório via URL search params.

**Tech Stack:** Next.js API Routes, Prisma aggregate queries, TanStack Query, shadcn/ui Table + Card

**Prerequisite:** Phase 3 complete.

---

## File Map

```
src/
├── app/
│   ├── (app)/
│   │   ├── dashboard/page.tsx          # KPIs reais
│   │   ├── atividades/historico/page.tsx
│   │   ├── producao/historico/page.tsx
│   │   └── relatorios/page.tsx
│   └── api/
│       ├── dashboard/route.ts
│       └── reports/route.ts
└── components/
    ├── dashboard/
    │   ├── KPICard.tsx
    │   └── DashboardGrid.tsx
    ├── activities/
    │   └── ActivityList.tsx
    ├── harvests/
    │   └── HarvestList.tsx
    └── reports/
        ├── ReportFilter.tsx
        └── ReportTable.tsx
```

---

### Task 1: Dashboard API

**Files:**
- Create: `src/app/api/dashboard/route.ts`

- [ ] **Step 1: Write test `src/app/api/dashboard/__tests__/route.test.ts`**

```typescript
// Integration-style: test the aggregation logic in isolation
import { buildDashboardQuery } from '@/app/api/dashboard/route'

describe('buildDashboardQuery', () => {
  it('returns start and end of current month', () => {
    const { startDate, endDate } = buildDashboardQuery('month')
    expect(startDate.getDate()).toBe(1)
    expect(endDate >= startDate).toBe(true)
  })

  it('returns last 7 days for week', () => {
    const { startDate, endDate } = buildDashboardQuery('week')
    const diff = endDate.getTime() - startDate.getTime()
    expect(diff).toBeLessThanOrEqual(7 * 24 * 60 * 60 * 1000 + 1000)
  })
})
```

- [ ] **Step 2: Run test — expect FAIL**

```bash
npx jest src/app/api/dashboard/__tests__/route.test.ts
```

- [ ] **Step 3: Create `src/app/api/dashboard/route.ts`**

```typescript
import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { db } from '@/lib/db'

export function buildDashboardQuery(period: string): { startDate: Date; endDate: Date } {
  const now = new Date()
  const endDate = new Date(now)
  endDate.setHours(23, 59, 59, 999)

  let startDate: Date

  if (period === 'week') {
    startDate = new Date(now)
    startDate.setDate(now.getDate() - 6)
    startDate.setHours(0, 0, 0, 0)
  } else if (period === 'month') {
    startDate = new Date(now.getFullYear(), now.getMonth(), 1)
  } else {
    // day
    startDate = new Date(now)
    startDate.setHours(0, 0, 0, 0)
  }

  return { startDate, endDate }
}

export async function GET(req: Request) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { searchParams } = new URL(req.url)
  const period = searchParams.get('period') ?? 'month'
  const { startDate, endDate } = buildDashboardQuery(period)

  const dateFilter = { gte: startDate, lte: endDate }

  const [
    totalActivities,
    totalHarvests,
    revenueAgg,
    costAgg,
    harvestsByProduct,
    recentActivities,
  ] = await Promise.all([
    db.activity.count({ where: { date: dateFilter } }),

    db.harvest.count({ where: { date: dateFilter } }),

    db.harvest.aggregate({
      where: { date: dateFilter },
      _sum:  { totalRevenue: true },
    }),

    db.activity.aggregate({
      where: { date: dateFilter, cost: { not: null } },
      _sum:  { cost: true },
    }),

    db.harvest.groupBy({
      by:    ['plotId'],
      where: { date: dateFilter },
      _sum:  { totalRevenue: true, quantity: true },
      _count: true,
    }),

    db.activity.findMany({
      where:   { date: dateFilter },
      orderBy: { date: 'desc' },
      take:    5,
      include: { plot: { select: { code: true, name: true, productType: true } } },
    }),
  ])

  return NextResponse.json({
    period,
    totalActivities,
    totalHarvests,
    totalRevenue:    revenueAgg._sum.totalRevenue ?? 0,
    totalCost:       costAgg._sum.cost ?? 0,
    margin:          (revenueAgg._sum.totalRevenue ?? 0) - (costAgg._sum.cost ?? 0),
    harvestsByPlot:  harvestsByProduct,
    recentActivities,
  })
}
```

- [ ] **Step 4: Run test — expect PASS**

```bash
npx jest src/app/api/dashboard/__tests__/route.test.ts
```

- [ ] **Step 5: Commit**

```bash
git add src/app/api/dashboard/
git commit -m "feat: add dashboard API with KPI aggregations"
```

---

### Task 2: KPICard + DashboardGrid

**Files:**
- Create: `src/components/dashboard/KPICard.tsx`
- Create: `src/components/dashboard/DashboardGrid.tsx`
- Modify: `src/app/(app)/dashboard/page.tsx`

- [ ] **Step 1: Write test `src/components/dashboard/__tests__/KPICard.test.tsx`**

```typescript
import { render, screen } from '@testing-library/react'
import { KPICard } from '@/components/dashboard/KPICard'

describe('KPICard', () => {
  it('renders label and value', () => {
    render(<KPICard label="Receita" value="R$ 1.250,00" icon="💰" />)
    expect(screen.getByText('Receita')).toBeInTheDocument()
    expect(screen.getByText('R$ 1.250,00')).toBeInTheDocument()
  })

  it('renders positive change in green', () => {
    render(<KPICard label="Colheitas" value="42" icon="🍌" change="+12%" positive />)
    const change = screen.getByText('+12%')
    expect(change).toHaveClass('text-green-600')
  })
})
```

- [ ] **Step 2: Run test — expect FAIL**

```bash
npx jest src/components/dashboard/__tests__/KPICard.test.tsx
```

- [ ] **Step 3: Create `src/components/dashboard/KPICard.tsx`**

```typescript
import { Card, CardContent } from '@/components/ui/card'

interface KPICardProps {
  label:     string
  value:     string | number
  icon:      string
  change?:   string
  positive?: boolean
  subtitle?: string
}

export function KPICard({ label, value, icon, change, positive, subtitle }: KPICardProps) {
  return (
    <Card>
      <CardContent className="pt-6">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-sm text-muted-foreground">{label}</p>
            <p className="text-2xl font-bold text-primary mt-1">{value}</p>
            {subtitle && <p className="text-xs text-muted-foreground mt-0.5">{subtitle}</p>}
            {change && (
              <p className={`text-xs mt-1 font-medium ${positive ? 'text-green-600' : 'text-red-500'}`}>
                {change}
              </p>
            )}
          </div>
          <span className="text-3xl">{icon}</span>
        </div>
      </CardContent>
    </Card>
  )
}
```

- [ ] **Step 4: Create `src/components/dashboard/DashboardGrid.tsx`**

```typescript
'use client'

import { useQuery } from '@tanstack/react-query'
import { useState } from 'react'
import { KPICard } from './KPICard'
import { Button } from '@/components/ui/button'

const PERIODS = [
  { value: 'day',   label: 'Hoje' },
  { value: 'week',  label: '7 dias' },
  { value: 'month', label: 'Mês' },
]

export function DashboardGrid() {
  const [period, setPeriod] = useState('month')

  const { data, isLoading } = useQuery({
    queryKey:  ['dashboard', period],
    queryFn:   () => fetch(`/api/dashboard?period=${period}`).then(r => r.json()),
    refetchInterval: 60_000,
  })

  const fmt = (n: number) =>
    n.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })

  return (
    <div className="space-y-6">
      <div className="flex gap-2">
        {PERIODS.map(p => (
          <Button
            key={p.value}
            size="sm"
            variant={period === p.value ? 'default' : 'outline'}
            onClick={() => setPeriod(p.value)}
            className={period === p.value ? 'bg-primary' : ''}
          >
            {p.label}
          </Button>
        ))}
      </div>

      {isLoading ? (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[1,2,3,4].map(i => (
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
    </div>
  )
}
```

- [ ] **Step 5: Update `src/app/(app)/dashboard/page.tsx`**

```typescript
import { DashboardGrid } from '@/components/dashboard/DashboardGrid'

export default function DashboardPage() {
  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-primary">Dashboard</h1>
        <p className="text-muted-foreground text-sm">Visão geral do sítio</p>
      </div>
      <DashboardGrid />
    </div>
  )
}
```

- [ ] **Step 6: Run tests — expect PASS**

```bash
npx jest src/components/dashboard/__tests__/KPICard.test.tsx
```

- [ ] **Step 7: Commit**

```bash
git add src/components/dashboard/ src/app/\(app\)/dashboard/
git commit -m "feat: add KPI dashboard with period filter"
```

---

### Task 3: Activity + Harvest History Lists

**Files:**
- Create: `src/components/activities/ActivityList.tsx`
- Create: `src/components/harvests/HarvestList.tsx`
- Create: `src/app/(app)/atividades/historico/page.tsx`
- Create: `src/app/(app)/producao/historico/page.tsx`

- [ ] **Step 1: Create `src/components/activities/ActivityList.tsx`**

```typescript
'use client'

import { useQuery } from '@tanstack/react-query'
import { useState } from 'react'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { ProductBadge } from '@/components/ui/product-badge'
import { ACTIVITY_LABELS } from '@/types'

export function ActivityList() {
  const [search, setSearch] = useState('')

  const { data: activities, isLoading } = useQuery({
    queryKey: ['activities'],
    queryFn:  () => fetch('/api/activities').then(r => r.json()),
  })

  const filtered = (activities ?? []).filter((a: any) =>
    search === '' ||
    a.plot?.name?.toLowerCase().includes(search.toLowerCase()) ||
    a.responsible?.toLowerCase().includes(search.toLowerCase()) ||
    ACTIVITY_LABELS[a.type]?.toLowerCase().includes(search.toLowerCase())
  )

  if (isLoading) return (
    <div className="space-y-2">
      {[1,2,3].map(i => <div key={i} className="h-16 rounded bg-muted animate-pulse" />)}
    </div>
  )

  return (
    <div className="space-y-4">
      <Input
        placeholder="Buscar por talhão, responsável ou tipo..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="max-w-sm"
      />

      {filtered.length === 0 && (
        <p className="text-muted-foreground text-sm py-8 text-center">Nenhuma atividade encontrada.</p>
      )}

      <div className="space-y-2">
        {filtered.map((a: any) => (
          <div key={a.id} className="flex items-center justify-between rounded-lg border p-3 bg-white">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="font-medium text-sm">{ACTIVITY_LABELS[a.type] ?? a.type}</span>
                {a.plot && <ProductBadge productType={a.plot.productType} />}
              </div>
              <p className="text-xs text-muted-foreground">
                {a.plot?.code} — {a.plot?.name} · {a.responsible}
              </p>
            </div>
            <div className="text-right">
              <p className="text-xs text-muted-foreground">
                {new Date(a.date).toLocaleDateString('pt-BR')}
              </p>
              {a.cost != null && (
                <p className="text-sm font-medium text-primary">
                  R$ {a.cost.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </p>
              )}
              <Badge variant={a.confirmed ? 'default' : 'secondary'} className="mt-1">
                {a.confirmed ? 'Confirmado' : 'Rascunho'}
              </Badge>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
```

- [ ] **Step 2: Create `src/app/(app)/atividades/historico/page.tsx`**

```typescript
import { ActivityList } from '@/components/activities/ActivityList'
import { Button } from '@/components/ui/button'
import Link from 'next/link'

export default function HistoricoAtividadesPage() {
  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-primary">Atividades</h1>
          <p className="text-sm text-muted-foreground">Histórico de registros</p>
        </div>
        <Button asChild className="bg-primary hover:bg-primary-800">
          <Link href="/atividades/novo">+ Registrar</Link>
        </Button>
      </div>
      <ActivityList />
    </div>
  )
}
```

- [ ] **Step 3: Create `src/components/harvests/HarvestList.tsx`**

```typescript
'use client'

import { useQuery } from '@tanstack/react-query'
import { ProductBadge } from '@/components/ui/product-badge'
import { UNIT_LABELS } from '@/types'

export function HarvestList() {
  const { data: harvests, isLoading } = useQuery({
    queryKey: ['harvests'],
    queryFn:  () => fetch('/api/harvests').then(r => r.json()),
  })

  const totalRevenue = (harvests ?? []).reduce(
    (sum: number, h: any) => sum + (h.totalRevenue ?? 0), 0
  )

  if (isLoading) return (
    <div className="space-y-2">
      {[1,2,3].map(i => <div key={i} className="h-16 rounded bg-muted animate-pulse" />)}
    </div>
  )

  return (
    <div className="space-y-4">
      {(harvests ?? []).length > 0 && (
        <div className="rounded-lg bg-primary/10 p-3 flex items-center justify-between">
          <span className="text-sm text-muted-foreground">Receita total (exibida)</span>
          <span className="font-bold text-primary">
            R$ {totalRevenue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
          </span>
        </div>
      )}

      {(harvests ?? []).length === 0 && (
        <p className="text-muted-foreground text-sm py-8 text-center">Nenhuma colheita registrada.</p>
      )}

      <div className="space-y-2">
        {(harvests ?? []).map((h: any) => (
          <div key={h.id} className="flex items-center justify-between rounded-lg border p-3 bg-white">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="font-medium text-sm">
                  {h.quantity} {UNIT_LABELS[h.unit] ?? h.unit}(s)
                </span>
                {h.plot && <ProductBadge productType={h.plot.productType} />}
              </div>
              <p className="text-xs text-muted-foreground">
                {h.plot?.code} — {h.plot?.name}
              </p>
              <p className="text-xs text-muted-foreground">
                R$ {h.pricePerUnit?.toFixed(2)} / {UNIT_LABELS[h.unit] ?? h.unit}
              </p>
            </div>
            <div className="text-right">
              <p className="text-xs text-muted-foreground">
                {new Date(h.date).toLocaleDateString('pt-BR')}
              </p>
              <p className="text-sm font-bold text-primary">
                R$ {h.totalRevenue?.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
```

- [ ] **Step 4: Create `src/app/(app)/producao/historico/page.tsx`**

```typescript
import { HarvestList } from '@/components/harvests/HarvestList'
import { Button } from '@/components/ui/button'
import Link from 'next/link'

export default function HistoricoProducaoPage() {
  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-primary">Produção</h1>
          <p className="text-sm text-muted-foreground">Histórico de colheitas</p>
        </div>
        <Button asChild className="bg-primary hover:bg-primary-800">
          <Link href="/producao/novo">+ Registrar</Link>
        </Button>
      </div>
      <HarvestList />
    </div>
  )
}
```

- [ ] **Step 5: Commit**

```bash
git add src/components/activities/ActivityList.tsx src/components/harvests/HarvestList.tsx
git add src/app/\(app\)/atividades/historico/ src/app/\(app\)/producao/historico/
git commit -m "feat: add activity and harvest history lists"
```

---

### Task 4: Reports API + UI

**Files:**
- Create: `src/app/api/reports/route.ts`
- Create: `src/components/reports/ReportFilter.tsx`
- Create: `src/components/reports/ReportTable.tsx`
- Create: `src/app/(app)/relatorios/page.tsx`

- [ ] **Step 1: Create `src/app/api/reports/route.ts`**

```typescript
import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { db } from '@/lib/db'

export async function GET(req: Request) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { searchParams } = new URL(req.url)
  const startDate = searchParams.get('startDate')
  const endDate   = searchParams.get('endDate')
  const plotId    = searchParams.get('plotId')

  if (!startDate || !endDate) {
    return NextResponse.json({ error: 'startDate and endDate required' }, { status: 400 })
  }

  const dateFilter = {
    gte: new Date(startDate),
    lte: new Date(endDate),
  }

  const [activities, harvests, plots] = await Promise.all([
    db.activity.findMany({
      where: {
        date: dateFilter,
        ...(plotId ? { plotId } : {}),
      },
      include: { plot: { select: { code: true, name: true, productType: true } } },
      orderBy: { date: 'asc' },
    }),

    db.harvest.findMany({
      where: {
        date: dateFilter,
        ...(plotId ? { plotId } : {}),
      },
      include: { plot: { select: { code: true, name: true, productType: true } } },
      orderBy: { date: 'asc' },
    }),

    db.plot.findMany({ orderBy: { code: 'asc' } }),
  ])

  const totalRevenue = harvests.reduce((s, h) => s + h.totalRevenue, 0)
  const totalCost    = activities.reduce((s, a) => s + (a.cost ?? 0), 0)

  // Group harvests by product
  const byProduct: Record<string, { quantity: number; revenue: number; count: number }> = {}
  for (const h of harvests) {
    const pt = h.plot.productType
    if (!byProduct[pt]) byProduct[pt] = { quantity: 0, revenue: 0, count: 0 }
    byProduct[pt].quantity += h.quantity
    byProduct[pt].revenue  += h.totalRevenue
    byProduct[pt].count    += 1
  }

  return NextResponse.json({
    period: { startDate, endDate },
    summary: { totalRevenue, totalCost, margin: totalRevenue - totalCost },
    byProduct,
    activities,
    harvests,
    plots,
  })
}
```

- [ ] **Step 2: Create `src/components/reports/ReportFilter.tsx`**

```typescript
'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

interface ReportFilterProps {
  onFilter: (params: { startDate: string; endDate: string }) => void
}

function thisMonthRange() {
  const now   = new Date()
  const start = new Date(now.getFullYear(), now.getMonth(), 1)
  const end   = new Date(now.getFullYear(), now.getMonth() + 1, 0)
  return {
    startDate: start.toISOString().split('T')[0],
    endDate:   end.toISOString().split('T')[0],
  }
}

export function ReportFilter({ onFilter }: ReportFilterProps) {
  const defaults = thisMonthRange()
  const [startDate, setStartDate] = useState(defaults.startDate)
  const [endDate,   setEndDate]   = useState(defaults.endDate)

  const setPreset = (days: number) => {
    const end   = new Date()
    const start = new Date()
    start.setDate(end.getDate() - days + 1)
    setStartDate(start.toISOString().split('T')[0])
    setEndDate(end.toISOString().split('T')[0])
  }

  return (
    <div className="space-y-4 p-4 border rounded-lg bg-white">
      <div className="flex gap-2 flex-wrap">
        <Button size="sm" variant="outline" onClick={() => {
          const d = thisMonthRange()
          setStartDate(d.startDate); setEndDate(d.endDate)
        }}>Este mês</Button>
        <Button size="sm" variant="outline" onClick={() => setPreset(7)}>7 dias</Button>
        <Button size="sm" variant="outline" onClick={() => setPreset(30)}>30 dias</Button>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Data início</Label>
          <Input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} />
        </div>
        <div className="space-y-2">
          <Label>Data fim</Label>
          <Input type="date" value={endDate} onChange={e => setEndDate(e.target.value)} />
        </div>
      </div>

      <Button
        className="bg-primary hover:bg-primary-800"
        onClick={() => onFilter({ startDate, endDate })}
      >
        Gerar Relatório
      </Button>
    </div>
  )
}
```

- [ ] **Step 3: Create `src/components/reports/ReportTable.tsx`**

```typescript
'use client'

import { PRODUCT_LABELS, ACTIVITY_LABELS } from '@/types'

interface ReportData {
  period:    { startDate: string; endDate: string }
  summary:   { totalRevenue: number; totalCost: number; margin: number }
  byProduct: Record<string, { quantity: number; revenue: number; count: number }>
  activities: any[]
  harvests:   any[]
}

interface ReportTableProps {
  data: ReportData
}

const fmt = (n: number) =>
  n.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })

export function ReportTable({ data }: ReportTableProps) {
  return (
    <div className="space-y-6">
      {/* Summary */}
      <div className="grid grid-cols-3 gap-4">
        <div className="rounded-lg bg-green-50 border border-green-200 p-4 text-center">
          <p className="text-xs text-muted-foreground">Receita</p>
          <p className="text-xl font-bold text-green-700">{fmt(data.summary.totalRevenue)}</p>
        </div>
        <div className="rounded-lg bg-red-50 border border-red-200 p-4 text-center">
          <p className="text-xs text-muted-foreground">Custo</p>
          <p className="text-xl font-bold text-red-700">{fmt(data.summary.totalCost)}</p>
        </div>
        <div className={`rounded-lg p-4 text-center border ${
          data.summary.margin >= 0
            ? 'bg-primary/10 border-primary/20'
            : 'bg-red-50 border-red-200'
        }`}>
          <p className="text-xs text-muted-foreground">Margem</p>
          <p className={`text-xl font-bold ${data.summary.margin >= 0 ? 'text-primary' : 'text-red-700'}`}>
            {fmt(data.summary.margin)}
          </p>
        </div>
      </div>

      {/* By Product */}
      {Object.keys(data.byProduct).length > 0 && (
        <div>
          <h3 className="font-semibold text-primary mb-3">Por Produto</h3>
          <div className="space-y-2">
            {Object.entries(data.byProduct).map(([pt, stats]) => (
              <div key={pt} className="flex items-center justify-between border rounded-lg p-3 bg-white">
                <span className="font-medium text-sm">{PRODUCT_LABELS[pt] ?? pt}</span>
                <div className="text-right text-sm">
                  <p className="text-muted-foreground">{stats.count} colheitas · {stats.quantity.toLocaleString('pt-BR')} un.</p>
                  <p className="font-bold text-primary">{fmt(stats.revenue)}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Harvests */}
      {data.harvests.length > 0 && (
        <div>
          <h3 className="font-semibold text-primary mb-3">Colheitas ({data.harvests.length})</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-2 text-muted-foreground font-medium">Data</th>
                  <th className="text-left py-2 text-muted-foreground font-medium">Talhão</th>
                  <th className="text-right py-2 text-muted-foreground font-medium">Qtd</th>
                  <th className="text-right py-2 text-muted-foreground font-medium">Preço/un</th>
                  <th className="text-right py-2 text-muted-foreground font-medium">Receita</th>
                </tr>
              </thead>
              <tbody>
                {data.harvests.map((h: any) => (
                  <tr key={h.id} className="border-b last:border-0">
                    <td className="py-2">{new Date(h.date).toLocaleDateString('pt-BR')}</td>
                    <td className="py-2">{h.plot?.code} — {h.plot?.name}</td>
                    <td className="py-2 text-right">{h.quantity}</td>
                    <td className="py-2 text-right">{fmt(h.pricePerUnit)}</td>
                    <td className="py-2 text-right font-medium text-primary">{fmt(h.totalRevenue)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Activities */}
      {data.activities.length > 0 && (
        <div>
          <h3 className="font-semibold text-primary mb-3">Atividades ({data.activities.length})</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-2 text-muted-foreground font-medium">Data</th>
                  <th className="text-left py-2 text-muted-foreground font-medium">Tipo</th>
                  <th className="text-left py-2 text-muted-foreground font-medium">Talhão</th>
                  <th className="text-left py-2 text-muted-foreground font-medium">Responsável</th>
                  <th className="text-right py-2 text-muted-foreground font-medium">Custo</th>
                </tr>
              </thead>
              <tbody>
                {data.activities.map((a: any) => (
                  <tr key={a.id} className="border-b last:border-0">
                    <td className="py-2">{new Date(a.date).toLocaleDateString('pt-BR')}</td>
                    <td className="py-2">{ACTIVITY_LABELS[a.type] ?? a.type}</td>
                    <td className="py-2">{a.plot?.code}</td>
                    <td className="py-2">{a.responsible}</td>
                    <td className="py-2 text-right">
                      {a.cost != null ? fmt(a.cost) : '—'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}
```

- [ ] **Step 4: Create `src/app/(app)/relatorios/page.tsx`**

```typescript
'use client'

import { useState } from 'react'
import { ReportFilter } from '@/components/reports/ReportFilter'
import { ReportTable } from '@/components/reports/ReportTable'

export default function RelatoriosPage() {
  const [data, setData] = useState<any>(null)
  const [loading, setLoading] = useState(false)

  async function handleFilter({ startDate, endDate }: { startDate: string; endDate: string }) {
    setLoading(true)
    const res = await fetch(`/api/reports?startDate=${startDate}T00:00:00.000Z&endDate=${endDate}T23:59:59.999Z`)
    const json = await res.json()
    setData(json)
    setLoading(false)
  }

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-primary">Relatórios</h1>
        <p className="text-sm text-muted-foreground">Análise por período</p>
      </div>

      <ReportFilter onFilter={handleFilter} />

      {loading && (
        <div className="space-y-3">
          {[1,2,3].map(i => <div key={i} className="h-16 rounded bg-muted animate-pulse" />)}
        </div>
      )}

      {data && !loading && <ReportTable data={data} />}

      {!data && !loading && (
        <p className="text-center text-muted-foreground py-8">
          Selecione um período e clique em "Gerar Relatório"
        </p>
      )}
    </div>
  )
}
```

- [ ] **Step 5: Commit**

```bash
git add src/app/api/reports/ src/components/reports/ src/app/\(app\)/relatorios/
git commit -m "feat: add reports page with period filter and summary by product"
```

---

## Phase 4 Complete

At this point the full MVP is functional:

| Feature | Status |
|---|---|
| Auth (login/logout/roles) | ✅ |
| Talhões CRUD | ✅ |
| Mapa com polígonos | ✅ |
| Registro de atividades (offline) | ✅ |
| Registro de colheitas (offline) | ✅ |
| Sync automático + badge | ✅ |
| Dashboard com KPIs | ✅ |
| Histórico de atividades | ✅ |
| Histórico de colheitas | ✅ |
| Relatórios por período | ✅ |

**Next:** Deploy no Render — push repo, create Web Service + PostgreSQL, set env vars, run `npx prisma migrate deploy && npm run db:seed`.
