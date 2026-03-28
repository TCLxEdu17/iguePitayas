# Weather Widget & Route Fixes Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add weather widget to the Dashboard and fix the missing `/configuracoes` route and `any` casts.

**Architecture:** `useWeather` hook calls Open-Meteo directly from the client (no backend route), result cached 30 min via TanStack Query. `WeatherWidget` renders above the KPI grid in `DashboardGrid`. `/configuracoes` is a client page reading session + farm API.

**Tech Stack:** Next.js 16, TanStack Query v5, Open-Meteo REST API (no key), React Testing Library, Jest.

---

## File Map

| File | Action | Purpose |
|------|--------|---------|
| `src/hooks/useWeather.ts` | Create | Fetches Open-Meteo, exports `useWeather()` and `weatherIcon()` |
| `src/hooks/__tests__/useWeather.test.ts` | Create | Unit tests for `weatherIcon` and hook shape |
| `src/components/dashboard/WeatherWidget.tsx` | Create | Card UI — current temp, 3-day forecast, rain alert |
| `src/components/dashboard/__tests__/WeatherWidget.test.tsx` | Create | Render tests for widget states |
| `src/app/(app)/configuracoes/page.tsx` | Create | Admin settings page — farm name + logged-in user |
| `src/components/layout/Sidebar.tsx` | Modify | Remove `(session?.user as any)?.role` cast |
| `src/app/(app)/talhoes/page.tsx` | Modify | Remove `(session?.user as any)?.role` cast |
| `src/components/dashboard/DashboardGrid.tsx` | Modify | Add `<WeatherWidget />` above KPI grid |

---

### Task 1: Fix `any` casts in Sidebar and Talhões page

**Files:**
- Modify: `src/components/layout/Sidebar.tsx:23`
- Modify: `src/app/(app)/talhoes/page.tsx:10`

- [ ] **Step 1: Open `src/components/layout/Sidebar.tsx` and change line 23**

Replace:
```tsx
const role = (session?.user as any)?.role
```
With:
```tsx
const role = session?.user?.role
```

- [ ] **Step 2: Open `src/app/(app)/talhoes/page.tsx` and change line 10**

Replace:
```tsx
const isAdmin = !isMobile && (session?.user as any)?.role === 'ADMIN'
```
With:
```tsx
const isAdmin = !isMobile && session?.user?.role === 'ADMIN'
```

- [ ] **Step 3: Run existing tests to confirm nothing broke**

```bash
npm test -- --testPathPattern="Sidebar"
```
Expected: `1 test suite, 1 passed`

- [ ] **Step 4: Commit**

```bash
git add src/components/layout/Sidebar.tsx src/app/\(app\)/talhoes/page.tsx
git commit -m "fix: remove any casts for session.user.role — typed via next-auth.d.ts"
```

---

### Task 2: Create `useWeather` hook

**Files:**
- Create: `src/hooks/useWeather.ts`
- Create: `src/hooks/__tests__/useWeather.test.ts`

- [ ] **Step 1: Write the failing test**

Create `src/hooks/__tests__/useWeather.test.ts`:

```ts
/**
 * @jest-environment node
 */
import { weatherIcon } from '@/hooks/useWeather'

describe('weatherIcon', () => {
  it('returns sun for clear sky (code 0)', () => {
    expect(weatherIcon(0)).toBe('☀️')
  })

  it('returns partly cloudy for codes 1-3', () => {
    expect(weatherIcon(1)).toBe('⛅')
    expect(weatherIcon(3)).toBe('⛅')
  })

  it('returns fog for codes 45-48', () => {
    expect(weatherIcon(45)).toBe('🌫️')
    expect(weatherIcon(48)).toBe('🌫️')
  })

  it('returns rain for codes 51-67', () => {
    expect(weatherIcon(51)).toBe('🌦️')
    expect(weatherIcon(67)).toBe('🌦️')
  })

  it('returns heavy rain for codes 80-82', () => {
    expect(weatherIcon(80)).toBe('🌧️')
    expect(weatherIcon(82)).toBe('🌧️')
  })

  it('returns thunderstorm for codes 95-99', () => {
    expect(weatherIcon(95)).toBe('⛈️')
    expect(weatherIcon(99)).toBe('⛈️')
  })
})
```

