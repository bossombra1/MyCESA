# MyCESA Admin — Laravel BFF v2.0

Interface d'administration pour le système de gestion scolaire MyCESA.  
Ce projet Laravel consomme l'API Node.js existante via des appels HTTP.

---

## ✅ Ce qui est fourni dans ce dossier

### 🔧 Fichiers de configuration
| Fichier | Description |
|---|---|
| `bootstrap/app.php` | Point d'entrée Laravel 11 — enregistre le middleware `check.jwt` |
| `vite.config.js` | Configuration Vite simplifiée (pas d'assets, tout via CDN) |
| `package.json` | Dépendances Node minimales (vite + laravel-vite-plugin) |
| `.env.example` | Template de configuration à copier en `.env` |
| `routes/web.php` | Toutes les routes de l'application |

### 🎮 Controllers (`app/Http/Controllers/`)
| Fichier | Rôle |
|---|---|
| `ApiController.php` | Classe de base — client HTTP partagé avec token JWT |
| `AuthController.php` | Login / Logout — gère `token` ET `access_token` dans la réponse API |
| `DashboardController.php` | Statistiques globales + graphiques |
| `EtudiantController.php` | CRUD complet + recherche |
| `ProfesseurController.php` | CRUD complet + recherche |
| `ClasseController.php` | CRUD complet |
| `MatiereController.php` | CRUD complet |
| `NoteController.php` | Liste des notes |
| `PaiementController.php` | Liste des paiements + totaux |
| `EmploiTempsController.php` | Planning par classe |
| `AbsenceController.php` | Registre des absences |
| `EvenementController.php` | Agenda des événements |
| `NotificationController.php` | Centre de notifications |
| `UtilisateurController.php` | CRUD complet des comptes |

### 🛡️ Middleware (`app/Http/Middleware/`)
| Fichier | Rôle |
|---|---|
| `CheckJwtToken.php` | Vérifie le token JWT en session — redirige vers login si absent ou expiré. Si l'API est hors ligne, laisse passer (mode dégradé) |

### 🖼️ Vues (`resources/views/`)
| Dossier | Fichiers |
|---|---|
| `layouts/` | `app.blade.php` — layout principal avec sidebar, topbar, footer |
| `auth/` | `login.blade.php` — page de connexion |
| `dashboard.blade.php` | Tableau de bord avec stats et graphiques Chart.js |
| `etudiants/` | `index`, `create`, `edit`, `show` |
| `professeurs/` | `index`, `create`, `edit`, `show` |
| `classes/` | `index`, `create`, `edit`, `show` |
| `matieres/` | `index`, `create`, `edit`, `show` |
| `notes/` | `index` |
| `paiements/` | `index` |
| `emplois/` | `index` (filtrable par classe) |
| `absences/` | `index` avec compteurs justifiées/non justifiées |
| `evenements/` | `index` en cards |
| `notifications/` | `index` avec indicateur lu/non lu |
| `utilisateurs/` | `index`, `create`, `edit`, `show` |
| `errors/` | `api-unavailable.blade.php` |

### 🎨 Design
- **Bootstrap 5.3** chargé via CDN (zéro bug de build Vite)
- **Bootstrap Icons 1.11** via CDN
- **Chart.js 4.4** via CDN (dashboard uniquement)
- **Google Fonts** — Plus Jakarta Sans
- Sidebar sombre (#0f172a), design moderne et responsive
- Compatible mobile (sidebar toggle)

---

## ❌ Ce qui manque — à récupérer depuis ton projet existant

Ces fichiers NE SONT PAS dans ce dossier. Tu dois les copier depuis `web-admin-laravel` :

### Fichiers obligatoires
```
vendor/                         ← dossier complet (ou relancer composer install)
artisan                         ← fichier exécutable Laravel
public/index.php                ← point d'entrée web
public/.htaccess                ← règles Apache
composer.json                   ← dépendances PHP
composer.lock                   ← versions verrouillées
.env                            ← tes variables d'environnement (copier .env.example)
```

### Dossiers framework
```
storage/                        ← logs, cache, sessions (copier tout)
bootstrap/cache/                ← cache Laravel (copier le dossier)
config/                         ← tous les fichiers de config Laravel
  ├── app.php
  ├── auth.php
  ├── cache.php
  ├── database.php
  ├── filesystems.php
  ├── logging.php
  ├── mail.php
  ├── queue.php
  ├── services.php
  └── session.php
database/                       ← migrations (optionnel, pas utilisé ici)
```

### Fichiers optionnels (peuvent rester de l'ancien)
```
resources/css/app.css           ← non utilisé (Bootstrap via CDN)
resources/js/app.js             ← non utilisé (Bootstrap via CDN)
resources/js/bootstrap.js       ← non utilisé
```

---

## 🚀 Installation pas à pas

### Étape 1 — Copier les fichiers manquants
```powershell
# Dans PowerShell — copie les fichiers de base depuis l'ancien projet
# SANS -Force pour ne pas écraser tes nouveaux fichiers
Copy-Item -Path "C:\Users\regis\OneDrive\Bureau\MyCESA\web-admin-laravel\vendor" -Destination "C:\Users\regis\OneDrive\Bureau\MyCESA\mycesa-admin\vendor" -Recurse
Copy-Item -Path "C:\Users\regis\OneDrive\Bureau\MyCESA\web-admin-laravel\artisan" -Destination "C:\Users\regis\OneDrive\Bureau\MyCESA\mycesa-admin\artisan"
Copy-Item -Path "C:\Users\regis\OneDrive\Bureau\MyCESA\web-admin-laravel\public\index.php" -Destination "C:\Users\regis\OneDrive\Bureau\MyCESA\mycesa-admin\public\index.php"
Copy-Item -Path "C:\Users\regis\OneDrive\Bureau\MyCESA\web-admin-laravel\public\.htaccess" -Destination "C:\Users\regis\OneDrive\Bureau\MyCESA\mycesa-admin\public\.htaccess"
Copy-Item -Path "C:\Users\regis\OneDrive\Bureau\MyCESA\web-admin-laravel\composer.json" -Destination "C:\Users\regis\OneDrive\Bureau\MyCESA\mycesa-admin\composer.json"
Copy-Item -Path "C:\Users\regis\OneDrive\Bureau\MyCESA\web-admin-laravel\composer.lock" -Destination "C:\Users\regis\OneDrive\Bureau\MyCESA\mycesa-admin\composer.lock"
Copy-Item -Path "C:\Users\regis\OneDrive\Bureau\MyCESA\web-admin-laravel\config" -Destination "C:\Users\regis\OneDrive\Bureau\MyCESA\mycesa-admin\config" -Recurse
Copy-Item -Path "C:\Users\regis\OneDrive\Bureau\MyCESA\web-admin-laravel\storage" -Destination "C:\Users\regis\OneDrive\Bureau\MyCESA\mycesa-admin\storage" -Recurse
Copy-Item -Path "C:\Users\regis\OneDrive\Bureau\MyCESA\web-admin-laravel\database" -Destination "C:\Users\regis\OneDrive\Bureau\MyCESA\mycesa-admin\database" -Recurse
```

### Étape 2 — Configurer .env
```powershell
cd C:\Users\regis\OneDrive\Bureau\MyCESA\mycesa-admin
Copy-Item .env.example .env
```

Puis édite `.env` et vérifie ces lignes :
```env
APP_NAME=MyCESA
APP_KEY=                        ← sera généré à l'étape suivante
NODE_API_URL=http://localhost:8080/api
API_TIMEOUT=10
SESSION_DRIVER=file
```

### Étape 3 — Générer la clé et vider les caches
```powershell
cd C:\Users\regis\OneDrive\Bureau\MyCESA\mycesa-admin
php artisan key:generate
php artisan config:clear
php artisan route:clear
php artisan view:clear
php artisan cache:clear
```

### Étape 4 — Démarrer
```powershell
# Terminal 1 — API Node.js
cd C:\Users\regis\OneDrive\Bureau\MyCESA\backend
npm run dev

# Terminal 2 — Laravel
cd C:\Users\regis\OneDrive\Bureau\MyCESA\mycesa-admin
php artisan serve
```

### Étape 5 — Tester
Ouvre **http://localhost:8000** → page de login → connecte-toi avec tes identifiants admin.

---

## 🔐 Authentification

Le login appelle `POST /api/auth/login` avec :
```json
{ "Login_User": "...", "Password_User": "..." }
```

Le token est cherché dans la réponse sous ces clés (dans l'ordre) : `token`, `access_token`, `jwt`.  
Seuls les utilisateurs avec `Id_ROLE = 1` ont accès à l'admin.

---

## 🗺️ Routes disponibles

| URL | Section |
|---|---|
| `/login` | Page de connexion |
| `/dashboard` | Tableau de bord |
| `/etudiants` | Gestion étudiants (CRUD) |
| `/profs` | Gestion professeurs (CRUD) |
| `/classes` | Gestion classes (CRUD) |
| `/matieres` | Gestion matières (CRUD) |
| `/notes` | Liste des notes |
| `/paiements` | Liste des paiements |
| `/emplois-temps` | Emplois du temps |
| `/absences` | Registre absences |
| `/evenements` | Agenda événements |
| `/notifications` | Notifications |
| `/utilisateurs` | Gestion utilisateurs (CRUD) |

---

## ⚠️ Points d'attention

1. **Endpoints API** — Les controllers supposent que ton API Node.js expose ces routes :
   - `GET /api/etudiants`, `GET /api/professeurs`, `GET /api/classes`, `GET /api/matieres`
   - `GET /api/notes`, `GET /api/paiements`, `GET /api/emplois-temps`
   - `GET /api/absences`, `GET /api/evenements`, `GET /api/notifications`
   - `GET /api/utilisateurs`
   - `POST /api/auth/login`, `GET /api/auth/verify`
   - Si certains endpoints n'existent pas encore, la section affichera juste "Aucune donnée"

2. **Noms des champs** — Les vues utilisent les noms de champs de ton API (`Nom_Etudiant`, `Id_Classe`, etc.). Si tes champs ont des noms différents, il faudra ajuster les vues.

3. **Pas de base de données Laravel** — Ce projet n'utilise pas MySQL directement. Toutes les données viennent de l'API Node.js.

---

## 🐛 Dépannage

**Page blanche sans erreur**
```powershell
Get-Content storage/logs/laravel.log -Tail 30
```

**Erreur "Could not open input file: artisan"**
→ Tu n'es pas dans le bon dossier. Fais `cd mycesa-admin` d'abord.

**Erreur 419 (CSRF)**
→ Vide le cache : `php artisan cache:clear`

**Dashboard vide (stats à 0)**
→ L'API Node.js n'est pas démarrée ou les endpoints ne correspondent pas.
→ Teste : `Invoke-RestMethod -Uri "http://localhost:8080/api/etudiants" -Method GET`

**Token non trouvé après login**
→ Lance ce test pour voir la structure exacte de la réponse :
```powershell
Invoke-RestMethod -Uri "http://localhost:8080/api/auth/login" -Method POST -ContentType "application/json" -Body '{"Login_User":"TON_LOGIN","Password_User":"TON_MDP"}'
```
