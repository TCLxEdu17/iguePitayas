# Handoff: IGUE Bananas — redesign mobile-first (admin + operador)

## Visão geral

Redesenho completo do app de campo da IGUE Bananas para **mobile-first**, cobrindo os dois
perfis (`ADMIN` e `OPERATOR`), 13 telas, nova identidade tipográfica, ícones Lucide,
abertura animada com a logo e um **carrossel dos 3 sítios com os talhões clicáveis sobre
o mapa real**.

O app existente é Next.js 15 (App Router) + Tailwind v4 + shadcn/ui + Prisma/Postgres +
next-auth + TanStack Query + Dexie (offline) + Zustand. O redesign deve ser implementado
**nesse ambiente**, reaproveitando os padrões que já existem lá.

## Sobre os arquivos deste pacote

- `prototipo/IGUE Bananas App.dc.html` — **referência de design em HTML**. É um protótipo
  navegável (abre no navegador) que mostra aparência e comportamento pretendidos.
  **Não é código de produção e não deve ser copiado para o app.**
- `codigo/` — implementação **de referência** em React/TSX já adaptada ao repo
  (mesma estrutura de pastas). Serve como ponto de partida: cole, ajuste os imports e
  confira contra o protótipo. Onde código e protótipo divergirem, **o protótipo manda**.
- `assets/` — logo recortada e os 3 mapas + polígonos dos 27 talhões.
- `revisao-projeto.md` — as 12 incoerências encontradas no código atual e as decisões tomadas.

## Fidelidade

**Alta fidelidade (hi-fi).** Cores, tipografia, espaçamentos, raios e animações abaixo são
finais. Recreie pixel a pixel usando Tailwind v4 + os tokens da seção "Design tokens".
Onde o protótipo usa `style` inline com hex, prefira a variável CSS equivalente.

---

# 1. Design tokens

## Cores

| Token | Hex | Uso |
|---|---|---|
| `--color-canopy` | `#1F2E15` | barra inferior, fundos escuros |
| `--color-primary` | `#3D5A2E` | ações primárias, chips ativos, seleção |
| `--color-primary-hover` | `#2E4522` | hover do botão primário |
| `--color-leaf` | `#6E8F4E` | positivo, barras de receita |
| `--color-leaf-light` | `#8DB87A` | confirmação, banana prata |
| `--color-accent` | `#C17A4A` | colheita, custo, terracota |
| `--color-accent-dark` | `#A8632F` | hover/texto sobre areia |
| `--color-gold` | `#D4A843` | destaque, item ativo na nav, banana nanica |
| `--color-pitaya` | `#E91E8C` | produto pitaya |
| `--color-paper` | `#FBF6EA` | fundo das telas |
| `--color-card` | `#FFFDF8` | fundo de cartão |
| `--color-surface` | `#F5ECD7` | texto sobre verde escuro |
| `--color-surface-2` | `#F2EAD5` | caixa de aviso neutra |
| `--color-line` | `#E8DDC2` | borda de cartão (1px) |
| `--color-line-strong` | `#DCCFB0` / `#E0D4B6` | borda de input/chip (1.5px) |
| `--color-line-soft` | `#F0E7D2` | divisória interna de lista, trilha de barra |
| `--color-ink` | `#1F2E15` | texto principal |
| `--color-ink-soft` | `#6B7A5A` | texto secundário |
| `--color-ink-faint` | `#9AA88A` | rótulos, meta |
| `--color-ink-ghost` | `#B0BCA0` | texto terciário |
| pendente | `#F39C12` (texto `#B87708`, `#8A5A06`) | sincronização na fila |
| erro | `#C0392B` | sair, alerta crítico |

Cores por tipo de atividade (usadas em ícone, borda e fundo `+14`/`+1E` de alpha):

```
PULVERIZACAO #3498DB · ADUBACAO #8B6F3E · ROCAGEM #9B59B6 · DESFOLHA #6E8F4E
DESBASTE #4E7038 · ENSACAMENTO #C17A4A · ESCORA #8A7B5A · IRRIGACAO #2E86C1
RETIRADA_BANANA #27AE60 · RETIRADA_CAIXAS #F39C12 · PLANTIO #16A085 · OUTRO #95A5A6
```

## Tipografia

- **Display** (títulos, números, botões primários): **Bricolage Grotesque**, pesos 600/700/800,
  `letter-spacing: -.01em` a `-.03em` nos tamanhos grandes.
- **Texto** (corpo, rótulos, chips): **Karla**, pesos 400/500/600/700.
- Carregar com `next/font/google` expondo `--font-bricolage` e `--font-karla`.

Escala usada (px):