- [ ] **Step 2: Run test to confirm it fails**

```bash
npm test -- --testPathPattern="useWeather"
```
Expected: FAIL — `Cannot find module '@/hooks/useWeather'`

- [ ] **Step 3: Create `src/hooks/useWeather.ts`**

```ts
'use client'

import { useQuery } from '@tanstack/react-query'

const LAT = -24.29
const LNG = -47.17

export interface WeatherCurrent {
  temperature: number
  apparentTemperature: number
  weathercode: number
  windspeed: number
}

export interface WeatherDay {
  date: string
  weathercode: number
  tempMax: number
  tempMin: number
  precipitation: number
}

export interface WeatherData {
  current: WeatherCurrent
  daily: WeatherDay[]
}

export function weatherIcon(code: number): string {
  if (code === 0) return '☀️'
  if (code <= 3) return '⛅'
  if (code <= 48) return '🌫️'
  if (code <= 67) return '🌦️'
  if (code <= 77) return '❄️'
  if (code <= 82) return '🌧️'
  return '⛈️'
}

async function fetchWeather(): Promise<WeatherData> {
  const url = new URL('https://api.open-meteo.com/v1/forecast')
  url.searchParams.set('latitude', String(LAT))
  url.searchParams.set('longitude', String(LNG))
  url.searchParams.set('current', 'temperature_2m,apparent_temperature,weathercode,windspeed_10m')
  url.searchParams.set('daily', 'weathercode,temperature_2m_max,temperature_2m_min,precipitation_sum')
  url.searchParams.set('timezone', 'America/Sao_Paulo')
  url.searchParams.set('forecast_days', '4')

  const res = await fetch(url.toString())
  if (!res.ok) throw new Error('Weather fetch failed')
  const json = await res.json()

  return {
    current: {
      temperature: json.current.temperature_2m,
      apparentTemperature: json.current.apparent_temperature,
      weathercode: json.current.weathercode,
      windspeed: json.current.windspeed_10m,
    },
    daily: (json.daily.time as string[]).map((date, i) => ({
      date,
      weathercode: json.daily.weathercode[i] as number,
      tempMax: json.daily.temperature_2m_max[i] as number,
      tempMin: json.daily.temperature_2m_min[i] as number,
      precipitation: json.daily.precipitation_sum[i] as number,
    })),
  }
}

export function useWeather() {
  return useQuery<WeatherData>({
    queryKey: ['weather'],
    queryFn: fetchWeather,
    staleTime: 30 * 60 * 1000,
  })
}
```

- [ ] **Step 4: Run test to confirm it passes**

```bash
npm test -- --testPathPattern="useWeather"
```
Expected: `6 tests passed`

- [ ] **Step 5: Commit**

```bash
git add src/hooks/useWeather.ts src/hooks/__tests__/useWeather.test.ts
git commit -m "feat: add useWeather hook with Open-Meteo integration"
```

---

### Task 3: Create `WeatherWidget` component

**Files:**
- Create: `src/components/dashboard/WeatherWidget.tsx`
- Create: `src/components/dashboard/__tests__/WeatherWidget.test.tsx`

- [ ] **Step 1: Write the failing test**

Create `src/components/dashboard/__tests__/WeatherWidget.test.tsx`:

