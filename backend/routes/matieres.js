const express = require('express');
const router = express.Router();
const db = require('../config/db');

// GET toutes les matières
router.get('/', async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM matiere ORDER BY Nom_Matiere');
    res.json(rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// POST créer matière
router.post('/', async (req, res) => {
  try {
    const { Nom_Matiere } = req.body;
    const [result] = await db.query('INSERT INTO matiere (Nom_Matiere) VALUES (?)', [Nom_Matiere]);
    res.json({ id: result.insertId, message: 'Matière créée' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// PUT modifier matière
router.put('/:id', async (req, res) => {
  try {
    const { Nom_Matiere } = req.body;
    await db.query('UPDATE matiere SET Nom_Matiere=? WHERE Id_MATIERE=?', [Nom_Matiere, req.params.id]);
    res.json({ message: 'Matière modifiée' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// DELETE supprimer matière
router.delete('/:id', async (req, res) => {
  try {
    await db.query('DELETE FROM matiere WHERE Id_MATIERE=?', [req.params.id]);
    res.json({ message: 'Matière supprimée' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
