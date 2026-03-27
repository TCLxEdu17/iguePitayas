# IGUE Bananas — Phase 2: Talhões + Mapa

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** CRUD completo de talhões + mapa interativo com upload de planta e desenho de polígonos via Konva.js.

**Architecture:** API Routes REST para talhões. Canvas Konva.js para o mapa — imagem de fundo + camada de polígonos editáveis. Polígonos salvos como pontos `{x,y}` relativos à imagem.

**Tech Stack:** Next.js API Routes, Prisma, Konva.js + react-konva, Zod, React Hook Form, TanStack Query

**Prerequisite:** Phase 1 complete, database running, auth working.

---

## File Map

```
src/
├── app/
│   ├── (app)/
│   │   └── talhoes/
│   │       ├── page.tsx              # lista de talhões
│   │       ├── mapa/page.tsx         # mapa interativo
│   │       └── [id]/page.tsx         # detalhe do talhão
│   └── api/
│       ├── plots/
│       │   ├── route.ts              # GET list, POST create
│       │   └── [id]/route.ts         # GET, PUT, DELETE
│       └── farm/
│           ├── route.ts              # GET farm info
│           └── map/route.ts          # POST upload map image
├── components/
│   ├── plots/
│   │   ├── PlotCard.tsx
│   │   ├── PlotForm.tsx
│   │   ├── PlotList.tsx
│   │   └── PlotMap.tsx               # Konva canvas
│   └── ui/product-badge.tsx
└── lib/
    └── validations/plot.ts
```

---

### Task 1: Plot API Routes

**Files:**
- Create: `src/lib/validations/plot.ts`
- Create: `src/app/api/plots/route.ts`
- Create: `src/app/api/plots/[id]/route.ts`

- [ ] **Step 1: Write test `src/app/api/plots/__tests__/route.test.ts`**

```typescript
import { createPlotSchema, updatePlotSchema } from '@/lib/validations/plot'

describe('plot validation', () => {
  it('requires code, name, productType', () => {
    const result = createPlotSchema.safeParse({})
    expect(result.success).toBe(false)
    const fields = result.error?.issues.map(i => i.path[0])
    expect(fields).toContain('code')
    expect(fields).toContain('name')
    expect(fields).toContain('productType')
  })

  it('accepts valid plot', () => {
    const result = createPlotSchema.safeParse({
      code: 'T01',
      name: 'Talhão 01',
      productType: 'BANANA_PRATA',
      area: 1500,
    })
    expect(result.success).toBe(true)
  })

  it('rejects invalid productType', () => {
    const result = createPlotSchema.safeParse({
      code: 'T01',
      name: 'Talhão 01',
      productType: 'MANGA',
    })
    expect(result.success).toBe(false)
  })
})
```

- [ ] **Step 2: Run test — expect FAIL**

```bash
npx jest src/app/api/plots/__tests__/route.test.ts
```

- [ ] **Step 3: Create `src/lib/validations/plot.ts`**

```typescript
import { z } from 'zod'

export const createPlotSchema = z.object({
  code:        z.string().min(1, 'Código obrigatório'),
  name:        z.string().min(1, 'Nome obrigatório'),
  productType: z.enum(['BANANA_PRATA', 'BANANA_NANICA', 'PITAYA']),
  area:        z.number().positive().optional(),
  status:      z.enum(['ACTIVE', 'INACTIVE', 'MAINTENANCE']).default('ACTIVE'),
  notes:       z.string().optional(),
  polygon:     z.array(z.object({ x: z.number(), y: z.number() })).optional(),
})

export const updatePlotSchema = createPlotSchema.partial()

export type CreatePlotInput = z.infer<typeof createPlotSchema>
export type UpdatePlotInput = z.infer<typeof updatePlotSchema>
```

- [ ] **Step 4: Create `src/app/api/plots/route.ts`**