```tsx
import { render, screen } from '@testing-library/react'
import { WeatherWidget } from '@/components/dashboard/WeatherWidget'
import * as weatherHook from '@/hooks/useWeather'

jest.mock('@/hooks/useWeather')

const mockUseWeather = weatherHook.useWeather as jest.MockedFunction<typeof weatherHook.useWeather>

const mockData: weatherHook.WeatherData = {
  current: { temperature: 28, apparentTemperature: 30, weathercode: 0, windspeed: 10 },
  daily: [
    { date: '2026-03-28', weathercode: 0, tempMax: 32, tempMin: 22, precipitation: 0 },
    { date: '2026-03-29', weathercode: 80, tempMax: 28, tempMin: 20, precipitation: 5 },
    { date: '2026-03-30', weathercode: 3, tempMax: 27, tempMin: 19, precipitation: 0 },
    { date: '2026-03-31', weathercode: 1, tempMax: 30, tempMin: 21, precipitation: 0 },
  ],
}

describe('WeatherWidget', () => {
  it('shows loading skeleton when pending', () => {
    mockUseWeather.mockReturnValue({ isPending: true, isError: false, data: undefined } as any)
    const { container } = render(<WeatherWidget />)
    expect(container.querySelector('.animate-pulse')).toBeInTheDocument()
  })

  it('returns null on error', () => {
    mockUseWeather.mockReturnValue({ isPending: false, isError: true, data: undefined } as any)
    const { container } = render(<WeatherWidget />)
    expect(container.firstChild).toBeNull()
  })

  it('renders current temperature', () => {
    mockUseWeather.mockReturnValue({ isPending: false, isError: false, data: mockData } as any)
    render(<WeatherWidget />)
    expect(screen.getByText('28°C')).toBeInTheDocument()
  })

  it('renders rain alert when precipitation > 0 tomorrow', () => {
    mockUseWeather.mockReturnValue({ isPending: false, isError: false, data: mockData } as any)
    render(<WeatherWidget />)
    expect(screen.getByText(/Chuva prevista/)).toBeInTheDocument()
  })

  it('does not show rain alert when no precipitation', () => {
    const noRainData = {
      ...mockData,
      daily: mockData.daily.map(d => ({ ...d, precipitation: 0 })),
    }
    mockUseWeather.mockReturnValue({ isPending: false, isError: false, data: noRainData } as any)
    render(<WeatherWidget />)
    expect(screen.queryByText(/Chuva prevista/)).toBeNull()
  })

  it('renders location label', () => {
    mockUseWeather.mockReturnValue({ isPending: false, isError: false, data: mockData } as any)
    render(<WeatherWidget />)
    expect(screen.getByText('Itariri, SP')).toBeInTheDocument()
  })
})
```

- [ ] **Step 2: Run test to confirm it fails**

```bash
npm test -- --testPathPattern="WeatherWidget"
```
Expected: FAIL — `Cannot find module '@/components/dashboard/WeatherWidget'`

- [ ] **Step 3: Create `src/components/dashboard/WeatherWidget.tsx`**

```tsx
'use client'

import { useWeather, weatherIcon } from '@/hooks/useWeather'

export function WeatherWidget() {
  const { data, isPending, isError } = useWeather()

  if (isPending) {
    return <div className="h-28 rounded-lg bg-muted animate-pulse" />
  }

  if (isError || !data) return null

  const today = data.daily[0]
  const hasRain = today.precipitation > 0 || (data.daily[1]?.precipitation ?? 0) > 0

  return (
    <div className="rounded-lg border bg-white p-4 shadow-sm">
      {hasRain && (
        <div className="mb-3 rounded-md bg-yellow-50 border border-yellow-200 px-3 py-2 text-sm text-yellow-800">
          ⚠️ Chuva prevista — evitar pulverização
        </div>
      )}
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-muted-foreground">Itariri, SP</p>
          <div className="flex items-baseline gap-2 mt-1">
            <p className="text-3xl font-bold" style={{ color: 'var(--color-primary)' }}>
              {Math.round(data.current.temperature)}°C
            </p>
            <p className="text-sm text-muted-foreground">
              Sensação {Math.round(data.current.apparentTemperature)}°C
            </p>
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            {Math.round(today.tempMin)}° / {Math.round(today.tempMax)}°
          </p>
        </div>
        <span className="text-5xl">{weatherIcon(data.current.weathercode)}</span>
      </div>

      <div className="mt-4 grid grid-cols-3 gap-2 border-t pt-3">
        {data.daily.slice(1).map((day) => (
          <div key={day.date} className="flex flex-col items-center gap-1 text-xs">
            <p className="text-muted-foreground">
              {new Date(day.date + 'T12:00:00').toLocaleDateString('pt-BR', { weekday: 'short' })}
            </p>
            <span className="text-xl">{weatherIcon(day.weathercode)}</span>
            <p>{Math.round(day.tempMin)}° / {Math.round(day.tempMax)}°</p>
          </div>
        ))}
      </div>
    </div>
  )
}
```

