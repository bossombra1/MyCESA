# 🎓 MyCESA — Plateforme Complète de Gestion Scolaire

> *« Une excellence à votre service ! »*

![Version](https://img.shields.io/badge/version-1.0.0-green)
![Platforms](https://img.shields.io/badge/Platform-Mobile%20%7C%20Web%20Admin-blue)
![Stack](https://img.shields.io/badge/Stack-React%20Native%20%7C%20React%20%7C%20Node.js%20%7C%20MySQL-orange)
![License](https://img.shields.io/badge/License-MIT-green)

---

## 📱 À propos

**MyCESA** est une **plateforme de gestion scolaire complète** développée pour le **GROUPE COFE-CESA** (Abidjan, Côte d'Ivoire). Elle offre une solution intégrée composée de trois applications:

1. **Application Mobile** 📱 - Pour les étudiants
2. **Interface Web Admin** 🖥️ - Pour les administrateurs  
3. **Backend API** 🔧 - Cœur du système

### Objectifs
✅ Digitaliser la gestion scolaire  
✅ Offrir un suivi académique en temps réel  
✅ Améliorer la communication étudiants-établissement  
✅ Centraliser toutes les informations académiques  

---

## 📋 Table des matières

- [Architecture](#-architecture)
- [Fonctionnalités](#-fonctionnalités)
- [Installation](#-installation)
- [Démarrage rapide](#-démarrage-rapide)
- [Structure du projet](#-structure-du-projet)
- [API Documentation](#-api-documentation)
- [Stack Technique](#-stack-technique)
- [Configuration](#-configuration)
- [Support](#-support)

---

## 🏗️ Architecture

```
MyCESA (Plateforme Complète)
│
├── 📱 MOBILE (React Native + Expo)
│   ├── Écrans étudiants
│   ├── Écrans professeurs
│   └── Fonctionnalités offline
│
├── 🖥️ WEB-ADMIN (React + Vite + Tailwind)
│   ├── Dashboard
│   ├── Gestion complète des données
│   └── Interface d'administration
│
└── 🔧 BACKEND API (Node.js + Express)
    ├── Authentification JWT
    ├── Routes REST
    ├── Base de données MySQL
    └── WebSockets (Socket.io)
```

---

## ✨ Fonctionnalités

### 📱 Application Mobile

#### 👨‍🎓 Espace Étudiant
- **📊 Tableau de Bord**
  - Moyenne générale avec mention
  - Cours du jour en temps réel
  - Statistiques académiques
  - Widget d'accès rapide aux services

- **📝 Notes & Évaluations**
  - Liste complète des notes par semestre
  - Calcul automatique des moyennes
  - Historique des évaluations
  - Barres de progression visuelles
  - Filtres par semestre/matière

- **📅 Absences**
  - Suivi détaillé (justifiées/non justifiées)
  - Historique complet
  - Alertes intelligentes
  - Contact direct avec la scolarité

- **💰 Paiements & Versements**
  - Historique des versements
  - Suivi de la progression de scolarité
  - Statut de paiement en temps réel
  - Notifications de rappel

- **🕐 Emploi du Temps**
  - Vues: Jour / Semaine / Mois / Année
  - Calendrier interactif
  - Filtrage par date
  - Navigation intuitive

- **⏳ Échéances & Examens**
  - Calendrier des examens
  - Compte à rebours en temps réel
  - Filtres par type (examen, devoir, soutenance)
  - Alertes d'urgence

- **🏆 Récompenses & Classement**
  - Système de points basé sur performances
  - 6 niveaux (Novice → Élite)
  - Streak de connexion journalière
  - Leaderboard en temps réel
  - Podium Top 3

- **🤖 Assistant MyCESA (ChatBot)**
  - Réponses intelligentes sur notes, absences, paiements
  - Navigation automatique
  - Interface conversationnelle

- **🔔 Notifications**
  - Notifications push locales
  - Marquage lu/non lu
  - Catégorisation par type
  - Historique complet

- **👤 Profil Étudiant**
  - Photo de profil (uploadable)
  - Informations personnelles modifiables
  - Changement de mot de passe
  - Mode sombre/clair
  - Préférences utilisateur

- **🪪 Carte Étudiant Virtuelle**
  - Affichage avec animation flip 3D
  - Logo CESA officiel
  - Informations académiques
  - Identifiant unique

- **ℹ️ À propos**
  - Historique du groupe CESA
  - Contacts officiels
  - Liens utiles

#### 👨‍🏫 Espace Professeur
- Gestion des notes par matière
- Saisie des évaluations
- Visualisation des fiches d'étudiants
- Emploi du temps personnel
- Notes par classe

### 🖥️ Interface Web Admin

#### 🔐 Authentification
- Login sécurisé avec JWT
- Rôle-based access (Admin seulement)
- Session management
- Logout sécurisé

#### 📊 Dashboard
- 4 cartes de statistiques principales
- 2 graphiques dynamiques (Recharts)
- Données en temps réel depuis l'API
- Vue d'ensemble du système

#### 👥 Gestion Complète
- **Étudiants**
  - ✅ CRUD complet (Créer, lire, modifier, supprimer)
  - Recherche et filtrage
  - Pagination
  - Gestion des classes

- **Professeurs**
  - ✅ CRUD complet
  - Attribution des matières
  - Gestion des contacts
  - Filtre par nom/email

- **Classes**
  - ✅ CRUD complet
  - Filières et cycles
  - Effectif par classe
  - Gestion des salles

- **Matières**
  - ✅ CRUD complet
  - Code matière
  - Coefficient
  - Volume horaire

- **Emploi du Temps**
  - Grille horaire complète
  - Par classe
  - Créneau 08h-17h
  - Éditable

- **Notes**
  - Consultation des notes
  - Calcul de moyennes
  - Filtres classe/matière
  - Saisie assistée

- **Paiements**
  - Liste des versements
  - Statuts (Payé/Partiel/Impayé)
  - Historique complet
  - Badges colorés

- **Utilisateurs**
  - ✅ CRUD complet des comptes
  - Réinitialisation mot de passe
  - Gestion des rôles
  - Activation/Désactivation
  - Audit des accès

- **Notifications**
  - Envoi en masse
  - Cibles multiples (tous/étudiants/profs)
  - Historique
  - Statut de livraison

---

## 🚀 Installation

### Prérequis globaux
- **Node.js** 16+ 
- **npm** ou **yarn**
- **MySQL** 5.7+
- **Git** (optionnel)

### 1. Backend

```bash
# Naviguer au dossier backend
cd backend

# Installer les dépendances
npm install

# Créer le fichier .env
cp .env.example .env

# Configurer .env
# MYSQL_HOST=localhost
# MYSQL_USER=root
# MYSQL_PASSWORD=votre_mot_de_passe
# MYSQL_DB=mycesa
# PORT=5000
# JWT_SECRET=votre_secret_jwt

# Initialiser la base de données
mysql -u root -p < database/schema.sql

# Démarrer le serveur
npm run dev
# Ou en production: npm start
```

Le backend sera disponible sur: **http://localhost:5000**

### 2. Application Mobile

```bash
# Naviguer au dossier mobile
cd mobile

# Installer les dépendances
npm install

# Démarrer l'application
npm start

# Options:
npm run android    # Lancer sur Android
npm run ios        # Lancer sur iOS
npm run web        # Lancer sur web
```

L'application sera disponible via Expo Go.

### 3. Interface Web Admin

```bash
# Naviguer au dossier web-admin
cd web-admin

# Installer les dépendances
npm install

# Creér le fichier .env.local
cp .env.example .env.local

# Démarrer le serveur de développement
npm run dev
```

L'interface sera disponible sur: **http://localhost:5173**

### Build pour production

```bash
# Backend
cd backend
npm start

# Web Admin
cd web-admin
npm run build
npm run preview
```

---

## 🔄 Démarrage rapide

Pour démarrer le projet complet en développement:

```bash
# Terminal 1 - Backend
cd backend
npm run dev

# Terminal 2 - Web Admin
cd web-admin
npm run dev

# Terminal 3 - Mobile (optionnel)
cd mobile
npm start
```

### Identifiants de test

📂 Consultez: `comment VOIR les utilisateur et leur mot de passe.txt`

**Note:** Seuls les comptes avec `Id_ROLE = 1` (Admin) peuvent accéder à l'interface web admin.

---

## 📁 Structure du projet

```
MyCESA/
│
├── 📱 mobile/                           # Application React Native
│   ├── src/
│   │   ├── screens/                    # Tous les écrans
│   │   │   ├── prof/                   # Écrans professeurs
│   │   │   │   ├── HomeProfScreen.js
│   │   │   │   ├── SaisieNotesScreen.js
│   │   │   │   ├── SaisieNotesMatiereScreen.js
│   │   │   │   ├── MesEtudiantsScreen.js
│   │   │   │   ├── BulletinMatiereScreen.js
│   │   │   │   └── ProfilProfScreen.js
│   │   │   └── [écrans étudiants]     # 16 écrans pour étudiants
│   │   ├── components/                 # Composants réutilisables
│   │   │   ├── AppShell.js
│   │   │   ├── Header.js
│   │   │   └── LoadingSpinner.js
│   │   ├── context/                    # Gestion d'état
│   │   │   ├── AuthContext.js
│   │   │   └── ThemeContext.js
│   │   ├── navigation/
│   │   │   └── AppNavigator.js         # Routeur principal
│   │   ├── api/
│   │   │   └── api.js                  # Client Axios
│   │   └── utils/
│   │       └── notifications.js
│   ├── package.json
│   └── app.json
│
├── 🖥️ web-admin/                       # Interface Web Admin
│   ├── src/
│   │   ├── pages/                      # Pages principales
│   │   │   ├── auth/
│   │   │   │   └── LoginPage.jsx
│   │   │   ├── dashboard/
│   │   │   │   └── DashboardPage.jsx
│   │   │   ├── etudiants/
│   │   │   │   └── EtudiantsPage.jsx       ✅ CRUD
│   │   │   ├── professeurs/
│   │   │   │   └── ProfsPage.jsx           ✅ CRUD
│   │   │   ├── classes/
│   │   │   │   └── ClassesPage.jsx         ✅ CRUD
│   │   │   ├── matieres/
│   │   │   │   └── MatieresPage.jsx        ✅ CRUD
│   │   │   ├── emploiTemps/
│   │   │   │   └── EmploiTempsPage.jsx     ✅ Grille
│   │   │   ├── notes/
│   │   │   │   └── NotesPage.jsx           ✅ Consultation
│   │   │   ├── paiements/
│   │   │   │   └── PaiementsPage.jsx       ✅ Consultation
│   │   │   ├── utilisateurs/
│   │   │   │   └── UtilisateursPage.jsx    ✅ CRUD
│   │   │   └── notifications/
│   │   │       └── NotificationsPage.jsx   ✅ Envoi
│   │   ├── components/
│   │   │   ├── layout/
│   │   │   │   ├── Layout.jsx
│   │   │   │   ├── Navbar.jsx
│   │   │   │   └── Sidebar.jsx
│   │   │   ├── ui/
│   │   │   │   ├── Badge.jsx
│   │   │   │   ├── Card.jsx
│   │   │   │   ├── Modal.jsx
│   │   │   │   └── [autres composants]
│   │   │   └── charts/
│   │   │       └── Charts.jsx
│   │   ├── context/
│   │   │   └── AuthContext.jsx         # Gestion JWT
│   │   ├── api/
│   │   │   └── api.js                  # Axios avec intercepteurs
│   │   ├── App.jsx                     # Routeur principal
│   │   └── main.jsx
│   ├── .env.example
│   ├── tailwind.config.js
│   ├── package.json
│   └── README.md
│
├── 🔧 backend/                         # API REST Node.js
│   ├── routes/                         # Endpoints API
│   │   ├── auth.js                     # Authentification
│   │   ├── etudiants.js                # Gestion étudiants
│   │   ├── professeurs.js              # Gestion professeurs
│   │   ├── classes.js                  # Gestion classes
│   │   ├── matieres.js                 # Gestion matières
│   │   ├── emploiTemps.js              # Grille horaire
│   │   ├── notes.js                    # Gestion notes
│   │   ├── evaluations.js              # Évaluations
│   │   ├── absences.js                 # Suivi absences
│   │   ├── versements.js               # Paiements
│   │   ├── utilisateurs.js             # Gestion utilisateurs
│   │   ├── notifications.js            # Notifications
│   │   ├── messageerie.js              # Messagerie
│   │   ├── chatbot.js                  # Assistant IA
│   │   ├── recompenses.js              # Système points
│   │   ├── evenements.js               # Événements
│   │   ├── salles.js                   # Gestion salles
│   │   ├── upload.js                   # Upload fichiers
│   │   └── [autres routes]
│   ├── middleware/
│   │   └── authMiddleware.js           # JWT verification
│   ├── config/
│   │   └── db.js                       # Configuration MySQL
│   ├── database/
│   │   └── schema.sql                  # Schéma de base de données
│   ├── uploads/
│   │   └── photos/                     # Photos utilisateurs
│   ├── server.js                       # Point d'entrée
│   ├── .env.example
│   ├── package.json
│   └── README.md
│
├── 📊 mycesa_db.sql                    # Dump complet de la BD
├── comment VOIR les utilisateur et leur mot de passe.txt
├── package.json                        # Root package (si applicable)
└── README.md                           # Ce fichier
```

---

## 🔌 API Documentation

### Base URL
```
http://localhost:5000/api
```

### Routes principales

#### 🔐 Authentification
```
POST   /auth/login              # Connexion utilisateur
GET    /auth/profile            # Profil utilisateur
POST   /auth/logout             # Déconnexion
```

#### 👥 Gestion Utilisateurs
```
GET    /utilisateurs            # Lister tous les utilisateurs
POST   /utilisateurs            # Créer utilisateur
GET    /utilisateurs/:id        # Récupérer un utilisateur
PUT    /utilisateurs/:id        # Modifier utilisateur
DELETE /utilisateurs/:id        # Supprimer utilisateur
```

#### 👨‍🎓 Étudiants
```
GET    /etudiants               # Lister tous les étudiants
POST   /etudiants               # Créer étudiant
GET    /etudiants/:id           # Détails étudiant
PUT    /etudiants/:id           # Modifier étudiant
DELETE /etudiants/:id           # Supprimer étudiant
GET    /etudiants/:id/notes     # Notes de l'étudiant
GET    /etudiants/:id/absences  # Absences de l'étudiant
```

#### 👨‍🏫 Professeurs
```
GET    /professeurs             # Lister tous les profs
POST   /professeurs             # Créer professeur
GET    /professeurs/:id         # Détails professeur
PUT    /professeurs/:id         # Modifier professeur
DELETE /professeurs/:id         # Supprimer professeur
```

#### 📚 Matières
```
GET    /matieres                # Lister toutes les matières
POST   /matieres                # Créer matière
PUT    /matieres/:id            # Modifier matière
DELETE /matieres/:id            # Supprimer matière
```

#### 🏫 Classes
```
GET    /classes                 # Lister toutes les classes
POST   /classes                 # Créer classe
PUT    /classes/:id             # Modifier classe
DELETE /classes/:id             # Supprimer classe
```

#### 📝 Notes & Évaluations
```
GET    /notes                   # Lister tous les notes
POST   /notes                   # Créer note
GET    /notes/:id               # Détails note
PUT    /notes/:id               # Modifier note
GET    /evaluations             # Lister évaluations
POST   /evaluations             # Créer évaluation
```

#### 📅 Emploi du Temps
```
GET    /emploiTemps             # Grille horaire
GET    /emploiTemps/:classe     # Grille par classe
POST   /emploiTemps             # Créer créneau
PUT    /emploiTemps/:id         # Modifier créneau
DELETE /emploiTemps/:id         # Supprimer créneau
```

#### 📋 Absences
```
GET    /absences                # Lister absences
POST   /absences                # Enregistrer absence
GET    /absences/:etudiant      # Absences d'étudiant
```

#### 💰 Versements
```
GET    /versements              # Lister versements
POST   /versements              # Créer versement
GET    /versements/:etudiant    # Versements d'étudiant
```

#### 🔔 Notifications
```
GET    /notifications           # Récupérer notifications
POST   /notifications/send      # Envoyer notification
PUT    /notifications/:id/read  # Marquer comme lu
```

#### 🏆 Récompenses
```
GET    /recompenses             # Lister récompenses
GET    /recompenses/:etudiant   # Récompenses d'étudiant
POST   /recompenses             # Accorder récompense
```

#### 🤖 ChatBot
```
POST   /chatbot/ask             # Poser une question au ChatBot
```

#### 📤 Upload
```
POST   /upload/photo            # Uploader une photo
```

**👉 Documentation complète:** Voir [API_ROUTES.md](./web-admin/API_ROUTES.md)

---

## 🛠️ Stack Technique

### 📱 Mobile (React Native)
| Technologie | Version | Utilisation |
|-------------|---------|-------------|
| **React Native** | 0.81.5 | Framework principal |
| **Expo** | 54.0 | Plateforme de développement |
| **React Navigation** | 6.x | Navigation multi-écrans |
| **Axios** | 1.13.6 | Client HTTP |
| **Socket.io Client** | 4.8.3 | Communication temps réel |
| **Expo Notifications** | 0.32.16 | Notifications push |
| **Reanimated** | 4.1.1 | Animations fluides |

### 🖥️ Web Admin (React + Vite)
| Technologie | Version | Utilisation |
|-------------|---------|-------------|
| **React** | 19.2 | Framework UI |
| **Vite** | 8.0 | Build tool |
| **Tailwind CSS** | 4.2 | Styling |
| **React Router** | 7.13 | Navigation |
| **Axios** | 1.13.6 | Client HTTP |
| **Recharts** | 3.8 | Graphiques |
| **Headless UI** | 2.2.9 | Composants UI |
| **React Hot Toast** | 2.6 | Notifications |

### 🔧 Backend (Node.js)
| Technologie | Version | Utilisation |
|-------------|---------|-------------|
| **Node.js** | 16+ | Runtime JavaScript |
| **Express.js** | 4.22 | Framework web |
| **MySQL2** | 3.19 | Driver MySQL |
| **JWT** | 9.0.3 | Authentification |
| **bcryptjs** | 2.4.3 | Hachage mots de passe |
| **Socket.io** | 4.8.3 | WebSockets |
| **Multer** | 2.1 | Upload fichiers |
| **CORS** | 2.8.6 | Cross-Origin requests |
| **dotenv** | 16.6 | Variables d'environnement |

### 💾 Base de Données
| Composant | Version |
|-----------|---------|
| **MySQL** | 5.7+ |
| **Tables** | 15+ tables |
| **Stockage** | Unlimited |

---

## ⚙️ Configuration

### Variables d'environnement Backend

Créer un fichier `.env` dans le dossier `backend/`:

```env
# Base de données
MYSQL_HOST=localhost
MYSQL_USER=root
MYSQL_PASSWORD=votre_mot_de_passe
MYSQL_DB=mycesa

# Serveur
PORT=5000
NODE_ENV=development

# JWT
JWT_SECRET=votre_secret_super_securise

# API
API_URL=http://localhost:5000

# Fichiers
UPLOAD_DIR=./uploads
MAX_FILE_SIZE=5242880
```

### Variables d'environnement Web Admin

Créer un fichier `.env.local` dans le dossier `web-admin/`:

```env
VITE_API_URL=http://localhost:5000/api
VITE_APP_NAME=MyCESA Admin
```

### Configuration Mobile

Le fichier `mobile/app.json` contient les paramètres Expo:

```json
{
  "expo": {
    "name": "MyCESA",
    "slug": "mycesa",
    "version": "1.0.0",
    "orientation": "portrait",
    "icon": "./assets/icon.png",
    "splash": {
      "image": "./assets/splash.png"
    }
  }
}
```

---

## 🔐 Sécurité

### Authentification
- ✅ JWT (JSON Web Token)
- ✅ Hachage bcrypt pour les mots de passe
- ✅ Tokens stockés sécurisement
- ✅ Refresh tokens

### Autorisations
- ✅ Rôle-based access (RBAC)
- ✅ Middleware d'authentification
- ✅ Protection des routes sensibles
- ✅ CORS configuré

### Données
- ✅ Validation entrées côté serveur
- ✅ Sanitization des données
- ✅ SQL preventention injection
- ✅ HTTPS ready (en prod)

---

## 📊 Base de Données

### Schéma principal
- **utilisateurs** - Comptes utilisateurs (admins, profs, étudiants)
- **etudiants** - Profils étudiants
- **professeurs** - Profils professeurs
- **classes** - Classes scolaires
- **matieres** - Matières enseignées
- **notes** - Notes d'étudiants
- **evaluations** - Évaluations
- **absences** - Enregistrements d'absences
- **emploi_temps** - Grille horaire
- **versements** - Paiements étudiants
- **notifications** - Notifications système
- **recompenses** - Points et récompenses
- **evenements** - Événements scolaires
- **salles** - Salles de classe
- **messagerie** - Messages entre utilisateurs

**📂 Dump complet:** `mycesa_db.sql`

---

## 🧪 Tests

### Backend
```bash
# Tests unitaires (si configurés)
cd backend
npm test

# Lint
npm run lint
```

### Web Admin
```bash
# Lint
cd web-admin
npm run lint

# Build test
npm run build
```

---

## 📚 Documentation supplémentaire

- [API Routes](./web-admin/API_ROUTES.md) - Documentation complète des endpoints
- [Web Admin Setup](./web-admin/SETUP.md) - Guide de configuration web admin
- [Project Summary](./web-admin/PROJECT_SUMMARY.md) - Résumé techniques
- [Identifiants de test](./comment%20VOIR%20les%20utilisateur%20et%20leur%20mot%20de%20passe.txt)

---

## 🤝 Contribution

Les contributions sont les bienvenues ! Pour contribuer:

1. Fork le projet
2. Créer une branche feature (`git checkout -b feature/AmazingFeature`)
3. Commit vos changements (`git commit -m 'Add some AmazingFeature'`)
4. Push vers la branche (`git push origin feature/AmazingFeature`)
5. Ouvrir une Pull Request

---

## 🐛 Signaler des bugs

Avez-vous trouvé un bug? Svp créer une issue en détaillant:
- Description du bug
- Étapes pour reproduire
- Comportement actuel vs attendu
- Captures d'écran (si applicable)

---

## 📝 Logs des changements

### Version 1.0.0 (Actuelle)
✅ Application mobile complète (étudiants + profs)
✅ Interface web admin complète
✅ API REST avec 18+ endpoints
✅ Authentification JWT
✅ Système de récompenses
✅ ChatBot assistant
✅ Notifications en temps réel
✅ Base de données MySQL
✅ Socket.io pour communication temps réel

---

## 📞 Support

### Besoin d'aide?

- 📧 **Email**: admin@mycesa.com
- 📱 **Téléphone**: Consultez `comment VOIR les utilisateur et leur mot de passe.txt`
- 💬 **Chat**: Via l'application mobile

### Ressources
- 📖 [Documentation complète](./web-admin/SETUP.md)
- 🚀 [Guide de démarrage rapide](#-démarrage-rapide)
- 🔌 [Documentation API](./web-admin/API_ROUTES.md)

---

## 📄 License

Copyright © 2024 MyCESA. Tous droits réservés.

---

## 👥 Équipe

Développé avec ❤️ pour le **GROUPE COFE-CESA**

**Adresse**: Abidjan, Côte d'Ivoire  
**Slogan**: *« Une excellence à votre service ! »*

---

## 🙏 Remerciements

Merci à tous les contributeurs et utilisateurs de MyCESA!

---

**Dernière mise à jour**: Mars 2026  
**Version**: 1.0.0  
**Status**: ✅ Production Ready
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
