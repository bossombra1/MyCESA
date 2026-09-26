import { useEffect, useMemo, useRef, useState } from 'react';
import { X, AlertCircle, Loader2, CalendarPlus, Tag, Users, School, Layers } from 'lucide-react';
import { useApiData } from '../../hooks/useApiData';
import { classesService, filieresService } from '../../services';

/**
 * Formulaire aligné sur la table réelle EVENEMENT_ECOLE :
 *   Titre            VARCHAR NOT NULL
 *   Description      TEXT NULL
 *   Date_Evenement   DATETIME NOT NULL
 *   Type             VARCHAR NOT NULL (ex. examen, cours, sortie, autre)
 *   Id_Classe        INT NULL  -> ciblage sur une classe précise
 *   Id_Filiere       INT NULL  -> ciblage sur une filière entière
 *   Pour_Tous        TINYINT   -> 1 si l'événement concerne tous les étudiants
 *
 * D'après les données observées, la portée est TOUJOURS mutuellement
 * exclusive : soit Pour_Tous=1 (Id_Classe et Id_Filiere à NULL), soit un
 * ciblage classe OU filière (jamais les deux). Le formulaire impose ce choix
 * via un sélecteur de portée explicite plutôt que deux champs libres.
 */

export type EvenementFormValues = {
  title: string;
  description: string;
  date: string;
  type: string;
  idClasse: string;
  idFiliere: string;
  pourTous: string; // 'true' | 'false' — sérialisé en string pour rester compatible avec onSubmit(Record<string,string>)
};

type Props = {
  mode: 'create' | 'edit';
  event?: any;
  submitting?: boolean;
  error?: string;
  onClose: () => void;
  onSubmit: (values: Record<string, string>) => void | Promise<void>;
};

const TYPE_LIBRE = '__libre__';
/** Types déjà observés en base ; extensible via la saisie libre. */
const TYPES_CONNUS = ['examen', 'cours', 'sortie', 'reunion', 'autre'];

type Portee = 'tous' | 'classe' | 'filiere';

const champClasse = (erreur?: string) =>
  `w-full rounded-lg border px-3.5 py-2.5 text-sm text-gray-900 outline-none transition-colors placeholder:text-gray-400 ${
    erreur ? 'border-red-300 focus:border-red-500 focus:ring-2 focus:ring-red-100' : 'border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-100'
  }`;

function Champ({ label, requis, erreur, icone, children }: { label: string; requis?: boolean; erreur?: string; icone?: React.ReactNode; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <label className="flex items-center gap-1.5 text-sm font-medium text-gray-700">
        {icone}
        {label}
        {requis && <span className="text-red-500">*</span>}
      </label>
      {children}
      {erreur && <p className="flex items-center gap-1.5 text-xs font-medium text-red-600"><AlertCircle className="h-3.5 w-3.5" />{erreur}</p>}
    </div>
  );
}

/** "2026-03-20 08:00:00" (MySQL) -> "2026-03-20T08:00" (input datetime-local). */
const versDatetimeLocal = (valeur: string) => {
  if (!valeur) return '';
  return String(valeur).replace(' ', 'T').slice(0, 16);
};

/** "2026-03-20T08:00" (input datetime-local) -> "2026-03-20 08:00:00" (MySQL DATETIME). */
const versMysqlDatetime = (valeur: string) => {
  if (!valeur) return '';
  const normalise = valeur.replace('T', ' ');
  return normalise.length === 16 ? `${normalise}:00` : normalise;
};

