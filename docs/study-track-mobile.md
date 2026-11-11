# Trilha de aprendizado no mobile

A aba Educacional usa o quadro Figma `204:1350` (402 × 874). Mantém Inter e a aba Educacional ativa, conforme a task; o desenho usa DM Sans e Análise ativa.

## Contrato e configuração

`EXPO_PUBLIC_USE_MOCKS=true` usa exemplos locais com os mesmos envelopes dos dois GETs C6. `false` (ou ausente) usa o cliente HTTP autenticado do app. Reinicie o Expo após mudar a flag. Configure `EXPO_PUBLIC_API_BASE_URL` e o Cognito conforme `.env.example` para o modo real.

Contrato consultado no backend: `origin/develop`, `contracts/study-track-c6.md`, `StudyTrackCategoryResponse` e `StudyTrackQuestionResponse`.

- GET `/api/v1/study-tracks/categories`: lista `{ id, name, description, publishedCount }`.
- GET `/api/v1/study-tracks/categories/{id}/questions`: lista `{ id, published }`, somente conteúdo publicado. O `type` vem dentro de `published` (seção 4 do C6).
- Tipos: `MULTIPLE_CHOICE`, `FILL_BLANK`, `LEARNING`; nenhuma resposta administrativa ou rascunho é usada.

## Mapeamento e limites

Cada categoria é um curso; cada item publicado é um nível, na ordem retornada. O C6 não define agrupamentos de tópicos nem ordem pedagógica. O seletor mostra o tópico único da categoria: seu nome no modo real, CDB na primeira categoria de demonstração. Uma futura hierarquia deve substituir esse mapeamento sem mudar o contrato de leitura.

O contrato C6 de leitura usado nesta tela não fornece progresso e estrelas. O mock demonstra 81% e nível atual 2: o nível 1 tem três estrelas, nuvens cobrem os níveis 3 a 5 (todo nível não alcançado, que também não abre) e o caminho de 2 para 3 fica cinza; isso é identificado como demonstração na tela. No modo real, o círculo indica indisponibilidade e todos os itens publicados podem ser abertos, sem inventar conclusão nem bloquear conteúdo. Nenhum progresso é persistido. A API de progresso adicionada posteriormente ao backend ainda não está integrada nesta tela.

Decisão de 11/11/2026: a integração ficou de fora. O back não tem progresso por nível: o `POST /api/v1/study-tracks/answers` só aceita todas as perguntas publicadas da categoria de uma vez, e as estrelas e o `percentage` do `GET /api/v1/study-tracks/progress` valem para a categoria inteira (o percentual é de acertos, não de avanço). Para a trilha travar níveis e mostrar nuvens no modo real, o back precisa expor progresso por pergunta, ou o mapeamento "pergunta = nível" precisa ser revisto.

Abrir um nível apresenta o conteúdo LEARNING ou o enunciado das questões, ocultando respostas. Responder perguntas e registrar conclusão pertencem à task separada de exercícios.

## Verificação manual

- Selecionar cada curso, rolar os chips, abrir o tópico e fechá-lo.
- Abrir níveis dos três tipos, voltar à trilha e usar o botão Voltar do Android.
- Verificar erro da API e tentar novamente; categorias vazias e curso sem perguntas.
- Trocar cursos rapidamente: resposta atrasada não deve substituir o curso atual.
- Conferir leitor de tela, foco por teclado, fonte ampliada e áreas seguras no Android/iOS.

SVGs dos níveis, estrelas e nuvens foram baixados do Figma para `assets/learning`; não há URLs temporárias em runtime.

## Validacao executada

Lint e TypeScript passaram. Os 14 testes passaram, incluindo 3 da trilha. O bundle Android com bytecode Hermes foi gerado com os quatro SVGs locais. Ainda pendentes: verificacao visual/interacoes em aparelho, estados de API em runtime e chamada autenticada contra o servidor real. Nao houve commit, PR ou merge.

## Revisão de compatibilidade (05/11/2026)

A leitura aceita conteúdo educativo atual (`body`) e legado (`content`), lacunas atuais (`statement`, `answers`) e legadas (`textWithBlanks`, `blanks`). O backend preserva publicações antigas e devolve o mapa armazenado. Seletor com tópico único e progresso demonstrativo continuam limitações de escopo, além das validações pendentes.
