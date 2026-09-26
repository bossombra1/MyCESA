import { useEffect, useMemo, useRef, useState } from 'react';
import { X, Plus, Award, TrendingDown, BookOpen, Sigma } from 'lucide-react';

export type NoteItem = {
  id?: number | string;
  matiere?: string;
  note?: number | string;
  semestre?: string | number;
  type?: string;
  coef?: number | string;
  date?: string;
  [key: string]: any;
};

export type GroupeNotes = {
  cle: string;
  etudiantId: number | string | null;
  nom: string;
  matricule: string;
  classe?: string;
  filiere?: string;
  notes: NoteItem[];
  moyenne: number | null;
  meilleure: number | null;
  pire: number | null;
};

export const tonNote = (value: number | null) => {
  if (value === null || !Number.isFinite(value)) return { texte: 'text-gray-500', fond: 'bg-gray-100', barre: 'bg-gray-300' };
  if (value >= 14) return { texte: 'text-green-700', fond: 'bg-green-100', barre: 'bg-green-500' };
  if (value >= 10) return { texte: 'text-blue-700', fond: 'bg-blue-100', barre: 'bg-blue-500' };
  if (value >= 8) return { texte: 'text-orange-700', fond: 'bg-orange-100', barre: 'bg-orange-500' };
  return { texte: 'text-red-700', fond: 'bg-red-100', barre: 'bg-red-500' };
};

export const mention = (value: number | null) => {
  if (value === null) return '—';
  if (value >= 16) return 'Très bien';
  if (value >= 14) return 'Bien';
  if (value >= 12) return 'Assez bien';
  if (value >= 10) return 'Passable';
  return 'Insuffisant';
};

export const moyennePonderee = (notes: NoteItem[]) => {
  const valid = notes.map((note) => ({ value: Number(note.note), coef: Number(note.coef) || 1 })).filter((note) => Number.isFinite(note.value));
  const totalCoef = valid.reduce((sum, note) => sum + note.coef, 0);
  return totalCoef ? valid.reduce((sum, note) => sum + note.value * note.coef, 0) / totalCoef : null;
};

function Tile({ icon: Icon, label, value, tone }: { icon: any; label: string; value: string; tone?: string }) {
  return <div className="rounded-xl border border-gray-200 bg-white p-3"><div className="flex items-center gap-1.5 text-xs font-medium text-gray-500"><Icon className="h-3.5 w-3.5" />{label}</div><p className={`mt-1 text-xl font-bold ${tone || 'text-gray-900'}`}>{value}</p></div>;
}