| Papel | Tamanho / peso / família |
|---|---|
| Número herói (dashboard) | 46 / 800 / display, `line-height: 1` |
| Título de tela | 26–27 / 700 / display |
| Título de seção | 17 / 700 / display |
| Subtítulo de cartão | 15 / 700 / display |
| Número de KPI | 22 / 700 / display |
| Item de lista (título) | 14.5 / 700 / Karla |
| Corpo | 13.5–15 / 400–500 / Karla |
| Meta / secundário | 12.5 / 400 / Karla |
| Rótulo de seção | 11–12 / 700 / Karla, `uppercase`, `letter-spacing: .10–.16em` |
| Badge | 11.5 / 700 / Karla |
| Nav inferior | 10.5 / 600 / Karla |

Mínimo absoluto: 11px (só em rótulo uppercase). Nada de texto de conteúdo abaixo de 12.5px.

## Espaçamento, raio, sombra

- Padding horizontal das telas: **16px** nos formulários, **20px** nas telas de leitura.
- `gap` entre itens de lista: **9px**; entre seções: **22px**; grade de tipos: **8px**.
- Raios: chip/botão pequeno **13–14px**; cartão **16–18px**; cartão herói **20–22px**;
  bottom sheet **26px** (só topo); avatar **14–18px**; pílula **9999px**.
- Bordas: cartão `1px solid #E8DDC2`; input/chip `1.5px solid #E0D4B6`.
- Sombras:
  - cartão herói escuro: `0 18px 34px -18px rgba(31,46,21,.8)`
  - mapa: `0 14px 30px -14px rgba(31,46,21,.55)`
  - botão primário: `0 10px 22px -10px rgba(31,46,21,.7)`
  - bottom sheet: `0 -20px 40px -20px rgba(0,0,0,.4)`
  - logo na abertura: `0 22px 50px -18px rgba(0,0,0,.6)`

## Alvos de toque

Regra do projeto: **nada abaixo de 44px**. Chips e botões secundários **44px**;
botão de tipo de atividade **82px**; campo numérico **62–68px**; botão primário **56–58px**;
item da nav inferior **56px**.

---

# 2. Layout global

## Shell (`AppShell`)

- Mobile (`< md`): **sem gaveta lateral e sem hambúrguer**. Navegação exclusivamente pela
  barra inferior. `<main>` com `padding-bottom: calc(env(safe-area-inset-bottom) + 5rem)`.
- Desktop (`≥ md`): mantém a `Sidebar` existente; a barra inferior fica `hidden md:flex`
  (isto é, some no desktop).
- Header: 48px de altura, fundo `--color-paper`, só `SyncBadge` à direita no mobile.
- Não há barra de status falsa: no protótipo ela existe apenas para simular o aparelho.

## Barra inferior (`BottomNav`)

- `position: fixed; bottom: 0`, fundo `#1F2E15`, `border-top: 1px solid rgba(232,223,198,.1)`,
  `padding-top: 8px`, `padding-bottom: calc(env(safe-area-inset-bottom) + 14px)`.
- Itens dividem a largura (`flex: 1`), ícone Lucide 22px `strokeWidth 1.9` + rótulo 10.5px/600,
  `gap: 4px`, `min-height: 56px`.
- Ativo: `#D4A843`. Inativo: `rgba(245,236,215,.55)`. Sem pílula, sem fundo.
- **Operador**: Mapa (`Map` → `/mapa`) · Lançar (`Plus` → `/atividades/novo`) ·
  Meus (`ClipboardList` → `/atividades/historico`) · Perfil (`User` → `/configuracoes`).
- **Admin**: Início (`Home` → `/dashboard`) · Atividades (`ClipboardList`) ·
  Produção (`Leaf` → `/producao/historico`) · Relatórios (`BarChart3`) · Mapa (`Map`).
- Ativo quando `pathname === href || pathname.startsWith(href + '/')`.

## Ícones

`lucide-react`, `strokeWidth` 1.8–1.9 (2.0–2.4 apenas em check e setas pequenas).
Tamanhos: 16 (inline em rótulo), 17–19 (lista/alerta), 20–22 (nav, botão), 42 (confirmação).
**Nenhum emoji em UI.** Mapa tipo→ícone em `codigo/src/lib/activity-icons.ts`.

---

# 3. Telas

## 3.1 Abertura (splash)

**Objetivo:** marca + tempo de carregar sessão/dados offline. Aparece **uma vez por sessão**
(`sessionStorage['igue.splashSeen']`), dura **2,4 s** e sai sozinha.

- Fundo: `radial-gradient(100% 70% at 50% 78%, #3D5A2E 0%, #1F2E15 55%, #141B0F 100%)`.
- Halo: círculo 300×300, `radial-gradient(circle, rgba(212,168,67,.45) 0%, transparent 66%)`,
  animação `glow-pulse` 3.4s ease-in-out infinita (opacidade .25→.5, escala 1→1.12).
- Logo: `/logo.png` 216×216, `border-radius: 50%`, animação `logo-in` 0.95s
  `cubic-bezier(.2,.85,.2,1)`: `scale(.6) rotate(-8deg)` → 60% `scale(1.05) rotate(2deg)`
  → `scale(1) rotate(0)`, opacidade 0→1.
