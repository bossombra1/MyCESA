# 🚀 Guide de Configuration - MyCESA Web Admin

## ✅ Installation et démarrage

### 1️⃣ Prérequis
- Node.js 16+ installé
- Backend MyCESA fonctionnel sur `http://localhost:5000`

### 2️⃣ Démarrer le projet

```bash
# Naviguer au dossier web-admin
cd web-admin

# Le projet est PRÊT, les dépendances sont déjà installées!
npm run dev
```

L'application sera disponible sur: **http://localhost:5173**

### 3️⃣ Identifiants de test

Consultez le fichier:
```
../comment VOIR les utilisateur et leur mot de passe.txt
```

*Seuls les comptes avec Id_ROLE = 1 (Admin) peuvent accéder à l'interface web admin.*

---

## 🏗️ Structure du projet

```
web-admin/
├── src/
│   ├── pages/                      # Pages principales
│   │   ├── auth/LoginPage.jsx                ✅
│   │   ├── dashboard/DashboardPage.jsx       ✅
│   │   ├── etudiants/EtudiantsPage.jsx       ✅ (CRUD complet)
│   │   ├── professeurs/ProfsPage.jsx         ✅ (CRUD complet)
│   │   ├── classes/ClassesPage.jsx           ✅ (CRUD complet)
│   │   ├── matieres/MatieresPage.jsx         ✅ (CRUD complet)
│   │   ├── emploiTemps/EmploiTempsPage.jsx   ✅ (Affichage grille)
│   │   ├── notes/NotesPage.jsx               ✅ (Lecture)
│   │   ├── paiements/PaiementsPage.jsx       ✅ (Lecture)
│   │   ├── utilisateurs/UtilisateursPage.jsx ✅ (CRUD complet)
│   │   ├── notifications/NotificationsPage.jsx ✅ (Envoi)
│   │   └── PlaceholderPage.jsx
│   │
│   ├── components/
│   │   ├── layout/
│   │   │   ├── Layout.jsx                    ✅
│   │   │   ├── Sidebar.jsx                   ✅ (Menu avec toggle)
│   │   │   └── Navbar.jsx                    ✅ (Barre supérieure)
│   │   │
│   │   ├── ui/
│   │   │   ├── Table.jsx                     ✅ (Tableau réutilisable)
│   │   │   ├── Modal.jsx                     ✅ (Modal de formulaire)
│   │   │   ├── Card.jsx                      ✅ (Cartes stats)
│   │   │   ├── Badge.jsx                     ✅ (Badges statuts)
│   │   │   ├── SearchBar.jsx                 ✅ (Recherche avec debounce)
│   │   │   └── Pagination.jsx                ✅ (Pagination)
│   │   │
│   │   ├── charts/
│   │   │   └── Charts.jsx                    ✅ (Graphiques Recharts)
│   │   │
│   │   └── ProtectedRoute.jsx                ✅ (Protection des routes)
│   │
│   ├── context/
│   │   └── AuthContext.jsx                   ✅ (Gestion auth)
│   │
│   ├── api/
│   │   └── api.js                            ✅ (Axios + intercepteurs JWT)
│   │
│   └── App.jsx                               ✅ (Routeur principal)
│
├── tailwind.config.js                         ✅ (Tailwind CSS)
├── postcss.config.js                          ✅ (PostCSS)
├── .env.example                               ✅ (Variables d'env)
├── vite.config.js
└── package.json
```

---

## 🎯 Fonctionnalités implémentées

### ✅ Authentification
- Login avec identifiant + mot de passe
- Validation du rôle (Admin uniquement)
- JWT token stocké en localStorage
- Auto-redirection si token expiré
- Déconnexion

### ✅ Pages fonctionnelles

#### Dashboard
- Cartes de statistiques (Étudiants, Profs, Classes, Paiements)
- Graphiques avec Recharts
- Données en temps réel depuis l'API

#### Gestion Étudiants
- 📊 Liste paginée avec recherche
- ➕ Ajouter étudiant via formulaire modal
- ✏️ Modifier étudiant
- 🗑️ Supprimer (avec confirmation)
- 🔍 Recherche par nom/matricule

