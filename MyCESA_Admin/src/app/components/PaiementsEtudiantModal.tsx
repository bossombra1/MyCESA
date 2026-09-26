import { useMemo, useRef, useEffect } from 'react';
import { X, Plus, Wallet, CheckCircle2, TrendingDown, Receipt } from 'lucide-react';

export type VersementItem = {
  id?: number | string;
  /** Libelle de l'echeance (VERSEMENT.Lib_Versement) */
  type?: string;
  /** Montant reellement verse sur cette ligne (VERSER.Montant) */
  montantPaye?: number | string;
  /** Total du de la scolarite (VERSEMENT.Montant_Total) : reference, non cumulable */
  montantDu?: number | string;
  dateEcheance?: string;
  methode?: string;
  statut?: string;
  [k: string]: any;
};

export type GroupePaiements = {
  cle: string;
  etudiantId: number | string | null;
  nom: string;
  matricule: string;
  classe?: string;
  filiere?: string;
  versements: VersementItem[];
  totalDu: number;
  totalPaye: number;
  reste: number;
  statut: 'Soldé' | 'Partiel' | 'Impayé';
};

export const formatMontant = (montant: number) =>
  new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'XOF', minimumFractionDigits: 0 }).format(montant || 0);

export const tonStatut = (statut: GroupePaiements['statut']) => {
  if (statut === 'Soldé') return { texte: 'text-green-700', fond: 'bg-green-100', barre: 'bg-green-500' };
  if (statut === 'Partiel') return { texte: 'text-yellow-700', fond: 'bg-yellow-100', barre: 'bg-yellow-500' };
  return { texte: 'text-red-700', fond: 'bg-red-100', barre: 'bg-red-500' };
};

const statutVersement = (montant: number, montantPaye: number): GroupePaiements['statut'] => {
  if (montant > 0 && montantPaye >= montant) return 'Soldé';
  if (montantPaye > 0) return 'Partiel';
  return 'Impayé';
};

const formatDate = (iso?: string) => {
  if (!iso) return '—';
  const d = new Date(iso);
  return Number.isNaN(d.getTime()) ? '—' : d.toLocaleDateString('fr-FR');
};

function Tuile({ icone: Icone, label, valeur, ton }: { icone: any; label: string; valeur: string; ton?: string }) {
  return (
    <div className="rounded-xl border border-gray-200 bg-white p-3">
      <div className="flex items-center gap-1.5 text-xs font-medium text-gray-500">
        <Icone className="h-3.5 w-3.5" />{label}
      </div>
      <p className={`mt-1 truncate text-lg font-bold ${ton || 'text-gray-900'}`}>{valeur}</p>
    </div>
  );
}

