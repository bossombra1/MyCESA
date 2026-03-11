// routes/versements.js — Paiements / Versements
const express = require('express');
const router  = express.Router();
const db      = require('../config/db');
const auth    = require('../middleware/authMiddleware');

// GET versements d'un étudiant
router.get('/etudiant/:id', auth, async (req, res) => {
  try {
    const [etudiant] = await db.query(
      `SELECT e.Id_ETUDIANT FROM ETUDIANT e
       JOIN UTILISATEUR u ON u.Email_User = e.Email_Etudiant
       WHERE u.Id_UTILISATEUR = ?`,
      [req.params.id]
    );
    if (!etudiant.length) return res.json({ paiements: [], totalPaye: 0 });

    const [rows] = await db.query(
      `SELECT v.*, vs.Lib_Versement, vs.Montant_Total, vs.Date_Versement
       FROM VERSER v
       JOIN VERSEMENT vs ON v.Id_VERSEMENT = vs.Id_VERSEMENT
       WHERE v.Id_ETUDIANT = ?
       ORDER BY vs.Date_Versement DESC`,
      [etudiant[0].Id_ETUDIANT]
    );
    const totalPaye = rows.reduce((sum, r) => sum + (parseFloat(r.Montant) || 0), 0);
    res.json({ paiements: rows, totalPaye });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// GET tous les versements (admin)
router.get('/', auth, async (req, res) => {
  try {
    const [rows] = await db.query(
      `SELECT v.*, e.Nom_Etudiant, e.Prenoms_Etudiant, e.Matricule_Etudiant,
              vs.Lib_Versement, vs.Date_Versement
       FROM VERSER v
       JOIN ETUDIANT e ON v.Id_ETUDIANT = e.Id_ETUDIANT
       JOIN VERSEMENT vs ON v.Id_VERSEMENT = vs.Id_VERSEMENT
       ORDER BY vs.Date_Versement DESC`
    );
    res.json(rows);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// POST créer un versement + lier à l'étudiant
router.post('/', auth, async (req, res) => {
  try {
    const { Id_ETUDIANT, Lib_Versement, Montant, Montant_Total } = req.body;

    if (!Id_ETUDIANT || !Montant) {
      return res.status(400).json({ error: 'Étudiant et montant requis' });
    }

    // Créer le versement
    const [result] = await db.query(
      'INSERT INTO VERSEMENT (Lib_Versement, Montant_Total) VALUES (?,?)',
      [Lib_Versement || 'Paiement scolarité', Montant_Total || Montant]
    );
    const Id_VERSEMENT = result.insertId;

    // Lier à l'étudiant
    await db.query(
      'INSERT INTO VERSER (Id_ETUDIANT, Id_VERSEMENT, Montant) VALUES (?,?,?)',
      [Id_ETUDIANT, Id_VERSEMENT, Montant]
    );

    // Historique
    await db.query(
      'INSERT INTO HISTO_VERSEMENT (Id_VERSEMENT, Id_UTILISATEUR, Action_Histo) VALUES (?,?,?)',
      [Id_VERSEMENT, req.user.id, `Paiement de ${Montant} FCFA enregistré`]
    );

    res.status(201).json({ message: 'Paiement enregistré avec succès', Id_VERSEMENT });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

module.exports = router;
