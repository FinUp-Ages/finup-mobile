# Responder perguntas da trilha

Task: [telas de perguntas](https://app.clickup.com/t/1dfcuabbdyv).

Integração sobre `develop`, incluindo a tela da trilha do PR #28. Os componentes,
assets, mocks, tipos, modelo de leitura, helpers, testes e regras de progresso e
bloqueio da trilha permanecem como foram entregues pelo colega. A tela anfitriã
apenas expõe suas perguntas e abre `StudySessionScreen` no lugar do modal provisório.

## Contrato e fluxo

`StudySessionScreen` recebe `categoryId`, `topic`, `questions`, `startQuestionId`,
`onClose` e `onSaved(result)`. Valida o conjunto recebido da trilha sem modificar
seu modelo de leitura. Conteúdo inválido mostra erro e permite voltar à trilha;
nenhum item é descartado para formar um lote parcial.

Os formatos C6 aceitos pelo backend são:

| Tipo              | Conteúdo publicado                                        | Resposta enviada         |
| ----------------- | --------------------------------------------------------- | ------------------------ |
| `MULTIPLE_CHOICE` | `statement`, `options: [{text, correct}]`, `explanation?` | Texto de uma alternativa |
| `FILL_BLANK`      | `title`, `statement`, `answers: string[]`, `explanation?` | Texto digitado           |
| `LEARNING`        | `title`, `body` em Markdown                               | `null`                   |

O discriminador fica em `published.type` no envelope `{id, published}` já lido
pela trilha. `answers` da lacuna contém alternativas textuais aceitas para uma
resposta, não colunas independentes. O backend não possui um tipo `FEEDBACK`;
o feedback de acerto/erro usa `explanation`, enquanto a leitura usa `LEARNING`.

Uma rodada começa na pergunta do nível aberto, percorre todos os itens publicados
da categoria e volta ao início quando necessário. Cada item é respondido/lido uma
vez. O backend exige exatamente esse conjunto completo no POST
`/api/v1/study-tracks/answers`, com `{categoryId, answers: [{questionId, answer}]}`.
Nenhuma nota local é enviada. A avaliação definitiva vem do servidor.

Seleção única ou texto não vazio habilita Responder. O feedback bloqueia a edição
e habilita Próximo. A correção imediata ignora caixa e espaços externos, preserva
acentos e aceita qualquer alternativa marcada como correta no conteúdo publicado.
Leituras não entram na nota. A barra do modal indica o andamento desta rodada.

Fechar ou usar Voltar do Android confirma o descarte quando há respostas não salvas.
Durante o envio, a saída fica bloqueada. Falhas preservam as respostas em memória
para tentar salvar novamente. Depois do POST bem-sucedido, `onSaved(result)` recebe
o resultado da API; o modal apresenta a conclusão. A conexão atual recarrega as
perguntas ao salvar/fechar. A integração dos dados reais de progresso e estrelas
na tela da trilha permanece como pendência separada, descrita abaixo.

`studyAnswersModel` usa o cliente HTTP autenticado e a mesma flag
`EXPO_PUBLIC_USE_MOCKS` da trilha. No modo real, erros nunca viram sucesso fictício.
No modo de demonstração, avalia as próprias perguntas de exemplo da trilha sem
persistência no backend. Não cria outro catálogo de mocks.

## Pendência de integração da trilha

Na `develop`, progresso e estrelas da tela da trilha usam valores de demonstração;
no modo real, o progresso aparece indisponível e os níveis ficam sem estrelas.
Esse comportamento foi confirmado no código e no Android com a `develop` sem as
alterações desta task.

O backend retorna estrelas para a rodada/categoria inteira. O Figma e a trilha
atual apresentam estrelas por nível, com cada pergunta publicada mapeada para um
nível. Além disso, `percentage` em `GET /api/v1/study-tracks/progress` representa
percentual de acertos, não de perguntas concluídas. Responder todas as questões
incorretamente representa uma rodada concluída com 0% de acertos.

Exibir esses dados nos níveis exige alinhar o contrato do backend ou o mapeamento
dos níveis da trilha. Essa definição e implementação ficam fora deste MR.
O modal de conclusão já apresenta a avaliação da rodada retornada pelo POST, e
`onSaved(result)` disponibiliza esse resultado para uma futura integração.

## Design e validação

Referências do Figma: arquivo `GXCqTKbIYOWS4W9iDOPuGk`, frames `204:2234`
(inicial), `204:2320` (seleção) e `204:2277` (feedback). Preservada a apresentação
das perguntas já conferida pelo usuário: folha branca, cantos arredondados,
alternativas cinza, seleção azulada, acerto verde e botão inferior. A tipografia
Inter segue o aplicativo. Objetivas usam o título publicado quando existir ou o
tema recebido da trilha, pois a API atual não publica título para esse tipo.

Checks: `npm test`, `npm run typecheck`, `npm run lint` e bundle Android Expo.
Os testes anteriores da trilha são preservados; os novos verificam contrato,
correção, seleção, lacuna, leitura, navegação circular, lote completo, falha/retry
e uso do resultado do servidor.

No Expo com a API real, conferir abertura pelo nível, os três tipos, feedback,
conclusão, fechamento/retorno e reenvio após falha. Conferir persistência das
respostas no backend, sem usar estrelas/progresso da trilha como critério desta task.
Resultados e limitações desta integração estão em `.railforge/state.json`.

Validação em 12/11/2026: 47 testes passaram, assim como typecheck, lint e bundle
Android. No Expo Go, o usuário concluiu a categoria local Teste Expo com os três
tipos e resultado de 2/2. O banco confirmou as duas respostas corretas e a leitura
sem nota. Retorno, feedback de erro, descarte e reabertura sem resposta foram
conferidos no Android. A categoria de teste foi preparada diretamente no banco
local; esse teste não valida o CRUD administrativo de criação/publicação por HTTP.
