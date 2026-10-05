/** Estado de carga dos dados da Home (nome, saldo e gastos). */
export type HomeStatus = 'loading' | 'error' | 'success';

/** Gasto pronto para exibir: textos e valor ja formatados. */
export type HomeExpense = {
  id: string;
  title: string;
  categoryName: string | null;
  date: string;
  amount: string;
};
