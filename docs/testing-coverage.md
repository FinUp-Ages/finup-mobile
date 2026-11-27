# Testes e cobertura

## Escopo mensurado

`npm run test:coverage` mede todos os arquivos `.ts` e `.tsx` de `src/` e `app/`, inclusive os que nenhum teste importa. Estes entram como 0%, em vez de desaparecerem do denominador.

Ficam fora do denominador: arquivos de teste (`*.test.ts(x)`), declarações (`*.d.ts`), dependências e artefatos gerados. O relatório não mede comportamento nativo, configuração do Expo, `assets/` ou serviços remotos. Portanto, é uma medida de cobertura de código TypeScript/TSX executável, não uma garantia de cobertura de interface ou integração.

## Como medir

1. Instale as dependências bloqueadas: `npm ci`.
2. Rode `npm run test:coverage` antes de criar novos testes e guarde o resumo `All files`.
3. Após os testes, repita exatamente `npm run test:coverage` e compare o mesmo resumo.

O comando usa `c8 --all` sobre `tsx --test`. Ele não faz deploy nem chama AWS ou o backend. Além do resumo no terminal, o arquivo `coverage/lcov.info` permite importar o resultado em ferramentas compatíveis.

## Interface (Jest Expo)

`npm run test:ui` executa somente os arquivos `*.ui.test.ts(x)` com Jest Expo; `npm test` continua sendo a suíte Node atual. Os testes exercitam componentes reais da Home e não fazem rede. Se o comando travar, execute `npm run test:ui -- --detectOpenHandles --verbose` e compartilhe a saída.

`npm run test:coverage` executa `test:all` sob um único `c8`: a variável de cobertura V8 é herdada pelos processos Node das duas suítes e o relatório final usa um denominador único para `src/` e `app/`. `--clean` descarta dados V8 anteriores; como `test:all` usa `&&`, uma falha da suíte UI interrompe a execução e o comando retorna erro. Não rode `c8` e Jest com `--coverage` separadamente, pois isso produz relatórios incompletos e não comparáveis.

## Limitações conhecidas

Os contratos somente de tipo em `src/types/` são removidos pelo TypeScript em tempo de compilação. O `c8 --all` pode mostrá-los como 0% mesmo quando usados pelo aplicativo: importar tipos não executa suas linhas. As verificações estáticas em `src/types/contracts.test.ts` são avaliadas por `npm run typecheck`; elas não validam dados recebidos em tempo de execução nem devem ser interpretadas como cobertura executável.

Arquivos React Native que dependem de módulos nativos podem permanecer em 0% até que exista uma infraestrutura específica para eles. Isso é intencional neste estágio: a métrica os expõe, mas a suíte não simula UI, Expo Go, Cognito ou a API publicada.
