# 🔌 Routes API MyCESA - Documentation

## Base URL
```
http://localhost:5000/api
```

## Authentication

### POST `/auth/login`
Authentifier un utilisateur
```json
Request:
{
  "Login_User": "admin",
  "Password_User": "password123"
}

Response:
{
  "token": "eyJhbGc...",
  "user": {
    "Id_User": 1,
    "Login_User": "admin",
    "Email_User": "admin@mycesa.com",
    "Id_ROLE": 1,
    "Statut_User": "Actif"
  }
}
```

---

## Étudiants

### GET `/etudiants`
Récupérer la liste des étudiants
```json
Response: [
  {
    "Id_Etudiant": 1,
    "Matricule_Etudiant": "20240001",
    "Nom_Etudiant": "Dupont",
    "Prenom_Etudiant": "Jean",
    "Email_Etudiant": "jean.dupont@ecole.com",
    "Classe_Etudiant": "1-A",
    "Date_Naissance": "2006-05-15",
    "Adresse": "123 rue de la Paix",
    "Telephone": "0123456789"
  }
]
```

### POST `/etudiants`
Créer un nouvel étudiant
```json
Request:
{
  "Matricule_Etudiant": "20240001",
  "Nom_Etudiant": "Dupont",
  "Prenom_Etudiant": "Jean",
  "Email_Etudiant": "jean.dupont@ecole.com",
  "Classe_Etudiant": "1-A"
}
```

### PUT `/etudiants/:id`
Modifier un étudiant

### DELETE `/etudiants/:id`
Supprimer un étudiant

---

## Professeurs

### GET `/professeurs`
Récupérer la liste des professeurs
```json
Response: [
  {
    "Id_Prof": 1,
    "Nom_Prof": "Martin",
    "Prenom_Prof": "Pierre",
    "Email_Prof": "pierre.martin@ecole.com",
    "Matière_Prof": "Mathématiques",
    "Telephone_Prof": "0123456789"
  }
]
```

### POST `/professeurs`
Créer un nouveau professeur

### PUT `/professeurs/:id`
Modifier un professeur

### DELETE `/professeurs/:id`
Supprimer un professeur

---

## Classes

### GET `/classes`
Récupérer la liste des classes
```json
Response: [
  {
    "Id_Classe": 1,
    "Nom_Classe": "1-A",
    "Filière_Classe": "Scientifique",
    "Cycle_Classe": "1ère année",
    "Effectif_Classe": 35,
    "Enseignant_Responsable": "1"
  }
]
```

### POST `/classes`
Créer une nouvelle classe

### PUT `/classes/:id`
Modifier une classe

### DELETE `/classes/:id`
Supprimer une classe

---

## Matières

### GET `/matieres`
Récupérer la liste des matières
```json
Response: [
  {
    "Id_Matière": 1,
    "Code_Matière": "MAT001",
    "Nom_Matière": "Mathématiques",
    "Coefficient_Matière": 3,
    "Volume_Horaire": "4h/semaine"
  }
]
```

### POST `/matieres`
Créer une matière

### PUT `/matieres/:id`
Modifier une matière

### DELETE `/matieres/:id`
Supprimer une matière

---

## Notes

### GET `/notes`
Récupérer toutes les notes
```json
Response: [
  {
    "Id_Note": 1,
    "Matricule_Etudiant": "20240001",
    "Nom_Etudiant": "Dupont",
    "Matière": "Mathématiques",
    "Note_Semestre1": 15.5,
    "Note_Semestre2": 14.2
  }
]
```

### GET `/notes?classe=1-A&matiere=MAT001`
Filtrer les notes par classe/matière

### POST `/notes`
Ajouter une note

### PUT `/notes/:id`
Modifier une note

---

## Emploi du temps

### GET `/emploiTemps`
Récupérer l'emploi du temps général
```json
Response: [
  {
    "Id_ET": 1,
    "Classe_ET": "1-A",
    "Jour_ET": "Lundi",
    "Heure_Debut_ET": "08:00",
    "Heure_Fin_ET": "09:00",
    "Matière_ET": "Mathématiques",
    "Prof_ET": "Pierre Martin",
    "Salle_ET": "101"
  }
]
```

### GET `/emploiTemps?classe=1-A`
Emploi du temps pour une classe spécifique

### POST `/emploiTemps`
Créer un créneau

### PUT `/emploiTemps/:id`
Modifier un créneau

---

## Paiements / Versements

### GET `/versements`
Récupérer la liste des versements
```json
Response: [
  {
    "Id_Versement": 1,
    "Matricule_Etudiant": "20240001",
    "Nom_Etudiant": "Dupont",
    "Montant_Versement": 50000,
    "Date_Versement": "2024-01-15",
    "Statut_Versement": "Payé"
  }
]
```

### GET `/versements?etudiant=20240001`
Versements d'un étudiant spécifique

### POST `/versements`
Enregistrer un versement

---

## Utilisateurs

### GET `/utilisateurs`
Récupérer la liste des utilisateurs
```json
Response: [
  {
    "Id_User": 1,
    "Login_User": "admin",
    "Email_User": "admin@mycesa.com",
    "Id_ROLE": 1,
    "Statut_User": "Actif",
    "Date_Création": "2024-01-01"
  }
]
```

### POST `/utilisateurs`
Créer un utilisateur

### PUT `/utilisateurs/:id`
Modifier un utilisateur

### DELETE `/utilisateurs/:id`
Supprimer un utilisateur

### POST `/utilisateurs/:id/reset-password`
Réinitialiser le mot de passe

---

## Notifications

### GET `/notifications`
Récupérer les notifications

### POST `/notifications/envoyer`
Envoyer une notification
```json
Request:
{
  "Titre_Notification": "Réunion parents",
  "Contenu_Notification": "Réunion samedi à 10h",
  "Cible": "tous",
  "Date_Notification": "2024-01-19T10:00:00Z"
}
```

---

## Headers requis

Tous les appels sauf `/auth/login` nécessitent:

```
Authorization: Bearer <TOKEN_JWT>
Content-Type: application/json
```

---

## Codes erreur

| Code | Signification |
|------|---------------|
| 200 | ✅ Success |
| 201 | ✅ Created |
| 400 | ❌ Bad Request |
| 401 | ❌ Unauthorized (token expiré) |
| 403 | ❌ Forbidden (pas de permission) |
| 404 | ❌ Not Found |
| 500 | ❌ Server Error |

---

## Types de filtres courants

### Par classe
```
GET /etudiants?classe=1-A
```

### Par filière
```
GET /classes?filière=Scientifique
```

### Par statut
```
GET /utilisateurs?statut=Actif
```

### Pagination (si implémentée)
```
GET /etudiants?page=1&limit=10
```

---

## Notes importantes

✅ Le web-admin consomme réellement ces API
✅ Les champs peuvent varier légèrement selon la BD
✅ Les validations se font côté API
✅ Les dates sont en format ISO 8601
✅ Les montants sont en DZD (dinars algériens)

Consultez le code du backend pour les détails exacts des endpoints.
