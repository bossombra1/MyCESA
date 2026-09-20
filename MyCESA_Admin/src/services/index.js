import api from './api';

/**
 * Service layer -- MyCESA_Admin
 *
 * Chaque service est relie a un endpoint reel du backend Node.js.
 * Les mappers traduisent les colonnes reelles de la base MySQL vers des
 * noms de champs generiques utilises par les pages React, et inversement
 * pour la creation / modification.
 *
 * Aucun champ 'fake' n'est jamais produit : seules les colonnes qui
 * existent vraiment en base sont exposees aux pages.
 */

// Helper: fetch + array mapping, renvoie {data: mappedArray}
const mappedGet = async (url, mapper) => {
  const { data } = await api.get(url);
  const arr = Array.isArray(data) ? data : (data?.data || data?.value || []);
  return { data: arr.map(mapper) };
};

// -- auth ----------------------------------------------------------
export const authService = {
  login: (Login_User, Password_User) =>
    api.post('/auth/login', { Login_User, Password_User }),
  me: () => api.get('/auth/me'),
  logout: () => { localStorage.removeItem('token'); localStorage.removeItem('user'); },
};

// -- statistiques (Dashboard) --------------------------------------
export const statistiquesService = { get: () => api.get('/statistiques') };
export const statsParFiliereService = { get: () => api.get('/stats/parFiliere') };
export const statsParCycleService = { get: () => api.get('/stats/parCycle') };
export const statsParClasseService = { get: () => api.get('/stats/parClasse') };
export const statsParGenreService = { get: () => api.get('/stats/parGenre') };
export const statsParRoleService = { get: () => api.get('/stats/parRole') };

// -- Configuration : sites / semestres / roles ---------------------
export const sitesService = { getAll: () => api.get('/sites') };
export const semestresService = { getAll: () => api.get('/semestres') };
export const rolesService = { getAll: () => api.get('/roles') };

// -- Utilisateurs : UTILISATEUR + ROLE -----------------------------
// GET /utilisateurs -> [{ Id_UTILISATEUR, Nom_User, Login_User, Email_User, Id_ROLE, Lib_Role }]
const userToClient = (u) => ({
  id: u.Id_UTILISATEUR,
  nom: u.Nom_User || '',
  login: u.Login_User || '',
  email: u.Email_User || '',
  role: u.Lib_Role || '',
  roleId: u.Id_ROLE ?? null,
});
export const utilisateursService = {
  getAll: () => mappedGet('/utilisateurs', userToClient),
  create: (payload) => api.post('/utilisateurs', {
    Nom_User: payload.nom,
    Login_User: payload.login,
    Email_User: payload.email || null,
    Password_User: payload.password || '123456',
    Id_ROLE: payload.roleId || 1,
  }),
  update: (id, payload) => api.put(`/utilisateurs/${id}`, {
    Nom_User: payload.nom,
    Login_User: payload.login,
    Email_User: payload.email || null,
    Id_ROLE: payload.roleId || 1,
  }),
  resetPassword: (id) => api.post(`/utilisateurs/${id}/reset-password`),
  delete: (id) => api.delete(`/utilisateurs/${id}`),
  toClient: userToClient,
};

// -- Professeurs : PROFESSEUR + MatieresArray ----------------------
// GET /professeurs -> [{ ..., MatieresArray: [{id,nom}] }]
const profToClient = (p) => ({
  id: p.Id_PROFESSEUR,
  nom: p.Nom_Prenoms_Profe || '',
  telephone: p.Tel_Profe || '',
  quartier: p.Quartier_Profe || '',
  email: p.email_Profe || '',
  dateNaissance: p.Date_Naissance || '',
  matieres: Array.isArray(p.MatieresArray) ? p.MatieresArray.map(m => m.nom) : [],
});
export const professeursService = {
  getAll: () => mappedGet('/professeurs', profToClient),
  create: (payload) => api.post('/professeurs', {
    Nom_Prenoms_Profe: payload.nom,
    Tel_Profe: payload.telephone || null,
    Quartier_Profe: payload.quartier || null,
    email_Profe: payload.email || null,
    Date_Naissance: payload.dateNaissance || null,
  }),
  update: (id, payload) => api.put(`/professeurs/${id}`, {
    Nom_Prenoms_Profe: payload.nom,
    Tel_Profe: payload.telephone || null,
    Quartier_Profe: payload.quartier || null,
    email_Profe: payload.email || null,
    Date_Naissance: payload.dateNaissance || null,
  }),
  delete: (id) => api.delete(`/professeurs/${id}`),
  toClient: profToClient,
};