- [ ] **Step 4: Run test to confirm it passes**

```bash
npm test -- --testPathPattern="WeatherWidget"
```
Expected: `6 tests passed`

- [ ] **Step 5: Commit**

```bash
git add src/components/dashboard/WeatherWidget.tsx "src/components/dashboard/__tests__/WeatherWidget.test.tsx"
git commit -m "feat: add WeatherWidget component with rain alert"
```

---

### Task 4: Integrate WeatherWidget into DashboardGrid

**Files:**
- Modify: `src/components/dashboard/DashboardGrid.tsx`

- [ ] **Step 1: Add `WeatherWidget` import and render it above KPIs**

Open `src/components/dashboard/DashboardGrid.tsx`.

Add import after existing imports:
```tsx
import { WeatherWidget } from './WeatherWidget'
```

Add `<WeatherWidget />` as first child of the outer `<div className="space-y-6">`, before the period selector:

```tsx
export function DashboardGrid() {
  const [period, setPeriod] = useState('month')

  const { data, isLoading } = useQuery({
    queryKey:        ['dashboard', period],
    queryFn:         () => fetch(getApiUrl(`/api/dashboard?period=${period}`)).then(r => r.json()),
    refetchInterval: 60_000,
  })

  return (
    <div className="space-y-6">
      {/* Weather */}
      <WeatherWidget />

      {/* Period selector */}
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
```

- [ ] **Step 2: Run full test suite**

```bash
npm test
```
Expected: all suites pass

- [ ] **Step 3: Commit**

```bash
git add src/components/dashboard/DashboardGrid.tsx
git commit -m "feat: integrate WeatherWidget into Dashboard"
```

---

### Task 5: Create `/configuracoes` page

**Files:**
- Create: `src/app/(app)/configuracoes/page.tsx`

There is no test needed here — this is a read-only display page using `useSession` and an existing API route already covered by other tests.

- [ ] **Step 1: Create `src/app/(app)/configuracoes/page.tsx`**

```tsx
'use client'

import { useSession } from 'next-auth/react'
import { useQuery } from '@tanstack/react-query'
import { getApiUrl } from '@/lib/api-url'

export default function ConfiguracoesPage() {
  const { data: session } = useSession()

  const { data: farm } = useQuery({
    queryKey: ['farm'],
    queryFn: () => fetch(getApiUrl('/api/farm')).then(r => r.json()),
  })

  return (
    <div className="p-6 max-w-lg">
      <div className="mb-6">
        <h1 className="text-2xl font-bold" style={{ color: 'var(--color-primary)' }}>Configurações</h1>
        <p className="text-muted-foreground text-sm">Informações da fazenda e conta</p>
      </div>

      <div className="space-y-4">
        <div className="rounded-lg border bg-white p-4 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-3">Fazenda</p>
          <p className="text-sm font-medium">{farm?.name ?? '—'}</p>
        </div>

        <div className="rounded-lg border bg-white p-4 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-3">Conta</p>
          <p className="text-sm font-medium">{session?.user?.name ?? '—'}</p>
          <p className="text-sm text-muted-foreground">{session?.user?.email ?? '—'}</p>
          <p className="text-xs text-muted-foreground mt-1">{session?.user?.role ?? '—'}</p>
        </div>
      </div>
    </div>
  )
}
```

- [ ] **Step 2: Run full test suite**

```bash
npm test
```
Expected: all suites pass

- [ ] **Step 3: Push to main**

```bash
git add "src/app/(app)/configuracoes/page.tsx"
git commit -m "feat: add configuracoes page with farm and user info"
git push origin main
```
