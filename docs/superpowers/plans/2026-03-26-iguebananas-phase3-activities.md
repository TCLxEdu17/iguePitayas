# IGUE Bananas — Phase 3: Activities + Harvests (Offline-First)

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Registro de atividades e colheitas com suporte offline-first via IndexedDB (Dexie.js) + sync automático quando conexão retorna.

**Architecture:** Dexie.js armazena registros localmente com `syncStatus: PENDING`. Background sync job detecta conexão e envia para API. Conflitos (mesmo `localId` já existe) ficam marcados para admin resolver.

**Tech Stack:** Dexie.js, TanStack Query, Next.js API Routes, Prisma, Zod, React Hook Form

**Prerequisite:** Phase 2 complete.

---

## File Map

```
src/
├── lib/offline/
│   ├── db.ts              # Dexie schema
│   └── sync.ts            # sync logic
├── stores/sync.store.ts   # pending count + sync state
├── app/
│   ├── (app)/
│   │   ├── atividades/
│   │   │   ├── novo/page.tsx
│   │   │   └── historico/page.tsx
│   │   └── producao/
│   │       ├── novo/page.tsx
│   │       └── historico/page.tsx
│   └── api/
│       ├── activities/route.ts
│       ├── activities/[id]/route.ts
│       ├── harvests/route.ts
│       └── harvests/[id]/route.ts
├── components/
│   ├── activities/
│   │   ├── ActivityForm.tsx
│   │   └── ActivityList.tsx
│   └── harvests/
│       ├── HarvestForm.tsx
│       └── HarvestList.tsx
└── lib/validations/
    ├── activity.ts
    └── harvest.ts
```

---

### Task 1: Dexie Offline DB

**Files:**
- Create: `src/lib/offline/db.ts`
- Create: `src/stores/sync.store.ts`

- [ ] **Step 1: Write test `src/lib/offline/__tests__/db.test.ts`**

```typescript
import { offlineDb } from '@/lib/offline/db'

describe('offlineDb', () => {
  it('has activities and harvests tables', () => {
    expect(offlineDb.activities).toBeDefined()
    expect(offlineDb.harvests).toBeDefined()
  })
})
```

- [ ] **Step 2: Run test — expect FAIL**

```bash
npx jest src/lib/offline/__tests__/db.test.ts
```

- [ ] **Step 3: Create `src/lib/offline/db.ts`**

```typescript
import Dexie, { type Table } from 'dexie'

export interface LocalActivity {
  localId:     string
  plotId:      string
  userId:      string
  date:        string   // ISO string
  type:        string
  responsible: string
  quantity?:   number
  unit?:       string
  cost?:       number
  notes?:      string
  confirmed:   boolean
  syncStatus:  'PENDING' | 'SYNCED' | 'CONFLICT'
  createdAt:   string
}

export interface LocalHarvest {
  localId:      string
  plotId:       string
  userId:       string
  date:         string
  quantity:     number
  unit:         string
  pricePerUnit: number
  totalRevenue: number
  notes?:       string
  syncStatus:   'PENDING' | 'SYNCED' | 'CONFLICT'
  createdAt:    string
}

class OfflineDatabase extends Dexie {
  activities!: Table<LocalActivity>
  harvests!:   Table<LocalHarvest>

  constructor() {
    super('iguebananas-offline')
    this.version(1).stores({
      activities: 'localId, plotId, date, syncStatus',
      harvests:   'localId, plotId, date, syncStatus',
    })
  }
}

export const offlineDb = new OfflineDatabase()
```

- [ ] **Step 4: Create `src/stores/sync.store.ts`**

```typescript
import { create } from 'zustand'

interface SyncStore {
  pendingCount: number
  isSyncing:    boolean
  setPending:   (count: number) => void
  setSyncing:   (val: boolean) => void
}

export const useSyncStore = create<SyncStore>((set) => ({
  pendingCount: 0,
  isSyncing:    false,
  setPending:   (count) => set({ pendingCount: count }),
  setSyncing:   (val)   => set({ isSyncing: val }),
}))
```

- [ ] **Step 5: Run test — expect PASS**

```bash
npx jest src/lib/offline/__tests__/db.test.ts
```

- [ ] **Step 6: Commit**

```bash
git add src/lib/offline/db.ts src/stores/sync.store.ts
git commit -m "feat: add Dexie offline DB and sync store"
```

