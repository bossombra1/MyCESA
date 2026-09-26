import { useEffect, useMemo, useRef, useState } from 'react';
import { X, AlertCircle, Loader2, UserPlus, AtSign, ShieldCheck, KeyRound, GraduationCap } from 'lucide-react';
import { useApiData } from '../../hooks/useApiData';
import { rolesService } from '../../services';

/**
 * Formulaire aligné sur la table réelle UTILISATEUR :
 *   Nom_User      VARCHAR(100) NOT NULL -> liste déroulante alimentée par les
 *                 profils PROFESSEUR/ETUDIANT n'ayant pas encore de compte
 *                 (mêmes options que le champ email, synchronisée avec lui)
 *   Login_User    VARCHAR(50)  NOT NULL UNIQUE
 *   Email_User    VARCHAR(100) NULL UNIQUE -> liste déroulante alimentée par
 *                 les tables PROFESSEUR (email_Profe) et ETUDIANT (Email_Etudiant),
 *                 filtrée pour exclure les profils déjà liés à un compte
 *                 existant (sauf le profil du compte en cours d'édition)
 *   Password_User VARCHAR(255) NOT NULL (à la création uniquement)
 *   Id_ROLE       INT NULL -> liste déroulante alimentée par la table ROLE (GET /roles) ;
 *                 pré-sélectionné automatiquement quand un profil PROFESSEUR/ETUDIANT
 *                 est choisi, mais reste modifiable manuellement (cas "saisie libre")
 */

export type UtilisateurFormValues = {
  nom: string;
  login: string;
  email: string;
  password: string;
  roleId: string;
};

type Props = {
  mode: 'create' | 'edit';
  user?: any;
  profilsLiables?: { professeurs?: any[]; etudiants?: any[] };
  utilisateurs?: any[];
  submitting?: boolean;
  error?: string;
  onClose: () => void;
  onSubmit: (values: Record<string, string>) => void | Promise<void>;
};

/** Valeur sentinelle : « autre adresse / nom saisi librement ». Partagée entre les deux selects. */
const LIBRE = '__libre__';
const EMAIL_LIBRE = LIBRE;
const NOM_LIBRE = LIBRE;

const EMAIL_RE = /^\S+@\S+\.\S+$/;

/** Normalise une chaîne (minuscules, sans accents) pour un matching de libellé tolérant. */
const normaliser = (s: string) => s.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();

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

