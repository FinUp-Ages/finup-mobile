import { useCallback, useEffect, useState } from 'react';
import { transactionModel } from '@/models/transactionModel';
import type { TransactionType } from '@/types/transaction';
import { todayIsoDate } from '@/utils/dates';

// Inicio fixo para o "saldo total": o GET /transactions so devolve saldo de um
// periodo, e nao ha endpoint de saldo acumulado. Transacoes futuras (data depois
// de hoje) ficam fora, como num extrato.
const BALANCE_FROM = '1970-01-01';

export type BalanceState =
  { status: 'loading' } | { status: 'error' } | { status: 'ready'; value: number };

function fetchBalance(): Promise<BalanceState> {
  return transactionModel
    .list(BALANCE_FROM, todayIsoDate())
    .then(({ balance }): BalanceState => ({ status: 'ready', value: balance }))
    .catch((error: unknown): BalanceState => {
      if (__DEV__) console.warn('[Analise] falha ao carregar o saldo', error);
      return { status: 'error' };
    });
}

/**
 * VIEWMODEL - tela Analise: saldo total exibido no topo e no modal de transacao.
 *
 * O saldo tem tres estados (carregando, erro com nova tentativa, valor): uma
 * falha nao vira "R$ 0,00" e nao impede o registro de transacao. Depois de
 * salvar, o valor atual continua na tela enquanto o novo carrega.
 */
export function useAnaliseViewModel() {
  const [balance, setBalance] = useState<BalanceState>({ status: 'loading' });
  const [modalVisible, setModalVisible] = useState(false);

  useEffect(() => {
    let cancelled = false;
    fetchBalance().then((next) => {
      if (!cancelled) setBalance(next);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  const reloadBalance = useCallback(() => {
    void fetchBalance().then(setBalance);
  }, []);

  const retryBalance = useCallback(() => {
    setBalance({ status: 'loading' });
    reloadBalance();
  }, [reloadBalance]);

  // O tipo fica guardado depois de fechar, para nada trocar enquanto a camada some.
  const [modalType, setModalType] = useState<TransactionType>('INCOME');

  const openModal = useCallback((type: TransactionType) => {
    setModalType(type);
    setModalVisible(true);
  }, []);
  // Estavel: o TransactionModal registra o botao voltar do Android com ele.
  const closeModal = useCallback(() => setModalVisible(false), []);

  return {
    balance,
    balanceValue: balance.status === 'ready' ? balance.value : null,
    retryBalance,
    modalVisible,
    modalType,
    openModal,
    closeModal,
    onTransactionSaved: reloadBalance,
  };
}
