// routes/emploiTemps.js — Emploi du temps
const express = require('express');
const router  = express.Router();
const db      = require('../config/db');
const auth    = require('../middleware/authMiddleware');

// GET emploi du temps d'une classe
router.get('/classe/:id', auth, async (req, res) => {
  try {
    const [rows] = await db.query(
      `SELECT et.*, m.Nom_Matiere, s.Nom_Salle, s.Localisation_Salle,
              p.Nom_Prenoms_Profe AS Nom_Professeur
       FROM EMPLOI_TEMPS et
       JOIN MATIERE m ON et.Id_MATIERE = m.Id_MATIERE
       JOIN SALLE s   ON et.Id_SALLE   = s.Id_SALLE
       JOIN PROFESSEUR p ON et.Id_PROFESSEUR = p.Id_PROFESSEUR
       WHERE et.Id_CLASSE = ?
       ORDER BY FIELD(et.Jour_Semaine,'Lundi','Mardi','Mercredi','Jeudi','Vendredi','Samedi'),
                et.Heure_Debut`,
      [req.params.id]
    );
    res.json(rows);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// GET emploi du temps d'un professeur
router.get('/professeur/:id', auth, async (req, res) => {
  try {
    const [rows] = await db.query(
      `SELECT et.*, m.Nom_Matiere, s.Nom_Salle, c.Nom_Classe
       FROM EMPLOI_TEMPS et
       JOIN MATIERE m ON et.Id_MATIERE = m.Id_MATIERE
       JOIN SALLE s   ON et.Id_SALLE   = s.Id_SALLE
       JOIN CLASSE c  ON et.Id_CLASSE  = c.Id_CLASSE
       WHERE et.Id_PROFESSEUR = ?
       ORDER BY FIELD(et.Jour_Semaine,'Lundi','Mardi','Mercredi','Jeudi','Vendredi','Samedi'),
                et.Heure_Debut`,
      [req.params.id]
    );
    res.json(rows);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// POST ajouter un créneau
router.post('/', auth, async (req, res) => {
  try {
    const {
      Id_PROFESSEUR, Id_SALLE, Id_MATIERE, Id_CLASSE,
      Jour_Semaine, Heure_Debut, Heure_Fin, date_
    } = req.body;

    await db.query(
      `INSERT INTO EMPLOI_TEMPS
       (Id_PROFESSEUR, Id_SALLE, Id_MATIERE, Id_CLASSE, Jour_Semaine, Heure_Debut, Heure_Fin, date_)
       VALUES (?,?,?,?,?,?,?,?)`,
      [Id_PROFESSEUR, Id_SALLE, Id_MATIERE, Id_CLASSE, Jour_Semaine, Heure_Debut, Heure_Fin, date_]
    );
    res.status(201).json({ message: 'Créneau ajouté avec succès' });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// DELETE supprimer un créneau
router.delete('/', auth, async (req, res) => {
  try {
    const { Id_PROFESSEUR, Id_SALLE, Id_MATIERE, Id_CLASSE } = req.body;
    await db.query(
      'DELETE FROM EMPLOI_TEMPS WHERE Id_PROFESSEUR=? AND Id_SALLE=? AND Id_MATIERE=? AND Id_CLASSE=?',
      [Id_PROFESSEUR, Id_SALLE, Id_MATIERE, Id_CLASSE]
    );
    res.json({ message: 'Créneau supprimé' });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

module.exports = router;