export default function UtilisateurFormModal({ mode, user, profilsLiables, utilisateurs = [], submitting = false, error = '', onClose, onSubmit }: Props) {
  const isEdit = mode === 'edit';
  const professeursTous = useMemo(() => profilsLiables?.professeurs ?? [], [profilsLiables]);
  const etudiantsTous = useMemo(() => profilsLiables?.etudiants ?? [], [profilsLiables]);
  const tousProfilsBruts = useMemo(() => [...professeursTous, ...etudiantsTous], [professeursTous, etudiantsTous]);

  // Table ROLE réelle : GET /roles -> [{ Id_ROLE, Lib_Role }]
  const { data: roles } = useApiData<any[]>(rolesService.getAll, []);

  const [login, setLogin] = useState(user?.login || '');
  const [roleId, setRoleId] = useState(user?.roleId != null ? String(user.roleId) : '');
  const [password, setPassword] = useState('');

  // Profil (email) auquel le compte est déjà rattaché, le cas échéant.
  const emailProfilExistant = useMemo(
    () => (user?.email ? tousProfilsBruts.find((p) => String(p.email).toLowerCase() === String(user.email).toLowerCase()) : null),
    [user, tousProfilsBruts],
  );

  // Emails déjà rattachés à un compte UTILISATEUR (hors compte en cours d'édition) : à exclure des listes.
  const emailsDejaUtilises = useMemo(() => {
    const idCourant = isEdit ? user?.id : undefined;
    return new Set(
      utilisateurs
        .filter((u: any) => (idCourant == null ? true : u.id !== idCourant))
        .map((u: any) => String(u.email || '').toLowerCase())
        .filter(Boolean),
    );
  }, [utilisateurs, isEdit, user]);

  // Profils affichés dans les selects : uniquement ceux sans compte, + le profil déjà lié à ce compte en édition.
  const professeurs = useMemo(
    () => professeursTous.filter((p: any) => !emailsDejaUtilises.has(String(p.email).toLowerCase()) || String(p.email).toLowerCase() === String(user?.email || '').toLowerCase()),
    [professeursTous, emailsDejaUtilises, user],
  );
  const etudiants = useMemo(
    () => etudiantsTous.filter((e: any) => !emailsDejaUtilises.has(String(e.email).toLowerCase()) || String(e.email).toLowerCase() === String(user?.email || '').toLowerCase()),
    [etudiantsTous, emailsDejaUtilises, user],
  );
  const tousProfils = useMemo(() => [...professeurs, ...etudiants], [professeurs, etudiants]);

  // Nom : select synchronisé avec le profil de l'email (mêmes valeurs de sentinelle).
  const [nomProfil, setNomProfil] = useState<string>(
    isEdit && user?.email ? (emailProfilExistant ? String(emailProfilExistant.email) : NOM_LIBRE) : '',
  );
  const [nom, setNom] = useState(user?.nom || '');

  // Email : soit rattaché à un profil existant (PROFESSEUR / ETUDIANT), soit saisi librement.
  const [emailProfil, setEmailProfil] = useState<string>(
    isEdit && user?.email ? (emailProfilExistant ? String(emailProfilExistant.email) : EMAIL_LIBRE) : '',
  );
  const [emailLibre, setEmailLibre] = useState<string>(
    isEdit && user?.email && !emailProfilExistant ? String(user.email) : '',
  );

  const [erreurs, setErreurs] = useState<{ nom?: string; login?: string; roleId?: string; password?: string; email?: string }>({});

  const closeRef = useRef(onClose);
  closeRef.current = onClose;
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape' && !submitting) closeRef.current(); };
    document.addEventListener('keydown', onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => { document.removeEventListener('keydown', onKey); document.body.style.overflow = prev; };
  }, [submitting]);

  const emailFinal = emailProfil === EMAIL_LIBRE ? emailLibre.trim() : emailProfil;

  /** Trouve dans ROLE le rôle correspondant au type de profil ("professeur" / "etudiant"), par libellé tolérant. */
  const trouverRoleAuto = (type: 'professeur' | 'etudiant') =>
    roles.find((r: any) => normaliser(String(r.Lib_Role || '')).includes(type));

  /**
   * Applique un profil sélectionné (PROFESSEUR ou ETUDIANT) aux TROIS champs
   * synchronisés : nom, email et rôle. Utilisée par les deux selects
   * (Nom complet et Email) pour qu'ils pointent toujours vers le même profil.
   * Le rôle n'est auto-sélectionné que si un rôle correspondant existe ;
   * sinon la sélection manuelle reste possible.
   */
  const appliquerProfil = (value: string) => {
    setNomProfil(value);
    setEmailProfil(value);
    const profDeProf = professeurs.find((p: any) => String(p.email) === value);
    const profil = profDeProf || etudiants.find((e: any) => String(e.email) === value);
    if (profil?.nom) setNom(profil.nom);

    const roleAuto = trouverRoleAuto(profDeProf ? 'professeur' : 'etudiant');
    if (roleAuto) setRoleId(String(roleAuto.Id_ROLE));

    setErreurs((e) => ({ ...e, nom: undefined, email: undefined, roleId: roleAuto ? undefined : e.roleId }));
  };

  const choisirNom = (value: string) => {
    if (!value || value === NOM_LIBRE) {
      setNomProfil(value);
      setNom('');
      setErreurs((e) => ({ ...e, nom: undefined }));
      return;
    }
    appliquerProfil(value);
  };

  const choisirEmail = (value: string) => {
    if (!value || value === EMAIL_LIBRE) {
      setEmailProfil(value);
      setErreurs((e) => ({ ...e, email: undefined }));
      return;
    }
    appliquerProfil(value);
  };

  const valider = () => {
    const suivant: typeof erreurs = {};
    if (!nom.trim()) suivant.nom = 'Le nom est obligatoire.';
    if (!login.trim()) suivant.login = 'Le login est obligatoire.';
    if (!roleId) suivant.roleId = 'Sélectionnez un rôle.';
    if (!isEdit && !password) suivant.password = 'Le mot de passe est obligatoire.';
    if (emailFinal && !EMAIL_RE.test(emailFinal)) suivant.email = 'Adresse email invalide.';
    setErreurs(suivant);
    return Object.keys(suivant).length === 0;
  };

  const soumettre = async () => {
    if (submitting || !valider()) return;
    await onSubmit({ nom: nom.trim(), login: login.trim(), email: emailFinal, password, roleId });
  };

  const profilSelectionne = emailProfil && emailProfil !== EMAIL_LIBRE
    ? tousProfils.find((p) => String(p.email) === emailProfil)
    : null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-gray-900/50 backdrop-blur-sm" onClick={() => !submitting && onClose()} />
      <div className="relative w-full max-w-lg bg-white rounded-xl shadow-2xl max-h-[90vh] flex flex-col overflow-hidden">
        <div className="flex items-center justify-between border-b border-gray-200 px-5 py-4">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-blue-100 flex items-center justify-center">
              <UserPlus className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-gray-900">{isEdit ? 'Modifier l’utilisateur' : 'Nouvel utilisateur'}</h2>
              <p className="text-xs text-gray-500">Compte UTILISATEUR — rôle et profil métier lié</p>
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

          <Champ label="Nom complet" requis erreur={erreurs.nom}>
            <select value={nomProfil} onChange={(e) => choisirNom(e.target.value)} className={champClasse(erreurs.nom)}>
              <option value="">— Sélectionner —</option>
              {professeurs.length > 0 && (
                <optgroup label="Professeurs">
                  {professeurs.map((p: any) => (
                    <option key={`nom-prof-${p.email}`} value={String(p.email)}>{p.nom}</option>
                  ))}
                </optgroup>
              )}
              {etudiants.length > 0 && (
                <optgroup label="Étudiants">
                  {etudiants.map((e: any) => (
                    <option key={`nom-etu-${e.email}`} value={String(e.email)}>{e.nom}</option>
                  ))}
                </optgroup>
              )}
              <option value={NOM_LIBRE}>Autre (saisie libre)</option>
            </select>
          </Champ>

          {nomProfil === NOM_LIBRE && (
            <Champ label="Nom saisi librement" requis erreur={erreurs.nom}>
              <input type="text" value={nom}
                onChange={(e) => { setNom(e.target.value); setErreurs((er) => ({ ...er, nom: undefined })); }}
                placeholder="Ex. Aya Konaté" className={champClasse(erreurs.nom)} />
            </Champ>
          )}

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Champ label="Login" requis erreur={erreurs.login}>
              <input type="text" value={login} onChange={(e) => { setLogin(e.target.value); setErreurs((er) => ({ ...er, login: undefined })); }}
                placeholder="Identifiant de connexion" className={champClasse(erreurs.login)} />
            </Champ>

            {/* Rôle : pré-sélectionné automatiquement dès qu'un profil PROFESSEUR/ETUDIANT
                est choisi (Nom ou Email), mais toujours modifiable — indispensable pour
                les cas de saisie libre où aucun profil ne fixe le rôle. */}
            <Champ label="Rôle" requis erreur={erreurs.roleId} icone={<ShieldCheck className="h-4 w-4 text-gray-400" />}>
              <select value={roleId} onChange={(e) => { setRoleId(e.target.value); setErreurs((er) => ({ ...er, roleId: undefined })); }}
                className={champClasse(erreurs.roleId)}>
                <option value="">— Sélectionner —</option>
                {roles.map((role) => (
                  <option key={role.Id_ROLE} value={String(role.Id_ROLE)}>{role.Lib_Role}</option>
                ))}
              </select>
            </Champ>
          </div>

          {/* Email_User : nullable dans la base, mais sert de lien vers la fiche
              PROFESSEUR (email_Profe) ou ETUDIANT (Email_Etudiant). Synchronisé
              avec le select "Nom complet" ci-dessus : les deux pointent
              toujours vers le même profil, impossible de les désaccorder.
              Les profils déjà rattachés à un autre compte sont exclus. */}
          <Champ label="Email (profil lié)" erreur={erreurs.email} icone={<AtSign className="h-4 w-4 text-gray-400" />}>
            <select value={emailProfil} onChange={(e) => choisirEmail(e.target.value)} className={champClasse(erreurs.email)}>
              <option value="">— Aucun email —</option>
              {professeurs.length > 0 && (
                <optgroup label="Professeurs">
                  {professeurs.map((p: any) => (
                    <option key={`prof-${p.email}`} value={String(p.email)}>{p.nom} — {p.email}</option>
                  ))}
                </optgroup>
              )}
              {etudiants.length > 0 && (
                <optgroup label="Étudiants">
                  {etudiants.map((e: any) => (
                    <option key={`etu-${e.email}`} value={String(e.email)}>{e.nom} — {e.email}</option>
                  ))}
                </optgroup>
              )}
              <option value={EMAIL_LIBRE}>Autre adresse (saisie libre)</option>
            </select>
          </Champ>

          {emailProfil === EMAIL_LIBRE && (
            <Champ label="Adresse email libre">
              <input type="email" value={emailLibre}
                onChange={(e) => { setEmailLibre(e.target.value); setErreurs((er) => ({ ...er, email: undefined })); }}
                placeholder="adresse@exemple.ci" className={champClasse(erreurs.email)} />
            </Champ>
          )}

          {profilSelectionne && (
            <p className="flex items-center gap-1.5 text-xs text-gray-500">
              <GraduationCap className="h-3.5 w-3.5" />
              Compte lié au profil « {profilSelectionne.nom} » ({profilSelectionne.email})
            </p>
          )}

          {/* Password_User : demandé uniquement à la création (PUT ne le modifie pas). */}
          {!isEdit && (
            <Champ label="Mot de passe" requis erreur={erreurs.password} icone={<KeyRound className="h-4 w-4 text-gray-400" />}>
              <input type="password" value={password} autoComplete="new-password"
                onChange={(e) => { setPassword(e.target.value); setErreurs((er) => ({ ...er, password: undefined })); }}
                placeholder="Mot de passe initial" className={champClasse(erreurs.password)} />
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
            {submitting ? <><Loader2 className="h-4 w-4 animate-spin" />Enregistrement…</> : <><UserPlus className="h-4 w-4" />{isEdit ? 'Enregistrer' : 'Créer l’utilisateur'}</>}
          </button>
        </div>
      </div>
    </div>
  );
}