- Assinatura: **"Prata e Nanica"**, display 14px/600, `uppercase`, `letter-spacing: .4em`,
  `rgba(245,236,215,.7)`, `rise-in` 0.8s com `delay .9s`.
- Rodapé (48px do fundo): "Sede · Guanhanhã · Guanhanhã II", 12px, `letter-spacing: .16em`,
  `rgba(245,236,215,.35)`, `rise-in` com `delay 1.3s`.
- `gap` vertical entre blocos: 32px. Sem botão de pular.

`rise-in`: `opacity 0 → 1`, `translateY(14px) → 0`, 0.8s `cubic-bezier(.2,.8,.2,1)`.

## 3.2 Entrar

Fundo `linear-gradient(180deg, #FBF6EA 0%, #F1E6CC 100%)`, conteúdo centralizado
verticalmente, padding `40px 26px`, `gap: 26px`.

- Logo 62×62 redonda, `margin-bottom: 18px`, sombra `0 8px 18px -8px rgba(31,46,21,.5)`.
- Título "Bom dia." display 30/700; subtítulo "Entre para lançar o dia no campo." 15px `#6B7A5A`.
- Campos: rótulo 12px/600 uppercase `letter-spacing .06em` `#6B7A5A`; input **52px**,
  raio 14, `1.5px solid #DCCFB0`, fundo `#FFFDF8`, texto 16px (evita zoom no iOS),
  `:focus` → `border-color: #3D5A2E`.
- Botão primário "Entrar" **56px**, raio 16, `#3D5A2E`, texto display 17/700 `#FBF6EA`,
  sombra `0 10px 20px -8px rgba(31,46,21,.6)`, hover `#2E4522`.
  (No protótipo há dois botões só para escolher o papel; **no app é um só**.)
- Aviso offline: caixa raio 14, fundo `rgba(193,122,74,.12)`, borda `rgba(193,122,74,.25)`,
  ícone `WifiOff` 17px `#A8632F`, texto 12.5px `#7A4A22`:
  "Sem sinal? Você entra com o último acesso e tudo fica salvo no aparelho."

## 3.3 Operador · Mapa (tela inicial do operador, `/mapa`)

**Objetivo:** ver o sítio onde trabalha e tocar no talhão para lançar.

**Cabeçalho** (padding `6px 20px 12px`): rótulo "Seu sítio" (11/600 uppercase `.16em`
`#9AA88A`), nome do sítio display 27/700, meta 13px `#6B7A5A` = `"{n} talhões · {pés} pés"`.
À direita, dois botões 42×42 raio 13, `1.5px solid #E0D4B6`, fundo `#FFFDF8`,
ícones `Search` e `ClipboardList` 19px `#3D5A2E`; hover muda a borda para `#3D5A2E`.

**Chips de sítio**: linha com `overflow-x: auto`, `gap: 8px`, padding lateral 20px.
Chip 44px, raio 13, texto 13.5/700. Ativo: fundo e borda `#3D5A2E`, texto `#FBF6EA`.
Inativo: fundo `#FFFDF8`, borda `#E0D4B6`, texto `#6B7A5A`.

**Carrossel (o ponto central do pedido):**

- Trilho: `display: flex; overflow-x: auto; scroll-snap-type: x mandatory`, scrollbar oculta.
- Slide: `flex: 0 0 100%`, `scroll-snap-align: center`, `padding: 0 20px`, `box-sizing: border-box`.
- Cartão do mapa: raio 20, `overflow: hidden`, fundo `#2C3E1F` **+ a imagem do mapa como
  `background-image`** (`center / 100% 100% no-repeat`), sombra do mapa.
  Não use `<image>` dentro do SVG (não renderiza em captura e gera erro de recurso).
- Sobre o cartão, um `<svg>` só com os **polígonos**: `viewBox="0 0 100 100"`,
  `preserveAspectRatio="none"`, pontos = coordenadas normalizadas × 100,
  `fill: rgba(<cor do talhão>, .34)`, `stroke: rgba(251,246,234,.55)`,
  `stroke-width: 2.5` (`vectorEffect="non-scaling-stroke"`), `cursor: pointer`.
  Selecionado: `stroke: #FBF6EA`, `stroke-width: 5`.
- **Dots**: 3 marcas 7px de altura, raio 5; ativo tem 22px de largura e cor `#3D5A2E`,
  inativo 7px `#DCCFB0`, transição de largura .2s. Padding `14px 0 6px`.
- Legenda: "Arraste para trocar de sítio · toque num talhão para lançar", 12.5px `#9AA88A`, centralizada.

**Persistência do sítio (obrigatório):** `localStorage['igue.siteId']`.
Ao montar, com os sítios carregados: acha o índice salvo, seta o estado e ajusta
`rail.scrollLeft = i * rail.clientWidth` dentro de `requestAnimationFrame`.
Ao trocar por chip: mesma atribuição direta de `scrollLeft` — **não** use
`scrollTo({behavior:'smooth'})`, o scroll-snap cancela e o mapa fica dessincronizado do cabeçalho.
Ao arrastar: `onScroll` → `Math.round(scrollLeft / clientWidth)`; se mudou, atualiza estado e localStorage.

