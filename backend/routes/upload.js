const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const db = require('../config/db');
const auth = require('../middleware/authMiddleware');

const router = express.Router();

// CONFIG MULTER
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(__dirname, '../uploads/photos');
    if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, `etudiant_${req.params.id}_${Date.now()}${ext}`);
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const allowed = /jpeg|jpg|png/;
    const ok = allowed.test(path.extname(file.originalname).toLowerCase())
            && allowed.test(file.mimetype);
    ok ? cb(null, true) : cb(new Error('JPEG/PNG uniquement'));
  }
});

// ── POST /api/upload/photo/:id ──
// Upload photo étudiant via Id_UTILISATEUR
router.post('/photo/:id', auth, upload.single('photo'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: 'Aucun fichier reçu' });

    const imageUrl = `/uploads/photos/${req.file.filename}`;

    // Trouver l'étudiant via jointure Email
    const [rows] = await db.query(
      `SELECT e.Id_ETUDIANT FROM ETUDIANT e
       JOIN UTILISATEUR u ON u.Email_User = e.Email_Etudiant
       WHERE u.Id_UTILISATEUR = ?`,
      [req.params.id]
    );

    if (!rows.length) return res.status(404).json({ error: 'Étudiant non trouvé' });

    // Supprimer ancienne photo si elle existe
    const [ancien] = await db.query(
      `SELECT Image_Etudiant FROM ETUDIANT WHERE Id_ETUDIANT = ?`,
      [rows[0].Id_ETUDIANT]
    );
    if (ancien[0]?.Image_Etudiant) {
      const oldPath = path.join(__dirname, '..', ancien[0].Image_Etudiant);
      if (fs.existsSync(oldPath)) fs.unlinkSync(oldPath);
    }

    // Mettre à jour Image_Etudiant
    await db.query(
      `UPDATE ETUDIANT SET Image_Etudiant = ? WHERE Id_ETUDIANT = ?`,
      [imageUrl, rows[0].Id_ETUDIANT]
    );

    res.json({ success: true, imageUrl });
  } catch (err) {
    console.error('Erreur upload:', err);
    res.status(500).json({ error: err.message });
  }
});

// ── DELETE /api/upload/photo/:id ──
// Supprimer photo étudiant
router.delete('/photo/:id', auth, async (req, res) => {
  try {
    const [rows] = await db.query(
      `SELECT e.Id_ETUDIANT, e.Image_Etudiant FROM ETUDIANT e
       JOIN UTILISATEUR u ON u.Email_User = e.Email_Etudiant
       WHERE u.Id_UTILISATEUR = ?`,
      [req.params.id]
    );

    if (!rows.length) return res.status(404).json({ error: 'Étudiant non trouvé' });

    if (rows[0].Image_Etudiant) {
      const filePath = path.join(__dirname, '..', rows[0].Image_Etudiant);
      if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
    }

    await db.query(
      `UPDATE ETUDIANT SET Image_Etudiant = NULL WHERE Id_ETUDIANT = ?`,
      [rows[0].Id_ETUDIANT]
    );

    res.json({ success: true, message: 'Photo supprimée' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;