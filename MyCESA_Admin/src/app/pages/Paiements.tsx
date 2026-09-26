import { useMemo, useState } from 'react';
import { Plus, Search, Filter, Download, DollarSign, TrendingUp, AlertCircle, CheckCircle2, Clock, Eye } from 'lucide-react';
import { useApiData, unwrapApiData } from '../../hooks/useApiData';
import PaiementsEtudiantModal, { formatMontant, tonStatut, type GroupePaiements } from '../components/PaiementsEtudiantModal';
import PaiementFormModal, { type PaiementFormValues } from '../components/PaiementFormModal';
import { classesService, filieresService, paiementsService } from '../../services';

type StatsPaiement = {
  totalDu: number; totalPercu: number; reste: number; tauxRecouvrement: number;
  etudiants: number; soldes: number; partiels: number; impayes: number;
};

const STATS_VIDES: StatsPaiement = {
  totalDu: 0, totalPercu: 0, reste: 0, tauxRecouvrement: 0,
  etudiants: 0, soldes: 0, partiels: 0, impayes: 0,
};

/**
 * Une ligne de la table VERSER jointe a son VERSEMENT (source : GET /versements).
 * Les montants viennent tels quels de la base, sans recalcul cote client :
 *   montantTotal -> VERSEMENT.Montant_Total (total du, global a la scolarite)
 *   montantVerse -> VERSER.Montant (montant reellement verse sur cette ligne)
 */
type Versement = {
  id: number | string;
  etudiantId: number | string | null;
  matricule: string;
  etudiant: string;
  classe: string;
  classeId: number | string | null;
  filiere: string;
  filiereId: number | string | null;
  type: string;
  montantTotal: number;
  montantVerse: number;
  dateVersement: string;
  datePaiement: string;
  statut: string;
};

/** Totaux par etudiant calcules en base (source : GET /versements/totaux). */
type TotalEtudiant = {
  etudiantId: number | string;
  matricule: string;
  nom: string;
  classe: string;
  classeId: number | string | null;
  filiere: string;
  filiereId: number | string | null;
  totalDu: number;
  totalPaye: number;
  reste: number;
  progression: number;
  statut: 'Soldé' | 'Partiel' | 'Impayé';
  nombreVersements: number;
  dernierPaiement: string;
};