#### Gestion Professeurs
- 📊 Liste avec recherche
- ➕ Ajouter professeur
- ✏️ Modifier
- 🗑️ Supprimer
- 📧 Champs: nom, prénom, email, matière, téléphone

#### Gestion Classes
- 📊 Liste des classes
- ➕ Ajouter classe
- ✏️ Modifier
- 🗑️ Supprimer
- 📋 Champs: nom, filière, cycle, effectif

#### Gestion Matières
- 📊 Liste des matières
- ➕ Ajouter matière
- ✏️ Modifier
- 🗑️ Supprimer
- 📖 Champs: code, nom, coefficient, volume horaire

#### Gestion Notes
- 📊 Affichage lecture uniquement
- 🔍 Filtres par matricule/matière
- 📈 Calcul moyenne

#### Gestion Paiements
- 📊 Liste des versements
- 💳 Montant, date, statut
- 🔴 Badge statut (Payé/Partiel/Impayé)

#### Gestion Utilisateurs
- 👥 CRUD complet des comptes
- 🔑 Réinitialiser mot de passe
- 👮 Gestion des rôles (Admin/Prof/Étudiant)
- ✅ Activation/Désactivation

#### Gestion Emploi du Temps
- 📅 Grille horaire par classe
- 🔄 Sélection classe dropdown
- 📍 Affichage matière/prof/salle
- ⏰ Créneau 08h-17h

#### Envoi Notifications
- 📬 Module d'envoi de notifications
- 🎯 Cible (tous / étudiants / profs)
- 📝 Titre + message
- ⚡ Envoi immédiat

---

## 🔧 Configuration API

### .env
```
VITE_API_URL=http://localhost:5000/api
```

### Intercepteurs Axios
- ✅ Ajout automatique du token JWT
- ✅ Gestion des erreurs 401 (redirection login)
- ✅ Header `Authorization: Bearer <token>`

---

## 🎨 UI/UX

### Design
- **Palette couleur**: Bleu/Vert/Rouge/Amber
- **Framework**: Tailwind CSS v3
- **Composants**: Headless UI (accessible)
- **Icons**: Emojis + texte

### Responsive
- ✅ Desktop (1920px+)
- ✅ Tablet (1024px)
- ✅ Mobile (adaptable)
- ✅ Sidebar collapsible

---

## 📦 Packages utilisés

| Package | Version | Utilisation |
|---------|---------|-------------|
| React | ^19.2.4 | Framework UI |
| React Router | Latest | Navigation |
| Axios | Latest | HTTP Client |
| Tailwind CSS | ^3 | Styling |
| Recharts | Latest | Graphiques |
| React Hot Toast | Latest | Notifications |
| Headless UI | Latest | Composants |

---

## 🚀 Build et production

```bash
# Build pour production
npm run build

# Preview build local
npm run preview
```

Le build se trouve dans le dossier `dist/`

---

## 🐛 Dépannage

### Erreur: "Cannot GET /api/etudiants"
→ Vérifiez que le backend fonctionne sur port 5000

### Erreur: "CORS error"
→ Vérifiez que le backend a les headers CORS activés

### Erreur: "Token invalid/expired"
→ Reconnectez-vous via la page de login

### Port 5173 déjà utilisé
```bash
npm run dev -- --port 5174
```

---

## 📚 Prochaines fonctionnalités à ajouter

- [ ] Drag & drop emploi du temps
- [ ] Export PDF des bulletins
- [ ] Export Excel des listes
- [ ] Graphiques plus avancés
- [ ] Gestion des absences
- [ ] Système de récompenses
- [ ] Chat intégré
- [ ] Logs d'activité admin

---

## 💬 Notes

✅ Le backend expose tous les endpoints nécessaires
✅ Les pages manquantes peuvent être implémentées facilement
✅ La structure est extensible et modulaire
✅ Les composants UI sont réutilisables
✅ Prêt pour déploiement en production

Bon développement! 🎉
