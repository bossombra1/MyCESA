import { useState } from 'react';
import { Plus, Search, Filter, Download, DollarSign, TrendingUp, AlertCircle, CheckCircle } from 'lucide-react';
import { useApiData } from '../../hooks/useApiData';
import CrudModal from '../components/CrudModal';
import { etudiantsService, paiementsService } from '../../services';

const getStatusColor = (status: string) => {
  switch (status) {
    case 'Payé': return 'bg-green-100 text-green-800';
    case 'Partiel': return 'bg-yellow-100 text-yellow-800';
    case 'Impayé': return 'bg-red-100 text-red-800';
    default: return 'bg-gray-100 text-gray-800';
  }
};

const formatMontant = (montant: number) => {
  return new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: 'XOF',
    minimumFractionDigits: 0
  }).format(montant);
};

export default function Paiements() {
  const { data: paiements, loading, error, reload } = useApiData<any[]>(paiementsService.getAll, []);
  const { data: etudiants } = useApiData<any[]>(etudiantsService.getAll, []);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedClasse, setSelectedClasse] = useState('Tous');
  const [selectedStatus, setSelectedStatus] = useState('Tous');
  const [modalOpen, setModalOpen] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const classes = Array.from(new Set(paiements.map((paiement) => paiement.classe).filter(Boolean))).sort();
  const statuses = Array.from(new Set(paiements.map((paiement) => paiement.statut || paiement.status).filter(Boolean))).sort();
  const normalizedQuery = searchQuery.trim().toLowerCase();
  const filteredPaiements = paiements.filter(paiement => {
    const matchesSearch = [paiement.etudiant, paiement.matricule, paiement.type]
      .some((value) => String(value || '').toLowerCase().includes(normalizedQuery));
    const matchesClasse = selectedClasse === 'Tous' || paiement.classe === selectedClasse;
    const matchesStatus = selectedStatus === 'Tous' || (paiement.statut || paiement.status) === selectedStatus;
    return matchesSearch && matchesClasse && matchesStatus;
  });

  const totalAttendu = paiements.reduce((sum, p) => sum + p.montant, 0);
  const totalPercu = paiements.reduce((sum, p) => sum + p.montantPaye, 0);
  const tauxRecouvrement = ((totalPercu / totalAttendu) * 100).toFixed(1);
  const nombreImpayes = paiements.filter(p => p.status === 'Impayé').length;
  const savePaiement = async (values: Record<string, string>) => {
    setSubmitting(true); setSubmitError('');
    try {
      if (!values.etudiantId || !values.montant) throw new Error('L’étudiant et le montant sont obligatoires.');
      await paiementsService.create({ etudiantId: Number(values.etudiantId), type: values.type.trim(), montant: Number(values.montant), montantTotal: Number(values.montantTotal) || Number(values.montant) });
      setModalOpen(false); await reload();
    } catch (requestError: any) { setSubmitError(requestError?.response?.data?.error || requestError?.message || 'Impossible d’enregistrer le paiement.'); }
    finally { setSubmitting(false); }
  };

  return (
    <div className="space-y-6">
      {/* En-tête */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Gestion des Paiements</h1>
          <p className="mt-2 text-gray-600">Suivez les paiements et frais de scolarité</p>
        </div>
        <div className="flex gap-2">
          <button className="inline-flex items-center gap-2 px-4 py-2 bg-white text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors font-medium shadow-sm">
            <Download className="h-5 w-5" />
            Exporter
          </button>
          <button type="button" onClick={() => { setSubmitError(''); setModalOpen(true); }} className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium shadow-sm">
            <Plus className="h-5 w-5" />
            Enregistrer paiement
          </button>
        </div>
      </div>

      {/* Statistiques */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total attendu</p>
              <p className="text-xl font-bold text-gray-900 mt-1">{formatMontant(totalAttendu)}</p>
            </div>
            <DollarSign className="h-8 w-8 text-blue-500" />
          </div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total perçu</p>
              <p className="text-xl font-bold text-green-600 mt-1">{formatMontant(totalPercu)}</p>
            </div>
            <TrendingUp className="h-8 w-8 text-green-500" />
          </div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Taux recouvrement</p>
              <p className="text-2xl font-bold text-purple-600 mt-1">{tauxRecouvrement}%</p>
            </div>
            <CheckCircle className="h-8 w-8 text-purple-500" />
          </div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Impayés</p>
              <p className="text-2xl font-bold text-red-600 mt-1">{nombreImpayes}</p>
            </div>
            <AlertCircle className="h-8 w-8 text-red-500" />
          </div>
        </div>
      </div>

      {/* Filtres et recherche */}
      <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Rechercher un étudiant..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
            />
          </div>
          <div className="flex items-center gap-2">
            <Filter className="h-5 w-5 text-gray-400" />
            <select
              value={selectedClasse}
              onChange={(e) => setSelectedClasse(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
            >
              <option>Tous</option>
              {classes.map((classe) => <option key={classe}>{classe}</option>)}
            </select>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
            >
              <option>Tous</option>
              {statuses.map((status) => <option key={status}>{status}</option>)}
            </select>
          </div>
          {modalOpen && <CrudModal
            title="Enregistrer un paiement"
            fields={[
              { name: 'etudiantId', label: 'Étudiant', type: 'select', required: true, options: etudiants.map((etudiant) => ({ value: String(etudiant.id), label: `${etudiant.nom} ${etudiant.prenoms} (${etudiant.matricule})` })) },
              { name: 'type', label: 'Type de versement', required: true, placeholder: 'Ex. Scolarité' },
              { name: 'montantTotal', label: 'Montant total dû', type: 'number', required: true },
              { name: 'montant', label: 'Montant payé', type: 'number', required: true },
            ]}
            error={submitError}
            submitting={submitting}
            onClose={() => setModalOpen(false)}
            onSubmit={savePaiement}
          />}
        </div>
      </div>

      {/* Tableau des paiements */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  Étudiant
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  Classe
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  Type
                </th>
                <th className="px-6 py-4 text-right text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  Montant dû
                </th>
                <th className="px-6 py-4 text-right text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  Montant payé
                </th>
                <th className="px-6 py-4 text-right text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  Reste
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  Échéance
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  Méthode
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  Status
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredPaiements.map((paiement) => {
                const reste = paiement.montant - paiement.montantPaye;
                return (
                  <tr key={paiement.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4">
                      <div>
                        <div className="font-medium text-gray-900">{paiement.etudiant}</div>
                        <div className="text-sm text-gray-500 font-mono">{paiement.matricule}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900">
                      {paiement.classe}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-700">
                      {paiement.type}
                    </td>
                    <td className="px-6 py-4 text-right text-sm font-semibold text-gray-900">
                      {formatMontant(paiement.montant)}
                    </td>
                    <td className="px-6 py-4 text-right text-sm font-semibold text-green-600">
                      {formatMontant(paiement.montantPaye)}
                    </td>
                    <td className="px-6 py-4 text-right text-sm font-semibold text-red-600">
                      {formatMontant(reste)}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-700">
                      {new Date(paiement.dateEcheance).toLocaleDateString('fr-FR')}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-700">
                      {paiement.methode || '-'}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex px-3 py-1 text-xs font-semibold rounded-full ${getStatusColor(paiement.status)}`}>
                        {paiement.status}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Alerte impayés */}
      {nombreImpayes > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex gap-3">
            <AlertCircle className="h-6 w-6 text-red-600 flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="font-semibold text-red-900 mb-1">Attention : Frais impayés</h3>
              <p className="text-sm text-red-800">
                <strong>{nombreImpayes} étudiant(s)</strong> n'ont pas encore réglé leurs frais de scolarité. Relances à effectuer.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
