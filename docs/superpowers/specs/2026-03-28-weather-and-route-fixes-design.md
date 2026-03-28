# Weather Widget & Route Fixes — Design Spec
*Data: 2026-03-28*

## Visão Geral

Duas melhorias independentes no app IGUE Bananas:

1. **Correções de rotas** — rota `/configuracoes` faltando e cast desnecessária no Sidebar
2. **Widget de clima** — previsão do tempo no Dashboard usando Open-Meteo

---

## 1. Correções de Rotas

### 1.1 Página `/configuracoes`

A rota aparece no menu lateral para usuários ADMIN mas não existe. Será criada com:
- Nome da fazenda (lido de `/api/farm`)
- Nome e email do usuário logado (lido da sessão NextAuth)
- Nenhum campo editável nesta fase — apenas visualização

**Arquivo:** `src/app/(app)/configuracoes/page.tsx`

### 1.2 Limpeza do Sidebar

Remover o cast `(session?.user as any)?.role` — substituir por `session?.user?.role` (tipado via `next-auth.d.ts`).

**Arquivo:** `src/components/layout/Sidebar.tsx`

---

## 2. Widget de Clima

### Localização

Itariri, SP — coordenadas hardcoded:
- `latitude: -24.29`
- `longitude: -47.17`

### API

**Open-Meteo** (`https://api.open-meteo.com/v1/forecast`) — gratuita, sem API key.

Parâmetros usados:
```
latitude=-24.29&longitude=-47.17
&current=temperature_2m,apparent_temperature,weathercode,windspeed_10m
&daily=weathercode,temperature_2m_max,temperature_2m_min,precipitation_sum
&timezone=America/Sao_Paulo
&forecast_days=4
```

### Mapeamento de weathercode → condição

| Código | Condição | Ícone |
|--------|----------|-------|
| 0 | Sol | ☀️ |
| 1–3 | Parcialmente nublado | ⛅ |
| 45–48 | Nevoeiro | 🌫️ |
| 51–67 | Chuvisco/Chuva leve | 🌦️ |
| 71–77 | Neve (improvável em SP) | ❄️ |
| 80–82 | Pancadas de chuva | 🌧️ |
| 95–99 | Tempestade | ⛈️ |

### Alerta de chuva

Se `daily.precipitation_sum[0] > 0` (hoje) ou `daily.precipitation_sum[1] > 0` (amanhã):
- Banner amarelo: "Chuva prevista — evitar pulverização"

### Componentes

**`src/hooks/useWeather.ts`**
- Busca Open-Meteo diretamente do cliente
- `staleTime: 30 * 60 * 1000` (30 min) via TanStack Query
- Retorna: `{ current, daily, isLoading, isError }`

**`src/components/dashboard/WeatherWidget.tsx`**
- Card com temperatura atual, sensação térmica, condição
- Linha de min/máx do dia
- Grade com próximos 3 dias (dia da semana + ícone + min/máx)
- Banner de alerta se chuva prevista

### Integração no Dashboard

`DashboardGrid.tsx` — adicionar `<WeatherWidget />` acima dos KPIs.

---

## Estrutura de Arquivos

```
src/
├── app/(app)/
│   └── configuracoes/
│       └── page.tsx          — novo
├── components/
│   ├── dashboard/
│   │   └── WeatherWidget.tsx — novo
│   └── layout/
│       └── Sidebar.tsx       — modificado (remove cast)
└── hooks/
    └── useWeather.ts         — novo
```

---

## Sem Mudanças

- Sem migração de banco
- Sem nova rota de API
- Sem variável de ambiente
- Sem nova dependência npm (Open-Meteo é REST puro)
