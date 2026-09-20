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
    const totalDu = rows.reduce(
      (max, r) => Math.max(max, parseFloat(r.Montant_Total) || 0),
      0
    );
    const reste = Math.max(0, totalDu - totalPaye);
    const progression = totalDu > 0
      ? Math.min((totalPaye / totalDu) * 100, 100)
      : 0;

    res.json({ paiements: rows, totalPaye, totalDu, reste, progression });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// GET tous les versements (admin)
router.get('/', auth, async (req, res) => {
  try {
    const [rows] = await db.query(
      `SELECT v.*, e.Nom_Etudiant, e.Prenoms_Etudiant, e.Matricule_Etudiant,
              vs.Lib_Versement, vs.Montant_Total, vs.Date_Versement
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

// PUT modifier un versement + son lien étudiant
router.put('/:id', auth, async (req, res) => {
  const connection = await db.getConnection();
  try {
    const { Id_ETUDIANT, Lib_Versement, Montant, Montant_Total } = req.body;

    await connection.beginTransaction();
    const [links] = await connection.query(
      'SELECT Id_ETUDIANT, Id_VERSEMENT FROM VERSER WHERE Id_VERSEMENT = ?',
      [req.params.id]
    );
    if (!links.length) {
      await connection.rollback();
      return res.status(404).json({ error: 'Versement introuvable' });
    }

    await connection.query(
      'UPDATE VERSEMENT SET Lib_Versement = ?, Montant_Total = ? WHERE Id_VERSEMENT = ?',
      [Lib_Versement, Montant_Total || Montant, req.params.id]
    );
    await connection.query(
      'UPDATE VERSER SET Id_ETUDIANT = ?, Montant = ? WHERE Id_VERSEMENT = ?',
      [Id_ETUDIANT || links[0].Id_ETUDIANT, Montant, req.params.id]
    );

    await connection.commit();
    res.json({ message: 'Paiement modifié avec succès' });
  } catch (err) {
    await connection.rollback();
    res.status(500).json({ error: err.message });
  } finally {
    connection.release();
  }
});

// DELETE supprimer un versement et son lien étudiant
router.delete('/:id', auth, async (req, res) => {
  const connection = await db.getConnection();
  try {
    await connection.beginTransaction();
    await connection.query('DELETE FROM HISTO_VERSEMENT WHERE Id_VERSEMENT = ?', [req.params.id]);
    await connection.query('DELETE FROM VERSER WHERE Id_VERSEMENT = ?', [req.params.id]);
    const [result] = await connection.query(
      'DELETE FROM VERSEMENT WHERE Id_VERSEMENT = ?',
      [req.params.id]
    );

    if (!result.affectedRows) {
      await connection.rollback();
      return res.status(404).json({ error: 'Versement introuvable' });
    }

    await connection.commit();
    res.json({ message: 'Paiement supprimé avec succès' });
  } catch (err) {
    await connection.rollback();
    res.status(500).json({ error: err.message });
  } finally {
    connection.release();
  }
});

// GET historique détaillé d'un étudiant (avec progression de paiement)
router.get('/etudiant/detail/:Id_ETUDIANT', auth, async (req, res) => {
  try {
    const { Id_ETUDIANT } = req.params;

    // Récupérer l'étudiant
    const [etudiant] = await db.query(
      `SELECT * FROM ETUDIANT WHERE Id_ETUDIANT = ?`,
      [Id_ETUDIANT]
    );

    if (!etudiant.length) {
      return res.status(404).json({ error: 'Étudiant non trouvé' });
    }

    // Récupérer tous les paiements de l'étudiant
    const [paiements] = await db.query(
      `SELECT v.*, vs.Lib_Versement, vs.Montant_Total, vs.Date_Versement
       FROM VERSER v
       JOIN VERSEMENT vs ON v.Id_VERSEMENT = vs.Id_VERSEMENT
       WHERE v.Id_ETUDIANT = ?
       ORDER BY vs.Date_Versement DESC`,
      [Id_ETUDIANT]
    );

    // Calculer les montants
    const montantDu = paiements.reduce((max, p) => Math.max(max, parseFloat(p.Montant_Total) || 0), 0);
    const totalPayé = paiements.reduce((sum, p) => sum + (parseFloat(p.Montant) || 0), 0);
    const reste = Math.max(0, montantDu - totalPayé);
    const pourcentage = montantDu > 0 ? Math.round((totalPayé / montantDu) * 100) : 0;

    // Récupérer l'historique
    const [historique] = await db.query(
      `SELECT * FROM HISTO_VERSEMENT WHERE Id_VERSEMENT IN 
       (SELECT Id_VERSEMENT FROM VERSER WHERE Id_ETUDIANT = ?)
       ORDER BY Date_Histo DESC`,
      [Id_ETUDIANT]
    );

    res.json({
      etudiant: etudiant[0],
      paiements,
      historique,
      stats: { totalDû: montantDu, totalPayé, reste, pourcentage }
    });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

module.exports = router;
