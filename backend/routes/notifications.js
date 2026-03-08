// routes/notifications.js — Notifications via Socket.io
const express = require('express');
const router  = express.Router();
const db      = require('../config/db');
const auth    = require('../middleware/authMiddleware');

// GET notifications d'un utilisateur
router.get('/', auth, async (req, res) => {
  try {
    const [rows] = await db.query(
      `SELECT * FROM NOTIFICATION
       WHERE Id_UTILISATEUR = ?
       ORDER BY Date_Notif DESC LIMIT 30`,
      [req.user.id]
    );
    res.json(rows);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// GET nombre de non lues
router.get('/non-lues', auth, async (req, res) => {
  try {
    const [rows] = await db.query(
      'SELECT COUNT(*) AS count FROM NOTIFICATION WHERE Id_UTILISATEUR = ? AND Lu = 0',
      [req.user.id]
    );
    res.json({ count: rows[0].count });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// POST envoyer une notification (admin)
router.post('/send', auth, async (req, res) => {
  try {
    const { Id_UTILISATEUR, Titre_Notif, Message_Notif } = req.body;

    if (!Id_UTILISATEUR || !Message_Notif) {
      return res.status(400).json({ error: 'Destinataire et message requis' });
    }

    await db.query(
      'INSERT INTO NOTIFICATION (Id_UTILISATEUR, Titre_Notif, Message_Notif) VALUES (?,?,?)',
      [Id_UTILISATEUR, Titre_Notif || 'Notification MyCESA', Message_Notif]
    );

    // Envoyer via Socket.io en temps réel
    const io = req.app.get('io');
    if (io) {
      io.to('user_' + Id_UTILISATEUR).emit('nouvelle_notification', {
        titre: Titre_Notif,
        message: Message_Notif,
      });
    }

    res.status(201).json({ message: 'Notification envoyée' });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// PUT marquer comme lue
router.put('/:id/lire', auth, async (req, res) => {
  try {
    await db.query(
      'UPDATE NOTIFICATION SET Lu = 1 WHERE Id_EVENEMENT = ? AND Id_UTILISATEUR = ?',
      [req.params.id, req.user.id]
    );
    res.json({ message: 'Notification marquée comme lue' });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// PUT tout marquer comme lu
router.put('/tout-lire', auth, async (req, res) => {
  try {
    await db.query(
      'UPDATE NOTIFICATION SET Lu = 1 WHERE Id_UTILISATEUR = ?',
      [req.user.id]
    );
    res.json({ message: 'Toutes les notifications marquées comme lues' });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

module.exports = router;
