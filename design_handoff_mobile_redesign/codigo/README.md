# IGUE Bananas — implementação do redesign mobile-first

Arquivos prontos para colar no repo (mesma estrutura de pastas).

## 1. Dependência nova

```bash
npm i lucide-react
```

## 2. Banco (Prisma)

Ver `prisma/schema.patch.md`: novos valores em `Unit` e `ActivityType`, e
`Site.defaultPricePerUnit` para o cálculo de receita sem o operador ver preço.

```bash
npx prisma migrate dev -n mobile_redesign
```

## 3. Arquivos

| Arquivo | O que muda |
|---|---|
| `src/app/globals.css` | tipografia (Bricolage Grotesque + Karla), tokens revisados |
| `src/app/layout.tsx` | fontes via next/font + splash (ver abaixo) |

```tsx
// src/app/layout.tsx
import { Bricolage_Grotesque, Karla } from 'next/font/google'

const bricolage = Bricolage_Grotesque({ subsets: ['latin'], variable: '--font-bricolage' })
const karla     = Karla({ subsets: ['latin'], variable: '--font-karla' })

// <html className={\`\${bricolage.variable} \${karla.variable}\`}>
```

| `src/components/layout/SplashScreen.tsx` | abertura com a logo (2,4 s, uma vez por sessão) |
| `src/components/layout/AppShell.tsx` | mobile só com bottom nav; sidebar apenas ≥ md |
| `src/components/layout/BottomNav.tsx` | ícones Lucide, alvos de 56 px, itens por papel |
| `src/components/plots/SiteCarousel.tsx` | carrossel dos 3 sítios, polígonos clicáveis, sítio lembrado |
| `src/components/activities/ActivityForm.tsx` | 12 tipos em grade, unidades em chips, sem valores |
| `src/components/harvests/HarvestForm.tsx` | operador só informa quantidade; preço vem da tabela |
| `src/components/dashboard/AdminDashboard.tsx` | dashboard novo: semana → hoje → números → sítios → alertas |
| `src/types/index.ts` | labels de unidade e de atividade |
| `public/logo.png` | logo recortada |

## 3.1 Observação de caminho

A pasta `src/app/-app-/` neste pacote corresponde a `src/app/(app)/` no repo
(os parênteses não sobrevivem ao empacotamento). Renomeie ao colar.

Também incluídos:

- `src/app/api/prices/route.ts` — preço só para ADMIN (403 para operador)
- `src/app/api/harvests/route.server-note.md` — o cálculo de receita passa para o servidor
- `src/lib/activity-icons.ts` — mapa tipo → ícone Lucide

## 4. Rotas afetadas

- `/` → splash (uma vez por sessão) e redirect por papel: OPERATOR → `/mapa`, ADMIN → `/dashboard`
- `/mapa` (nova) → `SiteCarousel`
- `/atividades/novo?plotId=…` → já entra com o talhão do mapa

## 5. Ainda pendente (decidir com o Fábio)

- Tabela de preços por produto/unidade (tela de admin) — hoje o valor está hardcoded no cálculo.
- `Activity.siteId` / `Harvest.siteId` são redundantes (o talhão já tem sítio): manter só como cache de leitura ou remover.
- `Farm.mapImageUrl` sobrou da época do mapa único.
