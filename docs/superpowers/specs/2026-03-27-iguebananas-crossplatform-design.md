# IGUE Bananas — Cross-Platform (Capacitor) Design Spec
*Data: 2026-03-27*

## Visão Geral

Transformar o app web existente (Next.js 16) em um app multiplataforma disponível em:
- **Web** — Render (como hoje)
- **iOS** — App Store
- **Android** — Google Play Store

Abordagem: **Capacitor** wrapping o frontend Next.js compilado como export estático. O backend (API routes + PostgreSQL) permanece no Render. Uma codebase, dois alvos de build.

---

## Decisões Chave

| Fator | Decisão | Motivo |
|---|---|---|
| Wrapper mobile | Capacitor | Reusa 100% da UI existente, minimal code changes |
| Build mobile | `output: 'export'` (estático) | Serve localmente no WebView — offline real para a UI |
| Build web | `output: 'standalone'` (como hoje) | SSR continua no Render |
| API mobile | `NEXT_PUBLIC_API_URL` → Render | Calls absolutas para `https://iguebananas.onrender.com` |
| Auth guard | Client-side `useSession` | Server components não existem no export estático |
| Push notifications | `@capacitor/push-notifications` | FCM (Android) + APNs (iOS) |
| Push MVP scope | Registro de token + notificação local de sync | Server-push (colheita atrasada etc.) fica para v2 |
| Firebase config | `google-services.json` + `GoogleService-Info.plist` | Gitignored, setup manual por desenvolvedor |

---

## Arquitetura

```
┌─────────────────────────────────────────────┐
│                One Codebase                  │
│           (Next.js 16 + Capacitor)           │
└──────────────┬──────────────────────────────┘
               │
       ┌───────┴───────┐
       │               │
  npm run build   npm run build:mobile
  (standalone)    (export estático)
       │               │
       ▼               ▼
   Render Web     Capacitor Bundle
  (SSR + API)    (WebView local + API → Render)
       │               │
       │        ┌──────┴──────┐
       │        │             │
       │      iOS App     Android App
       │     (App Store) (Play Store)
       │
  PostgreSQL (Render Managed DB)
```

**Fluxo de dados no mobile:**
1. WebView serve arquivos estáticos de `out/` (offline-capable)
2. Atividades/colheitas offline → IndexedDB (Dexie.js) → sync ao reconectar
3. Todas as chamadas de API → `https://iguebananas.onrender.com/api/...`
4. Auth (NextAuth) → sessão JWT via cookie no WebView

---

## Mudanças de Código

### 1. Helper `getApiUrl` — `src/lib/api-url.ts`

```ts
export const getApiUrl = (path: string): string =>
  `${process.env.NEXT_PUBLIC_API_URL ?? ''}${path}`
```

Todos os `fetch('/api/...')` em client components trocam para `fetch(getApiUrl('/api/...'))`.

No web: `NEXT_PUBLIC_API_URL` é vazio → URLs relativas funcionam normalmente.
No mobile: `NEXT_PUBLIC_API_URL=https://iguebananas.onrender.com` → URLs absolutas.

### 2. Auth guard client-side — `src/app/(app)/layout.tsx`

Hoje usa `getServerSession` (server component). No export estático não existe servidor, então vira client component:

```tsx
'use client'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const { data: session, status } = useSession()
  const router = useRouter()

  useEffect(() => {
    if (status === 'unauthenticated') router.replace('/login')
  }, [status, router])

  if (status === 'loading') return <div className="flex items-center justify-center h-screen">Carregando...</div>
  if (!session) return null

  return <AppShell>{children}</AppShell>
}
```

### 3. Compatibilidade export estático

**`next.config.ts`** — output condicional:
```ts
const isMobile = process.env.NEXT_PUBLIC_BUILD_TARGET === 'mobile'

const nextConfig: NextConfig = {
  output: isMobile ? 'export' : 'standalone',
  images: isMobile ? { unoptimized: true } : {},
  trailingSlash: isMobile,
}
```

**`src/app/(app)/talhoes/[id]/page.tsx`** — adicionar `generateStaticParams`:
```ts
export async function generateStaticParams() {
  return [] // rotas dinâmicas geradas client-side via fallback
}
export const dynamic = 'force-static'
```

**`package.json`** — novo script:
```json
"build:mobile": "NEXT_PUBLIC_BUILD_TARGET=mobile NEXT_PUBLIC_API_URL=https://iguebananas.onrender.com next build && npx cap sync"
```

### 4. Push Notifications

