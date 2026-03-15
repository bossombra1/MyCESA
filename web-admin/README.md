# 🖥️ MyCESA - Interface Web Admin

Interface d'administration pour le système de gestion d'établissement scolaire MyCESA.

## 🚀 Démarrage rapide

### Prérequis
- Node.js 16+ 
- npm ou yarn
- Backend MyCESA en cours d'exécution sur `http://localhost:5000`

### Installation

```bash
# Installer les dépendances
npm install

# Créer le fichier .env local
cp .env.example .env.local

# Démarrer le serveur de développement
npm run dev
```

L'application sera disponible sur `http://localhost:5173`

### Build pour production

```bash
npm run build
npm run preview
```

## 📋 Structure du projet

```
web-admin/
├── src/
│   ├── pages/              # Pages principales
│   │   ├── auth/           # Pages authentification
│   │   ├── dashboard/      # Tableau de bord
│   │   ├── etudiants/      # Gestion étudiants
│   │   ├── professeurs/    # Gestion professeurs
│   │   ├── classes/        # Gestion classes
│   │   ├── matieres/       # Gestion matières
│   │   ├── emploiTemps/    # Emploi du temps
│   │   ├── notes/          # Gestion notes
│   │   ├── paiements/      # Gestion paiements
│   │   ├── utilisateurs/   # Gestion utilisateurs
│   │   └── notifications/  # Notifications
│   │
│   ├── components/         # Composants réutilisables
│   │   ├── layout/         # Layout principal
│   │   ├── ui/             # Composants UI
│   │   └── charts/         # Graphiques
│   │
│   ├── context/            # Contextes React
│   │   └── AuthContext.jsx # Gestion authentification
│   │
│   ├── api/                # Configuration API
│   │   └── api.js          # Axios avec intercepteurs
│   │
│   └── App.jsx             # Routeur principal
│
├── .env.example            # Variables d'environnement
├── tailwind.config.js      # Configuration Tailwind CSS
└── package.json
```

## 🔐 Authentification

L'application utilise JWT (JSON Web Token) pour l'authentification. Le token est stocké dans localStorage et envoyé automatiquement dans les headers de chaque requête API.

### Accès admin

- L'accès est réservé aux utilisateurs avec `Id_ROLE = 1` (Administrateur)
- Les identifiants sont dans le fichier `../comment VOIR les utilisateur et leur mot de passe.txt`

## 🎨 Styling

Le projet utilise **Tailwind CSS** pour le styling. La configuration se trouve dans `tailwind.config.js`.

### Couleurs personnalisées

- `primary`: #3B82F6 (Bleu)
- `secondary`: #10B981 (Vert)
- `danger`: #EF4444 (Rouge)
- `warning`: #F59E0B (Amber)
- `dark`: #1F2937 (Gris foncé)

## 📦 Packages utilisés

- **React 19**: Framework UI
- **React Router**: Navigation
- **Axios**: Client HTTP
- **Tailwind CSS**: Styling
- **Recharts**: Graphiques
- **React Hot Toast**: Notifications
- **Headless UI**: Composants accessibles

## 🛠️ Configuration API

L'URL de base de l'API est configurée dans `.env`:

```
VITE_API_URL=http://localhost:5000/api
```

Pour développement local avec un proxy différent, modifiez cette variable.

## 📝 Pages implémentées

✅ **LoginPage** - Authentification admin
✅ **DashboardPage** - Tableau de bord avec statistiques
✅ **EtudiantsPage** - Gestion complète des étudiants (CRUD)
⏳ Autres pages en cours de développement...

## 🔄 Routes API utilisées

Le backend expose les endpoints suivants sur `/api`:

```
POST   /auth/login                    # Authentification
GET    /etudiants                     # Lister étudiants
POST   /etudiants                     # Créer étudiant
PUT    /etudiants/:id                 # Modifier étudiant
DELETE /etudiants/:id                 # Supprimer étudiant

GET    /professeurs                   # Lister profs
POST   /professeurs                   # Créer prof
PUT    /professeurs/:id               # Modifier prof
DELETE /professeurs/:id               # Supprimer prof

GET    /classes                       # Lister classes
POST   /classes                       # Créer classe
PUT    /classes/:id                   # Modifier classe
DELETE /classes/:id                   # Supprimer classe

# et plus...
```

## 🚨 Dépannage

### Erreur CORS
- Vérifiez que le backend a CORS activé
- Vérifiez l'URL de base avec `VITE_API_URL`

### Token expiré
- L'utilisateur sera automatiquement redirigé vers la page de connexion
- Le token est stocké et réutilisé après rechargement

### Erreur 401 Unauthorized
- Vérifiez que le token JWT est valide
- Reconnectez-vous via la page de login

## 📞 Support

Pour les problèmes, consultez:
- Le backend dans `../backend/`
- Les logs de l'API pour les erreurs côté serveur
- La console du navigateur pour les erreurs client

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Oxc](https://oxc.rs)
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/)

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the ESLint configuration

If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and [`typescript-eslint`](https://typescript-eslint.io) in your project.
