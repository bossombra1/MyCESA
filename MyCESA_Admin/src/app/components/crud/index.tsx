import { ReactNode } from 'react';
import { AlertCircle, CheckCircle2, X } from 'lucide-react';

// ─────────────────────────────────────────────
// Composants partagés des pages d'administration.
// Choix volontaire : Tailwind brut, comme le reste de MyCESA_Admin.
// ────────────────────────────────────────────

export function PageHeader({ title, subtitle, children }: {
  title: string;
  subtitle?: string;
  children?: ReactNode;
}) {
  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">{title}</h1>
        {subtitle && <p className="mt-2 text-gray-600">{subtitle}</p>}
      </div>
      {children && <div className="flex flex-wrap gap-2">{children}</div>}
    </div>
  );
}

export function StatCard({ label, value, icon: Icon, color = 'text-blue-600' }: {
  label: string;
  value: ReactNode;
  icon?: any;
  color?: string;
}) {
  return (
    <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600">{label}</p>
          <p className={`mt-1 text-2xl font-bold ${color}`}>{value}</p>
        </div>
        {Icon && <Icon className={`h-8 w-8 ${color}`} />}
      </div>
    </div>
  );
}

export function Notice({ kind = 'error', children }: {
  kind?: 'error' | 'success' | 'info';
  children: ReactNode;
}) {
  if (!children) return null;
  const styles = {
    error: 'border-red-200 bg-red-50 text-red-700',
    success: 'border-emerald-200 bg-emerald-50 text-emerald-700',
    info: 'border-blue-200 bg-blue-50 text-blue-700',
  }[kind];
  const Icon = kind === 'success' ? CheckCircle2 : AlertCircle;

  return (
    <p className={`flex items-center gap-2 rounded-lg border p-3 text-sm font-medium ${styles}`}>
      <Icon className="h-4 w-4 shrink-0" />
      <span>{children}</span>
    </p>
  );
}

export function EmptyState({ icon: Icon, title, hint }: { icon?: any; title: string; hint?: string }) {
  return (
    <div className="rounded-lg border border-gray-200 bg-white py-12 text-center">
      {Icon && <Icon className="mx-auto h-12 w-12 text-gray-400" />}
      <h3 className="mt-2 text-sm font-medium text-gray-900">{title}</h3>
      {hint && <p className="mt-1 text-sm text-gray-500">{hint}</p>}
    </div>
  );
}

export function Modal({ open, title, onClose, children, footer, wide = false }: {
  open: boolean;
  title: string;
  onClose: () => void;
  children: ReactNode;
  footer?: ReactNode;
  wide?: boolean;
}) {
  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4"
      role="dialog"
      aria-modal="true"
      onClick={onClose}
    >
      <div
        className={`flex max-h-[92vh] w-full flex-col overflow-hidden rounded-xl bg-white shadow-2xl ${wide ? 'max-w-3xl' : 'max-w-xl'}`}
        onClick={(event) => event.stopPropagation()}
      >
        <div className="flex items-center justify-between gap-3 border-b border-gray-200 px-5 py-4">
          <h2 className="truncate font-semibold text-gray-900">{title}</h2>
          <button
            type="button"
            onClick={onClose}
            title="Fermer"
            className="rounded-lg p-2 text-gray-500 transition hover:bg-gray-100"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="overflow-y-auto px-5 py-4">{children}</div>

        {footer && (
          <div className="flex justify-end gap-2 border-t border-gray-200 px-5 py-4">{footer}</div>
        )}
      </div>
    </div>
  );
}

export function Spinner({ label = 'Chargement…' }: { label?: string }) {
  return <p className="py-8 text-center text-sm text-gray-500">{label}</p>;
}

type FieldProps = {
  label: string;
  value: any;
  onChange: (value: any) => void;
  type?: string;
  required?: boolean;
  placeholder?: string;
  options?: { value: any; label: string }[];
  as?: 'input' | 'select' | 'textarea' | 'checkbox';
  help?: string;
  disabled?: boolean;
  step?: string;
};

