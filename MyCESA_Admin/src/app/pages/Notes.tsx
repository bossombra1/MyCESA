import { useMemo, useState } from 'react';
import { Plus, Search, FileText, Eye, Users, Award, Sigma } from 'lucide-react';
import { useApiData } from '../../hooks/useApiData';
import CrudModal from '../components/CrudModal';
import NotesEtudiantModal, { moyennePonderee, tonNote, type GroupeNotes } from '../components/NotesEtudiantModal';
import { etudiantsService, matieresService, notesService } from '../../services';

export default function Notes() {
  const { data: notes, loading, error, reload } = useApiData<any[]>(notesService.getAll, []);
  const { data: etudiants } = useApiData<any[]>(etudiantsService.getAll, []);
  const { data: matieres } = useApiData<any[]>(matieresService.getAll, []);
  const [searchQuery, setSearchQuery] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [prefillEtudiantId, setPrefillEtudiantId] = useState('');
  const [detailCle, setDetailCle] = useState<string | null>(null);
  const [submitError, setSubmitError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const groupes = useMemo<GroupeNotes[]>(() => {
    const map = new Map<string, GroupeNotes>();
    notes.forEach((note) => {
      const cle = String(note.etudiantId ?? note.matricule ?? note.etudiant ?? 'inconnu');
      if (!map.has(cle)) {
        const fiche = etudiants.find((student) => String(student.id) === String(note.etudiantId) || (note.matricule && student.matricule === note.matricule));
        map.set(cle, { cle, etudiantId: note.etudiantId ?? fiche?.id ?? null, nom: fiche ? `${fiche.nom} ${fiche.prenoms}`.trim() : (note.etudiant || 'Étudiant inconnu'), matricule: fiche?.matricule || note.matricule || '—', classe: fiche?.classe || '', filiere: fiche?.filiere || '', notes: [], moyenne: null, meilleure: null, pire: null });
      }
      map.get(cle)!.notes.push(note);
    });
    return Array.from(map.values()).map((group) => {
      const values = group.notes.map((note) => Number(note.note)).filter(Number.isFinite);
      return { ...group, moyenne: moyennePonderee(group.notes), meilleure: values.length ? Math.max(...values) : null, pire: values.length ? Math.min(...values) : null };
    }).sort((a, b) => a.nom.localeCompare(b.nom));
  }, [notes, etudiants]);

  const query = searchQuery.trim().toLowerCase();
  const filtered = groupes.filter((group) => [group.nom, group.matricule, group.classe, group.filiere].some((value) => String(value || '').toLowerCase().includes(query)));
  const values = notes.map((note) => Number(note.note)).filter(Number.isFinite);
  const moyenne = moyennePonderee(notes);
  const detail = groupes.find((group) => group.cle === detailCle) || null;
  const ouvrirCreation = (etudiantId = '') => { setPrefillEtudiantId(etudiantId); setSubmitError(''); setDetailCle(null); setModalOpen(true); };

  const saveNote = async (formValues: Record<string, string>) => {
    setSubmitting(true); setSubmitError('');
    try {
      if (!formValues.etudiantId || !formValues.matiereId || formValues.note === '') throw new Error('L’étudiant, la matière et la note sont obligatoires.');
      const value = Number(formValues.note);
      if (!Number.isFinite(value) || value < 0 || value > 20) throw new Error('La note doit être comprise entre 0 et 20.');
      await notesService.create({ etudiantId: Number(formValues.etudiantId), matiereId: Number(formValues.matiereId), note: value, semestreId: Number(formValues.semestre) || 1, type: formValues.type || 'Devoir', coef: Number(formValues.coef) || 1 });
      setModalOpen(false); await reload();
    } catch (requestError: any) { setSubmitError(requestError?.response?.data?.error || requestError?.message || 'Impossible d’enregistrer la note.'); }
    finally { setSubmitting(false); }
  };

  return <div className="space-y-6">
    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between"><div><h1 className="text-3xl font-bold text-gray-900">Gestion des Notes</h1><p className="mt-2 text-gray-600">Consultez les résultats par étudiant, puis ouvrez le détail</p></div><button type="button" onClick={() => ouvrirCreation()} className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 font-medium text-white shadow-sm hover:bg-blue-700"><Plus className="h-5 w-5" />Nouvelle note</button></div>
    <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm"><div className="relative"><Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" /><input type="text" placeholder="Rechercher un étudiant (nom, matricule, classe…)" value={searchQuery} onChange={(event) => setSearchQuery(event.target.value)} className="w-full rounded-lg border border-gray-300 py-2 pl-10 pr-4 outline-none focus:ring-2 focus:ring-blue-500" /></div></div>
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-4"><div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm"><p className="text-sm font-medium text-gray-600">Étudiants notés</p><p className="mt-1 text-2xl font-bold text-gray-900">{groupes.length}</p><Users className="mt-2 h-6 w-6 text-blue-500" /></div><div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm"><p className="text-sm font-medium text-gray-600">Total notes</p><p className="mt-1 text-2xl font-bold text-gray-900">{notes.length}</p><FileText className="mt-2 h-6 w-6 text-gray-400" /></div><div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm"><p className="text-sm font-medium text-gray-600">Moyenne générale</p><p className="mt-1 text-2xl font-bold text-green-600">{moyenne === null ? '--' : moyenne.toFixed(2)}</p><Sigma className="mt-2 h-6 w-6 text-green-500" /></div><div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm"><p className="text-sm font-medium text-gray-600">Meilleure / minimale</p><p className="mt-1 text-2xl font-bold text-purple-600">{values.length ? Math.max(...values) : '--'} <span className="text-sm text-orange-600">/ {values.length ? Math.min(...values) : '--'}</span></p><Award className="mt-2 h-6 w-6 text-purple-500" /></div></div>
    {error && <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-red-700">{error}</div>}
    <div className="overflow-hidden rounded-lg border border-gray-200 bg-white">{loading ? <div className="py-12 text-center text-gray-500">Chargement...</div> : filtered.length === 0 ? <div className="py-12 text-center text-gray-500"><FileText className="mx-auto mb-4 h-12 w-12 text-gray-300" /><p>{notes.length === 0 ? 'Aucune note enregistrée' : 'Aucun étudiant ne correspond à la recherche'}</p></div> : <div className="overflow-x-auto"><table className="min-w-full divide-y divide-gray-200"><thead className="bg-gray-50"><tr><th className="px-6 py-3 text-left text-xs font-semibold uppercase text-gray-500">Étudiant</th><th className="px-6 py-3 text-left text-xs font-semibold uppercase text-gray-500">Évaluations</th><th className="px-6 py-3 text-left text-xs font-semibold uppercase text-gray-500">Moyenne</th><th className="hidden px-6 py-3 text-left text-xs font-semibold uppercase text-gray-500 lg:table-cell">Meilleure / Min</th><th className="px-6 py-3 text-right text-xs font-semibold uppercase text-gray-500">Actions</th></tr></thead><tbody className="divide-y divide-gray-200">{filtered.map((group) => { const tone = tonNote(group.moyenne); const initials = group.nom.split(' ').filter(Boolean).slice(0, 2).map((word) => word.charAt(0)).join('').toUpperCase(); return <tr key={group.cle} onClick={() => setDetailCle(group.cle)} className="cursor-pointer hover:bg-blue-50/40"><td className="px-6 py-4"><div className="flex items-center gap-3"><div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-600 text-sm font-semibold text-white">{initials || '??'}</div><div><p className="font-medium text-gray-900">{group.nom}</p><p className="font-mono text-xs text-gray-500">{group.matricule}{group.classe ? ` · ${group.classe}` : ''}</p></div></div></td><td className="px-6 py-4 text-sm text-gray-700">{group.notes.length} note{group.notes.length > 1 ? 's' : ''}</td><td className="px-6 py-4"><span className={`rounded-lg px-2.5 py-1 text-sm font-bold ${tone.fond} ${tone.texte}`}>{group.moyenne === null ? '—' : `${group.moyenne.toFixed(2)}/20`}</span></td><td className="hidden px-6 py-4 text-sm lg:table-cell"><span className="font-medium text-green-600">{group.meilleure ?? '—'}</span><span className="text-gray-400"> / </span><span className="font-medium text-orange-600">{group.pire ?? '—'}</span></td><td className="px-6 py-4 text-right"><button type="button" onClick={(event) => { event.stopPropagation(); setDetailCle(group.cle); }} className="inline-flex items-center gap-1.5 rounded-lg border border-gray-300 px-3 py-1.5 text-sm font-medium text-gray-700 hover:border-blue-500 hover:bg-blue-50"><Eye className="h-4 w-4" />Voir</button></td></tr>; })}</tbody></table></div>}</div>
    {detail && <NotesEtudiantModal groupe={detail} onClose={() => setDetailCle(null)} onAddNote={(group) => ouvrirCreation(String(group.etudiantId || ''))} />}
    {modalOpen && <CrudModal key={prefillEtudiantId || 'nouvelle-note'} title="Nouvelle note" initialValues={{ etudiantId: prefillEtudiantId, matiereId: '', note: '', semestre: '1', type: 'Devoir', coef: '1' }} fields={[{ name: 'etudiantId', label: 'Étudiant', type: 'select', required: true, options: etudiants.map((student) => ({ value: String(student.id), label: `${student.nom} ${student.prenoms} (${student.matricule})` })) }, { name: 'matiereId', label: 'Matière', type: 'select', required: true, options: matieres.map((subject) => ({ value: String(subject.id), label: subject.nom })) }, { name: 'note', label: 'Note (sur 20)', type: 'number', required: true }, { name: 'semestre', label: 'Semestre', type: 'number', required: true }, { name: 'type', label: 'Type', placeholder: 'Ex. Devoir' }, { name: 'coef', label: 'Coefficient', type: 'number' }]} error={submitError} submitting={submitting} onClose={() => setModalOpen(false)} onSubmit={saveNote} />}
  </div>;
}
