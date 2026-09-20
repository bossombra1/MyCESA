# 🚀 Guide d'installation MyCESA Admin — Version 2.0

## Ce qui change dans cette version
- ✅ Bootstrap 5 chargé via CDN uniquement (fini les bugs Vite)
- ✅ Middleware JWT corrigé (ne bloque plus silencieusement)
- ✅ AuthController corrigé (gère "token" ET "access_token")
- ✅ Toutes les vues recréées proprement
- ✅ 12 sections : Étudiants, Professeurs, Classes, Matières, Notes, Paiements, Emplois, Absences, Événements, Notifications, Utilisateurs

---

## Étape 1 — Copier les fichiers

Copie TOUS les dossiers/fichiers de ce zip dans ton projet Laravel existant.
Réponds OUI si on te demande d'écraser.

Les dossiers à copier :
```
app/Http/Controllers/     ← Tous les controllers (remplace tout)
app/Http/Middleware/      ← CheckJwtToken.php (remplace)
bootstrap/app.php         ← IMPORTANT : enregistre le middleware
routes/web.php            ← Toutes les routes
resources/views/          ← Toutes les vues (remplace tout)
vite.config.js            ← Version simplifiée sans assets
package.json              ← Version simplifiée
```

---

## Étape 2 — Configurer .env

Dans ton fichier `.env`, vérifie :
```env
NODE_API_URL=http://localhost:8080/api
API_TIMEOUT=10
APP_DEBUG=true
```

---

## Étape 3 — Installer les dépendances

```powershell
composer install
npm install
```

---

## Étape 4 — Vider TOUS les caches

```powershell
php artisan config:clear
php artisan route:clear
php artisan view:clear
php artisan cache:clear
```

---

## Étape 5 — Démarrer

Terminal 1 — API Node.js :
```powershell
cd C:\Users\regis\OneDrive\Bureau\MyCESA\backend
npm run dev
```

Terminal 2 — Laravel :
```powershell
cd C:\Users\regis\OneDrive\Bureau\MyCESA\web-admin-laravel
php artisan serve
```

---

## Étape 6 — Tester

1. Ouvre http://localhost:8000
2. Tu dois voir la page de login
3. Connecte-toi avec tes identifiants admin
4. Le dashboard doit s'afficher avec les statistiques

---

## En cas de page blanche

```powershell
# Voir l'erreur exacte
Get-Content storage/logs/laravel.log -Tail 30
```

## En cas d'erreur "token manquant"

Teste ton API directement :
```powershell
Invoke-RestMethod -Uri "http://localhost:8080/api/auth/login" `
  -Method POST `
  -ContentType "application/json" `
  -Body '{"Login_User":"TON_LOGIN","Password_User":"TON_MOT_DE_PASSE"}'
```

Le résultat te montrera la clé exacte du token (token, access_token, etc.)
