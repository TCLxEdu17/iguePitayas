# IGUE Bananas — Phase 1: Foundation Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Scaffold Next.js project with auth, database schema, design system, and app shell (sidebar + bottom nav).

**Architecture:** Next.js 14 App Router + Prisma + PostgreSQL on Render + NextAuth.js credentials provider. All UI uses Tailwind + shadcn/ui with the Campo Verde design system.

**Tech Stack:** Next.js 14, TypeScript, Prisma, PostgreSQL, NextAuth.js, Tailwind CSS, shadcn/ui, Zustand, Jest, React Testing Library

---

## File Map

```
igueBananas/
├── prisma/schema.prisma
├── src/
│   ├── app/
│   │   ├── layout.tsx
│   │   ├── page.tsx                          # redirect → /dashboard
│   │   ├── (auth)/login/page.tsx
│   │   ├── (app)/
│   │   │   ├── layout.tsx                    # AppShell
│   │   │   └── dashboard/page.tsx            # placeholder
│   │   └── api/auth/[...nextauth]/route.ts
│   ├── components/layout/
│   │   ├── AppShell.tsx
│   │   ├── Sidebar.tsx
│   │   ├── BottomNav.tsx
│   │   └── SyncBadge.tsx
│   ├── lib/
│   │   ├── db.ts                             # Prisma singleton
│   │   └── auth.ts                           # NextAuth config
│   ├── stores/ui.store.ts
│   └── types/index.ts
├── render.yaml
├── .env.example
└── package.json
```

---

### Task 1: Project Scaffold

**Files:**
- Create: `package.json`, `tsconfig.json`, `tailwind.config.ts`, `next.config.ts`

- [ ] **Step 1: Init Next.js project**

```bash
cd /Users/edu/igueBananas
npx create-next-app@latest . --typescript --tailwind --eslint --app --src-dir --import-alias "@/*" --no-git
```

Expected: Next.js project created in current directory.

- [ ] **Step 2: Install core dependencies**

```bash
npm install prisma @prisma/client next-auth @auth/prisma-adapter
npm install zustand @tanstack/react-query dexie
npm install konva react-konva
npm install zod react-hook-form @hookform/resolvers
npm install -D jest @testing-library/react @testing-library/jest-dom @testing-library/user-event jest-environment-jsdom ts-jest
```

- [ ] **Step 3: Install shadcn/ui**

```bash
npx shadcn@latest init
```

When prompted:
- Style: Default
- Base color: Neutral
- CSS variables: Yes

- [ ] **Step 4: Add shadcn components**

```bash
npx shadcn@latest add button input label card badge select textarea dialog sheet tabs table form
```

- [ ] **Step 5: Configure Jest — create `jest.config.ts`**

```typescript
import type { Config } from 'jest'
import nextJest from 'next/jest.js'

const createJestConfig = nextJest({ dir: './' })

const config: Config = {
  coverageProvider: 'v8',
  testEnvironment: 'jsdom',
  setupFilesAfterFramework: ['<rootDir>/jest.setup.ts'],
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
  },
}

export default createJestConfig(config)
```

- [ ] **Step 6: Create `jest.setup.ts`**

```typescript
import '@testing-library/jest-dom'
```

- [ ] **Step 7: Commit**

```bash
git add -A
git commit -m "feat: scaffold Next.js project with deps and shadcn"
```

---

### Task 2: Design System Tokens

**Files:**
- Modify: `src/app/globals.css`
- Modify: `tailwind.config.ts`

- [ ] **Step 1: Update `tailwind.config.ts`**

```typescript
import type { Config } from 'tailwindcss'

const config: Config = {
  darkMode: ['class'],
  content: ['./src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#1B4332',
          foreground: '#FFFFFF',
          50:  '#E8F5EE',
          100: '#C6E8D4',
          700: '#1B4332',
          800: '#163728',
          900: '#0F2A1E',
        },
        accent: {
          DEFAULT: '#F4D03F',
          foreground: '#1A1A1A',
        },
        surface: '#F0F4F0',
        banana: {
          prata:  '#27AE60',
          nanica: '#F4D03F',
          pitaya: '#E91E8C',
        },
        sync: {
          pending:  '#F39C12',
          conflict: '#C0392B',
          synced:   '#27AE60',
        },
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      },
    },
  },
  plugins: [require('tailwindcss-animate')],
}

export default config
```

