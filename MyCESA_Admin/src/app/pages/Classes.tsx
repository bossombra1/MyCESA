import { useState } from 'react';
import { Plus, Search, Edit, Trash2, School, Users, BookOpen } from 'lucide-react';
import { useApiData } from '../../hooks/useApiData';
import CrudModal from '../components/CrudModal';
import { classesService, filieresService } from '../../services';

export default function Classes() {
  const { data: classes, loading, error, reload } = useApiData<any[]>(classesService.getAll, []);
  const { data: filieres } = useApiData<any[]>(filieresService.getAll, []);
  const [searchQuery, setSearchQuery] = useState('');
  const [modal, setModal] = useState<'create' | 'edit' | null>(null);
  const [editing, setEditing] = useState<any>(null);
  const [submitError, setSubmitError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Données du service : { id, nom, filiere, filiereId, cycle, effectif, capaciteMax }
  const normalizedQuery = searchQuery.trim().toLowerCase();
  const filteredClasses = classes.filter(classe =>
    String(classe.nom || '').toLowerCase().includes(normalizedQuery) ||
    String(classe.filiere || '').toLowerCase().includes(normalizedQuery) ||
    String(classe.cycle || '').toLowerCase().includes(normalizedQuery)
  );

  const openCreate = () => { setEditing(null); setSubmitError(''); setModal('create'); };
  const openEdit = (classe: any) => { setEditing(classe); setSubmitError(''); setModal('edit'); };
  const saveClass = async (values: Record<string, string>) => {
    setSubmitting(true); setSubmitError('');
    try {
      const payload = { nom: values.nom.trim(), capaciteMax: Number(values.capaciteMax) || 0, filiereId: values.filiereId ? Number(values.filiereId) : null };
      if (!payload.nom) throw new Error('Le nom de la classe est obligatoire.');
      if (modal === 'edit') await classesService.update(editing.id, payload);
      else await classesService.create(payload);
      setModal(null); await reload();
    } catch (requestError: any) {
      setSubmitError(requestError?.response?.data?.error || requestError?.message || 'Impossible d’enregistrer la classe.');
    } finally { setSubmitting(false); }
  };
  const removeClass = async (classe: any) => {
    if (!window.confirm(`Supprimer la classe « ${classe.nom} » ?`)) return;
    try { await classesService.delete(classe.id); await reload(); }
    catch (requestError: any) { setSubmitError(requestError?.response?.data?.error || 'Impossible de supprimer la classe.'); }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Gestion des Classes</h1>
          <p className="mt-2 text-gray-600">Organisez les classes et leurs effectifs</p>
        </div>
        <button type="button" onClick={openCreate} className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium shadow-sm">
          <Plus className="h-5 w-5" />
          Nouvelle classe
        </button>
      </div>

      {error && <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">{error}</div>}

      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total classes</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">{classes.length}</p>
            </div>
            <School className="h-8 w-8 text-blue-500" />
          </div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Effectif total</p>
              <p className="text-2xl font-bold text-green-600 mt-1">{classes.reduce((s, c) => s + (c.effectif || 0), 0)}</p>
            </div>
            <Users className="h-8 w-8 text-green-500" />
          </div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Capacité</p>
              <p className="text-2xl font-bold text-purple-600 mt-1">{classes.reduce((s, c) => s + (c.capaciteMax || 0), 0)}</p>
            </div>
            <School className="h-8 w-8 text-purple-500" />
          </div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Avec filière</p>
              <p className="text-2xl font-bold text-orange-600 mt-1">{classes.filter(c => c.filiere).length}</p>
            </div>
            <BookOpen className="h-8 w-8 text-orange-500" />
          </div>
        </div>
      </div>

      <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
          <input
            type="text"
            placeholder="Rechercher une classe..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {loading ? (
          <div className="col-span-full flex items-center justify-center py-12 text-gray-500">Chargement...</div>
        ) : filteredClasses.length === 0 ? (
          <div className="col-span-full text-center py-12 text-gray-500">
            <School className="h-12 w-12 mx-auto mb-4 text-gray-300" />
            <p>Aucune classe trouvée</p>
          </div>
        ) : (
          filteredClasses.map((classe) => (
            <div key={classe.id} className="bg-white rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
              <div className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="h-12 w-12 rounded-lg bg-green-100 flex items-center justify-center">
                    <School className="h-6 w-6 text-green-600" />
                  </div>
                  <span className="inline-flex px-3 py-1 text-xs font-semibold rounded-full bg-gray-100 text-gray-600">#{classe.id}</span>
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">{classe.nom}</h3>
                <div className="space-y-1 text-sm">
                  {classe.filiere && <p className="text-gray-600">Filière: {classe.filiere}</p>}
                  {classe.cycle && <p className="text-gray-600">Cycle: {classe.cycle}</p>}
                </div>
                <div className="mt-4 pt-3 border-t border-gray-200 grid grid-cols-2 gap-4">
                  <div className="text-center p-2 bg-gray-50 rounded">
                    <p className="text-lg font-bold text-gray-900">{classe.effectif || 0}</p>
                    <p className="text-xs text-gray-600">Effectif</p>
                  </div>
                  <div className="text-center p-2 bg-gray-50 rounded">
                    <p className="text-lg font-bold text-gray-900">{classe.capaciteMax || 0}</p>
                    <p className="text-xs text-gray-600">Capacité</p>
                  </div>
                </div>
                <div className="mt-4 pt-3 border-t border-gray-200 flex gap-2">
                  <button type="button" onClick={() => openEdit(classe)} className="flex-1 inline-flex items-center justify-center gap-2 px-3 py-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 text-sm">
                    <Edit className="h-4 w-4" /> Modifier
                  </button>
                  <button type="button" onClick={() => removeClass(classe)} className="flex-1 inline-flex items-center justify-center gap-2 px-3 py-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 text-sm">
                    <Trash2 className="h-4 w-4" /> Supprimer
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
      {modal && (
        <CrudModal
          title={modal === 'edit' ? 'Modifier la classe' : 'Nouvelle classe'}
          initialValues={{ nom: editing?.nom || '', capaciteMax: String(editing?.capaciteMax || ''), filiereId: String(editing?.filiereId || '') }}
          fields={[
            { name: 'nom', label: 'Nom de la classe', required: true, placeholder: 'Ex. Licence 3 Informatique' },
            { name: 'capaciteMax', label: 'Capacité maximale', type: 'number', required: true },
            { name: 'filiereId', label: 'Filière', type: 'select', options: filieres.map((filiere) => ({ value: String(filiere.id), label: filiere.nom })) },
          ]}
          error={submitError}
          submitting={submitting}
          onClose={() => setModal(null)}
          onSubmit={saveClass}
        />
      )}
    </div>
  );
}