// routes/filieres.js — CRUD Filières
const express = require('express');
const router  = express.Router();
const db      = require('../config/db');
const auth    = require('../middleware/authMiddleware');

// GET toutes les filières
router.get('/', auth, async (req, res) => {
  try {
    const [rows] = await db.query('SELECT Id_FILIERE, Nom_Filiere, Id_CYCLE FROM FILIERE ORDER BY Nom_Filiere');
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET une filière par ID
router.get('/:id', auth, async (req, res) => {
  try {
    const [rows] = await db.query('SELECT Id_FILIERE, Nom_Filiere, Id_CYCLE FROM FILIERE WHERE Id_FILIERE = ?', [req.params.id]);
    if (!rows.length) return res.status(404).json({ error: 'Filière introuvable' });
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST créer une filière
router.post('/', auth, async (req, res) => {
  try {
    const { Nom_Filiere, Id_CYCLE } = req.body;
    if (!Nom_Filiere) return res.status(400).json({ error: 'Nom de filière requis' });

    const [result] = await db.query('INSERT INTO FILIERE (Nom_Filiere, Id_CYCLE) VALUES (?, ?)', [Nom_Filiere, Id_CYCLE || null]);
    const [filiaire] = await db.query('SELECT Id_FILIERE, Nom_Filiere, Id_CYCLE FROM FILIERE WHERE Id_FILIERE = ?', [result.insertId]);
    res.status(201).json(filiaire[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PUT modifier une filière
router.put('/:id', auth, async (req, res) => {
  try {
    const { Nom_Filiere, Id_CYCLE } = req.body;
    await db.query('UPDATE FILIERE SET Nom_Filiere = ?, Id_CYCLE = ? WHERE Id_FILIERE = ?', [Nom_Filiere, Id_CYCLE || null, req.params.id]);
    res.json({ message: 'Filière modifiée' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE supprimer une filière
router.delete('/:id', auth, async (req, res) => {
  try {
    await db.query('DELETE FROM FILIERE WHERE Id_FILIERE = ?', [req.params.id]);
    res.json({ message: 'Filière supprimée' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
