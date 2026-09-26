import { useCallback, useEffect, useMemo, useState } from 'react';
import { friendlyMessageFromError } from '@/config/httpClient';
import { categoriesModel } from '@/models/categoriesModel';
import { currentUserModel } from '@/models/currentUserModel';
import { listPaymentMethodsMock } from '@/models/paymentMethodsModel';
import { transactionModel } from '@/models/transactionModel';
import type { Category, PaymentMethod, TransactionType } from '@/types/transaction';

type Params = {
  onClose: () => void;
  onSuccess?: () => void;
};

type TouchedFields = { amount?: boolean; category?: boolean };

function todayIsoDate(): string {
  const now = new Date();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${now.getFullYear()}-${month}-${day}`;
}

/**
 * VIEWMODEL - estado e regras do TransactionModal.
 *
 * Um novo componente que usa este hook e montado a cada vez que o modal abre
 * (ver TransactionModal.tsx - o conteudo so existe na arvore quando
 * `visible`), entao o formulario sempre comeca limpo sem precisar de logica
 * de reset: o carregamento de categorias/metodos/usuario roda uma vez no
 * mount.
 *
 * `type` da transacao nao mora no estado: e passado direto pra `submit`,
 * porque quem decide e o botao clicado ("Salvar entrada"/"Salvar saida"), nao
 * uma selecao previa no formulario.
 */
export function useTransactionModalViewModel({ onClose, onSuccess }: Params) {
  const [amount, setAmount] = useState(0);
  const [categoryId, setCategoryId] = useState<string | null>(null);
  const [paymentMethodId, setPaymentMethodId] = useState<string | null>(null);
  const [touched, setTouched] = useState<TouchedFields>({});

  const [categories, setCategories] = useState<Category[]>([]);
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
  const [userId, setUserId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  const [submitting, setSubmitting] = useState(false);
  const [submittingType, setSubmittingType] = useState<TransactionType | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    // allSettled (nao all): categorias/usuario dependem de rede (podem falhar
    // se o backend nao tiver as branches certas) mas metodos de pagamento sao
    // mock local e sempre resolvem - um Promise.all faria a falha de rede
    // apagar tambem os metodos de pagamento, que nao tem nada a ver com isso.
    Promise.allSettled([
      categoriesModel.listAvailable(),
      listPaymentMethodsMock(),
      currentUserModel.getCurrent(),
    ]).then(([categoriesResult, paymentMethodsResult, currentUserResult]) => {
      if (cancelled) return;

      if (categoriesResult.status === 'fulfilled') setCategories(categoriesResult.value);
      if (paymentMethodsResult.status === 'fulfilled') setPaymentMethods(paymentMethodsResult.value);
      if (currentUserResult.status === 'fulfilled') setUserId(currentUserResult.value.id);

      const firstRejected = [categoriesResult, paymentMethodsResult, currentUserResult].find(
        (result) => result.status === 'rejected',
      );
      if (firstRejected && firstRejected.status === 'rejected') {
        setLoadError(
          friendlyMessageFromError(
            firstRejected.reason,
            'Não foi possível carregar os dados do formulário.',
          ),
        );
      }

      setLoading(false);
    });

    return () => {
      cancelled = true;
    };
  }, []);

  const amountValid = amount > 0;
  const categoryValid = categoryId !== null;
  const canSubmit = amountValid && categoryValid && Boolean(userId) && !submitting;

  const errors = useMemo(
    () => ({
      amount: touched.amount && !amountValid ? true : undefined,
      category: touched.category && !categoryValid ? true : undefined,
    }),
    [touched, amountValid, categoryValid],
  );

  const touchAmount = useCallback(() => setTouched((prev) => ({ ...prev, amount: true })), []);
  const touchCategory = useCallback(() => setTouched((prev) => ({ ...prev, category: true })), []);

  const submit = useCallback(
    async (type: TransactionType) => {
      setTouched({ amount: true, category: true });
      if (!amountValid || !categoryValid || !userId || submitting) return;

      setSubmitting(true);
      setSubmittingType(type);
      setSubmitError(null);
      try {
        await transactionModel.create({
          userId,
          categoryId: categoryId as string,
          paymentMethodId,
          type,
          amount,
          transactionDate: todayIsoDate(),
          isRecurring: false,
        });
        onSuccess?.();
        onClose();
      } catch (error) {
        setSubmitError(friendlyMessageFromError(error));
      } finally {
        setSubmitting(false);
        setSubmittingType(null);
      }
    },
    [amountValid, categoryValid, userId, submitting, categoryId, paymentMethodId, amount, onSuccess, onClose],
  );

  return {
    amount,
    setAmount,
    categoryId,
    setCategoryId,
    paymentMethodId,
    setPaymentMethodId,
    categories,
    paymentMethods,
    loading,
    loadError,
    errors,
    canSubmit,
    submitting,
    submittingType,
    submitError,
    touchAmount,
    touchCategory,
    submit,
  };
}
