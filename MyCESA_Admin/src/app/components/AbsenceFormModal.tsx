import { useEffect, useMemo, useRef, useState } from 'react';
import {
  X, Search, Check, AlertCircle, Loader2, CalendarDays,
} from 'lucide-react';

export type AbsenceFormValues = {
  etudiantIds: string[];
  date: string;
  heures: string;
  justifiee: 'true' | 'false';
};

type Props = {
  etudiants: any[];
  filieres: any[];
  classes: any[];
  submitting?: boolean;
  error?: string;
  onClose: () => void;
  onSubmit: (values: AbsenceFormValues) => void | Promise<void>;
};

const todayISO = () => new Date().toISOString().slice(0, 10);
const yesterdayISO = () => { const d = new Date(); d.setDate(d.getDate() - 1); return d.toISOString().slice(0, 10); };
const initiales = (nom = '', prenoms = '') => `${nom.charAt(0)}${prenoms.charAt(0)}`.toUpperCase();

export default function AbsenceFormModal({ etudiants, filieres, classes, submitting = false, error = '', onClose, onSubmit }: Props) {
  const [filiereId, setFiliereId] = useState('');
  const [classeId, setClasseId] = useState('');
  const [selection, setSelection] = useState<Set<string>>(new Set());
  const [recherche, setRecherche] = useState('');
  const [date, setDate] = useState(todayISO());
  const [heures, setHeures] = useState('1');
  const [justifiee, setJustifiee] = useState<'true' | 'false'>('false');
  const [erreurs, setErreurs] = useState<{ etudiant?: string; date?: string; heures?: string }>({});

  const closeRef = useRef(onClose);
  closeRef.current = onClose;
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape' && !submitting) closeRef.current(); };
    document.addEventListener('keydown', onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => { document.removeEventListener('keydown', onKey); document.body.style.overflow = prev; };
  }, [submitting]);

  const lienClasseFiliere = classes.some((c) => c.filiereId != null || c.filiere_id != null);
  const classesFiltrees = useMemo(
    () => (!filiereId || !lienClasseFiliere ? classes : classes.filter((c) => String(c.filiereId ?? c.filiere_id) === filiereId)),
    [classes, filiereId, lienClasseFiliere],
  );

  const etudiantsDeLaClasse = useMemo(
    () => (!classeId ? [] : etudiants.filter((e) => String(e.classeId) === classeId)),
    [etudiants, classeId],
  );

  const q = recherche.trim().toLowerCase();
  const etudiantsAffiches = useMemo(
    () => etudiantsDeLaClasse.filter((e) => !q || [e.nom, e.prenoms, e.matricule].some((v) => String(v || '').toLowerCase().includes(q))),
    [etudiantsDeLaClasse, q],
  );

  // Choisir une autre filière/classe ne vide plus la sélection : on peut composer
  // un groupe d'étudiants venant de classes différentes pour un même signalement.
  const choisirFiliere = (value: string) => { setFiliereId(value); setClasseId(''); setRecherche(''); };
  const choisirClasse = (value: string) => { setClasseId(value); setRecherche(''); };

  const toggleSelection = (id: string) => {
    setSelection((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  };

  const tousVisiblesSelectionnes = etudiantsAffiches.length > 0 && etudiantsAffiches.every((e) => selection.has(String(e.id)));
  const toggleSelectAllVisible = () => {
    setSelection((prev) => {
      const next = new Set(prev);
      if (tousVisiblesSelectionnes) etudiantsAffiches.forEach((e) => next.delete(String(e.id)));
      else etudiantsAffiches.forEach((e) => next.add(String(e.id)));
      return next;
    });
  };

  const valider = () => {
    const next: typeof erreurs = {};
    if (selection.size === 0) next.etudiant = 'Sélectionnez au moins un étudiant.';
    if (!date) next.date = 'La date est obligatoire.';
    else if (date > todayISO()) next.date = 'La date ne peut pas être dans le futur.';
    const h = Number(heures);
    if (!heures || !Number.isFinite(h) || h <= 0) next.heures = 'Indiquez un nombre d’heures valide.';
    setErreurs(next);
    return Object.keys(next).length === 0;
  };

  const handleSubmit = async () => {
    if (!valider()) return;
    await onSubmit({ etudiantIds: Array.from(selection), date, heures, justifiee });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-gray-900/60 backdrop-blur-sm sm:items-center sm:p-4"
      onMouseDown={(e) => { if (e.target === e.currentTarget && !submitting) onClose(); }}>
      <div role="dialog" aria-modal="true" aria-labelledby="absence-modal-titre"
        className="flex max-h-[95vh] w-full flex-col overflow-hidden rounded-t-2xl bg-white shadow-2xl sm:max-h-[90vh] sm:max-w-xl sm:rounded-2xl">

        <div className="flex items-center justify-between border-b border-gray-200 px-5 py-4 sm:px-6">
          <div>
            <h2 id="absence-modal-titre" className="text-lg font-bold text-gray-900">Signaler une absence</h2>
            <p className="text-sm text-gray-500">Filtrez par filière puis par classe pour retrouver le ou les étudiants</p>
          </div>
          <button type="button" onClick={onClose} aria-label="Fermer" disabled={submitting}
            className="rounded-lg p-2 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600 disabled:opacity-50">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="flex-1 space-y-5 overflow-y-auto px-5 py-5 sm:px-6">
          {error && (
            <div role="alert" className="flex items-start gap-2 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" /><span>{error}</span>
            </div>
          )}

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-gray-700">Filière</label>
              <select value={filiereId} onChange={(e) => choisirFiliere(e.target.value)}
                className="w-full rounded-lg border border-gray-300 px-3.5 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100">
                <option value="">Toutes les filières</option>
                {filieres.map((f) => <option key={f.id} value={String(f.id)}>{f.nom}</option>)}
              </select>
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-gray-700">Classe</label>
              <select value={classeId} onChange={(e) => choisirClasse(e.target.value)}
                className="w-full rounded-lg border border-gray-300 px-3.5 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100">
                <option value="">Sélectionner une classe…</option>
                {classesFiltrees.map((c) => <option key={c.id} value={String(c.id)}>{c.nom}</option>)}
              </select>
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium text-gray-700">Étudiant(s) <span className="text-red-500">*</span></label>
              {selection.size > 0 && <span className="text-xs font-medium text-blue-700">{selection.size} sélectionné(s)</span>}
            </div>

            {selection.size > 0 && (
              <div className="flex flex-wrap gap-1.5">
                {Array.from(selection).map((id) => {
                  const e = etudiants.find((et) => String(et.id) === id);
                  if (!e) return null;
                  return (
                    <span key={id} className="inline-flex items-center gap-1 rounded-full bg-blue-100 py-1 pl-2.5 pr-1.5 text-xs font-medium text-blue-800">
                      {e.nom} {e.prenoms}
                      <button type="button" onClick={() => toggleSelection(id)} aria-label={`Retirer ${e.nom}`}
                        className="rounded-full p-0.5 transition-colors hover:bg-blue-200">
                        <X className="h-3 w-3" />
                      </button>
                    </span>
                  );
                })}
                <button type="button" onClick={() => setSelection(new Set())}
                  className="text-xs font-medium text-gray-500 underline hover:text-gray-700">
                  Tout retirer
                </button>
              </div>
            )}

            {!classeId ? (
              <div className="rounded-xl border border-dashed border-gray-300 p-4 text-center text-sm text-gray-500">
                Choisissez une classe pour afficher ses étudiants à sélectionner.
              </div>
            ) : (
              <div className="overflow-hidden rounded-xl border border-gray-200">
                <div className="flex items-center gap-2 border-b border-gray-200 bg-gray-50 p-2">
                  <div className="relative flex-1">
                    <Search className="absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                    <input type="text" value={recherche} onChange={(e) => setRecherche(e.target.value)}
                      placeholder={`Rechercher parmi ${etudiantsDeLaClasse.length} étudiant(s)…`}
                      className="w-full rounded-lg border border-gray-200 bg-white py-2 pl-8 pr-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100" />
                  </div>
                  <button type="button" onClick={toggleSelectAllVisible}
                    title={tousVisiblesSelectionnes ? 'Désélectionner les étudiants affichés' : 'Sélectionner les étudiants affichés'}
                    className="shrink-0 whitespace-nowrap rounded-lg border border-gray-300 bg-white px-2.5 py-2 text-xs font-medium text-gray-600 hover:bg-gray-50">
                    {tousVisiblesSelectionnes ? 'Aucun' : 'Tous'}
                  </button>
                </div>
                <div className="max-h-56 overflow-y-auto">
                  {etudiantsAffiches.length === 0 ? (
                    <p className="p-4 text-center text-sm text-gray-500">Aucun étudiant ne correspond à la recherche.</p>
                  ) : etudiantsAffiches.map((e) => {
                    const coché = selection.has(String(e.id));
                    return (
                      <button key={e.id} type="button" onClick={() => toggleSelection(String(e.id))}
                        className={`flex w-full items-center gap-3 border-b border-gray-100 px-3 py-2.5 text-left transition-colors last:border-0 ${coché ? 'bg-blue-50' : 'hover:bg-gray-50'}`}>
                        <span className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-md border-2 transition-colors ${coché ? 'border-blue-600 bg-blue-600' : 'border-gray-300 bg-white'}`}>
                          {coché && <Check className="h-3.5 w-3.5 text-white" />}
                        </span>
                        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gray-200 text-xs font-semibold text-gray-600">
                          {initiales(e.nom, e.prenoms)}
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-sm font-medium text-gray-900">{e.nom} {e.prenoms}</p>
                          <p className="truncate font-mono text-xs text-gray-500">{e.matricule}</p>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
            {erreurs.etudiant && (
              <p className="flex items-center gap-1.5 text-xs font-medium text-red-600">
                <AlertCircle className="h-3.5 w-3.5" />{erreurs.etudiant}
              </p>
            )}
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-gray-700">Date <span className="text-red-500">*</span></label>
              <div className="relative">
                <CalendarDays className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                <input type="date" value={date} max={todayISO()} onChange={(e) => setDate(e.target.value)}
                  className={`w-full rounded-lg border py-2.5 pl-9 pr-3 text-sm outline-none focus:ring-2 ${erreurs.date ? 'border-red-400 focus:border-red-500 focus:ring-red-100' : 'border-gray-300 focus:border-blue-500 focus:ring-blue-100'}`} />
              </div>
              <div className="flex gap-2">
                <button type="button" onClick={() => setDate(todayISO())}
                  className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${date === todayISO() ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>
                  Aujourd’hui
                </button>
                <button type="button" onClick={() => setDate(yesterdayISO())}
                  className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${date === yesterdayISO() ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>
                  Hier
                </button>
              </div>
              {erreurs.date && <p className="flex items-center gap-1.5 text-xs font-medium text-red-600"><AlertCircle className="h-3.5 w-3.5" />{erreurs.date}</p>}
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-medium text-gray-700">Heures d’absence <span className="text-red-500">*</span></label>
              <div className="flex items-center gap-2">
                <button type="button" onClick={() => setHeures(String(Math.max(1, Number(heures || 1) - 1)))}
                  className="h-10 w-10 shrink-0 rounded-lg border border-gray-300 text-lg font-semibold text-gray-600 transition-colors hover:bg-gray-50">−</button>
                <input type="number" min={1} max={12} value={heures} onChange={(e) => setHeures(e.target.value)}
                  className={`w-full rounded-lg border py-2.5 text-center text-sm outline-none focus:ring-2 ${erreurs.heures ? 'border-red-400 focus:border-red-500 focus:ring-red-100' : 'border-gray-300 focus:border-blue-500 focus:ring-blue-100'}`} />
                <button type="button" onClick={() => setHeures(String(Math.min(12, Number(heures || 0) + 1)))}
                  className="h-10 w-10 shrink-0 rounded-lg border border-gray-300 text-lg font-semibold text-gray-600 transition-colors hover:bg-gray-50">+</button>
              </div>
              {erreurs.heures && <p className="flex items-center gap-1.5 text-xs font-medium text-red-600"><AlertCircle className="h-3.5 w-3.5" />{erreurs.heures}</p>}
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-medium text-gray-700">Statut</label>
            <div className="flex gap-3">
              <button type="button" onClick={() => setJustifiee('false')}
                className={`flex-1 rounded-lg border px-4 py-2.5 text-sm font-medium transition-colors ${justifiee === 'false' ? 'border-red-500 bg-red-50 text-red-700' : 'border-gray-300 bg-white text-gray-600 hover:border-gray-400'}`}>
                Non justifiée
              </button>
              <button type="button" onClick={() => setJustifiee('true')}
                className={`flex-1 rounded-lg border px-4 py-2.5 text-sm font-medium transition-colors ${justifiee === 'true' ? 'border-green-500 bg-green-50 text-green-700' : 'border-gray-300 bg-white text-gray-600 hover:border-gray-400'}`}>
                Justifiée
              </button>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 border-t border-gray-200 bg-white px-5 py-4 sm:px-6">
          <button type="button" onClick={onClose} disabled={submitting}
            className="rounded-lg px-4 py-2.5 text-sm font-medium text-gray-600 transition-colors hover:bg-gray-100 disabled:opacity-50">
            Annuler
          </button>
          <button type="button" onClick={handleSubmit} disabled={submitting}
            className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-70">
            {submitting
              ? <><Loader2 className="h-4 w-4 animate-spin" />Enregistrement…</>
              : <><Check className="h-4 w-4" />{selection.size > 1 ? `Signaler ${selection.size} absences` : 'Signaler l’absence'}</>}
          </button>
        </div>
      </div>
    </div>
  );
}