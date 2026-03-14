const express = require('express');
const router  = express.Router();
const db      = require('../config/db');
const auth    = require('../middleware/authMiddleware');

// ── Fonction helper envoi Expo Push ──────────────────────────
async function sendExpoPushNotification(token, titre, message) {
  try {
    await fetch('https://exp.host/--/api/v2/push/send', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
      body: JSON.stringify({ to: token, sound: 'default', title: titre, body: message }),
    });
  } catch (err) {
    console.log('Erreur Expo push:', err.message);
  }
}

// ── GET notifications d'un utilisateur ───────────────────────
router.get('/user/:id', auth, async (req, res) => {
  try {
    const [rows] = await db.query(
      `SELECT * FROM NOTIFICATION WHERE Id_UTILISATEUR = ? ORDER BY Date_Notif DESC LIMIT 50`,
      [req.params.id]
    );
    res.json(rows);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// ── GET notifications utilisateur connecté ───────────────────
router.get('/', auth, async (req, res) => {
  try {
    const [rows] = await db.query(
      `SELECT * FROM NOTIFICATION WHERE Id_UTILISATEUR = ? ORDER BY Date_Notif DESC LIMIT 30`,
      [req.user.id]
    );
    res.json(rows);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// ── GET nombre non lues ───────────────────────────────────────
router.get('/non-lues', auth, async (req, res) => {
  try {
    const [rows] = await db.query(
      'SELECT COUNT(*) AS count FROM NOTIFICATION WHERE Id_UTILISATEUR = ? AND Lu = 0',
      [req.user.id]
    );
    res.json({ count: rows[0].count });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// ── POST sauvegarder token Expo push ─────────────────────────
router.post('/token', auth, async (req, res) => {
  try {
    const { userId, token, platform } = req.body;
    if (!userId || !token) return res.status(400).json({ error: 'Données manquantes' });

    // Créer table si elle n'existe pas
    await db.query(`
      CREATE TABLE IF NOT EXISTS PUSH_TOKENS (
        Id_Token INT AUTO_INCREMENT PRIMARY KEY,
        Id_UTILISATEUR INT NOT NULL,
        Token VARCHAR(500) NOT NULL,
        Platform VARCHAR(20) DEFAULT 'android',
        CreatedAt DATETIME DEFAULT NOW(),
        UpdatedAt DATETIME DEFAULT NOW() ON UPDATE NOW(),
        UNIQUE KEY unique_user (Id_UTILISATEUR),
        FOREIGN KEY (Id_UTILISATEUR) REFERENCES UTILISATEUR(Id_UTILISATEUR)
      )
    `);

    // Insérer ou mettre à jour
    await db.query(`
      INSERT INTO PUSH_TOKENS (Id_UTILISATEUR, Token, Platform)
      VALUES (?, ?, ?)
      ON DUPLICATE KEY UPDATE Token = VALUES(Token), UpdatedAt = NOW()
    `, [userId, token, platform || 'android']);

    // Aussi mettre à jour dans UTILISATEUR si la colonne existe
    try {
      await db.query(
        'UPDATE UTILISATEUR SET Expo_Token = ? WHERE Id_UTILISATEUR = ?',
        [token, userId]
      );
    } catch (_) {}

    res.json({ success: true, message: 'Token enregistré' });
  } catch (err) {
    console.error('Erreur token push:', err);
    res.status(500).json({ error: err.message });
  }
});

// ── POST envoyer notification à un utilisateur ───────────────
router.post('/send', auth, async (req, res) => {
  try {
    const { Id_UTILISATEUR, userId, Titre_Notif, titre, Message_Notif, message } = req.body;

    // Support des deux formats
    const destId  = Id_UTILISATEUR || userId;
    const titreF  = Titre_Notif || titre || 'Notification MyCESA';
    const msgF    = Message_Notif || message;

    if (!destId || !msgF) return res.status(400).json({ error: 'Destinataire et message requis' });

    // Insérer en base
    await db.query(
      'INSERT INTO NOTIFICATION (Id_UTILISATEUR, Titre_Notif, Message_Notif) VALUES (?,?,?)',
      [destId, titreF, msgF]
    );

    // Socket.io temps réel
    const io = req.app.get('io');
    if (io) {
      io.to('user_' + destId).emit('nouvelle_notification', { titre: titreF, message: msgF });
    }

    // Push Expo — chercher token dans PUSH_TOKENS d'abord, sinon UTILISATEUR
    let expoToken = null;
    try {
      const [tokens] = await db.query('SELECT Token FROM PUSH_TOKENS WHERE Id_UTILISATEUR = ?', [destId]);
      if (tokens.length) expoToken = tokens[0].Token;
    } catch (_) {}

    if (!expoToken) {
      try {
        const [user] = await db.query('SELECT Expo_Token FROM UTILISATEUR WHERE Id_UTILISATEUR = ?', [destId]);
        if (user.length) expoToken = user[0].Expo_Token;
      } catch (_) {}
    }

    if (expoToken) await sendExpoPushNotification(expoToken, titreF, msgF);

    res.status(201).json({ success: true, message: 'Notification envoyée' });
  } catch (err) {
    console.error('Erreur send:', err);
    res.status(500).json({ error: err.message });
  }
});

// ── POST annonce à tous les étudiants ────────────────────────
router.post('/annonce', auth, async (req, res) => {
  try {
    const { Titre_Notif, Message_Notif } = req.body;
    if (!Message_Notif) return res.status(400).json({ error: 'Message requis' });

    const [etudiants] = await db.query(
      `SELECT u.Id_UTILISATEUR, pt.Token as Expo_Token
       FROM UTILISATEUR u
       LEFT JOIN PUSH_TOKENS pt ON pt.Id_UTILISATEUR = u.Id_UTILISATEUR
       WHERE u.Id_ROLE = 4`
    );

    for (const etudiant of etudiants) {
      await db.query(
        'INSERT INTO NOTIFICATION (Id_UTILISATEUR, Titre_Notif, Message_Notif) VALUES (?,?,?)',
        [etudiant.Id_UTILISATEUR, Titre_Notif || 'Annonce MyCESA', Message_Notif]
      );
      if (etudiant.Expo_Token) {
        await sendExpoPushNotification(etudiant.Expo_Token, Titre_Notif || 'Annonce MyCESA', Message_Notif);
      }
    }

    const io = req.app.get('io');
    if (io) io.emit('nouvelle_notification', { titre: Titre_Notif, message: Message_Notif });

    res.status(201).json({ success: true, message: `Annonce envoyée à ${etudiants.length} étudiant(s)` });
  } catch (err) {
    console.error('Erreur annonce:', err);
    res.status(500).json({ error: err.message });
  }
});

// ── PUT marquer une notification comme lue ───────────────────
router.put('/:id/lire', auth, async (req, res) => {
  try {
    await db.query(
      'UPDATE NOTIFICATION SET Lu = 1 WHERE Id_EVENEMENT = ? AND Id_UTILISATEUR = ?',
      [req.params.id, req.user.id]
    );
    res.json({ success: true });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// ── PUT tout marquer comme lu ─────────────────────────────────
router.put('/user/:id/lire-tout', auth, async (req, res) => {
  try {
    await db.query('UPDATE NOTIFICATION SET Lu = 1 WHERE Id_UTILISATEUR = ?', [req.params.id]);
    res.json({ success: true });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

module.exports = router;