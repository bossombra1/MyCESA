const express = require('express');
const router  = express.Router();
const db      = require('../config/db');
const auth    = require('../middleware/authMiddleware');

// GET tous les créneaux (admin) avec filtre par classe
router.get('/', auth, async (req, res) => {
  try {
    const { classe } = req.query;
    let query = `
      SELECT et.*, m.Nom_Matiere, s.Nom_Salle,
             p.Nom_Prenoms_Profe AS Nom_Professeur,
             c.Nom_Classe
      FROM EMPLOI_TEMPS et
      JOIN MATIERE m ON et.Id_MATIERE = m.Id_MATIERE
      JOIN SALLE s ON et.Id_SALLE = s.Id_SALLE
      JOIN PROFESSEUR p ON et.Id_PROFESSEUR = p.Id_PROFESSEUR
      JOIN CLASSE c ON et.Id_CLASSE = c.Id_CLASSE
    `;
    const params = [];
    if (classe) {
      query += ' WHERE et.Id_CLASSE = ?';
      params.push(classe);
    }
    query += ` ORDER BY FIELD(et.Jour_Semaine,'Lundi','Mardi','Mercredi','Jeudi','Vendredi','Samedi'), et.Heure_Debut`;
    const [rows] = await db.query(query, params);
    res.json(rows);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// 1. GET emploi du temps d'un professeur pour UNE DATE PRÉCISE (Mobile)
// Route : /api/emploiTemps/prof/:idProf?date=2026-03-16
router.get('/prof/:idProf', async (req, res) => {
    try {
        const { idProf } = req.params;
        const { date } = req.query;

        if (!date) {
            return res.status(400).json({ error: "La date est requise (YYYY-MM-DD)" });
        }

        // J'ai harmonisé les noms des colonnes (Nom_Matiere, Nom_Classe, etc.)
        const [rows] = await db.query(
            `SELECT
                et.*,
                m.Nom_Matiere,
                c.Nom_Classe,
                s.Nom_Salle
            FROM EMPLOI_TEMPS et
            JOIN MATIERE m ON et.Id_MATIERE = m.Id_MATIERE
            JOIN CLASSE c ON et.Id_CLASSE = c.Id_CLASSE
            JOIN SALLE s ON et.Id_SALLE = s.Id_SALLE
            WHERE et.Id_PROFESSEUR = ?
            AND DATE(et.date_) = ?
            ORDER BY et.Heure_Debut ASC`,
            [idProf, date]
        );

        res.json(rows);
    } catch (err) {
        console.error("Erreur SQL Emploi du Temps Prof:", err);
        res.status(500).json({ error: err.message });
    }
});

// 2. GET emploi du temps d'un professeur (via Id_UTILISATEUR) - avec filtre date optionnel
router.get('/professeur/:id', auth, async (req, res) => {
    try {
        const [prof] = await db.query(
            `SELECT p.Id_PROFESSEUR FROM PROFESSEUR p
             JOIN UTILISATEUR u ON u.Email_User = p.email_Profe
             WHERE u.Id_UTILISATEUR = ?`,
            [req.params.id]
        );

        if (!prof.length) return res.json([]);

        let query = `SELECT et.*, m.Nom_Matiere, s.Nom_Salle, c.Nom_Classe
             FROM EMPLOI_TEMPS et
             JOIN MATIERE m ON et.Id_MATIERE = m.Id_MATIERE
             JOIN SALLE s   ON et.Id_SALLE   = s.Id_SALLE
             JOIN CLASSE c  ON et.Id_CLASSE  = c.Id_CLASSE
             WHERE et.Id_PROFESSEUR = ?`;
        let params = [prof[0].Id_PROFESSEUR];

        if (req.query.date) {
            query += ` AND DATE(et.date_) = ?`;
            params.push(req.query.date);
        }

        query += ` ORDER BY FIELD(et.Jour_Semaine,'Lundi','Mardi','Mercredi','Jeudi','Vendredi','Samedi'),
                      et.Heure_Debut`;

        const [rows] = await db.query(query, params);
        res.json(rows);
    } catch (err) { res.status(500).json({ error: err.message }); }
});

// GET emploi du temps d'un étudiant (via Id_UTILISATEUR)
router.get('/etudiant/:id', auth, async (req, res) => {
  try {
    // Trouver la classe de l'étudiant via son email
    const [etudiant] = await db.query(
      `SELECT e.Id_CLASSE FROM ETUDIANT e
       JOIN UTILISATEUR u ON u.Email_User = e.Email_Etudiant
       WHERE u.Id_UTILISATEUR = ?`,
      [req.params.id]
    );
    if (!etudiant.length) return res.json([]);

    const [rows] = await db.query(
      `SELECT et.*, m.Nom_Matiere, s.Nom_Salle, s.Localisation_Salle,
              p.Nom_Prenoms_Profe AS Nom_Professeur
       FROM EMPLOI_TEMPS et
       JOIN MATIERE m ON et.Id_MATIERE = m.Id_MATIERE
       JOIN SALLE s ON et.Id_SALLE = s.Id_SALLE
       JOIN PROFESSEUR p ON et.Id_PROFESSEUR = p.Id_PROFESSEUR
       WHERE et.Id_CLASSE = ?
       ORDER BY FIELD(et.Jour_Semaine,'Lundi','Mardi','Mercredi','Jeudi','Vendredi','Samedi'),
                et.Heure_Debut`,
      [etudiant[0].Id_CLASSE]
    );
    res.json(rows);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// POST ajouter un créneau
router.post('/', auth, async (req, res) => {
  try {
    const { Id_PROFESSEUR, Id_SALLE, Id_MATIERE, Id_CLASSE, Jour_Semaine, Heure_Debut, Heure_Fin } = req.body;

    // Vérifier conflit de salle
    const [conflitSalle] = await db.query(`
      SELECT * FROM EMPLOI_TEMPS
      WHERE Id_SALLE = ? AND Jour_Semaine = ?
      AND NOT (Heure_Fin <= ? OR Heure_Debut >= ?)
    `, [Id_SALLE, Jour_Semaine, Heure_Debut, Heure_Fin]);

    if (conflitSalle.length > 0) {
      return res.status(409).json({ error: 'Cette salle est déjà occupée à ce créneau !' });
    }

    // Vérifier conflit de professeur
    const [conflitProf] = await db.query(`
      SELECT * FROM EMPLOI_TEMPS
      WHERE Id_PROFESSEUR = ? AND Jour_Semaine = ?
      AND NOT (Heure_Fin <= ? OR Heure_Debut >= ?)
    `, [Id_PROFESSEUR, Jour_Semaine, Heure_Debut, Heure_Fin]);

    if (conflitProf.length > 0) {
      return res.status(409).json({ error: 'Ce professeur a déjà un cours à ce créneau !' });
    }

    await db.query(
      `INSERT INTO EMPLOI_TEMPS
       (Id_PROFESSEUR, Id_SALLE, Id_MATIERE, Id_CLASSE, Jour_Semaine, Heure_Debut, Heure_Fin)
       VALUES (?,?,?,?,?,?,?)`,
      [Id_PROFESSEUR, Id_SALLE, Id_MATIERE, Id_CLASSE, Jour_Semaine, Heure_Debut, Heure_Fin]
    );
    res.status(201).json({ message: 'Créneau ajouté avec succès' });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// DELETE supprimer un créneau
router.delete('/', auth, async (req, res) => {
  try {
    const { Id_PROFESSEUR, Id_SALLE, Id_MATIERE, Id_CLASSE } = req.body;
    await db.query(
      `DELETE FROM EMPLOI_TEMPS
       WHERE Id_PROFESSEUR = ? AND Id_SALLE = ? AND Id_MATIERE = ? AND Id_CLASSE = ?`,
      [Id_PROFESSEUR, Id_SALLE, Id_MATIERE, Id_CLASSE]
    );
    res.json({ message: 'Créneau supprimé avec succès' });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

module.exports = router;
    await db.query(
      'DELETE FROM EMPLOI_TEMPS WHERE Id_PROFESSEUR=? AND Id_SALLE=? AND Id_MATIERE=? AND Id_CLASSE=?',
      [Id_PROFESSEUR, Id_SALLE, Id_MATIERE, Id_CLASSE]
    );
    res.json({ message: 'Créneau supprimé' });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

module.exports = router;
=======
// 3. GET emploi du temps d'un étudiant
router.get('/etudiant/:id', auth, async (req, res) => {
    try {
        const [etudiant] = await db.query(
            `SELECT e.Id_CLASSE FROM ETUDIANT e
             JOIN UTILISATEUR u ON u.Email_User = e.Email_Etudiant
             WHERE u.Id_UTILISATEUR = ?`,
            [req.params.id]
        );
        if (!etudiant.length) return res.json([]);

        const [rows] = await db.query(
            `SELECT et.*, m.Nom_Matiere, s.Nom_Salle, s.Localisation_Salle,
                    p.Nom_Prenoms_Profe AS Nom_Professeur
             FROM EMPLOI_TEMPS et
             JOIN MATIERE m ON et.Id_MATIERE = m.Id_MATIERE
             JOIN SALLE s ON et.Id_SALLE = s.Id_SALLE
             JOIN PROFESSEUR p ON et.Id_PROFESSEUR = p.Id_PROFESSEUR
             WHERE et.Id_CLASSE = ?
             ORDER BY FIELD(et.Jour_Semaine,'Lundi','Mardi','Mercredi','Jeudi','Vendredi','Samedi'),
                      et.Heure_Debut`,
            [etudiant[0].Id_CLASSE]
        );
        res.json(rows);
    } catch (err) { res.status(500).json({ error: err.message }); }
});

module.exports = router;
>>>>>>> 3c04ff3 (Fix: Correction de l'erreur 404 pour l'emploi du temps prof mobile)