**Prisma — novo model:**
```prisma
model PushToken {
  id        String   @id @default(cuid())
  userId    String
  token     String   @unique
  platform  String   // 'ios' | 'android'
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
  user      User     @relation(fields: [userId], references: [id], onDelete: Cascade)
}
```

**API — `src/app/api/notifications/register/route.ts`:**
```ts
POST /api/notifications/register
Body: { token: string, platform: 'ios' | 'android' }
Auth: requer sessão válida
→ upsert PushToken por token
→ retorna 200
```

**Hook — `src/hooks/usePushNotifications.ts`:**
```ts
// Solicita permissão após login
// Registra token via @capacitor/push-notifications
// Chama POST /api/notifications/register
// Escuta foreground notifications → mostra toast
// Ao sync completar → PushNotifications.schedule() (notificação local)
```

**Dependências:**
```bash
npm install @capacitor/core @capacitor/cli @capacitor/push-notifications @capacitor/app
```

---

## Capacitor Config — `capacitor.config.ts`

```ts
import { CapacitorConfig } from '@capacitor/cli'

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

---

## Setup iOS e Android

```bash
npx cap add ios    # gera ios/
npx cap add android # gera android/
```

Ambos os diretórios são **gitignored** (gerados automaticamente pelo `cap sync`).

**Firebase setup (manual, fora do código):**
- Criar projeto em [console.firebase.google.com](https://console.firebase.google.com)
- Android: baixar `google-services.json` → colocar em `android/app/`
- iOS: baixar `GoogleService-Info.plist` → colocar em `ios/App/App/`
- Nunca commitar esses arquivos

**APNs setup (iOS, manual):**
- Apple Developer Portal → Certificates → Push Notifications
- Configurar no Firebase Console → Project Settings → Cloud Messaging → APNs

---

## CORS no Backend

O backend Render precisa aceitar requisições do Capacitor (`capacitor://localhost`):

**`src/app/api/[...]/route.ts`** — headers adicionados via middleware ou `next.config.ts`:
```ts
// next.config.ts
headers: async () => [{
  source: '/api/:path*',
  headers: [
    { key: 'Access-Control-Allow-Origin', value: process.env.CORS_ORIGIN ?? '*' },
    { key: 'Access-Control-Allow-Credentials', value: 'true' },
  ]
}]
```

---

## Estrutura de Arquivos Novos/Modificados

```
├── capacitor.config.ts           — novo
├── next.config.ts                — modificado (output condicional)
├── package.json                  — modificado (build:mobile script)
├── src/
│   ├── app/
│   │   ├── (app)/
│   │   │   ├── layout.tsx        — modificado (client-side auth)
│   │   │   └── talhoes/[id]/page.tsx — modificado (generateStaticParams)
│   │   └── api/
│   │       └── notifications/
│   │           └── register/
│   │               └── route.ts  — novo
│   ├── hooks/
│   │   └── usePushNotifications.ts — novo
│   └── lib/
│       └── api-url.ts            — novo
└── prisma/
    └── schema.prisma             — modificado (PushToken model)
```

---

## .gitignore — adições

```
# Capacitor
ios/
android/
# Firebase
google-services.json
GoogleService-Info.plist
```

---

## Cookie SameSite para Mobile

O WebView do Capacitor faz requests cross-origin (`capacitor://localhost` → `https://iguebananas.onrender.com`). Cookies de sessão do NextAuth precisam de `SameSite=None; Secure` para serem enviados nesse contexto.

**`src/lib/auth.ts`** — adicionar configuração de cookies:
```ts
export const authOptions: NextAuthOptions = {
  // ... existing config ...
  cookies: {
    sessionToken: {
      name: `next-auth.session-token`,
      options: {
        httpOnly: true,
        sameSite: 'none',
        path: '/',
        secure: true,
      },
    },
  },
}
```

---

## Scripts de Build

| Comando | Resultado |
|---|---|
| `npm run build` | Build web (standalone) para Render |
| `npm run build:mobile` | Build estático + `cap sync` |
| `npx cap open ios` | Abre Xcode para build/submit iOS |
| `npx cap open android` | Abre Android Studio para build/submit Android |
| `npx cap run android` | Roda no emulador Android |

---

## MVP vs Futuro

### MVP (esta fase)
- Build mobile funcionando com Capacitor
- Auth + offline + sync idênticos ao web
- Registro de push tokens (iOS + Android)
- Notificação local ao sync completar

### Futuro (v2)
- Push server-side: colheita atrasada, atividade pendente há X dias
- Firebase Admin SDK no backend para envio
- Fotos por talhão/atividade (câmera nativa via `@capacitor/camera`)
- Multi-farm
