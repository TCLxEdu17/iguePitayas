# IGUE Bananas — Cross-Platform (Capacitor) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Transform the existing Next.js web app into a cross-platform app deployable to the web (Render), iOS App Store, and Google Play Store using Capacitor.

**Architecture:** Two build targets share one codebase. `npm run build` produces the standalone web server (Render). `npm run build:mobile` produces a static export (`out/`) bundled by Capacitor, with all API calls pointing to the deployed Render backend via `NEXT_PUBLIC_API_URL`. Offline data writes (Dexie.js) remain unchanged. Push notifications use `@capacitor/push-notifications` (FCM for Android, APNs for iOS), with tokens stored in a new `PushToken` DB table.

**Tech Stack:** Next.js 16, Capacitor 7, @capacitor/push-notifications, Prisma 7 (new PushToken model), TanStack Query v5 (new client fetch on talhão detail page)

**Working directory:** `/Users/edu/igueBananas` (branch `feature/implementation`)

---

## File Map

| File | Action | Purpose |
|---|---|---|
| `src/lib/api-url.ts` | Create | `getApiUrl(path)` helper — relative on web, absolute on mobile |
| `next.config.ts` | Modify | Conditional `output` + image config based on `NEXT_PUBLIC_BUILD_TARGET` |
| `package.json` | Modify | Add `build:mobile` and `test` scripts |
| `src/app/(app)/layout.tsx` | Modify | Convert server auth guard → client-side `useSession` |
| `src/app/(app)/talhoes/[id]/page.tsx` | Modify | Convert server component → client component + `generateStaticParams` |
| `src/lib/auth.ts` | Modify | Add `SameSite=none; Secure` cookie config for cross-origin Capacitor requests |
| `prisma/schema.prisma` | Modify | Add `PushToken` model |
| `src/app/api/notifications/register/route.ts` | Create | Store FCM/APNs push token per user |
| `src/hooks/usePushNotifications.ts` | Create | Request permission, register token, show local sync notification |
| `capacitor.config.ts` | Create | Capacitor app config (`appId`, `webDir: 'out'`) |
| `.gitignore` | Modify | Ignore `ios/`, `android/`, Firebase config files |
| `src/__tests__/lib/api-url.test.ts` | Create | Unit tests for getApiUrl |
| `src/__tests__/api/notifications.test.ts` | Create | Unit tests for register endpoint |
| `src/__tests__/hooks/usePushNotifications.test.ts` | Create | Unit tests for push hook (mocked Capacitor) |
| All 14 client files that use `fetch('/api/...')` | Modify | Replace with `fetch(getApiUrl('/api/...'))` |

### The 14 fetch calls to update:
1. `src/app/(app)/relatorios/page.tsx` line 16
2. `src/components/dashboard/DashboardGrid.tsx` line 27
3. `src/lib/offline/sync.ts` lines 18, 42
4. `src/components/activities/ActivityForm.tsx` lines 45, 79
5. `src/components/harvests/HarvestForm.tsx` lines 43, 93
6. `src/components/plots/PlotMap.tsx` lines 44, 50
7. `src/app/(app)/talhoes/mapa/page.tsx` line 20
8. `src/components/harvests/HarvestList.tsx` line 10
9. `src/components/activities/ActivityList.tsx` line 15
10. `src/components/plots/PlotList.tsx` line 9

---

## Task 1: `getApiUrl` Helper + Update All Fetch Calls

**Files:**
- Create: `src/lib/api-url.ts`
- Create: `src/__tests__/lib/api-url.test.ts`
- Modify: all 14 files listed above

- [ ] **Step 1: Write the failing test**