**Lista "Talhões deste sítio"**: grade `1fr 1fr`, `gap: 8px`. Item: 52px, raio 14,
`1.5px solid #E8DDC2`, fundo `#FFFDF8`, quadradinho 12×12 raio 4 com a cor do talhão,
nome 13.5/700 truncado, pés 11.5px `#8B9A7A`.

**Ficha do talhão (bottom sheet)** — abre ao tocar no polígono ou no item da lista:

- Backdrop `rgba(20,27,15,.5)`, clique fecha.
- Painel: raio `26px 26px 0 0`, fundo `#FBF6EA`, `padding: 10px 20px 26px`
  (+ `env(safe-area-inset-bottom)`), animação `sheet-up` 0.32s `cubic-bezier(.2,.9,.2,1)`
  (`translateY(100%) → 0`). Alça 42×4 `#DCCFB0` centralizada, `margin-bottom: 16px`.
- Nome do sítio (11/600 uppercase `.16em` `#9AA88A`), nome do talhão display 25/700.
  Botão fechar 38×38 raio 12 fundo `#EFE5CC`, ícone `X` 18px.
- Dois blocos lado a lado (`gap: 8px`, raio 14, `#FFFDF8`, borda `#E8DDC2`, padding 12):
  "Pés" e "Último lançamento" — rótulo 11px `#9AA88A`, valor display 19/700.
- Ações: "Registrar atividade" (56px, raio 16, `#3D5A2E`, display 16.5/700, ícone `Plus` 20px)
  e "Registrar colheita" (52px, raio 16, borda `1.5px #C17A4A`, texto `#A8632F` 15/700,
  ícone `Leaf` 19px). Navegam para `/atividades/novo?plotId=…` e `/producao/novo?plotId=…`.

## 3.4 Operador · Registrar atividade (`/atividades/novo`)

Cabeçalho: botão voltar 40×40 raio 13 fundo `#EFE5CC` (`ChevronLeft` 20px) + título
"Nova atividade" display 21/700. Padding do corpo 16px, `gap: 22px` entre blocos.

1. **Talhão** — faixa raio 18, fundo `#2C3E1F`, texto `#F5ECD7`, ícone `Map` 22px `#D4A843`,
   rótulo "Talhão" 11px uppercase `.14em`, valor display 18/700, botão "Trocar"
   (raio 11, borda `1px rgba(245,236,215,.3)`, texto `#D4A843` 12.5/700) → volta ao mapa.
   Se chegou sem `plotId`, o valor é "Selecione no mapa" e o salvar fica desabilitado.
2. **"O que foi feito"** — grade `1fr 1fr`, `gap: 8px`, **12 botões** de 82px:
   raio 16, borda `1.5px`, ícone 21px em cima, rótulo 13/700 embaixo, alinhado à esquerda,
   `flex-direction: column; gap: 8px`. Inativo: borda `#E8DDC2`, fundo `#FFFDF8`, texto `#6B7A5A`.
   Ativo: borda e texto na cor do tipo, fundo `cor + 14` (alpha ~8%).
3. **"Quando"** — 3 chips de largura igual (`flex: 1`, 44px): Hoje · Ontem · Escolher.
   "Escolher" revela `<input type="date">` de 52px logo abaixo.
4. **"Quanto"** (com sufixo "· opcional" em 12px `#9AA88A`) — stepper:
   `[−]` 56px de largura · campo 62px de altura display 28/700 centralizado
   (borda `1.5px #3D5A2E`) · `[+]` 56px. Abaixo, **8 chips de unidade**
   (kg, caixa, cacho, penca, dúzia, unidade, saco, tonelada), `flex-wrap`, `gap: 7px`,
   ativo em `#C17A4A` com texto `#FFF8EC`.
5. **"Quem fez"** — chips com o usuário logado primeiro ("Eu (Primeiro nome)") + equipe ativa;
   ativo em `#3D5A2E`.
6. **"Observação"** — `textarea` 2 linhas, raio 14, placeholder
   "Ex.: bomba entupiu, terminei só metade".
7. **Aviso offline** (só quando `!navigator.onLine`): fundo `rgba(243,156,18,.12)`,
   borda `rgba(243,156,18,.3)`, ícone `WifiOff` `#B87708`, texto 12.5px `#8A5A06`:
   "Sem sinal agora — salva no aparelho e sobe sozinho quando pegar rede."
8. **Ações**: "Salvar lançamento" (58px, `#3D5A2E`, display 17/700, sombra do botão primário)
   e "Salvar e lançar outro" (50px, borda `1.5px #DCCFB0`, texto `#3D5A2E` 15/700 — salva e
   limpa quantidade e observação, mantendo talhão, tipo, data e responsável).

