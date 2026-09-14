import { useCallback, useMemo, useState } from 'react';
import { submitCadastroMock } from '@/models/cadastroModel';
import type { CadastroFormData, CadastroFormErrors, CadastroStep } from '@/types/cadastro';

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
// Letra, numero e simbolo, minimo 8 - espelha o aviso do Figma. A politica real de
// senha vem do Cognito quando ele for configurado; isto e so validacao de UX.
const PASSWORD_REGEX = /^(?=.*[A-Za-z])(?=.*\d)(?=.*[^A-Za-z0-9\s]).{8,}$/;

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
  else if (data.confirmarSenha !== data.senha)
    errors.confirmarSenha = 'As senhas não coincidem.';
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
 */
export function useCadastroViewModel() {
  const [step, setStep] = useState<CadastroStep>(1);
  const [data, setData] = useState<CadastroFormData>(INITIAL_DATA);
  const [touched, setTouched] = useState<TouchedFields>({});
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  const allErrors = useMemo(() => computeStepErrors(step, data), [step, data]);
  const canProceed = Object.keys(allErrors).length === 0;

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
    },
    [],
  );

  const touchField = useCallback((field: keyof CadastroFormData) => {
    setTouched((prev) => ({ ...prev, [field]: true }));
  }, []);

  const goNext = useCallback(() => {
    if (!canProceed) return;
    setStep((prev) => (prev < 3 ? ((prev + 1) as CadastroStep) : prev));
  }, [canProceed]);

  const goBack = useCallback(() => {
    setStep((prev) => (prev > 1 ? ((prev - 1) as CadastroStep) : prev));
  }, []);

  const submit = useCallback(async () => {
    if (!canProceed) return;
    setSubmitting(true);
    try {
      await submitCadastroMock(data);
      setSuccess(true);
      // Senha nao precisa continuar em memoria depois do envio.
      setData((prev) => ({ ...prev, senha: '', confirmarSenha: '' }));
    } finally {
      setSubmitting(false);
    }
  }, [canProceed, data]);

  return {
    step,
    data,
    errors,
    canProceed,
    submitting,
    success,
    setField,
    touchField,
    goNext,
    goBack,
    submit,
  };
}
