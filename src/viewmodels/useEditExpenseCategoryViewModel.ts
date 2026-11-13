import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { HttpError } from '@/config/httpClient';
import { categoriesModel } from '@/models/categoriesModel';
import { transactionEvents } from '@/models/transactionEvents';
import { transactionModel } from '@/models/transactionModel';
import type { AnaliseMovement } from '@/types/analise';
import type { Category } from '@/types/transaction';

type Params = {
  movement: AnaliseMovement;
  onClose: () => void;
};

function saveErrorMessage(error: unknown): string {
  if (error instanceof HttpError) {
    if (error.status === 404)
      return 'Gasto ou categoria não encontrado. Atualize a lista e tente novamente.';
    if (error.status === 422) return 'Escolha uma categoria de saída disponível para este gasto.';
  }
  return error instanceof TypeError
    ? 'Sem conexão com a internet. Sua seleção foi mantida. Tente novamente.'
    : 'Não foi possível salvar a categoria. Tente novamente.';
}

/** Edita somente a categoria; os demais dados nunca entram no payload. */
export function useEditExpenseCategoryViewModel({ movement, onClose }: Params) {
  const [categories, setCategories] = useState<Category[]>([]);
  const [categoryId, setCategoryId] = useState(movement.categoryId);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const requestId = useRef(0);
  const saving = useRef(false);
  const active = useRef(true);

  const load = useCallback(() => {
    const id = ++requestId.current;
    return categoriesModel
      .listAvailable()
      .then((result) => {
        if (!active.current || id !== requestId.current) return;
        setCategories(result.filter((category) => category.type === 'EXPENSE'));
      })
      .catch(() => {
        if (!active.current || id !== requestId.current) return;
        setLoadError('Não foi possível carregar as categorias. Tente novamente.');
      })
      .finally(() => {
        if (active.current && id === requestId.current) setLoading(false);
      });
  }, []);

  const retry = useCallback(() => {
    setLoading(true);
    setLoadError(null);
    void load();
  }, [load]);

  useEffect(() => {
    active.current = true;
    void load();
    return () => {
      active.current = false;
      requestId.current += 1;
    };
  }, [load]);

  const selectedCategory = useMemo(
    () => categories.find((category) => category.id === categoryId),
    [categories, categoryId],
  );
  const canSave =
    movement.type === 'EXPENSE' &&
    !loading &&
    !loadError &&
    !!selectedCategory &&
    categoryId !== movement.categoryId &&
    !submitting;

  const close = useCallback(() => {
    if (!saving.current) onClose();
  }, [onClose]);

  const selectCategory = useCallback((id: string) => {
    if (saving.current) return;
    setCategoryId(id);
    setSubmitError(null);
  }, []);

  const save = useCallback(async () => {
    if (!canSave || saving.current) return;
    saving.current = true;
    setSubmitting(true);
    setSubmitError(null);
    try {
      await transactionModel.changeCategory(movement.id, { categoryId });
      transactionEvents.notifyChanged();
      if (active.current) onClose();
    } catch (error) {
      if (active.current) setSubmitError(saveErrorMessage(error));
    } finally {
      saving.current = false;
      if (active.current) setSubmitting(false);
    }
  }, [canSave, categoryId, movement.id, onClose]);

  return {
    categories,
    categoryId,
    selectedCategory,
    loading,
    loadError,
    submitting,
    submitError,
    canSave,
    selectCategory,
    save,
    close,
    retry,
  };
}
