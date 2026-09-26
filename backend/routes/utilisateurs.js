const express = require('express');
const router = express.Router();
const db = require('../config/db');
const bcrypt = require('bcryptjs');

// GET tous les utilisateurs
router.get('/', async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT u.Id_UTILISATEUR, u.Nom_User, u.Login_User, u.Email_User, u.Id_ROLE, r.Lib_Role
      FROM utilisateur u
      LEFT JOIN role r ON u.Id_ROLE = r.Id_ROLE
      ORDER BY u.Id_UTILISATEUR
    `);
    res.json(rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET profils liables (PROFESSEUR / ETUDIANT) pour le formulaire de création.
// Les emails proviennent des tables réelles ; ils servent de lien entre un compte
// UTILISATEUR et sa fiche métier (voir etudiants.js / professeurs.js).
router.get('/profils', async (req, res) => {
  try {
    const [professeurs] = await db.query(
      `SELECT Id_PROFESSEUR AS id, Nom_Prenoms_Profe AS nom, email_Profe AS email
       FROM PROFESSEUR
       WHERE email_Profe IS NOT NULL AND email_Profe <> ''
       ORDER BY Nom_Prenoms_Profe`
    );
    const [etudiants] = await db.query(
      `SELECT Id_ETUDIANT AS id,
              CONCAT_WS(' ', Nom_Etudiant, Prenoms_Etudiant) AS nom,
              Email_Etudiant AS email,
              Matricule_Etudiant AS matricule,
              Id_CLASSE AS idClasse
       FROM ETUDIANT
       WHERE Email_Etudiant IS NOT NULL AND Email_Etudiant <> ''
       ORDER BY Nom_Etudiant, Prenoms_Etudiant`
    );
    res.json({ professeurs, etudiants });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// POST créer utilisateur
router.post('/', async (req, res) => {
  try {
    const { Nom_User, Login_User, Email_User, Password_User, Id_ROLE } = req.body;
    const hash = await bcrypt.hash(Password_User || '123456', 12);
    const [result] = await db.query(
      'INSERT INTO utilisateur (Nom_User, Login_User, Email_User, Password_User, Id_ROLE) VALUES (?, ?, ?, ?, ?)',
      [Nom_User, Login_User, Email_User, hash, Id_ROLE]
    );
    res.json({ id: result.insertId, message: 'Utilisateur créé' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// PUT modifier utilisateur
router.put('/:id', async (req, res) => {
  try {
    const { Nom_User, Login_User, Email_User, Id_ROLE } = req.body;
    await db.query(
      'UPDATE utilisateur SET Nom_User=?, Login_User=?, Email_User=?, Id_ROLE=? WHERE Id_UTILISATEUR=?',
      [Nom_User, Login_User, Email_User, Id_ROLE, req.params.id]
    );
    res.json({ message: 'Utilisateur modifié' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// DELETE supprimer utilisateur
router.delete('/:id', async (req, res) => {
  try {
    await db.query('DELETE FROM utilisateur WHERE Id_UTILISATEUR=?', [req.params.id]);
    res.json({ message: 'Utilisateur supprimé' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// POST reset password
router.post('/:id/reset-password', async (req, res) => {
  try {
    const hash = await bcrypt.hash('123456', 12);
    await db.query('UPDATE utilisateur SET Password_User=? WHERE Id_UTILISATEUR=?', [hash, req.params.id]);
    res.json({ message: 'Mot de passe réinitialisé à 123456' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
