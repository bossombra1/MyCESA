import { FormEvent, useState } from 'react';
import { Loader2, X } from 'lucide-react';

type Field = {
  name: string;
  label: string;
  type?: 'text' | 'number' | 'email' | 'date' | 'select';
  placeholder?: string;
  required?: boolean;
  disabled?: boolean;
  options?: Array<{ value: string; label: string }>;
  /** Texte de l'option vide quand aucune valeur n'est selectionnee. */
  defaultLabel?: string;
};

type CrudModalProps = {
  title: string;
  fields: Field[];
  initialValues?: Record<string, string>;
  error?: string;
  submitting?: boolean;
  onClose: () => void;
  onSubmit: (values: Record<string, string>) => Promise<void>;
};

export default function CrudModal({
  title,
  fields,
  initialValues = {},
  error = '',
  submitting = false,
  onClose,
  onSubmit,
}: CrudModalProps) {
  const [values, setValues] = useState<Record<string, string>>(initialValues);

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    await onSubmit(values);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4"
      role="presentation"
      onMouseDown={(event) => event.target === event.currentTarget && !submitting && onClose()}
    >
      <div className="w-full max-w-md rounded-xl bg-white shadow-2xl" role="dialog" aria-modal="true" aria-labelledby="crud-modal-title">
        <div className="flex items-center justify-between border-b border-gray-200 px-6 py-4">
          <h2 id="crud-modal-title" className="text-lg font-semibold text-gray-900">{title}</h2>
          <button type="button" onClick={onClose} disabled={submitting} aria-label="Fermer" className="rounded-lg p-2 text-gray-400 hover:bg-gray-100 disabled:opacity-50">
            <X className="h-5 w-5" />
          </button>
        </div>
        <form onSubmit={submit} className="space-y-5 p-6">
          {error && <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700" role="alert">{error}</div>}
          {fields.map((field) => (
            <label key={field.name} className="block text-sm font-medium text-gray-700">
              {field.label}
              {field.type === 'select' ? (
                <select
                  required={field.required}
                  disabled={field.disabled || submitting}
                  value={values[field.name] || ''}
                  onChange={(event) => setValues((current) => ({ ...current, [field.name]: event.target.value }))}
                  className="mt-1.5 w-full rounded-lg border border-gray-300 px-3 py-2.5 font-normal outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                >
                  <option value="">{field.defaultLabel || 'Sélectionner'}</option>
                  {(field.options || []).map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
                </select>
              ) : (
                <input
                  type={field.type || 'text'}
                  required={field.required}
                  disabled={field.disabled || submitting}
                  value={values[field.name] || ''}
                  placeholder={field.placeholder}
                  onChange={(event) => setValues((current) => ({ ...current, [field.name]: event.target.value }))}
                  className="mt-1.5 w-full rounded-lg border border-gray-300 px-3 py-2.5 font-normal outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                />
              )}
            </label>
          ))}
          <div className="flex justify-end gap-3 border-t border-gray-100 pt-4">
            <button type="button" onClick={onClose} disabled={submitting} className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50">Annuler</button>
            <button type="submit" disabled={submitting} className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-60">
              {submitting && <Loader2 className="h-4 w-4 animate-spin" />}
              {submitting ? 'Enregistrement...' : 'Enregistrer'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
