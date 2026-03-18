// routes/filieres.js — CRUD Filières
const express = require('express');
const router  = express.Router();
const db      = require('../config/db');
const auth    = require('../middleware/authMiddleware');

// GET toutes les filières
router.get('/', auth, async (req, res) => {
  try {
    const [rows] = await db.query(
      'SELECT Id_FILIERE, Nom_Filiere, Id_CYCLE FROM FILIERE ORDER BY Nom_Filiere'
    );
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET une filière par ID
router.get('/:id', auth, async (req, res) => {
  try {
    const [rows] = await db.query(
      'SELECT Id_FILIERE, Nom_Filiere, Id_CYCLE FROM FILIERE WHERE Id_FILIERE = ?',
      [req.params.id]
    );
    if (!rows.length) return res.status(404).json({ error: 'Filière introuvable' });
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
