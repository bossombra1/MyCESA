import { useCallback, useState } from 'react';
import { useApiData } from './useApiData';

type CrudService = {
  getAll: () => Promise<{ data: unknown }>;
  create?: (data: any) => Promise<any>;
  update?: (id: any, data: any) => Promise<any>;
  delete?: (id: any) => Promise<any>;
};

/**
 * Pilote une page CRUD complète : liste + création + modification + suppression,
 * en s'appuyant sur les endpoints réels du backend.
 * Les boutons « Modifier » / « Supprimer » des pages deviennent fonctionnels ici.
 */
export function useCrud<T extends Record<string, any>>(service: CrudService) {
  const { data, loading, error, reload } = useApiData<T[]>(service.getAll, []);

  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState('');
  const [success, setSuccess] = useState('');

  const clearMessages = useCallback(() => {
    setFormError('');
    setSuccess('');
  }, []);

  const run = useCallback(async (action: () => Promise<any>, message: string) => {
    setSaving(true);
    setFormError('');
    setSuccess('');
    try {
      await action();
      await reload();
      setSuccess(message);
      return true;
    } catch (err: any) {
      setFormError(
        err?.response?.data?.error
        || err?.response?.data?.message
        || err?.message
        || 'Opération impossible'
      );
      return false;
    } finally {
      setSaving(false);
    }
  }, [reload]);

  const create = useCallback(
    (payload: Record<string, any>, message = 'Enregistrement créé.') => {
      if (!service.create) return Promise.resolve(false);
      return run(() => service.create!(payload), message);
    },
    [run, service],
  );

  const update = useCallback(
    (id: any, payload: Record<string, any>, message = 'Modifications enregistrées.') => {
      if (!service.update) return Promise.resolve(false);
      return run(() => service.update!(id, payload), message);
    },
    [run, service],
  );

  const remove = useCallback(
    (id: any, message = 'Suppression effectuée.') => {
      if (!service.delete) return Promise.resolve(false);
      return run(() => service.delete!(id), message);
    },
    [run, service],
  );

  /** Certaines routes attendent un corps (ex: DELETE /absences). */
  const removeWith = useCallback(
    (payload: any, message = 'Suppression effectuée.') => {
      if (!service.delete) return Promise.resolve(false);
      return run(() => service.delete!(payload), message);
    },
    [run, service],
  );

  return {
    rows: data,
    loading,
    error,
    reload,
    saving,
    formError,
    success,
    clearMessages,
    create,
    update,
    remove,
    removeWith,
  };
}