# Revisão do projeto IGUE Bananas — o que não fazia sentido

## Incoerências encontradas no código atual

1. **Operador vê dinheiro no formulário de colheita.** `HarvestForm` exige `pricePerUnit`
   e mostra "Receita estimada" para qualquer perfil, mas a regra é: operador nunca vê valores.
   → No protótipo o operador só informa quantidade; preço vem da tabela do admin.

2. **Unidade travada.** `HarvestForm` desabilita o seletor de unidade quando o produto
   não é PITAYA e força CAIXA. Na prática se colhe em kg, cacho, penca e caixa.
   → Enum `Unit` precisa virar: KG, CAIXA, CACHO, PENCA, DUZIA, UNIDADE, SACO, TONELADA.

3. **Só 5 tipos de atividade.** Falta o ciclo real da bananicultura: adubação, desfolha,
   desbaste/desnete, ensacamento, escora, irrigação, plantio.
   → 12 tipos no protótipo.

4. **Ícones em emoji.** 📊 🍌 🌿 ➕ na sidebar e na bottom nav renderizam diferente em
   cada Android e não têm estado ativo/inativo. → Lucide, traço 1.8-1.9.

5. **Sidebar + BottomNav duplicando navegação no mobile.** O hambúrguer abre uma gaveta
   com os mesmos itens da barra de baixo. → No mobile só a barra de baixo; gaveta só no desktop.

6. **Dashboard não responde à pergunta do dono.** A ordem hoje é: últimas atividades →
   clima → filtros → KPIs → dica. → Nova ordem: "colhido esta semana" (número grande +
   7 dias) → "o que foi feito hoje" (linha do tempo) → números da semana → por sítio →
   alertas → clima/dica.

7. **`Activity.siteId` e `Harvest.siteId` são redundantes** — o talhão já sabe o sítio.
   Risco de divergir. Manter só se for cache de leitura explícito.

8. **`Farm.mapImageUrl` sobrou** da época de um mapa único. Hoje o mapa é por `Site`.

9. **Botão "Registrar" na bottom nav do operador leva a `/atividades/novo` sem talhão.**
   O caminho natural é: mapa → toca no talhão → lança já com o talhão preenchido.

10. **Sem estado vazio nem confirmação de offline no formulário.** O operador não sabe se
    o lançamento ficou no aparelho. → Aviso antes de salvar + tela de confirmação + fila
    visível em "Meus lançamentos".

11. **`Inter` como fonte.** → Bricolage Grotesque (títulos/números) + Karla (texto).

12. **Alvos de toque abaixo de 44px** em vários botões (`size="sm"`, ícones 32px).
    → Mínimo 44px, principais com 52-58px.

## Decisões do protótipo

- **Sítio lembrado**: `localStorage['igue.siteIdx']`, carrossel com scroll-snap; arrastar troca de sítio.
- **Mapa é a home do operador**; polígonos reais dos 27 talhões, cor herdada do mapa pintado.
- **Splash**: animação CSS (folha crescendo + wordmark), 2,4 s — CSS em vez de GIF: 3 kB, nítida em qualquer tela.
- **Confirmação de lançamento** em tela cheia, com "Continuar" — o operador de luva acerta.
