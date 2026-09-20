# MyCESA Admin

## Présentation

MyCESA Admin est une interface d'administration web pour le système de gestion éducative MyCESA. Cette application permet aux administrateurs de gérer efficacement tous les aspects de l'établissement éducatif.

## Fonctionnalités

### 📅 Gestion des Événements
- Création, modification et suppression d'événements scolaires
- Gestion des types d'événements (examens, cours, réunions, sorties, autres)
- Ciblage par filière, classe ou établissement entier
- Interface intuitive avec modales et formulaires dynamiques

### 👥 Gestion des Utilisateurs
- Gestion des étudiants avec informations personnelles et académiques
- Gestion des professeurs et de leurs attributions
- Système d'authentification sécurisé

### 🏫 Gestion Académique
- Gestion des filières et classes
- Gestion des matières enseignées
- Gestion des emplois du temps
- Suivi des évaluations et notes

### 📊 Tableaux de Bord
- Interface d'administration complète
- Statistiques et métriques en temps réel
- Navigation intuitive avec sidebar

## Architecture Technique

### Frontend
- **Framework** : Laravel 11
- **UI Framework** : Bootstrap 5
- **Langage** : PHP 8.x, Blade templating
- **Styles** : CSS personnalisé avec Bootstrap

### Backend API
- **Framework** : Node.js avec Express
- **Base de données** : MySQL
- **Authentification** : JWT (JSON Web Tokens)
- **Architecture** : API RESTful

### Fonctionnalités Clés
- Interface responsive et moderne
- Gestion des rôles et permissions
- API sécurisée avec authentification
- Intégration temps réel des données

## Installation

### Prérequis
- PHP 8.1 ou supérieur
- Composer
- Node.js 16+ et npm
- MySQL 8.0+
- Git

### Étapes d'installation

1. **Cloner le repository**
   ```bash
   git clone <repository-url>
   cd mycesa-admin
   ```

2. **Installer les dépendances PHP**
   ```bash
   composer install
   ```

3. **Configuration de l'environnement**
   ```bash
   cp .env.example .env
   php artisan key:generate
   ```

4. **Configuration de la base de données**
   - Créer une base de données MySQL
   - Modifier les paramètres dans `.env`
   - Exécuter les migrations si nécessaire

5. **Démarrer l'application**
   ```bash
   php artisan serve
   ```

L'application sera accessible sur `http://localhost:8000`

## Structure du Projet

```
mycesa-admin/
├── app/
│   ├── Http/Controllers/
│   │   ├── Admin/
│   │   │   └── EvenementAdminController.php
│   │   └── EvenementController.php
│   └── Models/
├── resources/
│   └── views/
│       ├── layouts/
│       │   └── admin.blade.php
│       └── evenements/
│           ├── index.blade.php
│           └── _form.blade.php
├── routes/
│   └── web.php
├── public/
└── storage/
```

## API Backend

L'application communique avec une API backend Node.js/Express située dans le dossier `../backend/`.

### Endpoints principaux
- `GET /evenements` - Récupération des événements
- `POST /evenements` - Création d'événement
- `PUT /evenements/:id` - Modification d'événement
- `DELETE /evenements/:id` - Suppression d'événement
- `GET /filieres` - Liste des filières
- `GET /classes` - Liste des classes

## Développement

### Commandes utiles
```bash
# Démarrer le serveur de développement
php artisan serve

# Vider le cache
php artisan optimize:clear

# Générer des clés d'application
php artisan key:generate
```

### Structure des Événements
Les événements sont stockés avec les champs suivants :
- `Id_Evenement` : Identifiant unique
- `Titre` : Titre de l'événement
- `Description` : Description détaillée
- `Date_Evenement` : Date et heure de l'événement
- `Type` : Type d'événement (examen, cours, réunion, etc.)
- `Pour_Tous` : Booléen pour ciblage global
- `Id_Filiere` : ID de la filière ciblée (optionnel)
- `Id_Classe` : ID de la classe ciblée (optionnel)

## Sécurité

- Authentification JWT pour l'API
- Validation des données côté serveur
- Protection CSRF sur les formulaires
- Sanitisation des entrées utilisateur

## Contribution

1. Fork le projet
2. Créer une branche feature (`git checkout -b feature/nouvelle-fonctionnalite`)
3. Commit les changements (`git commit -am 'Ajout nouvelle fonctionnalité'`)
4. Push vers la branche (`git push origin feature/nouvelle-fonctionnalite`)
5. Créer une Pull Request

## Licence

Ce projet est sous licence MIT.

## Support

Pour toute question ou problème, veuillez contacter l'équipe de développement.