// -- Etudiants : ETUDIANT + CLASSE + FILIERE + CYCLE_ --------------
// GET /etudiants -> [{ ..., Nom_Classe, Nom_Filiere, Lib_Cycle }]
const etudiantToClient = (e) => ({
  id: e.Id_ETUDIANT,
  matricule: e.Matricule_Etudiant || '',
  nom: e.Nom_Etudiant || '',
  prenoms: e.Prenoms_Etudiant || '',
  genre: e.Genre_Etudiant || '',
  telephone: e.Tel_Etudiant || '',
  email: e.Email_Etudiant || '',
  dateNaissance: e.Date_Naissance_Etudiant || '',
  lieuNaissance: e.Lieu_Naissance_Etudiant || '',
  quartier: e.Quartier_Etudiant || '',
  classe: e.Nom_Classe || '',
  classeId: e.Id_CLASSE ?? null,
  filiere: e.Nom_Filiere || '',
  filiereId: e.Id_FILIERE ?? null,
  cycle: e.Lib_Cycle || '',
});
export const etudiantsService = {
  getAll: () => mappedGet('/etudiants', etudiantToClient),
  getOne: async (id) => {
    const { data } = await api.get(`/etudiants/${id}`);
    return { data: etudiantToClient(data) };
  },
  create: (payload) => api.post('/etudiants', {
    Matricule_Etudiant: payload.matricule,
    Nom_Etudiant: payload.nom,
    Prenoms_Etudiant: payload.prenoms,
    Genre_Etudiant: payload.genre || null,
    Tel_Etudiant: payload.telephone || null,
    Email_Etudiant: payload.email || null,
    Date_Naissance_Etudiant: payload.dateNaissance || null,
    Lieu_Naissance_Etudiant: payload.lieuNaissance || null,
    Quartier_Etudiant: payload.quartier || null,
    Id_CLASSE: payload.classeId || null,
    Id_FILIERE: payload.filiereId || null,
  }),
  update: (id, payload) => api.put(`/etudiants/${id}`, {
    Nom_Etudiant: payload.nom,
    Prenoms_Etudiant: payload.prenoms,
    Genre_Etudiant: payload.genre || null,
    Tel_Etudiant: payload.telephone || null,
    Email_Etudiant: payload.email || null,
    Date_Naissance_Etudiant: payload.dateNaissance || null,
    Lieu_Naissance_Etudiant: payload.lieuNaissance || null,
    Quartier_Etudiant: payload.quartier || null,
    Id_CLASSE: payload.classeId || null,
    Id_FILIERE: payload.filiereId || null,
  }),
  delete: (id) => api.delete(`/etudiants/${id}`),
  toClient: etudiantToClient,
};

// -- Classes : CLASSE + FILIERE + CYCLE_ ---------------------------
// GET /classes -> [{ ..., Nom_Filiere, Lib_Cycle, Effectif_Reel }]
const classeToClient = (c) => ({
  id: c.Id_CLASSE,
  nom: c.Nom_Classe || '',
  filiere: c.Nom_Filiere || '',
  filiereId: c.Id_FILIERE ?? null,
  cycle: c.Lib_Cycle || '',
  effectif: c.Effectif_Reel ?? 0,
  capaciteMax: c.Effectif_Prevu_Etudiant ?? 0,
});
export const classesService = {
  getAll: () => mappedGet('/classes', classeToClient),
  create: (payload) => api.post('/classes', {
    Nom_Classe: payload.nom,
    Effectif_Prevu_Etudiant: payload.capaciteMax || 0,
    Id_FILIERE: payload.filiereId || null,
  }),
  update: (id, payload) => api.put(`/classes/${id}`, {
    Nom_Classe: payload.nom,
    Effectif_Prevu_Etudiant: payload.capaciteMax || 0,
    Id_FILIERE: payload.filiereId || null,
  }),
  delete: (id) => api.delete(`/classes/${id}`),
  toClient: classeToClient,
};

