import { useEffect, useMemo, useRef, useState } from 'react';
import {
  AlertCircle, Check, ChevronLeft, ChevronRight, GraduationCap, Loader2, Phone, Sparkles, User, X,
} from 'lucide-react';

export type EtudiantFormValues = {
  matricule: string;
  nom: string;
  prenoms: string;
  genre: string;
  dateNaissance: string;
  lieuNaissance: string;
  quartier: string;
  email: string;
  telephone: string;
  classeId: string;
  filiereId: string;
};

type Props = {
  mode: 'create' | 'edit';
  etudiant?: any;
  classes: any[];
  filieres: any[];
  nextMatricule?: string;
  takenMatricules?: string[];
  submitting?: boolean;
  error?: string;
  onClose: () => void;
  onSubmit: (values: EtudiantFormValues) => void | Promise<void>;
};

type Step = { label: string; hint: string; icon: typeof User; fields: Array<keyof EtudiantFormValues> };

const EMPTY: EtudiantFormValues = {
  matricule: '', nom: '', prenoms: '', genre: '', dateNaissance: '', lieuNaissance: '',
  quartier: '', email: '', telephone: '', classeId: '', filiereId: '',
};

const STEPS: Step[] = [
  { label: 'Identite', hint: "Qui est l'etudiant ?", icon: User, fields: ['nom', 'prenoms', 'genre', 'dateNaissance', 'lieuNaissance'] },
  { label: 'Scolarite', hint: 'Matricule et affectation', icon: GraduationCap, fields: ['matricule', 'filiereId', 'classeId'] },
  { label: 'Contact', hint: 'Comment le joindre ?', icon: Phone, fields: ['email', 'telephone', 'quartier'] },
];

const formatPhone = (raw: string) => raw.replace(/\D/g, '').slice(0, 10).replace(/(\d{2})(?=\d)/g, '$1 ').trim();

function Field({ name, label, required, hint, error, children }: { name: string; label: string; required?: boolean; hint?: string; error?: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <label htmlFor={name} className="flex items-center gap-1 text-sm font-medium text-gray-700">
        {label}{required && <span className="text-red-500">*</span>}
      </label>
      {children}
      {error ? <p id={`${name}-error`} className="flex items-start gap-1.5 text-xs font-medium text-red-600"><AlertCircle className="mt-px h-3.5 w-3.5 shrink-0" />{error}</p> : hint ? <p className="text-xs text-gray-500">{hint}</p> : null}
    </div>
  );
}

