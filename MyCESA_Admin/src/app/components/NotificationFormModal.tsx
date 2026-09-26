import { useEffect, useMemo, useRef, useState } from 'react';
import { X, AlertCircle, Loader2, Send, Users, School, GraduationCap, Bell, Calendar } from 'lucide-react';
import { useApiData } from '../../hooks/useApiData';
import { classesService, etudiantsService, filieresService } from '../../services';

/**
 * Champs alignés sur la table réelle `notification_contents` :
 *   Titre_Notif   VARCHAR(255) NOT NULL
 *   Message_Notif TEXT         NOT NULL
 *   Type          ENUM('academique','vie_scolaire','finance','autre')
 *   Cible         ENUM('tous','filiere','classe','etudiant')
 *   Id_Filiere / Id_Classe / Id_Etudiant (NULL selon la cible)
 *   Scheduled_At  DATETIME NULL (NULL = envoi immédiat)
 */
export type NotificationFormValues = {
  titre: string;
  message: string;
  type: string;
  cible: string;
  idFiliere: string;
  idClasse: string;
  idEtudiant: string;
  dateProgrammee: string;
};

type Props = {
  submitting?: boolean;
  error?: string;
  onClose: () => void;
  onSubmit: (values: NotificationFormValues) => void | Promise<void>;
};

// Libellés repris des ENUM de la base (aucune valeur inventée).
const TYPES = [
  { value: 'academique', label: 'Académique' },
  { value: 'vie_scolaire', label: 'Vie scolaire' },
  { value: 'finance', label: 'Finance' },
  { value: 'autre', label: 'Autre' },
];

const CIBLES = [
  { value: 'tous', label: 'Tous les étudiants', description: 'Envoi à l’ensemble des étudiants inscrits', icon: Users },
  { value: 'filiere', label: 'Une filière', description: 'Envoi à tous les étudiants d’une filière', icon: GraduationCap },
  { value: 'classe', label: 'Une classe', description: 'Envoi à tous les étudiants d’une classe', icon: School },
  { value: 'etudiant', label: 'Un étudiant', description: 'Envoi à un seul étudiant', icon: Bell },
];

/** `<input type="datetime-local">` attend `YYYY-MM-DDTHH:mm`. */
const versDatetimeLocal = (value: string) => {
  if (!value) return '';
  const date = new Date(String(value).replace(' ', 'T'));
  if (Number.isNaN(date.getTime())) return '';
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
};

