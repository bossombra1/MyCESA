# 🖥️ MyCESA - Interface d'Administration Web

Interface web moderne et complète pour l'administration du système de gestion d'établissement scolaire **MyCESA**. Cette application permet aux administrateurs de gérer facilement tous les aspects de l'établissement : étudiants, professeurs, classes, notes, paiements, emplois du temps, et bien plus.

## 🚀 Démarrage rapide

### Prérequis
- **Node.js** 16+ 
- **npm** ou **yarn**
- **Backend MyCESA** en cours d'exécution sur `http://localhost:5000`

### Installation

```bash
# 1. Installer les dépendances
npm install

# 2. Copier le fichier d'environnement
cp .env.example .env.local

# 3. Vérifier l'URL API dans .env.local
# VITE_API_URL=http://localhost:5000/api

# 4. Démarrer le serveur de développement
npm run dev
```

L'application sera disponible sur **`http://localhost:5173`** 🎉

### Build pour production

```bash
# Compiler l'application
npm run build

# Tester le build localement
npm run preview
```

## 
 Structure du projet

```
web-admin/
├── src/
│   ├── pages/                      # Pages de l'application
│   │   ├── auth/                   # Authentification
│   │   │   └── LoginPage.jsx       # Page de connexion admin
│   │   │
│   │   ├── dashboard/              # Tableau de bord
│   │   │   └── DashboardPage.jsx   # Vue d'ensemble avec statistiques
│   │   │
│   │   ├── etudiants/              # Gestion des étudiants
│   │   │   └── EtudiantsPage.jsx   # CRUD complet (✅ Implémenté)
│   │   │
│   │   ├── professeurs/            # Gestion des professeurs
│   │   │   └── ProfsPage.jsx       # CRUD complet (✅ Implémenté)
│   │   │
│   │   ├── classes/                # Gestion des classes
│   │   │   └── ClassesPage.jsx     # CRUD complet (✅ Implémenté)
│   │   │
│   │   ├── matieres/               # Gestion des matières
│   │   │   └── MatieresPage.jsx    # CRUD complet (✅ Implémenté)
│   │   │
│   │   ├── emploiTemps/            # Emplois du temps
│   │   │   └── EmploiTempsPage.jsx # Gestion calendaire (⏳ En développement)
│   │   │
│   │   ├── notes/                  # Gestion des notes
│   │   │   └── NotesPage.jsx       # Visualisation et saisie (⏳ En développement)
│   │   │
│   │   ├── paiements/              # Gestion des paiements
│   │   │   └── PaiementsPage.jsx   # Suivi des versements (⏳ En développement)
│   │   │
│   │   ├── utilisateurs/           # Gestion des utilisateurs
│   │   │   └── UtilisateursPage.jsx # Gestion des comptes (⏳ En développement)
│   │   │
│   │   └── notifications/          # Gestion des notifications
│   │       └── NotificationsPage.jsx # Notifications système (⏳ En développement)
│   │
│   ├── components/                 # Composants réutilisables
│   │   ├── layout/
│   │   │   ├── Layout.jsx          # Layout principal avec sidebar
│   │   │   ├── Navbar.jsx          # Barre de navigation
│   │   │   └── Sidebar.jsx         # Menu latéral de navigation
│   │   │
│   │   ├── ui/                     # Composants UI génériques
│   │   │   ├── Table.jsx           # Tableau de données
│   │   │   ├── SearchBar.jsx       # Barre de recherche
│   │   │   ├── Pagination.jsx      # Pagination
│   │   │   ├── Modal.jsx           # Fenêtres modales
│   │   │   ├── Button.jsx          # Boutons stylisés
│   │   │   ├── Input.jsx           # Champs de formulaire
│   │   │   ├── Card.jsx            # Cartes de contenu
│   │   │   └── LoadingSpinner.jsx  # Indicateur de chargement
│   │   │
│   │   ├── charts/                 # Composants graphiques
│   │   │   └── Charts.jsx          # Graphiques estadistiques (Recharts)
│   │   │
│   │   └── ProtectedRoute.jsx      # Wrapper pour routes protégées
│   │
│   ├── context/                    # Contextes React
│   │   └── AuthContext.jsx         # Gestion de l'authentification
│   │
│   ├── api/                        # Configuration API
│   │   └── api.js                  # Instance Axios avec intercepteurs
│   │
│   ├── App.jsx                     # Composant racine et routeur
│   ├── main.jsx                    # Point d'entrée React
│   ├── index.css                   # Styles globaux
│   └── App.css                     # Styles de l'app
│
├── public/                         # Ressources publiques statiques
├── .env.example                    # Exemple de variables d'environnement
├── vite.config.js                  # Configuration Vite
├── tailwind.config.js              # Configuration Tailwind CSS
├── postcss.config.js               # Configuration PostCSS
├── eslint.config.js                # Configuration ESLint
├── package.json                    # Dépendances du projet
└── index.html                      # Point d'entrée HTML
```

