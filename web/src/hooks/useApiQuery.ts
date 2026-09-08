import { useCallback, useEffect, useState } from 'react';
import { getErrorMessage } from '../utils/errors';

/**
 * Padroniza os estados de loading/erro/sucesso exigidos em toda a área do
 * aluno (carregando, vazio, erro, sucesso) sem repetir o mesmo boilerplate
 * de useEffect + useState em cada página.
 */
export function useApiQuery<T>(fetcher: () => Promise<T>, deps: unknown[] = []) {
  const [data, setData] = useState<T | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const reload = useCallback(() => {
    let cancelled = false;
    setIsLoading(true);
    setError(null);

    fetcher()
      .then((result) => {
        if (!cancelled) setData(result);
      })
      .catch((err) => {
        if (!cancelled) setError(getErrorMessage(err, 'Não foi possível carregar este conteúdo.'));
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false);
      });

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);

  useEffect(() => reload(), [reload]);

  return { data, error, isLoading, reload };
}