---

### Task 2: Sync Logic

**Files:**
- Create: `src/lib/offline/sync.ts`

- [ ] **Step 1: Write test `src/lib/offline/__tests__/sync.test.ts`**

```typescript
import { getPendingCount } from '@/lib/offline/sync'
import { offlineDb } from '@/lib/offline/db'

describe('getPendingCount', () => {
  beforeEach(async () => {
    await offlineDb.activities.clear()
    await offlineDb.harvests.clear()
  })

  it('returns 0 when no pending records', async () => {
    const count = await getPendingCount()
    expect(count).toBe(0)
  })

  it('counts pending activities and harvests', async () => {
    await offlineDb.activities.add({
      localId: 'a1', plotId: 'p1', userId: 'u1',
      date: new Date().toISOString(), type: 'ROCAGEM',
      responsible: 'João', confirmed: false,
      syncStatus: 'PENDING', createdAt: new Date().toISOString(),
    })
    await offlineDb.harvests.add({
      localId: 'h1', plotId: 'p1', userId: 'u1',
      date: new Date().toISOString(), quantity: 10,
      unit: 'CAIXA', pricePerUnit: 25, totalRevenue: 250,
      syncStatus: 'PENDING', createdAt: new Date().toISOString(),
    })
    const count = await getPendingCount()
    expect(count).toBe(2)
  })
})
```

- [ ] **Step 2: Run test — expect FAIL**

```bash
npx jest src/lib/offline/__tests__/sync.test.ts
```

- [ ] **Step 3: Create `src/lib/offline/sync.ts`**

```typescript
import { offlineDb } from './db'

export async function getPendingCount(): Promise<number> {
  const [activities, harvests] = await Promise.all([
    offlineDb.activities.where('syncStatus').equals('PENDING').count(),
    offlineDb.harvests.where('syncStatus').equals('PENDING').count(),
  ])
  return activities + harvests
}

export async function syncActivities(): Promise<void> {
  const pending = await offlineDb.activities
    .where('syncStatus').equals('PENDING')
    .toArray()

  for (const record of pending) {
    try {
      const res = await fetch('/api/activities', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(record),
      })

      if (res.status === 409) {
        await offlineDb.activities.update(record.localId, { syncStatus: 'CONFLICT' })
      } else if (res.ok) {
        await offlineDb.activities.update(record.localId, { syncStatus: 'SYNCED' })
      }
    } catch {
      // network error — leave as PENDING
    }
  }
}

export async function syncHarvests(): Promise<void> {
  const pending = await offlineDb.harvests
    .where('syncStatus').equals('PENDING')
    .toArray()

  for (const record of pending) {
    try {
      const res = await fetch('/api/harvests', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(record),
      })

      if (res.status === 409) {
        await offlineDb.harvests.update(record.localId, { syncStatus: 'CONFLICT' })
      } else if (res.ok) {
        await offlineDb.harvests.update(record.localId, { syncStatus: 'SYNCED' })
      }
    } catch {
      // network error — leave as PENDING
    }
  }
}

export async function syncAll(): Promise<void> {
  await Promise.all([syncActivities(), syncHarvests()])
}
```

- [ ] **Step 4: Run test — expect PASS**

```bash
npx jest src/lib/offline/__tests__/sync.test.ts
```

- [ ] **Step 5: Commit**

```bash
git add src/lib/offline/sync.ts
git commit -m "feat: add offline sync logic for activities and harvests"
```

---

### Task 3: SyncBadge with Live Count + Auto-Sync on Reconnect

**Files:**
- Modify: `src/components/layout/SyncBadge.tsx`
- Create: `src/hooks/useSync.ts`

- [ ] **Step 1: Create `src/hooks/useSync.ts`**

```typescript
'use client'

import { useEffect, useCallback } from 'react'
import { useSyncStore } from '@/stores/sync.store'
import { getPendingCount, syncAll } from '@/lib/offline/sync'

export function useSync() {
  const { pendingCount, isSyncing, setPending, setSyncing } = useSyncStore()

  const refresh = useCallback(async () => {
    const count = await getPendingCount()
    setPending(count)
  }, [setPending])

  const sync = useCallback(async () => {
    if (isSyncing) return
    setSyncing(true)
    await syncAll()
    await refresh()
    setSyncing(false)
  }, [isSyncing, setSyncing, refresh])

  useEffect(() => {
    refresh()
    window.addEventListener('online', sync)
    return () => window.removeEventListener('online', sync)
  }, [refresh, sync])

  return { pendingCount, isSyncing, sync, refresh }
}
```

