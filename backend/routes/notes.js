const express = require('express');
const router = express.Router();
const db = require('../config/db');

router.get('/', async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT 
        e.Matricule_Etudiant,
        CONCAT(e.Nom_Etudiant, ' ', e.Prenoms_Etudiant) AS Nom_Complet,
        m.Nom_Matiere,
        s.Lib_Sem AS Semestre,
        ev.Type_Evaluation,
        n.Note_Evaluation,
        ev.Coef_Evaluation
      FROM notation n
      JOIN etudiant e ON n.Id_ETUDIANT = e.Id_ETUDIANT
      JOIN evaluation ev ON n.Id_EVALUATION = ev.Id_EVALUATION
      JOIN semestre s ON ev.Id_SEMESTRE = s.Id_SEMESTRE
      LEFT JOIN emploi_temps et ON et.Id_CLASSE = e.Id_CLASSE
      LEFT JOIN matiere m ON et.Id_MATIERE = m.Id_MATIERE
      GROUP BY e.Matricule_Etudiant, m.Nom_Matiere, ev.Type_Evaluation, s.Lib_Sem
      ORDER BY e.Nom_Etudiant, m.Nom_Matiere
    `);
    res.json(rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;