**Confirmação (overlay de tela cheia)**: fundo `rgba(31,46,21,.94)`, círculo 84px
`#8DB87A` com `Check` 42px `#1F2E15` (`pop-in` 0.45s: `scale(.7)→1.06→1`),
título "Lançado" display 24/700 `#F5ECD7`, resumo 14.5px `rgba(245,236,215,.7)`
(`"{Tipo} · {qtd} {unidade}"`), botão "Continuar" (borda `1.5px rgba(245,236,215,.35)`,
texto `#D4A843`) → volta para `/mapa`.

## 3.5 Operador · Registrar colheita (`/producao/novo`)

Mesma estrutura, com estas diferenças:

- Faixa do talhão em **`#C17A4A`** com texto `#FFF8EC` e ícone `Leaf`.
- "Quanto saiu": campo de **68px**, display 32/700, borda `1.5px #C17A4A`.
- Bloco **"Produto"**: 3 chips (Banana prata `#8DB87A` · Banana nanica `#D4A843` ·
  Pitaya `#E91E8C`) com bolinha 10px da cor; ativo usa a cor como fundo e texto `#1F2E15`.
- **Sem nenhum campo de preço e sem receita para o operador.** O preço vem de
  `ProductPrice` no servidor. Para `ADMIN`, aparece um bloco "Receita estimada · preço da
  tabela" (raio 16, fundo `rgba(61,90,46,.08)`, valor display 24/700 `#3D5A2E`).
- Botão "Salvar colheita" 58px em `#C17A4A`, texto `#FFF8EC`.
- Confirmação: círculo `#D4A843`, título "Colheita lançada", resumo
  `"{qtd} {unidade} · {produto}"`, "Continuar" → `/producao/historico`.

## 3.6 Operador · Meus lançamentos (`/atividades/historico` para OPERATOR)

- Título display 26/700 "Meus lançamentos" + data em 13.5px `#6B7A5A`.
- Dois cartões lado a lado (`gap: 8px`, raio 16, padding 14):
  "Hoje" — fundo `#2C3E1F`, número display 26/700 `#F5ECD7`;
  "A sincronizar" — fundo `#FFFDF8`, borda `1.5px rgba(243,156,18,.4)`, número e rótulo `#B87708`.
- Lista: item raio 16, `#FFFDF8`, borda `#E8DDC2`, padding `13px 14px`, `gap: 12px`.
  Ícone em quadrado 38px raio 12 com `cor+1E` de fundo. Título 14.5/700, local 12.5px `#8B9A7A`
  truncado. À direita: quantidade 13/700 `#3D5A2E` e status 11.5px —
  "Na fila" `#B87708` / "Enviado" `#6E8F4E`. **Nenhum valor em R$.**

## 3.7 Operador · Perfil (`/configuracoes` para OPERATOR)

- Cartão de identidade: raio 20, `#2C3E1F`, avatar 54px raio 18
  (fundo `rgba(212,168,67,.22)`, iniciais display 22/700 `#D4A843`), nome display 20/700,
  "Operador · {sítio}" 12.5px `rgba(245,236,215,.65)`.
- **Sincronização**: cartão raio 18 `#FFFDF8`; bolinha 9px `#F39C12` + "N lançamentos na fila"
  14.5/700, "há X min" 12px `#8B9A7A`; botão "Sincronizar agora" 48px, borda `1.5px #3D5A2E`.
- **Preferências**: lista em cartão raio 18, itens de 15px de padding vertical separados por
  `1px solid #F0E7D2`, ícone 19px `#6B7A5A`, rótulo 14.5px, valor 13/600 `#8B9A7A`:
  Sítio padrão · Unidade preferida · Avisos de sincronia · Modo economia.
- "Sair": 52px, borda `1.5px rgba(192,57,43,.4)`, texto `#C0392B`; versão 11.5px `#B0BCA0` centralizada.

## 3.8 Admin · Início (`/dashboard`)

A pergunta que essa tela responde: **"quanto colhi essa semana e o que foi feito hoje"**.
Ordem obrigatória das seções:

1. **Saudação**: data completa em 11/600 uppercase `.16em` `#9AA88A` + "Bom dia, {nome}" display 27/700.
2. **Cartão herói "Colhido esta semana"** — raio 22, padding 20,
   `linear-gradient(160deg, #3D5A2E 0%, #1F2E15 100%)`, sombra do herói:
   - rótulo 11.5/600 uppercase `.14em` `rgba(245,236,215,.6)`;
   - badge de variação à direita: pílula `rgba(141,184,122,.22)`, texto `#A8CC8C` 12/700,
     ícone `TrendingUp` 13px (`TrendingDown` se negativo);
   - número display **46/800** + unidade "caixas" display 17/600 `#D4A843` (baseline alinhada);
   - linha de apoio 13.5px `rgba(245,236,215,.65)`: `"≈ {t} t · {cachos} cachos · {receita} em receita"`;
   - **gráfico de 7 dias**: faixa de 76px, 7 colunas `flex: 1` com `gap: 6px`;
     barra `border-radius: 6px 6px 3px 3px`, altura `max(4, valor/máx × 56)px`;
     hoje = `linear-gradient(180deg,#D4A843,#C17A4A)`, resto `rgba(168,204,140,.5)`;
     letra do dia 10.5/600 (hoje `#D4A843`, resto `rgba(245,236,215,.45)`).
