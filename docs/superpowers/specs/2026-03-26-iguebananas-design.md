# IGUE Bananas — Design Spec
*Data: 2026-03-26*

## Visão Geral

App web responsivo (PWA) para gestão operacional e financeira de um sítio produtor de Banana Prata, Banana Nanica e Pitaya. Usado por 4-10 pessoas com conectividade mista (escritório + campo).

---

## Contexto e Decisões Chave

| Fator | Decisão | Motivo |
|---|---|---|
| Conectividade | Offline-first + sync | Uso no campo com sinal instável |
| Mapa | Upload de planta própria + canvas | Sítio tem planta definida, não precisa de satélite |
| Usuários | 4-10, RBAC simples | Admin + Operator + Viewer |
| Produtos | Banana Prata, Banana Nanica, Pitaya | Cada talhão = 1 produto |
| Unidades | Banana → Caixa; Pitaya → Caixa ou Unidade | Regra de negócio por produto |
| Hosting | Render (Web Service + PostgreSQL) | Usuário familiarizado |
| Design | Campo Verde (verde escuro + amarelo banana) | Identidade rural + legibilidade em campo |

---

## Stack Técnica

| Camada | Tecnologia |
|---|---|
| Framework | Next.js 14 (App Router) + TypeScript |
| Banco de dados | PostgreSQL (Render Managed DB) |
| ORM | Prisma |
| Auth | NextAuth.js (credentials + session) |
| UI | Tailwind CSS + shadcn/ui |
| Estado global | Zustand |
| Offline storage | Dexie.js (IndexedDB) |
| Sync | Background Sync API + TanStack Query |
| Mapa/Canvas | Konva.js |
| Data fetching | TanStack Query (React Query) |
| Deploy | Render (Web Service + PostgreSQL) |

---

## Modelagem de Dados

### Enums
```prisma
enum Role        { ADMIN OPERATOR VIEWER }
enum ProductType { BANANA_PRATA BANANA_NANICA PITAYA }
enum PlotStatus  { ACTIVE INACTIVE MAINTENANCE }
enum ActivityType { PULVERIZACAO ROCAGEM RETIRADA_BANANA RETIRADA_CAIXAS OUTRO }
enum Unit         { CAIXA UNIDADE }
enum SyncStatus   { PENDING SYNCED CONFLICT }
```

### Entidades Principais

**User**
- id, name, email, passwordHash, role: Role, active, createdAt

**Farm** (singleton — um sítio)
- id, name, mapImageUrl, mapBounds: JSON

**Plot** (Talhão)
- id, farmId, code, name, area (m²), productType: ProductType, status: PlotStatus
- polygon: JSON (array de {x,y} relativos à imagem do mapa)
- notes, createdAt, updatedAt

**Activity** (Registro diário de atividade)
- id, plotId, userId, date, type: ActivityType
- responsible (nome livre), quantity, unit: Unit, cost, notes
- status (rascunho | confirmado), syncStatus: SyncStatus
- localId (UUID gerado offline), createdAt, updatedAt

**Harvest** (Colheita/Produção)
- id, plotId, userId, date
- quantity, unit: Unit (Pitaya aceita UNIDADE; banana sempre CAIXA)
- pricePerUnit, totalRevenue (calculado)
- notes, syncStatus: SyncStatus
- localId, createdAt, updatedAt

---

## Estrutura de Navegação

```
├── /dashboard          — KPIs do dia/semana/mês por produto
├── /talhoes
│   ├── /mapa           — Planta do sítio + polígonos interativos
│   └── /lista          — CRUD de talhões
├── /atividades
│   ├── /novo           — Formulário rápido (offline-ready)
│   └── /historico      — Filtros: data, talhão, tipo
├── /producao
│   ├── /novo           — Registrar colheita
│   └── /historico      — Colheitas + preços + receita
├── /relatorios
│   ├── /diario
│   ├── /semanal
│   └── /mensal
└── /configuracoes      — Admin only
    ├── /usuarios
    ├── /mapa           — Upload da planta
    └── /atividades     — Tipos customizados
```

---

## RBAC (Permissões)

