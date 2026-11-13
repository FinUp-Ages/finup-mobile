# Editar categoria de um gasto

Task: [Permitir editar a categoria dos gastos](https://app.clickup.com/t/1dfcuabck3w).

Na Home ou Análise, abrir **Ver mais** e tocar em uma saída (ícone de lápis).
O editor mostra descrição, valor, data e categoria atual. Escolher outra categoria
de saída e tocar **Salvar categoria**. A ação também atende gastos registrados pela IA.
Receitas permanecem somente de leitura neste fluxo.

O ViewModel envia apenas `categoryId` para `PATCH /api/v1/transactions/{id}/category`.
O editor não carrega meios de pagamento nem reutiliza o cadastro de transações.
O backend deve conter esse endpoint. As opções vêm de `GET /api/v1/categories`
filtradas por `EXPENSE`, incluindo as categorias cadastradas pelo usuário.
A troca funciona independentemente do nome da categoria, não cria categorias
automaticamente e não depende de migration.

Estados: carregamento e falha das categorias com nova tentativa; lista vazia; categoria
atual selecionada com salvar desabilitado; seleção alterada; salvamento com bloqueio
de novos envios/fechamento; erro que mantém a seleção; sucesso retorna à lista.
Cancelar ou voltar antes do envio descarta a seleção sem escrever na API.

Depois de salvar, `transactionEvents` recarrega Home, movimentações, totais por
categoria e alertas da Análise. A lista mostra a categoria separada da descrição,
inclusive quando o assistente preencheu uma descrição.

## Conferência

Usar duas categorias de despesa disponíveis (A e B), incluindo uma cadastrada pelo usuário.

1. Criar uma saída de R$ 1,23 na categoria A e abrir na lista completa.
2. Selecionar a categoria B e salvar. Conferir a categoria na lista e na Home.
3. Fechar/reabrir o editor e recarregar o app: B deve continuar selecionada.
4. Trocar B por A; valor, data, descrição e pagamento devem continuar iguais.
5. Repetir com um gasto da IA. Os totais por categoria mudam e o saldo permanece igual.
6. Cancelar uma seleção diferente e reabrir: a categoria original permanece.
7. Com a API indisponível, conferir erro/retry da carga; parar a API após carregar,
   tentar salvar, religar e repetir: a seleção deve ser preservada.

Checks: `npm test`, `npm run typecheck`, `npm run lint` e bundle Android pelo Expo.
