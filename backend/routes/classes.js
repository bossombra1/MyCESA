// routes/classes.js — CRUD Classes
const express = require('express');
const router  = express.Router();
const db      = require('../config/db');
const auth    = require('../middleware/authMiddleware');

// GET toutes les classes
router.get('/', auth, async (req, res) => {
  try {
    const [rows] = await db.query(
      `SELECT c.*, f.Nom_Filiere, cy.Lib_Cycle,
              COUNT(e.Id_ETUDIANT) AS Effectif_Reel
       FROM CLASSE c
       LEFT JOIN FILIERE f  ON c.Id_FILIERE = f.Id_FILIERE
       LEFT JOIN CYCLE_  cy ON f.Id_CYCLE   = cy.Id_CYCLE
       LEFT JOIN ETUDIANT e ON e.Id_CLASSE   = c.Id_CLASSE
       GROUP BY c.Id_CLASSE
       ORDER BY c.Nom_Classe`
    );
    res.json(rows);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// GET une classe par ID avec ses étudiants
router.get('/:id', auth, async (req, res) => {
  try {
    const [classe] = await db.query(
      `SELECT c.*, f.Nom_Filiere FROM CLASSE c
       LEFT JOIN FILIERE f ON c.Id_FILIERE = f.Id_FILIERE
       WHERE c.Id_CLASSE = ?`, [req.params.id]
    );
    if (!classe.length) return res.status(404).json({ error: 'Classe introuvable' });

    const [etudiants] = await db.query(
      'SELECT * FROM ETUDIANT WHERE Id_CLASSE = ? ORDER BY Nom_Etudiant',
      [req.params.id]
    );
    res.json({ ...classe[0], etudiants });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// POST créer une classe
router.post('/', auth, async (req, res) => {
  try {
    const { Nom_Classe, Effectif_Prevu_Etudiant, Id_FILIERE } = req.body;
    if (!Nom_Classe) return res.status(400).json({ error: 'Nom de classe requis' });

    await db.query(
      'INSERT INTO CLASSE (Nom_Classe, Effectif_Prevu_Etudiant, Id_FILIERE) VALUES (?,?,?)',
      [Nom_Classe, Effectif_Prevu_Etudiant || 0, Id_FILIERE]
    );
    res.status(201).json({ message: 'Classe créée avec succès' });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// PUT modifier une classe
router.put('/:id', auth, async (req, res) => {
  try {
    const { Nom_Classe, Effectif_Prevu_Etudiant, Id_FILIERE } = req.body;
    await db.query(
      'UPDATE CLASSE SET Nom_Classe=?, Effectif_Prevu_Etudiant=?, Id_FILIERE=? WHERE Id_CLASSE=?',
      [Nom_Classe, Effectif_Prevu_Etudiant, Id_FILIERE, req.params.id]
    );
    res.json({ message: 'Classe modifiée avec succès' });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// DELETE supprimer une classe
router.delete('/:id', auth, async (req, res) => {
  try {
    await db.query('DELETE FROM CLASSE WHERE Id_CLASSE = ?', [req.params.id]);
    res.json({ message: 'Classe supprimée avec succès' });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

module.exports = router;
