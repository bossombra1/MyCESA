// routes/evaluations.js — Évaluations + Notes
const express = require('express');
const router  = express.Router();
const db      = require('../config/db');
const auth    = require('../middleware/authMiddleware');

// GET toutes les évaluations
router.get('/', auth, async (req, res) => {
  try {
    const [rows] = await db.query(
      `SELECT ev.*, s.Lib_Sem, s.Annee_Academique_Semestre
       FROM EVALUATION ev
       LEFT JOIN SEMESTRE s ON ev.Id_SEMESTRE = s.Id_SEMESTRE
       ORDER BY ev.Date_Evaluation DESC`
    );
    res.json(rows);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// ── ROUTES SPÉCIFIQUES AVANT /:id ──

// GET notes d'un étudiant
router.get('/:id/notes', auth, async (req, res) => {
  try {
    const [utilisateur] = await db.query(
      `SELECT e.Id_ETUDIANT FROM ETUDIANT e
       JOIN UTILISATEUR u ON u.Email_User = e.Email_Etudiant
       WHERE u.Id_UTILISATEUR = ?`,
      [req.params.id]
    );
    const Id_ETUDIANT = utilisateur.length
      ? utilisateur[0].Id_ETUDIANT
      : req.params.id;

    const [rows] = await db.query(
      `SELECT
        n.Note_Evaluation,
        ev.Id_EVALUATION,
        ev.Lib_Evaluation,
        ev.Coef_Evaluation,
        ev.Type_Evaluation,
        ev.Date_Evaluation,
        ev.Id_SEMESTRE,
        s.Lib_Sem,
        CAST(SUBSTRING_INDEX(SUBSTRING_INDEX(ev.Lib_Evaluation, '_', 2), '_', -1) AS UNSIGNED) AS Id_MATIERE,
        m.Nom_Matiere,
        p.Nom_Prenoms_Profe AS Nom_Professeur
       FROM NOTATION n
       JOIN EVALUATION ev ON n.Id_EVALUATION = ev.Id_EVALUATION
       LEFT JOIN SEMESTRE s ON ev.Id_SEMESTRE = s.Id_SEMESTRE
       LEFT JOIN MATIERE m ON m.Id_MATIERE = CAST(
         SUBSTRING_INDEX(SUBSTRING_INDEX(ev.Lib_Evaluation, '_', 2), '_', -1) AS UNSIGNED
       )
       LEFT JOIN PROFESSEUR p ON p.Id_PROFESSEUR = CAST(
         SUBSTRING_INDEX(SUBSTRING_INDEX(ev.Lib_Evaluation, 'PROF_', -1), '_', 1) AS UNSIGNED
       )
       WHERE n.Id_ETUDIANT = ?
       AND ev.Lib_Evaluation LIKE 'MAT_%'
       ORDER BY ev.Id_SEMESTRE, m.Nom_Matiere, ev.Date_Evaluation ASC`,
      [Id_ETUDIANT]
    );
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST saisie — crée toujours une nouvelle évaluation
router.post('/saisie', auth, async (req, res) => {
  try {
    const { Id_ETUDIANT, Id_MATIERE, Id_PROFESSEUR, Note, Semestre, Type, Coef } = req.body;

    if (!Id_ETUDIANT || !Id_MATIERE || Note === undefined) {
      return res.status(400).json({ error: 'Données manquantes' });
    }

    const Id_SEMESTRE = Semestre || 1;
    const typeEval    = Type    || 'Devoir';
    const coefEval    = Coef    || 1;

    // Libellé unique avec timestamp pour permettre plusieurs notes par matière
    const libEval = `MAT_${Id_MATIERE}_PROF_${Id_PROFESSEUR}_${typeEval}_${Date.now()}`;

    // Créer une nouvelle évaluation
    const [result] = await db.query(
      `INSERT INTO EVALUATION
       (Lib_Evaluation, Date_Evaluation, Coef_Evaluation, Type_Evaluation, Id_SEMESTRE)
       VALUES (?, NOW(), ?, ?, ?)`,
      [libEval, coefEval, typeEval, Id_SEMESTRE]
    );
    const Id_EVALUATION = result.insertId;

    // Enregistrer la note
    await db.query(
      `INSERT INTO NOTATION (Id_ETUDIANT, Id_EVALUATION, Note_Evaluation)
       VALUES (?, ?, ?)`,
      [Id_ETUDIANT, Id_EVALUATION, Note]
    );

    res.status(201).json({ success: true, message: 'Note enregistrée', Id_EVALUATION });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST enregistrer une note directe
router.post('/notes', auth, async (req, res) => {
  try {
    const { Id_ETUDIANT, Id_EVALUATION, Note_Evaluation } = req.body;
    await db.query(
      `INSERT INTO NOTATION (Id_ETUDIANT, Id_EVALUATION, Note_Evaluation)
       VALUES (?,?,?)
       ON DUPLICATE KEY UPDATE Note_Evaluation = VALUES(Note_Evaluation)`,
      [Id_ETUDIANT, Id_EVALUATION, Note_Evaluation]
    );
    res.status(201).json({ message: 'Note enregistrée' });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// GET une évaluation par ID — APRÈS les routes spécifiques
router.get('/:id', auth, async (req, res) => {
  try {
    const [eval_] = await db.query(
      `SELECT ev.*, s.Lib_Sem FROM EVALUATION ev
       LEFT JOIN SEMESTRE s ON ev.Id_SEMESTRE = s.Id_SEMESTRE
       WHERE ev.Id_EVALUATION = ?`, [req.params.id]
    );
    if (!eval_.length) return res.status(404).json({ error: 'Évaluation introuvable' });

    const [notes] = await db.query(
      `SELECT n.*, e.Nom_Etudiant, e.Prenoms_Etudiant, e.Matricule_Etudiant
       FROM NOTATION n
       JOIN ETUDIANT e ON n.Id_ETUDIANT = e.Id_ETUDIANT
       WHERE n.Id_EVALUATION = ?
       ORDER BY e.Nom_Etudiant`,
      [req.params.id]
    );
    res.json({ ...eval_[0], notes });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// POST créer une évaluation
router.post('/', auth, async (req, res) => {
  try {
    const { Lib_Evaluation, Date_Evaluation, Coef_Evaluation, Type_Evaluation, Id_SEMESTRE } = req.body;
    if (!Lib_Evaluation) return res.status(400).json({ error: 'Libellé requis' });
    const [result] = await db.query(
      `INSERT INTO EVALUATION (Lib_Evaluation, Date_Evaluation, Coef_Evaluation, Type_Evaluation, Id_SEMESTRE)
       VALUES (?,?,?,?,?)`,
      [Lib_Evaluation, Date_Evaluation, Coef_Evaluation, Type_Evaluation, Id_SEMESTRE]
    );
    res.status(201).json({ message: 'Évaluation créée', Id_EVALUATION: result.insertId });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// PUT modifier une évaluation
router.put('/:id', auth, async (req, res) => {
  try {
    const { Lib_Evaluation, Date_Evaluation, Coef_Evaluation, Type_Evaluation, Id_SEMESTRE } = req.body;
    await db.query(
      `UPDATE EVALUATION SET Lib_Evaluation=?, Date_Evaluation=?, Coef_Evaluation=?,
        Type_Evaluation=?, Id_SEMESTRE=? WHERE Id_EVALUATION=?`,
      [Lib_Evaluation, Date_Evaluation, Coef_Evaluation, Type_Evaluation, Id_SEMESTRE, req.params.id]
    );
    res.json({ message: 'Évaluation modifiée' });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// DELETE supprimer une évaluation
router.delete('/:id', auth, async (req, res) => {
  try {
    await db.query('DELETE FROM EVALUATION WHERE Id_EVALUATION = ?', [req.params.id]);
    res.json({ message: 'Évaluation supprimée' });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

module.exports = router;