3. **"O que foi feito hoje"** — cabeçalho de seção (display 17/700) + contagem 12.5/600 `#9AA88A`.
   **Linha do tempo**: por item, coluna esquerda com ícone em quadrado 30px raio 10
   (`cor+1E`) e um fio vertical de 1.5px `#E8DDC2` descendo; à direita, título 14.5/700 +
   hora 12px `#9AA88A` na mesma linha, local·responsável 12.5px `#8B9A7A`, quantidade
   12.5/700 na cor do tipo. `padding-bottom: 14px` por item.
   Fecha com botão "Ver todas as atividades" 46px, borda `1.5px #DCCFB0`, texto `#3D5A2E` 14/700.
4. **"Semana em números"** — grade `1fr 1fr`, `gap: 9px`. Cartão raio 18 `#FFFDF8`
   borda `#E8DDC2` padding 15: ícone 16px + rótulo 11.5/600 uppercase `.08em` `#9AA88A`,
   valor display 22/700, sub 12px na cor do ícone.
   Cartões: Custo semana (`Wallet` `#C17A4A`) · Margem (`TrendingUp` `#6E8F4E`) ·
   Atividades (`ClipboardList` `#3498DB`) · Pés produzindo (`Sprout` `#4E7038`).
5. **"Por sítio"** — cartão raio 20 com `gap: 15px`: por sítio, nome 14/700 + valor 13px
   `#6B7A5A` na mesma linha, e barra de 9px (trilha `#F0E7D2`, raio 6) com largura
   proporcional; cores em ordem `#3D5A2E`, `#6E8F4E`, `#C17A4A`.
6. **"Precisa de olho"** — cartões de alerta raio 16, `display: flex; gap: 11px`, padding 14,
   ícone 19px, título 14/700, texto 12.5px `#6B7A5A`. Três tons:
   - sincronização: `WifiOff` `#B87708`, fundo `rgba(243,156,18,.1)`, borda `rgba(243,156,18,.3)`;
   - talhão parado: `Clock` `#C0392B`, fundo `rgba(192,57,43,.08)`, borda `rgba(192,57,43,.25)`;
   - fora do padrão: `TriangleAlert` `#A8632F`, fundo `rgba(193,122,74,.1)`, borda `rgba(193,122,74,.28)`.
7. **Clima + dica** — dois cartões `flex: 1`, raio 18: clima em
   `linear-gradient(150deg,#C17A4A,#A8632F)` (ícone `Sun`, temperatura display 26/700,
   resumo 12.5px) e dica em `#2C3E1F` (ícone `Droplet` `#D4A843`, texto 13px).

## 3.9 Admin · Atividades (`/atividades/historico`)

- Título display 26/700. **Filtros**: linha rolável de chips de 44px
  (Últimos 7 dias · Todos os sítios · Todos os tipos · Quem fez); o ativo em `#3D5A2E`.
- **Agrupamento por dia**: cabeçalho do grupo 11.5/700 uppercase `.14em` `#9AA88A`
  ("Hoje · 3 ago") com a contagem à direita 12px `#B0BCA0`; `margin-bottom: 22px` por grupo.
- Item: igual ao de "Meus lançamentos", mas com ícone em quadrado 34px e, à direita,
  quantidade 13/700 `#3D5A2E` **e custo 11.5px `#A8632F`** (admin vê valores).

## 3.10 Admin · Produção (`/producao/historico`)

- Dois cartões de topo: "Mês" (`#2C3E1F`, número display 25/700, "caixas · t" 12px `#D4A843`)
  e "Receita" (`#FFFDF8`, display 25/700, média por caixa 12px `#6E8F4E`).
- **"Por produto"**: item raio 16 com barra vertical 14×36 raio 5 na cor do produto,
  nome 14.5/700, quantidade 12.5px `#8B9A7A`, receita display 16/700 `#3D5A2E`.
- **"Últimas colheitas"**: item com bloco de data à esquerda (largura 46, dia display 17/700,
  mês 10.5px uppercase `#B0BCA0`), divisória `1px #EFE5CC` + `padding-left: 12px`,
  quantidade·produto 14/700, local 12.5px truncado, receita 13.5/700 `#A8632F` à direita.

## 3.11 Admin · Relatórios (`/relatorios`)

