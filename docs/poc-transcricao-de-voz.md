# POC — Transcrição de voz offline

Prova de conceito para registrar um gasto falando. O escopo aqui é **um passo só**:

```
áudio  →  texto
```

Interpretar a frase — valor, categoria, estabelecimento, data, tipo de movimentação —
**não faz parte desta POC** e fica para outra camada do app. O objetivo é responder a uma
pergunta técnica: *dá para transcrever português falado no próprio aparelho, sem internet e
sem serviço de IA em nuvem, com qualidade suficiente para frases curtas de gasto?*

---

## 1. Tecnologia escolhida

**[`expo-speech-recognition`](https://github.com/jamsch/expo-speech-recognition) 57.0.0** — módulo
nativo que expõe ao JavaScript o reconhecedor de fala **do próprio sistema operacional**. A versão
acompanha o Expo SDK 57, que é o SDK deste repositório.

| Plataforma | O que roda por baixo | Offline |
|---|---|---|
| Android | `android.speech.SpeechRecognizer`, com o pacote `com.google.android.as` (Android System Intelligence / Speech Services by Google) | `requiresOnDeviceRecognition: true` + modelo do idioma baixado |
| iOS | `SFSpeechRecognizer` com `requiresOnDeviceRecognition` | depende do aparelho e da versão do iOS |

O ponto central: **o app não embarca modelo nenhum**. Quem tem o modelo é o sistema. O APK cresce
apenas o tamanho do módulo nativo (alguns KB de código, sem peso de modelo), e a atualização do
reconhecedor vem pelo Google Play / iOS, não por release nosso.

### Por que não Whisper ou Vosk

| Abordagem | Modelo no app | Latência esperada | Custo de integração | Garantia de offline |
|---|---|---|---|---|
| **Reconhecedor do sistema** (escolhido) | nenhum | a menor das três: o serviço já está quente | plugin de config + permissão | depende de o aparelho ter o serviço e o modelo pt-BR |
| `whisper.rn` (whisper.cpp) | sim — de dezenas a centenas de MB por modelo | segundos por frase, uso pesado de CPU | módulo nativo + gestão de download do modelo | total, e idêntica nas duas plataformas |
| Vosk | sim — modelo pt-BR pequeno, algumas dezenas de MB | intermediária | sem módulo Expo oficial | total |

Para **validar a ideia**, o reconhecedor do sistema é o caminho mais barato e mais rápido: zero
modelo para distribuir e latência de assistente de verdade. O preço é depender de um serviço que
não é nosso. As alternativas só passam a valer a pena se a dependência do serviço do sistema se
mostrar frágil demais na base de aparelhos real dos usuários — veja a seção 7.

---

## 2. O que foi implementado

Aba `Transcrição` (`/transcricao`), com dois modos:

- **Roteiro de testes** — as cinco frases do ticket, uma por vez. Para cada uma: a frase a falar,
  o que saiu da transcrição, o acerto de palavras, os tempos, e um toque para marcar `OK` ou
  `AJUSTAR`. No fim, a tela monta um relatório em Markdown e o compartilha pelo menu do sistema.
- **Fala livre** — qualquer frase, sem comparação. Serve para brincar com variações.

Acima dos dois, um cartão de capacidades do aparelho responde, antes de qualquer gravação, se
aquele aparelho consegue rodar offline: suporte a reconhecimento local, serviço `com.google.android.as`
instalado, e se o modelo `pt-BR` já está baixado — com um atalho para baixá-lo quando falta.

### Onde está o código

A POC segue o MVVM do repositório, com o módulo nativo no lugar da API:

```
view  →  viewmodel  →  model  →  módulo nativo
```

```
app/(tabs)/transcricao.tsx                 ROTA - uma linha, só reexporta a View
src/views/TranscriptionScreen.tsx          VIEW - o JSX da tela
src/viewmodels/useTranscriptionViewModel.ts    VIEWMODEL - a tela: modo, roteiro, vereditos, relatório
src/viewmodels/useSpeechCaptureViewModel.ts    VIEWMODEL - uma captura do início ao fim, com os tempos
src/models/speechRecognitionModel.ts       MODEL - ÚNICO arquivo que conhece expo-speech-recognition
src/models/transcriptionTestScriptModel.ts MODEL - as cinco frases do roteiro
src/types/speech.ts                        TYPES - contratos entre as camadas
src/utils/speechText.ts                    normalização e taxa de erro por palavra (WER)
src/utils/speechErrors.ts                  códigos nativos → mensagem em português
src/utils/transcriptionReport.ts           relatório em Markdown (função pura)
src/components/common/                     seis cartões passivos da tela
```

As regras de ouro do repositório valem aqui: a View não importa Model (o `SPEECH_LOCALE` e o pacote
on-device chegam nela reexpostos pelo ViewModel), e os componentes recebem tudo por props.

Trocar a biblioteca — inclusive trocar o reconhecedor do sistema por um modelo empacotado — mexe em
`src/models/speechRecognitionModel.ts` e em mais lugar nenhum.

`src/utils/` é pasta nova neste repositório. São três módulos puros, sem React e sem camada: ficam
fora de `models/` porque não acessam fonte de dado nenhuma, e fora de `viewmodels/` porque não têm
estado. Podem receber teste automatizado sem montar componente.

### Configuração do reconhecedor

Em `src/models/speechRecognitionModel.ts`:

| Opção | Valor | Por quê |
|---|---|---|
| `requiresOnDeviceRecognition` | `true` | é o que mantém o áudio dentro do aparelho |
| `androidRecognitionServicePackage` | `com.google.android.as` quando instalado | força o serviço on-device em vez do padrão, que usa rede |
| `continuous` | `false` | o fluxo é uma frase curta por vez; a sessão fecha sozinha no silêncio |
| `interimResults` | `true` | mostra o texto crescendo enquanto a pessoa fala |
| `addsPunctuation` | `true` | pontuação automática (Android 13+, confiável só com on-device) |
| `EXTRA_SPEECH_INPUT_COMPLETE_SILENCE_LENGTH_MILLIS` | `1500` | silêncio que encerra a captura |
| `maxAlternatives` | `1` | menos dados atravessando a ponte por evento |

### Nota sobre as regras do React Compiler

O `eslint-config-expo` do SDK 57 aplica as regras do React Compiler (`react-hooks/refs`,
`react-hooks/purity`, `react-hooks/set-state-in-effect`). Por isso os ViewModels desta POC:

- criam o `Animated.Value` com `useMemo`, não com `useRef().current`;
- não escrevem em `ref` durante o render — o callback de resultado é chamado direto, porque o
  `useSpeechRecognitionEvent` sempre invoca o listener do render mais recente;
- datam o relatório pelo instante do último resultado, não por um `Date.now()` no render.

Quem for mexer nesses arquivos precisa manter essas três coisas, senão o `npm run lint` reprova.

---

## 3. Como rodar

`expo-speech-recognition` é **módulo nativo: não roda no Expo Go**. Isso é uma exceção ao fluxo
padrão do repositório, que usa Expo Go para verificação — e vale para qualquer feature de voz,
não só para esta POC.

```bash
npm install
npx expo run:android    # compila o app nativo, instala e conecta ao Metro
```

O `expo run:android` exige JDK 17 e o Android SDK na máquina. Não há `eas.json` neste repositório,
então o caminho por EAS Build exigiria criar um antes — fora do escopo desta tarefa.

No primeiro uso, no aparelho:

1. conceda a permissão de microfone;
2. confira o cartão **Aparelho** no topo da tela — o selo precisa dizer `offline pronto`;
3. se `Modelo offline pt-BR` aparecer como *não confirmado*, toque em **Baixar modelo offline de
   pt-BR** e aguarde (Android 13+; em algumas versões o sistema só agenda e conclui no Wi-Fi);
4. **ligue o modo avião** e grave de novo: é assim que se prova que a transcrição é local.

---

## 4. O que a tela mede

Três tempos por frase, todos em milissegundos:

| Métrica | De → até | O que significa |
|---|---|---|
| `1º parcial` | início da fala → primeiro texto parcial | latência percebida: quanto tempo a tela fica "muda" |
| `finalização` | fim da fala → resultado final | quanto tempo o reconhecedor leva para fechar a frase |
| `total` | início da captura → resultado final | o fluxo inteiro. Começa depois da permissão concedida: o diálogo do sistema, que só aparece na primeira vez, ficaria dentro da medida |

E a qualidade, como **acerto de palavras**: distância de edição entre a frase falada e a
transcrita, contada em palavras, sem acento e sem pontuação (`src/utils/speechText.ts`). `100%`
é transcrição idêntica. Número por extenso transcrito como dígito conta como erro — o que é uma
limitação da métrica, não do reconhecedor; veja a seção 7.

---

## 5. Resultado dos testes

### 5.1 O que já foi medido — bench `expo-speech-recognition/` (Galaxy S24)

A POC original, o app de bench que deu origem a este port, foi executada num **Galaxy S24** em
build **release**, em ditado contínuo. Números registrados no README daquele projeto:

| Medida | Valor observado |
|---|---|
| Latência do primeiro parcial (on-device) | ~100–400 ms |
| Intervalo entre resultados parciais | ~100–300 ms |
| Tamanho do APK (4 ABIs, app de bench completo) | ~67 MB |
| Primeiro build local completo | ~8 min |

Esses números vêm de **ditado contínuo**, não do fluxo de frase curta desta POC, e servem como
ordem de grandeza: o reconhecimento on-device responde em fração de segundo, não em segundos.

### 5.2 O que falta medir — roteiro das cinco frases

**Ainda não executado.** O roteiro roda dentro do app: abra a aba `Transcrição`, modo
**Roteiro de testes**, fale as cinco frases, marque `OK`/`AJUSTAR` em cada uma e toque em
**Compartilhar relatório**. O Markdown gerado entra aqui, substituindo a tabela abaixo.

| Frase falada | Transcrição | Acerto | 1º parcial | Finalização | Veredito |
| --- | --- | --- | --- | --- | --- |
| Gastei 50 reais no mercado. | _a preencher_ | — | — | — | — |
| Paguei 120 reais de gasolina. | _a preencher_ | — | — | — | — |
| Comprei um lanche por 28 reais. | _a preencher_ | — | — | — | — |
| Recebi 500 reais de um freela. | _a preencher_ | — | — | — | — |
| Gastei 39 e 90 na farmácia. | _a preencher_ | — | — | — | — |

Registre junto: modelo do aparelho, versão do Android, se estava em **modo avião** (o relatório
tem essa marcação) e se o cartão **Aparelho** dizia `offline pronto`.

### 5.3 O que já está verificado neste repositório

| Verificação | Resultado |
|---|---|
| `npm run lint` | passa (resta um aviso anterior a esta POC, em `useLoadingScreenViewModel`) |
| `npm run typecheck` | passa |
| `npx expo-doctor` | 21 de 21 |
| `npx expo export --platform android` | empacota — bundle Hermes de 2,9 MB |
| Plugin de configuração aplicado | `RECORD_AUDIO`, descrições de uso do iOS e `<queries>` de `com.google.android.as` presentes no manifesto gerado (`npx expo config --type introspect`) |
| Funções puras (`speechText`, `transcriptionReport`) | exercitadas fora do app com os casos de acento, caixa, palavra inserida, número por extenso e transcrição vazia |

Execução em aparelho físico e no iOS: **pendente**.

---

## 6. Fluxo implementado × fluxo esperado no ticket

| Ticket | Onde está |
|---|---|
| usuário inicia a gravação | botão `GRAVAR` |
| fala uma frase curta | modo roteiro sugere qual frase falar |
| o áudio é processado localmente | `requiresOnDeviceRecognition: true` + `com.google.android.as` |
| a aplicação retorna o texto transcrito | evento `result` com `isFinal` |
| o texto é exibido para validação | cartão de transcrição, cinza enquanto é parcial |

### Estados da interface

| Estado | O que a tela mostra |
|---|---|
| Carregando | "Lendo as capacidades do aparelho..." no cartão do topo |
| Permissão negada | mensagem em vermelho explicando que sem microfone não há POC |
| Vazio | texto de instrução no lugar da transcrição |
| Ouvindo | barra de nível reagindo ao microfone, botão em `PARAR`, parciais em cinza |
| Sucesso | texto final em escuro + os três tempos e a contagem de parciais |
| Sem fala captada | aviso âmbar ("O reconhecedor não entendeu nada...") |
| Erro do serviço | mensagem em português com a ação corretiva, vinda de `speechErrors.ts` |

---

## 7. Limitações identificadas

**Do reconhecedor do sistema**

1. **Não roda no Expo Go.** Quem for testar precisa de build nativo (`npx expo run:android`).
   Isso contraria o fluxo de verificação padrão do repositório e vale para qualquer feature de voz.
2. **Depende de um serviço que não é nosso.** Aparelho sem os serviços do Google (alguns modelos
   sem GMS) não tem reconhecimento on-device. A tela detecta e avisa, mas não tem plano B.
3. **O modelo pt-BR pode não estar instalado.** O download é do sistema; em algumas versões o
   pedido apenas agenda a transferência e conclui depois, no Wi-Fi.
4. **Sem o modelo offline, o reconhecedor cai para a rede** ou devolve `language-not-supported`.
   Ou seja: *offline não é garantido por padrão*, é uma condição a verificar em cada aparelho.
5. **Pontuação automática** (`addsPunctuation`) só é confiável no Android 13+ com on-device.
6. **Beep do Android** a cada sessão: é comportamento do `SpeechRecognizer` fora do modo contínuo.
   A POC usa sessão curta justamente para fechar sozinha no silêncio, então o beep aparece.
7. **Microfone cai em segundo plano.** Sem foreground service, o Android corta a captura quando o
   app sai da tela.
8. **iOS não testado.** A API existe e o parâmetro de on-device também, mas a disponibilidade
   depende do aparelho e da versão — precisa de um teste real antes de qualquer promessa.
9. **Vocabulário não é ajustável.** Não dá para ensinar ao reconhecedor os nomes de
   estabelecimentos, categorias ou gírias do domínio financeiro.
10. **Privacidade depende da configuração.** Com `requiresOnDeviceRecognition` o áudio não sai do
    aparelho; se a sessão cair para o serviço de rede, sai. A tela mostra qual dos dois está valendo,
    e o relatório registra isso.

**Da POC em si**

11. **A métrica de acerto é literal.** "cinquenta" transcrito como "50" conta como erro de palavra,
    embora seja exatamente o que a camada de interpretação quer receber. Leia o percentual junto
    com o texto, não sozinho.
12. **Sem testes automatizados.** O repositório ainda não tem infraestrutura de teste — as funções
    puras (`speechText`, `transcriptionReport`) foram escritas isoladas justamente para receberem
    teste quando essa infraestrutura existir.
13. **Consumo de recursos não foi medido** (CPU, bateria, memória durante a captura). O bench tem
    um medidor de FPS da thread JS que pode ser reaproveitado se isso virar critério.

---

## 8. Ajustes de repositório feitos junto

| Situação | O que foi feito |
|---|---|
| A pasta `expo-speech-recognition/`, de onde veio esta POC, é um repositório git separado que fica dentro da árvore de trabalho. O `tsconfig` e o ESLint a varriam e quebravam `npm run typecheck` e `npm run lint` na máquina de quem a tem. | Excluída dos dois e adicionada ao `.gitignore`. |
| `src/utils/` não existia. | Criada para os três módulos puros da POC, conforme explicado na seção 2. |

Nenhuma dependência existente mudou: entrou só `expo-speech-recognition`. O `package-lock.json` foi
regenerado com **npm 10** — a mesma versão do CI, como o commit `410dc4f` estabeleceu — para o diff
não voltar a ter ruído de versão de npm.

---

## 9. Viabilidade para o FinUp

**Veredito: viável para seguir, com uma condição.**

O que pesa a favor:

- **Nada de modelo para distribuir.** O APK não cresce, não há download de centenas de MB na
  primeira abertura, não há atualização de modelo para gerenciar.
- **Latência de assistente.** Fração de segundo para o primeiro parcial, medido no bench. É a
  diferença entre "falei e apareceu" e "falei e esperei".
- **Sem custo por uso e sem dado saindo do aparelho** — o oposto de mandar áudio para uma API de
  IA em nuvem, que teria custo por minuto e implicação de privacidade sobre a vida financeira do
  usuário.
- **Isolado atrás de um Model.** Se o reconhecedor do sistema não servir, troca-se a implementação
  sem tocar em View nem em ViewModel.

A condição: **o offline não é garantido, é uma característica do aparelho**. Antes de prometer a
funcionalidade, é preciso medir em quantos aparelhos reais dos usuários o cartão **Aparelho** diz
`offline pronto`. Enquanto isso não for conhecido, o desenho certo é tratar a voz como **atalho
opcional**, nunca como o único caminho para registrar um gasto — com o formulário manual sempre
ao lado.

Próximos passos sugeridos, em ordem:

1. Rodar o roteiro das cinco frases em pelo menos três aparelhos diferentes e preencher a seção 5.2.
2. Testar no iOS antes de qualquer promessa de paridade entre plataformas.
3. Só então começar a camada de interpretação (texto → transação), que é trabalho separado desta POC.
4. Se a cobertura de aparelhos decepcionar, avaliar `whisper.rn` como plano B — sabendo que o preço
   é dezenas de MB de modelo e latência em segundos.