export default function EvenementFormModal({ mode, event, submitting = false, error = '', onClose, onSubmit }: Props) {
  const isEdit = mode === 'edit';

  const { data: classes } = useApiData<any[]>(classesService.getAll, []);
  const { data: filieres } = useApiData<any[]>(filieresService.getAll, []);

  const [title, setTitle] = useState(event?.title || '');
  const [description, setDescription] = useState(event?.description || '');
  const [date, setDate] = useState(versDatetimeLocal(event?.date || ''));

  const typeInitialConnu = event?.type && TYPES_CONNUS.includes(event.type);
  const [typeSelect, setTypeSelect] = useState<string>(event?.type ? (typeInitialConnu ? event.type : TYPE_LIBRE) : 'examen');
  const [typeLibre, setTypeLibre] = useState<string>(!typeInitialConnu ? (event?.type || '') : '');

  const porteeInitiale: Portee = event?.pourTous ? 'tous' : event?.idClasse ? 'classe' : event?.idFiliere ? 'filiere' : 'tous';
  const [portee, setPortee] = useState<Portee>(porteeInitiale);
  const [classeId, setClasseId] = useState<string>(event?.idClasse != null ? String(event.idClasse) : '');
  const [filiereId, setFiliereId] = useState<string>(event?.idFiliere != null ? String(event.idFiliere) : '');

  const [erreurs, setErreurs] = useState<{ title?: string; date?: string; type?: string; classeId?: string; filiereId?: string }>({});

  const closeRef = useRef(onClose);
  closeRef.current = onClose;
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape' && !submitting) closeRef.current(); };
    document.addEventListener('keydown', onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => { document.removeEventListener('keydown', onKey); document.body.style.overflow = prev; };
  }, [submitting]);

  const typeFinal = typeSelect === TYPE_LIBRE ? typeLibre.trim() : typeSelect;

  const changerPortee = (valeur: Portee) => {
    setPortee(valeur);
    setErreurs((e) => ({ ...e, classeId: undefined, filiereId: undefined }));
  };

  const valider = () => {
    const suivant: typeof erreurs = {};
    if (!title.trim()) suivant.title = 'Le titre est obligatoire.';
    if (!date) suivant.date = 'La date et l’heure sont obligatoires.';
    if (!typeFinal) suivant.type = 'Le type est obligatoire.';
    if (portee === 'classe' && !classeId) suivant.classeId = 'Sélectionnez une classe.';
    if (portee === 'filiere' && !filiereId) suivant.filiereId = 'Sélectionnez une filière.';
    setErreurs(suivant);
    return Object.keys(suivant).length === 0;
  };

  const soumettre = async () => {
    if (submitting || !valider()) return;
    await onSubmit({
      title: title.trim(),
      description: description.trim(),
      date: versMysqlDatetime(date),
      type: typeFinal,
      pourTous: portee === 'tous' ? 'true' : 'false',
      idClasse: portee === 'classe' ? classeId : '',
      idFiliere: portee === 'filiere' ? filiereId : '',
    });
  };

  const optionsPortee = useMemo(() => ([
    { value: 'tous' as Portee, label: 'Tous les étudiants', icone: <Users className="h-4 w-4" /> },
    { value: 'classe' as Portee, label: 'Une classe', icone: <School className="h-4 w-4" /> },
    { value: 'filiere' as Portee, label: 'Une filière', icone: <Layers className="h-4 w-4" /> },
  ]), []);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-gray-900/50 backdrop-blur-sm" onClick={() => !submitting && onClose()} />
      <div className="relative w-full max-w-lg bg-white rounded-xl shadow-2xl max-h-[90vh] flex flex-col overflow-hidden">
        <div className="flex items-center justify-between border-b border-gray-200 px-5 py-4">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-blue-100 flex items-center justify-center">
              <CalendarPlus className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-gray-900">{isEdit ? 'Modifier l’événement' : 'Nouvel événement'}</h2>
              <p className="text-xs text-gray-500">Événement de l’établissement — portée et planification</p>
            </div>
          </div>
          <button type="button" onClick={onClose} disabled={submitting} className="rounded-lg p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors" aria-label="Fermer">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-5 py-5 space-y-4">
          {error && (
            <div className="flex items-start gap-2 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <Champ label="Titre" requis erreur={erreurs.title}>
            <input type="text" value={title} onChange={(e) => { setTitle(e.target.value); setErreurs((er) => ({ ...er, title: undefined })); }}
              placeholder="Ex. Examen de Marketing" className={champClasse(erreurs.title)} />
          </Champ>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Champ label="Date et heure" requis erreur={erreurs.date}>
              <input type="datetime-local" value={date}
                onChange={(e) => { setDate(e.target.value); setErreurs((er) => ({ ...er, date: undefined })); }}
                className={champClasse(erreurs.date)} />
            </Champ>

            <Champ label="Type" requis erreur={erreurs.type} icone={<Tag className="h-4 w-4 text-gray-400" />}>
              <select value={typeSelect} onChange={(e) => { setTypeSelect(e.target.value); setErreurs((er) => ({ ...er, type: undefined })); }}
                className={champClasse(erreurs.type)}>
                {TYPES_CONNUS.map((t) => (
                  <option key={t} value={t}>{t.charAt(0).toUpperCase() + t.slice(1)}</option>
                ))}
                <option value={TYPE_LIBRE}>Autre (saisie libre)</option>
              </select>
            </Champ>
          </div>

          {typeSelect === TYPE_LIBRE && (
            <Champ label="Type personnalisé" requis erreur={erreurs.type}>
              <input type="text" value={typeLibre}
                onChange={(e) => { setTypeLibre(e.target.value); setErreurs((er) => ({ ...er, type: undefined })); }}
                placeholder="Ex. panel, formation…" className={champClasse(erreurs.type)} />
            </Champ>
          )}

          <Champ label="Description">
            <textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={3}
              placeholder="Détails, salle, consignes…" className={`${champClasse()} resize-none`} />
          </Champ>

          {/* Portée : mutuellement exclusive, reflète la réalité de la base
              (Pour_Tous=1 XOR Id_Classe XOR Id_Filiere). */}
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-gray-700">Concerne</label>
            <div className="grid grid-cols-3 gap-2">
              {optionsPortee.map((opt) => (
                <button key={opt.value} type="button" onClick={() => changerPortee(opt.value)}
                  className={`flex flex-col items-center gap-1.5 rounded-lg border px-3 py-2.5 text-xs font-medium transition-colors ${
                    portee === opt.value
                      ? 'border-blue-500 bg-blue-50 text-blue-700 ring-2 ring-blue-100'
                      : 'border-gray-300 text-gray-600 hover:bg-gray-50'
                  }`}>
                  {opt.icone}
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          {portee === 'classe' && (
            <Champ label="Classe" requis erreur={erreurs.classeId} icone={<School className="h-4 w-4 text-gray-400" />}>
              <select value={classeId} onChange={(e) => { setClasseId(e.target.value); setErreurs((er) => ({ ...er, classeId: undefined })); }}
                className={champClasse(erreurs.classeId)}>
                <option value="">— Sélectionner —</option>
                {classes.map((c: any) => (
                  <option key={c.id} value={String(c.id)}>{c.nom}{c.filiere ? ` — ${c.filiere}` : ''}</option>
                ))}
              </select>
            </Champ>
          )}

          {portee === 'filiere' && (
            <Champ label="Filière" requis erreur={erreurs.filiereId} icone={<Layers className="h-4 w-4 text-gray-400" />}>
              <select value={filiereId} onChange={(e) => { setFiliereId(e.target.value); setErreurs((er) => ({ ...er, filiereId: undefined })); }}
                className={champClasse(erreurs.filiereId)}>
                <option value="">— Sélectionner —</option>
                {filieres.map((f: any) => (
                  <option key={f.id} value={String(f.id)}>{f.nom}</option>
                ))}
              </select>
            </Champ>
          )}
        </div>

        <div className="flex items-center justify-end gap-3 border-t border-gray-200 bg-white px-5 py-4 sm:px-6">
          <button type="button" onClick={onClose} disabled={submitting}
            className="rounded-lg px-4 py-2.5 text-sm font-medium text-gray-600 transition-colors hover:bg-gray-100 disabled:opacity-50">
            Annuler
          </button>
          <button type="button" onClick={soumettre} disabled={submitting}
            className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-70">
            {submitting ? <><Loader2 className="h-4 w-4 animate-spin" />Enregistrement…</> : <><CalendarPlus className="h-4 w-4" />{isEdit ? 'Enregistrer' : 'Créer l’événement'}</>}
          </button>
        </div>
      </div>
    </div>
  );
}