```typescript
// src/__tests__/lib/api-url.test.ts
import { getApiUrl } from '@/lib/api-url'

describe('getApiUrl', () => {
  const OLD_ENV = process.env

  beforeEach(() => {
    jest.resetModules()
    process.env = { ...OLD_ENV }
  })

  afterAll(() => {
    process.env = OLD_ENV
  })

  it('returns relative path when NEXT_PUBLIC_API_URL is not set', () => {
    delete process.env.NEXT_PUBLIC_API_URL
    // re-import to pick up env change
    const { getApiUrl } = require('@/lib/api-url')
    expect(getApiUrl('/api/plots')).toBe('/api/plots')
  })

  it('returns absolute URL when NEXT_PUBLIC_API_URL is set', () => {
    process.env.NEXT_PUBLIC_API_URL = 'https://iguebananas.onrender.com'
    const { getApiUrl } = require('@/lib/api-url')
    expect(getApiUrl('/api/plots')).toBe('https://iguebananas.onrender.com/api/plots')
  })

  it('does not double-slash', () => {
    process.env.NEXT_PUBLIC_API_URL = 'https://iguebananas.onrender.com'
    const { getApiUrl } = require('@/lib/api-url')
    expect(getApiUrl('/api/plots')).not.toContain('//')
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

```bash
npx jest src/__tests__/lib/api-url.test.ts --no-coverage
```
Expected: FAIL — `Cannot find module '@/lib/api-url'`

- [ ] **Step 3: Create the helper**

```typescript
// src/lib/api-url.ts
export function getApiUrl(path: string): string {
  const base = process.env.NEXT_PUBLIC_API_URL ?? ''
  return `${base}${path}`
}
```

- [ ] **Step 4: Run test to verify it passes**

```bash
npx jest src/__tests__/lib/api-url.test.ts --no-coverage
```
Expected: PASS (3 tests)

- [ ] **Step 5: Update all 14 fetch calls**

Add `import { getApiUrl } from '@/lib/api-url'` to each file, then replace every `fetch('/api/` and `` fetch(`/api/ `` with `fetch(getApiUrl('/api/` and `` fetch(getApiUrl(`/api/ `` respectively.

**`src/app/(app)/relatorios/page.tsx`** line 16:
```typescript
// Before:
const res = await fetch(`/api/reports?startDate=${startDate}T00:00:00.000Z&endDate=${endDate}T23:59:59.999Z`)
// After:
const res = await fetch(getApiUrl(`/api/reports?startDate=${startDate}T00:00:00.000Z&endDate=${endDate}T23:59:59.999Z`))
```

**`src/components/dashboard/DashboardGrid.tsx`** line 27:
```typescript
// Before:
queryFn: () => fetch(`/api/dashboard?period=${period}`).then(r => r.json()),
// After:
queryFn: () => fetch(getApiUrl(`/api/dashboard?period=${period}`)).then(r => r.json()),
```

**`src/lib/offline/sync.ts`** lines 18 and 42:
```typescript
// Line 18 — Before:
const res = await fetch('/api/activities', {
// Line 18 — After:
const res = await fetch(getApiUrl('/api/activities'), {

// Line 42 — Before:
const res = await fetch('/api/harvests', {
// Line 42 — After:
const res = await fetch(getApiUrl('/api/harvests'), {
```

**`src/components/activities/ActivityForm.tsx`** lines 45 and 79:
```typescript
// Line 45 — Before:
queryFn: () => fetch('/api/plots').then(r => r.json()),
// Line 45 — After:
queryFn: () => fetch(getApiUrl('/api/plots')).then(r => r.json()),

// Line 79 — Before:
const res = await fetch('/api/activities', {
// Line 79 — After:
const res = await fetch(getApiUrl('/api/activities'), {
```

**`src/components/harvests/HarvestForm.tsx`** lines 43 and 93:
```typescript
// Line 43 — Before:
queryFn: () => fetch('/api/plots').then(r => r.json()),
// Line 43 — After:
queryFn: () => fetch(getApiUrl('/api/plots')).then(r => r.json()),

// Line 93 — Before:
const res = await fetch('/api/harvests', {
// Line 93 — After:
const res = await fetch(getApiUrl('/api/harvests'), {
```

**`src/components/plots/PlotMap.tsx`** lines 44 and 50:
```typescript
// Line 44 — Before:
const res = await fetch('/api/farm')
// Line 44 — After:
const res = await fetch(getApiUrl('/api/farm'))

// Line 50 — Before:
const res = await fetch(`/api/plots/${plotId}`, {
// Line 50 — After:
const res = await fetch(getApiUrl(`/api/plots/${plotId}`), {
```

**`src/app/(app)/talhoes/mapa/page.tsx`** line 20:
```typescript
// Before:
const res = await fetch('/api/farm/map', { method: 'POST', body: form })
// After:
const res = await fetch(getApiUrl('/api/farm/map'), { method: 'POST', body: form })
```

**`src/components/harvests/HarvestList.tsx`** line 10:
```typescript
// Before:
queryFn: () => fetch('/api/harvests').then(r => r.json()),
// After:
queryFn: () => fetch(getApiUrl('/api/harvests')).then(r => r.json()),
```

**`src/components/activities/ActivityList.tsx`** line 15:
```typescript
// Before:
queryFn: () => fetch('/api/activities').then(r => r.json()),
// After:
queryFn: () => fetch(getApiUrl('/api/activities')).then(r => r.json()),
```

**`src/components/plots/PlotList.tsx`** line 9:
```typescript
// Before:
const res = await fetch('/api/plots')
// After:
const res = await fetch(getApiUrl('/api/plots'))
```

- [ ] **Step 6: Run all tests**

```bash
npx jest --no-coverage
```
Expected: all 58 tests pass (plus 3 new ones = 61 total)

- [ ] **Step 7: Commit**

```bash
git add src/lib/api-url.ts src/__tests__/lib/api-url.test.ts \
  src/app/\(app\)/relatorios/page.tsx \
  src/components/dashboard/DashboardGrid.tsx \
  src/lib/offline/sync.ts \
  src/components/activities/ActivityForm.tsx \
  src/components/harvests/HarvestForm.tsx \
  src/components/plots/PlotMap.tsx \
  src/app/\(app\)/talhoes/mapa/page.tsx \
  src/components/harvests/HarvestList.tsx \
  src/components/activities/ActivityList.tsx \
  src/components/plots/PlotList.tsx
git commit -m "feat: add getApiUrl helper and update all fetch calls for mobile build"
```

---

## Task 2: Conditional Build Config + Scripts

**Files:**
- Modify: `next.config.ts`
- Modify: `package.json`

- [ ] **Step 1: Update `next.config.ts`**

```typescript
// next.config.ts
import type { NextConfig } from 'next'

const isMobile = process.env.NEXT_PUBLIC_BUILD_TARGET === 'mobile'

const nextConfig: NextConfig = {
  output: isMobile ? 'export' : 'standalone',
  ...(isMobile && {
    images: { unoptimized: true },
    trailingSlash: true,
  }),
}

export default nextConfig
```

- [ ] **Step 2: Update `package.json` scripts**

Add `build:mobile` and `test` to the `scripts` section. Full updated scripts block:

```json
"scripts": {
  "dev": "next dev",
  "build": "next build",
  "build:mobile": "NEXT_PUBLIC_BUILD_TARGET=mobile NEXT_PUBLIC_API_URL=https://iguebananas.onrender.com next build",
  "start": "next start",
  "lint": "eslint",
  "test": "jest",
  "db:seed": "tsx prisma/seed.ts"
}
```

- [ ] **Step 3: Verify web build still works**

```bash
npm run build 2>&1 | tail -5
```
Expected: `✓ Compiled successfully` with no errors

- [ ] **Step 4: Commit**

```bash
git add next.config.ts package.json
git commit -m "feat: add conditional static export for mobile build"
```

---

## Task 3: Client-Side Auth Guard

**Files:**
- Modify: `src/app/(app)/layout.tsx`

Context: This file currently uses `getServerSession` (server component). In the static export, there is no server, so auth must be checked client-side via `useSession`. The `(app)/layout.tsx` wraps all protected pages.

- [ ] **Step 1: Rewrite `src/app/(app)/layout.tsx`**

```tsx
// src/app/(app)/layout.tsx
'use client'

import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'
import { AppShell } from '@/components/layout/AppShell'

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const { data: session, status } = useSession()
  const router = useRouter()

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.replace('/login')
    }
  }, [status, router])

  if (status === 'loading') {
    return (
      <div className="flex items-center justify-center h-screen bg-surface">
        <div className="text-primary text-lg font-medium">Carregando...</div>
      </div>
    )
  }

  if (!session) return null

  return <AppShell>{children}</AppShell>
}
```

- [ ] **Step 2: Verify dev server still works**

```bash
# If dev server is running, check login still redirects unauthenticated users
curl -s -o /dev/null -w "%{http_code}" http://localhost:3002/dashboard
```
Expected: 307 (redirect to /login)

- [ ] **Step 3: Run all tests**

```bash
npx jest --no-coverage
```
Expected: all tests pass

- [ ] **Step 4: Commit**

```bash
git add src/app/\(app\)/layout.tsx
git commit -m "feat: convert app layout to client-side auth guard for static export"
```

---

## Task 4: Convert Talhão Detail Page to Client Component

**Files:**
- Modify: `src/app/(app)/talhoes/[id]/page.tsx`

Context: Currently a server component using Prisma directly. For static export, it must be a client component that fetches from `/api/plots/:id`. `generateStaticParams` fetches all plot IDs at build time from the deployed API so the static export pre-renders each talhão page.

- [ ] **Step 1: Rewrite `src/app/(app)/talhoes/[id]/page.tsx`**

```tsx
// src/app/(app)/talhoes/[id]/page.tsx
'use client'

import { use } from 'react'
import { useQuery } from '@tanstack/react-query'
import { getApiUrl } from '@/lib/api-url'
import { PRODUCT_LABELS, PRODUCT_COLORS } from '@/types'
import type { ProductType } from '@/types'

interface Plot {
  id: string
  code: string
  name: string
  area: number | null
  productType: ProductType
  status: string
  notes: string | null
  activities: { id: string }[]
  harvests: { id: string }[]
}

export async function generateStaticParams() {
  try {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL ?? ''
    const res = await fetch(`${apiUrl}/api/plots`)
    if (!res.ok) return []
    const plots: { id: string }[] = await res.json()
    return plots.map((p) => ({ id: p.id }))
  } catch {
    return []
  }
}

export default function TalhaoDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)

  const { data: plot, isLoading, isError } = useQuery<Plot>({
    queryKey: ['plot', id],
    queryFn: () => fetch(getApiUrl(`/api/plots/${id}`)).then((r) => {
      if (!r.ok) throw new Error('Plot not found')
      return r.json()
    }),
  })

  if (isLoading) {
    return <div className="p-6 text-gray-500">Carregando talhão...</div>
  }

  if (isError || !plot) {
    return <div className="p-6 text-red-500">Talhão não encontrado.</div>
  }

  return (
    <main className="p-6 space-y-6">
      <div className="flex items-center gap-3">
        <h1 className="text-2xl font-bold">{plot.name}</h1>
        <span
          className="text-sm px-2 py-1 rounded-full text-white"
          style={{ backgroundColor: PRODUCT_COLORS[plot.productType] }}
        >
          {PRODUCT_LABELS[plot.productType]}
        </span>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg p-4 shadow-sm">
          <p className="text-sm text-gray-500">Código</p>
          <p className="font-semibold">{plot.code}</p>
        </div>
        <div className="bg-white rounded-lg p-4 shadow-sm">
          <p className="text-sm text-gray-500">Área</p>
          <p className="font-semibold">{plot.area ? `${plot.area} m²` : '—'}</p>
        </div>
        <div className="bg-white rounded-lg p-4 shadow-sm">
          <p className="text-sm text-gray-500">Status</p>
          <p className="font-semibold">{plot.status}</p>
        </div>
        <div className="bg-white rounded-lg p-4 shadow-sm">
          <p className="text-sm text-gray-500">Atividades</p>
          <p className="font-semibold">{plot.activities.length}</p>
        </div>
      </div>
      {plot.notes && (
        <div className="bg-white rounded-lg p-4 shadow-sm">
          <p className="text-sm text-gray-500 mb-1">Notas</p>
          <p>{plot.notes}</p>
        </div>
      )}
    </main>
  )
}
```

- [ ] **Step 2: Run all tests**

```bash
npx jest --no-coverage
```
Expected: all tests pass

- [ ] **Step 3: Commit**

```bash
git add src/app/\(app\)/talhoes/\[id\]/page.tsx
git commit -m "feat: convert talhão detail page to client component with static params"
```

---

## Task 5: SameSite Cookie Config

**Files:**
- Modify: `src/lib/auth.ts`

Context: Capacitor WebView makes cross-origin requests (`capacitor://localhost` → `https://iguebananas.onrender.com`). NextAuth session cookies need `SameSite=none; Secure` to be sent in cross-origin requests.

- [ ] **Step 1: Update `src/lib/auth.ts`**

Add the `cookies` config block to the existing `authOptions` object. The full updated file:

```typescript
// src/lib/auth.ts
import { NextAuthOptions } from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'
import bcrypt from 'bcryptjs'
import { db } from '@/lib/db'

export const authOptions: NextAuthOptions = {
  session: { strategy: 'jwt' },
  pages: { signIn: '/login' },
  cookies: {
    sessionToken: {
      name: `next-auth.session-token`,
      options: {
        httpOnly: true,
        sameSite: 'none' as const,
        path: '/',
        secure: true,
      },
    },
  },
  providers: [
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email:    { label: 'Email',  type: 'email' },
        password: { label: 'Senha', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null

        const user = await db.user.findUnique({
          where: { email: credentials.email },
        })

        if (!user || !user.active) return null

        const valid = await bcrypt.compare(credentials.password, user.passwordHash)
        if (!valid) return null

        return {
          id:    user.id,
          name:  user.name,
          email: user.email,
          role:  user.role,
        }
      },
    }),
  ],
  callbacks: {
    jwt({ token, user }) {
      if (user) {
        token.role = (user as any).role
        token.id = user.id
      }
      return token
    },
    session({ session, token }) {
      if (session.user) {
        (session.user as any).role = token.role
        ;(session.user as any).id = token.id
      }
      return session
    },
  },
}
```

- [ ] **Step 2: Run all tests**

```bash
npx jest --no-coverage
```
Expected: all tests pass

- [ ] **Step 3: Commit**

```bash
git add src/lib/auth.ts
git commit -m "feat: add SameSite=none cookie config for Capacitor cross-origin requests"
```

---

## Task 6: PushToken Prisma Model + Migration

**Files:**
- Modify: `prisma/schema.prisma`

- [ ] **Step 1: Add PushToken model to `prisma/schema.prisma`**

Add after the `Harvest` model:

```prisma
model PushToken {
  id        String   @id @default(cuid())
  userId    String
  token     String   @unique
  platform  String
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  user User @relation(fields: [userId], references: [id], onDelete: Cascade)
}
```

Also add `pushTokens PushToken[]` to the `User` model's relations block (after `harvests Harvest[]`):

```prisma
model User {
  id           String   @id @default(cuid())
  name         String
  email        String   @unique
  passwordHash String
  role         Role     @default(OPERATOR)
  active       Boolean  @default(true)
  createdAt    DateTime @default(now())
  updatedAt    DateTime @updatedAt

  activities Activity[]
  harvests   Harvest[]
  pushTokens PushToken[]
}
```

- [ ] **Step 2: Run migration**

```bash
export $(cat .env | xargs) && npx prisma migrate dev --name add_push_token
```
Expected: `✓ Applied | Pending: 0`

- [ ] **Step 3: Regenerate Prisma client**

```bash
npx prisma generate
```
Expected: `✓ Prisma Client generated`

- [ ] **Step 4: Commit**

```bash
git add prisma/schema.prisma prisma/migrations/
git commit -m "feat: add PushToken model for push notification token storage"
```

---

## Task 7: Push Notifications API Endpoint

**Files:**
- Create: `src/app/api/notifications/register/route.ts`
- Create: `src/__tests__/api/notifications.test.ts`

- [ ] **Step 1: Write the failing test**

```typescript
// src/__tests__/api/notifications.test.ts
/**
 * @jest-environment node
 */
import { NextRequest } from 'next/server'

jest.mock('next-auth', () => ({
  getServerSession: jest.fn(),
}))

jest.mock('@/lib/auth', () => ({
  authOptions: {},
}))

jest.mock('@/lib/db', () => ({
  db: {
    pushToken: {
      upsert: jest.fn(),
    },
  },
}))

import { POST } from '@/app/api/notifications/register/route'
import { getServerSession } from 'next-auth'
import { db } from '@/lib/db'

const mockSession = { user: { id: 'user-1', role: 'OPERATOR' } }

describe('POST /api/notifications/register', () => {
  beforeEach(() => jest.clearAllMocks())

  it('returns 401 when not authenticated', async () => {
    ;(getServerSession as jest.Mock).mockResolvedValue(null)
    const req = new NextRequest('http://localhost/api/notifications/register', {
      method: 'POST',
      body: JSON.stringify({ token: 'abc', platform: 'android' }),
      headers: { 'Content-Type': 'application/json' },
    })
    const res = await POST(req)
    expect(res.status).toBe(401)
  })

  it('returns 400 when token is missing', async () => {
    ;(getServerSession as jest.Mock).mockResolvedValue(mockSession)
    const req = new NextRequest('http://localhost/api/notifications/register', {
      method: 'POST',
      body: JSON.stringify({ platform: 'android' }),
      headers: { 'Content-Type': 'application/json' },
    })
    const res = await POST(req)
    expect(res.status).toBe(400)
  })

  it('upserts token and returns 200', async () => {
    ;(getServerSession as jest.Mock).mockResolvedValue(mockSession)
    ;(db.pushToken.upsert as jest.Mock).mockResolvedValue({ id: 'pt-1' })
    const req = new NextRequest('http://localhost/api/notifications/register', {
      method: 'POST',
      body: JSON.stringify({ token: 'fcm-token-xyz', platform: 'android' }),
      headers: { 'Content-Type': 'application/json' },
    })
    const res = await POST(req)
    expect(res.status).toBe(200)
    expect(db.pushToken.upsert).toHaveBeenCalledWith({
      where: { token: 'fcm-token-xyz' },
      update: { userId: 'user-1', platform: 'android' },
      create: { token: 'fcm-token-xyz', userId: 'user-1', platform: 'android' },
    })
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

```bash
npx jest src/__tests__/api/notifications.test.ts --no-coverage
```
Expected: FAIL — `Cannot find module '@/app/api/notifications/register/route'`

- [ ] **Step 3: Create the API route**

```typescript
// src/app/api/notifications/register/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { db } from '@/lib/db'

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await req.json()
  const { token, platform } = body

  if (!token || !platform) {
    return NextResponse.json({ error: 'token and platform required' }, { status: 400 })
  }

  const userId = (session.user as any).id as string

  await db.pushToken.upsert({
    where: { token },
    update: { userId, platform },
    create: { token, userId, platform },
  })

  return NextResponse.json({ ok: true })
}
```

- [ ] **Step 4: Run test to verify it passes**

```bash
npx jest src/__tests__/api/notifications.test.ts --no-coverage
```
Expected: PASS (3 tests)

- [ ] **Step 5: Run all tests**

```bash
npx jest --no-coverage
```
Expected: all tests pass

- [ ] **Step 6: Commit**

```bash
git add src/app/api/notifications/register/route.ts src/__tests__/api/notifications.test.ts
git commit -m "feat: add push token registration endpoint"
```

---

## Task 8: Capacitor Setup

**Files:**
- Create: `capacitor.config.ts`
- Modify: `.gitignore`

- [ ] **Step 1: Install Capacitor packages**

```bash
npm install @capacitor/core @capacitor/app @capacitor/push-notifications
npm install --save-dev @capacitor/cli
```

- [ ] **Step 2: Create `capacitor.config.ts`**

```typescript
// capacitor.config.ts
import type { CapacitorConfig } from '@capacitor/cli'

