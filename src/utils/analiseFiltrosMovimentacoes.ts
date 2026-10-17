import type { AnaliseMovement, AnaliseSortOrder, AnaliseTypeFilter } from '@/types/analise';

export const ANALISE_SORT_OPTIONS: { key: AnaliseSortOrder; label: string }[] = [
  { key: 'NEWEST', label: 'Mais recentes' },
  { key: 'HIGHEST_AMOUNT', label: 'Maior para menor' },
  { key: 'LOWEST_AMOUNT', label: 'Menor para maior' },
];

function compareNewest(left: AnaliseMovement, right: AnaliseMovement) {
  return (
    right.transactionDate.localeCompare(left.transactionDate) ||
    right.createdAt.localeCompare(left.createdAt)
  );
}

/** Filtra por tipo e ordena sem alterar a lista recebida. */
export function filtrarEOrdenarMovimentacoes(
  movements: AnaliseMovement[],
  typeFilter: AnaliseTypeFilter,
  sortOrder: AnaliseSortOrder,
) {
  const filtered = movements.filter(
    (movement) => typeFilter === 'ALL' || movement.type === typeFilter,
  );

  return [...filtered].sort((left, right) => {
    if (sortOrder === 'NEWEST') return compareNewest(left, right);

    const amountComparison =
      sortOrder === 'HIGHEST_AMOUNT'
        ? right.amountValue - left.amountValue
        : left.amountValue - right.amountValue;
    return amountComparison || compareNewest(left, right);
  });
}