// -- Matieres : MATIERE --------------------------------------------
// GET /matieres -> [{ Id_MATIERE, Nom_Matiere }]
const matiereToClient = (m) => ({
  id: m.Id_MATIERE,
  nom: m.Nom_Matiere || '',
  code: m.Id_MATIERE || '',
});
export const matieresService = {
  getAll: () => mappedGet('/matieres', matiereToClient),
  create: (payload) => api.post('/matieres', { Nom_Matiere: payload.nom }),
  update: (id, payload) => api.put(`/matieres/${id}`, { Nom_Matiere: payload.nom }),
  delete: (id) => api.delete(`/matieres/${id}`),
  toClient: matiereToClient,
};

// -- Filieres : FILIERE + CYCLE_ -----------------------------------
// GET /filieres -> [{ Id_FILIERE, Nom_Filiere, Id_CYCLE }]
const filiereToClient = (f) => ({
  id: f.Id_FILIERE,
  nom: f.Nom_Filiere || '',
  code: f.Id_FILIERE || '',
  cycleId: f.Id_CYCLE ?? null,
});
export const filieresService = {
  getAll: () => mappedGet('/filieres', filiereToClient),
  create: (payload) => api.post('/filieres', {
    Nom_Filiere: payload.nom,
    Id_CYCLE: payload.cycleId || null,
  }),
  update: (id, payload) => api.put(`/filieres/${id}`, {
    Nom_Filiere: payload.nom,
    Id_CYCLE: payload.cycleId || null,
  }),
  delete: (id) => api.delete(`/filieres/${id}`),
  toClient: filiereToClient,
};

// -- Cycles : CYCLE_ + SITE ----------------------------------------
// GET /cycles -> [{ Id_CYCLE, Lib_Cycle, Id_SITE, Nom_Site }]
const cycleToClient = (c) => ({
  id: c.Id_CYCLE,
  nom: c.Lib_Cycle || '',
  code: c.Id_CYCLE || '',
  site: c.Nom_Site || '',
  siteId: c.Id_SITE ?? null,
});
export const cyclesService = {
  getAll: () => mappedGet('/cycles', cycleToClient),
  create: (payload) => api.post('/cycles', {
    Lib_Cycle: payload.nom,
    Id_SITE: payload.siteId || null,
  }),
  update: (id, payload) => api.put(`/cycles/${id}`, {
    Lib_Cycle: payload.nom,
    Id_SITE: payload.siteId || null,
  }),
  delete: (id) => api.delete(`/cycles/${id}`),
  toClient: cycleToClient,
};

// -- Salles : SALLE ------------------------------------------------
// GET /salles -> [{ Id_SALLE, Nom_Salle, Localisation_Salle, Superficie_Salle }]
const salleToClient = (s) => ({
  id: s.Id_SALLE,
  nom: s.Nom_Salle || '',
  code: s.Id_SALLE || '',
  localisation: s.Localisation_Salle || '',
  superficie: s.Superficie_Salle || '',
});
export const sallesService = {
  getAll: () => mappedGet('/salles', salleToClient),
  create: (payload) => api.post('/salles', {
    Nom_Salle: payload.nom,
    Localisation_Salle: payload.localisation || null,
    Superficie_Salle: payload.superficie || null,
  }),
  update: (id, payload) => api.put(`/salles/${id}`, {
    Nom_Salle: payload.nom,
    Localisation_Salle: payload.localisation || null,
    Superficie_Salle: payload.superficie || null,
  }),
  delete: (id) => api.delete(`/salles/${id}`),
  toClient: salleToClient,
};