- [ ] **Step 2: Update `src/components/layout/SyncBadge.tsx`**

```typescript
'use client'

import { useSync } from '@/hooks/useSync'

export function SyncBadge() {
  const { pendingCount, isSyncing, sync } = useSync()

  if (pendingCount === 0 && !isSyncing) return null

  return (
    <button
      onClick={sync}
      disabled={isSyncing}
      className="flex items-center gap-1 rounded-full bg-sync-pending px-2 py-0.5 text-xs text-white hover:opacity-90 disabled:opacity-60"
      title="Clique para sincronizar agora"
    >
      <svg
        className={`h-3 w-3 ${isSyncing ? 'animate-spin' : ''}`}
        fill="none" viewBox="0 0 24 24" stroke="currentColor"
      >
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
          d="M3 15a4 4 0 004 4h9a5 5 0 10-.1-9.999 5.002 5.002 0 10-9.78 2.096A4.001 4.001 0 003 15z" />
      </svg>
      {isSyncing ? 'Sync...' : pendingCount}
    </button>
  )
}
```

- [ ] **Step 3: Add SyncBadge to AppShell header — modify `src/components/layout/AppShell.tsx`**

```typescript
'use client'

import { Sidebar } from './Sidebar'
import { BottomNav } from './BottomNav'
import { SyncBadge } from './SyncBadge'

export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <div className="flex-1 flex flex-col">
        <header className="flex items-center justify-end gap-2 px-4 py-2 border-b bg-white md:hidden">
          <SyncBadge />
        </header>
        <main className="flex-1 overflow-auto pb-16 md:pb-0">
          {children}
        </main>
      </div>
      <BottomNav />
    </div>
  )
}
```

- [ ] **Step 4: Commit**

```bash
git add src/hooks/useSync.ts src/components/layout/
git commit -m "feat: add live sync badge with auto-sync on reconnect"
```

---

### Task 4: Activity API Routes

**Files:**
- Create: `src/lib/validations/activity.ts`
- Create: `src/app/api/activities/route.ts`
- Create: `src/app/api/activities/[id]/route.ts`

- [ ] **Step 1: Write test `src/lib/validations/__tests__/activity.test.ts`**

```typescript
import { createActivitySchema } from '@/lib/validations/activity'

describe('createActivitySchema', () => {
  const base = {
    localId: 'abc-123',
    plotId: 'plot-1',
    date: '2026-03-26T00:00:00.000Z',
    type: 'ROCAGEM',
    responsible: 'João',
    syncStatus: 'SYNCED',
  }

  it('accepts valid activity', () => {
    expect(createActivitySchema.safeParse(base).success).toBe(true)
  })

  it('requires localId', () => {
    const { localId, ...rest } = base
    expect(createActivitySchema.safeParse(rest).success).toBe(false)
  })

  it('rejects invalid type', () => {
    expect(createActivitySchema.safeParse({ ...base, type: 'VOAR' }).success).toBe(false)
  })
})
```

- [ ] **Step 2: Run test — expect FAIL**

```bash
npx jest src/lib/validations/__tests__/activity.test.ts
```

- [ ] **Step 3: Create `src/lib/validations/activity.ts`**

```typescript
import { z } from 'zod'

export const createActivitySchema = z.object({
  localId:     z.string().min(1),
  plotId:      z.string().min(1),
  date:        z.string().datetime(),
  type:        z.enum(['PULVERIZACAO', 'ROCAGEM', 'RETIRADA_BANANA', 'RETIRADA_CAIXAS', 'OUTRO']),
  responsible: z.string().min(1),
  quantity:    z.number().optional(),
  unit:        z.enum(['CAIXA', 'UNIDADE']).optional(),
  cost:        z.number().optional(),
  notes:       z.string().optional(),
  confirmed:   z.boolean().default(false),
  syncStatus:  z.enum(['PENDING', 'SYNCED', 'CONFLICT']).default('SYNCED'),
})

export const updateActivitySchema = createActivitySchema.partial()

export type CreateActivityInput = z.infer<typeof createActivitySchema>
```