export default function PaiementsEtudiantModal({ groupe, onClose, onAddPaiement }: {
  groupe: GroupePaiements;
  onClose: () => void;
  onAddPaiement?: (groupe: GroupePaiements) => void;
}) {
  const closeRef = useRef(onClose);
  closeRef.current = onClose;

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') closeRef.current(); };
    document.addEventListener('keydown', onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => { document.removeEventListener('keydown', onKey); document.body.style.overflow = prev; };
  }, []);

  const versementsTries = useMemo(
    () => [...groupe.versements].sort((a, b) => String(a.dateEcheance || '').localeCompare(String(b.dateEcheance || ''))),
    [groupe.versements],
  );

  const ton = tonStatut(groupe.statut);
  const initiales = groupe.nom.split(' ').filter(Boolean).slice(0, 2).map((m) => m.charAt(0)).join('').toUpperCase();
  const progression = groupe.totalDu > 0 ? Math.min(100, Math.round((groupe.totalPaye / groupe.totalDu) * 100)) : 0;

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-gray-900/60 backdrop-blur-sm sm:items-center sm:p-4"
      onMouseDown={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div role="dialog" aria-modal="true" aria-labelledby="paiements-etudiant-titre"
        className="flex max-h-[95vh] w-full flex-col overflow-hidden rounded-t-2xl bg-white shadow-2xl sm:max-h-[90vh] sm:max-w-3xl sm:rounded-2xl">

        <div className="flex items-start gap-4 border-b border-gray-200 px-5 py-4 sm:px-6">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-blue-600 text-base font-semibold text-white">
            {initiales || '??'}
          </div>
          <div className="min-w-0 flex-1">
            <h2 id="paiements-etudiant-titre" className="truncate text-lg font-bold text-gray-900">{groupe.nom}</h2>
            <p className="truncate text-sm text-gray-500">
              <span className="font-mono">{groupe.matricule}</span>{groupe.classe ? ` · ${groupe.classe}` : ''}
            </p>
          </div>
          <span className={`shrink-0 rounded-full px-3 py-1 text-xs font-bold ${ton.fond} ${ton.texte}`}>{groupe.statut}</span>
          <button type="button" onClick={onClose} aria-label="Fermer"
            className="rounded-lg p-2 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="border-b border-gray-200 bg-gray-50 px-5 py-4 sm:px-6">
          <div className="grid grid-cols-3 gap-3">
            <Tuile icone={Wallet} label="Montant dû" valeur={formatMontant(groupe.totalDu)} />
            <Tuile icone={CheckCircle2} label="Payé" ton="text-green-700" valeur={formatMontant(groupe.totalPaye)} />
            <Tuile icone={TrendingDown} label="Reste" ton={groupe.reste > 0 ? 'text-red-700' : 'text-gray-500'} valeur={formatMontant(groupe.reste)} />
          </div>
          <div className="mt-3 h-2 w-full overflow-hidden rounded-full bg-gray-200">
            <div className={`h-full rounded-full transition-all ${ton.barre}`} style={{ width: `${progression}%` }} />
          </div>
          <p className="mt-1 text-xs text-gray-500">{progression}% réglé · {groupe.versements.length} versement(s) enregistré(s)</p>
        </div>

        <div className="flex-1 overflow-y-auto px-5 py-4 sm:px-6">
          {versementsTries.length === 0 ? (
            <div className="py-12 text-center text-gray-500">
              <Receipt className="mx-auto mb-3 h-10 w-10 text-gray-300" />
              <p className="text-sm">Aucun versement enregistré.</p>
            </div>
          ) : (
            <ul className="space-y-2">
              {versementsTries.map((v, index) => {
                // Valeurs brutes de la base : montant verse sur la ligne et
                // total du de la scolarite (information de reference).
                const verse = Number(v.montantPaye) || 0;
                const duGlobal = Number(v.montantDu) || 0;
                const statutItem = v.statut === 'Payé' ? 'Soldé'
                  : v.statut === 'Impayé' ? 'Impayé'
                  : statutVersement(duGlobal, verse);
                const t = tonStatut(statutItem);
                return (
                  <li key={v.id ?? index} className="rounded-xl border border-gray-200 p-3 transition-colors hover:border-gray-300">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <p className="truncate font-medium text-gray-900">{v.type || 'Versement'}</p>
                        <div className="mt-1 flex flex-wrap items-center gap-1.5 text-xs text-gray-500">
                          <span>Payé le : {formatDate(v.dateEcheance)}</span>
                          {v.methode && <span className="rounded bg-gray-100 px-1.5 py-0.5 font-medium text-gray-600">{v.methode}</span>}
                        </div>
                      </div>
                      <span className={`shrink-0 rounded-lg px-2.5 py-1 text-xs font-bold ${t.fond} ${t.texte}`}>{statutItem}</span>
                    </div>
                    <div className="mt-2 grid grid-cols-2 gap-2 text-sm">
                      <div><span className="text-xs text-gray-400">Montant versé</span><p className="font-semibold text-green-600">{formatMontant(verse)}</p></div>
                      <div><span className="text-xs text-gray-400">Total scolarité</span><p className="font-semibold text-gray-900">{formatMontant(duGlobal)}</p></div>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </div>

        <div className="flex items-center justify-end gap-2 border-t border-gray-200 px-5 py-4 sm:px-6">
          <button type="button" onClick={onClose}
            className="rounded-lg px-4 py-2.5 text-sm font-medium text-gray-600 transition-colors hover:bg-gray-100">
            Fermer
          </button>
          {onAddPaiement && (
            <button type="button" onClick={() => onAddPaiement(groupe)}
              className="inline-flex items-center gap-1.5 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-blue-700">
              <Plus className="h-4 w-4" />Ajouter un versement
            </button>
          )}
        </div>
      </div>
    </div>
  );
}