- [ ] **Step 2: Update `src/app/globals.css`**

```css
@tailwind base;
@tailwind components;
@tailwind utilities;

@layer base {
  :root {
    --background: 240 10% 96%;
    --foreground: 0 0% 10%;
    --primary: 158 43% 18%;
    --primary-foreground: 0 0% 100%;
    --accent: 47 89% 60%;
    --accent-foreground: 0 0% 10%;
    --muted: 158 20% 92%;
    --muted-foreground: 158 10% 40%;
    --border: 158 20% 85%;
    --radius: 0.5rem;
  }
}

body {
  @apply bg-surface text-foreground font-sans;
}
```

- [ ] **Step 3: Commit**

```bash
git add src/app/globals.css tailwind.config.ts
git commit -m "feat: add Campo Verde design tokens"
```

---

### Task 3: Database Schema

**Files:**
- Create: `prisma/schema.prisma`

- [ ] **Step 1: Init Prisma**

```bash
npx prisma init
```

- [ ] **Step 2: Write `prisma/schema.prisma`**

```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

enum Role {
  ADMIN
  OPERATOR
  VIEWER
}

enum ProductType {
  BANANA_PRATA
  BANANA_NANICA
  PITAYA
}

enum PlotStatus {
  ACTIVE
  INACTIVE
  MAINTENANCE
}

enum ActivityType {
  PULVERIZACAO
  ROCAGEM
  RETIRADA_BANANA
  RETIRADA_CAIXAS
  OUTRO
}

enum Unit {
  CAIXA
  UNIDADE
}

enum SyncStatus {
  PENDING
  SYNCED
  CONFLICT
}

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
}

model Farm {
  id           String  @id @default(cuid())
  name         String
  mapImageUrl  String?
  mapImagePath String?

  plots Plot[]
}

model Plot {
  id          String      @id @default(cuid())
  farmId      String
  code        String
  name        String
  area        Float?
  productType ProductType
  status      PlotStatus  @default(ACTIVE)
  polygon     Json?
  notes       String?
  createdAt   DateTime    @default(now())
  updatedAt   DateTime    @updatedAt

  farm       Farm       @relation(fields: [farmId], references: [id])
  activities Activity[]
  harvests   Harvest[]
}

model Activity {
  id          String       @id @default(cuid())
  localId     String       @unique
  plotId      String
  userId      String
  date        DateTime
  type        ActivityType
  responsible String
  quantity    Float?
  unit        Unit?
  cost        Float?
  notes       String?
  confirmed   Boolean      @default(false)
  syncStatus  SyncStatus   @default(SYNCED)
  createdAt   DateTime     @default(now())
  updatedAt   DateTime     @updatedAt

  plot Plot @relation(fields: [plotId], references: [id])
  user User @relation(fields: [userId], references: [id])
}

model Harvest {
  id           String     @id @default(cuid())
  localId      String     @unique
  plotId       String
  userId       String
  date         DateTime
  quantity     Float
  unit         Unit
  pricePerUnit Float
  totalRevenue Float
  notes        String?
  syncStatus   SyncStatus @default(SYNCED)
  createdAt    DateTime   @default(now())
  updatedAt    DateTime   @updatedAt

  plot Plot @relation(fields: [plotId], references: [id])
  user User @relation(fields: [userId], references: [id])
}
```

- [ ] **Step 3: Create `.env.local`**

```bash
cat > .env.local << 'EOF'
DATABASE_URL="postgresql://postgres:password@localhost:5432/iguebananas"
NEXTAUTH_SECRET="dev-secret-change-in-production"
NEXTAUTH_URL="http://localhost:3000"
EOF
```

- [ ] **Step 4: Create `.env.example`**

