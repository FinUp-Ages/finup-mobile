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

## Progresso por nível (C6)

Fonte: `GET /api/v1/study-tracks/progress` (`contracts/study-track-answers-c6.md` do back). Cada categoria traz `levels` (um item por pergunta publicada, com `completed` e `stars`), `currentLevel` e `completionPercentage`. `buildStudyLevels` cruza esses itens com as perguntas por `questionId`:

- **Alcançado:** até o primeiro nível não concluído, na ordem das perguntas. Sem respostas, só o Lv. 1 abre; os demais ficam com nuvem e caminho cinza e não abrem.
- **Estrelas por nível:** 3 no acerto, 1 no erro, nenhuma em leitura (`LEARNING`) ou nível não respondido. A regra e as artes de 1 e 2 estrelas (`stars1Svg` e `stars2Svg` em `src/components/learning/learningSvgs.ts`, derivadas da arte de 3 estrelas) são provisórias até o design confirmar no Figma.
- **Círculo:** `completionPercentage` arredondado, ou seja, avanço (níveis concluídos), não acertos. O `percentage` do C6 é de acertos e não é usado aqui.
- **Sem progresso** (erro ou formato inesperado): todos os níveis abrem, sem estrelas, com aviso e "Tentar novamente". O app nunca trava conteúdo sem saber o que o usuário fez.
- Pergunta que o progresso ainda não conhece (publicada entre as duas chamadas) conta como pendente.

O progresso recarrega ao fechar a atividade. No primeiro carregamento a trilha espera o progresso, para não mostrar níveis abertos e travá-los em seguida.

`EXPO_PUBLIC_USE_MOCKS=true` usa `src/models/studyProgressMock.ts`: respostas em memória (até recarregar o app) e progresso calculado por `buildCategoryProgress`, com as mesmas regras do back. A demonstração começa em Renda Fixa com o Lv. 1 lido e o Lv. 2 certo, então o Lv. 3 é o atual (nuvem nos níveis 3 a 5 e caminho cinza de 2 para 3, como no PR #28).

Histórico: em 11/11/2026 a integração ficou de fora porque o back só aceitava o lote completo da categoria e não expunha progresso por nível. Resolvido pela task [Trilha: back não registra progresso por nível](https://app.clickup.com/t/1dfcuabd1ja).

Abrir um nível apresenta o conteúdo LEARNING ou a questão. O fluxo de resposta está em `docs/study-session-mobile.md`.

## Verificação manual

- Selecionar cada curso, rolar os chips, abrir o tópico e fechá-lo.
- Abrir níveis dos três tipos, voltar à trilha e usar o botão Voltar do Android.
- Verificar erro da API e tentar novamente; categorias vazias e curso sem perguntas.
- Trocar cursos rapidamente: resposta atrasada não deve substituir o curso atual.
- Conferir leitor de tela, foco por teclado, fonte ampliada e áreas seguras no Android/iOS.

Os SVGs do nível, das estrelas e da nuvem vieram do Figma e ficam como texto em `src/components/learning/learningSvgs.ts`, desenhados com `SvgCss`; não há URLs temporárias em runtime. Não use `SvgCssUri` com `Asset.fromModule(...).uri`: no Expo Go funciona, porque o uri é do Metro, mas no APK release o uri vira nome de recurso do Android e a arte não aparece.

## Validacao executada

Lint e TypeScript passaram. Os 14 testes passaram, incluindo 3 da trilha. O bundle Android com bytecode Hermes foi gerado com os quatro SVGs locais. Ainda pendentes: verificacao visual/interacoes em aparelho, estados de API em runtime e chamada autenticada contra o servidor real. Nao houve commit, PR ou merge.

## Revisão de compatibilidade (05/11/2026)

A leitura aceita conteúdo educativo atual (`body`) e legado (`content`), lacunas atuais (`statement`, `answers`) e legadas (`textWithBlanks`, `blanks`). O backend preserva publicações antigas e devolve o mapa armazenado. Seletor com tópico único e progresso demonstrativo continuam limitações de escopo, além das validações pendentes.