- 3 chips de período de largura igual: Semana · Mês · Safra.
- **Cartão de margem**: raio 20, gradiente do herói, rótulo "Margem do período",
  valor display **36/800**, e duas colunas: Receita (`#A8CC8C`) e Custo (`#E8A87C`), 16/700.
- **"Comparativo por sítio"**: por sítio, nome 14/700 + margem 12.5/700 `#3D5A2E`;
  duas barras de 8px empilhadas (`gap: 5px`) — receita `#6E8F4E`, custo `#C17A4A`;
  legenda embaixo com quadradinhos 10px.
- Ações: "Baixar PDF do período" (54px, `#3D5A2E`, ícone `Download`) e
  "Enviar por WhatsApp" (50px, borda `1.5px #DCCFB0`, ícone `Share`).

## 3.12 Admin · Equipe (`/admin/usuarios`)

- Título display 26/700 + botão "Novo" (padding `11px 14px`, raio 13, `#3D5A2E`,
  13.5/700, ícone `Plus` 16px).
- Item: raio 18, `#FFFDF8`, borda `#E8DDC2`, padding 14, `gap: 12px`.
  Avatar 44px raio 14 (fundo `cor+26`, inicial display 17/700). Nome 14.5/700 truncado;
  **admin principal** ganha ícone `Leaf` 14px `#D4A843` ao lado do nome.
  Subtítulo 12.5px `#8B9A7A`. Badge de papel à direita: pílula `cor+1E`, texto 11.5/700.
  Cores: Admin `#D4A843` (principal) / `#C17A4A`, Operador `#6E8F4E`, Inativo `#B0BCA0`.
- Nota de rodapé em caixa `#F2EAD5` borda `#E0D4B6`, texto 13px `#6B7A5A`:
  "Operadores lançam atividade e colheita. Só o administrador vê preços, custos e margem —
  e só ele cadastra talhões."

## 3.13 Admin · Configurações (`/configuracoes` para ADMIN)

Três grupos com rótulo 11.5/700 uppercase `.14em` `#9AA88A` e lista em cartão raio 18
(itens separados por `1px #F0E7D2`, ícone 19px, rótulo 14.5px, dica 12px `#A0AE90`,
valor 13/600 `#8B9A7A` à direita):

- **Operação**: Unidades ativas (8) · Tabela de preços (Editar) · Tipos de atividade (12).
- **Talhões e mapas**: Sítios (3) · Talhões (27 — "Todos com polígono traçado").
- **Sistema**: Resumo semanal (Domingo) · Sincronização (Automática) · Registro de alterações (Ver).

Fecha com "Sair" e "IGUE Bananas · v2.0 · 27 talhões mapeados".

---

# 4. Interações e comportamento

| Gatilho | Efeito |
|---|---|
| Abrir o app (primeira vez na sessão) | splash 2,4 s → rota por papel: OPERATOR → `/mapa`, ADMIN → `/dashboard` |
| Arrastar o carrossel | troca o sítio, atualiza cabeçalho/lista e grava `localStorage['igue.siteId']` |
| Tocar num chip de sítio | mesma troca, com `scrollLeft` atribuído direto (sem `smooth`) |
| Tocar num polígono ou item da lista | abre o bottom sheet do talhão (`sheet-up` 0.32s) |
| "Registrar atividade/colheita" no sheet | navega com `?plotId=` — o formulário já vem com o talhão |
| Salvar | grava no Dexie com `syncStatus: 'PENDING'`; se online, tenta POST e marca `SYNCED`; atualiza o contador da fila |
| "Salvar e lançar outro" | salva e limpa só quantidade e observação |
| Salvo | overlay de confirmação (`pop-in`) até o toque em "Continuar" |
| Offline | aviso no formulário; item aparece como "Na fila" em Meus lançamentos |
| Sem `plotId` | botão de salvar desabilitado (`opacity .5`) e faixa pede "Selecione no mapa" |

Transições: `background-color`/`border-color` em 150ms ease nos botões; largura do dot em 200ms.
Sem animação de troca de rota. Respeite `prefers-reduced-motion` desativando splash e `pop-in`.

Estados de carregamento: esqueletos `#E8DDC2` com `animate-pulse` na altura final do
componente (cartão herói 200px, item de lista 58px, KPI 96px). Nunca mostrar spinner de tela cheia.

Estados vazios (texto 13.5px `#6B7A5A`, centralizado, com ícone 28px `#B0BCA0`):
- Mapa sem polígono: "Este talhão ainda não foi desenhado no mapa."
- Sem lançamentos hoje: "Nada lançado ainda hoje."
- Sem colheita no período: "Nenhuma colheita neste período."

Validação: talhão obrigatório; quantidade obrigatória na colheita (> 0) e opcional na
atividade; data nunca no futuro; observação até 500 caracteres. Mensagem de erro 12px `#C0392B`
logo abaixo do campo.

---

# 5. Estado e dados

**Estado local por tela**

