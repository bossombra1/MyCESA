const express = require('express');
const router  = express.Router();
const db      = require('../config/db');
const auth    = require('../middleware/authMiddleware');

// Créer tables si elles n'existent pas
async function initTables() {
  await db.query(`
    CREATE TABLE IF NOT EXISTS POINTS_ETUDIANT (
      Id_Points INT AUTO_INCREMENT PRIMARY KEY,
      Id_UTILISATEUR INT NOT NULL,
      Total_Points INT DEFAULT 0,
      Niveau INT DEFAULT 1,
      Streak_Connexion INT DEFAULT 0,
      Derniere_Connexion DATE,
      FOREIGN KEY (Id_UTILISATEUR) REFERENCES UTILISATEUR(Id_UTILISATEUR)
    )
  `);
  await db.query(`
    CREATE TABLE IF NOT EXISTS HISTORIQUE_POINTS (
      Id_Historique INT AUTO_INCREMENT PRIMARY KEY,
      Id_UTILISATEUR INT NOT NULL,
      Points INT NOT NULL,
      Raison VARCHAR(200),
      Type VARCHAR(50),
      CreatedAt DATETIME DEFAULT NOW(),
      FOREIGN KEY (Id_UTILISATEUR) REFERENCES UTILISATEUR(Id_UTILISATEUR)
    )
  `);
}
initTables();

// Calculer niveau selon points
function getNiveau(points) {
  if (points >= 5000) return { niveau: 6, titre: '🏆 Élite', couleur: '#F59E0B' };
  if (points >= 2000) return { niveau: 5, titre: '💎 Expert',   couleur: '#8B5CF6' };
  if (points >= 1000) return { niveau: 4, titre: '🥇 Avancé',  couleur: '#2563EB' };
  if (points >= 500)  return { niveau: 3, titre: '🥈 Confirmé', couleur: '#10B981' };
  if (points >= 100)  return { niveau: 2, titre: '🥉 Débutant', couleur: '#2E7D32' };
  return                     { niveau: 1, titre: '⭐ Novice',   couleur: '#64748B' };
}

