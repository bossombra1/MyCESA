// routes/etudiants.js — CRUD Étudiants
const express = require('express');
const router  = express.Router();
const db      = require('../config/db');
const auth    = require('../middleware/authMiddleware');

// GET tous les étudiants (avec nom de classe)
router.get('/', auth, async (req, res) => {
  try {
    const [rows] = await db.query(
      `SELECT e.*, c.Nom_Classe, f.Nom_Filiere
       FROM ETUDIANT e
       LEFT JOIN CLASSE c ON e.Id_CLASSE = c.Id_CLASSE
       LEFT JOIN FILIERE f ON c.Id_FILIERE = f.Id_FILIERE
       ORDER BY e.Nom_Etudiant`
    );
    res.json(rows);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// GET un étudiant par ID
router.get('/:id', auth, async (req, res) => {
  try {
    const [rows] = await db.query(
      `SELECT e.*, c.Nom_Classe, f.Nom_Filiere
       FROM ETUDIANT e
       LEFT JOIN CLASSE c ON e.Id_CLASSE = c.Id_CLASSE
       LEFT JOIN FILIERE f ON c.Id_FILIERE = f.Id_FILIERE
       WHERE e.Id_ETUDIANT = ?`,
      [req.params.id]
    );
    if (!rows.length) return res.status(404).json({ error: 'Étudiant introuvable' });
    res.json(rows[0]);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// GET étudiant par matricule
router.get('/matricule/:mat', auth, async (req, res) => {
  try {
    const [rows] = await db.query(
      `SELECT e.*, c.Nom_Classe FROM ETUDIANT e
       LEFT JOIN CLASSE c ON e.Id_CLASSE = c.Id_CLASSE
       WHERE e.Matricule_Etudiant = ?`,
      [req.params.mat]
    );
    if (!rows.length) return res.status(404).json({ error: 'Étudiant introuvable' });
    res.json(rows[0]);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// POST ajouter un étudiant
router.post('/', auth, async (req, res) => {
  try {
    const {
      Matricule_Etudiant, Nom_Etudiant, Prenoms_Etudiant, Genre_Etudiant,
      Tel_Etudiant, Email_Etudiant, Date_Naissance_Etudiant,
      Lieu_Naissance_Etudiant, Quartier_Etudiant, Id_CLASSE
    } = req.body;

    if (!Matricule_Etudiant || !Nom_Etudiant) {
      return res.status(400).json({ error: 'Matricule et nom requis' });
    }

    await db.query(
      `INSERT INTO ETUDIANT
       (Matricule_Etudiant, Nom_Etudiant, Prenoms_Etudiant, Genre_Etudiant,
        Tel_Etudiant, Email_Etudiant, Date_Naissance_Etudiant,
        Lieu_Naissance_Etudiant, Quartier_Etudiant, Id_CLASSE)
       VALUES (?,?,?,?,?,?,?,?,?,?)`,
      [Matricule_Etudiant, Nom_Etudiant, Prenoms_Etudiant, Genre_Etudiant,
       Tel_Etudiant, Email_Etudiant, Date_Naissance_Etudiant,
       Lieu_Naissance_Etudiant, Quartier_Etudiant, Id_CLASSE]
    );
    res.status(201).json({ message: 'Étudiant ajouté avec succès' });
  } catch (err) {
    if (err.code === 'ER_DUP_ENTRY') {
      return res.status(409).json({ error: 'Ce matricule existe déjà' });
    }
    res.status(500).json({ error: err.message });
  }
});

// PUT modifier un étudiant
router.put('/:id', auth, async (req, res) => {
  try {
    const {
      Nom_Etudiant, Prenoms_Etudiant, Genre_Etudiant,
      Tel_Etudiant, Email_Etudiant, Date_Naissance_Etudiant,
      Lieu_Naissance_Etudiant, Quartier_Etudiant, Id_CLASSE
    } = req.body;

    await db.query(
      `UPDATE ETUDIANT SET
        Nom_Etudiant=?, Prenoms_Etudiant=?, Genre_Etudiant=?,
        Tel_Etudiant=?, Email_Etudiant=?, Date_Naissance_Etudiant=?,
        Lieu_Naissance_Etudiant=?, Quartier_Etudiant=?, Id_CLASSE=?
       WHERE Id_ETUDIANT=?`,
      [Nom_Etudiant, Prenoms_Etudiant, Genre_Etudiant,
       Tel_Etudiant, Email_Etudiant, Date_Naissance_Etudiant,
       Lieu_Naissance_Etudiant, Quartier_Etudiant, Id_CLASSE,
       req.params.id]
    );
    res.json({ message: 'Étudiant modifié avec succès' });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// DELETE supprimer un étudiant
router.delete('/:id', auth, async (req, res) => {
  try {
    await db.query('DELETE FROM ETUDIANT WHERE Id_ETUDIANT = ?', [req.params.id]);
    res.json({ message: 'Étudiant supprimé avec succès' });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

module.exports = router;