// -- Notes & Evaluations : /notes + /evaluations -------------------
// GET /notes -> [{ Matricule_Etudiant, Nom_Complet, Nom_Matiere, Lib_Sem, ... }]
// GET /evaluations -> [{ ..., Lib_Sem, Annee_Academique_Semestre }]
const noteToClient = (n) => ({
  id: n.Id_EVALUATION,
  matricule: n.Matricule_Etudiant || '',
  etudiant: n.Nom_Complet || '',
  classe: n.Nom_Classe || '',
  matiere: n.Nom_Matiere || '',
  semestre: n.Lib_Sem || '',
  type: n.Type_Evaluation || '',
  note: n.Note_Evaluation ?? null,
  coefficient: n.Coef_Evaluation ?? 1,
  professeur: n.Nom_Professeur || '',
  dateEvaluation: n.Date_Evaluation || '',
});
export const notesService = {
  getAll: () => mappedGet('/notes', noteToClient),
  getEvaluations: () => mappedGet('/evaluations', (e) => ({
    id: e.Id_EVALUATION,
    libelle: e.Lib_Evaluation || '',
    date: e.Date_Evaluation || '',
    coef: e.Coef_Evaluation ?? 1,
    type: e.Type_Evaluation || '',
    semestre: e.Lib_Sem || '',
  })),
  create: (payload) => api.post('/evaluations/saisie', {
    Id_ETUDIANT: payload.etudiantId,
    Id_MATIERE: payload.matiereId,
    Id_PROFESSEUR: payload.professeurId || null,
    Note: payload.note,
    Semestre: payload.semestreId || 1,
    Type: payload.type || 'Devoir',
    Coef: payload.coef || 1,
  }),
  toClient: noteToClient,
};

// -- Absences : ABSENTER -------------------------------------------
// GET /absences -> [{ ..., Nom_Etudiant, Prenoms_Etudiant, Matricule_Etudiant, ... }]
const absenceToClient = (a) => ({
  id: a.Id_ETUDIANT,
  matricule: a.Matricule_Etudiant || '',
  etudiant: `${a.Nom_Etudiant || ''} ${a.Prenoms_Etudiant || ''}`.trim() || '',
  classe: a.Nom_Classe || '',
  date: a.Date_absence || '',
  heures: parseFloat(a.Nbre_heure) || 0,
  justifiee: a.Justifiee === 1,
  saisiePar: a.Saisie_Par || '',
});
export const absencesService = {
  getAll: () => mappedGet('/absences', absenceToClient),
  create: (payload) => api.post('/absences', {
    Id_ETUDIANT: payload.etudiantId,
    Date_absence: payload.date,
    Nbre_heure: payload.heures || 1,
    Justifiee: payload.justifiee ? 1 : 0,
  }),
  justifier: (payload) => api.put('/absences/justifier', {
    Id_ETUDIANT: payload.etudiantId,
    Date_absence: payload.date,
    Id_UTILISATEUR: payload.utilisateurId,
  }),
  delete: (payload) => api.delete('/absences', {
    data: {
      Id_ETUDIANT: payload.etudiantId,
      Date_absence: payload.date,
      Id_UTILISATEUR: payload.utilisateurId,
    },
  }),
  toClient: absenceToClient,
};

// -- Versements : VERSEMENT + VERSER -------------------------------
// GET /versements -> [{ ..., Nom_Etudiant, Prenoms_Etudiant, Matricule_Etudiant, ... }]
const paiementToClient = (v) => ({
  id: v.Id_VERSEMENT,
  matricule: v.Matricule_Etudiant || '',
  etudiant: `${v.Nom_Etudiant || ''} ${v.Prenoms_Etudiant || ''}`.trim() || '',
  classe: v.Nom_Classe || '',
  type: v.Lib_Versement || '',
  montant: parseFloat(v.Montant_Total) || 0,
  montantPaye: parseFloat(v.Montant) || 0,
  dateVersement: v.Date_Versement || '',
  statut: v.Statut || 'Impaye',
  etudiantId: v.Id_ETUDIANT ?? null,
});
export const paiementsService = {
  getAll: () => mappedGet('/versements', paiementToClient),
  getDetail: (id) => api.get(`/versements/etudiant/detail/${id}`),
  create: (payload) => api.post('/versements', {
    Id_ETUDIANT: payload.etudiantId,
    Lib_Versement: payload.type,
    Montant: payload.montant,
    Montant_Total: payload.montantTotal,
  }),
  update: (id, payload) => api.put(`/versements/${id}`, {
    Id_ETUDIANT: payload.etudiantId,
    Lib_Versement: payload.type,
    Montant: payload.montant,
    Montant_Total: payload.montantTotal,
  }),
  delete: (id) => api.delete(`/versements/${id}`),
  toClient: paiementToClient,
};