- [ ] **Step 4: Create `src/app/api/activities/route.ts`**

```typescript
import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { db } from '@/lib/db'
import { createActivitySchema } from '@/lib/validations/activity'

export async function GET(req: Request) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { searchParams } = new URL(req.url)
  const plotId    = searchParams.get('plotId')
  const startDate = searchParams.get('startDate')
  const endDate   = searchParams.get('endDate')

  const activities = await db.activity.findMany({
    where: {
      ...(plotId    ? { plotId }    : {}),
      ...(startDate ? { date: { gte: new Date(startDate) } } : {}),
      ...(endDate   ? { date: { lte: new Date(endDate)   } } : {}),
    },
    include: { plot: { select: { code: true, name: true, productType: true } } },
    orderBy: { date: 'desc' },
  })

  return NextResponse.json(activities)
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body   = await req.json()
  const parsed = createActivitySchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 422 })
  }

  // Conflict check — same localId already exists
  const existing = await db.activity.findUnique({ where: { localId: parsed.data.localId } })
  if (existing) return NextResponse.json({ error: 'Conflict' }, { status: 409 })

  const activity = await db.activity.create({
    data: {
      ...parsed.data,
      date:   new Date(parsed.data.date),
      userId: (session.user as any).id ?? 'unknown',
    },
  })

  return NextResponse.json(activity, { status: 201 })
}
```

- [ ] **Step 5: Create `src/app/api/activities/[id]/route.ts`**

```typescript
import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { db } from '@/lib/db'
import { updateActivitySchema } from '@/lib/validations/activity'

export async function PUT(req: Request, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body   = await req.json()
  const parsed = updateActivitySchema.safeParse(body)
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 422 })

  const activity = await db.activity.update({
    where: { id: params.id },
    data:  { ...parsed.data, ...(parsed.data.date ? { date: new Date(parsed.data.date) } : {}) },
  })

  return NextResponse.json(activity)
}

export async function DELETE(_: Request, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  await db.activity.delete({ where: { id: params.id } })
  return new NextResponse(null, { status: 204 })
}
```

- [ ] **Step 6: Run validation tests — expect PASS**

```bash
npx jest src/lib/validations/__tests__/activity.test.ts
```

- [ ] **Step 7: Commit**

```bash
git add src/lib/validations/activity.ts src/app/api/activities/
git commit -m "feat: add activities API routes with conflict detection"
```

---

### Task 5: ActivityForm (Offline-Ready)

**Files:**
- Create: `src/components/activities/ActivityForm.tsx`
- Create: `src/app/(app)/atividades/novo/page.tsx`

- [ ] **Step 1: Write test `src/components/activities/__tests__/ActivityForm.test.tsx`**

```typescript
import { render, screen } from '@testing-library/react'
import { ActivityForm } from '@/components/activities/ActivityForm'

jest.mock('@tanstack/react-query', () => ({
  useQuery: () => ({ data: [{ id: 'p1', code: 'T01', name: 'Talhão 01', productType: 'BANANA_PRATA' }] }),
}))
jest.mock('next-auth/react', () => ({
  useSession: () => ({ data: { user: { id: 'u1', name: 'Admin' } } }),
}))
jest.mock('next/navigation', () => ({ useRouter: () => ({ back: jest.fn() }) }))

describe('ActivityForm', () => {
  it('renders talhão selector', () => {
    render(<ActivityForm />)
    expect(screen.getByLabelText(/talhão/i)).toBeInTheDocument()
  })

  it('renders activity type selector', () => {
    render(<ActivityForm />)
    expect(screen.getByLabelText(/tipo/i)).toBeInTheDocument()
  })

  it('renders responsible field', () => {
    render(<ActivityForm />)
    expect(screen.getByLabelText(/responsável/i)).toBeInTheDocument()
  })
})
```

- [ ] **Step 2: Run test — expect FAIL**

```bash
npx jest src/components/activities/__tests__/ActivityForm.test.tsx
```

- [ ] **Step 3: Create `src/components/activities/ActivityForm.tsx`**

