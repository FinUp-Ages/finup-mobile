# finup-mobile

Aplicativo mobile do projeto **FinUp** — AGES 2026/2.

Expo SDK 52 · React Native · TypeScript · Expo Router · NativeWind · TanStack Query · Axios

Arquitetura **MVVM** — ver [ADR-0007](../wiki/ADR-0007-mvvm-nos-fronts).

> Esqueleto do projeto. As pastas e os arquivos de fronteira estão criados e vazios — nenhuma tela ou regra de negócio foi implementada ainda.

---

## Pré-requisitos

- Node.js 20+ (há um `.nvmrc` — `nvm use` seleciona a versão certa)
- App **Expo Go** no celular, ou um emulador Android / simulador iOS
- Simulador iOS exige macOS. Em Windows e Linux, o desenvolvimento é feito em Android

## Como rodar

```bash
cp .env.example .env      # confira a URL da API — veja o aviso abaixo
npm install
npm start
```

Depois: escaneie o QR code com o Expo Go, ou pressione `a` (Android) / `i` (iOS) no terminal.

### O ponto que trava todo mundo na primeira vez

`localhost` dentro do celular aponta para o **próprio celular**, não para a sua máquina. Ajuste `EXPO_PUBLIC_API_BASE_URL` conforme onde o app está rodando:

| Onde o app roda | Valor |
|---|---|
| Emulador Android | `http://10.0.2.2:8080` |
| Simulador iOS | `http://localhost:8080` |
| Celular físico (Expo Go) | `http://<IP-DA-SUA-MÁQUINA>:8080` |

Para o celular físico, o computador e o celular precisam estar na mesma rede Wi-Fi.

## Scripts

| Comando | O que faz |
|---|---|
| `npm start` | inicia o servidor de desenvolvimento do Expo |
| `npm run android` / `npm run ios` | abre direto no emulador/simulador |
| `npm run lint` | ESLint |
| `npm run typecheck` | TypeScript sem emitir arquivos |
| `npm run format` | Prettier |
| `npm run doctor` | diagnóstico de versões e dependências do Expo |

Antes de abrir um PR: `npm run lint && npm run typecheck`.

---

## Estrutura de pastas

```
app/                      SOMENTE roteamento (Expo Router — a estrutura de arquivos É a navegação)
├── _layout.tsx           layout raiz: providers globais e decisão auth vs. autenticado
├── index.tsx             entrada: redireciona conforme a sessão
├── +not-found.tsx        rota inexistente
├── (auth)/               fluxo não autenticado (login, cadastro, recuperação)
└── (tabs)/               abas principais do app autenticado

src/
├── views/                as telas de verdade — todo o JSX de tela mora aqui
├── viewmodels/           hooks useXViewModel: estado, orquestração, TanStack Query
├── models/               acesso a dado: uma função por endpoint da API
├── components/
│   ├── ui/               componentes visuais genéricos (Button, Input, Card)
│   └── common/           componentes compostos do app (Header, ListItem, EmptyState)
├── config/               axios, QueryClient e leitura das variáveis de ambiente
├── contexts/             estado que atravessa telas (sessão, tema)
├── storage/              wrapper do SecureStore e chaves de armazenamento
└── types/                tipos e interfaces compartilhados

assets/                   ícone, splash, fontes
```

Pastas ainda vazias têm um `.gitkeep` com uma linha descrevendo o que vai dentro — o Git não versiona diretório vazio. **Apague o `.gitkeep` quando a pasta receber o primeiro arquivo.**

### Como funciona a navegação

Expo Router usa **roteamento por arquivos**: criar `app/(tabs)/carteira.tsx` cria a rota `/carteira`. Os parênteses em `(auth)` e `(tabs)` marcam grupos que organizam o código **sem** aparecer na URL.

**Nenhuma tela mora dentro de `app/`.** Todo arquivo ali é uma de duas coisas: um `_layout.tsx` de navegação, ou uma linha de reexport apontando para a View real:

```ts
// app/(tabs)/carteira.tsx
export { default } from '@/views/CarteiraScreen';
```

O motivo é uma restrição da ferramenta, não uma preferência: qualquer arquivo dentro de `app/` que exporte um componente por padrão vira rota navegável, então a pasta não pode sumir. A saída é mantê-la fina. Estado, chamada de API e árvore de JSX ficam em `src/`.

### Fluxo de dados

```
view  →  viewmodel (TanStack Query)  →  model  →  httpClient (axios)  →  API
```

Mesma cadeia do `finup-web`, de propósito: quem trabalha nos dois repositórios encontra o mesmo padrão.

