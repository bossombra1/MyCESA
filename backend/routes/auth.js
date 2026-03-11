// routes/auth.js — Authentification : register + login
const express  = require('express');
const router   = express.Router();
const db       = require('../config/db');
const bcrypt   = require('bcryptjs');
const jwt      = require('jsonwebtoken');
const auth     = require('../middleware/authMiddleware');

// ─────────────────────────────────────────────
// POST /api/auth/register — Créer un compte
// ─────────────────────────────────────────────
router.post('/register', async (req, res) => {
  try {
    const { Nom_User, Login_User, Email_User, Password_User, Id_ROLE } = req.body;

    if (!Login_User || !Password_User || !Nom_User) {
      return res.status(400).json({ error: 'Nom, login et mot de passe requis' });
    }

    const hash = await bcrypt.hash(Password_User, 12);

    await db.query(
      'INSERT INTO UTILISATEUR (Nom_User, Login_User, Email_User, Password_User, Id_ROLE) VALUES (?,?,?,?,?)',
      [Nom_User, Login_User, Email_User || null, hash, Id_ROLE || 1]
    );

    res.status(201).json({ message: 'Compte créé avec succès' });
  } catch (err) {
    if (err.code === 'ER_DUP_ENTRY') {
      return res.status(409).json({ error: 'Ce login ou email existe déjà' });
    }
    res.status(500).json({ error: err.message });
  }
});

// ─────────────────────────────────────────────
// POST /api/auth/login — Se connecter
// ─────────────────────────────────────────────
router.post('/login', async (req, res) => {
  try {
    const { Login_User, Password_User } = req.body;

    if (!Login_User || !Password_User) {
      return res.status(400).json({ error: 'Login et mot de passe requis' });
    }

    const [rows] = await db.query(
      `SELECT u.*, r.Lib_Role
       FROM UTILISATEUR u
       LEFT JOIN ROLE r ON u.Id_ROLE = r.Id_ROLE
       WHERE u.Login_User = ?`,
      [Login_User]
    );

    if (rows.length === 0) {
      return res.status(401).json({ error: 'Utilisateur introuvable' });
    }

    const user = rows[0];
    const valid = await bcrypt.compare(Password_User, user.Password_User);

    if (!valid) {
      return res.status(401).json({ error: 'Mot de passe incorrect' });
    }

    const token = jwt.sign(
      { id: user.Id_UTILISATEUR, role: user.Lib_Role },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    delete user.Password_User;
    res.json({ token, user });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ─────────────────────────────────────────────
// GET /api/auth/me — Profil utilisateur connecté
// ─────────────────────────────────────────────
router.get('/me', auth, async (req, res) => {
  try {
    const [rows] = await db.query(
      `SELECT u.Id_UTILISATEUR, u.Nom_User, u.Login_User, u.Email_User, r.Lib_Role
       FROM UTILISATEUR u
       LEFT JOIN ROLE r ON u.Id_ROLE = r.Id_ROLE
       WHERE u.Id_UTILISATEUR = ?`,
      [req.user.id]
    );
    if (!rows.length) return res.status(404).json({ error: 'Utilisateur introuvable' });
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ─────────────────────────────────────────────
// PUT /api/auth/password — Changer le mot de passe
// ─────────────────────────────────────────────
router.put('/password', auth, async (req, res) => {
  try {
    const { ancienPassword, nouveauPassword } = req.body;

    const [rows] = await db.query(
      'SELECT Password_User FROM UTILISATEUR WHERE Id_UTILISATEUR = ?',
      [req.user.id]
    );

    const valid = await bcrypt.compare(ancienPassword, rows[0].Password_User);
    if (!valid) return res.status(401).json({ error: 'Ancien mot de passe incorrect' });

    const hash = await bcrypt.hash(nouveauPassword, 12);
    await db.query(
      'UPDATE UTILISATEUR SET Password_User = ? WHERE Id_UTILISATEUR = ?',
      [hash, req.user.id]
    );

    res.json({ message: 'Mot de passe modifié avec succès' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ─────────────────────────────────────────────
// PUT /api/auth/profil/:id — Modifier infos profil
// ─────────────────────────────────────────────
router.put('/profil/:id', auth, async (req, res) => {
  try {
    const { Nom_User, Email_User } = req.body;
    if (!Nom_User) return res.status(400).json({ error: 'Nom requis' });

    await db.query(
      'UPDATE UTILISATEUR SET Nom_User = ?, Email_User = ? WHERE Id_UTILISATEUR = ?',
      [Nom_User, Email_User, req.params.id]
    );

    res.json({ message: 'Profil mis à jour avec succès' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ─────────────────────────────────────────────
// PUT /api/auth/password/:id — Changer mot de passe
// ─────────────────────────────────────────────
router.put('/password/:id', auth, async (req, res) => {
  try {
    const { ancienPassword, nouveauPassword } = req.body;

    if (!ancienPassword || !nouveauPassword) {
      return res.status(400).json({ error: 'Ancien et nouveau mot de passe requis' });
    }

    const [rows] = await db.query(
      'SELECT Password_User FROM UTILISATEUR WHERE Id_UTILISATEUR = ?',
      [req.params.id]
    );

    if (!rows.length) return res.status(404).json({ error: 'Utilisateur introuvable' });

    const valid = await bcrypt.compare(ancienPassword, rows[0].Password_User);
    if (!valid) return res.status(401).json({ error: 'Mot de passe actuel incorrect' });

    const hash = await bcrypt.hash(nouveauPassword, 12);
    await db.query(
      'UPDATE UTILISATEUR SET Password_User = ? WHERE Id_UTILISATEUR = ?',
      [hash, req.params.id]
    );

    res.json({ message: 'Mot de passe modifié avec succès' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
