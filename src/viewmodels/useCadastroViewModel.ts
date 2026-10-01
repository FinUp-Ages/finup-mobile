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
import {
  formatCurrency,
  formatPhone,
  parseCurrencyToNumber,
  sanitizeEmail,
  sanitizeName,
} from '@/utils/masks';

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
const NAME_REGEX = /^[a-zA-ZÀ-ÖØ-öø-ÿ\s'-]+$/;
// Letra, numero e simbolo, minimo 8 - espelha o aviso do Figma. E so validacao de
// UX: a politica real e a do pool do Cognito, que pode ser mais forte. Nesse caso
// o SignUp devolve InvalidPasswordException e a mensagem aparece na Etapa 3.
const PASSWORD_REGEX = /^(?=.*[A-Za-z])(?=.*\d)(?=.*[^A-Za-z0-9\s]).{8,}$/;
const CODE_REGEX = /^\d{6}$/;
// Mesmo texto do AliasExistsException do Cognito (authModel), para a pessoa ver a
// mesma mensagem no aviso do campo e na confirmacao do codigo.
const EMAIL_TAKEN_MESSAGE = 'Este e-mail já está cadastrado.';

function computeStep1Errors(data: CadastroFormData): CadastroFormErrors {
  const errors: CadastroFormErrors = {};
  if (!data.nome.trim()) {
    errors.nome = true;
  } else if (!NAME_REGEX.test(data.nome.trim())) {
    errors.nome = 'Deve conter apenas letras, espaços, hífen ou apóstrofo.';
  }

  if (!data.sobrenome.trim()) {
    errors.sobrenome = true;
  } else if (!NAME_REGEX.test(data.sobrenome.trim())) {
    errors.sobrenome = 'Deve conter apenas letras, espaços, hífen ou apóstrofo.';
  }

  if (!data.email.trim()) {
    errors.email = true;
  } else if (!EMAIL_REGEX.test(data.email.trim())) {
    errors.email = 'Informe um e-mail válido (ex.: nome@exemplo.com).';
  }

  if (!data.celular.trim()) {
    errors.celular = true;
  } else {
    const digits = data.celular.replace(/\D/g, '');
    if (digits.length !== 10 && digits.length !== 11) {
      errors.celular = 'Informe um telefone celular válido com DDD (10 ou 11 dígitos).';
    }
  }
  return errors;
}

function computeStep2Errors(data: CadastroFormData): CadastroFormErrors {
  const errors: CadastroFormErrors = {};
  // Formato/data-no-passado nao precisa ser validado aqui: o calendario nativo
  // (DateField) so permite selecionar datas ate hoje, entao um valor presente
  // ja e garantidamente valido.
  if (!data.birthDate) errors.birthDate = true;
  if (data.monthlyIncome.trim()) {
    const value = parseCurrencyToNumber(data.monthlyIncome);
    if (value === undefined || value < 0) {
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
  // Consulta de e-mail ja cadastrado (Etapa 1): `emailTaken` mostra a mensagem e
  // bloqueia o Proximo; `checkingEmail` so aparece no botao ao avancar.
  const [emailTaken, setEmailTaken] = useState(false);
  const [checkingEmail, setCheckingEmail] = useState(false);

  // UUID do SignUp atual: o ConfirmSignUp e o login precisam dele.
  const usernameRef = useRef<string | null>(null);
  // Vira true depois do login, para o retry nao depender mais da senha.
  const signedInRef = useRef(false);
  // Ultimo e-mail consultado e o resultado, para nao repetir a mesma consulta.
  const emailCheckRef = useRef<{ email: string; available: boolean } | null>(null);
  // Numera as consultas: resposta de um e-mail que ja mudou e descartada.
  const emailRequestRef = useRef(0);

  const allErrors = useMemo(() => computeStepErrors(step, data), [step, data]);
  const formValid = Object.keys(allErrors).length === 0;
  const canProceed =
    phase === 'form'
      ? formValid && !(step === 1 && emailTaken)
      : phase === 'code'
        ? CODE_REGEX.test(code)
        : true;

  const errors = useMemo(() => {
    const visible: CadastroFormErrors = {};
    for (const key of Object.keys(allErrors) as (keyof CadastroFormData)[]) {
      if (touched[key]) visible[key] = allErrors[key];
    }
    if (emailTaken) visible.email = EMAIL_TAKEN_MESSAGE;
    return visible;
  }, [allErrors, touched, emailTaken]);

  const setField = useCallback(
    <K extends keyof CadastroFormData>(field: K, value: CadastroFormData[K]) => {
      let formattedValue = value;
      if (typeof value === 'string') {
        if (field === 'nome' || field === 'sobrenome') {
          formattedValue = sanitizeName(value) as CadastroFormData[K];
        } else if (field === 'email') {
          formattedValue = sanitizeEmail(value) as CadastroFormData[K];
        } else if (field === 'celular') {
          formattedValue = formatPhone(value) as CadastroFormData[K];
        } else if (field === 'monthlyIncome') {
          formattedValue = formatCurrency(value) as CadastroFormData[K];
        }
      }

      setData((prev) => ({ ...prev, [field]: formattedValue }));
      setSubmitError(null);
      if (field === 'email') {
        // E-mail novo: a consulta em andamento e o aviso eram do anterior.
        emailRequestRef.current += 1;
        setEmailTaken(false);
        setCheckingEmail(false);
      }
    },
    [],
  );

  /**
   * Consulta se o e-mail ja esta cadastrado e devolve se a Etapa 1 pode avancar.
   *
   * So consulta e-mail com formato valido (o formulario ja barra o resto) e nao
   * repete o e-mail ja consultado. Falha da consulta (sem rede, erro do back) NAO
   * bloqueia: o aviso e so uma ajuda, e o Cognito (AliasExistsException) e o 409 do
   * POST /users continuam sendo a barreira final. Devolve false tambem se o e-mail
   * mudou durante a consulta: quem chamou nao deve avancar com resposta velha.
   */
  const checkEmail = useCallback(async (): Promise<boolean> => {
    const email = data.email.trim().toLowerCase();
    if (!EMAIL_REGEX.test(email)) return true;

    const last = emailCheckRef.current;
    if (last?.email === email) {
      setEmailTaken(!last.available);
      return last.available;
    }

    emailRequestRef.current += 1;
    const request = emailRequestRef.current;
    setCheckingEmail(true);
    try {
      const available = await userModel.isEmailAvailable(email);
      if (request !== emailRequestRef.current) return false;
      emailCheckRef.current = { email, available };
      setEmailTaken(!available);
      return available;
    } catch (error) {
      if (__DEV__) {
        console.warn('[cadastro] consulta de e-mail falhou; seguindo sem bloquear.', error);
      }
      return request === emailRequestRef.current;
    } finally {
      if (request === emailRequestRef.current) setCheckingEmail(false);
    }
  }, [data.email]);

  const touchField = useCallback(
    (field: keyof CadastroFormData) => {
      setTouched((prev) => ({ ...prev, [field]: true }));
      // Ao sair do campo de e-mail, avisa na hora se ele ja existe. A retomada do
      // cadastro abre na Etapa 2 e nao passa pelo e-mail.
      if (field === 'email' && !resume) void checkEmail();
    },
    [checkEmail, resume],
  );

  const setCode = useCallback((value: string) => {
    setCodeValue(value.replace(/\D/g, '').slice(0, 6));
    setSubmitError(null);
  }, []);

  const goNext = useCallback(async () => {
    if (!canProceed || checkingEmail) return;
    // O blur pode nao ter disparado (o toque no botao nao tira o foco do campo em
    // todo aparelho), entao confere o e-mail antes de sair da Etapa 1.
    if (step === 1 && !resume && !(await checkEmail())) return;
    setStep((prev) => (prev < lastStep ? ((prev + 1) as CadastroStep) : prev));
  }, [canProceed, checkingEmail, step, resume, checkEmail, lastStep]);

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
    if (!signedInRef.current) {
      if (resume) {
        if (!(await authModel.hasSession())) {
          throw new Error('Sessao ausente ao retomar o cadastro.');
        }
      } else {
        await authModel.signIn(usernameRef.current ?? '', data.senha);
        setData((prev) => ({ ...prev, senha: '', confirmarSenha: '' }));
      }
      signedInRef.current = true;
    }

    await userModel.ensureCreated();
    await userModel.updateAdditionalInfo(toAdditionalInfo(data));
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
    checkingEmail,
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
