import { useCallback, useEffect, useState } from 'react';
import { exampleModel } from '@/models/exampleModel';
import type { Example } from '@/types/example';

/**
 * VIEWMODEL - hook que orquestra estado e chama o Model.
 *
 * Estado da tela, loading, erro e a ordem das coisas moram aqui. A View observa
 * o que este hook expoe e re-renderiza sozinha - ela nao sabe que existe HTTP.
 *
 * TODO: implementar em tarefa futura - um viewmodel por tela real.
 */
export function useExampleViewModel() {
  const [examples, setExamples] = useState<Example[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchExamples = useCallback(() => {
    exampleModel
      .listAll()
      .then((data) => {
        setExamples(data);
        setError(null);
      })
      .catch(() => {
        setError('Nao foi possivel carregar os dados. A API esta rodando?');
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  const reload = useCallback(() => {
    setLoading(true);
    fetchExamples();
  }, [fetchExamples]);

  useEffect(fetchExamples, [fetchExamples]);

  return { examples, loading, error, reload };
}
