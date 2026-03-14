const express = require('express');
const router  = express.Router();
const db      = require('../config/db');
const auth    = require('../middleware/authMiddleware');

// Créer table si elle n'existe pas
async function initTable() {
  try {
    await db.query(`
      CREATE TABLE IF NOT EXISTS EVENEMENT_ECOLE (
        Id_Evenement INT AUTO_INCREMENT PRIMARY KEY,
        Titre VARCHAR(200) NOT NULL,
        Description TEXT,
        Date_Evenement DATETIME NOT NULL,
        Type VARCHAR(50) DEFAULT 'examen',
        Id_Classe INT,
        Id_Filiere INT,
        Pour_Tous TINYINT DEFAULT 0,
        CreatedAt DATETIME DEFAULT NOW()
      )
    `);
  } catch (err) {
    console.log('Table EVENEMENT_ECOLE déjà existante ou erreur:', err.message);
  }
}
initTable();

// GET événements d'un étudiant
router.get('/etudiant/:userId', auth, async (req, res) => {
  try {
    const [etudiant] = await db.query(
      `SELECT e.Id_CLASSE FROM ETUDIANT e
       JOIN UTILISATEUR u ON u.Email_User = e.Email_Etudiant
       WHERE u.Id_UTILISATEUR = ?`,
      [req.params.userId]
    );

    const Id_Classe = etudiant.length ? etudiant[0].Id_CLASSE : null;

    const [rows] = await db.query(`
      SELECT * FROM EVENEMENT_ECOLE
      WHERE (
        Pour_Tous = 1
        OR (Id_Classe IS NOT NULL AND Id_Classe = ?)
      )
      AND Date_Evenement >= NOW()
      ORDER BY Date_Evenement ASC
      LIMIT 20
    `, [Id_Classe || 0]);

    // Calculer jours restants
    const evenements = rows.map(e => {
      const now   = new Date();
      const date  = new Date(e.Date_Evenement);
      const diff  = date - now;
      const jours = Math.ceil(diff / (1000 * 60 * 60 * 24));
      const heures = Math.ceil(diff / (1000 * 60 * 60));
      return { ...e, jours_restants: jours, heures_restantes: heures };
    });

    res.json(evenements);
  } catch (err) {
    console.error('Erreur événements:', err);
    res.status(500).json({ error: err.message });
  }
});

// GET tous les événements (admin)
router.get('/', auth, async (req, res) => {
  try {
    const [rows] = await db.query(
      'SELECT * FROM EVENEMENT_ECOLE ORDER BY Date_Evenement ASC'
    );
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST créer un événement (admin)
router.post('/', auth, async (req, res) => {
  try {
    const { Titre, Description, Date_Evenement, Type, Id_Classe, Id_Filiere, Pour_Tous } = req.body;
    if (!Titre || !Date_Evenement) return res.status(400).json({ error: 'Titre et date requis' });

    await db.query(`
      INSERT INTO EVENEMENT_ECOLE (Titre, Description, Date_Evenement, Type, Id_Classe, Id_Filiere, Pour_Tous)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `, [Titre, Description || null, Date_Evenement, Type || 'examen', Id_Classe || null, Id_Filiere || null, Pour_Tous ? 1 : 0]);

    const io = req.app.get('io');
    if (io) io.emit('nouvel_evenement', { titre: Titre, date: Date_Evenement });

    res.status(201).json({ success: true, message: 'Événement créé' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE supprimer un événement
router.delete('/:id', auth, async (req, res) => {
  try {
    await db.query('DELETE FROM EVENEMENT_ECOLE WHERE Id_Evenement = ?', [req.params.id]);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;