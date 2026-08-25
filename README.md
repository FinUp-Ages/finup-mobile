# finup-mobile

Aplicativo mobile do projeto **FinUp** — AGES 2026/2.

Expo SDK 52 · React Native · TypeScript · Expo Router · NativeWind · TanStack Query · Axios

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
app/                      rotas (Expo Router — a estrutura de arquivos É a navegação)
├── _layout.tsx           layout raiz: providers globais e decisão auth vs. autenticado
├── index.tsx             entrada: redireciona conforme a sessão
├── +not-found.tsx        rota inexistente
├── (auth)/               fluxo não autenticado (login, cadastro, recuperação)
└── (tabs)/               abas principais do app autenticado

src/
├── components/
│   ├── ui/               componentes visuais genéricos (Button, Input, Card)
│   └── common/           componentes compostos do app (Header, ListItem, EmptyState)
├── config/               axios, QueryClient e leitura das variáveis de ambiente
├── services/             uma função por endpoint da API
├── hooks/                hooks customizados, incluindo os de TanStack Query
├── contexts/             contextos globais (sessão, tema)
├── storage/              wrapper do SecureStore e chaves de armazenamento
├── constants/            design tokens e constantes do app
├── types/                tipos e interfaces compartilhados
└── utils/                funções puras (formatação de moeda, data, máscaras)

assets/                   ícone, splash, fontes
```

Pastas ainda vazias têm um `.gitkeep` com uma linha descrevendo o que vai dentro — o Git não versiona diretório vazio. **Apague o `.gitkeep` quando a pasta receber o primeiro arquivo.**

### Como funciona a navegação

Expo Router usa **roteamento por arquivos**: criar `app/(tabs)/carteira.tsx` cria a rota `/carteira`. Os parênteses em `(auth)` e `(tabs)` marcam grupos que organizam o código **sem** aparecer na URL.

Só telas ficam dentro de `app/`. Componente, hook, service e utilitário vão em `src/` — qualquer arquivo dentro de `app/` que exporte um componente por padrão vira uma rota.

### Fluxo de dados

```
tela  →  hook (TanStack Query)  →  service  →  httpClient (axios)  →  API
```

Mesma cadeia do `finup-web`, de propósito: quem trabalha nos dois repositórios encontra o mesmo padrão.

- **`src/config/httpClient.ts`** é a única instância do Axios. Concentra `baseURL`, injeção de token, tratamento de 401 e normalização de erro. **Nenhuma tela importa `axios` diretamente.**
- **`src/services/`** tem uma função por endpoint. É o único lugar que conhece as rotas da API.
- **`src/hooks/`** envolve os services em `useQuery` / `useMutation`.
- **`app/`** monta as telas. Não sabe que existe rede.

### Segurança — dois pontos não negociáveis

1. **Token vai no SecureStore, nunca no AsyncStorage.** `src/storage/secureStorage.ts` envolve o `expo-secure-store`, que usa Keychain (iOS) e Keystore (Android). AsyncStorage não é criptografado.
2. **Nada com prefixo `EXPO_PUBLIC_` é secreto.** Tudo isso é embutido no binário e pode ser extraído por qualquer pessoa que baixe o app. O mesmo vale para `extra` no `app.config.ts`. Chave de provedor de IA, credencial de serviço, qualquer segredo: **a chamada passa pelo backend**.

### Convenções

- **Import alias `@/`** aponta para `src/`: use `@/components/ui/Button`.
- **TypeScript em `strict`**, com `noUnusedLocals` e `noUnusedParameters`.
- Estilização com **NativeWind** (classes Tailwind), mantendo os mesmos tokens do `finup-web`.
- Telas em `kebab-case.tsx` (viram rota); componentes em `PascalCase.tsx`; hooks em `useAlgumaCoisa.ts`.

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
└── CODEOWNERS                revisão obrigatória em config/, services/, storage/, app.config.ts e eas.json
app.config.ts · eas.json · babel.config.js · metro.config.js
eslint.config.js · .prettierrc · .editorconfig · .nvmrc
```

**Antes do primeiro PR:** ajuste o `@arquitetura` no `CODEOWNERS` para o time ou usuário real da organização no GitHub.
