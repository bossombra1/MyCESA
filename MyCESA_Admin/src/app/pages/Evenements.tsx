import { useMemo, useState } from 'react';
import { Plus, Search, Edit, Trash2, Calendar, Users, School, Layers } from 'lucide-react';
import { useApiData } from '../../hooks/useApiData';
import { evenementsService, classesService, filieresService } from '../../services';
import EvenementFormModal from '../components/EvenementFormModal';

export default function Evenements() {
  const { data: evenements, loading, error, reload } = useApiData<any[]>(evenementsService.getAll, []);
  const { data: classes } = useApiData<any[]>(classesService.getAll, []);
  const { data: filieres } = useApiData<any[]>(filieresService.getAll, []);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState('Tous');
  const [modal, setModal] = useState<'create' | 'edit' | null>(null);
  const [editing, setEditing] = useState<any>(null);
  const [submitError, setSubmitError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const classeParId = useMemo(() => new Map(classes.map((c: any) => [c.id, c.nom])), [classes]);
  const filiereParId = useMemo(() => new Map(filieres.map((f: any) => [f.id, f.nom])), [filieres]);

  const libellePortee = (event: any) => {
    if (event.pourTous) return { texte: 'Tous les étudiants', icone: Users };
    if (event.idClasse) return { texte: classeParId.get(event.idClasse) || `Classe #${event.idClasse}`, icone: School };
    if (event.idFiliere) return { texte: filiereParId.get(event.idFiliere) || `Filière #${event.idFiliere}`, icone: Layers };
    return { texte: 'Tous les étudiants', icone: Users };
  };

  const normalizedQuery = searchQuery.trim().toLowerCase();
  const eventTypes = Array.from(new Set(evenements.map((event) => event.type).filter(Boolean))).sort();
  const filteredEvents = evenements.filter(event => {
    const matchesSearch = [event.title, event.description, event.type]
      .some((value) => String(value || '').toLowerCase().includes(normalizedQuery));
    const matchesType = selectedType === 'Tous' || event.type === selectedType;
    return matchesSearch && matchesType;
  });

  const openCreate = () => { setEditing(null); setSubmitError(''); setModal('create'); };
  const openEdit = (event: any) => { setEditing(event); setSubmitError(''); setModal('edit'); };

  const saveEvent = async (values: Record<string, string>) => {
    setSubmitting(true); setSubmitError('');
    try {
      const payload = {
        title: values.title,
        description: values.description,
        date: values.date,
        type: values.type,
        pourTous: values.pourTous === 'true',
        idClasse: values.idClasse ? Number(values.idClasse) : null,
        idFiliere: values.idFiliere ? Number(values.idFiliere) : null,
      };
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

      {submitError && !modal && <div className="text-center py-3 text-red-600 bg-red-50 border rounded-lg">{submitError}</div>}
      {loading && <div className="text-center py-8 text-gray-500">Chargement...</div>}
      {error && <div className="text-center py-4 text-red-600 bg-red-50 border rounded-lg">{error}</div>}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {filteredEvents.map((event) => {
          const portee = libellePortee(event);
          const IconePortee = portee.icone;
          return (
            <div key={event.id} className="bg-white rounded-lg border border-gray-200 p-5 hover:shadow-md">
              <div className="flex items-start justify-between gap-3 mb-2">
                <h3 className="font-bold text-gray-900">{event.title || 'Sans titre'}</h3>
              </div>
              <div className="flex flex-wrap items-center gap-2 mb-3">
                <span className="inline-block px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
                  {event.type || 'Autre'}
                </span>
                <span className="inline-flex items-center gap-1 px-2 py-1 text-xs font-semibold rounded-full bg-gray-100 text-gray-700">
                  <IconePortee className="h-3.5 w-3.5" />
                  {portee.texte}
                </span>
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-600 mb-2">
                <Calendar className="h-4 w-4" />
                {event.date ? new Date(event.date).toLocaleString('fr-FR', { dateStyle: 'medium', timeStyle: 'short' }) : 'Date non définie'}
              </div>
              {event.description && <p className="text-sm text-gray-600 mb-3">{event.description}</p>}
              <div className="flex gap-2 mt-4 pt-3 border-t border-gray-200">
                <button type="button" onClick={() => openEdit(event)} className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-2 bg-blue-50 text-blue-600 rounded text-sm hover:bg-blue-100"><Edit className="h-3.5 w-3.5" />Modifier</button>
                <button type="button" onClick={() => removeEvent(event)} className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-2 bg-red-50 text-red-600 rounded text-sm hover:bg-red-100"><Trash2 className="h-3.5 w-3.5" />Supprimer</button>
              </div>
            </div>
          );
        })}
      </div>

      {!loading && filteredEvents.length === 0 && (
        <div className="text-center py-12 bg-white rounded-lg border">
          <Calendar className="mx-auto h-12 w-12 text-gray-400 mb-2" />
          <p className="text-gray-900 font-medium">Aucun événement trouvé</p>
        </div>
      )}

      {modal && <EvenementFormModal
        mode={modal}
        event={editing}
        error={submitError}
        submitting={submitting}
        onClose={() => setModal(null)}
        onSubmit={saveEvent}
      />}
    </div>
  );
}