export default function NotificationFormModal({ submitting = false, error = '', onClose, onSubmit }: Props) {
  // Référentiels réels : GET /filieres, /classes, /etudiants
  const { data: filieres } = useApiData<any[]>(filieresService.getAll, []);
  const { data: classes } = useApiData<any[]>(classesService.getAll, []);
  const { data: etudiants } = useApiData<any[]>(etudiantsService.getAll, []);

  const [titre, setTitre] = useState('');
  const [message, setMessage] = useState('');
  const [type, setType] = useState('academique');
  const [cible, setCible] = useState('tous');
  const [idFiliere, setIdFiliere] = useState('');
  const [idClasse, setIdClasse] = useState('');
  const [idEtudiant, setIdEtudiant] = useState('');
  const [dateProgrammee, setDateProgrammee] = useState('');
  const [erreurs, setErreurs] = useState<{ titre?: string; message?: string; cible?: string }>({});

  const closeRef = useRef(onClose);
  closeRef.current = onClose;
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape' && !submitting) closeRef.current(); };
    document.addEventListener('keydown', onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => { document.removeEventListener('keydown', onKey); document.body.style.overflow = prev; };
  }, [submitting]);

  // La classe porte Id_FILIERE : on filtre les classes sur la filière choisie.
  const classesFiltrees = useMemo(
    () => (!idFiliere ? classes : classes.filter((c) => String(c.filiereId) === idFiliere)),
    [classes, idFiliere],
  );
  // L'étudiant porte Id_CLASSE : on filtre les étudiants sur la classe choisie.
  const etudiantsFiltres = useMemo(
    () => (!idClasse ? etudiants : etudiants.filter((e) => String(e.classeId) === idClasse)),
    [etudiants, idClasse],
  );

  const effectifClasse = useMemo(
    () => classes.find((c) => String(c.id) === idClasse)?.effectif ?? null,
    [classes, idClasse],
  );

  const choisirCible = (value: string) => {
    setCible(value);
    setIdFiliere(''); setIdClasse(''); setIdEtudiant('');
    setErreurs((prev) => ({ ...prev, cible: undefined }));
  };

  const valider = () => {
    const next: typeof erreurs = {};
    if (!titre.trim()) next.titre = 'Le titre de la notification est obligatoire.';
    if (!message.trim()) next.message = 'Le message est obligatoire.';
    if (cible === 'filiere' && !idFiliere) next.cible = 'Sélectionnez une filière.';
    if (cible === 'classe' && !idClasse) next.cible = 'Sélectionnez une classe.';
    if (cible === 'etudiant' && !idEtudiant) next.cible = 'Sélectionnez un étudiant.';
    setErreurs(next);
    return Object.keys(next).length === 0;
  };

  const handleSubmit = () => {
    if (submitting || !valider()) return;
    onSubmit({ titre, message, type, cible, idFiliere, idClasse, idEtudiant, dateProgrammee });
  };

  const champClass = (champ?: string) => `w-full rounded-lg border px-3.5 py-2.5 text-sm text-gray-900 outline-none transition-colors placeholder:text-gray-400 focus:ring-2 ${
    champ && erreurs[champ as keyof typeof erreurs]
      ? 'border-red-300 focus:border-red-400 focus:ring-red-100'
      : 'border-gray-300 focus:border-blue-500 focus:ring-blue-100'
  }`;

  const dateAffichee = versDatetimeLocal(dateProgrammee);
  const cibleActive = CIBLES.find((c) => c.value === cible);

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-gray-900/50 p-0 backdrop-blur-sm sm:items-center sm:p-4" role="dialog" aria-modal="true" aria-label="Nouvelle notification">
      <div className="flex max-h-[95vh] w-full flex-col overflow-hidden rounded-t-2xl bg-white shadow-2xl sm:max-w-2xl sm:rounded-2xl">
        <div className="flex items-start justify-between gap-4 border-b border-gray-200 px-5 py-4 sm:px-6">
          <div className="flex items-start gap-3">
            <span className="mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-100 text-blue-600">
              <Bell className="h-5 w-5" />
            </span>
            <div>
              <h2 className="text-lg font-bold text-gray-900">Nouvelle notification</h2>
              <p className="text-sm text-gray-500">Enregistrée dans <span className="font-medium">notification_contents</span></p>
            </div>
          </div>
          <button type="button" onClick={onClose} disabled={submitting} aria-label="Fermer"
            className="rounded-lg p-2 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600 disabled:opacity-50">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="flex-1 space-y-5 overflow-y-auto px-5 py-5 sm:px-6">
          {error && (
            <div className="flex items-start gap-2 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />{error}
            </div>
          )}

          <div className="space-y-1.5">
            <label className="text-sm font-medium text-gray-700">Titre <span className="text-red-500">*</span></label>
            <input type="text" value={titre} maxLength={255} onChange={(e) => setTitre(e.target.value)}
              placeholder="Ex. Rappel : paiement des frais de scolarité" className={champClass('titre')} />
            {erreurs.titre && <p className="flex items-center gap-1.5 text-xs font-medium text-red-600"><AlertCircle className="h-3.5 w-3.5" />{erreurs.titre}</p>}
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-medium text-gray-700">Message <span className="text-red-500">*</span></label>
            <textarea value={message} rows={4} onChange={(e) => setMessage(e.target.value)}
              placeholder="Contenu du message envoyé aux destinataires…" className={`${champClass('message')} resize-y`} />
            {erreurs.message && <p className="flex items-center gap-1.5 text-xs font-medium text-red-600"><AlertCircle className="h-3.5 w-3.5" />{erreurs.message}</p>}
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-medium text-gray-700">Type <span className="text-red-500">*</span></label>
            <select value={type} onChange={(e) => setType(e.target.value)} className={champClass()}>
              {TYPES.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
            </select>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">Cible (destinataires) <span className="text-red-500">*</span></label>
            <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
              {CIBLES.map(({ value, label, description, icon: Icon }) => (
                <button key={value} type="button" onClick={() => choisirCible(value)}
                  className={`flex items-start gap-3 rounded-xl border p-3 text-left transition-colors ${
                    cible === value ? 'border-blue-500 bg-blue-50 ring-1 ring-blue-200' : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                  }`}>
                  <Icon className={`mt-0.5 h-4 w-4 shrink-0 ${cible === value ? 'text-blue-600' : 'text-gray-400'}`} />
                  <span>
                    <span className={`block text-sm font-semibold ${cible === value ? 'text-blue-700' : 'text-gray-800'}`}>{label}</span>
                    <span className="block text-xs text-gray-500">{description}</span>
                  </span>
                </button>
              ))}
            </div>
            {erreurs.cible && <p className="flex items-center gap-1.5 text-xs font-medium text-red-600"><AlertCircle className="h-3.5 w-3.5" />{erreurs.cible}</p>}
          </div>

          {cible === 'filiere' && (
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-gray-700">Filière <span className="text-red-500">*</span></label>
              <select value={idFiliere} onChange={(e) => setIdFiliere(e.target.value)} className={champClass()}>
                <option value="">— Sélectionner une filière —</option>
                {filieres.map((f) => <option key={f.id} value={String(f.id)}>{f.nom}</option>)}
              </select>
              <p className="text-xs text-gray-500">Colonne <span className="font-mono">notification_contents.Id_Filiere</span></p>
            </div>
          )}

          {cible === 'classe' && (
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-gray-700">Classe <span className="text-red-500">*</span></label>
              <select value={idClasse} onChange={(e) => setIdClasse(e.target.value)} className={champClass()}>
                <option value="">— Sélectionner une classe —</option>
                {classes.map((c) => (
                  <option key={c.id} value={String(c.id)}>
                    {c.nom}{c.filiere ? ` — ${c.filiere}` : ''}
                  </option>
                ))}
              </select>
              {effectifClasse !== null && (
                <p className="text-xs text-gray-500">Effectif réel de la classe : <span className="font-semibold text-gray-700">{effectifClasse}</span> étudiant(s)</p>
              )}
            </div>
          )}

          {cible === 'etudiant' && (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-gray-700">Classe (filtre)</label>
                <select value={idClasse} onChange={(e) => { setIdClasse(e.target.value); setIdEtudiant(''); }} className={champClass()}>
                  <option value="">— Toutes les classes —</option>
                  {classesFiltrees.map((c) => <option key={c.id} value={String(c.id)}>{c.nom}</option>)}
                </select>
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-gray-700">Étudiant <span className="text-red-500">*</span></label>
                <select value={idEtudiant} onChange={(e) => setIdEtudiant(e.target.value)} className={champClass()}>
                  <option value="">— Sélectionner un étudiant —</option>
                  {etudiantsFiltres.map((e) => (
                    <option key={e.id} value={String(e.id)}>
                      {[e.nom, e.prenoms].filter(Boolean).join(' ')}{e.matricule ? ` — ${e.matricule}` : ''}
                    </option>
                  ))}
                </select>
                <p className="text-xs text-gray-500">Colonne <span className="font-mono">notification_contents.Id_Etudiant</span></p>
              </div>
            </div>
          )}

          <div className="rounded-xl border border-gray-200 bg-gray-50 p-4">
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-gray-500" />
              <label className="text-sm font-medium text-gray-700">Programmer l’envoi (optionnel)</label>
            </div>
            <input type="datetime-local" value={dateAffichee}
              onChange={(e) => setDateProgrammee(e.target.value ? `${e.target.value.replace('T', ' ')}:00` : '')}
              className={`mt-2 ${champClass()}`} />
            <p className="mt-1.5 text-xs text-gray-500">
              {dateAffichee
                ? <>Colonne <span className="font-mono">Scheduled_At</span> : <span className="font-semibold text-gray-700">{dateAffichee.replace('T', ' ')}</span></>
                : <>Laisser vide pour un envoi <span className="font-semibold text-gray-700">immédiat</span> (<span className="font-mono">Scheduled_At = NULL</span>).</>}
            </p>
          </div>

          {cibleActive && (
            <div className="flex items-start gap-2 rounded-lg border border-blue-200 bg-blue-50 px-4 py-3 text-xs text-blue-800">
              <Users className="mt-0.5 h-3.5 w-3.5 shrink-0" />
              <span>
                Les destinataires sont calculés côté backend (<span className="font-mono">POST /api/notifications/send-cible</span>)
                d’après la cible <strong>{cibleActive.label}</strong>
                {cible === 'tous' && ' — tous les étudiants disposant d’un compte utilisateur'}.
              </span>
            </div>
          )}
        </div>

        <div className="flex items-center justify-end gap-3 border-t border-gray-200 bg-white px-5 py-4 sm:px-6">
          <button type="button" onClick={onClose} disabled={submitting}
            className="rounded-lg px-4 py-2.5 text-sm font-medium text-gray-600 transition-colors hover:bg-gray-100 disabled:opacity-50">
            Annuler
          </button>
          <button type="button" onClick={handleSubmit} disabled={submitting}
            className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-70">
            {submitting ? <><Loader2 className="h-4 w-4 animate-spin" />Envoi…</> : <><Send className="h-4 w-4" />Envoyer</>}
          </button>
        </div>
      </div>
    </div>
  );
}