```typescript
'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useQuery } from '@tanstack/react-query'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { z } from 'zod'
import { v4 as uuidv4 } from 'uuid'
import { offlineDb } from '@/lib/offline/db'
import { useSyncStore } from '@/stores/sync.store'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select'
import { ACTIVITY_LABELS } from '@/types'

const formSchema = z.object({
  plotId:      z.string().min(1, 'Selecione o talhão'),
  date:        z.string().min(1, 'Data obrigatória'),
  type:        z.string().min(1, 'Selecione o tipo'),
  responsible: z.string().min(1, 'Responsável obrigatório'),
  quantity:    z.number().optional(),
  unit:        z.string().optional(),
  cost:        z.number().optional(),
  notes:       z.string().optional(),
})

type FormValues = z.infer<typeof formSchema>

export function ActivityForm() {
  const router = useRouter()
  const { data: session } = useSession()
  const setPending = useSyncStore(s => s.setPending)
  const [saved, setSaved] = useState(false)

  const { data: plots } = useQuery({
    queryKey: ['plots'],
    queryFn:  () => fetch('/api/plots').then(r => r.json()),
  })

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: { date: new Date().toISOString().split('T')[0] },
  })

  async function onSubmit(values: FormValues) {
    const localId = uuidv4()
    const isOnline = navigator.onLine

    const record = {
      localId,
      plotId:      values.plotId,
      userId:      (session?.user as any)?.id ?? 'unknown',
      date:        new Date(values.date).toISOString(),
      type:        values.type,
      responsible: values.responsible,
      quantity:    values.quantity,
      unit:        values.unit,
      cost:        values.cost,
      notes:       values.notes,
      confirmed:   false,
      syncStatus:  'PENDING' as const,
      createdAt:   new Date().toISOString(),
    }

    // Always save locally first
    await offlineDb.activities.add(record)

    if (isOnline) {
      try {
        const res = await fetch('/api/activities', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ ...record, syncStatus: 'SYNCED' }),
        })
        if (res.ok) {
          await offlineDb.activities.update(localId, { syncStatus: 'SYNCED' })
        }
      } catch {
        // offline — stays PENDING
      }
    }

    const pending = await offlineDb.activities.where('syncStatus').equals('PENDING').count()
    const pendingH = await offlineDb.harvests.where('syncStatus').equals('PENDING').count()
    setPending(pending + pendingH)

    setSaved(true)
    setTimeout(() => router.back(), 1200)
  }

  if (saved) return (
    <div className="text-center py-8">
      <p className="text-2xl mb-2">✅</p>
      <p className="text-primary font-medium">Atividade registrada!</p>
      <p className="text-sm text-muted-foreground">
        {navigator.onLine ? 'Sincronizado.' : 'Será sincronizado quando houver conexão.'}
      </p>
    </div>
  )

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 max-w-lg">
      <div className="space-y-2">
        <Label htmlFor="plotId">Talhão *</Label>
        <Select onValueChange={(v) => form.setValue('plotId', v)}>
          <SelectTrigger id="plotId">
            <SelectValue placeholder="Selecione o talhão" />
          </SelectTrigger>
          <SelectContent>
            {(plots ?? []).map((p: any) => (
              <SelectItem key={p.id} value={p.id}>{p.code} — {p.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        {form.formState.errors.plotId && (
          <p className="text-xs text-destructive">{form.formState.errors.plotId.message}</p>
        )}
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="date">Data *</Label>
          <Input id="date" type="date" {...form.register('date')} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="type">Tipo *</Label>
          <Select onValueChange={(v) => form.setValue('type', v)}>
            <SelectTrigger id="type">
              <SelectValue placeholder="Tipo de atividade" />
            </SelectTrigger>
            <SelectContent>
              {Object.entries(ACTIVITY_LABELS).map(([value, label]) => (
                <SelectItem key={value} value={value}>{label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="responsible">Responsável *</Label>
        <Input id="responsible" {...form.register('responsible')} placeholder="Nome do responsável" />
        {form.formState.errors.responsible && (
          <p className="text-xs text-destructive">{form.formState.errors.responsible.message}</p>
        )}
      </div>

      <details className="border rounded-lg p-3">
        <summary className="cursor-pointer text-sm text-muted-foreground">Mais detalhes (opcional)</summary>
        <div className="pt-3 space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label htmlFor="quantity">Quantidade</Label>
              <Input id="quantity" type="number" step="0.01"
                {...form.register('quantity', { valueAsNumber: true })} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="unit">Unidade</Label>
              <Select onValueChange={(v) => form.setValue('unit', v)}>
                <SelectTrigger id="unit"><SelectValue placeholder="Unidade" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="CAIXA">Caixa</SelectItem>
                  <SelectItem value="UNIDADE">Unidade</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="cost">Custo (R$)</Label>
            <Input id="cost" type="number" step="0.01"
              {...form.register('cost', { valueAsNumber: true })} placeholder="0,00" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="notes">Observações</Label>
            <Textarea id="notes" {...form.register('notes')} rows={2} />
          </div>
        </div>
      </details>

      <Button type="submit" className="w-full bg-primary hover:bg-primary-800">
        Registrar Atividade
      </Button>
    </form>
  )
}
```

