import { useState } from 'react';
import { Plus, Search, Edit, Trash2, Layers, BookOpen, X, Loader2 } from 'lucide-react';
import { useApiData } from '../../hooks/useApiData';
import { cyclesService, filieresService } from '../../services';

export default function Filieres() {
  const { data: filieres, loading, error, reload } = useApiData<any[]>(filieresService.getAll, []);
  const { data: cycles, loading: cyclesLoading, error: cyclesError } = useApiData<any[]>(cyclesService.getAll, []);
  const [searchQuery, setSearchQuery] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editing, setEditing] = useState<any>(null);
  const [nom, setNom] = useState('');
  const [cycleId, setCycleId] = useState('');
  const [submitError, setSubmitError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Données du service : { id, nom, code, cycleId }
  const normalizedQuery = searchQuery.trim().toLowerCase();
  const filteredFilieres = filieres.filter(filiere =>
    String(filiere.nom || '').toLowerCase().includes(normalizedQuery) ||
    String(filiere.code || '').toLowerCase().includes(normalizedQuery)
  );

  const openCreateModal = () => {
    setEditing(null);
    setNom('');
    setCycleId('');
    setSubmitError('');
    setIsModalOpen(true);
  };

  const openEditModal = (filiere: any) => {
    setEditing(filiere);
    setNom(filiere.nom || '');
    setCycleId(String(filiere.cycleId || ''));
    setSubmitError('');
    setIsModalOpen(true);
  };

  const closeCreateModal = () => {
    if (!submitting) setIsModalOpen(false);
  };

  const handleCreate = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const trimmedName = nom.trim();
    if (!trimmedName) {
      setSubmitError('Le nom de la filière est obligatoire.');
      return;
    }

    setSubmitting(true);
    setSubmitError('');
    try {
      const payload = {
        nom: trimmedName,
        cycleId: cycleId ? Number(cycleId) : null,
      };
      if (editing) await filieresService.update(editing.id, payload);
      else await filieresService.create(payload);
      setIsModalOpen(false);
      await reload();
    } catch (requestError: any) {
      setSubmitError(
        requestError?.response?.data?.error
        || requestError?.response?.data?.message
        || 'Impossible de créer la filière.'
      );
    } finally {
      setSubmitting(false);
    }
  };

  const removeFiliere = async (filiere: any) => {
    if (!window.confirm(`Supprimer la filière « ${filiere.nom} » ?`)) return;
    try {
      await filieresService.delete(filiere.id);
      await reload();
    } catch (requestError: any) {
      setSubmitError(requestError?.response?.data?.error || 'Impossible de supprimer la filière.');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Gestion des Filières</h1>
          <p className="mt-2 text-gray-600">Organisez les filières de formation</p>
        </div>
        <button
          type="button"
          onClick={openCreateModal}
          className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium shadow-sm"
        >
          <Plus className="h-5 w-5" />
          Nouvelle filière
        </button>
      </div>

      {error && <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">{error}</div>}

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total filières</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">{filieres.length}</p>
            </div>
            <Layers className="h-8 w-8 text-blue-500" />
          </div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Avec cycle</p>
              <p className="text-2xl font-bold text-green-600 mt-1">
                {filieres.filter(f => f.cycleId).length}
              </p>
            </div>
            <BookOpen className="h-8 w-8 text-green-500" />
          </div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Dernière ajoutée</p>
              <p className="text-lg font-semibold text-purple-600 mt-1">
                {filieres.length > 0 ? filieres[filieres.length - 1].nom : '-'}
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
            placeholder="Rechercher une filière..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {loading ? (
          <div className="col-span-full flex items-center justify-center py-12 text-gray-500">Chargement...</div>
        ) : filteredFilieres.length === 0 ? (
          <div className="col-span-full text-center py-12 text-gray-500">
            <Layers className="h-12 w-12 mx-auto mb-4 text-gray-300" />
            <p>Aucune filière trouvée</p>
          </div>
        ) : (
          filteredFilieres.map((filiere) => (
            <div key={filiere.id} className="bg-white rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
              <div className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="h-12 w-12 rounded-lg bg-blue-100 flex items-center justify-center">
                    <Layers className="h-6 w-6 text-blue-600" />
                  </div>
                  <span className="inline-flex px-3 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-600">
                    {filiere.code}
                  </span>
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-1">{filiere.nom}</h3>
                <p className="text-sm text-gray-500 mb-4">
                  {filiere.cycleId ? `Cycle ID: ${filiere.cycleId}` : 'Sans cycle'}
                </p>
                <div className="pt-3 border-t border-gray-200 flex gap-2">
                  <button type="button" onClick={() => openEditModal(filiere)} className="flex-1 inline-flex items-center justify-center gap-2 px-3 py-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors text-sm">
                    <Edit className="h-4 w-4" />
                    Modifier
                  </button>
                  <button type="button" onClick={() => removeFiliere(filiere)} className="flex-1 inline-flex items-center justify-center gap-2 px-3 py-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors text-sm">
                    <Trash2 className="h-4 w-4" />
                    Supprimer
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {isModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4"
          role="presentation"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) closeCreateModal();
          }}
        >
          <div
            className="w-full max-w-md rounded-xl bg-white shadow-2xl"
            role="dialog"
            aria-modal="true"
            aria-labelledby="new-filiere-title"
          >
            <div className="flex items-center justify-between border-b border-gray-200 px-6 py-4">
              <div>
                <h2 id="new-filiere-title" className="text-lg font-semibold text-gray-900">{editing ? 'Modifier la filière' : 'Nouvelle filière'}</h2>
                <p className="mt-1 text-sm text-gray-500">Ajoutez une filière de formation.</p>
              </div>
              <button
                type="button"
                onClick={closeCreateModal}
                disabled={submitting}
                aria-label="Fermer"
                className="rounded-lg p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-600 disabled:opacity-50"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleCreate} className="space-y-5 p-6">
              {submitError && (
                <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700" role="alert">
                  {submitError}
                </div>
              )}

              <div>
                <label htmlFor="filiere-nom" className="mb-1.5 block text-sm font-medium text-gray-700">
                  Nom de la filière
                </label>
                <input
                  id="filiere-nom"
                  type="text"
                  value={nom}
                  onChange={(event) => setNom(event.target.value)}
                  placeholder="Ex. Informatique de gestion"
                  autoFocus
                  required
                  className="w-full rounded-lg border border-gray-300 px-3 py-2.5 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                />
              </div>

              <div>
                <label htmlFor="filiere-cycle" className="mb-1.5 block text-sm font-medium text-gray-700">
                  Cycle <span className="font-normal text-gray-400">(facultatif)</span>
                </label>
                <select
                  id="filiere-cycle"
                  value={cycleId}
                  onChange={(event) => setCycleId(event.target.value)}
                  disabled={cyclesLoading || submitting}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2.5 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                >
                  <option value="">Sélectionner un cycle</option>
                  {cycles.map((cycle) => (
                    <option key={cycle.id} value={String(cycle.id)}>
                      {cycle.nom}
                    </option>
                  ))}
                </select>
                {cyclesLoading && <p className="mt-1 text-xs text-gray-500">Chargement des cycles...</p>}
                {cyclesError && <p className="mt-1 text-xs text-red-600">Impossible de charger les cycles.</p>}
              </div>

              <div className="flex justify-end gap-3 border-t border-gray-100 pt-4">
                <button
                  type="button"
                  onClick={closeCreateModal}
                  disabled={submitting}
                  className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {submitting && <Loader2 className="h-4 w-4 animate-spin" />}
                  {submitting ? 'Enregistrement...' : editing ? 'Enregistrer les modifications' : 'Créer la filière'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}