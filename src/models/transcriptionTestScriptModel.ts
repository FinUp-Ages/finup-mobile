import type { TestPhrase } from '@/types/speech';

/**
 * MODEL - roteiro de teste da POC de transcricao.
 *
 * A fonte de dado aqui e local e estatica: as frases curtas de movimentacao
 * financeira definidas no ticket da POC, escolhidas para exercitar valor, verbo
 * e estabelecimento. Nenhuma delas vira transacao — servem so para comparar o
 * que foi falado com o que foi transcrito.
 */
export const TEST_PHRASES: readonly TestPhrase[] = [
  { expected: 'Gastei 50 reais no mercado.', id: 'mercado' },
  { expected: 'Paguei 120 reais de gasolina.', id: 'gasolina' },
  { expected: 'Comprei um lanche por 28 reais.', id: 'lanche' },
  { expected: 'Recebi 500 reais de um freela.', id: 'freela' },
  { expected: 'Gastei 39 e 90 na farmácia.', id: 'farmacia' },
] as const;
