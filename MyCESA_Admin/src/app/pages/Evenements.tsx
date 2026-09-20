import { useState } from 'react';
import { Plus, Search, Filter, Edit, Trash2, Calendar } from 'lucide-react';
import { useApiData } from '../../hooks/useApiData';
import { evenementsService } from '../../services';
import CrudModal from '../components/CrudModal';

export default function Evenements() {
  const { data: evenements, loading, error, reload } = useApiData<any[]>(evenementsService.getAll, []);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState('Tous');
  const [modal, setModal] = useState<'create' | 'edit' | null>(null);
  const [editing, setEditing] = useState<any>(null);
  const [submitError, setSubmitError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Données du service : { id, title, description, date, type, idClasse, idFiliere, pourTous }
  const normalizedQuery = searchQuery.trim().toLowerCase();
  const eventTypes = Array.from(new Set(evenements.map((event) => event.type).filter(Boolean))).sort();
  const filteredEvents = evenements.filter(event => {
    const matchesSearch = [event.title, event.description, event.type, event.lieu]
      .some((value) => String(value || '').toLowerCase().includes(normalizedQuery));
    const matchesType = selectedType === 'Tous' || event.type === selectedType;
    return matchesSearch && matchesType;
  });
  const openCreate = () => { setEditing(null); setSubmitError(''); setModal('create'); };
  const openEdit = (event: any) => { setEditing(event); setSubmitError(''); setModal('edit'); };
  const saveEvent = async (values: Record<string, string>) => {
    setSubmitting(true); setSubmitError('');
    try {
      if (!values.title.trim() || !values.date) throw new Error('Le titre et la date sont obligatoires.');
      const payload = { title: values.title.trim(), description: values.description.trim(), date: values.date, type: values.type || 'Autre' };
      if (modal === 'edit') await evenementsService.update(editing.id, payload); else await evenementsService.create(payload);
      setModal(null); await reload();
    } catch (requestError: any) { setSubmitError(requestError?.response?.data?.error || requestError?.message || 'Impossible d’enregistrer l’événement.'); }
    finally { setSubmitting(false); }
  };
  const removeEvent = async (event: any) => {
    if (!window.confirm(`Supprimer l’événement « ${event.title} » ?`)) return;
    try { await evenementsService.delete(event.id); await reload(); }
    catch (requestError: any) { setSubmitError(requestError?.response?.data?.error || 'Impossible de supprimer l’événement.'); }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Gestion des Événements</h1>
          <p className="mt-2 text-gray-600">Gérez les événements de l'établissement</p>
        </div>
        <button type="button" onClick={openCreate} className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm">
          <Plus className="h-5 w-5" /> Nouvel événement
        </button>
      </div>

      <div className="bg-white p-4 rounded-lg shadow-sm border">
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input type="text" placeholder="Rechercher..." value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" />
          </div>
          <select value={selectedType} onChange={e => setSelectedType(e.target.value)}
            className="px-4 py-2 border rounded-lg">
            <option>Tous</option>
            {eventTypes.map((type) => <option key={type}>{type}</option>)}
          </select>
        </div>
      </div>

      {loading && <div className="text-center py-8 text-gray-500">Chargement...</div>}
      {error && <div className="text-center py-4 text-red-600 bg-red-50 border rounded-lg">{error}</div>}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {filteredEvents.map((event) => (
          <div key={event.id} className="bg-white rounded-lg border border-gray-200 p-5 hover:shadow-md">
            <h3 className="font-bold text-gray-900 mb-2">{event.title || 'Sans titre'}</h3>
            <span className="inline-block px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800 mb-3">
              {event.type || 'Autre'}
            </span>
            <div className="flex items-center gap-2 text-sm text-gray-600 mb-2">
              <Calendar className="h-4 w-4" />
              {event.date ? new Date(event.date).toLocaleDateString('fr-FR') : 'Date non définie'}
            </div>
            {event.description && <p className="text-sm text-gray-600 mb-3">{event.description}</p>}
            <div className="flex gap-2 mt-4 pt-3 border-t border-gray-200">
              <button type="button" onClick={() => openEdit(event)} className="flex-1 px-3 py-2 bg-blue-50 text-blue-600 rounded text-sm hover:bg-blue-100">Modifier</button>
              <button type="button" onClick={() => removeEvent(event)} className="flex-1 px-3 py-2 bg-red-50 text-red-600 rounded text-sm hover:bg-red-100">Supprimer</button>
            </div>
          </div>
        ))}
      </div>

      {!loading && filteredEvents.length === 0 && (
        <div className="text-center py-12 bg-white rounded-lg border">
          <Calendar className="mx-auto h-12 w-12 text-gray-400 mb-2" />
          <p className="text-gray-900 font-medium">Aucun événement trouvé</p>
        </div>
      )}
      {modal && <CrudModal
        title={modal === 'edit' ? 'Modifier l’événement' : 'Nouvel événement'}
        initialValues={{ title: editing?.title || '', description: editing?.description || '', date: editing?.date ? String(editing.date).slice(0, 16) : '', type: editing?.type || '' }}
        fields={[
          { name: 'title', label: 'Titre', required: true },
          { name: 'date', label: 'Date et heure', type: 'text', required: true, placeholder: 'AAAA-MM-JJ HH:MM:SS' },
          { name: 'type', label: 'Type', required: true, type: 'text', placeholder: 'Ex. Examen' },
          { name: 'description', label: 'Description' },
        ]}
        error={submitError}
        submitting={submitting}
        onClose={() => setModal(null)}
        onSubmit={saveEvent}
      />}
    </div>
  );
}