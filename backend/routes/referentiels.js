// routes/referentiels.js — Tables de référence réellement présentes en base :
// SITE, SEMESTRE, ROLE. Utilisées par la page Configuration et les formulaires.
const express = require('express');
const router = express.Router();
const db = require('../config/db');
const auth = require('../middleware/authMiddleware');

// SITE(Id_SITE, Nom_Site, Localisation_Site, Contact_Site)
router.get('/sites', auth, async (req, res) => {
  try {
    const [rows] = await db.query(
      'SELECT Id_SITE, Nom_Site, Localisation_Site, Contact_Site FROM SITE ORDER BY Nom_Site',
    );
    res.json(rows);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// SEMESTRE(Id_SEMESTRE, Lib_Sem, Annee_Academique_Semestre)
router.get('/semestres', auth, async (req, res) => {
  try {
    const [rows] = await db.query(
      'SELECT Id_SEMESTRE, Lib_Sem, Annee_Academique_Semestre FROM SEMESTRE ORDER BY Annee_Academique_Semestre DESC, Lib_Sem',
    );
    res.json(rows);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// ROLE(Id_ROLE, Lib_Role)
router.get('/roles', auth, async (req, res) => {
  try {
    const [rows] = await db.query('SELECT Id_ROLE, Lib_Role FROM ROLE ORDER BY Id_ROLE');
    res.json(rows);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// Statistiques globales réelles (page Tableau de bord / Configuration).
router.get('/statistiques', auth, async (req, res) => {
  try {
    const [[etudiants]] = await db.query('SELECT COUNT(*) AS total FROM ETUDIANT');
    const [[professeurs]] = await db.query('SELECT COUNT(*) AS total FROM PROFESSEUR');
    const [[classes]] = await db.query('SELECT COUNT(*) AS total FROM CLASSE');
    const [[matieres]] = await db.query('SELECT COUNT(*) AS total FROM MATIERE');
    const [[salles]] = await db.query('SELECT COUNT(*) AS total FROM SALLE');
    const [[filieres]] = await db.query('SELECT COUNT(*) AS total FROM FILIERE');
    const [[cycles]] = await db.query('SELECT COUNT(*) AS total FROM CYCLE_');
    const [[utilisateurs]] = await db.query('SELECT COUNT(*) AS total FROM UTILISATEUR');
    const [[evenements]] = await db.query('SELECT COUNT(*) AS total FROM EVENEMENT_ECOLE');
    const [[absences]] = await db.query('SELECT COUNT(*) AS total FROM ABSENTER');
    const [[absencesNonJustifiees]] = await db.query('SELECT COUNT(*) AS total FROM ABSENTER WHERE Justifiee = 0');
    const [[notes]] = await db.query('SELECT COUNT(*) AS total FROM NOTATION');
    const [[creneaux]] = await db.query('SELECT COUNT(*) AS total FROM EMPLOI_TEMPS');
    const [[emploisPublies]] = await db.query('SELECT COUNT(*) AS total FROM EMPLOI_DU_TEMPS_FICHIER');
    const [[versements]] = await db.query('SELECT COUNT(*) AS total FROM VERSEMENT');
    const [[montantVerse]] = await db.query('SELECT COALESCE(SUM(Montant), 0) AS total FROM VERSER');

    res.json({
      etudiants: etudiants.total,
      professeurs: professeurs.total,
      classes: classes.total,
      matieres: matieres.total,
      salles: salles.total,
      filieres: filieres.total,
      cycles: cycles.total,
      utilisateurs: utilisateurs.total,
      evenements: evenements.total,
      absences: absences.total,
      absencesNonJustifiees: absencesNonJustifiees.total,
      notes: notes.total,
      creneaux: creneaux.total,
      emploisPublies: emploisPublies.total,
      versements: versements.total,
      montantVerse: Number(montantVerse.total) || 0,
    });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// Données pour graphique : répartition par filière (pour le dashboard)
router.get('/stats/parFiliere', auth, async (req, res) => {
  try {
    const [rows] = await db.query(
      `SELECT f.Nom_Filiere, COUNT(e.Id_ETUDIANT) AS nbEtudiants
       FROM FILIERE f LEFT JOIN ETUDIANT e ON f.Id_FILIERE = e.Id_FILIERE
       GROUP BY f.Id_FILIERE, f.Nom_Filiere
       ORDER BY nbEtudiants DESC`
    );
    res.json(rows.map(r => ({ label: r.Nom_Filiere || 'Sans filière', value: Number(r.nbEtudiants) || 0 })));
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// Données pour graphique : répartition par cycle
router.get('/stats/parCycle', auth, async (req, res) => {
  try {
    const [rows] = await db.query(
      `SELECT c.Lib_Cycle, COUNT(e.Id_ETUDIANT) AS nbEtudiants
       FROM CYCLE_ c LEFT JOIN FILIERE f ON c.Id_CYCLE = f.Id_CYCLE
                       LEFT JOIN ETUDIANT e ON f.Id_FILIERE = e.Id_FILIERE
       GROUP BY c.Id_CYCLE, c.Lib_Cycle
       ORDER BY nbEtudiants DESC`
    );
    res.json(rows.map(r => ({ label: r.Lib_Cycle || 'Sans cycle', value: Number(r.nbEtudiants) || 0 })));
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// Données pour graphique : effectifs par classe
router.get('/stats/parClasse', auth, async (req, res) => {
  try {
    const [rows] = await db.query(
      `SELECT cl.Nom_Classe, cl.Effectif_Reel AS nbEtudiants
       FROM CLASSE cl
       ORDER BY cl.Nom_Classe`
    );
    res.json(rows.map(r => ({ label: r.Nom_Classe || 'Sans nom', value: Number(r.nbEtudiants) || 0 })));
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// Données pour graphique : répartition par genre des étudiants
router.get('/stats/parGenre', auth, async (req, res) => {
  try {
    const [rows] = await db.query(
      `SELECT Genre_Etudiant, COUNT(*) AS nb
       FROM ETUDIANT
       GROUP BY Genre_Etudiant`
    );
    res.json(rows.map(r => ({ label: r.Genre_Etudiant === 'M' ? 'Masculin' : r.Genre_Etudiant === 'F' ? 'Féminin' : 'Autre', value: Number(r.nb) || 0 })));
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// Données pour graphique : utilisateurs par rôle
router.get('/stats/parRole', auth, async (req, res) => {
  try {
    const [rows] = await db.query(
      `SELECT r.Lib_Role, COUNT(u.Id_USER) AS nb
       FROM ROLE r LEFT JOIN UTILISATEUR u ON r.Id_ROLE = u.Id_ROLE
       GROUP BY r.Id_ROLE, r.Lib_Role
       ORDER BY nb DESC`
    );
    res.json(rows.map(r => ({ label: r.Lib_Role || 'Sans rôle', value: Number(r.nb) || 0 })));
  } catch (err) { res.status(500).json({ error: err.message }); }
});

module.exports = router;