```typescript
import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { db } from '@/lib/db'
import { createPlotSchema } from '@/lib/validations/plot'

export async function GET() {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const plots = await db.plot.findMany({
    orderBy: { code: 'asc' },
    include: {
      _count: { select: { activities: true, harvests: true } },
    },
  })

  return NextResponse.json(plots)
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  if ((session.user as any).role !== 'ADMIN') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const body = await req.json()
  const parsed = createPlotSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 422 })
  }

  const farm = await db.farm.findFirst()
  if (!farm) return NextResponse.json({ error: 'Farm not configured' }, { status: 400 })

  const plot = await db.plot.create({
    data: { ...parsed.data, farmId: farm.id },
  })

  return NextResponse.json(plot, { status: 201 })
}
```

- [ ] **Step 5: Create `src/app/api/plots/[id]/route.ts`**

```typescript
import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { db } from '@/lib/db'
import { updatePlotSchema } from '@/lib/validations/plot'

export async function GET(_: Request, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const plot = await db.plot.findUnique({
    where: { id: params.id },
    include: {
      activities: { orderBy: { date: 'desc' }, take: 10 },
      harvests:   { orderBy: { date: 'desc' }, take: 10 },
    },
  })

  if (!plot) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  return NextResponse.json(plot)
}

export async function PUT(req: Request, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  if ((session.user as any).role !== 'ADMIN') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const body = await req.json()
  const parsed = updatePlotSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 422 })
  }

  const plot = await db.plot.update({
    where: { id: params.id },
    data:  parsed.data,
  })

  return NextResponse.json(plot)
}

export async function DELETE(_: Request, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  if ((session.user as any).role !== 'ADMIN') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  await db.plot.delete({ where: { id: params.id } })
  return new NextResponse(null, { status: 204 })
}
```

- [ ] **Step 6: Run validation tests — expect PASS**

```bash
npx jest src/app/api/plots/__tests__/
```

- [ ] **Step 7: Commit**

```bash
git add src/app/api/plots/ src/lib/validations/plot.ts
git commit -m "feat: add plots API routes with validation"
```

---

### Task 2: ProductBadge Component

**Files:**
- Create: `src/components/ui/product-badge.tsx`

- [ ] **Step 1: Write test**

```typescript
// src/components/ui/__tests__/product-badge.test.tsx
import { render, screen } from '@testing-library/react'
import { ProductBadge } from '@/components/ui/product-badge'

describe('ProductBadge', () => {
  it('renders Banana Prata label', () => {
    render(<ProductBadge productType="BANANA_PRATA" />)
    expect(screen.getByText('Banana Prata')).toBeInTheDocument()
  })

  it('renders Pitaya label', () => {
    render(<ProductBadge productType="PITAYA" />)
    expect(screen.getByText('Pitaya')).toBeInTheDocument()
  })
})
```

- [ ] **Step 2: Run test — expect FAIL**

```bash
npx jest src/components/ui/__tests__/product-badge.test.tsx
```

- [ ] **Step 3: Create `src/components/ui/product-badge.tsx`**

```typescript
import { PRODUCT_LABELS, PRODUCT_COLORS } from '@/types'

interface ProductBadgeProps {
  productType: string
  className?: string
}

export function ProductBadge({ productType, className }: ProductBadgeProps) {
  const label = PRODUCT_LABELS[productType] ?? productType
  const color = PRODUCT_COLORS[productType] ?? '#888'

  return (
    <span
      className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium text-white ${className}`}
      style={{ backgroundColor: color }}
    >
      {label}
    </span>
  )
}
```

- [ ] **Step 4: Run test — expect PASS**

```bash
npx jest src/components/ui/__tests__/product-badge.test.tsx
```

- [ ] **Step 5: Commit**

```bash
git add src/components/ui/product-badge.tsx
git commit -m "feat: add ProductBadge component"
```

---

### Task 3: PlotCard + PlotList + Plots Page

**Files:**
- Create: `src/components/plots/PlotCard.tsx`
- Create: `src/components/plots/PlotList.tsx`
- Create: `src/app/(app)/talhoes/page.tsx`

- [ ] **Step 1: Write test `src/components/plots/__tests__/PlotCard.test.tsx`**

```typescript
import { render, screen } from '@testing-library/react'
import { PlotCard } from '@/components/plots/PlotCard'