- [ ] **Step 4: Install uuid**

```bash
npm install uuid
npm install -D @types/uuid
```

- [ ] **Step 5: Create `src/app/(app)/atividades/novo/page.tsx`**

```typescript
import { ActivityForm } from '@/components/activities/ActivityForm'

export default function NovaAtividadePage() {
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold text-primary mb-1">Registrar Atividade</h1>
      <p className="text-sm text-muted-foreground mb-6">Funciona mesmo sem internet</p>
      <ActivityForm />
    </div>
  )
}
```

- [ ] **Step 6: Run tests — expect PASS**

```bash
npx jest src/components/activities/__tests__/ActivityForm.test.tsx
```

- [ ] **Step 7: Commit**

```bash
git add src/components/activities/ src/app/\(app\)/atividades/
git commit -m "feat: add offline-first ActivityForm"
```

---

### Task 6: Harvest API + HarvestForm

**Files:**
- Create: `src/lib/validations/harvest.ts`
- Create: `src/app/api/harvests/route.ts`
- Create: `src/app/api/harvests/[id]/route.ts`
- Create: `src/components/harvests/HarvestForm.tsx`
- Create: `src/app/(app)/producao/novo/page.tsx`

- [ ] **Step 1: Write test `src/lib/validations/__tests__/harvest.test.ts`**

```typescript
import { createHarvestSchema } from '@/lib/validations/harvest'

describe('createHarvestSchema', () => {
  const base = {
    localId: 'h-123',
    plotId: 'p1',
    date: '2026-03-26T00:00:00.000Z',
    quantity: 50,
    unit: 'CAIXA',
    pricePerUnit: 25,
    totalRevenue: 1250,
  }

  it('accepts valid harvest', () => {
    expect(createHarvestSchema.safeParse(base).success).toBe(true)
  })

  it('rejects negative quantity', () => {
    expect(createHarvestSchema.safeParse({ ...base, quantity: -1 }).success).toBe(false)
  })

  it('rejects invalid unit', () => {
    expect(createHarvestSchema.safeParse({ ...base, unit: 'KILO' }).success).toBe(false)
  })
})
```

- [ ] **Step 2: Run test — expect FAIL**

```bash
npx jest src/lib/validations/__tests__/harvest.test.ts
```

- [ ] **Step 3: Create `src/lib/validations/harvest.ts`**

```typescript
import { z } from 'zod'

export const createHarvestSchema = z.object({
  localId:      z.string().min(1),
  plotId:       z.string().min(1),
  date:         z.string().datetime(),
  quantity:     z.number().positive('Quantidade deve ser positiva'),
  unit:         z.enum(['CAIXA', 'UNIDADE']),
  pricePerUnit: z.number().nonnegative(),
  totalRevenue: z.number().nonnegative(),
  notes:        z.string().optional(),
  syncStatus:   z.enum(['PENDING', 'SYNCED', 'CONFLICT']).default('SYNCED'),
})

export const updateHarvestSchema = createHarvestSchema.partial()

export type CreateHarvestInput = z.infer<typeof createHarvestSchema>
```

- [ ] **Step 4: Create `src/app/api/harvests/route.ts`**

