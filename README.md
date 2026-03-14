# 🎓 MyCESA — Application Mobile GROUPE COFE-CESA

> *« Une excellence à votre service ! »*

![Version](https://img.shields.io/badge/version-1.0.0-green)
![Platform](https://img.shields.io/badge/platform-Android%20%7C%20iOS-blue)
![Stack](https://img.shields.io/badge/stack-React%20Native%20%7C%20Node.js%20%7C%20MySQL-orange)

---

## 📱 Présentation

**MyCESA** est une application mobile de gestion scolaire développée pour les étudiants du **GROUPE COFE-CESA** (Abidjan, Côte d'Ivoire). Elle permet aux étudiants de suivre en temps réel leurs notes, absences, paiements, emploi du temps et bien plus encore.

---

## ✨ Fonctionnalités

### 📊 Tableau de Bord
- Moyenne générale + mention
- Cours du jour en temps réel
- Statistiques (évaluations, absences, paiements)
- Menu latéral avec accès rapide

### 📝 Notes & Évaluations
- Liste complète des notes par semestre
- Barre de progression par note
- Filtres par semestre
- Moyenne générale calculée automatiquement

### 📅 Absences
- Suivi des absences justifiées/non justifiées
- Alertes intelligentes
- Contact scolarité intégré

### 💰 Paiements
- Historique des versements
- Barre de progression de la scolarité
- Statut en temps réel

### 🕐 Emploi du Temps
- Vue Jour / Semaine / Mois / Année
- Calendrier interactif
- Filtrage par date réelle
- Navigation semaine par semaine

### ⏳ Échéances & Examens
- Compte à rebours en temps réel
- Calendrier des examens
- Filtres par type (examen, devoir, soutenance...)
- Alertes d'urgence

### 🏆 Récompenses & Points
- Système de points basé sur les performances
- 6 niveaux (Novice → Élite)
- Streak de connexion journalière
- Historique des points gagnés

### 🏅 Classement
- Leaderboard des étudiants
- Podium Top 3
- Classement par points

### 🤖 Assistant MyCESA (ChatBot)
- Questions sur les notes, absences, paiements
- Navigation automatique vers les sections
- Interface conversationnelle

### 🔔 Notifications
- Notifications locales
- Marquage lu/non lu
- Catégorisation par type

### 👤 Profil Étudiant
- Photo de profil (upload)
- Modification informations personnelles
- Changement de mot de passe
- Mode sombre / clair

### 🪪 Carte Scolaire Virtuelle
- Carte étudiant avec animation flip 3D
- Logo CESA officiel
- Informations académiques complètes

### ℹ️ À propos de CESA
- Historique du groupe
- Contacts officiels
- Lien vers le site web

---

## 🛠️ Stack Technique

### Mobile
| Technologie | Version |
|-------------|---------|
| React Native | SDK 54 |
| Expo Go | Latest |
| React Navigation | v6 |
| Axios | Latest |
| AsyncStorage | Latest |
| expo-image-picker | Latest |
| expo-linear-gradient | Latest |

### Backend
| Technologie | Version |
|-------------|---------|
| Node.js | v24 |
| Express.js | Latest |
| MySQL | v8 (WampServer) |
| JWT | Latest |
| Socket.io | Latest |
| Multer | Latest |
| Bcrypt | Latest |

---

🔮 Prochaines Étapes

- [ ] Interface Web Admin React (gestion notes, absences, emploi du temps, événements)
- [ ] Système de rôles prof dans l'appli mobile (pages dédiées prof)
- [ ] Saisie des notes par les professeurs
- [ ] Notifications push distantes (APK EAS Build)
- [ ] Génération APK final (EAS Build)

---
## 🗄️ Structure du Projet
```
MyCESA/
├── backend/
│   ├── config/
│   │   └── db.js
│   ├── middleware/
│   │   └── authMiddleware.js
│   ├── routes/
│   │   ├── auth.js
│   │   ├── etudiants.js
│   │   ├── classes.js
│   │   ├── evaluations.js
│   │   ├── absences.js
│   │   ├── versements.js
│   │   ├── emploiTemps.js
│   │   ├── notifications.js
│   │   ├── chatbot.js
│   │   ├── recompenses.js
│   │   ├── evenements.js
│   │   └── upload.js
│   ├── uploads/
│   │   └── photos/
│   └── server.js
│
└── mobile/
    ├── assets/
    │   └── logo cesa.jpg
    ├── src/
    │   ├── api/
    │   │   └── api.js
    │   ├── context/
    │   │   ├── AuthContext.js
    │   │   └── ThemeContext.js
    │   ├── navigation/
    │   │   └── AppNavigator.js
    │   ├── screens/
    │   │   ├── SplashAnimScreen.js
    │   │   ├── LoginScreen.js
    │   │   ├── HomeScreen.js
    │   │   ├── NotesScreen.js
    │   │   ├── AbsencesScreen.js
    │   │   ├── PaiementsScreen.js
    │   │   ├── EmploiTempsScreen.js
    │   │   ├── ChatBotScreen.js
    │   │   ├── NotificationsScreen.js
    │   │   ├── ProfilScreen.js
    │   │   ├── CarteEtudiantScreen.js
    │   │   ├── RecompensesScreen.js
    │   │   ├── LeaderboardScreen.js
    │   │   ├── EvenementsScreen.js
    │   │   └── AProposScreen.js
    │   └── utils/
    │       └── notifications.js
    └── App.js
```

---

## 🚀 Installation & Lancement

### Prérequis
- Node.js v18+
- WampServer (MySQL)
- Expo Go sur Android/iOS
- npm

### Backend
```bash
cd backend
npm install
npm run dev
```

### Mobile
```bash
cd mobile
npm install
$env:REACT_NATIVE_PACKAGER_HOSTNAME="192.168.137.1"
npx expo start -c --lan
```

### Variables d'environnement Backend (`.env`)
```env
PORT=3000
JWT_SECRET=votre_secret_jwt
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=
DB_NAME=mycesa
```

### Configuration API Mobile (`src/api/api.js`)
```javascript
export const SERVER_URL = 'http://192.168.137.1:3000';
const BASE_URL = `${SERVER_URL}/api`;
```

---

## 🗃️ Base de Données

### Tables principales
| Table | Description |
|-------|-------------|
| UTILISATEUR | Comptes utilisateurs |
| ETUDIANT | Informations étudiants |
| CLASSE | Classes |
| FILIERE | Filières |
| MATIERE | Matières |
| PROFESSEUR | Professeurs |
| SALLE | Salles de cours |
| EMPLOI_TEMPS | Emploi du temps |
| EVALUATION | Notes et évaluations |
| ABSENCE | Absences |
| VERSEMENT | Paiements |
| NOTIFICATION | Notifications |
| PUSH_TOKENS | Tokens push |
| POINTS_ETUDIANT | Système de points |
| HISTORIQUE_POINTS | Historique des points |
| EVENEMENT_ECOLE | Examens et événements |

---

## 🎨 Charte Graphique

| Couleur | Code | Usage |
|---------|------|-------|
| Vert CESA | `#2E7D32` | Couleur principale |
| Vert clair | `#388E3C` | Accents |
| Orange CESA | `#D84315` | Accents secondaires |

---

## 👥 Comptes de test

| Rôle | Email | Mot de passe |
|------|-------|--------------|
| Étudiant | adama.kone | 123456789 |

---

## 📍 GROUPE COFE-CESA

- 📍 Koumassi Nord-Est, Terminus Bus 05, Abidjan
- 📞 (+225) 27 21 56 31 74
- 📞 (+225) 07 07 67 84 97
- 🌐 [cesa-elearning.com](https://cesa-elearning.com/cesa/)
- 🏛️ Fondé en 1992

---

## ✅ Fonctionnalités Complétées

- [x] Splash Screen animé
- [x] Mode sombre global
- [x] Notifications locales
- [x] Système de points et récompenses
- [x] Leaderboard classement étudiants
- [x] Compte à rebours examens et échéances
- [x] Emploi du temps par date réelle (Jour/Semaine/Mois/Année)
- [x] Messagerie étudiant↔prof (temps réel, auto-refresh)

## 👨‍💻 Développeur

Développé par **regis** — GROUPE COFE-CESA © 2026