## 🔐 Authentification

L'application utilise **JWT (JSON Web Token)** pour sécuriser l'accès aux données.

### Fonctionnement
- Les identifiants sont envoyés à l'endpoint `/auth/login`
- Un token JWT est retourné et stocké dans `localStorage`
- Le token est automatiquement inclus dans les headers de chaque requête API
- L'expiration du token redirige automatiquement vers la page de connexion

### Accès administrateur
- L'accès est réservé aux utilisateurs avec **`Id_ROLE = 1`** (Administrateur)
- Les identifiants par défaut se trouvent dans : **`../comment VOIR les utilisateur et leur mot de passe.txt`**

### Fonction de déconnexion
- Supprime le token stocké
- Redirige vers la page de connexion
- Tous les appels API suivants demandent une nouvelle authentification

## 🎨 Design & Styling

L'application utilise **Tailwind CSS v4** pour un design moderne et responsive.

### Palette de couleurs
```
• Primaire (Bleu)     : #3B82F6
• Secondaire (Vert)   : #10B981
• Danger (Rouge)      : #EF4444
• Warning (Amber)     : #F59E0B
• Neutre (Gris)       : #6B7280
• Foncé               : #1F2937
• Clair               : #F9FAFB
```

### Responsive Design
- Adapté pour desktop, tablettes et mobiles
- Navigation mobile avec menu collapser
- Tableaux scrollables sur petit écran

## 📦 Dépendances principales

| Package | Version | Utilisation |
|---------|---------|-------------|
| **React** | ^19.2.4 | Framework UI |
| **React Router DOM** | ^7.13.1 | Navigation client |
| **Axios** | ^1.13.6 | Requêtes HTTP |
| **Recharts** | ^3.8.0 | Graphiques & statistiques |
| **Tailwind CSS** | ^4.2.1 | Styling CSS |
| **Headless UI** | ^2.2.9 | Composants accessibles |
| **React Hot Toast** | ^2.6.0 | Notifications toast |
| **Vite** | ^8.0.0 | Bundler & dev server |

> Pour des détails complets, consultez [package.json](package.json)

## 🛠️ Configuration API

### Variables d'environnement

```env
# .env.local
VITE_API_URL=http://localhost:5000/api
```

L'URL peut être modifiée selon votre environnement :
- **Développement** : `http://localhost:5000/api`
- **Staging** : `https://staging-api.mycesa.com/api`
- **Production** : `https://api.mycesa.com/api`

### Configuration Axios

Le fichier `src/api/api.js` configure Axios avec :
- ✅ Interception des requêtes (ajout du token)
- ✅ Interception des réponses (gestion des erreurs)
- ✅ Retry automatique en cas d'échec
- ✅ Gestion des tokens expirés

## 📋 Pages implémentées

### ✅ Complètement implémentées
| Page | URL | Description |
|------|-----|-------------|
| **Login** | `/login` | Authentification admin, formulaire sécurisé |
| **Dashboard** | `/` | Tableau de bord avec statistiques en temps réel |
| **Étudiants** | `/etudiants` | CRUD complet, recherche, filtres, pagination |
| **Professeurs** | `/profs` | CRUD complet, gestion des matières |
| **Classes** | `/classes` | CRUD complet, assignation étudiants |
| **Matières** | `/matieres` | CRUD complet, liées aux professeurs |

### ⏳ En développement
| Page | URL | Description |
|------|-----|-------------|
| **Emploi du temps** | `/emploi` | Calendrier interactif des cours |
| **Notes** | `/notes` | Saisie et validation des notes |
| **Paiements** | `/paiements` | Suivi des versements étudiants |
| **Utilisateurs** | `/utilisateurs` | Gestion des comptes système |
| **Notifications** | `/notifications` | Centre de notifications |

