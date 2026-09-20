import { useState } from 'react';
import { Plus, Search, Filter, Download, UserX, TrendingDown, AlertTriangle } from 'lucide-react';
import { useApiData } from '../../hooks/useApiData';
import CrudModal from '../components/CrudModal';
import { absencesService, etudiantsService } from '../../services';

const getStatusColor = (status: string) => {
  switch (status) {
    case 'Validé': return 'bg-green-100 text-green-800';
    case 'En attente': return 'bg-yellow-100 text-yellow-800';
    case 'Signalé': return 'bg-red-100 text-red-800';
    default: return 'bg-gray-100 text-gray-800';
  }
};

const getTypeColor = (type: string) => {
  return type === 'Justifiée' ? 'bg-blue-100 text-blue-800' : 'bg-orange-100 text-orange-800';
};

export default function Absences() {
  const { data: absences, loading, error, reload } = useApiData<any[]>(absencesService.getAll, []);
  const { data: etudiants } = useApiData<any[]>(etudiantsService.getAll, []);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedClasse, setSelectedClasse] = useState('Tous');
  const [selectedType, setSelectedType] = useState('Tous');
  const [modalOpen, setModalOpen] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const classes = Array.from(new Set(absences.map((absence) => absence.classe).filter(Boolean))).sort();
  const types = Array.from(new Set(absences.map((absence) => absence.type).filter(Boolean))).sort();
  const normalizedQuery = searchQuery.trim().toLowerCase();
  const filteredAbsences = absences.filter(absence => {
    const matchesSearch = [absence.etudiant, absence.matricule, absence.matiere, absence.professeur]
      .some((value) => String(value || '').toLowerCase().includes(normalizedQuery));
    const matchesClasse = selectedClasse === 'Tous' || absence.classe === selectedClasse;
    const matchesType = selectedType === 'Tous' || absence.type === selectedType;
    return matchesSearch && matchesClasse && matchesType;
  });

  const totalHeuresAbsence = absences.reduce((sum, a) => sum + a.heures, 0);
  const absencesNonJustifiees = absences.filter(a => a.type === 'Non justifiée').length;
  const tauxAbsence = ((absences.length / 150) * 100).toFixed(1);
  const saveAbsence = async (values: Record<string, string>) => {
    setSubmitting(true); setSubmitError('');
    try {
      if (!values.etudiantId || !values.date) throw new Error('L’étudiant et la date sont obligatoires.');
      await absencesService.create({ etudiantId: Number(values.etudiantId), date: values.date, heures: Number(values.heures) || 1, justifiee: values.justifiee === 'true' });
      setModalOpen(false); await reload();
    } catch (requestError: any) { setSubmitError(requestError?.response?.data?.error || requestError?.message || 'Impossible d’enregistrer l’absence.'); }
    finally { setSubmitting(false); }
  };

  return (
    <div className="space-y-6">
      {/* En-tête */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Gestion des Absences</h1>
          <p className="mt-2 text-gray-600">Suivez les absences et retards des étudiants</p>
        </div>
        <div className="flex gap-2">
          <button className="inline-flex items-center gap-2 px-4 py-2 bg-white text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors font-medium shadow-sm">
            <Download className="h-5 w-5" />
            Exporter
          </button>
          <button type="button" onClick={() => { setSubmitError(''); setModalOpen(true); }} className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium shadow-sm">
            <Plus className="h-5 w-5" />
            Signaler absence
          </button>
        </div>
      </div>

      {/* Statistiques */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total absences</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">{absences.length}</p>
            </div>
            <UserX className="h-8 w-8 text-blue-500" />
          </div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Heures perdues</p>
              <p className="text-2xl font-bold text-orange-600 mt-1">{totalHeuresAbsence}h</p>
            </div>
            <TrendingDown className="h-8 w-8 text-orange-500" />
          </div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Non justifiées</p>
              <p className="text-2xl font-bold text-red-600 mt-1">{absencesNonJustifiees}</p>
            </div>
            <AlertTriangle className="h-8 w-8 text-red-500" />
          </div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Taux d'absence</p>
              <p className="text-2xl font-bold text-purple-600 mt-1">{tauxAbsence}%</p>
            </div>
            <div className="h-3 w-3 bg-purple-500 rounded-full"></div>
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
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
            >
              <option>Tous</option>
              {types.map((type) => <option key={type}>{type}</option>)}
            </select>
          </div>
        </div>
      </div>

      {/* Tableau des absences */}
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
                  Matière / Professeur
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  Date
                </th>
                <th className="px-6 py-4 text-center text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  Heures
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  Type
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  Motif
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  Status
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredAbsences.map((absence) => (
                <tr key={absence.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4">
                    <div>
                      <div className="font-medium text-gray-900">{absence.etudiant}</div>
                      <div className="text-sm text-gray-500 font-mono">{absence.matricule}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900">
                    {absence.classe}
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-900">{absence.matiere}</div>
                    <div className="text-xs text-gray-500">{absence.professeur}</div>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900">
                    {new Date(absence.date).toLocaleDateString('fr-FR')}
                  </td>
                  <td className="px-6 py-4 text-center">
                    <span className="text-sm font-semibold text-gray-900">{absence.heures}h</span>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex px-3 py-1 text-xs font-semibold rounded-full ${getTypeColor(absence.type)}`}>
                      {absence.type}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-700">
                    {absence.motif || '-'}
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex px-3 py-1 text-xs font-semibold rounded-full ${getStatusColor(absence.status)}`}>
                      {absence.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Étudiants à risque */}
      <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
        <div className="flex gap-3">
          <AlertTriangle className="h-6 w-6 text-orange-600 flex-shrink-0 mt-0.5" />
          <div>
            <h3 className="font-semibold text-orange-900 mb-1">Étudiants à surveiller</h3>
            <p className="text-sm text-orange-800">
              <strong>DIALLO Mamadou (ETU2024007)</strong> a accumulé <strong>2 absences non justifiées</strong> récemment. Intervention recommandée.
            </p>
          </div>
        </div>
      </div>
      {modalOpen && <CrudModal
        title="Signaler une absence"
        fields={[
          { name: 'etudiantId', label: 'Étudiant', type: 'select', required: true, options: etudiants.map((etudiant) => ({ value: String(etudiant.id), label: `${etudiant.nom} ${etudiant.prenoms} (${etudiant.matricule})` })) },
          { name: 'date', label: 'Date', type: 'text', required: true, placeholder: 'AAAA-MM-JJ' },
          { name: 'heures', label: 'Nombre d’heures', type: 'number', required: true },
          { name: 'justifiee', label: 'Justifiée', type: 'select', options: [{ value: 'false', label: 'Non justifiée' }, { value: 'true', label: 'Justifiée' }] },
        ]}
        error={submitError}
        submitting={submitting}
        onClose={() => setModalOpen(false)}
        onSubmit={saveAbsence}
      />}
    </div>
  );
}
