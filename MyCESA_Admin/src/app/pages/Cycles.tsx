import { useState } from 'react';
import { Plus, Search, CircleDot, GraduationCap, Calendar, Building2, Edit, Trash2 } from 'lucide-react';
import { useApiData } from '../../hooks/useApiData';
import CrudModal from '../components/CrudModal';
import { cyclesService, sitesService } from '../../services';

const getColorClasses = (color: string) => {
  const colors: Record<string, { bg: string; text: string; badge: string }> = {
    blue: { bg: 'bg-blue-100', text: 'text-blue-600', badge: 'bg-blue-500' },
    purple: { bg: 'bg-purple-100', text: 'text-purple-600', badge: 'bg-purple-500' },
    green: { bg: 'bg-green-100', text: 'text-green-600', badge: 'bg-green-500' },
    orange: { bg: 'bg-orange-100', text: 'text-orange-600', badge: 'bg-orange-500' },
    red: { bg: 'bg-red-100', text: 'text-red-600', badge: 'bg-red-500' },
  };
  return colors[color] || colors.blue;
};

export default function Cycles() {
  const { data: cycles, loading, error, reload } = useApiData<any[]>(cyclesService.getAll, []);
  const { data: sites } = useApiData<any[]>(sitesService.getAll, []);
  const [searchQuery, setSearchQuery] = useState('');
  const [modal, setModal] = useState<'create' | 'edit' | null>(null);
  const [editing, setEditing] = useState<any>(null);
  const [submitError, setSubmitError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const normalizedQuery = searchQuery.trim().toLowerCase();
  const filteredCycles = cycles.filter(cycle =>
    String(cycle.nom || '').toLowerCase().includes(normalizedQuery) ||
    String(cycle.code || '').toLowerCase().includes(normalizedQuery) ||
    String(cycle.site || '').toLowerCase().includes(normalizedQuery)
  );
  const openCreate = () => { setEditing(null); setSubmitError(''); setModal('create'); };
  const openEdit = (cycle: any) => { setEditing(cycle); setSubmitError(''); setModal('edit'); };
  const saveCycle = async (values: Record<string, string>) => {
    setSubmitting(true); setSubmitError('');
    try {
      if (!values.nom.trim()) throw new Error('Le nom du cycle est obligatoire.');
      const payload = { nom: values.nom.trim(), siteId: values.siteId ? Number(values.siteId) : null };
      if (modal === 'edit') await cyclesService.update(editing.id, payload); else await cyclesService.create(payload);
      setModal(null); await reload();
    } catch (requestError: any) { setSubmitError(requestError?.response?.data?.error || requestError?.message || 'Impossible d’enregistrer le cycle.'); }
    finally { setSubmitting(false); }
  };
  const removeCycle = async (cycle: any) => {
    if (!window.confirm(`Supprimer le cycle « ${cycle.nom} » ?`)) return;
    try { await cyclesService.delete(cycle.id); await reload(); }
    catch (requestError: any) { setSubmitError(requestError?.response?.data?.error || 'Impossible de supprimer le cycle.'); }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Gestion des Cycles</h1>
          <p className="mt-2 text-gray-600">Gérez les cycles de formation de l'établissement</p>
        </div>
        <button type="button" onClick={openCreate} className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium shadow-sm">
          <Plus className="h-5 w-5" />
          Nouveau cycle
        </button>
      </div>

      {error && <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">{error}</div>}

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total cycles</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">{cycles.length}</p>
            </div>
            <CircleDot className="h-8 w-8 text-blue-500" />
          </div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Sites associés</p>
              <p className="text-2xl font-bold text-green-600 mt-1">{new Set(cycles.map(c => c.site)).size}</p>
            </div>
            <Building2 className="h-8 w-8 text-green-500" />
          </div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Dernier cycle</p>
              <p className="text-lg font-semibold text-purple-600 mt-1">{cycles.length > 0 ? cycles[cycles.length - 1].nom : '-'}</p>
            </div>
            <Calendar className="h-8 w-8 text-purple-500" />
          </div>
        </div>
      </div>

      <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
          <input
            type="text"
            placeholder="Rechercher un cycle..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {loading ? (
          <div className="col-span-full flex items-center justify-center py-12">
            <div className="flex items-center gap-3 text-gray-500">
              <div className="h-8 w-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
              Chargement...
            </div>
          </div>
        ) : filteredCycles.length === 0 ? (
          <div className="col-span-full text-center py-12 text-gray-500">
            <GraduationCap className="h-12 w-12 mx-auto mb-4 text-gray-300" />
            <p>Aucun cycle trouvé</p>
          </div>
        ) : (
          filteredCycles.map((cycle) => {
            const colors = getColorClasses(String(cycle.code || 'blue').toLowerCase());
            return (
              <div key={cycle.id} className="bg-white rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
                <div className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className={`${colors.bg} rounded-lg p-3`}>
                      <CircleDot className={`h-8 w-8 ${colors.text}`} />
                    </div>
                    <span className={`inline-flex px-3 py-1 text-xs font-semibold rounded-full ${colors.bg} ${colors.text}`}>
                      {cycle.code}
                    </span>
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-1">{cycle.nom}</h3>
                  <p className="text-sm text-gray-500 mb-4">{cycle.site ? `Site: ${cycle.site}` : 'Sans site'}</p>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-gray-400">ID:</span>
                    <span className="text-xs font-mono text-gray-500">{cycle.id}</span>
                  </div>
                  <div className="mt-4 flex gap-2 border-t border-gray-200 pt-3">
                    <button type="button" onClick={() => openEdit(cycle)} className="flex-1 inline-flex items-center justify-center gap-2 rounded-lg bg-blue-50 px-3 py-2 text-sm text-blue-600 hover:bg-blue-100"><Edit className="h-4 w-4" />Modifier</button>
                    <button type="button" onClick={() => removeCycle(cycle)} className="flex-1 inline-flex items-center justify-center gap-2 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600 hover:bg-red-100"><Trash2 className="h-4 w-4" />Supprimer</button>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
      {modal && <CrudModal
        title={modal === 'edit' ? 'Modifier le cycle' : 'Nouveau cycle'}
        initialValues={{ nom: editing?.nom || '', siteId: String(editing?.siteId || '') }}
        fields={[
          { name: 'nom', label: 'Nom du cycle', required: true, placeholder: 'Ex. Licence' },
          { name: 'siteId', label: 'Site', type: 'select', options: sites.map((site) => ({ value: String(site.id), label: site.nom })) },
        ]}
        error={submitError}
        submitting={submitting}
        onClose={() => setModal(null)}
        onSubmit={saveCycle}
      />}
    </div>
  );
}