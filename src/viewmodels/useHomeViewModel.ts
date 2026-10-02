import { useFocusEffect, useRouter } from 'expo-router';
import { useCallback, useRef, useState } from 'react';
import { HttpError } from '@/config/httpClient';
import { transactionErrorMessage, transactionModel } from '@/models/transactionModel';
import { userModel } from '@/models/userModel';
import type { TransactionsResponse } from '@/types/transaction';
import { getRecentTransactionPeriod } from '@/utils/transactions';

type HomeState =
  | { status: 'loading' }
  | { status: 'success'; data: TransactionsResponse }
  | { status: 'error'; message: string; httpStatus?: number };

export function useHomeViewModel() {
  const router = useRouter();
  const [state, setState] = useState<HomeState>({ status: 'loading' });
  const [userName, setUserName] = useState('');
  const [period, setPeriod] = useState(getRecentTransactionPeriod);
  const requestId = useRef(0);
  const focused = useRef(false);
  const controller = useRef<AbortController | null>(null);

  const reload = useCallback(() => {
    if (!focused.current) return;
    controller.current?.abort();
    controller.current = new AbortController();
    const id = ++requestId.current;
    const currentPeriod = getRecentTransactionPeriod();
    const isCurrent = () => focused.current && id === requestId.current;
    setPeriod(currentPeriod);
    setState({ status: 'loading' });
    setUserName('');

    transactionModel
      .list(currentPeriod, controller.current.signal)
      .then((data) => {
        if (isCurrent()) setState({ status: 'success', data });
      })
      .catch((error: unknown) => {
        if (!isCurrent()) return;
        setState({
          status: 'error',
          message: transactionErrorMessage(error),
          httpStatus: error instanceof HttpError ? error.status : undefined,
        });
      });

    // Falha ao buscar o nome nao impede a exibicao das transacoes.
    userModel
      .getMe()
      .then((user) => {
        if (isCurrent()) setUserName(user.name.trim().split(/\s+/)[0]);
      })
      .catch(() => {
        // Sem nome ficticio: a View mantem uma saudacao neutra.
      });
  }, []);

  useFocusEffect(
    useCallback(() => {
      focused.current = true;
      reload();

      return () => {
        focused.current = false;
        requestId.current++;
        controller.current?.abort();
      };
    }, [reload]),
  );

  const resumeRegistration = useCallback(() => {
    router.replace({ pathname: '/(auth)/cadastro', params: { retomar: '1' } });
  }, [router]);
  const signIn = useCallback(() => router.replace('/(auth)'), [router]);

  return { state, userName, period, reload, resumeRegistration, signIn };
}
