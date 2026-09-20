import { useCallback, useEffect, useRef, useState } from 'react';

type ApiEnvelope<T> = {
  data?: T;
  value?: T;
  items?: T;
  results?: T;
};

/**
 * Le backend Node renvoie selon les routes :
 *   - un tableau nu         (ex: GET /etudiants)
 *   - un objet { value: [] } (Laravel-like)
 *   - un objet métier       (ex: GET /emplois-du-temps?classe_id=1 -> {actif, historique})
 * On ne fabrique JAMAIS de champs : les colonnes utilisées sont celles de la base.
 */
export const unwrapApiData = <T,>(payload: unknown): T => {
  if (Array.isArray(payload)) return payload as T;

  if (payload && typeof payload === 'object') {
    const envelope = payload as ApiEnvelope<T> & Record<string, unknown>;
    for (const key of ['data', 'value', 'items', 'results'] as const) {
      if (Array.isArray(envelope[key])) return envelope[key] as T;
    }
    if ('data' in envelope) return envelope.data as T;
  }

  return payload as T;
};

export function useApiData<T = unknown>(
  request: () => Promise<{ data: unknown }>,
  fallback: T
) {
  // Stabilisation : les fonctions/flèches inline passées par les pages ne
  // doivent pas relancer la requête à chaque render.
  const requestRef = useRef(request);
  const fallbackRef = useRef(fallback);
  requestRef.current = request;
  fallbackRef.current = fallback;

  const [data, setData] = useState<T>(fallback);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const response = await requestRef.current();
      const unwrapped = unwrapApiData<T>(response?.data);
      setData((unwrapped ?? fallbackRef.current) as T);
    } catch (err: any) {
      setData(fallbackRef.current);
      setError(
        err?.response?.data?.error
        || err?.response?.data?.message
        || err?.message
        || 'Chargement impossible'
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  return { data, loading, error, reload: load, setData };
}