```bash
cat > .env.example << 'EOF'
DATABASE_URL="postgresql://user:password@host:5432/iguebananas"
NEXTAUTH_SECRET="generate-with-openssl-rand-base64-32"
NEXTAUTH_URL="https://yourdomain.com"
EOF
```

- [ ] **Step 5: Run migration (requires local PostgreSQL)**

```bash
npx prisma migrate dev --name init
```

Expected: Migration created and applied. Prisma Client generated.

- [ ] **Step 6: Commit**

```bash
git add prisma/ .env.example
git commit -m "feat: add Prisma schema with all entities"
```

---

### Task 4: Prisma Client + Types

**Files:**
- Create: `src/lib/db.ts`
- Create: `src/types/index.ts`

- [ ] **Step 1: Write test `src/lib/__tests__/db.test.ts`**

```typescript
import { db } from '@/lib/db'

describe('db singleton', () => {
  it('exports a PrismaClient instance', () => {
    expect(db).toBeDefined()
    expect(typeof db.$connect).toBe('function')
  })
})
```

- [ ] **Step 2: Run test — expect FAIL**

```bash
npx jest src/lib/__tests__/db.test.ts
```

Expected: FAIL — cannot find module '@/lib/db'

- [ ] **Step 3: Create `src/lib/db.ts`**

```typescript
import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient }

export const db = globalForPrisma.prisma ?? new PrismaClient()

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = db
```

- [ ] **Step 4: Run test — expect PASS**

```bash
npx jest src/lib/__tests__/db.test.ts
```

- [ ] **Step 5: Create `src/types/index.ts`**

```typescript
import type { User, Plot, Activity, Harvest, Farm } from '@prisma/client'

export type { User, Plot, Activity, Harvest, Farm }

export type UserWithoutPassword = Omit<User, 'passwordHash'>

export type PlotWithActivities = Plot & {
  activities: Activity[]
  harvests: Harvest[]
}

export const PRODUCT_LABELS: Record<string, string> = {
  BANANA_PRATA:  'Banana Prata',
  BANANA_NANICA: 'Banana Nanica',
  PITAYA:        'Pitaya',
}

export const PRODUCT_COLORS: Record<string, string> = {
  BANANA_PRATA:  '#27AE60',
  BANANA_NANICA: '#F4D03F',
  PITAYA:        '#E91E8C',
}

export const ACTIVITY_LABELS: Record<string, string> = {
  PULVERIZACAO:    'Pulverização',
  ROCAGEM:         'Roçagem',
  RETIRADA_BANANA: 'Retirada de Banana',
  RETIRADA_CAIXAS: 'Retirada de Caixas',
  OUTRO:           'Outro',
}

export const UNIT_LABELS: Record<string, string> = {
  CAIXA:   'Caixa',
  UNIDADE: 'Unidade',
}
```

- [ ] **Step 6: Commit**

```bash
git add src/lib/ src/types/
git commit -m "feat: add db singleton and shared types"
```

---

### Task 5: Auth

**Files:**
- Create: `src/lib/auth.ts`
- Create: `src/app/api/auth/[...nextauth]/route.ts`
- Create: `prisma/seed.ts`

- [ ] **Step 1: Install bcrypt**

```bash
npm install bcryptjs
npm install -D @types/bcryptjs
```

- [ ] **Step 2: Write test `src/lib/__tests__/auth.test.ts`**

```typescript
import { authOptions } from '@/lib/auth'

describe('authOptions', () => {
  it('has credentials provider', () => {
    expect(authOptions.providers).toHaveLength(1)
    expect(authOptions.providers[0].id).toBe('credentials')
  })

  it('has jwt session strategy', () => {
    expect(authOptions.session?.strategy).toBe('jwt')
  })
})
```

- [ ] **Step 3: Run test — expect FAIL**

```bash
npx jest src/lib/__tests__/auth.test.ts
```

- [ ] **Step 4: Create `src/lib/auth.ts`**

```typescript
import { NextAuthOptions } from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'
import bcrypt from 'bcryptjs'
import { db } from '@/lib/db'

export const authOptions: NextAuthOptions = {
  session: { strategy: 'jwt' },
  pages: { signIn: '/login' },
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
      if (user) token.role = (user as any).role
      return token
    },
    session({ session, token }) {
      if (session.user) (session.user as any).role = token.role
      return session
    },
  },
}
```