export default function NotesEtudiantModal({ groupe, onClose, onAddNote }: { groupe: GroupeNotes; onClose: () => void; onAddNote?: (groupe: GroupeNotes) => void }) {
  const [semestreActif, setSemestreActif] = useState('Tous');
  const closeRef = useRef(onClose);
  closeRef.current = onClose;

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => { if (event.key === 'Escape') closeRef.current(); };
    document.addEventListener('keydown', onKey);
    const previous = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => { document.removeEventListener('keydown', onKey); document.body.style.overflow = previous; };
  }, []);

  const semestres = useMemo(() => Array.from(new Set(groupe.notes.map((note) => String(note.semestre ?? '—')))).sort(), [groupe.notes]);
  const notesAffichees = useMemo(() => {
    const notes = semestreActif === 'Tous' ? groupe.notes : groupe.notes.filter((note) => String(note.semestre ?? '—') === semestreActif);
    return [...notes].sort((a, b) => String(a.matiere || '').localeCompare(String(b.matiere || '')));
  }, [groupe.notes, semestreActif]);
  const moyenneAffichee = moyennePonderee(notesAffichees);
  const tone = tonNote(moyenneAffichee);
  const initiales = groupe.nom.split(' ').filter(Boolean).slice(0, 2).map((word) => word.charAt(0)).join('').toUpperCase();

  return <div className="fixed inset-0 z-50 flex items-end justify-center bg-gray-900/60 backdrop-blur-sm sm:items-center sm:p-4" onMouseDown={(event) => event.target === event.currentTarget && onClose()}>
    <div role="dialog" aria-modal="true" aria-labelledby="notes-etudiant-titre" className="flex max-h-[95vh] w-full flex-col overflow-hidden rounded-t-2xl bg-white shadow-2xl sm:max-h-[90vh] sm:max-w-3xl sm:rounded-2xl">
      <div className="flex items-start gap-4 border-b border-gray-200 px-5 py-4 sm:px-6"><div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-blue-600 text-base font-semibold text-white">{initiales || '??'}</div><div className="min-w-0 flex-1"><h2 id="notes-etudiant-titre" className="truncate text-lg font-bold text-gray-900">{groupe.nom}</h2><p className="truncate text-sm text-gray-500"><span className="font-mono">{groupe.matricule}</span>{groupe.classe ? ` · ${groupe.classe}` : ''}{groupe.filiere ? ` · ${groupe.filiere}` : ''}</p></div><button type="button" onClick={onClose} aria-label="Fermer" className="rounded-lg p-2 text-gray-400 hover:bg-gray-100"><X className="h-5 w-5" /></button></div>
      <div className="grid grid-cols-2 gap-3 border-b border-gray-200 bg-gray-50 px-5 py-4 sm:grid-cols-4 sm:px-6"><Tile icon={Sigma} label="Moyenne" tone={tone.texte} value={moyenneAffichee === null ? '—' : `${moyenneAffichee.toFixed(2)}/20`} /><Tile icon={BookOpen} label="Évaluations" value={String(notesAffichees.length)} /><Tile icon={Award} label="Meilleure" tone="text-green-700" value={groupe.meilleure === null ? '—' : String(groupe.meilleure)} /><Tile icon={TrendingDown} label="Minimale" tone="text-orange-700" value={groupe.pire === null ? '—' : String(groupe.pire)} /></div>
      {semestres.length > 1 && <div className="flex flex-wrap gap-2 border-b border-gray-200 px-5 py-3 sm:px-6">{['Tous', ...semestres].map((semester) => <button key={semester} type="button" onClick={() => setSemestreActif(semester)} className={`rounded-full px-3 py-1.5 text-xs font-medium ${semestreActif === semester ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>{semester === 'Tous' ? 'Tous les semestres' : `Semestre ${semester}`}</button>)}</div>}
      <div className="flex-1 overflow-y-auto px-5 py-4 sm:px-6">{notesAffichees.length === 0 ? <div className="py-12 text-center text-gray-500"><BookOpen className="mx-auto mb-3 h-10 w-10 text-gray-300" /><p className="text-sm">Aucune note sur cette période.</p></div> : <ul className="space-y-2">{notesAffichees.map((note, index) => { const value = Number(note.note); const itemTone = tonNote(Number.isFinite(value) ? value : null); return <li key={note.id ?? index} className="rounded-xl border border-gray-200 p-3 hover:border-gray-300"><div className="flex items-start justify-between gap-3"><div className="min-w-0"><p className="truncate font-medium text-gray-900">{note.matiere || 'Matière non renseignée'}</p><div className="mt-1 flex flex-wrap items-center gap-1.5 text-xs text-gray-500"><span className="rounded bg-gray-100 px-1.5 py-0.5 font-medium text-gray-600">{note.type || 'Devoir'}</span><span>Coef. {Number(note.coef) || 1}</span><span>· Semestre {note.semestre ?? '—'}</span></div></div><span className={`shrink-0 rounded-lg px-2.5 py-1 text-sm font-bold ${itemTone.fond} ${itemTone.texte}`}>{Number.isFinite(value) ? `${value}/20` : '—'}</span></div><div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-gray-100"><div className={`h-full rounded-full ${itemTone.barre}`} style={{ width: `${Math.max(0, Math.min(100, (Number.isFinite(value) ? value : 0) * 5))}%` }} /></div></li>; })}</ul>}</div>
      <div className="flex items-center justify-between gap-3 border-t border-gray-200 px-5 py-4 sm:px-6"><p className="text-sm text-gray-500">Mention : <span className={`font-semibold ${tone.texte}`}>{mention(moyenneAffichee)}</span></p><div className="flex gap-2"><button type="button" onClick={onClose} className="rounded-lg px-4 py-2.5 text-sm font-medium text-gray-600 hover:bg-gray-100">Fermer</button>{onAddNote && <button type="button" onClick={() => onAddNote(groupe)} className="inline-flex items-center gap-1.5 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-700"><Plus className="h-4 w-4" />Ajouter une note</button>}</div></div>
    </div>
  </div>;
}