export default function Paiements() {
  // Totaux officiels (calcules en SQL) : ce sont eux qui alimentent KPI et tableau.
  const { data: totauxData, loading, error, reload } = useApiData<{ totaux: TotalEtudiant[]; stats: StatsPaiement }>(
    paiementsService.getTotaux,
    { totaux: [], stats: STATS_VIDES },
  );
  // Detail brut des versements, uniquement pour la modale de detail.
  const { data: versementsBruts, reload: reloadVersements } = useApiData<Versement[]>(paiementsService.getAll, []);
  const { data: classes } = useApiData<any[]>(classesService.getAll, []);
  const { data: filieres } = useApiData<any[]>(filieresService.getAll, []);

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStatut, setSelectedStatut] = useState('Tous');
  const [selectedClasse, setSelectedClasse] = useState('Tous');
  const [modalOpen, setModalOpen] = useState(false);
  const [prefillEtudiantId, setPrefillEtudiantId] = useState('');
  const [detailCle, setDetailCle] = useState<string | null>(null);
  const [submitError, setSubmitError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Les totaux arrivent dans une enveloppe { totaux, stats } : on lit les deux.
  const totaux: TotalEtudiant[] = useMemo(
    () => unwrapApiData<TotalEtudiant[]>(totauxData?.totaux) || [],
    [totauxData],
  );
  const stats: StatsPaiement = totauxData?.stats || STATS_VIDES;
  const versements: Versement[] = useMemo(
    () => unwrapApiData<Versement[]>(versementsBruts) || [],
    [versementsBruts],
  );

  // Versements reels d'un etudiant (VERSER), pour la modale de detail.
  const versementsParEtudiant = useMemo(() => {
    const map = new Map<string, Versement[]>();
    versements.forEach((v) => {
      const cle = String(v.etudiantId ?? v.matricule ?? '');
      if (!map.has(cle)) map.set(cle, []);
      map.get(cle)!.push(v);
    });
    return map;
  }, [versements]);

  // Une ligne par etudiant : les montants sont ceux calcules par le backend,
  // aucun montant n'est recalcule ni additionne cote client.
  const groupes = useMemo<GroupePaiements[]>(
    () => totaux.map((t) => {
      const cle = String(t.etudiantId ?? t.matricule);
      return {
        cle,
        etudiantId: t.etudiantId,
        nom: t.nom,
        matricule: t.matricule || '—',
        classe: t.classe,
        filiere: t.filiere,
        versements: (versementsParEtudiant.get(cle) || []).map((v) => ({
          id: v.id,
          type: v.type,
          // Montant verse sur cette ligne (VERSER.Montant)
          montantPaye: v.montantVerse,
          // Total du de la scolarite (VERSEMENT.Montant_Total) : reference, non cumulable
          montantDu: v.montantTotal,
          dateEcheance: v.datePaiement || v.dateVersement,
          statut: v.statut,
        })),
        totalDu: t.totalDu,
        totalPaye: t.totalPaye,
        reste: t.reste,
        statut: t.statut,
      };
    }),
    [totaux, versementsParEtudiant],
  );

  const classesDisponibles = Array.from(
    new Set(groupes.map((g) => g.classe).filter(Boolean)),
  ).sort();
  const normalizedQuery = searchQuery.trim().toLowerCase();
  const filteredGroupes = groupes.filter((g) => {
    const matchesSearch = [g.nom, g.matricule, g.classe].some((v) => String(v || '').toLowerCase().includes(normalizedQuery));
    const matchesStatut = selectedStatut === 'Tous' || g.statut === selectedStatut;
    const matchesClasse = selectedClasse === 'Tous' || g.classe === selectedClasse;
    return matchesSearch && matchesStatut && matchesClasse;
  });

  // Tous les KPI proviennent directement de l'agregation SQL du backend.
  const totalPercu = stats.totalPercu;
  const totalDuGlobal = stats.totalDu;
  const tauxRecouvrement = String(stats.tauxRecouvrement);
  const nombreSoldes = stats.soldes;
  const nombrePartiels = stats.partiels;
  const nombreImpayes = stats.impayes;

  const groupeDetail = groupes.find((g) => g.cle === detailCle) || null;

  const ouvrirCreation = (etudiantId = '') => {
    setPrefillEtudiantId(etudiantId);
    setSubmitError('');
    setDetailCle(null);
    setModalOpen(true);
  };

  const savePaiement = async (values: PaiementFormValues) => {
    setSubmitting(true); setSubmitError('');
    try {
      await paiementsService.create({
        etudiantId: Number(values.etudiantId),
        type: values.type,
        montant: Number(values.montant),
        montantTotal: Number(values.montantTotal),
      });
      setModalOpen(false);
      await Promise.all([reload(), reloadVersements()]);
    } catch (requestError: any) {
      setSubmitError(requestError?.response?.data?.error || requestError?.message || 'Impossible d’enregistrer le paiement.');
    } finally { setSubmitting(false); }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Gestion des Paiements</h1>
          <p className="mt-2 text-gray-600">Suivez les paiements par étudiant, puis ouvrez le détail</p>
        </div>
        <div className="flex gap-2">
          <button type="button" className="inline-flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2 font-medium text-gray-700 shadow-sm transition-colors hover:bg-gray-50">
            <Download className="h-5 w-5" />Exporter
          </button>
          <button type="button" onClick={() => ouvrirCreation()}
            className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 font-medium text-white shadow-sm transition-colors hover:bg-blue-700">
            <Plus className="h-5 w-5" />Enregistrer paiement
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
        <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div><p className="text-sm font-medium text-gray-600">Total perçu</p><p className="mt-1 text-xl font-bold text-green-600">{formatMontant(totalPercu)}</p></div>
            <DollarSign className="h-8 w-8 text-green-500" />
          </div>
        </div>
        <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div><p className="text-sm font-medium text-gray-600">Recouvrement</p><p className="mt-1 text-2xl font-bold text-purple-600">{tauxRecouvrement}%</p></div>
            <TrendingUp className="h-8 w-8 text-purple-500" />
          </div>
        </div>
        <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div><p className="text-sm font-medium text-gray-600">Soldés</p><p className="mt-1 text-2xl font-bold text-green-600">{nombreSoldes}</p></div>
            <CheckCircle2 className="h-8 w-8 text-green-500" />
          </div>
        </div>
        <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div><p className="text-sm font-medium text-gray-600">Partiels</p><p className="mt-1 text-2xl font-bold text-yellow-600">{nombrePartiels}</p></div>
            <Clock className="h-8 w-8 text-yellow-500" />
          </div>
        </div>
        <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div><p className="text-sm font-medium text-gray-600">Impayés</p><p className="mt-1 text-2xl font-bold text-red-600">{nombreImpayes}</p></div>
            <AlertCircle className="h-8 w-8 text-red-500" />
          </div>
        </div>
      </div>

      <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
        <div className="flex flex-col gap-4 lg:flex-row">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
            <input type="text" placeholder="Rechercher un étudiant (nom, matricule, classe…)" value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-lg border border-gray-300 py-2 pl-10 pr-4 outline-none focus:border-transparent focus:ring-2 focus:ring-blue-500" />
          </div>
          <div className="flex items-center gap-2">
            <Filter className="h-5 w-5 text-gray-400" />
            <select value={selectedStatut} onChange={(e) => setSelectedStatut(e.target.value)}
              className="rounded-lg border border-gray-300 px-4 py-2 outline-none focus:border-transparent focus:ring-2 focus:ring-blue-500">
              <option value="Tous">Tous les statuts</option>
              <option value="Soldé">Soldé</option>
              <option value="Partiel">Partiel</option>
              <option value="Impayé">Impayé</option>
            </select>
            <select value={selectedClasse} onChange={(e) => setSelectedClasse(e.target.value)}
              className="rounded-lg border border-gray-300 px-4 py-2 outline-none focus:border-transparent focus:ring-2 focus:ring-blue-500">
              <option value="Tous">Toutes les classes</option>
              {classesDisponibles.map((classe) => <option key={classe}>{classe}</option>)}
            </select>
          </div>
        </div>
      </div>

      {error && <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-red-700">{error}</div>}

      <div className="overflow-hidden rounded-lg border border-gray-200 bg-white">
        {loading ? (
          <div className="py-12 text-center text-gray-500">Chargement...</div>
        ) : filteredGroupes.length === 0 ? (
          <div className="py-12 text-center text-gray-500">
            <DollarSign className="mx-auto mb-4 h-12 w-12 text-gray-300" />
            <p>{totaux.length === 0 ? 'Aucun étudiant enregistré' : 'Aucun étudiant ne correspond à la recherche'}</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">Étudiant</th>
                  <th className="hidden px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500 md:table-cell">Classe</th>
                  <th className="px-6 py-3 text-right text-xs font-semibold uppercase tracking-wider text-gray-500">Montant dû</th>
                  <th className="px-6 py-3 text-right text-xs font-semibold uppercase tracking-wider text-gray-500">Payé</th>
                  <th className="hidden px-6 py-3 text-right text-xs font-semibold uppercase tracking-wider text-gray-500 sm:table-cell">Reste</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">Statut</th>
                  <th className="px-6 py-3 text-right text-xs font-semibold uppercase tracking-wider text-gray-500">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredGroupes.map((groupe) => {
                  const ton = tonStatut(groupe.statut);
                  const initiales = groupe.nom.split(' ').filter(Boolean).slice(0, 2).map((m) => m.charAt(0)).join('').toUpperCase();
                  return (
                    <tr key={groupe.cle} onClick={() => setDetailCle(groupe.cle)} className="cursor-pointer transition-colors hover:bg-blue-50/40">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-blue-600 text-sm font-semibold text-white">
                            {initiales || '??'}
                          </div>
                          <div className="min-w-0">
                            <p className="truncate font-medium text-gray-900">{groupe.nom}</p>
                            <p className="truncate font-mono text-xs text-gray-500">{groupe.matricule}</p>
                          </div>
                        </div>
                      </td>
                      <td className="hidden px-6 py-4 text-sm text-gray-900 md:table-cell">{groupe.classe || '—'}</td>
                      <td className="whitespace-nowrap px-6 py-4 text-right text-sm font-semibold text-gray-900">{formatMontant(groupe.totalDu)}</td>
                      <td className="whitespace-nowrap px-6 py-4 text-right text-sm font-semibold text-green-600">{formatMontant(groupe.totalPaye)}</td>
                      <td className="hidden whitespace-nowrap px-6 py-4 text-right text-sm font-semibold text-red-600 sm:table-cell">{formatMontant(groupe.reste)}</td>
                      <td className="whitespace-nowrap px-6 py-4">
                        <span className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${ton.fond} ${ton.texte}`}>{groupe.statut}</span>
                      </td>
                      <td className="whitespace-nowrap px-6 py-4 text-right">
                        <button type="button" onClick={(e) => { e.stopPropagation(); setDetailCle(groupe.cle); }}
                          className="inline-flex items-center gap-1.5 rounded-lg border border-gray-300 px-3 py-1.5 text-sm font-medium text-gray-700 transition-colors hover:border-blue-500 hover:bg-blue-50 hover:text-blue-700">
                          <Eye className="h-4 w-4" />Voir
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {nombreImpayes > 0 && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-4">
          <div className="flex gap-3">
            <AlertCircle className="mt-0.5 h-6 w-6 shrink-0 text-red-600" />
            <div>
              <h3 className="mb-1 font-semibold text-red-900">Attention : Frais impayés</h3>
              <p className="text-sm text-red-800"><strong>{nombreImpayes} étudiant(s)</strong> n’ont encore rien réglé sur leurs frais de scolarité. Relances à effectuer.</p>
            </div>
          </div>
        </div>
      )}

      {groupeDetail && (
        <PaiementsEtudiantModal
          groupe={groupeDetail}
          onClose={() => setDetailCle(null)}
          onAddPaiement={(g) => ouvrirCreation(String(g.etudiantId || ''))}
        />
      )}

      {modalOpen && <PaiementFormModal
        key={prefillEtudiantId || 'nouveau-paiement'}
        etudiants={etudiants}
        filieres={filieres}
        classes={classes}
        prefillEtudiantId={prefillEtudiantId}
        error={submitError}
        submitting={submitting}
        onClose={() => setModalOpen(false)}
        onSubmit={savePaiement}
      />}
    </div>
  );
}