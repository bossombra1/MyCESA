import { useEffect, useMemo, useRef, useState } from 'react';
import { X, Search, Check, AlertCircle, Loader2, RotateCcw, Wallet } from 'lucide-react';
import { formatMontant } from './PaiementsEtudiantModal';

export type PaiementFormValues = { etudiantId: string; type: string; montantTotal: string; montant: string };

type Props = {
  etudiants: any[];
  filieres: any[];
  classes: any[];
  prefillEtudiantId?: string;
  submitting?: boolean;
  error?: string;
  onClose: () => void;
  onSubmit: (values: PaiementFormValues) => void | Promise<void>;
};

const initiales = (nom = '', prenoms = '') => `${nom.charAt(0)}${prenoms.charAt(0)}`.toUpperCase();

export default function PaiementFormModal({ etudiants, filieres, classes, prefillEtudiantId = '', submitting = false, error = '', onClose, onSubmit }: Props) {
  const etudiantPrefill = etudiants.find((e) => String(e.id) === prefillEtudiantId);
  const classePrefill = etudiantPrefill ? classes.find((c) => String(c.id) === String(etudiantPrefill.classeId)) : null;

  const [filiereId, setFiliereId] = useState(classePrefill ? String(classePrefill.filiereId ?? classePrefill.filiere_id ?? '') : '');
  const [classeId, setClasseId] = useState(etudiantPrefill ? String(etudiantPrefill.classeId || '') : '');
  const [etudiantId, setEtudiantId] = useState(prefillEtudiantId);
  const [recherche, setRecherche] = useState('');
  const [type, setType] = useState('');
  const [montantTotal, setMontantTotal] = useState('');
  const [montant, setMontant] = useState('0');
  const [erreurs, setErreurs] = useState<{ etudiant?: string; type?: string; montantTotal?: string; montant?: string }>({});

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
  const etudiantsDeLaClasse = useMemo(() => (!classeId ? [] : etudiants.filter((e) => String(e.classeId) === classeId)), [etudiants, classeId]);
  const q = recherche.trim().toLowerCase();
  const etudiantsAffiches = useMemo(
    () => etudiantsDeLaClasse.filter((e) => !q || [e.nom, e.prenoms, e.matricule].some((v) => String(v || '').toLowerCase().includes(q))),
    [etudiantsDeLaClasse, q],
  );
  const etudiantSelectionne = etudiants.find((e) => String(e.id) === etudiantId);

  const choisirFiliere = (value: string) => { setFiliereId(value); setClasseId(''); setEtudiantId(''); setRecherche(''); };
  const choisirClasse = (value: string) => { setClasseId(value); setEtudiantId(''); setRecherche(''); };

  const totalNum = Number(montantTotal);
  const payeNum = Number(montant);
  const resteApercu = Number.isFinite(totalNum) && Number.isFinite(payeNum) ? totalNum - payeNum : null;

  const valider = () => {
    const next: typeof erreurs = {};
    if (!etudiantId) next.etudiant = 'Sélectionnez un étudiant.';
    if (!type.trim()) next.type = 'Le type de versement est obligatoire.';
    if (!montantTotal || !Number.isFinite(totalNum) || totalNum <= 0) next.montantTotal = 'Indiquez un montant total valide.';
    if (montant === '' || !Number.isFinite(payeNum) || payeNum < 0) next.montant = 'Indiquez un montant payé valide.';
    else if (Number.isFinite(totalNum) && payeNum > totalNum) next.montant = 'Le montant payé ne peut pas dépasser le montant dû.';
    setErreurs(next);
    return Object.keys(next).length === 0;
  };

  const handleSubmit = async () => {
    if (!valider()) return;
    await onSubmit({ etudiantId, type: type.trim(), montantTotal, montant });
  };

  const champClass = (champ: keyof typeof erreurs) =>
    `w-full rounded-lg border px-3.5 py-2.5 text-sm outline-none focus:ring-2 ${
      erreurs[champ] ? 'border-red-400 focus:border-red-500 focus:ring-red-100' : 'border-gray-300 focus:border-blue-500 focus:ring-blue-100'
    }`;

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-gray-900/60 backdrop-blur-sm sm:items-center sm:p-4"
      onMouseDown={(e) => { if (e.target === e.currentTarget && !submitting) onClose(); }}>
      <div role="dialog" aria-modal="true" aria-labelledby="paiement-modal-titre"
        className="flex max-h-[95vh] w-full flex-col overflow-hidden rounded-t-2xl bg-white shadow-2xl sm:max-h-[90vh] sm:max-w-xl sm:rounded-2xl">

        <div className="flex items-center justify-between border-b border-gray-200 px-5 py-4 sm:px-6">
          <div>
            <h2 id="paiement-modal-titre" className="text-lg font-bold text-gray-900">Enregistrer un paiement</h2>
            <p className="text-sm text-gray-500">Filtrez par filière puis par classe pour retrouver l’étudiant</p>
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
            <label className="text-sm font-medium text-gray-700">Étudiant <span className="text-red-500">*</span></label>
            {etudiantSelectionne ? (
              <div className="flex items-center gap-3 rounded-xl border border-blue-200 bg-blue-50 p-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-blue-600 text-sm font-semibold text-white">
                  {initiales(etudiantSelectionne.nom, etudiantSelectionne.prenoms)}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate font-medium text-gray-900">{etudiantSelectionne.nom} {etudiantSelectionne.prenoms}</p>
                  <p className="truncate font-mono text-xs text-gray-500">{etudiantSelectionne.matricule}</p>
                </div>
                <button type="button" onClick={() => setEtudiantId('')}
                  className="inline-flex shrink-0 items-center gap-1 rounded-lg px-2.5 py-1.5 text-xs font-medium text-blue-700 transition-colors hover:bg-blue-100">
                  <RotateCcw className="h-3.5 w-3.5" />Changer
                </button>
              </div>
            ) : !classeId ? (
              <div className="rounded-xl border border-dashed border-gray-300 p-4 text-center text-sm text-gray-500">
                Choisissez d’abord une classe pour afficher ses étudiants.
              </div>
            ) : (
              <div className="overflow-hidden rounded-xl border border-gray-200">
                <div className="relative border-b border-gray-200 bg-gray-50 p-2">
                  <Search className="absolute left-5 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                  <input type="text" value={recherche} onChange={(e) => setRecherche(e.target.value)}
                    placeholder={`Rechercher parmi ${etudiantsDeLaClasse.length} étudiant(s)…`}
                    className="w-full rounded-lg border border-gray-200 bg-white py-2 pl-9 pr-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100" />
                </div>
                <div className="max-h-56 overflow-y-auto">
                  {etudiantsAffiches.length === 0 ? (
                    <p className="p-4 text-center text-sm text-gray-500">Aucun étudiant ne correspond à la recherche.</p>
                  ) : etudiantsAffiches.map((e) => (
                    <button key={e.id} type="button" onClick={() => setEtudiantId(String(e.id))}
                      className="flex w-full items-center gap-3 border-b border-gray-100 px-3 py-2.5 text-left transition-colors last:border-0 hover:bg-blue-50">
                      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gray-200 text-xs font-semibold text-gray-600">
                        {initiales(e.nom, e.prenoms)}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-medium text-gray-900">{e.nom} {e.prenoms}</p>
                        <p className="truncate font-mono text-xs text-gray-500">{e.matricule}</p>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}
            {erreurs.etudiant && <p className="flex items-center gap-1.5 text-xs font-medium text-red-600"><AlertCircle className="h-3.5 w-3.5" />{erreurs.etudiant}</p>}
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-medium text-gray-700">Type de versement <span className="text-red-500">*</span></label>
            <input type="text" value={type} onChange={(e) => setType(e.target.value)} placeholder="Ex. Scolarité, Inscription…"
              className={champClass('type')} />
            {erreurs.type && <p className="flex items-center gap-1.5 text-xs font-medium text-red-600"><AlertCircle className="h-3.5 w-3.5" />{erreurs.type}</p>}
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-gray-700">Montant total dû <span className="text-red-500">*</span></label>
              <input type="number" min={0} value={montantTotal} onChange={(e) => setMontantTotal(e.target.value)} placeholder="0"
                className={champClass('montantTotal')} />
              {Number.isFinite(totalNum) && totalNum > 0 && <p className="text-xs text-gray-500">{formatMontant(totalNum)}</p>}
              {erreurs.montantTotal && <p className="flex items-center gap-1.5 text-xs font-medium text-red-600"><AlertCircle className="h-3.5 w-3.5" />{erreurs.montantTotal}</p>}
            </div>
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium text-gray-700">Montant payé <span className="text-red-500">*</span></label>
                {Number.isFinite(totalNum) && totalNum > 0 && (
                  <button type="button" onClick={() => setMontant(montantTotal)} className="text-xs font-medium text-blue-600 hover:underline">
                    Payé intégralement
                  </button>
                )}
              </div>
              <input type="number" min={0} value={montant} onChange={(e) => setMontant(e.target.value)} placeholder="0"
                className={champClass('montant')} />
              {resteApercu !== null && <p className={`text-xs ${resteApercu > 0 ? 'text-orange-600' : 'text-green-600'}`}>
                {resteApercu > 0 ? `Reste ${formatMontant(resteApercu)}` : 'Soldé'}
              </p>}
              {erreurs.montant && <p className="flex items-center gap-1.5 text-xs font-medium text-red-600"><AlertCircle className="h-3.5 w-3.5" />{erreurs.montant}</p>}
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
            {submitting ? <><Loader2 className="h-4 w-4 animate-spin" />Enregistrement…</> : <><Wallet className="h-4 w-4" />Enregistrer</>}
          </button>
        </div>
      </div>
    </div>
  );
}