export default function EtudiantFormModal({ mode, etudiant, classes, filieres, nextMatricule, takenMatricules = [], submitting = false, error = '', onClose, onSubmit }: Props) {
  const [step, setStep] = useState(0);
  const [values, setValues] = useState<EtudiantFormValues>(() => ({
    ...EMPTY,
    matricule: etudiant?.matricule || (mode === 'create' ? nextMatricule || '' : ''),
    nom: etudiant?.nom || '', prenoms: etudiant?.prenoms || '', genre: etudiant?.genre || '',
    dateNaissance: etudiant?.dateNaissance ? String(etudiant.dateNaissance).slice(0, 10) : '',
    lieuNaissance: etudiant?.lieuNaissance || '', quartier: etudiant?.quartier || '',
    email: etudiant?.email || '', telephone: etudiant?.telephone ? formatPhone(String(etudiant.telephone)) : '',
    classeId: String(etudiant?.classeId || ''), filiereId: String(etudiant?.filiereId || ''),
  }));
  const [errors, setErrors] = useState<Partial<Record<keyof EtudiantFormValues, string>>>({});
  const [touched, setTouched] = useState<Partial<Record<keyof EtudiantFormValues, boolean>>>({});
  const initialRef = useRef(values);
  const bodyRef = useRef<HTMLDivElement>(null);
  const closeRef = useRef<() => void>(() => {});
  const dirty = JSON.stringify(values) !== JSON.stringify(initialRef.current);

  const validateField = (name: keyof EtudiantFormValues, raw: string) => {
    const value = (raw || '').trim();
    if (name === 'matricule') {
      if (!value) return 'Le matricule est obligatoire.';
      if (value.length < 4) return 'Au moins 4 caracteres.';
      const same = etudiant?.matricule && value.toUpperCase() === String(etudiant.matricule).toUpperCase();
      if (!same && takenMatricules.some((m) => String(m).toUpperCase() === value.toUpperCase())) return 'Ce matricule est deja attribue.';
    }
    if (name === 'nom' && !value) return 'Le nom est obligatoire.';
    if (name === 'prenoms' && !value) return 'Les prenoms sont obligatoires.';
    if (name === 'genre' && !value) return 'Selectionnez le genre.';
    if (name === 'email') {
      if (!value) return "L'email est obligatoire.";
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) return 'Format email invalide.';
    }
    if (name === 'telephone' && value) {
      const digits = value.replace(/\D/g, '');
      if (digits.length < 8 || digits.length > 10) return 'Numero invalide (8 a 10 chiffres).';
    }
    if (name === 'dateNaissance' && value) {
      const date = new Date(value);
      if (Number.isNaN(date.getTime())) return 'Date invalide.';
      if (date > new Date()) return 'La date ne peut pas etre dans le futur.';
    }
    if (name === 'filiereId' && !value) return 'La filiere est obligatoire.';
    if (name === 'classeId' && !value) return 'La classe est obligatoire.';
    return '';
  };

  const classesFiltrees = useMemo(() => {
    if (!values.filiereId) return classes;
    const hasLink = classes.some((c) => c.filiereId != null || c.filiere_id != null);
    return hasLink ? classes.filter((c) => String(c.filiereId ?? c.filiere_id) === values.filiereId) : classes;
  }, [classes, values.filiereId]);

  const setValue = (name: keyof EtudiantFormValues, value: string) => {
    setValues((current) => {
      const next = { ...current, [name]: value };
      if (name === 'filiereId' && current.classeId) {
        const classe = classes.find((c) => String(c.id) === current.classeId);
        const linked = classe?.filiereId ?? classe?.filiere_id;
        if (linked != null && String(linked) !== value) next.classeId = '';
      }
      return next;
    });
    if (touched[name] || errors[name]) setErrors((current) => ({ ...current, [name]: validateField(name, value) }));
  };

  const validateStep = (index: number) => {
    const next: Partial<Record<keyof EtudiantFormValues, string>> = {};
    STEPS[index].fields.forEach((field) => { next[field] = validateField(field, values[field]); });
    setErrors((current) => ({ ...current, ...next }));
    setTouched((current) => ({ ...current, ...Object.fromEntries(STEPS[index].fields.map((field) => [field, true])) }));
    return STEPS[index].fields.every((field) => !next[field]);
  };

  const handleSubmit = async () => {
    for (let index = 0; index < STEPS.length; index += 1) {
      if (!validateStep(index)) { setStep(index); return; }
    }
    await onSubmit(values);
  };

  closeRef.current = () => {
    if (submitting) return;
    if (dirty && !window.confirm('Les informations saisies seront perdues. Fermer quand meme ?')) return;
    onClose();
  };

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => { if (event.key === 'Escape') closeRef.current(); };
    document.addEventListener('keydown', onKey);
    const previous = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => { document.removeEventListener('keydown', onKey); document.body.style.overflow = previous; };
  }, []);

  useEffect(() => { bodyRef.current?.querySelector<HTMLElement>('input:not([disabled]), select:not([disabled])')?.focus(); }, [step]);

  const inputClass = (name: keyof EtudiantFormValues) => `w-full rounded-lg border px-3.5 py-2.5 text-sm text-gray-900 outline-none focus:ring-2 ${touched[name] && errors[name] ? 'border-red-400 bg-red-50/40 focus:border-red-500 focus:ring-red-100' : 'border-gray-300 bg-white focus:border-blue-500 focus:ring-blue-100'}`;
  const initiales = `${values.nom.charAt(0)}${values.prenoms.charAt(0)}`.toUpperCase() || '??';
  const filiereLabel = filieres.find((f) => String(f.id) === values.filiereId)?.nom || '—';
  const classeLabel = classes.find((c) => String(c.id) === values.classeId)?.nom || '—';
  const StepIcon = STEPS[step].icon;

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-gray-900/60 p-0 backdrop-blur-sm sm:items-center sm:p-4" onMouseDown={(event) => event.target === event.currentTarget && closeRef.current()}>
      <div role="dialog" aria-modal="true" aria-labelledby="etudiant-modal-title" className="flex max-h-[95vh] w-full flex-col overflow-hidden rounded-t-2xl bg-white shadow-2xl sm:max-h-[90vh] sm:max-w-2xl sm:rounded-2xl">
        <div className="flex items-start gap-4 border-b border-gray-200 px-5 py-4 sm:px-6">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-blue-600 font-semibold text-white">{initiales}</div>
          <div className="min-w-0 flex-1"><h2 id="etudiant-modal-title" className="truncate text-lg font-bold text-gray-900">{mode === 'edit' ? "Modifier l'etudiant" : 'Nouvel etudiant'}</h2><p className="truncate text-sm text-gray-500">{values.nom || values.prenoms ? `${values.nom} ${values.prenoms}`.trim() : 'Renseignez les informations étape par étape'}</p></div>
          <button type="button" onClick={() => closeRef.current()} aria-label="Fermer" className="rounded-lg p-2 text-gray-400 hover:bg-gray-100"><X className="h-5 w-5" /></button>
        </div>
        <div className="border-b border-gray-200 bg-gray-50 px-5 pt-4 sm:px-6"><div className="flex items-center gap-2">{STEPS.map((item, index) => <button key={item.label} type="button" onClick={() => { if (index < step || validateStep(step)) setStep(index); }} className="group flex flex-1 items-center gap-2 text-left"><span className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-semibold ${index === step ? 'bg-blue-600 text-white' : index < step ? 'bg-green-100 text-green-700' : 'bg-gray-200 text-gray-500'}`}>{index < step ? <Check className="h-4 w-4" /> : index + 1}</span><span className="hidden truncate text-sm font-medium text-gray-500 sm:block">{item.label}</span></button>)}</div><div className="mt-3 h-1 w-full overflow-hidden rounded-full bg-gray-200"><div className="h-full rounded-full bg-blue-600 transition-all" style={{ width: `${((step + 1) / STEPS.length) * 100}%` }} /></div><p className="py-2 text-xs text-gray-500 sm:hidden">Étape {step + 1}/{STEPS.length} — {STEPS[step].label}</p></div>
        <div ref={bodyRef} className="flex-1 overflow-y-auto px-5 py-5 sm:px-6">
          <div className="mb-5 flex items-center gap-2 text-sm text-gray-600"><StepIcon className="h-4 w-4 text-blue-600" />{STEPS[step].hint}</div>
          {error && <div role="alert" className="mb-5 flex items-start gap-2 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"><AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />{error}</div>}
          {step === 0 && <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Field name="nom" label="Nom" required error={touched.nom ? errors.nom : ''}><input id="nom" value={values.nom} onChange={(event) => setValue('nom', event.target.value.toUpperCase())} onBlur={() => { setTouched((c) => ({ ...c, nom: true })); setErrors((c) => ({ ...c, nom: validateField('nom', values.nom) })); }} className={inputClass('nom')} /></Field>
            <Field name="prenoms" label="Prénoms" required error={touched.prenoms ? errors.prenoms : ''}><input id="prenoms" value={values.prenoms} onChange={(event) => setValue('prenoms', event.target.value)} onBlur={() => { setTouched((c) => ({ ...c, prenoms: true })); setErrors((c) => ({ ...c, prenoms: validateField('prenoms', values.prenoms) })); }} className={inputClass('prenoms')} /></Field>
            <div className="sm:col-span-2"><Field name="genre" label="Genre" required error={touched.genre ? errors.genre : ''}><div className="flex gap-3">{['Masculin', 'Feminin'].map((genre) => <button key={genre} type="button" onClick={() => { setValue('genre', genre); setTouched((c) => ({ ...c, genre: true })); }} className={`flex-1 rounded-lg border px-4 py-2.5 text-sm font-medium ${values.genre === genre ? 'border-blue-600 bg-blue-50 text-blue-700' : 'border-gray-300 text-gray-600'}`}>{genre === 'Feminin' ? 'Féminin' : 'Masculin'}</button>)}</div></Field></div>
            <Field name="dateNaissance" label="Date de naissance" hint="Facultatif" error={touched.dateNaissance ? errors.dateNaissance : ''}><input id="dateNaissance" type="date" max={new Date().toISOString().slice(0, 10)} value={values.dateNaissance} onChange={(event) => setValue('dateNaissance', event.target.value)} className={inputClass('dateNaissance')} /></Field>
            <Field name="lieuNaissance" label="Lieu de naissance" hint="Facultatif"><input id="lieuNaissance" value={values.lieuNaissance} onChange={(event) => setValue('lieuNaissance', event.target.value)} className={inputClass('lieuNaissance')} /></Field>
          </div>}
          {step === 1 && <div className="grid grid-cols-1 gap-4">
            <Field name="matricule" label="Matricule" required hint={mode === 'edit' ? 'Le matricule ne peut pas être modifié.' : 'Généré automatiquement, modifiable.'} error={touched.matricule ? errors.matricule : ''}><div className="flex gap-2"><input id="matricule" value={values.matricule} disabled={mode === 'edit'} onChange={(event) => setValue('matricule', event.target.value.toUpperCase())} className={`${inputClass('matricule')} font-mono disabled:bg-gray-100`} />{mode === 'create' && nextMatricule && <button type="button" onClick={() => setValue('matricule', nextMatricule)} className="inline-flex items-center gap-1 rounded-lg border border-gray-300 px-3 text-sm"><Sparkles className="h-4 w-4" />Générer</button>}</div></Field>
            <Field name="filiereId" label="Filière" required error={touched.filiereId ? errors.filiereId : ''}><select id="filiereId" value={values.filiereId} onChange={(event) => setValue('filiereId', event.target.value)} className={inputClass('filiereId')}><option value="">Sélectionner une filière</option>{filieres.map((filiere) => <option key={filiere.id} value={String(filiere.id)}>{filiere.nom}</option>)}</select></Field>
            <Field name="classeId" label="Classe" required hint={!values.filiereId ? 'Choisissez d’abord une filière.' : `${classesFiltrees.length} classe(s) disponible(s).`} error={touched.classeId ? errors.classeId : ''}><select id="classeId" value={values.classeId} disabled={!values.filiereId} onChange={(event) => setValue('classeId', event.target.value)} className={`${inputClass('classeId')} disabled:bg-gray-100`}><option value="">Sélectionner une classe</option>{classesFiltrees.map((classe) => <option key={classe.id} value={String(classe.id)}>{classe.nom}</option>)}</select></Field>
          </div>}
          {step === 2 && <div className="space-y-4"><div className="grid grid-cols-1 gap-4 sm:grid-cols-2"><Field name="email" label="Email" required error={touched.email ? errors.email : ''}><input id="email" type="email" value={values.email} onChange={(event) => setValue('email', event.target.value.toLowerCase())} className={inputClass('email')} /></Field><Field name="telephone" label="Téléphone" hint="Facultatif" error={touched.telephone ? errors.telephone : ''}><input id="telephone" type="tel" value={values.telephone} onChange={(event) => setValue('telephone', formatPhone(event.target.value))} className={inputClass('telephone')} /></Field></div><Field name="quartier" label="Quartier" hint="Facultatif"><input id="quartier" value={values.quartier} onChange={(event) => setValue('quartier', event.target.value)} className={inputClass('quartier')} /></Field><div className="rounded-xl border border-gray-200 bg-gray-50 p-4"><p className="mb-3 text-xs font-semibold uppercase tracking-wider text-gray-500">Récapitulatif</p><dl className="grid gap-2 text-sm sm:grid-cols-2"><div><dt className="text-gray-500">Nom complet</dt><dd className="font-medium">{`${values.nom} ${values.prenoms}`.trim() || '—'}</dd></div><div><dt className="text-gray-500">Matricule</dt><dd className="font-medium">{values.matricule || '—'}</dd></div><div><dt className="text-gray-500">Filière</dt><dd className="font-medium">{filiereLabel}</dd></div><div><dt className="text-gray-500">Classe</dt><dd className="font-medium">{classeLabel}</dd></div></dl></div></div>}
        </div>
        <div className="flex items-center justify-between gap-3 border-t border-gray-200 bg-white px-5 py-4 sm:px-6"><button type="button" onClick={() => step === 0 ? closeRef.current() : setStep((current) => current - 1)} disabled={submitting} className="inline-flex items-center gap-1.5 rounded-lg px-4 py-2.5 text-sm font-medium text-gray-600 hover:bg-gray-100">{step === 0 ? 'Annuler' : <><ChevronLeft className="h-4 w-4" />Retour</>}</button>{step < STEPS.length - 1 ? <button type="button" onClick={() => validateStep(step) && setStep((current) => current + 1)} className="inline-flex items-center gap-1.5 rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white">Suivant<ChevronRight className="h-4 w-4" /></button> : <button type="button" onClick={handleSubmit} disabled={submitting} className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white disabled:opacity-70">{submitting ? <><Loader2 className="h-4 w-4 animate-spin" />Enregistrement...</> : <><Check className="h-4 w-4" />{mode === 'edit' ? 'Mettre à jour' : 'Enregistrer'}</>}</button>}</div>
      </div>
    </div>
  );
}