// -- Evenements : EVENEMENT_ECOLE ----------------------------------
// GET /evenements -> [{ Id_Evenement, Titre, Description, Date_Evenement, Type, ... }]
const evenementToClient = (e) => ({
  id: e.Id_Evenement,
  title: e.Titre || '',
  description: e.Description || '',
  date: e.Date_Evenement || '',
  type: e.Type || 'examen',
  idClasse: e.Id_Classe ?? null,
  idFiliere: e.Id_Filiere ?? null,
  pourTous: e.Pour_Tous === 1,
  dateCreation: e.CreatedAt || '',
});
export const evenementsService = {
  getAll: () => mappedGet('/evenements', evenementToClient),
  create: (payload) => api.post('/evenements', {
    Titre: payload.title,
    Description: payload.description || null,
    Date_Evenement: payload.date,
    Type: payload.type || 'examen',
    Id_Classe: payload.idClasse || null,
    Id_Filiere: payload.idFiliere || null,
    Pour_Tous: payload.pourTous ? 1 : 0,
  }),
  update: (id, payload) => api.put(`/evenements/${id}`, {
    Titre: payload.title,
    Description: payload.description || null,
    Date_Evenement: payload.date,
    Type: payload.type || 'examen',
    Id_Classe: payload.idClasse || null,
    Id_Filiere: payload.idFiliere || null,
    Pour_Tous: payload.pourTous ? 1 : 0,
  }),
  delete: (id) => api.delete(`/evenements/${id}`),
  toClient: evenementToClient,
};

// -- Notifications : /notifications/admin/liste --------------------
// GET /notifications/admin/liste -> [{ id, Titre_Notif, Message_Notif, Type, ... }]
const notifToClient = (n) => ({
  id: n.id,
  titre: n.Titre_Notif || '',
  message: n.Message_Notif || '',
  type: n.Type || 'autre',
  cible: n.Cible || 'tous',
  idFiliere: n.Id_Filiere ?? null,
  idClasse: n.Id_Classe ?? null,
  idEtudiant: n.Id_Etudiant ?? null,
  dateProgrammee: n.Scheduled_At || '',
  dateEnvoi: n.Sent_At || '',
  dateCreation: n.Date_Notif || '',
  auteur: n.created_by ?? null,
  destinataires: n.total_recipients || 0,
  lues: n.total_lus || 0,
  envoyee: n.Sent_At ? 'Envoyee' : 'Programmee',
});
export const notificationsService = {
  getAll: () => mappedGet('/notifications/admin/liste', notifToClient),
  create: (payload) => api.post('/notifications/send-cible', {
    Titre_Notif: payload.titre,
    Message_Notif: payload.message,
    Type: payload.type || 'autre',
    Cible: payload.cible || 'tous',
    Id_Filiere: payload.idFiliere || null,
    Id_Classe: payload.idClasse || null,
    Id_Etudiant: payload.idEtudiant || null,
    Scheduled_At: payload.dateProgrammee || null,
  }),
  delete: (id) => api.delete(`/notifications/admin/${id}`),
  toClient: notifToClient,
};