- [ ] **Step 5: Create `src/app/api/auth/[...nextauth]/route.ts`**

```typescript
import NextAuth from 'next-auth'
import { authOptions } from '@/lib/auth'

const handler = NextAuth(authOptions)
export { handler as GET, handler as POST }
```

- [ ] **Step 6: Create seed `prisma/seed.ts`**

```typescript
import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  const hash = await bcrypt.hash('admin123', 10)

  const farm = await prisma.farm.upsert({
    where:  { id: 'farm-1' },
    update: {},
    create: { id: 'farm-1', name: 'IGUE Bananas' },
  })

  await prisma.user.upsert({
    where:  { email: 'admin@iguebananas.com' },
    update: {},
    create: {
      name:         'Administrador',
      email:        'admin@iguebananas.com',
      passwordHash: hash,
      role:         'ADMIN',
    },
  })

  console.log('Seed completo. Farm:', farm.name)
}

main().finally(() => prisma.$disconnect())
```

- [ ] **Step 7: Add seed script to `package.json`**

Add to scripts:
```json
"db:seed": "ts-node --compiler-options '{\"module\":\"CommonJS\"}' prisma/seed.ts"
```

- [ ] **Step 8: Run seed**

```bash
npm run db:seed
```

Expected: "Seed completo. Farm: IGUE Bananas"

- [ ] **Step 9: Run auth tests — expect PASS**

```bash
npx jest src/lib/__tests__/auth.test.ts
```

- [ ] **Step 10: Commit**

```bash
git add src/lib/auth.ts src/app/api/ prisma/seed.ts package.json
git commit -m "feat: add NextAuth credentials provider with bcrypt"
```

---

### Task 6: App Shell (Sidebar + Bottom Nav)

**Files:**
- Create: `src/components/layout/Sidebar.tsx`
- Create: `src/components/layout/BottomNav.tsx`
- Create: `src/components/layout/SyncBadge.tsx`
- Create: `src/components/layout/AppShell.tsx`
- Create: `src/stores/ui.store.ts`

- [ ] **Step 1: Write test `src/components/layout/__tests__/Sidebar.test.tsx`**

```typescript
import { render, screen } from '@testing-library/react'
import { Sidebar } from '@/components/layout/Sidebar'

jest.mock('next/navigation', () => ({
  usePathname: () => '/dashboard',
}))

jest.mock('next-auth/react', () => ({
  useSession: () => ({ data: { user: { role: 'ADMIN', name: 'Admin' } } }),
}))

describe('Sidebar', () => {
  it('renders navigation links', () => {
    render(<Sidebar />)
    expect(screen.getByText('Dashboard')).toBeInTheDocument()
    expect(screen.getByText('Talhões')).toBeInTheDocument()
    expect(screen.getByText('Atividades')).toBeInTheDocument()
    expect(screen.getByText('Produção')).toBeInTheDocument()
    expect(screen.getByText('Relatórios')).toBeInTheDocument()
  })

  it('shows Configurações only for ADMIN', () => {
    render(<Sidebar />)
    expect(screen.getByText('Configurações')).toBeInTheDocument()
  })
})
```

- [ ] **Step 2: Run test — expect FAIL**

```bash
npx jest src/components/layout/__tests__/Sidebar.test.tsx
```

- [ ] **Step 3: Create `src/stores/ui.store.ts`**

```typescript
import { create } from 'zustand'

interface UIStore {
  sidebarOpen: boolean
  toggleSidebar: () => void
}

export const useUIStore = create<UIStore>((set) => ({
  sidebarOpen: true,
  toggleSidebar: () => set((s) => ({ sidebarOpen: !s.sidebarOpen })),
}))
```

- [ ] **Step 4: Create `src/components/layout/SyncBadge.tsx`**