- Mapa: `index` (sítio visível), `selected` (talhão do sheet), ref do trilho, flag `restored`.
- Atividade: `tipo`, `dia` + `dataManual`, `qtd`, `unidade`, `responsavel`, `notas`, `saving`, `saved`.
- Colheita: idem + `produto` (sem preço).
- Dashboard: só cache do React Query.

**Persistência**

- `localStorage['igue.siteId']` — sítio do usuário (lembrado entre sessões).
- `sessionStorage['igue.splashSeen']` — splash uma vez por sessão.
- Dexie: `activities`, `harvests` com `syncStatus`; contador da fila no Zustand (`sync.store`).

**Endpoints**

| Método | Rota | Observação |
|---|---|---|
| GET | `/api/sites?include=plots` | precisa retornar `plots` com `polygon` e `treeCount`, e `mapImageUrl` do sítio |
| GET | `/api/plots/{id}` | com `site.name` |
| GET | `/api/dashboard?period=week` | ver forma esperada abaixo |
| GET | `/api/prices?productType=&unit=` | **403 para OPERATOR** |
| POST | `/api/activities` | aceita `quantity`/`unit` nulos |
| POST | `/api/harvests` | **ignora preço do cliente**; calcula `pricePerUnit` e `totalRevenue` no servidor |

Forma esperada de `/api/dashboard?period=week`:

```ts
{
  userFirstName: string,
  week: {
    totalBoxes: number, tons: number, bunches: number, revenue: number,
    cost: number, margin: number, marginPct: string, costDelta: string,
    deltaPct: number,            // vs semana anterior
    byDay: number[],             // 7 posições, segunda→domingo
    activities: number, trees: number, plots: number,
  },
  today: Activity[],             // com plot.site.name, responsible, quantity, unit
  bySite: { id: string, name: string, boxes: number }[],
  alerts: { kind: 'sync' | 'idle' | 'outlier', title: string, text: string }[],
  weather: { temp: number, summary: string },
  tip: string,
}
```

**Banco** — ver `codigo/prisma/schema.patch.md`: enum `Unit` com 8 valores,
`ActivityType` com 12, novo modelo `ProductPrice` e o campo `Plot.treeCount Int?`
(hoje o número de pés só existe nas imagens dos mapas; os valores estão em
`assets/talhoes.json`, campo `pes` de cada região).

---

# 6. Assets

| Arquivo | Origem / uso |
|---|---|
| `assets/logo.png` | logo enviada pelo usuário, recortada em círculo 770×770 — vai em `public/logo.png` |
| `assets/sede.png`, `guanhanha.png`, `guanhanha2.png` | mapas dos sítios (já em `public/maps/`) |
| `assets/talhoes.json` | polígonos e pés por talhão, em pixels da imagem (`w`/`h` por mapa) |
| `assets/seed-polygons.ts` | seed que grava os polígonos normalizados (0–1) em `Plot.polygon` |
| Ícones | `lucide-react` (`npm i lucide-react`) — nenhum ícone desenhado à mão |
| Fontes | Google Fonts via `next/font`: Bricolage Grotesque, Karla |

---

# 7. Arquivos deste pacote

```
prototipo/IGUE Bananas App.dc.html   protótipo navegável (referência visual)
prototipo/assets/                    mapas + polígonos usados pelo protótipo
codigo/README.md                     ordem de aplicação no repo
codigo/prisma/schema.patch.md        mudanças de schema
codigo/src/app/globals.css           tokens + fontes + animações
codigo/src/app/-app-/mapa/page.tsx   = src/app/(app)/mapa/page.tsx
codigo/src/app/api/prices/route.ts   preço só para admin
codigo/src/app/api/harvests/route.server-note.md
codigo/src/components/layout/{SplashScreen,BottomNav,AppShell}.tsx
codigo/src/components/plots/SiteCarousel.tsx
codigo/src/components/activities/ActivityForm.tsx
codigo/src/components/harvests/HarvestForm.tsx
codigo/src/components/dashboard/AdminDashboard.tsx
codigo/src/lib/activity-icons.ts
codigo/src/types/index.ts
codigo/public/logo.png
assets/                              logo, mapas, talhoes.json, seed-polygons.ts
revisao-projeto.md                   12 incoerências do código atual + decisões
```

## Ordem sugerida de implementação

1. `npm i lucide-react`; fontes no `layout.tsx`; `globals.css` (tokens + animações).
2. Prisma: enums, `ProductPrice`, `Plot.treeCount`; `migrate dev`; rodar `seed-polygons.ts`.
3. `AppShell` + `BottomNav` + `SplashScreen` (a navegação nova destrava o resto).
4. `/mapa` com `SiteCarousel` (ajustar `/api/sites?include=plots`).
5. `ActivityForm` e `HarvestForm` (+ `/api/harvests` calculando receita no servidor).
6. `AdminDashboard` (+ ampliar `/api/dashboard`).
7. Listas de atividades/produção, relatórios, equipe, configurações.
8. Varrer o app removendo emoji e alvos abaixo de 44px.
