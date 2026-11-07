# Perfil de investidor

Fluxo: Carteira > Sua conta > Perfil > Fazer perfil de investidor. Após concluir,
o cartão passa a abrir a avaliação; nela, **Refazer perfil de investidor** mantém
as respostas anteriores para edição. Nenhuma resposta é persistida localmente.

## Contrato utilizado

O código do `finup-backend` já implementa as quatro rotas autenticadas de triagem.
O app usa o `httpClient` existente, com access token Cognito e tratamento de sessão
expirada. Não há identificador de usuário no payload.

- `GET /api/v1/triage/questions`: `{ version, questions }`. Renderiza `text`,
  `type`, `options: [{ value, label }]`, `required`, `requiredWhen`, `min`, `max`
  e `decimals`. A lista atual tem 27 perguntas, incluindo perguntas adicionais
  à proposta inicial (moradia, poupança mensal, cartão, seguros, prazo e conhecimento).
- `POST /api/v1/triage/answers`: `{ version, answers: { [questionId]: value } }`.
  Valores são string, string[], number ou boolean conforme o tipo da pergunta.
  O backend retorna 201 com `{ assessment: { profile, summary, risks }, completedAt }`.
  O próprio POST atualiza os perfis/interesses e recalcula o score na transação;
  o app não faz uma segunda chamada de recálculo.
- `GET /api/v1/triage/assessment`: mesmo formato do POST. 404 significa sem avaliação.
- `GET /api/v1/triage/answers`: `{ version, answers, completedAt }`; 404 significa
  sem respostas anteriores.

Erros `problem+json` preservam `detail` e `fields: [{ field, message }]` no
`HttpError`. Campos `answers.ID` são exibidos na pergunta correspondente. Erro
em `version` recarrega o questionário e conserva apenas respostas compatíveis,
exigindo revisão e novo envio explícito. Campos condicionais ocultos não são enviados.

Os layouts `cadastroFluxo` do Figma são referências de estilo: folha branca sobre
marinho, campos claros, opções múltiplas em chips, progresso e ação fixa. A lista
de perguntas/opções vem do backend, inclusive quando diverge do texto do design.

## Verificação manual em dispositivo

1. Com conta criada, abrir Perfil sem triagem e iniciar o questionário.
2. Verificar carregamento, falha de rede com retry e retorno sem responder.
3. Preencher números com vírgula; conferir zero, contagens inteiras, limites e obrigatoriedade.
4. Alternar dívidas, cartão e investimentos entre Sim/Não; verificar perguntas
   dependentes e descarte de respostas ocultas. Marcar/desmarcar vários chips.
5. Voltar entre perguntas, tentar fechar com alterações e cancelar a saída.
6. Enviar; verificar bloqueio de envio duplicado, avaliação, prioridades e sugestões.
7. Voltar ao Perfil e abrir/refazer; conferir dados preenchidos e nova avaliação.
8. Conferir 400 por campo e versão antiga, falha de envio sem perder o formulário,
   e 401 encaminhando ao fluxo de autenticação.

Validação desta implementação: cinco testes de regras do formulário passaram com
Node e todos os arquivos TS/TSX alterados passaram no parser. Lint, typecheck,
suite via tsx e preview Expo ficaram pendentes: o checkout estava sem dependências,
o registry retornou EACCES e o cache offline estava incompleto. Executar
`npm ci`, `npm run lint`, `npm run typecheck`, `npm test` e verificar o fluxo acima
em Expo Go após restaurar o acesso às dependências.
