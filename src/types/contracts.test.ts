import assert from 'node:assert/strict';
import { test } from 'node:test';
import type { AnalisePeriodKey, AnaliseTypeFilter } from './analise';
import type { CadastroFormData, CadastroFormErrors, CadastroPhase, CadastroStep } from './cadastro';
import type { AiAssistantRequest, ChatMessage, VoiceStatus } from './chatbot';
import type { Example, ExamplePayload } from './example';
import type { HomeStatus, TransactionTypeFilter } from './home';
import type { DeviceSpeechSupport, TestPhraseResult, TranscriptionResult, TranscriptionStatus } from './speech';
import type { SpendingAlert, SpendingAlertsResponse } from './spendingAlert';
import type { StudyAnswersRequest, StudyContent } from './studySession';
import type { StudyPublishedContent, StudyTrackProgress } from './studyTrack';
import type { CreateTransactionPayload, TransactionResponse, TransactionType } from './transaction';
import { investorProfileLabels } from './triage';
import type { Answer, AssessmentResponse, TriageQuestion } from './triage';

// Estas verificações são avaliadas pelo `tsc --noEmit`; não executam código nem
// comprovam que dados recebidos da rede correspondem aos tipos declarados.
type Equal<A, B> = (<T>() => T extends A ? 1 : 2) extends (<T>() => T extends B ? 1 : 2) ? true : false;
type Assert<T extends true> = T;
type Optional<T, K extends keyof T> = {} extends Pick<T, K> ? true : false;

export type TypeContractChecks = [
  Assert<Equal<AnalisePeriodKey, '7d' | '15d' | '30d' | '3m' | '6m' | '12m'>>,
  Assert<Equal<AnaliseTypeFilter, 'ALL' | TransactionType>>,
  Assert<Equal<CadastroStep, 1 | 2 | 3>>,
  Assert<Equal<CadastroPhase, 'form' | 'code' | 'finishing'>>,
  Assert<Equal<CadastroFormErrors['email'], string | true | undefined>>,
  Assert<Equal<CadastroFormData['senha'], string>>,
  Assert<Equal<AiAssistantRequest['message'], string>>,
  Assert<Equal<Optional<AiAssistantRequest, 'conversationId'>, true>>,
  Assert<Equal<ChatMessage['status'], 'error' | 'sending' | 'sent'>>,
  Assert<Equal<VoiceStatus, 'idle' | 'starting' | 'recording' | 'processing'>>,
  Assert<Equal<keyof ExamplePayload, 'name' | 'description'>>,
  Assert<Equal<ExamplePayload['name'], Example['name']>>,
  Assert<Equal<ExamplePayload['description'], Example['description']>>,
  Assert<Equal<HomeStatus, 'loading' | 'error' | 'success'>>,
  Assert<Equal<TransactionTypeFilter, 'ALL' | TransactionType>>,
  Assert<Equal<TranscriptionStatus, 'idle' | 'starting' | 'listening' | 'finishing'>>,
  Assert<Equal<TranscriptionResult['metrics']['firstPartialMs'], number | null>>,
  Assert<Equal<TestPhraseResult['verdict'], 'ok' | 'ajustar' | null>>,
  Assert<Equal<DeviceSpeechSupport['installedLocales'], string[]>>,
  Assert<Equal<SpendingAlert['dismissedAt'], string | null | undefined>>,
  Assert<Equal<SpendingAlertsResponse['alerts'], SpendingAlert[]>>,
  Assert<Equal<StudyContent['type'], 'MULTIPLE_CHOICE' | 'FILL_BLANK' | 'LEARNING'>>,
  Assert<Equal<StudyPublishedContent['type'], StudyContent['type']>>,
  Assert<Equal<StudyAnswersRequest['answers'][number]['answer'], string | null>>,
  Assert<Equal<StudyTrackProgress['categories'][number]['levels'][number]['correct'], boolean | null>>,
  Assert<Equal<TransactionType, 'INCOME' | 'EXPENSE'>>,
  Assert<Equal<CreateTransactionPayload['paymentMethodId'], string | null>>,
  Assert<Equal<Optional<CreateTransactionPayload, 'description'>, true>>,
  Assert<Equal<'userId' extends keyof CreateTransactionPayload ? true : false, false>>,
  Assert<Equal<TransactionResponse['userId'], string>>,
  Assert<Equal<Answer, string | number | boolean | string[]>>,
  Assert<Equal<TriageQuestion['requiredWhen'], { questionId: string; equals: boolean } | null>>,
  Assert<Equal<AssessmentResponse['assessment']['profile'], keyof typeof investorProfileLabels>>,
];

test('rótulos dos perfis exibem os nomes esperados', () => {
  assert.deepEqual(investorProfileLabels, {
    CONSERVATIVE: 'Conservador',
    MODERATE: 'Moderado',
    AGGRESSIVE: 'Arrojado',
  });
});
