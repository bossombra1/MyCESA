const express = require('express');
const router  = express.Router();
const db      = require('../config/db');
const auth    = require('../middleware/authMiddleware');

// Créer tables
async function initTables() {
  try {
    await db.query(`
      CREATE TABLE IF NOT EXISTS CONVERSATION (
        Id_Conversation INT AUTO_INCREMENT PRIMARY KEY,
        Id_Etudiant     INT NOT NULL,
        Id_Professeur   INT NOT NULL,
        Dernier_Message TEXT,
        Derniere_Date   DATETIME DEFAULT NOW(),
        Non_Lu_Etudiant INT DEFAULT 0,
        Non_Lu_Prof     INT DEFAULT 0,
        CreatedAt       DATETIME DEFAULT NOW(),
        UNIQUE KEY unique_conv (Id_Etudiant, Id_Professeur),
        FOREIGN KEY (Id_Etudiant)   REFERENCES UTILISATEUR(Id_UTILISATEUR),
        FOREIGN KEY (Id_Professeur) REFERENCES UTILISATEUR(Id_UTILISATEUR)
      )
    `);
    await db.query(`
      CREATE TABLE IF NOT EXISTS MESSAGE (
        Id_Message      INT AUTO_INCREMENT PRIMARY KEY,
        Id_Conversation INT NOT NULL,
        Id_Expediteur   INT NOT NULL,
        Contenu         TEXT NOT NULL,
        Lu              TINYINT DEFAULT 0,
        CreatedAt       DATETIME DEFAULT NOW(),
        FOREIGN KEY (Id_Conversation) REFERENCES CONVERSATION(Id_Conversation),
        FOREIGN KEY (Id_Expediteur)   REFERENCES UTILISATEUR(Id_UTILISATEUR)
      )
    `);
  } catch (err) {
    console.log('Tables messagerie:', err.message);
  }
}
initTables();

// GET toutes les conversations d'un utilisateur
router.get('/conversations/:userId', auth, async (req, res) => {
  try {
    const userId = req.params.userId;
    const [rows] = await db.query(`
      SELECT
        c.*,
        ue.Nom_User  AS Nom_Etudiant,
        up.Nom_User  AS Nom_Professeur,
        ee.Image_Etudiant,
        CASE
          WHEN c.Id_Etudiant = ? THEN c.Non_Lu_Etudiant
          ELSE c.Non_Lu_Prof
        END AS Non_Lu
      FROM CONVERSATION c
      JOIN UTILISATEUR ue ON ue.Id_UTILISATEUR = c.Id_Etudiant
      JOIN UTILISATEUR up ON up.Id_UTILISATEUR = c.Id_Professeur
      LEFT JOIN ETUDIANT ee ON ee.Email_Etudiant = ue.Email_User
      WHERE c.Id_Etudiant = ? OR c.Id_Professeur = ?
      ORDER BY c.Derniere_Date DESC
    `, [userId, userId, userId]);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET messages d'une conversation
router.get('/messages/:convId', auth, async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT m.*, u.Nom_User AS Nom_Expediteur
      FROM MESSAGE m
      JOIN UTILISATEUR u ON u.Id_UTILISATEUR = m.Id_Expediteur
      WHERE m.Id_Conversation = ?
      ORDER BY m.CreatedAt ASC
    `, [req.params.convId]);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET liste des professeurs disponibles
router.get('/professeurs', auth, async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT u.Id_UTILISATEUR, u.Nom_User, u.Email_User,
             p.Nom_Prenoms_Profe
      FROM UTILISATEUR u
      JOIN PROFESSEUR p ON p.email_Profe = u.Email_User
      ORDER BY u.Nom_User
    `);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST envoyer un message
router.post('/envoyer', auth, async (req, res) => {
  try {
    const { Id_Etudiant, Id_Professeur, Id_Expediteur, Contenu } = req.body;
    if (!Contenu?.trim()) return res.status(400).json({ error: 'Message vide' });

    // Créer ou récupérer la conversation
    await db.query(`
      INSERT INTO CONVERSATION (Id_Etudiant, Id_Professeur, Dernier_Message, Derniere_Date)
      VALUES (?, ?, ?, NOW())
      ON DUPLICATE KEY UPDATE
        Dernier_Message = VALUES(Dernier_Message),
        Derniere_Date   = NOW(),
        Non_Lu_Etudiant = Non_Lu_Etudiant + IF(? != Id_Etudiant, 1, 0),
        Non_Lu_Prof     = Non_Lu_Prof     + IF(? != Id_Professeur, 1, 0)
    `, [Id_Etudiant, Id_Professeur, Contenu, Id_Expediteur, Id_Expediteur]);

    // Récupérer l'ID de la conversation
    const [conv] = await db.query(
      'SELECT Id_Conversation FROM CONVERSATION WHERE Id_Etudiant = ? AND Id_Professeur = ?',
      [Id_Etudiant, Id_Professeur]
    );

    // Insérer le message
    await db.query(
      'INSERT INTO MESSAGE (Id_Conversation, Id_Expediteur, Contenu) VALUES (?, ?, ?)',
      [conv[0].Id_Conversation, Id_Expediteur, Contenu]
    );

    // Socket.io temps réel
    const io = req.app.get('io');
    if (io) {
      const destinataire = Id_Expediteur === Id_Etudiant ? Id_Professeur : Id_Etudiant;
      io.to('user_' + destinataire).emit('nouveau_message', {
        convId: conv[0].Id_Conversation,
        expediteur: Id_Expediteur,
        contenu: Contenu,
      });
    }

    res.status(201).json({ success: true, Id_Conversation: conv[0].Id_Conversation });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PUT marquer messages comme lus
router.put('/lire/:convId/:userId', auth, async (req, res) => {
  try {
    const { convId, userId } = req.params;

    // Marquer messages comme lus
    await db.query(
      'UPDATE MESSAGE SET Lu = 1 WHERE Id_Conversation = ? AND Id_Expediteur != ?',
      [convId, userId]
    );

    // Remettre compteur à 0
    const [conv] = await db.query(
      'SELECT Id_Etudiant, Id_Professeur FROM CONVERSATION WHERE Id_Conversation = ?',
      [convId]
    );
    if (conv.length) {
      if (parseInt(userId) === conv[0].Id_Etudiant) {
        await db.query('UPDATE CONVERSATION SET Non_Lu_Etudiant = 0 WHERE Id_Conversation = ?', [convId]);
      } else {
        await db.query('UPDATE CONVERSATION SET Non_Lu_Prof = 0 WHERE Id_Conversation = ?', [convId]);
      }
    }

    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;