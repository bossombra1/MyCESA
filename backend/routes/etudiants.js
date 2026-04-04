// routes/etudiants.js — CRUD Étudiants
const express = require('express');
const router  = express.Router();
const db      = require('../config/db');
const auth    = require('../middleware/authMiddleware');

// GET tous les étudiants (avec nom de classe, filière et cycle)
router.get('/', auth, async (req, res) => {
  try {
    const [rows] = await db.query(
      `SELECT e.*, c.Nom_Classe, f.Nom_Filiere, cy.Lib_Cycle
       FROM ETUDIANT e
       LEFT JOIN CLASSE c ON e.Id_CLASSE = c.Id_CLASSE
       LEFT JOIN FILIERE f ON c.Id_FILIERE = f.Id_FILIERE
       LEFT JOIN CYCLE_ cy ON f.Id_CYCLE = cy.Id_CYCLE
       ORDER BY e.Nom_Etudiant`
    );
    res.json(rows);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// GET profil étudiant par Id_UTILISATEUR
router.get('/profil/:id', auth, async (req, res) => {
  try {
    const [rows] = await db.query(
      `SELECT e.*, c.Nom_Classe, f.Nom_Filiere, cy.Lib_Cycle
       FROM ETUDIANT e
       LEFT JOIN CLASSE c ON e.Id_CLASSE = c.Id_CLASSE
       LEFT JOIN FILIERE f ON c.Id_FILIERE = f.Id_FILIERE
       LEFT JOIN CYCLE_ cy ON f.Id_CYCLE = cy.Id_CYCLE
       JOIN UTILISATEUR u ON u.Email_User = e.Email_Etudiant
       WHERE u.Id_UTILISATEUR = ?`,
      [req.params.id]
    );
    if (!rows.length) return res.status(404).json({ error: 'Étudiant introuvable' });
    res.json(rows[0]);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// GET étudiants d'un prof avec filtres
router.get('/par-prof/:profId', auth, async (req, res) => {
  try {
    const { classe, matiere, filiere } = req.query;

    let query = `
      SELECT DISTINCT e.*, c.Nom_Classe, f.Nom_Filiere
      FROM ETUDIANT e
      JOIN CLASSE c ON c.Id_CLASSE = e.Id_CLASSE
      LEFT JOIN FILIERE f ON f.Id_FILIERE = c.Id_FILIERE
      JOIN EMPLOI_TEMPS et ON et.Id_CLASSE = e.Id_CLASSE
      JOIN UTILISATEUR u ON u.Id_UTILISATEUR = ?
      JOIN PROFESSEUR p ON p.email_Profe = u.Email_User
      WHERE et.Id_PROFESSEUR = p.Id_PROFESSEUR
    `;
    const params = [req.params.profId];

    if (classe) { query += ' AND e.Id_CLASSE = ?';         params.push(classe); }
    if (matiere){ query += ' AND et.Id_MATIERE = ?';       params.push(matiere); }
    if (filiere){ query += ' AND c.Id_FILIERE = ?';        params.push(filiere); }

    query += ' ORDER BY e.Nom_Etudiant';

    const [rows] = await db.query(query, params);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET filtres disponibles pour un prof (classes, matières, filières)
router.get('/filtres-prof/:profId', auth, async (req, res) => {
  try {
    const [classes] = await db.query(`
      SELECT DISTINCT c.Id_CLASSE, c.Nom_Classe
      FROM CLASSE c
      JOIN EMPLOI_TEMPS et ON et.Id_CLASSE = c.Id_CLASSE
      JOIN UTILISATEUR u ON u.Id_UTILISATEUR = ?
      JOIN PROFESSEUR p ON p.email_Profe = u.Email_User
      WHERE et.Id_PROFESSEUR = p.Id_PROFESSEUR
      ORDER BY c.Nom_Classe
    `, [req.params.profId]);

    const [matieres] = await db.query(`
      SELECT DISTINCT m.Id_MATIERE, m.Nom_Matiere
      FROM MATIERE m
      JOIN EMPLOI_TEMPS et ON et.Id_MATIERE = m.Id_MATIERE
      JOIN UTILISATEUR u ON u.Id_UTILISATEUR = ?
      JOIN PROFESSEUR p ON p.email_Profe = u.Email_User
      WHERE et.Id_PROFESSEUR = p.Id_PROFESSEUR
      ORDER BY m.Nom_Matiere
    `, [req.params.profId]);

    const [filieres] = await db.query(`
      SELECT DISTINCT f.Id_FILIERE, f.Nom_Filiere
      FROM FILIERE f
      JOIN CLASSE c ON c.Id_FILIERE = f.Id_FILIERE
      JOIN EMPLOI_TEMPS et ON et.Id_CLASSE = c.Id_CLASSE
      JOIN UTILISATEUR u ON u.Id_UTILISATEUR = ?
      JOIN PROFESSEUR p ON p.email_Profe = u.Email_User
      WHERE et.Id_PROFESSEUR = p.Id_PROFESSEUR
      ORDER BY f.Nom_Filiere
    `, [req.params.profId]);

    res.json({ classes, matieres, filieres });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
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

// GET étudiant par Id_ETUDIANT
router.get('/:id', auth, async (req, res) => {
  try {
    const [rows] = await db.query(
      `SELECT e.*, c.Nom_Classe, f.Nom_Filiere, cy.Lib_Cycle
       FROM ETUDIANT e
       LEFT JOIN CLASSE c ON e.Id_CLASSE = c.Id_CLASSE
       LEFT JOIN FILIERE f ON c.Id_FILIERE = f.Id_FILIERE
       LEFT JOIN CYCLE_ cy ON f.Id_CYCLE = cy.Id_CYCLE
       WHERE e.Id_ETUDIANT = ?`,
      [req.params.id]
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
      Lieu_Naissance_Etudiant, Quartier_Etudiant, Id_CLASSE, Id_FILIERE
    } = req.body;

    if (!Matricule_Etudiant || !Nom_Etudiant) {
      return res.status(400).json({ error: 'Matricule et nom requis' });
    }

    await db.query(
      `INSERT INTO ETUDIANT
       (Matricule_Etudiant, Nom_Etudiant, Prenoms_Etudiant, Genre_Etudiant,
        Tel_Etudiant, Email_Etudiant, Date_Naissance_Etudiant,
        Lieu_Naissance_Etudiant, Quartier_Etudiant, Id_CLASSE, Id_FILIERE)
       VALUES (?,?,?,?,?,?,?,?,?,?,?)`,
      [Matricule_Etudiant, Nom_Etudiant, Prenoms_Etudiant, Genre_Etudiant,
       Tel_Etudiant, Email_Etudiant, Date_Naissance_Etudiant,
       Lieu_Naissance_Etudiant, Quartier_Etudiant, Id_CLASSE, Id_FILIERE]
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
      Lieu_Naissance_Etudiant, Quartier_Etudiant, Id_CLASSE, Id_FILIERE
    } = req.body;

    await db.query(
      `UPDATE ETUDIANT SET
        Nom_Etudiant=?, Prenoms_Etudiant=?, Genre_Etudiant=?,
        Tel_Etudiant=?, Email_Etudiant=?, Date_Naissance_Etudiant=?,
        Lieu_Naissance_Etudiant=?, Quartier_Etudiant=?, Id_CLASSE=?, Id_FILIERE=?
       WHERE Id_ETUDIANT=?`,
      [Nom_Etudiant, Prenoms_Etudiant, Genre_Etudiant,
       Tel_Etudiant, Email_Etudiant, Date_Naissance_Etudiant,
       Lieu_Naissance_Etudiant, Quartier_Etudiant, Id_CLASSE, Id_FILIERE,
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