const mockPlot = {
  id: '1',
  code: 'T01',
  name: 'Talhão 01',
  productType: 'BANANA_PRATA',
  area: 1500,
  status: 'ACTIVE',
  farmId: 'f1',
  polygon: null,
  notes: null,
  createdAt: new Date(),
  updatedAt: new Date(),
}

describe('PlotCard', () => {
  it('renders plot code and name', () => {
    render(<PlotCard plot={mockPlot as any} />)
    expect(screen.getByText('T01')).toBeInTheDocument()
    expect(screen.getByText('Talhão 01')).toBeInTheDocument()
  })

  it('renders product badge', () => {
    render(<PlotCard plot={mockPlot as any} />)
    expect(screen.getByText('Banana Prata')).toBeInTheDocument()
  })

  it('renders area when provided', () => {
    render(<PlotCard plot={mockPlot as any} />)
    expect(screen.getByText(/1500/)).toBeInTheDocument()
  })
})
```

- [ ] **Step 2: Run test — expect FAIL**

```bash
npx jest src/components/plots/__tests__/PlotCard.test.tsx
```

- [ ] **Step 3: Create `src/components/plots/PlotCard.tsx`**

```typescript
import Link from 'next/link'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { ProductBadge } from '@/components/ui/product-badge'
import type { Plot } from '@/types'

interface PlotCardProps {
  plot: Plot & { _count?: { activities: number; harvests: number } }
}

const STATUS_LABELS: Record<string, string> = {
  ACTIVE:      'Ativo',
  INACTIVE:    'Inativo',
  MAINTENANCE: 'Manutenção',
}

const STATUS_VARIANTS: Record<string, 'default' | 'secondary' | 'destructive'> = {
  ACTIVE:      'default',
  INACTIVE:    'secondary',
  MAINTENANCE: 'destructive',
}

export function PlotCard({ plot }: PlotCardProps) {
  return (
    <Link href={`/talhoes/${plot.id}`}>
      <Card className="hover:border-primary/40 transition-colors cursor-pointer">
        <CardHeader className="pb-2">
          <div className="flex items-start justify-between">
            <div>
              <span className="text-xs font-mono text-muted-foreground">{plot.code}</span>
              <h3 className="font-semibold text-primary">{plot.name}</h3>
            </div>
            <Badge variant={STATUS_VARIANTS[plot.status]}>
              {STATUS_LABELS[plot.status]}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-2">
          <ProductBadge productType={plot.productType} />
          {plot.area && (
            <p className="text-sm text-muted-foreground">
              {plot.area.toLocaleString('pt-BR')} m²
            </p>
          )}
          {plot._count && (
            <p className="text-xs text-muted-foreground">
              {plot._count.activities} atividades · {plot._count.harvests} colheitas
            </p>
          )}
        </CardContent>
      </Card>
    </Link>
  )
}
```

- [ ] **Step 4: Create `src/components/plots/PlotList.tsx`**

```typescript
'use client'

import { useQuery } from '@tanstack/react-query'
import { PlotCard } from './PlotCard'
import { Button } from '@/components/ui/button'
import Link from 'next/link'

async function fetchPlots() {
  const res = await fetch('/api/plots')
  if (!res.ok) throw new Error('Failed to fetch plots')
  return res.json()
}