const config: CapacitorConfig = {
  appId: 'com.iguebananas.app',
  appName: 'IGUE Bananas',
  webDir: 'out',
  plugins: {
    PushNotifications: {
      presentationOptions: ['badge', 'sound', 'alert'],
    },
  },
}

export default config
```

- [ ] **Step 3: Update `.gitignore`**

Append to `.gitignore`:
```
# Capacitor native projects (generated by cap add)
ios/
android/

# Firebase config (contains secrets — never commit)
google-services.json
GoogleService-Info.plist
```

- [ ] **Step 4: Initialize Capacitor (AFTER creating the config file)**

`cap init` can overwrite `capacitor.config.ts`. Run it first to install the CLI metadata, then our config in Step 2 is the final version:

```bash
# Initialize without overwriting (our config file is already correct)
npx cap init "IGUE Bananas" "com.iguebananas.app" --web-dir out 2>&1 || true
# Restore our config (cap init may have overwritten it)
```

After running the above, verify `capacitor.config.ts` still contains `appId: 'com.iguebananas.app'` and `webDir: 'out'`. If it was overwritten, rewrite it with the content from Step 2.

Note: `npx cap add ios` and `npx cap add android` require Xcode (macOS) and Android Studio respectively. Run them when those tools are available:
```bash
npx cap add ios      # requires Xcode installed
npx cap add android  # requires Android Studio installed
```

- [ ] **Step 5: Commit**

```bash
git add capacitor.config.ts .gitignore package.json package-lock.json
git commit -m "feat: add Capacitor config and install mobile packages"
```

---

## Task 9: `usePushNotifications` Hook

**Files:**
- Create: `src/hooks/usePushNotifications.ts`
- Create: `src/__tests__/hooks/usePushNotifications.test.ts`
- Modify: `src/app/(app)/layout.tsx`

- [ ] **Step 1: Write the failing test**

```typescript
// src/__tests__/hooks/usePushNotifications.test.ts
/**
 * @jest-environment jsdom
 */
