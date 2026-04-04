const express = require('express');
const router = express.Router();
const db = require('../config/db');
const auth = require('../middleware/authMiddleware');

// GET toutes les salles
router.get('/', auth, async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM SALLE ORDER BY Nom_Salle');
    res.json(rows);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// GET une salle
router.get('/:id', auth, async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM SALLE WHERE Id_SALLE = ?', [req.params.id]);
    if (!rows.length) return res.status(404).json({ error: 'Salle introuvable' });
    res.json(rows[0]);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// POST créer une salle
router.post('/', auth, async (req, res) => {
  try {
    const { Nom_Salle, Localisation_Salle, Superficie_Salle } = req.body;
    if (!Nom_Salle) return res.status(400).json({ error: 'Nom de la salle requis' });
    const [result] = await db.query('INSERT INTO SALLE (Nom_Salle, Localisation_Salle, Superficie_Salle) VALUES (?, ?, ?)', [Nom_Salle, Localisation_Salle || null, Superficie_Salle || null]);
    const [rows] = await db.query('SELECT * FROM SALLE WHERE Id_SALLE = ?', [result.insertId]);
    res.status(201).json(rows[0]);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// PUT modifier
router.put('/:id', auth, async (req, res) => {
  try {
    const { Nom_Salle, Localisation_Salle, Superficie_Salle } = req.body;
    await db.query('UPDATE SALLE SET Nom_Salle = ?, Localisation_Salle = ?, Superficie_Salle = ? WHERE Id_SALLE = ?', [Nom_Salle, Localisation_Salle || null, Superficie_Salle || null, req.params.id]);
    res.json({ message: 'Salle modifiée' });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// DELETE
router.delete('/:id', auth, async (req, res) => {
  try {
    await db.query('DELETE FROM SALLE WHERE Id_SALLE = ?', [req.params.id]);
    res.json({ message: 'Salle supprimée' });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

module.exports = router;
