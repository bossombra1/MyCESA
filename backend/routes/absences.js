// routes/absences.js — Gestion des absences
const express = require('express');
const router  = express.Router();
const db      = require('../config/db');
const auth    = require('../middleware/authMiddleware');

// GET absences d'un étudiant
router.get('/etudiant/:id', auth, async (req, res) => {
  try {
    const [etudiant] = await db.query(
      `SELECT e.Id_ETUDIANT FROM ETUDIANT e
       JOIN UTILISATEUR u ON u.Email_User = e.Email_Etudiant
       WHERE u.Id_UTILISATEUR = ?`,
      [req.params.id]
    );
    if (!etudiant.length) return res.json({ absences: [], totalHeures: 0 });

    const [rows] = await db.query(
      `SELECT a.*, u.Nom_User AS Saisie_Par
       FROM ABSENTER a
       LEFT JOIN UTILISATEUR u ON a.Id_UTILISATEUR = u.Id_UTILISATEUR
       WHERE a.Id_ETUDIANT = ?
       ORDER BY a.Date_absence DESC`,
      [etudiant[0].Id_ETUDIANT]
    );
    const totalHeures = rows.reduce((sum, r) => sum + (parseFloat(r.Nbre_heure) || 0), 0);
    res.json({ absences: rows, totalHeures });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// GET absences du jour (toutes classes)
router.get('/jour/:date', auth, async (req, res) => {
  try {
    const [rows] = await db.query(
      `SELECT a.*, e.Nom_Etudiant, e.Prenoms_Etudiant, e.Matricule_Etudiant,
              c.Nom_Classe
       FROM ABSENTER a
       JOIN ETUDIANT e ON a.Id_ETUDIANT = e.Id_ETUDIANT
       LEFT JOIN CLASSE c ON e.Id_CLASSE = c.Id_CLASSE
       WHERE a.Date_absence = ?
       ORDER BY c.Nom_Classe, e.Nom_Etudiant`,
      [req.params.date]
    );
    res.json(rows);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// POST enregistrer une absence
router.post('/', auth, async (req, res) => {
  try {
    const { Id_ETUDIANT, Date_absence, Nbre_heure, Justifiee } = req.body;

    if (!Id_ETUDIANT || !Date_absence) {
      return res.status(400).json({ error: 'Étudiant et date requis' });
    }

    await db.query(
      `INSERT INTO ABSENTER (Id_ETUDIANT, Id_UTILISATEUR, Date_absence, Nbre_heure, Justifiee)
       VALUES (?,?,?,?,?)
       ON DUPLICATE KEY UPDATE Nbre_heure = VALUES(Nbre_heure), Justifiee = VALUES(Justifiee)`,
      [Id_ETUDIANT, req.user.id, Date_absence, Nbre_heure || 1, Justifiee || 0]
    );
    res.status(201).json({ message: 'Absence enregistrée' });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// PUT justifier une absence
router.put('/justifier', auth, async (req, res) => {
  try {
    const { Id_ETUDIANT, Date_absence, Id_UTILISATEUR } = req.body;
    await db.query(
      `UPDATE ABSENTER SET Justifiee = 1
       WHERE Id_ETUDIANT = ? AND Date_absence = ? AND Id_UTILISATEUR = ?`,
      [Id_ETUDIANT, Date_absence, Id_UTILISATEUR]
    );
    res.json({ message: 'Absence justifiée' });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// DELETE supprimer une absence
router.delete('/', auth, async (req, res) => {
  try {
    const { Id_ETUDIANT, Date_absence, Id_UTILISATEUR } = req.body;
    await db.query(
      'DELETE FROM ABSENTER WHERE Id_ETUDIANT=? AND Date_absence=? AND Id_UTILISATEUR=?',
      [Id_ETUDIANT, Date_absence, Id_UTILISATEUR]
    );
    res.json({ message: 'Absence supprimée' });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

module.exports = router;
