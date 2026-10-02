import { useCallback, useEffect, useMemo, useState } from 'react';
import { categoriesModel } from '@/models/categoriesModel';
import { paymentMethodsModel } from '@/models/paymentMethodsModel';
import { transactionErrorMessage, transactionModel } from '@/models/transactionModel';
import type { Category, PaymentMethod, TransactionType } from '@/types/transaction';
import { todayIsoDate } from '@/utils/dates';

// fetch() rejeita com TypeError quando nao ha rede (mesmo criterio do authModel).
function loadErrorMessage(error: unknown): string {
  return error instanceof TypeError
    ? 'Sem conexão com a internet. Verifique e tente novamente.'
    : 'Não foi possível carregar os dados do formulário.';
}

type Params = {
  type: TransactionType;
  onClose: () => void;
  onSuccess?: () => void;
};

type TouchedFields = { amount?: boolean; category?: boolean };

/**
 * VIEWMODEL - estado e regras do TransactionModal.
 *
 * Um novo componente que usa este hook e montado a cada vez que o modal abre
 * (ver TransactionModal.tsx - o conteudo so existe na arvore quando
 * `visible`), entao o formulario sempre comeca limpo sem precisar de logica
 * de reset: o carregamento de categorias/metodos roda uma vez no mount.
 *
 * `type` vem do botao que abriu o modal ("Entrada"/"Saida" da tela): so as
 * categorias desse tipo aparecem, porque o back recusa com 422 uma categoria
 * de tipo diferente do da transacao.
 */
export function useTransactionModalViewModel({ type, onClose, onSuccess }: Params) {
  const [amount, setAmount] = useState(0);
  const [categoryId, setCategoryId] = useState<string | null>(null);
  const [paymentMethodId, setPaymentMethodId] = useState<string | null>(null);
  const [touched, setTouched] = useState<TouchedFields>({});

  const [allCategories, setAllCategories] = useState<Category[]>([]);
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const categories = useMemo(
    () => allCategories.filter((category) => category.type === type),
    [allCategories, type],
  );

  useEffect(() => {
    let cancelled = false;

    // allSettled (nao all): categorias e metodos de pagamento sao requisicoes
    // independentes - um Promise.all faria a falha de uma apagar a outra, que
    // nao tem nada a ver com isso (ex.: metodos de pagamento indisponivel nao
    // deveria impedir a escolha da categoria).
    Promise.allSettled([categoriesModel.listAvailable(), paymentMethodsModel.listAvailable()]).then(
      ([categoriesResult, paymentMethodsResult]) => {
        if (cancelled) return;

        if (categoriesResult.status === 'fulfilled') setAllCategories(categoriesResult.value);
        if (paymentMethodsResult.status === 'fulfilled')
          setPaymentMethods(paymentMethodsResult.value);

        const firstRejected = [categoriesResult, paymentMethodsResult].find(
          (result) => result.status === 'rejected',
        );
        if (firstRejected && firstRejected.status === 'rejected') {
          setLoadError(loadErrorMessage(firstRejected.reason));
        }

        setLoading(false);
      },
    );

    return () => {
      cancelled = true;
    };
  }, []);

  const selectedCategory = categories.find((category) => category.id === categoryId) ?? null;
  const amountValid = amount > 0;
  const canSubmit = amountValid && selectedCategory !== null && !submitting;

  const errors = useMemo(
    () => ({
      amount: touched.amount && !amountValid ? true : undefined,
      category: touched.category && !selectedCategory ? true : undefined,
    }),
    [touched, amountValid, selectedCategory],
  );

  const touchAmount = useCallback(() => setTouched((prev) => ({ ...prev, amount: true })), []);
  const touchCategory = useCallback(() => setTouched((prev) => ({ ...prev, category: true })), []);

  const submit = useCallback(async () => {
    setTouched({ amount: true, category: true });
    if (!amountValid || !selectedCategory || submitting) return;

    setSubmitting(true);
    setSubmitError(null);
    try {
      await transactionModel.create({
        categoryId: selectedCategory.id,
        paymentMethodId,
        type,
        amount,
        transactionDate: todayIsoDate(),
        isRecurring: false,
      });
      onSuccess?.();
      onClose();
    } catch (error) {
      setSubmitError(transactionErrorMessage(error));
    } finally {
      setSubmitting(false);
    }
  }, [
    amountValid,
    selectedCategory,
    submitting,
    paymentMethodId,
    type,
    amount,
    onSuccess,
    onClose,
  ]);

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
    submitError,
    touchAmount,
    touchCategory,
    submit,
  };
}