// GET points d'un étudiant
router.get('/:userId', auth, async (req, res) => {
  try {
    const userId = req.params.userId;

    // Récupérer ou créer les points
    let [rows] = await db.query(
      'SELECT * FROM POINTS_ETUDIANT WHERE Id_UTILISATEUR = ?', [userId]
    );

    if (!rows.length) {
      await db.query(
        'INSERT INTO POINTS_ETUDIANT (Id_UTILISATEUR) VALUES (?)', [userId]
      );
      [rows] = await db.query(
        'SELECT * FROM POINTS_ETUDIANT WHERE Id_UTILISATEUR = ?', [userId]
      );
    }

    const pointsData = rows[0];
    const niveauInfo = getNiveau(pointsData.Total_Points);

    // Historique récent
    const [historique] = await db.query(
      `SELECT * FROM HISTORIQUE_POINTS
       WHERE Id_UTILISATEUR = ?
       ORDER BY CreatedAt DESC LIMIT 10`,
      [userId]
    );

    // Points pour prochain niveau
    const seuilsNiveaux = [0, 100, 500, 1000, 2000, 5000, 99999];
    const prochainSeuil = seuilsNiveaux[niveauInfo.niveau] || 99999;
    const seuilActuel   = seuilsNiveaux[niveauInfo.niveau - 1] || 0;
    const progression   = Math.min(
      ((pointsData.Total_Points - seuilActuel) / (prochainSeuil - seuilActuel)) * 100,
      100
    );

    res.json({
      ...pointsData,
      ...niveauInfo,
      historique,
      prochainSeuil,
      progression: progression.toFixed(0),
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST ajouter des points
router.post('/ajouter', auth, async (req, res) => {
  try {
    const { userId, points, raison, type } = req.body;

    // Créer si n'existe pas
    await db.query(
      `INSERT IGNORE INTO POINTS_ETUDIANT (Id_UTILISATEUR) VALUES (?)`, [userId]
    );

    // Ajouter points
    await db.query(
      `UPDATE POINTS_ETUDIANT
       SET Total_Points = Total_Points + ?
       WHERE Id_UTILISATEUR = ?`,
      [points, userId]
    );

    // Historique
    await db.query(
      `INSERT INTO HISTORIQUE_POINTS (Id_UTILISATEUR, Points, Raison, Type)
       VALUES (?, ?, ?, ?)`,
      [userId, points, raison, type || 'bonus']
    );

    // Notifier via socket
    const io = req.app.get('io');
    if (io) {
      io.to('user_' + userId).emit('points_gagnes', { points, raison });
    }

    res.json({ success: true, message: `+${points} points ajoutés` });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST connexion journalière (streak)
router.post('/connexion/:userId', auth, async (req, res) => {
  try {
    const userId = req.params.userId;
    const today  = new Date().toISOString().split('T')[0];

    await db.query(
      `INSERT IGNORE INTO POINTS_ETUDIANT (Id_UTILISATEUR) VALUES (?)`, [userId]
    );

    const [rows] = await db.query(
      'SELECT * FROM POINTS_ETUDIANT WHERE Id_UTILISATEUR = ?', [userId]
    );
    const data = rows[0];

    const lastDate    = data.Derniere_Connexion
      ? new Date(data.Derniere_Connexion).toISOString().split('T')[0]
      : null;

    // Déjà connecté aujourd'hui
    if (lastDate === today) {
      return res.json({ success: true, dejaConnecte: true, streak: data.Streak_Connexion });
    }

    const hier = new Date();
    hier.setDate(hier.getDate() - 1);
    const hierStr = hier.toISOString().split('T')[0];

    const newStreak = lastDate === hierStr ? data.Streak_Connexion + 1 : 1;

    // Points selon streak
    let pointsBonus = 10;
    let raisonBonus = '📅 Connexion journalière';
    if (newStreak >= 30) { pointsBonus = 100; raisonBonus = '🔥 Streak 30 jours !'; }
    else if (newStreak >= 14) { pointsBonus = 50; raisonBonus = '🔥 Streak 14 jours !'; }
    else if (newStreak >= 7)  { pointsBonus = 30; raisonBonus = '🔥 Streak 7 jours !'; }

    await db.query(
      `UPDATE POINTS_ETUDIANT
       SET Total_Points = Total_Points + ?,
           Streak_Connexion = ?,
           Derniere_Connexion = ?
       WHERE Id_UTILISATEUR = ?`,
      [pointsBonus, newStreak, today, userId]
    );

    await db.query(
      `INSERT INTO HISTORIQUE_POINTS (Id_UTILISATEUR, Points, Raison, Type)
       VALUES (?, ?, ?, 'connexion')`,
      [userId, pointsBonus, raisonBonus]
    );

    res.json({ success: true, pointsGagnes: pointsBonus, streak: newStreak, raison: raisonBonus });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST calculer points depuis les données académiques
router.post('/calculer/:userId', auth, async (req, res) => {
  try {
    const userId = req.params.userId;

    // Notes
    const [notes] = await db.query(
      `SELECT e.Note_Evaluation FROM EVALUATION e
       JOIN ETUDIANT et ON et.Id_ETUDIANT = e.Id_ETUDIANT
       JOIN UTILISATEUR u ON u.Email_User = et.Email_Etudiant
       WHERE u.Id_UTILISATEUR = ?`,
      [userId]
    );

    let pointsTotal = 0;
    const detailPoints = [];

    // Points pour les notes
    for (const note of notes) {
      const n = parseFloat(note.Note_Evaluation);
      if (n >= 16)      { pointsTotal += 50; detailPoints.push({ pts: 50, r: '📝 Note excellente (≥16)' }); }
      else if (n >= 14) { pointsTotal += 30; detailPoints.push({ pts: 30, r: '📝 Très bonne note (≥14)' }); }
      else if (n >= 10) { pointsTotal += 10; detailPoints.push({ pts: 10, r: '📝 Note réussie (≥10)' }); }
    }

    // Points présence (pas d'absences non justifiées)
    const [absences] = await db.query(
      `SELECT COUNT(*) as nb FROM ABSENCE ab
       JOIN ETUDIANT et ON et.Id_ETUDIANT = ab.Id_ETUDIANT
       JOIN UTILISATEUR u ON u.Email_User = et.Email_Etudiant
       WHERE u.Id_UTILISATEUR = ? AND ab.Justifiee = 0`,
      [userId]
    );
    if (absences[0].nb === 0) {
      pointsTotal += 100;
      detailPoints.push({ pts: 100, r: '✅ Aucune absence non justifiée' });
    }

    res.json({ success: true, pointsCalcules: pointsTotal, details: detailPoints });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET classement des étudiants
router.get('/classement/top', auth, async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT 
        pe.Id_UTILISATEUR,
        pe.Total_Points,
        pe.Streak_Connexion,
        pe.Niveau,
        u.Nom_User,
        e.Matricule_Etudiant,
        e.Image_Etudiant,
        c.Nom_Classe,
        f.Nom_Filiere
      FROM POINTS_ETUDIANT pe
      JOIN UTILISATEUR u ON u.Id_UTILISATEUR = pe.Id_UTILISATEUR
      LEFT JOIN ETUDIANT e ON e.Email_Etudiant = u.Email_User
      LEFT JOIN CLASSE c ON c.Id_Classe = e.Id_Classe
      LEFT JOIN FILIERE f ON f.Id_Filiere = e.Id_Filiere
      ORDER BY pe.Total_Points DESC
      LIMIT 20
    `);

    // Ajouter rang et niveau info
    const classement = rows.map((r, i) => ({
      ...r,
      rang: i + 1,
      ...getNiveau(r.Total_Points),
    }));

    res.json(classement);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET rang d'un étudiant spécifique
router.get('/classement/rang/:userId', auth, async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT COUNT(*) + 1 as rang
      FROM POINTS_ETUDIANT
      WHERE Total_Points > (
        SELECT Total_Points FROM POINTS_ETUDIANT WHERE Id_UTILISATEUR = ?
      )
    `, [req.params.userId]);

    const [total] = await db.query('SELECT COUNT(*) as total FROM POINTS_ETUDIANT');

    res.json({
      rang: rows[0].rang,
      total: total[0].total,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;