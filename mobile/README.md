# MyCESA Mobile - Brief de design

## 1. Présentation du projet
MyCESA est une application mobile pour les étudiants et les professeurs du GROUPE COFE-CESA.
L'objectif est de proposer un espace clair, accessible et moderne pour gérer :
- connexion et authentification
- tableau de bord étudiant/prof
- notes, absences, paiements
- emploi du temps
- messagerie / conversation
- notifications et événements
- carte scolaire, leaderboard, récompenses
- chatbot d'assistance

## 2. Public cible
- Étudiants du GROUPE COFE-CESA
- Professeurs du groupe
- Administrateurs pédagogiques qui souhaitent un outil simple et mobile

## 3. Identité visuelle
### Couleurs principales
- Vert foncé : `#2E7D32`
- Vert secondaire : `#388E3C`
- Orange contraste : `#D84315`
- Blanc : `#FFFFFF`
- Gris très clair fond général : `#F5F7F5`
- Gris clair zone de saisie : `#F8FAFC`
- Bleu-gris texte secondaire : `#64748B`
- Bleu-gris neutre : `#94A3B8`

### Palette de design secondaire
- Card blanc : `#FFFFFF`
- Bordure card : `#E2E8F0`
- Texte principal sombre : `#1E293B`
- Arrière-plan sombre (mode dark) : `#0F172A`
- Carte sombre : `#1E293B`
- Bordure sombre : `#334155`
- Blanc texturé / overlay : `rgba(255,255,255,0.05)`

### Typographie
- Style moderne sans-serif
- Titres très visibles, poids forts (bold / black)
- Sous-titres en semi-bold
- Textes de formulaire lisibles et espacés
- Button copy : `Se connecter ›`, `Voir tout ›`

## 4. Composants UI principaux
### Chargement et splash
- Écran splash animé
- Transition vers l'écran principal après chargement

### Écran de connexion
- En-tête vert riche avec formes circulaires décoratives translucides
- Badge logo blanc/orange stylisé
- Carte de login blanche avec ombre douce
- Champs de saisie arrondis, icônes emoji dans les inputs
- Bouton principal vert avec texte blanc
- Zone d'information de contact en bas
- Footer avec mentions légales et année

### Barre de navigation principale
- Bottom tab bar minimaliste
- Icônes + labels courts
- État actif indiqué par couleur verte et point sous l'icône
- 3 onglets principaux pour l'étudiant : Accueil, Emploi du temps, Profil
- 4 onglets pour le professeur : Accueil, Étudiants, Emploi, Profil

### Écran Home étudiant
- Header fixe vert foncé
- Bouton menu hamburger à gauche / notifications à droite
- Carte hero de bienvenue avec avatar utilisateur
- Carte moyenne générale
- Section événement prochain
- Drawer latéral déroulant avec profil utilisateur et navigation vers toutes les sections

### Menu latéral (drawer)
- Fond blanc ou gris très clair
- Photo ou initiale circulaire
- Liste d'éléments avec icônes emoji
- Bouton déconnexion en bas

### Cartes d'information
- Statistiques clés : notes, absences, paiements
- Cartes de section avec arrière-plan blanc ou légèrement coloré
- Badge mention de moyenne avec couleurs alerte / succès

### Section d'événements
- Éléments de contenu en style card
- Indications temporelles claires : `Dans X jour(s)`
- Utilisation d'icônes simples : 📝, ⏳, 💬, 📅

## 5. Écrans clés à concevoir
### Flux étudiant
1. Login
2. Accueil étudiant
3. Notes
4. Absences
5. Paiements
6. Emploi du temps
7. Messagerie / Conversation
8. Notifications
9. Récompenses
10. Leaderboard
11. Carte scolaire
12. À propos de CESA

### Flux professeur
1. Login
2. Accueil professeur
3. Mes étudiants
4. Saisie de notes
5. Bulletin par matière
6. Emploi du temps professeur
7. Profil professeur

## 6. UX & interactions attendues
- Sentiment sécurisant et professionnel
- Navigation rapide et claire entre les modules
- Icônes emoji simples pour l’instant, mais la maquette peut proposer des icônes modernes et cohérentes
- Usage du vert comme couleur d'action principale
- Cartes arrondies, ombres légères, surfaces blanches sur fond vert ou gris
- Gestion des états : chargement, rafraîchissement, boutons désactivés, confirmation de déconnexion
- Mode clair prioritaire, avec possibilité de mode sombre stylisé

## 7. Prompt AI Figma (à copier)

```
Conçois une maquette mobile complète pour une application éducative nommée MyCESA, destinée aux étudiants et professeurs du GROUPE COFE-CESA.

Structure :
- Écran de connexion moderne avec un header vert sombre (#2E7D32), des cercles décoratifs translucides, un logo blanc/orange, un formulaire de login arrondi, un bouton principal vert et une carte d'information contacts.
- Un dashboard étudiant avec un en-tête vert, un hero de bienvenue, un avatar utilisateur, une carte moyenne générale, une section "prochain examen", et un drawer latéral blanc pour toutes les sections.
- Un dashboard professeur similaire mais adapté au rôle professeur avec un accès rapide aux étudiants, aux saisies de notes et à l'emploi du temps.
- Une barre de navigation bottom tab minimaliste en blanc, icônes + labels, état actif en vert et petit point vert.
- Écrans secondaires : Notes, Absences, Paiements, Emploi du temps, Messagerie, Conversation, Notifications, Récompenses, Leaderboard, Carte scolaire, À propos.

Style visuel :
- Palette : vert foncé #2E7D32, vert secondaire #388E3C, orange accent #D84315, blanc #FFFFFF, gris clair #F5F7F5, bleu-gris #64748B.
- Typographie : sans-serif moderne, titres bold, textes informatifs lisibles.
- Composants : cartes arrondies, ombres légères, boutons pleins verts, champs de saisie arrondis, badges colorés.
- UI mobile nette, navigation intuitive, lecture facile des données scolaires.

Donne-moi une maquette mobile élégante, professionnelle et accessible, en conservant un usage fort du vert institutionnel et en ajoutant des touches de contraste orange pour les actions critiques.
```

## 8. Notes supplémentaires
- Le design est conçu pour une app Expo / React Native.
- Les écrans doivent être pensés en mode portrait.
- Les icônes emoji actuelles peuvent être remplacées par des icônes plus premium.
- Conserver un style cohérent entre les flux étudiant et professeur.