export function PlotList() {
  const { data: plots, isLoading, error } = useQuery({
    queryKey: ['plots'],
    queryFn: fetchPlots,
  })

  if (isLoading) return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {[1,2,3].map(i => (
        <div key={i} className="h-32 rounded-lg bg-muted animate-pulse" />
      ))}
    </div>
  )

  if (error) return (
    <p className="text-destructive text-sm">Erro ao carregar talhões.</p>
  )

  if (!plots?.length) return (
    <div className="text-center py-12">
      <p className="text-muted-foreground mb-4">Nenhum talhão cadastrado ainda.</p>
      <Button asChild className="bg-primary hover:bg-primary-800">
        <Link href="/talhoes/novo">Cadastrar primeiro talhão</Link>
      </Button>
    </div>
  )

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {plots.map((plot: any) => (
        <PlotCard key={plot.id} plot={plot} />
      ))}
    </div>
  )
}
```

- [ ] **Step 5: Create `src/app/(app)/talhoes/page.tsx`**

```typescript
import { Button } from '@/components/ui/button'
import { PlotList } from '@/components/plots/PlotList'
import Link from 'next/link'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

export default async function TalhоesPage() {
  const session = await getServerSession(authOptions)
  const isAdmin = (session?.user as any)?.role === 'ADMIN'

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-primary">Talhões</h1>
          <p className="text-muted-foreground text-sm">Gerencie os talhões do sítio</p>
        </div>
        <div className="flex gap-2">
          <Button asChild variant="outline">
            <Link href="/talhoes/mapa">Ver Mapa</Link>
          </Button>
          {isAdmin && (
            <Button asChild className="bg-primary hover:bg-primary-800">
              <Link href="/talhoes/novo">+ Novo Talhão</Link>
            </Button>
          )}
        </div>
      </div>
      <PlotList />
    </div>
  )
}
```

- [ ] **Step 6: Run tests — expect PASS**

```bash
npx jest src/components/plots/__tests__/PlotCard.test.tsx
```

- [ ] **Step 7: Commit**

```bash
git add src/components/plots/ src/app/\(app\)/talhoes/page.tsx
git commit -m "feat: add PlotCard, PlotList, and talhões page"
```

---

### Task 4: PlotForm (Create/Edit)

**Files:**
- Create: `src/components/plots/PlotForm.tsx`
- Create: `src/app/(app)/talhoes/novo/page.tsx`
- Create: `src/app/(app)/talhoes/[id]/editar/page.tsx`

- [ ] **Step 1: Write test `src/components/plots/__tests__/PlotForm.test.tsx`**

```typescript
import { render, screen, fireEvent } from '@testing-library/react'
import { PlotForm } from '@/components/plots/PlotForm'

const mockMutate = jest.fn()
jest.mock('@tanstack/react-query', () => ({
  useMutation: () => ({ mutate: mockMutate, isPending: false }),
  useQueryClient: () => ({ invalidateQueries: jest.fn() }),
}))
jest.mock('next/navigation', () => ({ useRouter: () => ({ push: jest.fn() }) }))

describe('PlotForm', () => {
  it('renders all required fields', () => {
    render(<PlotForm />)
    expect(screen.getByLabelText(/código/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/nome/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/produto/i)).toBeInTheDocument()
  })

  it('shows validation error when code is empty', async () => {
    render(<PlotForm />)
    fireEvent.click(screen.getByRole('button', { name: /salvar/i }))
    expect(await screen.findByText(/código obrigatório/i)).toBeInTheDocument()
  })
})
```

- [ ] **Step 2: Run test — expect FAIL**

```bash
npx jest src/components/plots/__tests__/PlotForm.test.tsx
```

- [ ] **Step 3: Create `src/components/plots/PlotForm.tsx`**

```typescript
'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useRouter } from 'next/navigation'
import { createPlotSchema, type CreatePlotInput } from '@/lib/validations/plot'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select'

interface PlotFormProps {
  defaultValues?: Partial<CreatePlotInput>
  plotId?: string
}

