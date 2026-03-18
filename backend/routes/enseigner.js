// routes/enseigner.js — Gestion des relations prof-matière
const express = require('express');
const router = express.Router();
const db = require('../config/db');

// POST ajouter une relation prof-matière
router.post('/', async (req, res) => {
  try {
    const { Id_PROFESSEUR, Id_MATIERE } = req.body;
    if (!Id_PROFESSEUR || !Id_MATIERE) {
      return res.status(400).json({ error: 'Id_PROFESSEUR et Id_MATIERE requis' });
    }
    await db.query('INSERT INTO ENSEIGNER (Id_PROFESSEUR, Id_MATIERE) VALUES (?, ?)', [Id_PROFESSEUR, Id_MATIERE]);
    res.json({ message: 'Relation prof-matière enregistrée' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

// DELETE supprimer une relation prof-matière
router.delete('/', async (req, res) => {
  try {
    const { Id_PROFESSEUR, Id_MATIERE } = req.body;
    await db.query('DELETE FROM ENSEIGNER WHERE Id_PROFESSEUR = ? AND Id_MATIERE = ?', [Id_PROFESSEUR, Id_MATIERE]);
    res.json({ message: 'Relation supprimée' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;