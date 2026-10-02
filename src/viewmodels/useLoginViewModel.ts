import { useRouter } from 'expo-router';
import { useCallback, useState } from 'react';
import { HttpError } from '@/config/httpClient';
import { authErrorMessage, authModel } from '@/models/authModel';
import { userModel } from '@/models/userModel';

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/**
 * VIEWMODEL - login com e-mail e senha ("Ja sou cliente").
 *
 * Fluxo (contrato finup-backend/contracts/auth-mobile-cognito.md, secao 4):
 *   1. Cognito InitiateAuth USER_AUTH com o e-mail (alias) e a senha
 *   2. GET /api/v1/users/me
 *        200 -> Home
 *        404 -> conta existe no Cognito mas nao no back: retoma o cadastro na
 *               Etapa 2 (o POST /users acontece no Salvar dela)
 *
 * A senha so vive neste estado e e apagada quando o login termina.
 */
export function useLoginViewModel() {
  const router = useRouter();
  const [email, setEmailValue] = useState('');
  const [password, setPasswordValue] = useState('');
  const [emailTouched, setEmailTouched] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const emailValid = EMAIL_REGEX.test(email.trim());
  const canSubmit = emailValid && password.length > 0 && !submitting;
  const emailError =
    emailTouched && email.trim() && !emailValid ? 'Deve ser um e-mail válido.' : undefined;

  const setEmail = useCallback((value: string) => {
    setEmailValue(value);
    setError(null);
  }, []);

  const setPassword = useCallback((value: string) => {
    setPasswordValue(value);
    setError(null);
  }, []);

  const touchEmail = useCallback(() => setEmailTouched(true), []);

  const submit = useCallback(async () => {
    if (!canSubmit) return;
    setSubmitting(true);
    setError(null);

    try {
      await authModel.signIn(email.trim().toLowerCase(), password);
    } catch (signInError) {
      setError(authErrorMessage(signInError, 'signIn'));
      setSubmitting(false);
      return;
    }

    try {
      await userModel.getMe();
      setPasswordValue('');
      router.replace('/home');
    } catch (meError) {
      if (meError instanceof HttpError && meError.status === 404) {
        setPasswordValue('');
        router.replace({ pathname: '/(auth)/cadastro', params: { retomar: '1' } });
        return;
      }
      setError('Não foi possível carregar seus dados. Tente novamente.');
    } finally {
      setSubmitting(false);
    }
  }, [canSubmit, email, password, router]);

  return {
    email,
    password,
    emailError,
    error,
    canSubmit,
    submitting,
    setEmail,
    setPassword,
    touchEmail,
    submit,
  };
}
