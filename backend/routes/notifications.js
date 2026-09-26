const express = require('express');
const router  = express.Router();
const db      = require('../config/db');
const auth    = require('../middleware/authMiddleware');

// â”€â”€ Fonction helper envoi Expo Push â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
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

// â”€â”€ GET notifications d'un utilisateur â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
router.get('/user/:id', auth, async (req, res) => {
  try {
    const [rows] = await db.query(
      `SELECT * FROM NOTIFICATION WHERE Id_UTILISATEUR = ? ORDER BY Date_Notif DESC LIMIT 50`,
      [req.params.id]
    );
    res.json(rows);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// â”€â”€ GET notifications utilisateur connectÃ© â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
router.get('/', auth, async (req, res) => {
  try {
    const [rows] = await db.query(
      `SELECT * FROM NOTIFICATION WHERE Id_UTILISATEUR = ? ORDER BY Date_Notif DESC LIMIT 30`,
      [req.user.id]
    );
    res.json(rows);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// â”€â”€ GET nombre non lues â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
router.get('/non-lues', auth, async (req, res) => {
  try {
    const [rows] = await db.query(
      'SELECT COUNT(*) AS count FROM NOTIFICATION WHERE Id_UTILISATEUR = ? AND Lu = 0',
      [req.user.id]
    );
    res.json({ count: rows[0].count });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// â”€â”€ POST sauvegarder token Expo push â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
router.post('/token', auth, async (req, res) => {
  try {
    const { userId, token, platform } = req.body;
    if (!userId || !token) return res.status(400).json({ error: 'DonnÃ©es manquantes' });

    // CrÃ©er table si elle n'existe pas
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

    // InsÃ©rer ou mettre Ã  jour
    await db.query(`
      INSERT INTO PUSH_TOKENS (Id_UTILISATEUR, Token, Platform)
      VALUES (?, ?, ?)
      ON DUPLICATE KEY UPDATE Token = VALUES(Token), UpdatedAt = NOW()
    `, [userId, token, platform || 'android']);

    // Aussi mettre Ã  jour dans UTILISATEUR si la colonne existe
    try {
      await db.query(
        'UPDATE UTILISATEUR SET Expo_Token = ? WHERE Id_UTILISATEUR = ?',
        [token, userId]
      );
    } catch (_) {}

    res.json({ success: true, message: 'Token enregistrÃ©' });
  } catch (err) {
    console.error('Erreur token push:', err);
    res.status(500).json({ error: err.message });
  }
});

// â”€â”€ POST envoyer notification Ã  un utilisateur â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
router.post('/send', auth, async (req, res) => {
  try {
    const { Id_UTILISATEUR, userId, Titre_Notif, titre, Message_Notif, message } = req.body;

    // Support des deux formats
    const destId  = Id_UTILISATEUR || userId;
    const titreF  = Titre_Notif || titre || 'Notification MyCESA';
    const msgF    = Message_Notif || message;

    if (!destId || !msgF) return res.status(400).json({ error: 'Destinataire et message requis' });

    // InsÃ©rer en base
    await db.query(
      'INSERT INTO NOTIFICATION (Id_UTILISATEUR, Titre_Notif, Message_Notif) VALUES (?,?,?)',
      [destId, titreF, msgF]
    );

    // Socket.io temps rÃ©el
    const io = req.app.get('io');
    if (io) {
      io.to('user_' + destId).emit('nouvelle_notification', { titre: titreF, message: msgF });
    }

    // Push Expo â€” chercher token dans PUSH_TOKENS d'abord, sinon UTILISATEUR
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

    res.status(201).json({ success: true, message: 'Notification envoyÃ©e' });
  } catch (err) {
    console.error('Erreur send:', err);
    res.status(500).json({ error: err.message });
  }
});

// â”€â”€ POST annonce Ã  tous les Ã©tudiants â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
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

    res.status(201).json({ success: true, message: `Annonce envoyÃ©e Ã  ${etudiants.length} Ã©tudiant(s)` });
  } catch (err) {
    console.error('Erreur annonce:', err);
    res.status(500).json({ error: err.message });
  }
});

// â”€â”€ PUT marquer une notification comme lue â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
router.put('/:id/lire', auth, async (req, res) => {
  try {
    await db.query(
      'UPDATE NOTIFICATION SET Lu = 1 WHERE Id_EVENEMENT = ? AND Id_UTILISATEUR = ?',
      [req.params.id, req.user.id]
    );
    res.json({ success: true });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// â”€â”€ PUT tout marquer comme lu â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
router.put('/user/:id/lire-tout', auth, async (req, res) => {
  try {
    await db.query('UPDATE NOTIFICATION SET Lu = 1 WHERE Id_UTILISATEUR = ?', [req.params.id]);
    res.json({ success: true });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// â”€â”€ NOUVELLES ROUTES : SYSTÃˆME DE NOTIFICATIONS CIBLÃ‰ES â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

// â”€â”€ POST /notifications/send-cible â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
// â”€â”€ Table notification_contents : colonnes rÃ©ellement prÃ©sentes en base â”€â”€
const NOTIF_TABLE = 'notification_contents';
let notifColumnsCache = null;

/** Liste des colonnes de notification_contents (mise en cache). */
async function notifColumns() {
  if (notifColumnsCache) return notifColumnsCache;
  const [rows] = await db.query(`SHOW COLUMNS FROM ${NOTIF_TABLE}`);
  notifColumnsCache = new Set(rows.map((c) => c.Field));
  return notifColumnsCache;
}

/** Colonnes rÃ©ellement prÃ©sentes dans UTILISATEUR / ETUDIANT (mises en cache). */
let usersColumnsCache = null;
let etudiantsColumnsCache = null;
async function userColumns() {
  if (!usersColumnsCache) {
    const [rows] = await db.query('SHOW COLUMNS FROM UTILISATEUR');
    usersColumnsCache = new Set(rows.map((c) => c.Field));
  }
  return usersColumnsCache;
}
async function etudiantColumns() {
  if (!etudiantsColumnsCache) {
    const [rows] = await db.query('SHOW COLUMNS FROM ETUDIANT');
    etudiantsColumnsCache = new Set(rows.map((c) => c.Field));
  }
  return etudiantsColumnsCache;
}

/**
 * RÃ©sout les Id_UTILISATEUR destinataires d'une cible.
 *
 * La table ETUDIANT n'a PAS de colonne Id_UTILISATEUR : on relie l'Ã©tudiant Ã  son
 * compte via Email_Etudiant = Email_User (l'email est l'identifiant de connexion).
 * On tente les deux orthographes rÃ©elles (Id_FILIERE / Id_CLASSE) pour Ãªtre
 * robuste quel que soit le dump de la base.
 */
async function resolveRecipients(cible, { Id_Filiere, Id_Classe, Id_Etudiant } = {}) {
  const users = await userColumns();
  const etudiants = await etudiantColumns();
  const colFiliere = etudiants.has('Id_FILIERE') ? 'Id_FILIERE' : (etudiants.has('Id_Filiere') ? 'Id_Filiere' : null);
  const colClasse = etudiants.has('Id_CLASSE') ? 'Id_CLASSE' : (etudiants.has('Id_Classe') ? 'Id_Classe' : null);

  // Email de connexion : la colonne s'appelle Email_User dans UTILISATEUR.
  const colEmail = users.has('Email_User') ? 'Email_User' : (users.has('Email_UTILISATEUR') ? 'Email_UTILISATEUR' : null);
  if (!colEmail) return [];

  const base = `SELECT DISTINCT u.Id_UTILISATEUR AS userId
                  FROM ETUDIANT e
                  JOIN UTILISATEUR u ON u.${colEmail} = e.Email_Etudiant
                 WHERE e.Email_Etudiant IS NOT NULL`;

  if (cible === 'etudiant') {
    const id = Number(Id_Etudiant);
    if (!id) return [];
    // Id_Etudiant transmis = Id_ETUDIANT. On rÃ©sout d'abord son email, puis le compte liÃ©.
    const [rows] = await db.query(
      'SELECT Email_Etudiant FROM ETUDIANT WHERE Id_ETUDIANT = ?', [id],
    );
    if (!rows.length || !rows[0].Email_Etudiant) return [];
    const [comptes] = await db.query(
      `SELECT Id_UTILISATEUR AS userId FROM UTILISATEUR WHERE ${colEmail} = ?`,
      [rows[0].Email_Etudiant],
    );
    return comptes.map((c) => c.userId);
  }

  if (cible === 'filiere') {
    if (!colFiliere || !Id_Filiere) return [];
    const [rows] = await db.query(`${base} AND e.${colFiliere} = ?`, [Id_Filiere]);
    return rows.map((r) => r.userId);
  }

  if (cible === 'classe') {
    if (!colClasse || !Id_Classe) return [];
    const [rows] = await db.query(`${base} AND e.${colClasse} = ?`, [Id_Classe]);
    return rows.map((r) => r.userId);
  }

  // Cible 'tous' : tous les comptes Ã©tudiants reliÃ©s Ã  une fiche ETUDIANT.
  const [rows] = await db.query(base);
  return rows.map((r) => r.userId);
}

// â”€â”€ GET /notifications/cibles â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
// Listes rÃ©elles (FILIERE / CLASSE / ETUDIANT) utilisÃ©es par les listes
// dÃ©roulantes du formulaire d'ajout de notification dans MyCESA_Admin.
router.get('/cibles', auth, async (req, res) => {
  try {
    const etudiants = await etudiantColumns();
    const colFiliere = etudiants.has('Id_FILIERE') ? 'Id_FILIERE' : (etudiants.has('Id_Filiere') ? 'Id_Filiere' : null);
    const colClasse = etudiants.has('Id_CLASSE') ? 'Id_CLASSE' : (etudiants.has('Id_Classe') ? 'Id_Classe' : null);

    const [filieres] = await db.query(
      'SELECT Id_FILIERE, Nom_Filiere FROM FILIERE ORDER BY Nom_Filiere',
    );

    const [classes] = await db.query(
      'SELECT Id_CLASSE, Nom_Classe, Id_FILIERE FROM CLASSE ORDER BY Nom_Classe',
    );

    // Les Ã©tudiants proviennent des mÃªmes colonnes rÃ©elles que le reste de l'app.
    const [etudiantsRows] = await db.query(
      `SELECT e.Id_ETUDIANT, e.Matricule_Etudiant, e.Nom_Etudiant, e.Prenoms_Etudiant,
              ${colClasse ? `e.${colClasse}` : 'NULL'} AS Id_CLASSE,
              ${colFiliere ? `e.${colFiliere}` : 'NULL'} AS Id_FILIERE
       FROM ETUDIANT e
       ORDER BY e.Nom_Etudiant, e.Prenoms_Etudiant`,
    );

    res.json({
      filieres: filieres.map((f) => ({ id: f.Id_FILIERE, nom: f.Nom_Filiere })),
      classes: classes.map((c) => ({ id: c.Id_CLASSE, nom: c.Nom_Classe, filiereId: c.Id_FILIERE ?? null })),
      etudiants: etudiantsRows.map((e) => ({
        id: e.Id_ETUDIANT,
        matricule: e.Matricule_Etudiant || '',
        nom: e.Nom_Etudiant || '',
        prenoms: e.Prenoms_Etudiant || '',
        classeId: e.Id_CLASSE ?? null,
        filiereId: e.Id_FILIERE ?? null,
      })),
    });
  } catch (err) {
    console.error('Erreur /notifications/cibles:', err);
    res.status(500).json({ error: err.message });
  }
});

// â”€â”€ POST /notifications/send-cible â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
router.post('/send-cible', auth, async (req, res) => {
  try {
    const { Titre_Notif, Message_Notif, Type, Cible,
            Id_Filiere, Id_Classe, Id_Etudiant, Scheduled_At } = req.body;

    // Validation
    if (!Titre_Notif || !Message_Notif) {
      return res.status(400).json({ error: 'Titre et message requis' });
    }

    // INSERT dans notification_contents
    const [result] = await db.query(
      `INSERT INTO notification_contents
       (Titre_Notif, Message_Notif, Type, Cible, Id_Filiere, Id_Classe, Id_Etudiant, Scheduled_At, created_by)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [Titre_Notif, Message_Notif, Type || 'autre', Cible || 'tous',
       Id_Filiere || null, Id_Classe || null, Id_Etudiant || null,
       Scheduled_At || null, req.user.id]
    );
    const notificationId = result.insertId;

    // Construire la liste des destinataires selon Cible
    const recipients = await resolveRecipients(Cible || 'tous', { Id_Filiere, Id_Classe, Id_Etudiant });

    // INSERT en masse dans notification_recipients
    if (recipients.length > 0) {
      const values = recipients.map(userId => `(${notificationId}, ${userId})`).join(', ');
      await db.query(
        `INSERT INTO notification_recipients (id_notification, Id_UTILISATEUR)
         VALUES ${values}`
      );
    }

    // Si pas programmÃ©, marquer comme envoyÃ©
    if (!Scheduled_At) {
      await db.query(
        'UPDATE notification_contents SET Sent_At = NOW() WHERE id = ?',
        [notificationId]
      );
    }

    res.status(201).json({
      success: true,
      recipients_count: recipients.length,
      notification_id: notificationId
    });
  } catch (err) {
    console.error('Erreur send-cible:', err);
    res.status(500).json({ error: err.message });
  }
});

// â”€â”€ GET /notifications/admin/liste â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
router.get('/admin/liste', auth, async (req, res) => {
  try {
    // VÃ©rification rÃ´le admin (Ã  adapter selon votre systÃ¨me de rÃ´les)
    const role = String(req.user.role || '').toLowerCase();
    if (role && role !== 'admin' && role !== 'super_admin' && role !== 'administrateur') {
      return res.status(403).json({ error: 'AccÃ¨s admin requis' });
    }

    // Les libellÃ©s de cible viennent des tables rÃ©elles (FILIERE / CLASSE / ETUDIANT).
    const [rows] = await db.query(
      `SELECT nc.id, nc.Titre_Notif, nc.Message_Notif, nc.Type, nc.Cible,
              nc.Id_Filiere, nc.Id_Classe, nc.Id_Etudiant,
              nc.Scheduled_At, nc.Sent_At, nc.created_by, nc.Date_Notif,
              f.Nom_Filiere,
              cl.Nom_Classe,
              CONCAT_WS(' ', e.Nom_Etudiant, e.Prenoms_Etudiant) AS Nom_Etudiant,
              e.Matricule_Etudiant,
              u.Nom_User AS Auteur_Nom,
              COUNT(nr.id) AS total_recipients,
              COALESCE(SUM(nr.Lu), 0) AS total_lus
       FROM notification_contents nc
       LEFT JOIN FILIERE   f  ON nc.Id_Filiere  = f.Id_FILIERE
       LEFT JOIN CLASSE    cl ON nc.Id_Classe   = cl.Id_CLASSE
       LEFT JOIN ETUDIANT  e  ON nc.Id_Etudiant = e.Id_ETUDIANT
       LEFT JOIN UTILISATEUR u ON nc.created_by = u.Id_UTILISATEUR
       LEFT JOIN notification_recipients nr ON nc.id = nr.id_notification
       GROUP BY nc.id
       ORDER BY nc.Date_Notif DESC`
    );

    res.json(rows);
  } catch (err) {
    console.error('Erreur admin/liste:', err);
    res.status(500).json({ error: err.message });
  }
});


// â”€â”€ GET /notifications/moi â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
router.get('/moi', auth, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const pageSize = 20;
    const offset = (page - 1) * pageSize;

    const [rows] = await db.query(
      `SELECT nc.id, nc.Titre_Notif, nc.Message_Notif, nc.Type, nc.Date_Notif,
              nr.Lu, nr.Date_Lecture
       FROM notification_recipients nr
       JOIN notification_contents nc ON nr.id_notification = nc.id
       WHERE nr.Id_UTILISATEUR = ? AND nc.Sent_At IS NOT NULL
       ORDER BY nc.Date_Notif DESC
       LIMIT ? OFFSET ?`,
      [req.user.id, pageSize, offset]
    );

    // VÃ©rifier s'il y a plus de rÃ©sultats
    const [countResult] = await db.query(
      `SELECT COUNT(*) as total
       FROM notification_recipients nr
       JOIN notification_contents nc ON nr.id_notification = nc.id
       WHERE nr.Id_UTILISATEUR = ? AND nc.Sent_At IS NOT NULL`,
      [req.user.id]
    );

    const total = countResult[0].total;
    const hasMore = (page * pageSize) < total;

    res.json({
      notifications: rows,
      page: page,
      hasMore: hasMore
    });
  } catch (err) {
    console.error('Erreur /moi:', err);
    res.status(500).json({ error: err.message });
  }
});

// â”€â”€ GET /notifications/moi/non-lues â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
router.get('/moi/non-lues', auth, async (req, res) => {
  try {
    const [rows] = await db.query(
      `SELECT COUNT(*) as count
       FROM notification_recipients nr
       JOIN notification_contents nc ON nr.id_notification = nc.id
       WHERE nr.Id_UTILISATEUR = ? AND nr.Lu = 0 AND nc.Sent_At IS NOT NULL`,
      [req.user.id]
    );

    res.json({ count: rows[0].count });
  } catch (err) {
    console.error('Erreur /moi/non-lues:', err);
    res.status(500).json({ error: err.message });
  }
});

// â”€â”€ PUT /notifications/moi/:id/lire â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
router.put('/moi/:id/lire', auth, async (req, res) => {
  try {
    await db.query(
      `UPDATE notification_recipients
       SET Lu = 1, Date_Lecture = NOW()
       WHERE id_notification = ? AND Id_UTILISATEUR = ?`,
      [req.params.id, req.user.id]
    );

    res.json({ success: true });
  } catch (err) {
    console.error('Erreur /moi/:id/lire:', err);
    res.status(500).json({ error: err.message });
  }
});

// â”€â”€ PUT /notifications/moi/lire-tout â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
router.put('/moi/lire-tout', auth, async (req, res) => {
  try {
    await db.query(
      `UPDATE notification_recipients nr
       JOIN notification_contents nc ON nr.id_notification = nc.id
       SET nr.Lu = 1, nr.Date_Lecture = NOW()
       WHERE nr.Id_UTILISATEUR = ? AND nr.Lu = 0 AND nc.Sent_At IS NOT NULL`,
      [req.user.id]
    );

    res.json({ success: true });
  } catch (err) {
    console.error('Erreur /moi/lire-tout:', err);
    res.status(500).json({ error: err.message });
  }
});

// â”€â”€ PUT /notifications/admin/:id â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
// Modifie une notification ciblÃ©e (uniquement les colonnes rÃ©ellement en base).
router.put('/admin/:id', auth, async (req, res) => {
  try {
    const role = String(req.user.role || '').toLowerCase();
    if (role && role !== 'admin' && role !== 'super_admin' && role !== 'administrateur') {
      return res.status(403).json({ error: 'AccÃ¨s admin requis' });
    }

    const { Titre_Notif, Message_Notif, Type, Cible,
            Id_Filiere, Id_Classe, Id_Etudiant, Scheduled_At } = req.body;

    if (!Titre_Notif || !Message_Notif) {
      return res.status(400).json({ error: 'Titre et message requis' });
    }

    const cols = await notifColumns();
    // Certaines colonnes n'existent pas dans les bases anciennes : on ne les
    // inclut que si elles sont rÃ©ellement prÃ©sentes.
    const setClauses = ['Titre_Notif = ?', 'Message_Notif = ?'];
    const values = [Titre_Notif, Message_Notif];
    const optionnelles = { Type, Cible, Id_Filiere, Id_Classe, Id_Etudiant, Scheduled_At };
    for (const [colonne, valeur] of Object.entries(optionnelles)) {
      if (!cols.has(colonne)) continue;
      setClauses.push(`${colonne} = ?`);
      values.push(valeur === undefined || valeur === '' ? null : valeur);
    }
    values.push(req.params.id);

    const [result] = await db.query(
      `UPDATE notification_contents SET ${setClauses.join(', ')} WHERE id = ?`, values,
    );
    if (!result.affectedRows) return res.status(404).json({ error: 'Notification introuvable' });

    // Recalcul des destinataires si la cible a changÃ©
    if (Cible) {
      const recipients = await resolveRecipients(Cible, { Id_Filiere, Id_Classe, Id_Etudiant });
      await db.query('DELETE FROM notification_recipients WHERE id_notification = ?', [req.params.id]);
      if (recipients.length > 0) {
        const bulk = recipients.map((userId) => `(${Number(req.params.id)}, ${userId})`).join(', ');
        await db.query(
          `INSERT INTO notification_recipients (id_notification, Id_UTILISATEUR) VALUES ${bulk}`,
        );
      }
    }

    res.json({ success: true, message: 'Notification modifiÃ©e' });
  } catch (err) {
    console.error('Erreur admin update:', err);
    res.status(500).json({ error: err.message });
  }
});

// â”€â”€ POST /notifications/admin/:id/envoyer â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
// Envoie immÃ©diatement une notification programmÃ©e / en brouillon.
router.post('/admin/:id/envoyer', auth, async (req, res) => {
  try {
    const role = String(req.user.role || '').toLowerCase();
    if (role && role !== 'admin' && role !== 'super_admin' && role !== 'administrateur') {
      return res.status(403).json({ error: 'AccÃ¨s admin requis' });
    }

    const [rows] = await db.query(
      'SELECT * FROM notification_contents WHERE id = ?', [req.params.id],
    );
    if (!rows.length) return res.status(404).json({ error: 'Notification introuvable' });
    const notif = rows[0];

    const recipients = await resolveRecipients(notif.Cible, {
      Id_Filiere: notif.Id_Filiere, Id_Classe: notif.Id_Classe, Id_Etudiant: notif.Id_Etudiant,
    });

    await db.query('DELETE FROM notification_recipients WHERE id_notification = ?', [req.params.id]);
    if (recipients.length > 0) {
      const bulk = recipients.map((userId) => `(${Number(req.params.id)}, ${userId})`).join(', ');
      await db.query(
        `INSERT INTO notification_recipients (id_notification, Id_UTILISATEUR) VALUES ${bulk}`,
      );
    }

    const cols = await notifColumns();
    if (cols.has('Sent_At')) {
      await db.query('UPDATE notification_contents SET Sent_At = NOW() WHERE id = ?', [req.params.id]);
    }

    // Notification temps rÃ©el + push pour chaque destinataire (si disponibles)
    const io = req.app.get('io');
    if (io) {
      recipients.forEach((userId) => io.to('user_' + userId).emit('nouvelle_notification', {
        titre: notif.Titre_Notif, message: notif.Message_Notif,
      }));
    }
    for (const userId of recipients) {
      try {
        const [tokens] = await db.query('SELECT Token FROM PUSH_TOKENS WHERE Id_UTILISATEUR = ?', [userId]);
        const token = tokens.length ? tokens[0].Token : null;
        if (token) await sendExpoPushNotification(token, notif.Titre_Notif, notif.Message_Notif);
      } catch (_) { /* push optionnel */ }
    }

    res.json({ success: true, recipients_count: recipients.length });
  } catch (err) {
    console.error('Erreur admin envoyer:', err);
    res.status(500).json({ error: err.message });
  }
});

// â”€â”€ DELETE /notifications/admin/:id â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
router.delete('/admin/:id', auth, async (req, res) => {
  try {
    // VÃ©rification rÃ´le admin
    if (req.user.role !== 'admin' && req.user.role !== 'super_admin') {
      return res.status(403).json({ error: 'AccÃ¨s admin requis' });
    }

    await db.query('DELETE FROM notification_contents WHERE id = ?', [req.params.id]);
    // CASCADE supprime automatiquement les recipients

    res.json({ success: true, message: 'Notification supprimÃ©e' });
  } catch (err) {
    console.error('Erreur admin delete:', err);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
