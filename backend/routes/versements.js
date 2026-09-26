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
//
// Chaque ligne retournee est un VERSEMENT (une ligne de la table VERSER liee a
// son VERSEMENT). Attention : VERSEMENT.Montant_Total est le MONTANT TOTAL DU
// (ex. 500 000 FCFA pour la scolarite) et non le montant de la ligne. Le
// montant reellement verse est VERSER.Montant. On expose donc les deux
// colonnes brutes sous des noms sans ambiguite.
router.get('/', auth, async (req, res) => {
  try {
    const [rows] = await db.query(
      `SELECT v.Id_ETUDIANT,
              v.Id_VERSEMENT,
              v.Montant        AS Montant_Verse,
              v.Date_Paiement,
              v.Statut,
              e.Nom_Etudiant, e.Prenoms_Etudiant, e.Matricule_Etudiant,
              e.Id_CLASSE,
              c.Nom_Classe,
              f.Id_FILIERE,
              f.Nom_Filiere,
              vs.Lib_Versement,
              vs.Montant_Total,
              vs.Date_Versement
       FROM VERSER v
       JOIN ETUDIANT e ON v.Id_ETUDIANT = e.Id_ETUDIANT
       LEFT JOIN CLASSE c ON e.Id_CLASSE = c.Id_CLASSE
       LEFT JOIN FILIERE f ON e.Id_FILIERE = f.Id_FILIERE
       JOIN VERSEMENT vs ON v.Id_VERSEMENT = vs.Id_VERSEMENT
       ORDER BY e.Nom_Etudiant, vs.Date_Versement DESC`
    );
    res.json(rows);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// GET totaux de paiement agreges par etudiant (admin)
//
// Une seule ligne par etudiant, montants calcules directement en base :
//   totalDu   = plus grand Montant_Total parmi ses versements (le du est
//               global a la scolarite, il ne se cumule pas)
//   totalPaye = SUM(VERSER.Montant) sur tous ses versements
//   reste     = totalDu - totalPaye (borne a 0)
//   statut    = 'Soldé' | 'Partiel' | 'Impayé'
router.get('/totaux', auth, async (req, res) => {
  try {
    const [rows] = await db.query(
      `SELECT e.Id_ETUDIANT,
              e.Matricule_Etudiant,
              e.Nom_Etudiant,
              e.Prenoms_Etudiant,
              e.Id_CLASSE,
              c.Nom_Classe,
              e.Id_FILIERE,
              f.Nom_Filiere,
              COALESCE(MAX(vs.Montant_Total), 0) AS totalDu,
              COALESCE(SUM(v.Montant), 0)        AS totalPaye,
              COUNT(v.Id_VERSEMENT)              AS nombreVersements,
              MAX(v.Date_Paiement)               AS dernierPaiement
       FROM ETUDIANT e
       LEFT JOIN CLASSE c ON e.Id_CLASSE = c.Id_CLASSE
       LEFT JOIN FILIERE f ON e.Id_FILIERE = f.Id_FILIERE
       LEFT JOIN VERSER v ON v.Id_ETUDIANT = e.Id_ETUDIANT
       LEFT JOIN VERSEMENT vs ON vs.Id_VERSEMENT = v.Id_VERSEMENT
       GROUP BY e.Id_ETUDIANT, e.Matricule_Etudiant, e.Nom_Etudiant,
                e.Prenoms_Etudiant, e.Id_CLASSE, c.Nom_Classe,
                e.Id_FILIERE, f.Nom_Filiere
       ORDER BY e.Nom_Etudiant, e.Prenoms_Etudiant`
    );

    const totaux = rows.map((r) => {
      const totalDu = Number(r.totalDu) || 0;
      const totalPaye = Number(r.totalPaye) || 0;
      const reste = Math.max(0, totalDu - totalPaye);
      const progression = totalDu > 0 ? Math.min(100, Math.round((totalPaye / totalDu) * 100)) : 0;
      const statut = totalDu > 0 && reste <= 0 ? 'Soldé' : totalPaye > 0 ? 'Partiel' : 'Impayé';
      return { ...r, totalDu, totalPaye, reste, progression, statut };
    });

    const totalDuGlobal = totaux.reduce((s, t) => s + t.totalDu, 0);
    const totalPercuGlobal = totaux.reduce((s, t) => s + t.totalPaye, 0);
    const resteGlobal = Math.max(0, totalDuGlobal - totalPercuGlobal);

    res.json({
      totaux,
      stats: {
        totalDu: totalDuGlobal,
        totalPercu: totalPercuGlobal,
        reste: resteGlobal,
        tauxRecouvrement: totalDuGlobal > 0
          ? Math.round((totalPercuGlobal / totalDuGlobal) * 1000) / 10
          : 0,
        etudiants: totaux.length,
        soldes: totaux.filter((t) => t.statut === 'Soldé').length,
        partiels: totaux.filter((t) => t.statut === 'Partiel').length,
        impayes: totaux.filter((t) => t.statut === 'Impayé').length,
      },
    });
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
