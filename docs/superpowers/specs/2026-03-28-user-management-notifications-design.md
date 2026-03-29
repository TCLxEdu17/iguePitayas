# Gestão de Usuários & Notificações — Design Spec
*Data: 2026-03-28*

## Visão Geral

Quatro subsistemas interligados:

1. **Gestão de Usuários** — CRUD completo de perfis pelo admin
2. **Audit Log** — registro de todas as ações com quem, o quê, quando
3. **Push ao Admin** — notificação imediata via Firebase quando algo é registrado
4. **Relatório Semanal** — push toda segunda às 7h com resumo da semana

---

## 1. Gestão de Usuários

### UI

Nova página `/admin/usuarios` (guard: `role === 'ADMIN'`).

- **Lista**: tabela com nome, email, role, status (ativo/inativo), botão editar
- **Modal Criar**: nome, email, senha inicial, role (ADMIN/OPERATOR/VIEWER)
- **Modal Editar**: nome, email, role, nova senha (opcional), toggle ativo/inativo
- **Desativar**: soft delete — `active = false`, não deleta registro (preserva histórico)

Link "Usuários" adicionado ao `ADMIN_ITEMS` no `Sidebar.tsx` e `BottomNav.tsx`.

### API

Todas as rotas requerem `role === 'ADMIN'`.

**`GET /api/admin/users`**
```
→ retorna User[] (sem passwordHash)
Campos: id, name, email, role, active, createdAt
```

**`POST /api/admin/users`**
```
Body: { name, email, password, role }
Validação: email único, senha mínimo 6 chars, role válido
→ bcrypt hash da senha, cria User
→ retorna User criado (sem passwordHash)
```

**`PUT /api/admin/users/[id]`**
```
Body: { name?, email?, role?, password?, active? }
Não permite alterar próprio role ou desativar própria conta
→ retorna User atualizado (sem passwordHash)
```

### Validação Zod — `src/lib/validations/user.ts`

```ts
export const createUserSchema = z.object({
  name:     z.string().min(2),
  email:    z.string().email(),
  password: z.string().min(6),
  role:     z.enum(['ADMIN', 'OPERATOR', 'VIEWER']),
})

export const updateUserSchema = z.object({
  name:     z.string().min(2).optional(),
  email:    z.string().email().optional(),
  password: z.string().min(6).optional(),
  role:     z.enum(['ADMIN', 'OPERATOR', 'VIEWER']).optional(),
  active:   z.boolean().optional(),
})
```

---

## 2. Audit Log

### Prisma — novo model

```prisma
model AuditLog {
  id          String   @id @default(cuid())
  userId      String
  action      String
  entityType  String
  entityId    String
  description String
  createdAt   DateTime @default(now())

  user User @relation(fields: [userId], references: [id])
}
```

Adicionar `auditLogs AuditLog[]` ao model `User`.

### Migration

`prisma migrate dev --name add_audit_log`

### Helper — `src/lib/audit.ts`

```ts
export async function logAction(params: {
  userId: string
  action: string       // 'CREATE_ACTIVITY' | 'EDIT_ACTIVITY' | 'DELETE_ACTIVITY' | ...
  entityType: string   // 'Activity' | 'Harvest' | 'Plot' | 'User'
  entityId: string
  description: string  // "João criou Pulverização no Talhão 01"
}): Promise<void>
```

Chamado após cada operação bem-sucedida nas rotas:
- `POST /api/activities` → `CREATE_ACTIVITY`
- `PUT /api/activities/[id]` → `EDIT_ACTIVITY`
- `DELETE /api/activities/[id]` → `DELETE_ACTIVITY`
- `POST /api/harvests` → `CREATE_HARVEST`
- `PUT /api/harvests/[id]` → `EDIT_HARVEST`
- `DELETE /api/harvests/[id]` → `DELETE_HARVEST`
- `POST /api/plots` → `CREATE_PLOT`
- `PUT /api/plots/[id]` → `EDIT_PLOT`
- `DELETE /api/plots/[id]` → `DELETE_PLOT`
- `POST /api/admin/users` → `CREATE_USER`
- `PUT /api/admin/users/[id]` → `EDIT_USER`

### API

**`GET /api/admin/audit`**
```
Query: date (YYYY-MM-DD, default: hoje)
Guard: ADMIN
→ retorna AuditLog[] com user.name incluso, ordenado por createdAt desc
```

### UI

Na página `/configuracoes`, nova aba **"Hoje"** mostrando feed do dia:
```
14:32  João  →  Criou Pulverização no Talhão 01
13:15  Maria →  Registrou colheita de 40 caixas no Talhão 03
```