import { renderHook, waitFor } from '@testing-library/react'
import { usePushNotifications } from '@/hooks/usePushNotifications'

// Mock @capacitor/core — Capacitor is not available in Jest
jest.mock('@capacitor/core', () => ({
  Capacitor: {
    isNativePlatform: jest.fn(() => false),
    getPlatform: jest.fn(() => 'web'),
  },
}))

jest.mock('@capacitor/push-notifications', () => ({
  PushNotifications: {
    requestPermissions: jest.fn(),
    register: jest.fn(),
    addListener: jest.fn(() => ({ remove: jest.fn() })),
  },
}))

describe('usePushNotifications', () => {
  it('does nothing when not on native platform', async () => {
    const { result } = renderHook(() => usePushNotifications())
    await waitFor(() => {
      expect(result.current.supported).toBe(false)
    })
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

```bash
npx jest src/__tests__/hooks/usePushNotifications.test.ts --no-coverage
```
Expected: FAIL — `Cannot find module '@/hooks/usePushNotifications'`

- [ ] **Step 3: Create the hook**

```typescript
// src/hooks/usePushNotifications.ts
'use client'

import { useEffect, useState } from 'react'
import { getApiUrl } from '@/lib/api-url'

export function usePushNotifications() {
  const [supported, setSupported] = useState(false)

  useEffect(() => {
    async function init() {
      // Dynamic import so the module doesn't break SSR / web builds
      let Capacitor: typeof import('@capacitor/core').Capacitor
      let PushNotifications: typeof import('@capacitor/push-notifications').PushNotifications

      try {
        ;({ Capacitor } = await import('@capacitor/core'))
        ;({ PushNotifications } = await import('@capacitor/push-notifications'))
      } catch {
        // Capacitor not available (web dev mode)
        return
      }

      if (!Capacitor.isNativePlatform()) return
      setSupported(true)

      const { receive } = await PushNotifications.requestPermissions()
      if (receive !== 'granted') return

      await PushNotifications.register()

      const regListener = await PushNotifications.addListener(
        'registration',
        async (token) => {
          const platform = Capacitor.getPlatform() // 'ios' | 'android'
          try {
            await fetch(getApiUrl('/api/notifications/register'), {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ token: token.value, platform }),
            })
          } catch {
            console.warn('[Push] Failed to register token')
          }
        }
      )

      return () => {
        regListener.remove()
      }
    }

    init()
  }, [])

  return { supported }
}
```

- [ ] **Step 4: Run test to verify it passes**

```bash
npx jest src/__tests__/hooks/usePushNotifications.test.ts --no-coverage
```
Expected: PASS (1 test)

- [ ] **Step 5: Integrate hook into `src/app/(app)/layout.tsx`**

Add the hook call inside the layout component. Updated file:

```tsx
// src/app/(app)/layout.tsx
'use client'

import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'
import { AppShell } from '@/components/layout/AppShell'
import { usePushNotifications } from '@/hooks/usePushNotifications'

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const { data: session, status } = useSession()
  const router = useRouter()
  usePushNotifications()

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.replace('/login')
    }
  }, [status, router])

  if (status === 'loading') {
    return (
      <div className="flex items-center justify-center h-screen bg-surface">
        <div className="text-primary text-lg font-medium">Carregando...</div>
      </div>
    )
  }

  if (!session) return null

  return <AppShell>{children}</AppShell>
}
```

- [ ] **Step 6: Run all tests**

```bash
npx jest --no-coverage
```
Expected: all tests pass

- [ ] **Step 7: Commit**

```bash
git add src/hooks/usePushNotifications.ts \
  src/__tests__/hooks/usePushNotifications.test.ts \
  src/app/\(app\)/layout.tsx
git commit -m "feat: add usePushNotifications hook with token registration"
```

---

## Task 10: Mobile Build Verification

**Files:** none — verification only

- [ ] **Step 1: Run the web build to confirm it still works**

```bash
npm run build 2>&1 | tail -8
```
Expected: `✓ Compiled successfully`, output type `standalone`

- [ ] **Step 2: Run the mobile build**

```bash
npm run build:mobile 2>&1 | tail -8
```
Expected: `✓ Compiled successfully`, output type `export`, `out/` directory created

- [ ] **Step 3: Verify `out/` contents**

```bash
ls out/ | head -20
```
Expected: `index.html`, `dashboard/`, `talhoes/`, `atividades/`, `producao/`, `relatorios/`, `_next/`

- [ ] **Step 4: Sync Capacitor (if ios/ or android/ exist)**

```bash
npx cap sync 2>&1
```
If platforms were added: Expected: `✔ Updating iOS native dependencies` or similar.
If no platforms added yet: Expected: `⠿ Updating web assets` with no native sync.

- [ ] **Step 5: Run all tests one final time**

```bash
npx jest --no-coverage
```
Expected: all tests pass

- [ ] **Step 6: Push branch**

```bash
git push origin feature/implementation
```

---

## Post-Implementation: Manual Steps for App Store / Play Store

These steps require external accounts and tools and cannot be automated:

### Android (Google Play)
1. Install Android Studio
2. `npx cap add android`
3. Download `google-services.json` from Firebase Console → place in `android/app/`
4. `npx cap open android` → build signed APK/AAB in Android Studio
5. Upload to Google Play Console

### iOS (App Store)
1. macOS with Xcode installed
2. `npx cap add ios`
3. Download `GoogleService-Info.plist` from Firebase Console → place in `ios/App/App/`
4. Configure APNs in Apple Developer Portal → add to Firebase project
5. `npx cap open ios` → archive and upload in Xcode
6. Submit via App Store Connect