```typescript
'use client'

interface SyncBadgeProps {
  pendingCount: number
}

export function SyncBadge({ pendingCount }: SyncBadgeProps) {
  if (pendingCount === 0) return null

  return (
    <div className="flex items-center gap-1 rounded-full bg-sync-pending px-2 py-0.5 text-xs text-white">
      <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
          d="M3 15a4 4 0 004 4h9a5 5 0 10-.1-9.999 5.002 5.002 0 10-9.78 2.096A4.001 4.001 0 003 15z" />
      </svg>
      {pendingCount}
    </div>
  )
}
```

- [ ] **Step 5: Create `src/components/layout/Sidebar.tsx`**

```typescript
'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { cn } from '@/lib/utils'

const NAV_ITEMS = [
  { label: 'Dashboard',   href: '/dashboard',            icon: '📊' },
  { label: 'Talhões',     href: '/talhoes',              icon: '🗺️' },
  { label: 'Atividades',  href: '/atividades/historico', icon: '📋' },
  { label: 'Produção',    href: '/producao/historico',   icon: '🍌' },
  { label: 'Relatórios',  href: '/relatorios',           icon: '📈' },
]

const ADMIN_ITEMS = [
  { label: 'Configurações', href: '/configuracoes/usuarios', icon: '⚙️' },
]

export function Sidebar() {
  const pathname = usePathname()
  const { data: session } = useSession()
  const role = (session?.user as any)?.role

  const items = role === 'ADMIN' ? [...NAV_ITEMS, ...ADMIN_ITEMS] : NAV_ITEMS

  return (
    <aside className="hidden md:flex flex-col w-60 min-h-screen bg-primary text-white p-4">
      <div className="mb-8">
        <h1 className="text-xl font-bold text-accent">IGUE Bananas</h1>
        <p className="text-xs text-primary-100 mt-1">{session?.user?.name}</p>
      </div>

      <nav className="flex flex-col gap-1">
        {items.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              'flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors',
              pathname.startsWith(item.href)
                ? 'bg-primary-800 text-accent font-medium'
                : 'text-primary-100 hover:bg-primary-800 hover:text-white'
            )}
          >
            <span>{item.icon}</span>
            {item.label}
          </Link>
        ))}
      </nav>
    </aside>
  )
}
```

- [ ] **Step 6: Create `src/components/layout/BottomNav.tsx`**

```typescript
'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'

const BOTTOM_ITEMS = [
  { label: 'Dashboard',  href: '/dashboard',            icon: '📊' },
  { label: 'Talhões',    href: '/talhoes',              icon: '🗺️' },
  { label: 'Registrar',  href: '/atividades/novo',      icon: '➕' },
  { label: 'Produção',   href: '/producao/historico',   icon: '🍌' },
  { label: 'Relatórios', href: '/relatorios',           icon: '📈' },
]

export function BottomNav() {
  const pathname = usePathname()

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 flex md:hidden bg-primary border-t border-primary-800">
      {BOTTOM_ITEMS.map((item) => (
        <Link
          key={item.href}
          href={item.href}
          className={cn(
            'flex flex-1 flex-col items-center gap-1 py-2 text-xs',
            pathname.startsWith(item.href)
              ? 'text-accent font-medium'
              : 'text-primary-100'
          )}
        >
          <span className="text-lg">{item.icon}</span>
          {item.label}
        </Link>
      ))}
    </nav>
  )
}
```

- [ ] **Step 7: Create `src/components/layout/AppShell.tsx`**

```typescript
'use client'

import { Sidebar } from './Sidebar'
import { BottomNav } from './BottomNav'

export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <main className="flex-1 overflow-auto pb-16 md:pb-0">
        {children}
      </main>
      <BottomNav />
    </div>
  )
}
```

- [ ] **Step 8: Create `src/app/(app)/layout.tsx`**

```typescript
import { redirect } from 'next/navigation'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { AppShell } from '@/components/layout/AppShell'

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const session = await getServerSession(authOptions)
  if (!session) redirect('/login')

  return <AppShell>{children}</AppShell>
}
```

- [ ] **Step 9: Create login page `src/app/(auth)/login/page.tsx`**