| Recurso | ADMIN | OPERATOR | VIEWER |
|---|---|---|---|
| Dashboard | ✅ | ✅ | ✅ |
| Ver talhões/mapa | ✅ | ✅ | ✅ |
| Cadastrar/editar talhão | ✅ | ❌ | ❌ |
| Registrar atividade | ✅ | ✅ | ❌ |
| Registrar colheita | ✅ | ✅ | ❌ |
| Ver relatórios | ✅ | ✅ | ✅ |
| Exportar relatórios | ✅ | ❌ | ❌ |
| Gerenciar usuários | ✅ | ❌ | ❌ |
| Configurações do sítio | ✅ | ❌ | ❌ |

---

## Offline-First Strategy

1. **Escrita offline:** Activity e Harvest salvos no IndexedDB (Dexie.js) com `syncStatus: PENDING` e `localId` UUID
2. **Sync automático:** Quando conexão retorna, background job envia registros pendentes para a API
3. **Conflito:** Se registro com mesmo `localId` já existe no servidor → marca como `CONFLICT`, notifica admin
4. **Badge de status:** Ícone de nuvem no header mostra contagem de registros pendentes
5. **Read offline:** Dados recentes (talhões, últimas atividades) cacheados localmente via TanStack Query

---

## Mapa Interativo (Konva.js)

1. Admin faz upload da planta do sítio (PNG/JPG/PDF convertido)
2. Imagem exibida como layer de fundo no canvas Konva
3. Admin desenha polígonos sobre os talhões (modo edição)
4. Polígonos salvos como `{points: [{x,y}...], plotId}` — coordenadas relativas à imagem
5. Usuários clicam nos polígonos para ver/acessar cada talhão
6. Cores dos polígonos por produto: verde=Prata, amarelo=Nanica, rosa=Pitaya

---

## Design System

**Paleta:**
- Primary: `#1B4332` (verde escuro floresta)
- Accent: `#F4D03F` (amarelo banana)
- Surface: `#F0F4F0` (verde claro, quase branco)
- Text: `#1A1A1A`
- Success: `#27AE60`
- Danger: `#C0392B`
- Produto Prata: `#27AE60`
- Produto Nanica: `#F4D03F`
- Produto Pitaya: `#E91E8C`

**Tipografia:** Inter

**Layout:**
- Desktop: sidebar fixa (240px) + conteúdo principal
- Mobile: bottom navigation (5 tabs) + header com título e sync badge

**Componentes-chave:**
- `PlotCard` — nome, código, produto (badge colorido), área, status
- `ActivityForm` — campos mínimos visíveis + expansível (mobile-first)
- `HarvestForm` — adapta unidade por produto do talhão
- `SyncBadge` — nuvem + contador de pendentes
- `KPICard` — métrica + variação + ícone
- `ReportFilter` — período + talhão + produto

---

## Relatórios

Gerados dinamicamente via queries PostgreSQL agregadas.

**Campos incluídos:**
- Atividades por tipo e talhão
- Colheitas: volume, receita, preço médio por unidade
- Custos de atividades
- Margem estimada (receita - custos)
- Comparativo por produto (Prata vs. Nanica vs. Pitaya)
- Filtros: período (diário/semanal/mensal/custom), talhão, produto

---

## Deploy (Render)

```
render.yaml
├── services:
│   └── web (Next.js — Node runtime)
└── databases:
    └── postgres (PostgreSQL 15)
```

Variáveis de ambiente: `DATABASE_URL`, `NEXTAUTH_SECRET`, `NEXTAUTH_URL`

---

## MVP vs. Futuro

### MVP (v1)
- Auth (login/logout, 3 roles)
- CRUD de talhões + mapa com polígonos
- Registro de atividades (offline-ready)
- Registro de colheitas (offline-ready)
- Dashboard com KPIs básicos
- Relatório mensal simples
- Deploy no Render

### Futuro (v2+)
- Notificações push (colheita atrasada, atividade pendente)
- Integração com preços de mercado de banana
- Fotos por talhão/atividade
- Export PDF dos relatórios
- App nativo (Capacitor/React Native)
- Multi-fazenda
- Tipos de atividade customizáveis pelo admin
- Histórico de preços por produto