export function PlotForm({ defaultValues, plotId }: PlotFormProps) {
  const router = useRouter()
  const queryClient = useQueryClient()

  const form = useForm<CreatePlotInput>({
    resolver: zodResolver(createPlotSchema),
    defaultValues: defaultValues ?? { status: 'ACTIVE' },
  })

  const mutation = useMutation({
    mutationFn: async (data: CreatePlotInput) => {
      const url    = plotId ? `/api/plots/${plotId}` : '/api/plots'
      const method = plotId ? 'PUT' : 'POST'
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
      if (!res.ok) throw new Error('Falha ao salvar talhão')
      return res.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['plots'] })
      router.push('/talhoes')
    },
  })

  return (
    <form onSubmit={form.handleSubmit((d) => mutation.mutate(d))} className="space-y-4 max-w-lg">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="code">Código *</Label>
          <Input id="code" {...form.register('code')} placeholder="T01" />
          {form.formState.errors.code && (
            <p className="text-xs text-destructive">{form.formState.errors.code.message}</p>
          )}
        </div>
        <div className="space-y-2">
          <Label htmlFor="name">Nome *</Label>
          <Input id="name" {...form.register('name')} placeholder="Talhão 01" />
          {form.formState.errors.name && (
            <p className="text-xs text-destructive">{form.formState.errors.name.message}</p>
          )}
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="productType">Produto *</Label>
        <Select
          defaultValue={defaultValues?.productType}
          onValueChange={(v) => form.setValue('productType', v as any)}
        >
          <SelectTrigger id="productType">
            <SelectValue placeholder="Selecione o produto" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="BANANA_PRATA">Banana Prata</SelectItem>
            <SelectItem value="BANANA_NANICA">Banana Nanica</SelectItem>
            <SelectItem value="PITAYA">Pitaya</SelectItem>
          </SelectContent>
        </Select>
        {form.formState.errors.productType && (
          <p className="text-xs text-destructive">{form.formState.errors.productType.message}</p>
        )}
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="area">Área (m²)</Label>
          <Input
            id="area"
            type="number"
            {...form.register('area', { valueAsNumber: true })}
            placeholder="1500"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="status">Status</Label>
          <Select
            defaultValue={defaultValues?.status ?? 'ACTIVE'}
            onValueChange={(v) => form.setValue('status', v as any)}
          >
            <SelectTrigger id="status">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ACTIVE">Ativo</SelectItem>
              <SelectItem value="INACTIVE">Inativo</SelectItem>
              <SelectItem value="MAINTENANCE">Manutenção</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="notes">Observações</Label>
        <Textarea id="notes" {...form.register('notes')} rows={3} />
      </div>

      {mutation.isError && (
        <p className="text-sm text-destructive">Erro ao salvar. Tente novamente.</p>
      )}

      <div className="flex gap-2">
        <Button type="submit" className="bg-primary hover:bg-primary-800" disabled={mutation.isPending}>
          {mutation.isPending ? 'Salvando...' : 'Salvar'}
        </Button>
        <Button type="button" variant="outline" onClick={() => router.back()}>
          Cancelar
        </Button>
      </div>
    </form>
  )
}
```

- [ ] **Step 4: Create `src/app/(app)/talhoes/novo/page.tsx`**

```typescript
import { PlotForm } from '@/components/plots/PlotForm'

export default function NovoTalhaoPage() {
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold text-primary mb-6">Novo Talhão</h1>
      <PlotForm />
    </div>
  )
}
```

- [ ] **Step 5: Run tests — expect PASS**

```bash
npx jest src/components/plots/__tests__/PlotForm.test.tsx
```

- [ ] **Step 6: Commit**

```bash
git add src/components/plots/PlotForm.tsx src/app/\(app\)/talhoes/
git commit -m "feat: add PlotForm with validation"
```

---

### Task 5: Map Upload API + Konva Canvas

**Files:**
- Create: `src/app/api/farm/map/route.ts`
- Create: `src/components/plots/PlotMap.tsx`
- Create: `src/app/(app)/talhoes/mapa/page.tsx`

- [ ] **Step 1: Create `src/app/api/farm/map/route.ts`**

```typescript
import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { db } from '@/lib/db'
import { writeFile, mkdir } from 'fs/promises'
import path from 'path'