```typescript
'use client'

import { useState } from 'react'
import { signIn } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input }  from '@/components/ui/input'
import { Label }  from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export default function LoginPage() {
  const router = useRouter()
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)
    setError('')
    const form = new FormData(e.currentTarget)

    const result = await signIn('credentials', {
      email:    form.get('email'),
      password: form.get('password'),
      redirect: false,
    })

    if (result?.error) {
      setError('Email ou senha incorretos.')
      setLoading(false)
      return
    }

    router.push('/dashboard')
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-surface p-4">
      <Card className="w-full max-w-sm border-primary/20">
        <CardHeader className="text-center">
          <div className="text-4xl mb-2">🍌</div>
          <CardTitle className="text-primary text-2xl">IGUE Bananas</CardTitle>
          <p className="text-sm text-muted-foreground">Gestão do sítio</p>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" name="email" type="email" required autoFocus />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Senha</Label>
              <Input id="password" name="password" type="password" required />
            </div>
            {error && <p className="text-sm text-destructive">{error}</p>}
            <Button type="submit" className="w-full bg-primary hover:bg-primary-800" disabled={loading}>
              {loading ? 'Entrando...' : 'Entrar'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
```

- [ ] **Step 10: Create `src/app/page.tsx`**

```typescript
import { redirect } from 'next/navigation'

export default function RootPage() {
  redirect('/dashboard')
}
```

- [ ] **Step 11: Create placeholder dashboard `src/app/(app)/dashboard/page.tsx`**

```typescript
export default function DashboardPage() {
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold text-primary">Dashboard</h1>
      <p className="text-muted-foreground mt-1">Bem-vindo ao IGUE Bananas</p>
    </div>
  )
}
```

- [ ] **Step 12: Add SessionProvider to root layout `src/app/layout.tsx`**

```typescript
import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { Providers } from '@/components/Providers'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'IGUE Bananas',
  description: 'Gestão operacional e financeira do sítio',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR">
      <body className={inter.className}>
        <Providers>{children}</Providers>
      </body>
    </html>
  )
}
```

- [ ] **Step 13: Create `src/components/Providers.tsx`**

```typescript
'use client'

import { SessionProvider } from 'next-auth/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { useState } from 'react'

export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(() => new QueryClient())

  return (
    <SessionProvider>
      <QueryClientProvider client={queryClient}>
        {children}
      </QueryClientProvider>
    </SessionProvider>
  )
}
```

- [ ] **Step 14: Run sidebar tests — expect PASS**

```bash
npx jest src/components/layout/
```

- [ ] **Step 15: Start dev server and verify login works**

```bash
npm run dev
```

Open http://localhost:3000 — should redirect to /login. Login with `admin@iguebananas.com` / `admin123`. Should land on /dashboard with sidebar visible.

- [ ] **Step 16: Commit**

```bash
git add src/
git commit -m "feat: add app shell, login page, and session handling"
```

---

### Task 7: Render Deploy Config

**Files:**
- Create: `render.yaml`
- Create: `Dockerfile` (optional, Render can use Node directly)

- [ ] **Step 1: Create `render.yaml`**

```yaml
services:
  - type: web
    name: iguebananas
    env: node
    plan: free
    buildCommand: npm install && npx prisma generate && npm run build
    startCommand: npx prisma migrate deploy && npm start
    envVars:
      - key: DATABASE_URL
        fromDatabase:
          name: iguebananas-db
          property: connectionString
      - key: NEXTAUTH_SECRET
        generateValue: true
      - key: NEXTAUTH_URL
        value: https://iguebananas.onrender.com
      - key: NODE_ENV
        value: production

databases:
  - name: iguebananas-db
    plan: free
    databaseName: iguebananas
    user: iguebananas
```

- [ ] **Step 2: Commit**

```bash
git add render.yaml
git commit -m "feat: add Render deploy config"
```

---

## Phase 1 Complete

At this point you have:
- Working Next.js app with TypeScript
- PostgreSQL schema with all entities
- Auth (login/logout with role-based session)
- App shell (sidebar desktop + bottom nav mobile)
- Campo Verde design system
- Render deploy config

**Next:** Phase 2 — Talhões CRUD + Map Canvas (Konva.js)
