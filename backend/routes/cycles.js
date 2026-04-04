// routes/cycles.js — Gestion des Cycles
const express = require('express');
const router = express.Router();
const db = require('../config/db');
const auth = require('../middleware/authMiddleware');

// GET tous les cycles
router.get('/', auth, async (req, res) => {
  try {
    const [rows] = await db.query('SELECT Id_CYCLE, Lib_Cycle FROM CYCLE_ ORDER BY Lib_Cycle');
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

// GET un cycle par ID
router.get('/:id', auth, async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM CYCLE_ WHERE Id_CYCLE = ?', [req.params.id]);
    if (!rows.length) return res.status(404).json({ error: 'Cycle introuvable' });
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST créer un cycle
router.post('/', auth, async (req, res) => {
  try {
    const { Lib_Cycle } = req.body;
    if (!Lib_Cycle) return res.status(400).json({ error: 'Libellé de cycle requis' });
    const [result] = await db.query('INSERT INTO CYCLE_ (Lib_Cycle) VALUES (?)', [Lib_Cycle]);
    const [rows] = await db.query('SELECT Id_CYCLE, Lib_Cycle FROM CYCLE_ WHERE Id_CYCLE = ?', [result.insertId]);
    res.status(201).json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PUT modifier un cycle
router.put('/:id', auth, async (req, res) => {
  try {
    const { Lib_Cycle } = req.body;
    await db.query('UPDATE CYCLE_ SET Lib_Cycle = ? WHERE Id_CYCLE = ?', [Lib_Cycle, req.params.id]);
    res.json({ message: 'Cycle modifié' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE supprimer
router.delete('/:id', auth, async (req, res) => {
  try {
    await db.query('DELETE FROM CYCLE_ WHERE Id_CYCLE = ?', [req.params.id]);
    res.json({ message: 'Cycle supprimé' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