---

## 3. Push ao Admin

### Dependência

```bash
npm install firebase-admin
```

### Env var

```
FIREBASE_SERVICE_ACCOUNT={"type":"service_account","project_id":"..."}
```
JSON stringify da chave de conta de serviço do Firebase Console.

### Helper — `src/lib/push.ts`

```ts
export async function sendToAdmins(title: string, body: string): Promise<void>
```

Fluxo:
1. Se `FIREBASE_SERVICE_ACCOUNT` não estiver definido → skip silencioso
2. Busca todos os `PushToken` de usuários com `role === 'ADMIN'` e `active === true`
3. Se não há tokens → skip
4. Envia via `firebase-admin` `messaging.sendEachForMulticast`
5. Remove tokens inválidos (registration-token-not-registered)

### Integração nas rotas

Após `logAction(...)`, chamar `sendToAdmins(...)` com:
- `CREATE_ACTIVITY`: título `"Nova atividade"`, body `description`
- `EDIT_ACTIVITY`: título `"Atividade editada"`, body `description`
- `DELETE_ACTIVITY`: título `"Atividade removida"`, body `description`
- Idem para harvests e plots

Push não bloqueia resposta HTTP — `await sendToAdmins(...)` mas erros são silenciosos (try/catch).

---

## 4. Relatório Semanal

### Cron route — `src/app/api/cron/weekly-report/route.ts`

```
POST /api/cron/weekly-report
Header: Authorization: Bearer <CRON_SECRET>
```

Lógica:
1. Verifica header `Authorization: Bearer ${process.env.CRON_SECRET}`
2. Calcula intervalo: segunda anterior até domingo (7 dias)
3. Agrega do banco: total atividades, total colheitas, receita total, talhões ativos
4. Formata mensagem: `"Semana 24/03–30/03: 12 atividades, 3 colheitas, R$ 4.200 de receita"`
5. Chama `sendToAdmins("Relatório Semanal", mensagem)`

### `vercel.json`

```json
{
  "crons": [
    {
      "path": "/api/cron/weekly-report",
      "schedule": "0 10 * * 1"
    }
  ]
}
```

`0 10 * * 1` = toda segunda-feira às 10:00 UTC = 07:00 BRT.

### Env vars adicionais

```
CRON_SECRET=<string aleatória>
```

Configurar no Vercel Dashboard junto com `FIREBASE_SERVICE_ACCOUNT`.

---

## Estrutura de Arquivos

```
prisma/
└── schema.prisma                          — modificado (AuditLog model)

src/
├── app/
│   ├── (app)/
│   │   ├── admin/
│   │   │   └── usuarios/
│   │   │       └── page.tsx               — novo
│   │   └── configuracoes/
│   │       └── page.tsx                   — modificado (aba "Hoje")
│   └── api/
│       ├── admin/
│       │   ├── users/
│       │   │   ├── route.ts               — novo (GET, POST)
│       │   │   └── [id]/
│       │   │       └── route.ts           — novo (PUT)
│       │   └── audit/
│       │       └── route.ts               — novo (GET)
│       └── cron/
│           └── weekly-report/
│               └── route.ts               — novo (POST)
├── components/
│   └── admin/
│       ├── UserList.tsx                   — novo
│       └── UserModal.tsx                  — novo
├── lib/
│   ├── audit.ts                           — novo
│   ├── push.ts                            — novo
│   └── validations/
│       └── user.ts                        — novo
└── app/(app)/talhoes/page.tsx             — modificado (+ Sidebar/BottomNav links)
```

---

## Env Vars Novas

| Var | Onde configurar | Descrição |
|-----|----------------|-----------|
| `FIREBASE_SERVICE_ACCOUNT` | Vercel Dashboard | JSON stringify da service account key |
| `CRON_SECRET` | Vercel Dashboard | Token de autenticação do cron |

---

## Seed Atualizado

O seed já cria `admin@iguebananas.com` / `admin123` com `role: 'ADMIN'`. Nenhuma alteração necessária.

---

## Pré-requisitos Manuais (fora do código)

1. Firebase Console → criar projeto → Project Settings → Service Accounts → Generate new private key → salvar como `FIREBASE_SERVICE_ACCOUNT` no Vercel
2. Gerar `CRON_SECRET` aleatório e configurar no Vercel
3. No Firebase Console → Cloud Messaging → configurar APNs (iOS) e FCM (Android) conforme spec anterior
