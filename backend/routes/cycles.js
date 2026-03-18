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

module.exports = router;
