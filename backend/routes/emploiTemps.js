const express = require('express');
const router  = express.Router();
const db      = require('../config/db');
const auth    = require('../middleware/authMiddleware');

async function ensureArchiveTable() {
  await db.query(`
    CREATE TABLE IF NOT EXISTS EMPLOI_TEMPS_ARCHIVE (
      Id_Archive INT AUTO_INCREMENT PRIMARY KEY,
      Id_PROFESSEUR INT NULL,
      Id_SALLE INT NULL,
      Id_MATIERE INT NULL,
      Id_CLASSE INT NULL,
      IdEmploi_Temps VARCHAR(50) NULL,
      date_ DATETIME NULL,
      Heure_Debut TIME NULL,
      Heure_Fin TIME NULL,
      Jour_Semaine VARCHAR(20) NULL,
      Action_Archive VARCHAR(20) NOT NULL,
      Date_Archive DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      Id_UTILISATEUR INT NULL
    )
  `);
}

async function archiveSlot(slot, action, userId) {
  await ensureArchiveTable();
  await db.query(`
    INSERT INTO EMPLOI_TEMPS_ARCHIVE
      (Id_PROFESSEUR, Id_SALLE, Id_MATIERE, Id_CLASSE, IdEmploi_Temps,
       date_, Heure_Debut, Heure_Fin, Jour_Semaine, Action_Archive, Id_UTILISATEUR)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `, [
    slot.Id_PROFESSEUR, slot.Id_SALLE, slot.Id_MATIERE, slot.Id_CLASSE,
    slot.IdEmploi_Temps, slot.date_, slot.Heure_Debut, slot.Heure_Fin,
    slot.Jour_Semaine, action, userId || null,
  ]);
}

