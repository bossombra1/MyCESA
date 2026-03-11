// routes/notifications.js — Notifications
const express = require('express');
const router  = express.Router();
const db      = require('../config/db');
const auth    = require('../middleware/authMiddleware');

// GET notifications d'un utilisateur par ID
router.get('/user/:id', auth, async (req, res) => {
  try {
    const [rows] = await db.query(
      `SELECT * FROM NOTIFICATION
       WHERE Id_UTILISATEUR = ?
       ORDER BY Date_Notif DESC LIMIT 50`,
      [req.params.id]
    );
    res.json(rows);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// GET notifications de l'utilisateur connecté
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

// POST sauvegarder le token Expo
router.post('/token', auth, async (req, res) => {
  try {
    const { Id_UTILISATEUR, Expo_Token } = req.body;
    await db.query(
      'UPDATE utilisateur SET Expo_Token = ? WHERE Id_UTILISATEUR = ?',
      [Expo_Token, Id_UTILISATEUR]
    );
    res.json({ message: 'Token enregistré' });
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

    // Envoyer notification push Expo
    const [user] = await db.query(
      'SELECT Expo_Token FROM utilisateur WHERE Id_UTILISATEUR = ?',
      [Id_UTILISATEUR]
    );
    if (user.length && user[0].Expo_Token) {
      await sendExpoPushNotification(
        user[0].Expo_Token,
        Titre_Notif || 'Notification MyCESA',
        Message_Notif
      );
    }

    res.status(201).json({ message: 'Notification envoyée' });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// POST envoyer à tous les étudiants (annonce école)
router.post('/annonce', auth, async (req, res) => {
  try {
    const { Titre_Notif, Message_Notif } = req.body;
    if (!Message_Notif) return res.status(400).json({ error: 'Message requis' });

    // Récupérer tous les étudiants
    const [etudiants] = await db.query(
      'SELECT Id_UTILISATEUR, Expo_Token FROM utilisateur WHERE Id_ROLE = 4'
    );

    // Insérer notification pour chacun
    for (const etudiant of etudiants) {
      await db.query(
        'INSERT INTO NOTIFICATION (Id_UTILISATEUR, Titre_Notif, Message_Notif) VALUES (?,?,?)',
        [etudiant.Id_UTILISATEUR, Titre_Notif || 'Annonce MyCESA', Message_Notif]
      );
      // Push notification
      if (etudiant.Expo_Token) {
        await sendExpoPushNotification(
          etudiant.Expo_Token,
          Titre_Notif || 'Annonce MyCESA',
          Message_Notif
        );
      }
    }

    res.status(201).json({ message: `Annonce envoyée à ${etudiants.length} étudiant(s)` });
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
router.put('/user/:id/lire-tout', auth, async (req, res) => {
  try {
    await db.query(
      'UPDATE NOTIFICATION SET Lu = 1 WHERE Id_UTILISATEUR = ?',
      [req.params.id]
    );
    res.json({ message: 'Toutes les notifications marquées comme lues' });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// Fonction helper — envoyer push via Expo
async function sendExpoPushNotification(token, title, body) {
  try {
    await fetch('https://exp.host/--/api/v2/push/send', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify({
        to: token,
        title,
        body,
        sound: 'default',
        priority: 'high',
        data: { type: 'mycesa' },
      }),
    });
  } catch (err) {
    console.log('Erreur push Expo:', err);
  }
}

module.exports = router;