```typescript
import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { db } from '@/lib/db'
import { createHarvestSchema } from '@/lib/validations/harvest'

export async function GET(req: Request) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { searchParams } = new URL(req.url)
  const plotId    = searchParams.get('plotId')
  const startDate = searchParams.get('startDate')
  const endDate   = searchParams.get('endDate')

  const harvests = await db.harvest.findMany({
    where: {
      ...(plotId    ? { plotId }    : {}),
      ...(startDate ? { date: { gte: new Date(startDate) } } : {}),
      ...(endDate   ? { date: { lte: new Date(endDate)   } } : {}),
    },
    include: { plot: { select: { code: true, name: true, productType: true } } },
    orderBy: { date: 'desc' },
  })

  return NextResponse.json(harvests)
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body   = await req.json()
  const parsed = createHarvestSchema.safeParse(body)
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 422 })

  const existing = await db.harvest.findUnique({ where: { localId: parsed.data.localId } })
  if (existing) return NextResponse.json({ error: 'Conflict' }, { status: 409 })

  const harvest = await db.harvest.create({
    data: {
      ...parsed.data,
      date:   new Date(parsed.data.date),
      userId: (session.user as any).id ?? 'unknown',
    },
  })

  return NextResponse.json(harvest, { status: 201 })
}
```

- [ ] **Step 5: Create `src/app/api/harvests/[id]/route.ts`**

```typescript
import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { db } from '@/lib/db'
import { updateHarvestSchema } from '@/lib/validations/harvest'

export async function PUT(req: Request, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body   = await req.json()
  const parsed = updateHarvestSchema.safeParse(body)
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 422 })

  const harvest = await db.harvest.update({
    where: { id: params.id },
    data:  { ...parsed.data, ...(parsed.data.date ? { date: new Date(parsed.data.date) } : {}) },
  })

  return NextResponse.json(harvest)
}

export async function DELETE(_: Request, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  await db.harvest.delete({ where: { id: params.id } })
  return new NextResponse(null, { status: 204 })
}
```

- [ ] **Step 6: Create `src/components/harvests/HarvestForm.tsx`**