export async function POST(req: Request) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  if ((session.user as any).role !== 'ADMIN') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const formData = await req.formData()
  const file = formData.get('file') as File | null
  if (!file) return NextResponse.json({ error: 'No file' }, { status: 400 })

  const allowed = ['image/jpeg', 'image/png', 'image/webp']
  if (!allowed.includes(file.type)) {
    return NextResponse.json({ error: 'Tipo de arquivo não permitido. Use JPG, PNG ou WebP.' }, { status: 400 })
  }

  const bytes  = await file.arrayBuffer()
  const buffer = Buffer.from(bytes)

  const uploadDir = path.join(process.cwd(), 'public', 'uploads', 'maps')
  await mkdir(uploadDir, { recursive: true })

  const filename = `map-${Date.now()}${path.extname(file.name)}`
  const filepath  = path.join(uploadDir, filename)
  await writeFile(filepath, buffer)

  const mapImageUrl = `/uploads/maps/${filename}`

  let farm = await db.farm.findFirst()
  if (!farm) {
    farm = await db.farm.create({ data: { name: 'IGUE Bananas', mapImageUrl } })
  } else {
    farm = await db.farm.update({ where: { id: farm.id }, data: { mapImageUrl } })
  }

  return NextResponse.json({ mapImageUrl })
}

export async function GET() {
  const farm = await db.farm.findFirst({
    include: { plots: true },
  })
  return NextResponse.json(farm)
}
```

- [ ] **Step 2: Create `src/components/plots/PlotMap.tsx`**

```typescript
'use client'

import { useEffect, useRef, useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Stage, Layer, Image as KonvaImage, Line, Circle, Text } from 'react-konva'
import useImage from 'use-image'
import { PRODUCT_COLORS } from '@/types'
import { Button } from '@/components/ui/button'

interface Point { x: number; y: number }

interface PlotPolygon {
  id: string
  code: string
  name: string
  productType: string
  polygon: Point[] | null
}

async function fetchFarm() {
  const res = await fetch('/api/farm/map')
  return res.json()
}

