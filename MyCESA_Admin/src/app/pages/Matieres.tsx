import { useState } from 'react';
import { Plus, Search, Edit, Trash2, BookOpen } from 'lucide-react';
import { useApiData } from '../../hooks/useApiData';
import { matieresService } from '../../services';
import CrudModal from '../components/CrudModal';

export default function Matieres() {
  const { data: matieres, loading, error, reload } = useApiData<any[]>(matieresService.getAll, []);
  const [searchQuery, setSearchQuery] = useState('');
  const [modal, setModal] = useState<'create' | 'edit' | null>(null);
  const [editing, setEditing] = useState<any>(null);
  const [submitError, setSubmitError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Données du service : { id, nom, code }
  const normalizedQuery = searchQuery.trim().toLowerCase();
  const filteredMatieres = matieres.filter(matiere =>
    String(matiere.nom || '').toLowerCase().includes(normalizedQuery) ||
    String(matiere.code || '').toLowerCase().includes(normalizedQuery)
  );
  const openCreate = () => { setEditing(null); setSubmitError(''); setModal('create'); };
  const openEdit = (matiere: any) => { setEditing(matiere); setSubmitError(''); setModal('edit'); };
  const saveMatiere = async (values: Record<string, string>) => {
    setSubmitting(true); setSubmitError('');
    try {
      if (!values.nom.trim()) throw new Error('Le nom de la matière est obligatoire.');
      if (modal === 'edit') await matieresService.update(editing.id, { nom: values.nom.trim() }); else await matieresService.create({ nom: values.nom.trim() });
      setModal(null); await reload();
    } catch (requestError: any) { setSubmitError(requestError?.response?.data?.error || requestError?.message || 'Impossible d’enregistrer la matière.'); }
    finally { setSubmitting(false); }
  };
  const removeMatiere = async (matiere: any) => {
    if (!window.confirm(`Supprimer la matière « ${matiere.nom} » ?`)) return;
    try { await matieresService.delete(matiere.id); await reload(); }
    catch (requestError: any) { setSubmitError(requestError?.response?.data?.error || 'Impossible de supprimer la matière.'); }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Gestion des Matières</h1>
          <p className="mt-2 text-gray-600">Gérez les matières enseignées</p>
        </div>
        <button type="button" onClick={openCreate} className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium shadow-sm">
          <Plus className="h-5 w-5" />
          Nouvelle matière
        </button>
      </div>

      {error && <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">{error}</div>}

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total matières</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">{matieres.length}</p>
            </div>
            <BookOpen className="h-8 w-8 text-blue-500" />
          </div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Avec code</p>
              <p className="text-2xl font-bold text-purple-600 mt-1">{matieres.filter(m => m.code).length}</p>
            </div>
          </div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Dernière ajoutée</p>
              <p className="text-lg font-semibold text-green-600 mt-1">
                {matieres.length > 0 ? matieres[matieres.length - 1].nom : '-'}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
          <input
            type="text"
            placeholder="Rechercher une matière..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {loading ? (
          <div className="col-span-full flex items-center justify-center py-12 text-gray-500">Chargement...</div>
        ) : filteredMatieres.length === 0 ? (
          <div className="col-span-full text-center py-12 text-gray-500">
            <BookOpen className="h-12 w-12 mx-auto mb-4 text-gray-300" />
            <p>Aucune matière trouvée</p>
          </div>
        ) : (
          filteredMatieres.map((matiere) => (
            <div key={matiere.id} className="bg-white rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
              <div className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="h-12 w-12 rounded-lg bg-purple-100 flex items-center justify-center">
                    <BookOpen className="h-6 w-6 text-purple-600" />
                  </div>
                  <span className="inline-flex px-3 py-1 text-xs font-semibold rounded-full bg-gray-100 text-gray-600">
                    #{matiere.id}
                  </span>
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-1">{matiere.nom}</h3>
                <p className="text-sm text-gray-500">Code: {matiere.code || '-'}</p>
                <div className="mt-4 pt-3 border-t border-gray-200 flex gap-2">
                  <button type="button" onClick={() => openEdit(matiere)} className="flex-1 inline-flex items-center justify-center gap-2 px-3 py-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 text-sm">
                    <Edit className="h-4 w-4" /> Modifier
                  </button>
                  <button type="button" onClick={() => removeMatiere(matiere)} className="flex-1 inline-flex items-center justify-center gap-2 px-3 py-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 text-sm">
                    <Trash2 className="h-4 w-4" /> Supprimer
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
      {modal && <CrudModal
        title={modal === 'edit' ? 'Modifier la matière' : 'Nouvelle matière'}
        initialValues={{ nom: editing?.nom || '' }}
        fields={[{ name: 'nom', label: 'Nom de la matière', required: true, placeholder: 'Ex. Algorithmique' }]}
        error={submitError}
        submitting={submitting}
        onClose={() => setModal(null)}
        onSubmit={saveMatiere}
      />}
    </div>
  );
}