- **`src/config/httpClient.ts`** é a única instância do Axios. Concentra `baseURL`, injeção de token, tratamento de 401 e normalização de erro. **Nenhuma View importa `axios` diretamente.**
- **`src/models/`** tem uma função por endpoint. É o único lugar que conhece as rotas da API. Módulo puro: nenhum hook do React aqui, para poder ser chamado e testado fora de um componente.
- **`src/viewmodels/`** envolve os Models em `useQuery` / `useMutation`, guarda o estado da tela e entrega o dado já pronto para exibição, mais as ações disponíveis.
- **`src/views/`** monta as telas. Não sabe que existe rede.
- **`app/`** só roteia.

### As regras de ouro

1. **Nenhuma View importa de `models/`.** Todo dado passa por um ViewModel. Se você encontrar uma View chamando a API direto, isso é violação de camada — a chamada vai para dentro de um ViewModel.
2. **Nenhuma View importa de `storage/`.** Vale a mesma lógica: persistência é fonte de dado, e quem orquestra fonte de dado é o ViewModel. Só ViewModel e Model podem importar `storage/`.
3. **`components/` é passivo.** Recebe props, não busca dado, não conhece ViewModel, Model nem rota.
4. **Nada dentro de `app/`** tem estado, chamada de API ou JSX de tela.

> Por que **ViewModel** e não Controller: o hook expõe estado, e a View o **observa** e re-renderiza sozinha — ela não é avisada por um Controller imperativo, como seria no MVC clássico. O backend continua com Controller/Service/Repository, e essa divergência de nomes é deliberada. Decisão registrada na **ADR-0007**.

### Segurança — dois pontos não negociáveis

1. **Token vai no SecureStore, nunca no AsyncStorage.** `src/storage/secureStorage.ts` envolve o `expo-secure-store`, que usa Keychain (iOS) e Keystore (Android). AsyncStorage não é criptografado.
2. **Nada com prefixo `EXPO_PUBLIC_` é secreto.** Tudo isso é embutido no binário e pode ser extraído por qualquer pessoa que baixe o app. O mesmo vale para `extra` no `app.config.ts`. Chave de provedor de IA, credencial de serviço, qualquer segredo: **a chamada passa pelo backend**.

### Convenções

- **Import alias `@/`** aponta para `src/`: use `@/components/ui/Button`.
- **TypeScript em `strict`**, com `noUnusedLocals` e `noUnusedParameters`.
- Estilização com **NativeWind** (classes Tailwind), mantendo os mesmos tokens do `finup-web`.
- Nomes por camada:

| Camada | Convenção | Exemplo |
|---|---|---|
| Rota (`app/`) | `kebab-case.tsx` | `app/(tabs)/carteira.tsx` |
| View | `PascalCase.tsx`, sufixo `Screen` | `views/CarteiraScreen.tsx` |
| ViewModel | `useXViewModel.ts` | `viewmodels/useCarteiraViewModel.ts` |
| Model | `xModel.ts` | `models/carteiraModel.ts` |
| Componente | `PascalCase.tsx` | `components/ui/Button.tsx` |

---

## Builds (EAS)

O `eas.json` define três perfis: `development`, `preview` e `production`, cada um com sua `EXPO_PUBLIC_API_BASE_URL`.

```bash
npx eas login
npx eas init          # preenche o projectId em app.config.ts
npx eas build --profile preview --platform android
```

**Faça o primeiro build EAS logo na primeira ou segunda sprint**, mesmo sem telas prontas. Problema de credencial de build é um clássico que aparece na véspera da entrega — melhor descobrir cedo, com folga.

Lembre também que o mobile é o repositório de **ciclo mais lento** dos três: build EAS, submissão às lojas e revisão da Apple levam de horas a dias. Mudanças de contrato de API precisam ser planejadas em função dele.

---

## O que ainda não está aqui (e por quê)

| Item | Situação |
|---|---|
| **Design tokens** (cores, tipografia, espaçamento) | `tailwind.config.js` com `theme.extend` vazio, aguardando o Figma do AGES IV |
| **Testes** | fora do escopo desta primeira versão |
| **Formulários** (React Hook Form + Zod) | a definir, seguindo o que for decidido no `finup-web` |
| **Autenticação** | `src/contexts/` e `src/storage/` criados e vazios, aguardando o fluxo de login do backend |
| **Pastas `android/` e `ios/`** | não existem por escolha: workflow **managed (CNG)** — são geradas no build e ficam no `.gitignore` |

---

## Estrutura de suporte

```
.github/
├── workflows/ci.yml          lint + typecheck + expo-doctor em todo PR
├── PULL_REQUEST_TEMPLATE.md  exige teste em Android E iOS, com evidência visual
└── CODEOWNERS                revisão obrigatória em config/, models/, storage/, app.config.ts e eas.json
app.config.ts · eas.json · babel.config.js · metro.config.js
eslint.config.js · .prettierrc · .editorconfig · .nvmrc
```

**Antes do primeiro PR:** ajuste o `@arquitetura` no `CODEOWNERS` para o time ou usuário real da organização no GitHub.