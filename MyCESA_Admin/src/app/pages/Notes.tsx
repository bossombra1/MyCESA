import { useState } from 'react';
import { Plus, Search, FileText } from 'lucide-react';
import { useApiData } from '../../hooks/useApiData';
import CrudModal from '../components/CrudModal';
import { etudiantsService, matieresService, notesService } from '../../services';

export default function Notes() {
  const { data: notes, loading, error, reload } = useApiData<any[]>(notesService.getAll, []);
  const { data: etudiants } = useApiData<any[]>(etudiantsService.getAll, []);
  const { data: matieres } = useApiData<any[]>(matieresService.getAll, []);
  const [searchQuery, setSearchQuery] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const normalizedQuery = searchQuery.trim().toLowerCase();
  const filteredNotes = notes.filter((note) => [note.etudiant, note.matricule, note.matiere, note.semestre]
    .some((value) => String(value || '').toLowerCase().includes(normalizedQuery)));
  const noteValues = notes.map((note) => Number(note.note)).filter(Number.isFinite);
  const average = noteValues.length ? (noteValues.reduce((sum, note) => sum + note, 0) / noteValues.length).toFixed(2) : '--';
  const saveNote = async (values: Record<string, string>) => {
    setSubmitting(true); setSubmitError('');
    try {
      if (!values.etudiantId || !values.matiereId || values.note === '') throw new Error('L’étudiant, la matière et la note sont obligatoires.');
      await notesService.create({ etudiantId: Number(values.etudiantId), matiereId: Number(values.matiereId), note: Number(values.note), semestreId: Number(values.semestre) || 1, type: values.type || 'Devoir', coef: Number(values.coef) || 1 });
      setModalOpen(false); await reload();
    } catch (requestError: any) { setSubmitError(requestError?.response?.data?.error || requestError?.message || 'Impossible d’enregistrer la note.'); }
    finally { setSubmitting(false); }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Gestion des Notes</h1>
          <p className="mt-2 text-gray-600">Gérez les notes et évaluations des étudiants</p>
        </div>
        <button type="button" onClick={() => { setSubmitError(''); setModalOpen(true); }} className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium shadow-sm">
          <Plus className="h-5 w-5" />
          Nouvelle note
        </button>
      </div>

      <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
          <input
            type="text"
            placeholder="Rechercher une note..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total notes</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">{notes.length}</p>
            </div>
            <FileText className="h-8 w-8 text-blue-500" />
          </div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Moyenne générale</p>
              <p className="text-2xl font-bold text-green-600 mt-1">{average}</p>
            </div>
            <FileText className="h-8 w-8 text-green-500" />
          </div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Meilleure note</p>
              <p className="text-2xl font-bold text-purple-600 mt-1">--</p>
            </div>
            <FileText className="h-8 w-8 text-purple-500" />
          </div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Note minimale</p>
              <p className="text-2xl font-bold text-orange-600 mt-1">--</p>
            </div>
            <FileText className="h-8 w-8 text-orange-500" />
          </div>
        </div>
      </div>

      {error && <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-red-700">{error}</div>}
      <div className="overflow-hidden rounded-lg border border-gray-200 bg-white">
        {loading ? <div className="py-12 text-center text-gray-500">Chargement...</div> : filteredNotes.length === 0 ? (
          <div className="py-12 text-center text-gray-500"><FileText className="mx-auto mb-4 h-12 w-12 text-gray-300" /><p>Aucune note enregistrée</p></div>
        ) : <table className="min-w-full divide-y divide-gray-200"><thead className="bg-gray-50"><tr><th className="px-6 py-3 text-left text-xs uppercase text-gray-500">Étudiant</th><th className="px-6 py-3 text-left text-xs uppercase text-gray-500">Matière</th><th className="px-6 py-3 text-left text-xs uppercase text-gray-500">Note</th><th className="px-6 py-3 text-left text-xs uppercase text-gray-500">Semestre</th></tr></thead><tbody className="divide-y divide-gray-200">{filteredNotes.map((note) => <tr key={note.id}><td className="px-6 py-4 text-sm text-gray-900">{note.etudiant || note.matricule}</td><td className="px-6 py-4 text-sm text-gray-700">{note.matiere}</td><td className="px-6 py-4 text-sm font-semibold text-gray-900">{note.note ?? '-'}</td><td className="px-6 py-4 text-sm text-gray-700">{note.semestre || '-'}</td></tr>)}</tbody></table>}
      </div>
      {modalOpen && <CrudModal
        title="Nouvelle note"
        fields={[
          { name: 'etudiantId', label: 'Étudiant', type: 'select', required: true, options: etudiants.map((etudiant) => ({ value: String(etudiant.id), label: `${etudiant.nom} ${etudiant.prenoms} (${etudiant.matricule})` })) },
          { name: 'matiereId', label: 'Matière', type: 'select', required: true, options: matieres.map((matiere) => ({ value: String(matiere.id), label: matiere.nom })) },
          { name: 'note', label: 'Note', type: 'number', required: true },
          { name: 'semestre', label: 'Semestre', type: 'number', required: true },
          { name: 'type', label: 'Type', placeholder: 'Ex. Devoir' },
          { name: 'coef', label: 'Coefficient', type: 'number' },
        ]}
        error={submitError}
        submitting={submitting}
        onClose={() => setModalOpen(false)}
        onSubmit={saveNote}
      />}
    </div>
  );
}