## 🔌 Routes API utilisées

Consultez le fichier [API_ROUTES.md](API_ROUTES.md) pour la documentation complète des endpoints.

### Principaux endpoints

```
POST   /auth/login               # Authentification
GET    /auth/verify              # Vérifier token

GET    /etudiants                # Lister tous les étudiants
POST   /etudiants                # Créer un étudiant
PUT    /etudiants/:id            # Modifier un étudiant
DELETE /etudiants/:id            # Supprimer un étudiant

GET    /professeurs              # Lister tous les professeurs
POST   /professeurs              # Créer un professeur
PUT    /professeurs/:id          # Modifier un professeur
DELETE /professeurs/:id          # Supprimer un professeur

GET    /classes                  # Lister toutes les classes
POST   /classes                  # Créer une classe
PUT    /classes/:id              # Modifier une classe
DELETE /classes/:id              # Supprimer une classe

GET    /matieres                 # Lister toutes les matières
POST   /matieres                 # Créer une matière
PUT    /matieres/:id             # Modifier une matière
DELETE /matieres/:id             # Supprimer une matière
```

> Pour les autres endpoints (emploi du temps, notes, paiements, etc.), consultez [API_ROUTES.md](API_ROUTES.md)

## 🚨 Dépannage

### ❌ Erreur: "Cannot reach API"
**Solution:**
- Vérifiez que le backend est en cours d'exécution sur le port 5000
- Vérifiez la variable `VITE_API_URL` dans `.env.local`
- Testez la connexion : `curl http://localhost:5000/api/auth/login`

### ❌ Erreur: "CORS error"
**Solution:**
- Vérifiez que CORS est activé dans le backend
- Vérifiez que `http://localhost:5173` est autorisé dans la config CORS du backend

### ❌ Erreur: "401 Unauthorized"
**Solution:**
- Le token JWT a peut-être expiré → reconnectez-vous
- Vérifiez que vous avez un rôle administrateur (`Id_ROLE = 1`)
- Videz le localStorage : `localStorage.clear()`

### ❌ Erreur: "Blank white page"
**Solution:**
- Ouvrez la console de navigateur (F12) et vérifiez les erreurs
- Vérifiez que Node.js et npm sont à jour
- Supprimez `node_modules` et `package-lock.json`, puis relancez `npm install`

### ⚠️ Page se recharge après login
**Solution:**
- Vérifiez que le token est bien stocké dans localStorage
- Vérifiez que le contexte `AuthContext` fournit correctement l'utilisateur

### ⚠️ Données ne se chargent pas
**Solution:**
- Vérifiez dans DevTools → Network que les requêtes API sont envoyées
- Vérifiez les logs du backend pour les erreurs
- Assurez-vous que la base de données backend est accessible

## 📚 Stack technique

```
Frontend Architecture
├── État global      → React Context (Auth)
├── Requêtes HTTP    → Axios + Intercepteurs
├── Routage          → React Router v7
├── UI Components    → React + Tailwind CSS
├── Graphiques       → Recharts
└── Notifications    → React Hot Toast
```

## 🔄 Flux de développement

```bash
# Démarrer le développement
npm run dev

# Vérifier les erreurs ESLint
npm run lint

# Builder pour production
npm run build

# Prévisualiser la build production
npm run preview
```

## 📞 Support & Ressources

### Documentation
- 📖 [Structure API complète](API_ROUTES.md)
- 📖 [Résumé du projet](PROJECT_SUMMARY.md)
- 📖 [Setup détaillé](SETUP.md)
- 📖 [Présentation](PRESENTATION_COLLEGUES.md)

### Repos connexes
- 🔙 **Backend** : `../backend/` (Node.js Express + MySQL)
- 📱 **Mobile** : `../mobile/` (React Native Expo)
- 🗄️ **Base de données** : `../mycesa_db.sql`

### Contacts
Pour des questions ou problèmes :
- Vérifiez d'abord la console du navigateur (F12)
- Consultez les logs du backend sur le port 5000
- Vérifiez la connexion Internet et la base de données

---

**MyCESA v1.0** | Interface Web Admin | 2024-2026
