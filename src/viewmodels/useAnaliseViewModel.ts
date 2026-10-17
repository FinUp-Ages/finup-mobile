import { useFocusEffect } from 'expo-router';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { HttpError } from '@/config/httpClient';
import { categoriesModel } from '@/models/categoriesModel';
import { transactionEvents } from '@/models/transactionEvents';
import { transactionModel } from '@/models/transactionModel';
import type {
  AnaliseCategoryExpense,
  AnaliseMovement,
  AnalisePeriodKey,
  AnaliseSortOrder,
  AnaliseStatus,
  AnaliseTypeFilter,
} from '@/types/analise';
import { analisePeriodRange, DEFAULT_ANALISE_PERIOD } from '@/utils/analisePeriods';
import { calcularGastosCategorias } from '@/utils/analiseGastosCategorias';
import { filtrarEOrdenarMovimentacoes } from '@/utils/analiseFiltrosMovimentacoes';
import { mapearMovimentacoes } from '@/utils/analiseMovimentacoes';
import { formatAmount } from '@/utils/masks';

type AnaliseData = {
  categoryExpenses: AnaliseCategoryExpense[];
  categoryTotal: string;
  movements: AnaliseMovement[];
};

async function fetchAnaliseData(periodKey: AnalisePeriodKey): Promise<AnaliseData> {
  const period = analisePeriodRange(periodKey);
  const [periodResponse, categories] = await Promise.all([
    transactionModel.list(period.from, period.to),
    categoriesModel.listAvailable(),
  ]);
  const categoriesSummary = calcularGastosCategorias(periodResponse.transactions, categories);

  return {
    categoryExpenses: categoriesSummary.expenses,
    categoryTotal: categoriesSummary.total,
    movements: mapearMovimentacoes(periodResponse.transactions, categories),
  };
}

/** Dados e filtros exclusivos da aba Análise. Tipo e ordenação não afetam categorias. */
export function useAnaliseViewModel() {
  const [status, setStatus] = useState<AnaliseStatus>('loading');
  const [data, setData] = useState<AnaliseData | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [periodKey, setPeriodKey] = useState<AnalisePeriodKey>(DEFAULT_ANALISE_PERIOD);
  const [typeFilter, setTypeFilter] = useState<AnaliseTypeFilter>('ALL');
  const [sortOrder, setSortOrder] = useState<AnaliseSortOrder>('NEWEST');
  const requestId = useRef(0);
  const loadedPeriod = useRef<AnalisePeriodKey | null>(null);

  const load = useCallback(async (mode: 'initial' | 'pull' | 'silent', key: AnalisePeriodKey) => {
    const id = ++requestId.current;
    if (mode === 'initial') setStatus('loading');
    if (mode === 'pull') setRefreshing(true);

    try {
      const next = await fetchAnaliseData(key);
      if (id !== requestId.current) return;
      loadedPeriod.current = key;
      setData(next);
      setStatus('success');
    } catch (error) {
      if (id !== requestId.current) return;
      if (error instanceof HttpError && error.status === 401) {
        setStatus('sessionExpired');
      } else if (mode === 'initial' || loadedPeriod.current !== key) {
        setStatus('error');
      }
    } finally {
      if (id === requestId.current) setRefreshing(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      load(loadedPeriod.current === periodKey ? 'silent' : 'initial', periodKey);
    }, [load, periodKey]),
  );

  useEffect(() => transactionEvents.subscribe(() => load('silent', periodKey)), [load, periodKey]);

  const movements = useMemo(
    () => filtrarEOrdenarMovimentacoes(data?.movements ?? [], typeFilter, sortOrder),
    [data?.movements, sortOrder, typeFilter],
  );

  return {
    categoryExpenses: data?.categoryExpenses ?? [],
    categoryTotal: data?.categoryTotal ?? formatAmount(0),
    movements,
    periodKey,
    periodLabel: analisePeriodRange(periodKey).label,
    refreshing,
    retry: () => load('initial', periodKey),
    refresh: () => load('pull', periodKey),
    setPeriodKey,
    setSortOrder,
    setTypeFilter,
    sortOrder,
    status,
    typeFilter,
  };
}
