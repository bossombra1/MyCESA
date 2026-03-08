// routes/chatbot.js — Chatbot automatique MyCESA
const express = require('express');
const router  = express.Router();
const db      = require('../config/db');
const auth    = require('../middleware/authMiddleware');

// Base de réponses automatiques
const reponses = [
  {
    mots: ['note', 'notes', 'résultat', 'résultats', 'moyenne'],
    reponse: 'Pour consulter tes notes, va dans la section "Mes Notes" depuis le menu principal. Tu y trouveras toutes tes évaluations et ta moyenne par matière.'
  },
  {
    mots: ['absence', 'absent', 'absences'],
    reponse: 'Le relevé de tes absences est disponible dans la section "Mes Absences". Si tu as une absence injustifiée, rapproche-toi du secrétariat avec un justificatif.'
  },
  {
    mots: ['paiement', 'scolarité', 'frais', 'payer', 'versement'],
    reponse: 'Pour vérifier l\'état de tes paiements de scolarité, consulte la section "Mes Paiements". En cas de problème, contacte le service comptabilité.'
  },
  {
    mots: ['emploi', 'temps', 'horaire', 'cours', 'programme'],
    reponse: 'Ton emploi du temps est accessible dans la section "Emploi du Temps". Il est mis à jour par l\'administration en cas de changement.'
  },
  {
    mots: ['bulletin', 'relevé', 'bilan'],
    reponse: 'Ton bulletin de notes est disponible à la fin de chaque semestre. Tu peux le consulter dans la section Notes ou le retirer au secrétariat.'
  },
  {
    mots: ['inscription', 'inscrire', 'dossier'],
    reponse: 'Pour toute demande d\'inscription ou de réinscription, rends-toi au secrétariat avec ta pièce d\'identité, tes relevés de notes précédents et les frais d\'inscription.'
  },
  {
    mots: ['contact', 'telephone', 'adresse', 'localisation'],
    reponse: 'Tu peux contacter l\'école à l\'adresse indiquée sur le site officiel. Le secrétariat est ouvert du lundi au vendredi de 8h à 17h.'
  },
  {
    mots: ['bonjour', 'salut', 'hello', 'bonsoir', 'hi'],
    reponse: 'Bonjour ! Je suis l\'assistant MyCESA 👋. Comment puis-je t\'aider aujourd\'hui ? Tu peux me poser des questions sur tes notes, absences, paiements ou ton emploi du temps.'
  },
  {
    mots: ['merci', 'thanks', 'super', 'parfait'],
    reponse: 'Avec plaisir ! N\'hésite pas si tu as d\'autres questions. Bonne journée ! 😊'
  },
];

const reponsePardDefaut = 'Je n\'ai pas compris ta question. Tu peux me demander des informations sur : tes notes 📝, tes absences 📅, tes paiements 💰 ou ton emploi du temps 🕐. Tu peux aussi contacter le secrétariat directement.';

function trouverReponse(question) {
  const q = question.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
  for (const item of reponses) {
    if (item.mots.some(mot => q.includes(mot))) {
      return item.reponse;
    }
  }
  return reponsePardDefaut;
}

// POST /api/chatbot/ask — Poser une question
router.post('/ask', auth, async (req, res) => {
  try {
    const { question, Id_ETUDIANT } = req.body;

    if (!question || question.trim() === '') {
      return res.status(400).json({ error: 'Question vide' });
    }

    const reponse = trouverReponse(question);

    // Sauvegarder dans l'historique
    if (Id_ETUDIANT) {
      await db.query(
        `INSERT INTO CHAT_BOT (Id_ETUDIANT, Id_UTILISATEUR, Question, Reponse)
         VALUES (?,?,?,?)`,
        [Id_ETUDIANT, req.user.id, question, reponse]
      );
    }

    res.json({ question, reponse });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/chatbot/historique/:idEtudiant — Historique des chats
router.get('/historique/:idEtudiant', auth, async (req, res) => {
  try {
    const [rows] = await db.query(
      `SELECT * FROM CHAT_BOT WHERE Id_ETUDIANT = ?
       ORDER BY Date_Chat DESC LIMIT 50`,
      [req.params.idEtudiant]
    );
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
