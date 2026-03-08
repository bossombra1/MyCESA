// routes/professeurs.js — CRUD Professeurs
const express = require('express');
const router  = express.Router();
const db      = require('../config/db');
const auth    = require('../middleware/authMiddleware');

// GET tous les professeurs
router.get('/', auth, async (req, res) => {
  try {
    const [rows] = await db.query(
      `SELECT p.*, GROUP_CONCAT(m.Nom_Matiere SEPARATOR ', ') AS Matieres
       FROM PROFESSEUR p
       LEFT JOIN ENSEIGNER en ON p.Id_PROFESSEUR = en.Id_PROFESSEUR
       LEFT JOIN MATIERE m   ON en.Id_MATIERE    = m.Id_MATIERE
       GROUP BY p.Id_PROFESSEUR
       ORDER BY p.Nom_Prenoms_Profe`
    );
    res.json(rows);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// GET un professeur
router.get('/:id', auth, async (req, res) => {
  try {
    const [rows] = await db.query(
      'SELECT * FROM PROFESSEUR WHERE Id_PROFESSEUR = ?', [req.params.id]
    );
    if (!rows.length) return res.status(404).json({ error: 'Professeur introuvable' });
    res.json(rows[0]);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// POST créer un professeur
router.post('/', auth, async (req, res) => {
  try {
    const { Nom_Prenoms_Profe, Tel_Profe, Quartier_Profe, email_Profe, Date_Naissance } = req.body;
    if (!Nom_Prenoms_Profe) return res.status(400).json({ error: 'Nom requis' });

    await db.query(
      'INSERT INTO PROFESSEUR (Nom_Prenoms_Profe, Tel_Profe, Quartier_Profe, email_Profe, Date_Naissance) VALUES (?,?,?,?,?)',
      [Nom_Prenoms_Profe, Tel_Profe, Quartier_Profe, email_Profe, Date_Naissance]
    );
    res.status(201).json({ message: 'Professeur ajouté' });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// PUT modifier un professeur
router.put('/:id', auth, async (req, res) => {
  try {
    const { Nom_Prenoms_Profe, Tel_Profe, Quartier_Profe, email_Profe, Date_Naissance } = req.body;
    await db.query(
      'UPDATE PROFESSEUR SET Nom_Prenoms_Profe=?, Tel_Profe=?, Quartier_Profe=?, email_Profe=?, Date_Naissance=? WHERE Id_PROFESSEUR=?',
      [Nom_Prenoms_Profe, Tel_Profe, Quartier_Profe, email_Profe, Date_Naissance, req.params.id]
    );
    res.json({ message: 'Professeur modifié' });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// DELETE supprimer un professeur
router.delete('/:id', auth, async (req, res) => {
  try {
    await db.query('DELETE FROM PROFESSEUR WHERE Id_PROFESSEUR = ?', [req.params.id]);
    res.json({ message: 'Professeur supprimé' });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

module.exports = router;
