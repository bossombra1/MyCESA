const express = require('express');
const router = express.Router();
const db = require('../config/db');

router.get('/', async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT
        e.Matricule_Etudiant,
        CONCAT(e.Nom_Etudiant, ' ', e.Prenoms_Etudiant) AS Nom_Complet,
        COALESCE(m.Nom_Matiere, 'Matière inconnue') AS Nom_Matiere,
        s.Lib_Sem AS Semestre,
        ev.Type_Evaluation,
        n.Note_Evaluation,
        ev.Coef_Evaluation
      FROM notation n
      JOIN etudiant e ON n.Id_ETUDIANT = e.Id_ETUDIANT
      JOIN evaluation ev ON n.Id_EVALUATION = ev.Id_EVALUATION
      LEFT JOIN semestre s ON ev.Id_SEMESTRE = s.Id_SEMESTRE
      LEFT JOIN matiere m ON m.Id_MATIERE = CAST(
        SUBSTRING_INDEX(SUBSTRING_INDEX(ev.Lib_Evaluation, '_', 2), '_', -1) AS UNSIGNED
      )
      WHERE ev.Lib_Evaluation LIKE 'MAT_%'
      ORDER BY e.Nom_Etudiant, m.Nom_Matiere, ev.Date_Evaluation ASC
    `);
    res.json(rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;