export function Field({
  label, value, onChange, type = 'text', required, placeholder, options,
  as = 'input', help, disabled, step,
}: FieldProps) {
  const base = 'mt-1 w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100 disabled:bg-gray-100';

  return (
    <label className="block text-sm font-semibold text-gray-700">
      {label}{required && <span className="text-red-500"> *</span>}

      {as === 'select' ? (
        <select
          className={base}
          value={value ?? ''}
          required={required}
          disabled={disabled}
          onChange={(event) => onChange(event.target.value)}
        >
          <option value="">— Sélectionner —</option>
          {(options || []).map((option) => (
            <option key={String(option.value)} value={String(option.value)}>{option.label}</option>
          ))}
        </select>
      ) : as === 'textarea' ? (
        <textarea
          className={`${base} min-h-[90px]`}
          value={value ?? ''}
          required={required}
          disabled={disabled}
          placeholder={placeholder}
          onChange={(event) => onChange(event.target.value)}
        />
      ) : as === 'checkbox' ? (
        <span className="mt-2 flex items-center gap-2">
          <input
            type="checkbox"
            className="h-4 w-4 rounded border-gray-300 text-blue-600"
            checked={!!value}
            disabled={disabled}
            onChange={(event) => onChange(event.target.checked)}
          />
          <span className="text-sm font-normal text-gray-700">{placeholder}</span>
        </span>
      ) : (
        <input
          className={base}
          type={type}
          step={step}
          value={value ?? ''}
          required={required}
          disabled={disabled}
          placeholder={placeholder}
          onChange={(event) => onChange(event.target.value)}
        />
      )}

      {help && <span className="mt-1 block text-xs font-normal text-gray-500">{help}</span>}
    </label>
  );
}

export function PrimaryButton({ children, onClick, type = 'button', disabled }: {
  children: ReactNode;
  onClick?: () => void;
  type?: 'button' | 'submit';
  disabled?: boolean;
}) {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 font-medium text-white shadow-sm transition-colors hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
    >
      {children}
    </button>
  );
}

export function GhostButton({ children, onClick, type = 'button', disabled }: {
  children: ReactNode;
  onClick?: () => void;
  type?: 'button' | 'submit';
  disabled?: boolean;
}) {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className="inline-flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2 font-medium text-gray-700 shadow-sm transition-colors hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-60"
    >
      {children}
    </button>
  );
}

export function IconButton({ children, onClick, title, tone = 'blue', disabled }: {
  children: ReactNode;
  onClick?: () => void;
  title: string;
  tone?: 'blue' | 'red' | 'slate';
  disabled?: boolean;
}) {
  const tones = {
    blue: 'text-blue-600 hover:bg-blue-50',
    red: 'text-red-600 hover:bg-red-50',
    slate: 'text-gray-600 hover:bg-gray-100',
  }[tone];

  return (
    <button
      type="button"
      title={title}
      onClick={onClick}
      disabled={disabled}
      className={`rounded-lg p-2 transition-colors disabled:opacity-50 ${tones}`}
    >
      {children}
    </button>
  );
}

/** Formatage monétaire FCFA (XOF) utilisé par les paiements. */
export const formatFcfa = (montant: any) =>
  `${new Intl.NumberFormat('fr-FR').format(Number(montant) || 0)} FCFA`;

/** Formatage de date sûr : les colonnes DATETIME du backend peuvent être nulles. */
export const formatDate = (valeur: any) => {
  if (!valeur) return '—';
  const date = new Date(valeur);
  return Number.isNaN(date.getTime()) ? '—' : date.toLocaleDateString('fr-FR');
};

export const formatDateHeure = (valeur: any) => {
  if (!valeur) return '—';
  const date = new Date(valeur);
  return Number.isNaN(date.getTime())
    ? '—'
    : date.toLocaleString('fr-FR', { dateStyle: 'medium', timeStyle: 'short' });
};

/** Convertit un DATETIME MySQL en valeur pour <input type="datetime-local">. */
export const toDatetimeLocal = (valeur: any) => {
  if (!valeur) return '';
  const date = new Date(valeur);
  if (Number.isNaN(date.getTime())) return '';
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
};

/** Le backend renvoie les TIME MySQL sous la forme "08:30:00". */
export const heureCourte = (valeur: any) =>
  valeur ? String(valeur).slice(0, 5) : '—';