async function savePlotPolygon({ plotId, polygon }: { plotId: string; polygon: Point[] }) {
  const res = await fetch(`/api/plots/${plotId}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ polygon }),
  })
  return res.json()
}

export function PlotMap() {
  const queryClient = useQueryClient()
  const containerRef = useRef<HTMLDivElement>(null)
  const [stageSize, setStageSize] = useState({ width: 800, height: 600 })
  const [selectedPlotId, setSelectedPlotId] = useState<string | null>(null)
  const [drawingPoints, setDrawingPoints] = useState<Point[]>([])
  const [isDrawing, setIsDrawing] = useState(false)

  const { data: farm } = useQuery({ queryKey: ['farm-map'], queryFn: fetchFarm })
  const [mapImage] = useImage(farm?.mapImageUrl ?? '')

  const saveMutation = useMutation({
    mutationFn: savePlotPolygon,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['farm-map', 'plots'] }),
  })

  useEffect(() => {
    if (!containerRef.current) return
    const { offsetWidth, offsetHeight } = containerRef.current
    setStageSize({ width: offsetWidth, height: offsetHeight || 600 })
  }, [])

  function handleStageClick(e: any) {
    if (!isDrawing || !selectedPlotId) return
    const pos = e.target.getStage().getPointerPosition()
    setDrawingPoints(prev => [...prev, { x: pos.x, y: pos.y }])
  }

  function finishDrawing() {
    if (!selectedPlotId || drawingPoints.length < 3) return
    saveMutation.mutate({ plotId: selectedPlotId, polygon: drawingPoints })
    setDrawingPoints([])
    setIsDrawing(false)
    setSelectedPlotId(null)
  }

  const plots: PlotPolygon[] = farm?.plots ?? []

  return (
    <div className="space-y-4">
      <div className="flex gap-2 flex-wrap">
        {plots.map(plot => (
          <Button
            key={plot.id}
            size="sm"
            variant={selectedPlotId === plot.id ? 'default' : 'outline'}
            onClick={() => {
              setSelectedPlotId(plot.id)
              setDrawingPoints([])
              setIsDrawing(true)
            }}
            style={selectedPlotId === plot.id ? { backgroundColor: PRODUCT_COLORS[plot.productType] } : {}}
          >
            {plot.code} — {plot.name}
          </Button>
        ))}
        {isDrawing && drawingPoints.length >= 3 && (
          <Button size="sm" onClick={finishDrawing} className="bg-primary">
            Finalizar polígono
          </Button>
        )}
      </div>

      {isDrawing && (
        <p className="text-sm text-muted-foreground">
          Clique no mapa para marcar os vértices do talhão. Mínimo 3 pontos.
        </p>
      )}

      <div ref={containerRef} className="border rounded-lg overflow-hidden bg-gray-100" style={{ height: 600 }}>
        <Stage
          width={stageSize.width}
          height={stageSize.height}
          onClick={handleStageClick}
          style={{ cursor: isDrawing ? 'crosshair' : 'default' }}
        >
          <Layer>
            {mapImage && (
              <KonvaImage
                image={mapImage}
                width={stageSize.width}
                height={stageSize.height}
              />
            )}

            {plots.map(plot => {
              if (!plot.polygon || plot.polygon.length < 3) return null
              const flatPoints = plot.polygon.flatMap(p => [p.x, p.y])
              return (
                <React.Fragment key={plot.id}>
                  <Line
                    points={flatPoints}
                    closed
                    fill={PRODUCT_COLORS[plot.productType] + '44'}
                    stroke={PRODUCT_COLORS[plot.productType]}
                    strokeWidth={2}
                  />
                  <Text
                    x={plot.polygon[0].x + 4}
                    y={plot.polygon[0].y + 4}
                    text={plot.code}
                    fontSize={12}
                    fill={PRODUCT_COLORS[plot.productType]}
                    fontStyle="bold"
                  />
                </React.Fragment>
              )
            })}

            {drawingPoints.length > 0 && (
              <>
                <Line
                  points={drawingPoints.flatMap(p => [p.x, p.y])}
                  stroke="#1B4332"
                  strokeWidth={2}
                  dash={[6, 3]}
                />
                {drawingPoints.map((pt, i) => (
                  <Circle key={i} x={pt.x} y={pt.y} radius={4} fill="#1B4332" />
                ))}
              </>
            )}
          </Layer>
        </Stage>
      </div>
    </div>
  )
}
```

- [ ] **Step 3: Install use-image**

```bash
npm install use-image
```

- [ ] **Step 4: Create `src/app/(app)/talhoes/mapa/page.tsx`**

```typescript
'use client'

import { useRef, useState } from 'react'
import { PlotMap } from '@/components/plots/PlotMap'
import { Button } from '@/components/ui/button'

export default function MapaPage() {
  const inputRef = useRef<HTMLInputElement>(null)
  const [uploading, setUploading] = useState(false)

  async function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setUploading(true)
    const form = new FormData()
    form.append('file', file)
    await fetch('/api/farm/map', { method: 'POST', body: form })
    setUploading(false)
    window.location.reload()
  }

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-primary">Mapa do Sítio</h1>
          <p className="text-muted-foreground text-sm">Visualize e marque os talhões</p>
        </div>
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
      </div>
      <PlotMap />
    </div>
  )
}
```

- [ ] **Step 5: Commit**

```bash
git add src/app/api/farm/ src/components/plots/PlotMap.tsx src/app/\(app\)/talhoes/mapa/
git commit -m "feat: add map upload and Konva canvas for plot polygons"
```

---

## Phase 2 Complete

At this point you have:
- Full plots CRUD (create, list, detail, edit, delete)
- Map canvas with Konva.js — upload plant + draw polygons per plot
- ProductBadge with color per product type
- Role-based guards (only ADMIN can create/edit/delete)

**Next:** Phase 3 — Activities (offline-first) + Harvests
