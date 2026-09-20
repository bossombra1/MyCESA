import { useState } from 'react';
import { Plus, Search, Building2, Users, MapPin, Edit, Trash2 } from 'lucide-react';
import { useApiData } from '../../hooks/useApiData';
import { sallesService } from '../../services';
import CrudModal from '../components/CrudModal';

export default function Salles() {
  const { data: salles, loading, error, reload } = useApiData<any[]>(sallesService.getAll, []);
  const [searchQuery, setSearchQuery] = useState('');
  const [modal, setModal] = useState<'create' | 'edit' | null>(null);
  const [editing, setEditing] = useState<any>(null);
  const [submitError, setSubmitError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Données du service : { id, nom, code, localisation, superficie }
  const normalizedQuery = searchQuery.trim().toLowerCase();
  const filteredSalles = salles.filter(salle =>
    String(salle.nom || '').toLowerCase().includes(normalizedQuery) ||
    String(salle.code || '').toLowerCase().includes(normalizedQuery) ||
    String(salle.localisation || '').toLowerCase().includes(normalizedQuery)
  );

  const openCreate = () => { setEditing(null); setSubmitError(''); setModal('create'); };
  const openEdit = (salle: any) => { setEditing(salle); setSubmitError(''); setModal('edit'); };
  const saveSalle = async (values: Record<string, string>) => {
    setSubmitting(true); setSubmitError('');
    try {
      if (!values.nom.trim()) throw new Error('Le nom de la salle est obligatoire.');
      const payload = { nom: values.nom.trim(), localisation: values.localisation.trim(), superficie: values.superficie ? Number(values.superficie) : null };
      if (modal === 'edit') await sallesService.update(editing.id, payload); else await sallesService.create(payload);
      setModal(null); await reload();
    } catch (requestError: any) { setSubmitError(requestError?.response?.data?.error || requestError?.message || 'Impossible d’enregistrer la salle.'); }
    finally { setSubmitting(false); }
  };
  const removeSalle = async (salle: any) => {
    if (!window.confirm(`Supprimer la salle « ${salle.nom} » ?`)) return;
    try { await sallesService.delete(salle.id); await reload(); }
    catch (requestError: any) { setSubmitError(requestError?.response?.data?.error || 'Impossible de supprimer la salle.'); }
  };

  const totalCapacite = salles.reduce((sum, s) => sum + (parseInt(s.supeficie) || parseInt(s.supeficie_Salle) || 0), 0);
  // Use superficie from the actual DB columns
  const totalSuperficie = salles.reduce((sum, s) => {
    const val = s.Superficie_Salle || s.supeficie || s.supeficie_Salle || '0';
    return sum + (parseInt(val) || 0);
  }, 0);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Gestion des Salles</h1>
          <p className="mt-2 text-gray-600">Gérez les salles et leurs équipements</p>
        </div>
        <button type="button" onClick={openCreate} className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium shadow-sm">
          <Plus className="h-5 w-5" />
          Nouvelle salle
        </button>
      </div>

      {error && <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">{error}</div>}

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total salles</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">{salles.length}</p>
            </div>
            <Building2 className="h-8 w-8 text-blue-500" />
          </div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Superficie totale</p>
              <p className="text-2xl font-bold text-purple-600 mt-1">{totalSuperficie} m²</p>
            </div>
            <MapPin className="h-8 w-8 text-purple-500" />
          </div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">En service</p>
              <p className="text-2xl font-bold text-green-600 mt-1">{salles.length}</p>
            </div>
            <Users className="h-8 w-8 text-green-500" />
          </div>
        </div>
      </div>

      <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
          <input
            type="text"
            placeholder="Rechercher une salle..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {loading ? (
          <div className="col-span-full flex items-center justify-center py-12 text-gray-500">Chargement...</div>
        ) : filteredSalles.length === 0 ? (
          <div className="col-span-full text-center py-12 text-gray-500">
            <Building2 className="h-12 w-12 mx-auto mb-4 text-gray-300" />
            <p>Aucune salle trouvée</p>
          </div>
        ) : (
          filteredSalles.map((salle) => (
            <div key={salle.id} className="bg-white rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
              <div className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="h-12 w-12 rounded-lg bg-blue-100 flex items-center justify-center">
                    <Building2 className="h-6 w-6 text-blue-600" />
                  </div>
                  <span className="inline-flex px-3 py-1 text-xs font-semibold rounded-full bg-gray-100 text-gray-600">
                    #{salle.id}
                  </span>
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-1">{salle.nom}</h3>
                <p className="text-sm text-gray-500 mb-1">
                  {salle.Localisation_Salle || salle.localisation || salle.code || ''}
                </p>
                <div className="flex items-center gap-4 mt-4 text-sm text-gray-600">
                  {salle.Superfice_Salle || salle.supeficie || salle.supeficie_Salle ? (
                    <span>
                      <MapPin className="h-4 w-4 text-gray-400 inline mr-1" />
                      {parseInt(salle.Superfice_Salle || salle.supeficie || salle.supeficie_Salle) || 0} m²
                    </span>
                  ) : null}
                </div>
                <div className="mt-4 flex gap-2 border-t border-gray-200 pt-3">
                  <button type="button" onClick={() => openEdit(salle)} className="flex-1 inline-flex items-center justify-center gap-2 rounded-lg bg-blue-50 px-3 py-2 text-sm text-blue-600 hover:bg-blue-100"><Edit className="h-4 w-4" />Modifier</button>
                  <button type="button" onClick={() => removeSalle(salle)} className="flex-1 inline-flex items-center justify-center gap-2 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600 hover:bg-red-100"><Trash2 className="h-4 w-4" />Supprimer</button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
      {modal && <CrudModal
        title={modal === 'edit' ? 'Modifier la salle' : 'Nouvelle salle'}
        initialValues={{ nom: editing?.nom || '', localisation: editing?.localisation || '', superficie: String(editing?.superficie || '') }}
        fields={[
          { name: 'nom', label: 'Nom de la salle', required: true, placeholder: 'Ex. Salle A1' },
          { name: 'localisation', label: 'Localisation', placeholder: 'Ex. Bâtiment principal' },
          { name: 'superficie', label: 'Superficie (m²)', type: 'number' },
        ]}
        error={submitError}
        submitting={submitting}
        onClose={() => setModal(null)}
        onSubmit={saveSalle}
      />}
    </div>
  );
}