// -- Emplois du temps fichiers : /emplois-du-temps ----------------
// L'API renvoie des groupes par classe : { classe_id, actif, historique }.
const serializeFileToClient = (file) => file ? ({
  ...file,
  id: file.id,
  classe_id: file.classe_id,
  nom_fichier_original: file.nom_fichier_original || '',
  type_mime: file.type_mime || '',
}) : null;
const serializeGroupToClient = (group) => ({
  classe_id: group.classe_id,
  nom_classe: group.nom_classe || `Classe ${group.classe_id}`,
  actif: serializeFileToClient(group.actif),
  historique: Array.isArray(group.historique) ? group.historique.map(serializeFileToClient) : [],
});
export const emploisDuTempsService = {
  getAll: async () => {
    const { data } = await api.get('/emplois-du-temps');
    const groups = Array.isArray(data) ? data : (data?.data || data?.value || []);
    return { data: Array.isArray(groups) ? groups.map(serializeGroupToClient) : [] };
  },
  upload: (classeId, file) => {
    const form = new FormData();
    form.append('file', file);
    form.append('classe_id', String(classeId));
    return api.post('/emplois-du-temps/upload', form, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },
  download: (id) => api.get(`/emplois-du-temps/${id}/download`, {
    responseType: 'blob',
  }),
  preview: (id) => api.get(`/emplois-du-temps/${id}/download?inline=1`, {
    responseType: 'blob',
  }),
  /**
   * Fichier publie (le plus recent) d'une classe.
   *
   * GET /emplois-du-temps?classe_id=X renvoie selon le backend :
   *   - un objet groupe  { classe_id, nom_classe, actif, historique }
   *   - un tableau de groupes
   *   - un objet { value: [...] }
   * On cherche donc TOUJOURS la propriete `actif` : prendre le premier element
   * d'un tableau renvoyait un groupe, jamais un fichier.
   */
  getFichierApercu: async (classeId) => {
    const { data } = await api.get('/emplois-du-temps', { params: { classe_id: classeId } });
    const groupes = Array.isArray(data)
      ? data
      : (Array.isArray(data?.value) ? data.value : (data && typeof data === 'object' ? [data] : []));
    const fichierActif = groupes
      .map((groupe) => serializeGroupToClient(groupe).actif)
      .find((fichier) => fichier?.id);
    if (!fichierActif) return { data: null, fichier: null };

    const blob = await api.get(`/emplois-du-temps/${fichierActif.id}/download?inline=1`, { responseType: 'blob' });
    return { ...blob, fichier: fichierActif };
  },
  delete: (id) => api.delete(`/emplois-du-temps/${id}`),
  toClient: serializeGroupToClient,
};

// -- Creneaux d'emploi du temps : EMPLOI_TEMPS ---------------------
// GET /emploiTemps -> [{ IdEmploi, Id_PROFESSEUR, Id_SALLE, Id_MATIERE, Id_CLASSE,
//                        date_, Heure_Debut, Heure_Fin, Jour_Semaine,
//                        Nom_Matiere, Nom_Salle, Nom_Professeur, Nom_Classe }]
// La cle metier d'un creneau est le tuple (prof, salle, matiere, classe, jour, heure)
// car la table EMPLOI_TEMPS n'a pas de contrainte unique exploitable cote API.
const dureeEnMinutes = (debut, fin) => {
  const [h1, m1] = String(debut || '').split(':').map(Number);
  const [h2, m2] = String(fin || '').split(':').map(Number);
  if (![h1, m1, h2, m2].every(Number.isFinite)) return 0;
  return Math.max(0, (h2 * 60 + m2) - (h1 * 60 + m1));
};

// Le backend (mysql2) serialise parfois les TIME en objet { heures, minutes }.
const heureVersTexte = (valeur) => {
  if (valeur == null || valeur === '') return '';
  if (typeof valeur === 'object') {
    // mysql2 renvoie parfois un TIME sous la forme { heures, minutes }
    // (casse variable selon la version) : on accepte les deux graphies.
    const heures = valeur.heures ?? valeur.hours ?? valeur.Heures ?? valeur.Hours ?? 0;
    const minutes = valeur.minutes ?? valeur.Minutes ?? 0;
    return `${String(heures).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;
  }
  return String(valeur).slice(0, 5);
};

const creneauToClient = (c) => {
  const heureDebut = heureVersTexte(c.Heure_Debut);
  const heureFin = heureVersTexte(c.Heure_Fin);
  return {
    // La table reelle possede IdEmploi (PRIMARY KEY auto_increment) ; la colonne
    // historique IdEmploi_Temps (varchar) sert de repli pour les anciennes bases.
    id: c.IdEmploi ?? c.IdEmploi_Temps ?? null,
    classeId: c.Id_CLASSE,
    classe: c.Nom_Classe || '',
    matiereId: c.Id_MATIERE,
    matiere: c.Nom_Matiere || '',
    professeurId: c.Id_PROFESSEUR,
    professeur: c.Nom_Professeur || '',
    salleId: c.Id_SALLE,
    salle: c.Nom_Salle || '',
    jour: c.Jour_Semaine || '',
    heureDebut,
    heureFin,
    date: c.date_ || '',
    dureeMinutes: dureeEnMinutes(heureDebut, heureFin),
  };
};

/** Payload attendu par POST/PUT/DELETE /emploiTemps (colonnes brutes de la base). */
const creneauVersApi = (payload) => ({
  Id_PROFESSEUR: Number(payload.professeurId),
  Id_SALLE: Number(payload.salleId),
  Id_MATIERE: Number(payload.matiereId),
  Id_CLASSE: Number(payload.classeId),
  Jour_Semaine: payload.jour,
  Heure_Debut: payload.heureDebut,
  Heure_Fin: payload.heureFin,
  Date_Debut: payload.dateDebut || null,
});

/** Le backend identifie un creneau par les valeurs de l'ancien creneau (PUT) ou du creneau (DELETE). */
const identiteCreneau = (creneau) => ({
  Id_PROFESSEUR: Number(creneau.professeurId),
  Id_SALLE: Number(creneau.salleId),
  Id_MATIERE: Number(creneau.matiereId),
  Id_CLASSE: Number(creneau.classeId),
  Jour_Semaine: creneau.jour,
  Heure_Debut: creneau.heureDebut,
});

export const creneauxService = {
  getAll: (classeId) => mappedGet(
    classeId ? `/emploiTemps?classe=${encodeURIComponent(classeId)}` : '/emploiTemps',
    creneauToClient,
  ),
  create: (creneau) => api.post('/emploiTemps', creneauVersApi(creneau)),
  update: (ancien, nouveau) => api.put('/emploiTemps/slot', {
    ancien: identiteCreneau(ancien),
    nouveau: creneauVersApi(nouveau),
  }),
  delete: (creneau) => api.delete('/emploiTemps/slot', { data: identiteCreneau(creneau) }),
  getArchive: (classeId) => mappedGet(
    classeId ? `/emploiTemps/archive?classe=${encodeURIComponent(classeId)}` : '/emploiTemps/archive',
    (a) => ({
      id: a.Id_Archive,
      classe: a.Nom_Classe || '',
      matiere: a.Nom_Matiere || '',
      professeur: a.Nom_Professeur || '',
      salle: a.Nom_Salle || '',
      jour: a.Jour_Semaine || '',
      heureDebut: heureVersTexte(a.Heure_Debut),
      heureFin: heureVersTexte(a.Heure_Fin),
      date: a.date_ || '',
      action: a.Action_Archive || '',
      dateArchive: a.Date_Archive || '',
    }),
  ),
  toClient: creneauToClient,
  identite: identiteCreneau,
};

// -- Enseignements : ENSEIGNER (Prof <-> Matiere) ------------------
// GET /enseigner -> [{ Id_PROFESSEUR, Id_MATIERE }]
const enseignementToClient = (e) => ({
  id: `${e.Id_PROFESSEUR}_${e.Id_MATIERE}`,
  professeurId: e.Id_PROFESSEUR,
  matiereId: e.Id_MATIERE,
});
export const enseignementsService = {
  getAll: () => mappedGet('/enseigner', enseignementToClient),
  create: (payload) => api.post('/enseigner', {
    Id_PROFESSEUR: payload.professeurId,
    Id_MATIERE: payload.matiereId,
  }),
  delete: (payload) => api.delete('/enseigner', {
    data: {
      Id_PROFESSEUR: payload.professeurId,
      Id_MATIERE: payload.matiereId,
    },
  }),
  toClient: enseignementToClient,
};