```typescript
'use client'

import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useQuery } from '@tanstack/react-query'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { z } from 'zod'
import { v4 as uuidv4 } from 'uuid'
import { offlineDb } from '@/lib/offline/db'
import { useSyncStore } from '@/stores/sync.store'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select'

const formSchema = z.object({
  plotId:       z.string().min(1, 'Selecione o talhão'),
  date:         z.string().min(1),
  quantity:     z.number().positive('Deve ser maior que zero'),
  unit:         z.string().min(1),
  pricePerUnit: z.number().nonnegative(),
  notes:        z.string().optional(),
})

type FormValues = z.infer<typeof formSchema>

export function HarvestForm() {
  const router = useRouter()
  const { data: session } = useSession()
  const setPending = useSyncStore(s => s.setPending)
  const [saved, setSaved] = useState(false)
  const [selectedPlot, setSelectedPlot] = useState<any>(null)

  const { data: plots } = useQuery({
    queryKey: ['plots'],
    queryFn:  () => fetch('/api/plots').then(r => r.json()),
  })

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      date: new Date().toISOString().split('T')[0],
      unit: 'CAIXA',
      pricePerUnit: 0,
    },
  })

  const quantity     = form.watch('quantity')     ?? 0
  const pricePerUnit = form.watch('pricePerUnit') ?? 0
  const totalRevenue = quantity * pricePerUnit

  // When plot changes, set default unit based on product
  function handlePlotChange(plotId: string) {
    form.setValue('plotId', plotId)
    const plot = (plots ?? []).find((p: any) => p.id === plotId)
    setSelectedPlot(plot)
    if (plot?.productType === 'PITAYA') {
      // keep user choice
    } else {
      form.setValue('unit', 'CAIXA')
    }
  }

  async function onSubmit(values: FormValues) {
    const localId = uuidv4()
    const isOnline = navigator.onLine
    const total = values.quantity * values.pricePerUnit

    const record = {
      localId,
      plotId:       values.plotId,
      userId:       (session?.user as any)?.id ?? 'unknown',
      date:         new Date(values.date).toISOString(),
      quantity:     values.quantity,
      unit:         values.unit,
      pricePerUnit: values.pricePerUnit,
      totalRevenue: total,
      notes:        values.notes,
      syncStatus:   'PENDING' as const,
      createdAt:    new Date().toISOString(),
    }

    await offlineDb.harvests.add(record)

    if (isOnline) {
      try {
        const res = await fetch('/api/harvests', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ ...record, syncStatus: 'SYNCED' }),
        })
        if (res.ok) await offlineDb.harvests.update(localId, { syncStatus: 'SYNCED' })
      } catch { /* stays PENDING */ }
    }

    const pa = await offlineDb.activities.where('syncStatus').equals('PENDING').count()
    const ph = await offlineDb.harvests.where('syncStatus').equals('PENDING').count()
    setPending(pa + ph)

    setSaved(true)
    setTimeout(() => router.back(), 1200)
  }

  if (saved) return (
    <div className="text-center py-8">
      <p className="text-2xl mb-2">✅</p>
      <p className="text-primary font-medium">Colheita registrada!</p>
      <p className="text-sm text-muted-foreground">
        {navigator.onLine ? 'Sincronizado.' : 'Será sincronizado quando houver conexão.'}
      </p>
    </div>
  )

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 max-w-lg">
      <div className="space-y-2">
        <Label htmlFor="plotId">Talhão *</Label>
        <Select onValueChange={handlePlotChange}>
          <SelectTrigger id="plotId">
            <SelectValue placeholder="Selecione o talhão" />
          </SelectTrigger>
          <SelectContent>
            {(plots ?? []).map((p: any) => (
              <SelectItem key={p.id} value={p.id}>{p.code} — {p.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        {form.formState.errors.plotId && (
          <p className="text-xs text-destructive">{form.formState.errors.plotId.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="date">Data *</Label>
        <Input id="date" type="date" {...form.register('date')} />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="quantity">Quantidade *</Label>
          <Input id="quantity" type="number" step="0.01"
            {...form.register('quantity', { valueAsNumber: true })} placeholder="0" />
          {form.formState.errors.quantity && (
            <p className="text-xs text-destructive">{form.formState.errors.quantity.message}</p>
          )}
        </div>
        <div className="space-y-2">
          <Label htmlFor="unit">Unidade *</Label>
          <Select
            defaultValue="CAIXA"
            onValueChange={(v) => form.setValue('unit', v)}
            disabled={selectedPlot?.productType !== 'PITAYA'}
          >
            <SelectTrigger id="unit"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="CAIXA">Caixa</SelectItem>
              {selectedPlot?.productType === 'PITAYA' && (
                <SelectItem value="UNIDADE">Unidade</SelectItem>
              )}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="pricePerUnit">Preço por unidade (R$) *</Label>
        <Input id="pricePerUnit" type="number" step="0.01"
          {...form.register('pricePerUnit', { valueAsNumber: true })} placeholder="0,00" />
      </div>

      {quantity > 0 && pricePerUnit > 0 && (
        <div className="rounded-lg bg-primary/10 p-3 text-sm">
          <span className="text-muted-foreground">Receita estimada: </span>
          <span className="font-semibold text-primary">
            R$ {totalRevenue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
          </span>
        </div>
      )}

      <div className="space-y-2">
        <Label htmlFor="notes">Observações</Label>
        <Textarea id="notes" {...form.register('notes')} rows={2} />
      </div>

      <Button type="submit" className="w-full bg-primary hover:bg-primary-800">
        Registrar Colheita
      </Button>
    </form>
  )
}
```

- [ ] **Step 7: Create `src/app/(app)/producao/novo/page.tsx`**

```typescript
import { HarvestForm } from '@/components/harvests/HarvestForm'

export default function NovaColheitaPage() {
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold text-primary mb-1">Registrar Colheita</h1>
      <p className="text-sm text-muted-foreground mb-6">Funciona mesmo sem internet</p>
      <HarvestForm />
    </div>
  )
}
```

- [ ] **Step 8: Run harvest validation tests — expect PASS**

```bash
npx jest src/lib/validations/__tests__/harvest.test.ts
```

- [ ] **Step 9: Commit**

```bash
git add src/lib/validations/harvest.ts src/app/api/harvests/ src/components/harvests/ src/app/\(app\)/producao/
git commit -m "feat: add offline-first HarvestForm with revenue preview"
```

---

## Phase 3 Complete

At this point you have:
- Dexie offline DB for activities and harvests
- Sync logic with conflict detection
- Live SyncBadge + auto-sync on reconnect
- ActivityForm (offline-ready, expandable)
- HarvestForm (offline-ready, adapts unit by product type)
- Full API routes for activities and harvests

**Next:** Phase 4 — Dashboard + Activity/Harvest history lists + Reports
