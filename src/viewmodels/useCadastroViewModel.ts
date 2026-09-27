import { useRouter } from 'expo-router';
import { useCallback, useMemo, useRef, useState } from 'react';
import { HttpError } from '@/config/httpClient';
import { authErrorMessage, authModel, type AuthOperation } from '@/models/authModel';
import { toAdditionalInfo, toSignUpInput } from '@/models/cadastroModel';
import { userModel } from '@/models/userModel';
import type {
  CadastroFormData,
  CadastroFormErrors,
  CadastroPhase,
  CadastroStep,
} from '@/types/cadastro';

const INITIAL_DATA: CadastroFormData = {
  nome: '',
  sobrenome: '',
  email: '',
  celular: '',
  birthDate: '',
  monthlyIncome: '',
  profissao: '',
  senha: '',
  confirmarSenha: '',
};

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
// Letra, numero e simbolo, minimo 8 - espelha o aviso do Figma. E so validacao de
// UX: a politica real e a do pool do Cognito, que pode ser mais forte. Nesse caso
// o SignUp devolve InvalidPasswordException e a mensagem aparece na Etapa 3.
const PASSWORD_REGEX = /^(?=.*[A-Za-z])(?=.*\d)(?=.*[^A-Za-z0-9\s]).{8,}$/;
const CODE_REGEX = /^\d{6}$/;

function computeStep1Errors(data: CadastroFormData): CadastroFormErrors {
  const errors: CadastroFormErrors = {};
  if (!data.nome.trim()) errors.nome = true;
  if (!data.sobrenome.trim()) errors.sobrenome = true;
  if (!data.email.trim()) errors.email = true;
  else if (!EMAIL_REGEX.test(data.email.trim())) errors.email = 'Deve ser um e-mail válido.';
  if (!data.celular.trim()) errors.celular = true;
  return errors;
}

function computeStep2Errors(data: CadastroFormData): CadastroFormErrors {
  const errors: CadastroFormErrors = {};
  // Formato/data-no-passado nao precisa ser validado aqui: o calendario nativo
  // (DateField) so permite selecionar datas ate hoje, entao um valor presente
  // ja e garantidamente valido.
  if (!data.birthDate) errors.birthDate = true;
  if (data.monthlyIncome.trim()) {
    const value = Number(data.monthlyIncome.replace(',', '.'));
    if (Number.isNaN(value) || value < 0) {
      errors.monthlyIncome = 'Deve ser um valor numérico e não negativo.';
    }
  }
  return errors;
}

function computeStep3Errors(data: CadastroFormData): CadastroFormErrors {
  const errors: CadastroFormErrors = {};
  if (!data.senha) {
    errors.senha = true;
  } else if (!PASSWORD_REGEX.test(data.senha)) {
    errors.senha = 'Deve conter letras, números e símbolos, com no mínimo 8 caracteres.';
  }
  if (!data.confirmarSenha) errors.confirmarSenha = true;
  else if (data.confirmarSenha !== data.senha) errors.confirmarSenha = 'As senhas não coincidem.';
  return errors;
}

function computeStepErrors(step: CadastroStep, data: CadastroFormData): CadastroFormErrors {
  if (step === 1) return computeStep1Errors(data);
  if (step === 2) return computeStep2Errors(data);
  return computeStep3Errors(data);
}

type TouchedFields = Partial<Record<keyof CadastroFormData, boolean>>;

/**
 * VIEWMODEL - estado e regras do fluxo de cadastro (3 etapas).
 *
 * Guarda os dados de todas as etapas no mesmo estado, por isso nada se perde ao
 * navegar entre elas. A validacao da etapa atual e recalculada a cada mudanca
 * (useMemo), nao so ao clicar em "Proximo" - e o que permite desabilitar o botao
 * em tempo real, conforme a pessoa digita.
 *
 * `errors` (o que a View mostra) so revela o erro de um campo depois que a
 * pessoa tocou nele e saiu (`touched`) - senao a tela inteira apareceria
 * vermelha assim que carregasse, antes de qualquer interacao, o que e agressivo
 * demais. `canProceed` (habilita o botao) usa a validacao completa, sem esse
 * filtro: o botao so libera quando os dados realmente estao validos, tocados
 * ou nao.
 *
 * Envio (contrato finup-backend/contracts/auth-mobile-cognito.md, secao 4), tudo
 * no Salvar da Etapa 3, porque o SignUp precisa da data (Etapa 2) e da senha:
 *   form      -> SignUp no Cognito com um UUID como username
 *   code      -> ConfirmSignUp com o codigo do e-mail (ou reenviar)
 *   finishing -> login USER_AUTH, POST /users (409 segue), PATCH additional-info,
 *                Home. Se falhar aqui, "Tentar novamente" retoma deste ponto sem
 *                refazer o SignUp.
 *
 * A senha e o UUID ficam so em memoria. A senha e apagada logo depois do login.
 *
 * `resume`: a conta ja existe no Cognito, mas nao no back (GET /users/me = 404
 * no login ou na abertura do app). Abre direto na Etapa 2 e o Salvar faz so o
 * POST /users e o PATCH, com a sessao que ja esta no secureStorage.
 */