// GET tous les créneaux (admin) avec filtre par classe
router.get('/', auth, async (req, res) => {
  try {
    const { classe } = req.query;
    let query = `
      SELECT et.*, m.Nom_Matiere, s.Nom_Salle,
             p.Nom_Prenoms_Profe AS Nom_Professeur,
             c.Nom_Classe
      FROM EMPLOI_TEMPS et
      JOIN MATIERE m ON et.Id_MATIERE = m.Id_MATIERE
      JOIN SALLE s ON et.Id_SALLE = s.Id_SALLE
      JOIN PROFESSEUR p ON et.Id_PROFESSEUR = p.Id_PROFESSEUR
      JOIN CLASSE c ON et.Id_CLASSE = c.Id_CLASSE
    `;
    const params = [];
    if (classe) {
      query += ' WHERE et.Id_CLASSE = ?';
      params.push(classe);
    }
    query += ` ORDER BY FIELD(et.Jour_Semaine,'Lundi','Mardi','Mercredi','Jeudi','Vendredi','Samedi'), et.Heure_Debut`;
    const [rows] = await db.query(query, params);
    res.json(rows);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// 1. GET emploi du temps d'un professeur pour UNE DATE PRÉCISE (Mobile)
// Route : /api/emploiTemps/prof/:idProf?date=2026-03-16
router.get('/prof/:idProf', async (req, res) => {
    try {
        const { idProf } = req.params;
        const { date } = req.query;

        if (!date) {
            return res.status(400).json({ error: "La date est requise (YYYY-MM-DD)" });
        }

        // J'ai harmonisé les noms des colonnes (Nom_Matiere, Nom_Classe, etc.)
        const [rows] = await db.query(
            `SELECT
                et.*,
                m.Nom_Matiere,
                c.Nom_Classe,
                s.Nom_Salle
            FROM EMPLOI_TEMPS et
            JOIN MATIERE m ON et.Id_MATIERE = m.Id_MATIERE
            JOIN CLASSE c ON et.Id_CLASSE = c.Id_CLASSE
            JOIN SALLE s ON et.Id_SALLE = s.Id_SALLE
            WHERE et.Id_PROFESSEUR = ?
            AND DATE(et.date_) = ?
            ORDER BY et.Heure_Debut ASC`,
            [idProf, date]
        );

        res.json(rows);
    } catch (err) {
        console.error("Erreur SQL Emploi du Temps Prof:", err);
        res.status(500).json({ error: err.message });
    }
});

// 2. GET emploi du temps d'un professeur (via Id_UTILISATEUR) - avec filtre date optionnel
router.get('/professeur/:id', auth, async (req, res) => {
    try {
        const [prof] = await db.query(
            `SELECT p.Id_PROFESSEUR FROM PROFESSEUR p
             JOIN UTILISATEUR u ON u.Email_User = p.email_Profe
             WHERE u.Id_UTILISATEUR = ?`,
            [req.params.id]
        );

        if (!prof.length) return res.json([]);

        let query = `SELECT et.*, m.Nom_Matiere, s.Nom_Salle, c.Nom_Classe
             FROM EMPLOI_TEMPS et
             JOIN MATIERE m ON et.Id_MATIERE = m.Id_MATIERE
             JOIN SALLE s   ON et.Id_SALLE   = s.Id_SALLE
             JOIN CLASSE c  ON et.Id_CLASSE  = c.Id_CLASSE
             WHERE et.Id_PROFESSEUR = ?`;
        let params = [prof[0].Id_PROFESSEUR];

        if (req.query.date) {
            query += ` AND DATE(et.date_) = ?`;
            params.push(req.query.date);
        }

        query += ` ORDER BY FIELD(et.Jour_Semaine,'Lundi','Mardi','Mercredi','Jeudi','Vendredi','Samedi'),
                      et.Heure_Debut`;

        const [rows] = await db.query(query, params);
        res.json(rows);
    } catch (err) { res.status(500).json({ error: err.message }); }
});

// GET emploi du temps d'un étudiant (via Id_UTILISATEUR)
router.get('/etudiant/:id', auth, async (req, res) => {
  try {
    // Trouver la classe de l'étudiant via son email
    const [etudiant] = await db.query(
      `SELECT e.Id_CLASSE FROM ETUDIANT e
       JOIN UTILISATEUR u ON u.Email_User = e.Email_Etudiant
       WHERE u.Id_UTILISATEUR = ?`,
      [req.params.id]
    );
    if (!etudiant.length) return res.json([]);

    const [rows] = await db.query(
      `SELECT et.*, et.date_ AS Date_Cours,
              m.Nom_Matiere, s.Nom_Salle, s.Localisation_Salle,
              p.Nom_Prenoms_Profe AS Nom_Professeur
       FROM EMPLOI_TEMPS et
       JOIN MATIERE m ON et.Id_MATIERE = m.Id_MATIERE
       JOIN SALLE s ON et.Id_SALLE = s.Id_SALLE
       JOIN PROFESSEUR p ON et.Id_PROFESSEUR = p.Id_PROFESSEUR
       WHERE et.Id_CLASSE = ?
         AND (et.date_ IS NULL OR DATE(et.date_) >= CURRENT_DATE())
       ORDER BY FIELD(et.Jour_Semaine,'Lundi','Mardi','Mercredi','Jeudi','Vendredi','Samedi'),
                et.Heure_Debut`,
      [etudiant[0].Id_CLASSE]
    );
    res.json(rows);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// POST ajouter un créneau
router.post('/', auth, async (req, res) => {
  try {
    const { Id_PROFESSEUR, Id_SALLE, Id_MATIERE, Id_CLASSE, Jour_Semaine, Heure_Debut, Heure_Fin, Date_Debut } = req.body;

    if (!Id_PROFESSEUR || !Id_SALLE || !Id_MATIERE || !Id_CLASSE || !Jour_Semaine || !Heure_Debut || !Heure_Fin) {
      return res.status(400).json({
        error: 'Professeur, salle, matière, classe et horaires sont requis',
      });
    }

    // Vérifier conflit de salle
    const [conflitSalle] = await db.query(`
      SELECT * FROM EMPLOI_TEMPS
      WHERE Id_SALLE = ? AND Jour_Semaine = ?
      AND (DATE(date_) = DATE(?) OR (date_ IS NULL AND ? IS NULL))
      AND NOT (Heure_Fin <= ? OR Heure_Debut >= ?)
    `, [Id_SALLE, Jour_Semaine, Date_Debut || null, Date_Debut || null, Heure_Debut, Heure_Fin]);

    if (conflitSalle.length > 0) {
      return res.status(409).json({ error: 'Cette salle est déjà occupée à ce créneau !' });
    }

    // Vérifier conflit de professeur
    const [conflitProf] = await db.query(`
      SELECT * FROM EMPLOI_TEMPS
      WHERE Id_PROFESSEUR = ? AND Jour_Semaine = ?
      AND (DATE(date_) = DATE(?) OR (date_ IS NULL AND ? IS NULL))
      AND NOT (Heure_Fin <= ? OR Heure_Debut >= ?)
    `, [Id_PROFESSEUR, Jour_Semaine, Date_Debut || null, Date_Debut || null, Heure_Debut, Heure_Fin]);

    if (conflitProf.length > 0) {
      return res.status(409).json({ error: 'Ce professeur a déjà un cours à ce créneau !' });
    }

await db.query(
  `INSERT INTO EMPLOI_TEMPS
   (Id_PROFESSEUR, Id_SALLE, Id_MATIERE, Id_CLASSE, Jour_Semaine, Heure_Debut, Heure_Fin, date_)
   VALUES (?,?,?,?,?,?,?,?)`,
  [Id_PROFESSEUR, Id_SALLE, Id_MATIERE, Id_CLASSE, Jour_Semaine, Heure_Debut, Heure_Fin, Date_Debut || null]
);
    res.status(201).json({ message: 'Créneau ajouté avec succès' });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// GET historique des créneaux, filtrable par classe
router.get('/archive', auth, async (req, res) => {
  try {
    await ensureArchiveTable();
    let sql = `SELECT a.*, c.Nom_Classe, m.Nom_Matiere, p.Nom_Prenoms_Profe AS Nom_Professeur,
                      s.Nom_Salle
               FROM EMPLOI_TEMPS_ARCHIVE a
               LEFT JOIN CLASSE c ON c.Id_CLASSE = a.Id_CLASSE
               LEFT JOIN MATIERE m ON m.Id_MATIERE = a.Id_MATIERE
               LEFT JOIN PROFESSEUR p ON p.Id_PROFESSEUR = a.Id_PROFESSEUR
               LEFT JOIN SALLE s ON s.Id_SALLE = a.Id_SALLE`;
    const params = [];
    if (req.query.classe) { sql += ' WHERE a.Id_CLASSE = ?'; params.push(req.query.classe); }
    sql += ' ORDER BY a.Date_Archive DESC, a.date_ DESC, a.Heure_Debut DESC';
    const [rows] = await db.query(sql, params);
    res.json(rows);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// Modifier un créneau en archivant son ancienne version
router.put('/slot', auth, async (req, res) => {
  const connection = await db.getConnection();
  try {
    const { ancien, nouveau } = req.body;
    if (!ancien || !nouveau) return res.status(400).json({ error: 'Ancien et nouveau créneau requis' });
    await connection.beginTransaction();
    const [rows] = await connection.query(`
      SELECT * FROM EMPLOI_TEMPS
      WHERE Id_PROFESSEUR = ? AND Id_SALLE = ? AND Id_MATIERE = ? AND Id_CLASSE = ?
        AND Jour_Semaine = ? AND Heure_Debut = ?
    `, [ancien.Id_PROFESSEUR, ancien.Id_SALLE, ancien.Id_MATIERE, ancien.Id_CLASSE, ancien.Jour_Semaine, ancien.Heure_Debut]);
    if (!rows.length) { await connection.rollback(); return res.status(404).json({ error: 'Créneau introuvable' }); }
    await archiveSlot(rows[0], 'MODIFICATION', req.user.id);
    await connection.query(`
      UPDATE EMPLOI_TEMPS SET Id_PROFESSEUR=?, Id_SALLE=?, Id_MATIERE=?, Id_CLASSE=?,
        date_=?, Heure_Debut=?, Heure_Fin=?, Jour_Semaine=?
      WHERE Id_PROFESSEUR=? AND Id_SALLE=? AND Id_MATIERE=? AND Id_CLASSE=?
        AND Jour_Semaine=? AND Heure_Debut=?
    `, [nouveau.Id_PROFESSEUR, nouveau.Id_SALLE, nouveau.Id_MATIERE, nouveau.Id_CLASSE,
      nouveau.Date_Debut || null, nouveau.Heure_Debut, nouveau.Heure_Fin, nouveau.Jour_Semaine,
      ancien.Id_PROFESSEUR, ancien.Id_SALLE, ancien.Id_MATIERE, ancien.Id_CLASSE, ancien.Jour_Semaine, ancien.Heure_Debut]);
    await connection.commit();
    res.json({ message: 'Créneau modifié et ancienne version archivée' });
  } catch (err) { await connection.rollback(); res.status(500).json({ error: err.message }); }
  finally { connection.release(); }
});

// Supprimer un créneau en archivant sa dernière version
router.delete('/slot', auth, async (req, res) => {
  try {
    const slot = req.body;
    const [rows] = await db.query(`
      SELECT * FROM EMPLOI_TEMPS
      WHERE Id_PROFESSEUR=? AND Id_SALLE=? AND Id_MATIERE=? AND Id_CLASSE=?
        AND Jour_Semaine=? AND Heure_Debut=?
    `, [slot.Id_PROFESSEUR, slot.Id_SALLE, slot.Id_MATIERE, slot.Id_CLASSE, slot.Jour_Semaine, slot.Heure_Debut]);
    if (!rows.length) return res.status(404).json({ error: 'Créneau introuvable' });
    await archiveSlot(rows[0], 'SUPPRESSION', req.user.id);
    await db.query(`DELETE FROM EMPLOI_TEMPS
      WHERE Id_PROFESSEUR=? AND Id_SALLE=? AND Id_MATIERE=? AND Id_CLASSE=?
        AND Jour_Semaine=? AND Heure_Debut=?`, [slot.Id_PROFESSEUR, slot.Id_SALLE, slot.Id_MATIERE, slot.Id_CLASSE, slot.Jour_Semaine, slot.Heure_Debut]);
    res.json({ message: 'Créneau supprimé et archivé' });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// DELETE supprimer un créneau
router.delete('/', auth, async (req, res) => {
  try {
    const { Id_PROFESSEUR, Id_SALLE, Id_MATIERE, Id_CLASSE, Jour_Semaine, Heure_Debut } = req.body;
    await db.query(
      `DELETE FROM EMPLOI_TEMPS
       WHERE Id_PROFESSEUR = ? AND Id_SALLE = ? AND Id_MATIERE = ? AND Id_CLASSE = ?
       AND Jour_Semaine = ? AND Heure_Debut = ?`,
      [Id_PROFESSEUR, Id_SALLE, Id_MATIERE, Id_CLASSE, Jour_Semaine, Heure_Debut]
    );
    res.json({ message: 'Créneau supprimé avec succès' });
  } catch (err) { res.status(500).json({ error: err.message }); }
});
module.exports = router;