export function useCadastroViewModel({ resume = false }: { resume?: boolean } = {}) {
  const router = useRouter();
  const firstStep: CadastroStep = resume ? 2 : 1;
  const lastStep: CadastroStep = resume ? 2 : 3;

  const [step, setStep] = useState<CadastroStep>(firstStep);
  const [data, setData] = useState<CadastroFormData>(INITIAL_DATA);
  const [touched, setTouched] = useState<TouchedFields>({});
  const [phase, setPhase] = useState<CadastroPhase>('form');
  const [code, setCodeValue] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [resending, setResending] = useState(false);
  const [codeResent, setCodeResent] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  // UUID do SignUp atual: o ConfirmSignUp e o login precisam dele.
  const usernameRef = useRef<string | null>(null);
  // Preenchido depois do login, para o retry nao depender mais da senha.
  const accessTokenRef = useRef<string | null>(null);

  const allErrors = useMemo(() => computeStepErrors(step, data), [step, data]);
  const formValid = Object.keys(allErrors).length === 0;
  const canProceed = phase === 'form' ? formValid : phase === 'code' ? CODE_REGEX.test(code) : true;

  const errors = useMemo(() => {
    const visible: CadastroFormErrors = {};
    for (const key of Object.keys(allErrors) as (keyof CadastroFormData)[]) {
      if (touched[key]) visible[key] = allErrors[key];
    }
    return visible;
  }, [allErrors, touched]);

  const setField = useCallback(
    <K extends keyof CadastroFormData>(field: K, value: CadastroFormData[K]) => {
      setData((prev) => ({ ...prev, [field]: value }));
      setSubmitError(null);
    },
    [],
  );

  const touchField = useCallback((field: keyof CadastroFormData) => {
    setTouched((prev) => ({ ...prev, [field]: true }));
  }, []);

  const setCode = useCallback((value: string) => {
    setCodeValue(value.replace(/\D/g, '').slice(0, 6));
    setSubmitError(null);
  }, []);

  const goNext = useCallback(() => {
    if (!canProceed) return;
    setStep((prev) => (prev < lastStep ? ((prev + 1) as CadastroStep) : prev));
  }, [canProceed, lastStep]);

  const goBack = useCallback(() => {
    setSubmitError(null);
    if (phase === 'code') {
      // Volta para a Etapa 3. Um novo Salvar faz outro SignUp com outro UUID; a
      // conta anterior fica orfa (nao confirmada) no pool, sem efeito.
      usernameRef.current = null;
      setCodeValue('');
      setCodeResent(false);
      setPhase('form');
      return;
    }
    setStep((prev) => (prev > firstStep ? ((prev - 1) as CadastroStep) : prev));
  }, [phase, firstStep]);

  const finishRegistration = useCallback(async () => {
    if (!accessTokenRef.current) {
      if (resume) {
        accessTokenRef.current = await authModel.getAccessToken();
        if (!accessTokenRef.current) {
          throw new Error('Sessao ausente ao retomar o cadastro.');
        }
      } else {
        accessTokenRef.current = await authModel.signIn(usernameRef.current ?? '', data.senha);
        setData((prev) => ({ ...prev, senha: '', confirmarSenha: '' }));
      }
    }

    await userModel.ensureCreated(accessTokenRef.current);
    await userModel.updateAdditionalInfo(accessTokenRef.current, toAdditionalInfo(data));
    router.replace('/profile');
  }, [data, resume, router]);

  const submit = useCallback(async () => {
    if (!canProceed || submitting) return;
    setSubmitting(true);
    setSubmitError(null);

    let operation: AuthOperation = 'signIn';
    try {
      if (phase === 'form' && !resume) {
        operation = 'signUp';
        const username = authModel.generateUsername();
        await authModel.signUp(toSignUpInput(data, username));
        usernameRef.current = username;
        setPhase('code');
        return;
      }

      if (phase === 'code') {
        operation = 'confirmSignUp';
        await authModel.confirmSignUp(usernameRef.current ?? '', code);
        setPhase('finishing');
        operation = 'signIn';
      }

      await finishRegistration();
    } catch (error) {
      setSubmitError(describeError(error, operation));
    } finally {
      setSubmitting(false);
    }
  }, [canProceed, submitting, phase, resume, data, code, finishRegistration]);

  const resendCode = useCallback(async () => {
    if (!usernameRef.current || resending) return;
    setResending(true);
    setSubmitError(null);
    setCodeResent(false);
    try {
      await authModel.resendCode(usernameRef.current);
      setCodeResent(true);
    } catch (error) {
      setSubmitError(authErrorMessage(error, 'resendCode'));
    } finally {
      setResending(false);
    }
  }, [resending]);

  const close = useCallback(async () => {
    if (resume) {
      // Sem os dados adicionais o cadastro nao termina: sai da conta. O proximo
      // login cai de novo no GET /users/me = 404 e volta para ca.
      await authModel.signOut();
      router.replace('/(auth)');
      return;
    }
    router.back();
  }, [resume, router]);

  return {
    step,
    phase,
    data,
    errors,
    code,
    canProceed,
    submitting,
    resending,
    codeResent,
    submitError,
    isLastStep: step === lastStep,
    canGoBack: phase === 'code' || (phase === 'form' && step > firstStep),
    showProgress: !resume && phase === 'form',
    setField,
    touchField,
    setCode,
    goNext,
    goBack,
    submit,
    resendCode,
    close,
  };
}

function describeError(error: unknown, operation: AuthOperation): string {
  if (error instanceof HttpError) {
    return error.status === 400
      ? 'Algum dado adicional é inválido. Confira e tente novamente.'
      : 'Não foi possível salvar seus dados. Tente novamente.';
  }
  return authErrorMessage(error, operation);
}
