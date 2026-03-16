-- phpMyAdmin SQL Dump
-- version 5.2.3
-- https://www.phpmyadmin.net/
--
-- Hôte : 127.0.0.1:3306
-- Généré le : dim. 15 mars 2026 à 20:19
-- Version du serveur : 8.4.7
-- Version de PHP : 8.2.29

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Base de données : `mycesa_db`
--

-- --------------------------------------------------------

--
-- Structure de la table `absenter`
--

DROP TABLE IF EXISTS `absenter`;
CREATE TABLE IF NOT EXISTS `absenter` (
  `Id_ETUDIANT` int NOT NULL,
  `Id_UTILISATEUR` int NOT NULL,
  `Date_absence` date NOT NULL,
  `Nbre_heure` decimal(4,1) DEFAULT NULL,
  `Justifiee` tinyint(1) DEFAULT '0',
  PRIMARY KEY (`Id_ETUDIANT`,`Id_UTILISATEUR`,`Date_absence`),
  KEY `Id_UTILISATEUR` (`Id_UTILISATEUR`)
) ENGINE=MyISAM DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Déchargement des données de la table `absenter`
--

INSERT INTO `absenter` (`Id_ETUDIANT`, `Id_UTILISATEUR`, `Date_absence`, `Nbre_heure`, `Justifiee`) VALUES
(1, 10, '2026-01-10', 2.0, 0),
(1, 11, '2026-01-17', 4.0, 1),
(1, 10, '2026-02-05', 2.0, 0),
(2, 10, '2026-01-12', 2.0, 1),
(2, 11, '2026-02-10', 4.0, 0);

-- --------------------------------------------------------

--
-- Structure de la table `chat_bot`
--

DROP TABLE IF EXISTS `chat_bot`;
CREATE TABLE IF NOT EXISTS `chat_bot` (
  `Id_Chat` int NOT NULL AUTO_INCREMENT,
  `Id_ETUDIANT` int DEFAULT NULL,
  `Id_UTILISATEUR` int DEFAULT NULL,
  `Question` text COLLATE utf8mb4_unicode_ci,
  `Reponse` text COLLATE utf8mb4_unicode_ci,
  `Date_Chat` datetime DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`Id_Chat`),
  KEY `Id_ETUDIANT` (`Id_ETUDIANT`),
  KEY `Id_UTILISATEUR` (`Id_UTILISATEUR`)
) ENGINE=MyISAM AUTO_INCREMENT=14 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Déchargement des données de la table `chat_bot`
--

INSERT INTO `chat_bot` (`Id_Chat`, `Id_ETUDIANT`, `Id_UTILISATEUR`, `Question`, `Reponse`, `Date_Chat`) VALUES
(1, 2, 2, 'comment tu vas?', 'Je n\'ai pas compris ta question. Tu peux me demander des informations sur : tes notes 📝, tes absences 📅, tes paiements 💰 ou ton emploi du temps 🕐. Tu peux aussi contacter le secrétariat directement.', '2026-03-08 18:13:25'),
(2, 2, 2, 'j\'ai combien d\'heure d\'abscence', 'Je n\'ai pas compris ta question. Tu peux me demander des informations sur : tes notes 📝, tes absences 📅, tes paiements 💰 ou ton emploi du temps 🕐. Tu peux aussi contacter le secrétariat directement.', '2026-03-08 18:13:49'),
(3, 2, 2, 'notes', 'Pour consulter tes notes, va dans la section \"Mes Notes\" depuis le menu principal. Tu y trouveras toutes tes évaluations et ta moyenne par matière.', '2026-03-09 00:07:58'),
(4, 2, 2, 'merci', 'Avec plaisir ! N\'hésite pas si tu as d\'autres questions. Bonne journée ! 😊', '2026-03-09 00:08:18'),
(5, 20, 20, 'Mes paiements en cours', 'Pour vérifier l\'état de tes paiements de scolarité, consulte la section \"Mes Paiements\". En cas de problème, contacte le service comptabilité.', '2026-03-13 13:29:28'),
(6, 20, 20, 'Mes paiements en cours', 'Pour vérifier l\'état de tes paiements de scolarité, consulte la section \"Mes Paiements\". En cas de problème, contacte le service comptabilité.', '2026-03-13 13:29:50'),
(7, 20, 20, 'Combien d\'absences ai-je ?', 'Le relevé de tes absences est disponible dans la section \"Mes Absences\". Si tu as une absence injustifiée, rapproche-toi du secrétariat avec un justificatif.', '2026-03-13 13:35:13'),
(8, 20, 20, 'Mes paiements en cours', 'Pour vérifier l\'état de tes paiements de scolarité, consulte la section \"Mes Paiements\". En cas de problème, contacte le service comptabilité.', '2026-03-13 13:35:46'),
(9, 20, 20, 'Salut', 'Bonjour ! Je suis l\'assistant MyCESA 👋. Comment puis-je t\'aider aujourd\'hui ? Tu peux me poser des questions sur tes notes, absences, paiements ou ton emploi du temps.', '2026-03-13 13:36:13'),
(10, 20, 20, 'J\'ai quelle cours aujourd\'hui ?', 'Ton emploi du temps est accessible dans la section \"Emploi du Temps\". Il est mis à jour par l\'administration en cas de changement.', '2026-03-13 13:36:40'),
(11, 20, 20, 'J\'ai combien de moyenne actuellement', 'Pour consulter tes notes, va dans la section \"Mes Notes\" depuis le menu principal. Tu y trouveras toutes tes évaluations et ta moyenne par matière.', '2026-03-13 13:37:04'),
(12, 20, 20, 'Bonjour comment tu vas', 'Bonjour ! Je suis l\'assistant MyCESA 👋. Comment puis-je t\'aider aujourd\'hui ? Tu peux me poser des questions sur tes notes, absences, paiements ou ton emploi du temps.', '2026-03-13 17:59:03'),
(13, 20, 20, 'Je suis connectée', 'Je n\'ai pas compris ta question. Tu peux me demander des informations sur : tes notes 📝, tes absences 📅, tes paiements 💰 ou ton emploi du temps 🕐. Tu peux aussi contacter le secrétariat directement.', '2026-03-13 17:59:15');

-- --------------------------------------------------------

--
-- Structure de la table `classe`
--

DROP TABLE IF EXISTS `classe`;
CREATE TABLE IF NOT EXISTS `classe` (
  `Id_CLASSE` int NOT NULL AUTO_INCREMENT,
  `Nom_Classe` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `Effectif_Prevu_Etudiant` int DEFAULT '0',
  `Id_FILIERE` int DEFAULT NULL,
  PRIMARY KEY (`Id_CLASSE`),
  KEY `Id_FILIERE` (`Id_FILIERE`)
) ENGINE=MyISAM AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Déchargement des données de la table `classe`
--

INSERT INTO `classe` (`Id_CLASSE`, `Nom_Classe`, `Effectif_Prevu_Etudiant`, `Id_FILIERE`) VALUES
(1, 'L1 INFO A', 40, 1),
(2, 'L2 INFO B', 35, 1),
(3, 'BTS GESTION', 30, 2);

-- --------------------------------------------------------

--
-- Structure de la table `conversation`
--

DROP TABLE IF EXISTS `conversation`;
CREATE TABLE IF NOT EXISTS `conversation` (
  `Id_Conversation` int NOT NULL AUTO_INCREMENT,
  `Id_Etudiant` int NOT NULL,
  `Id_Professeur` int NOT NULL,
  `Dernier_Message` text COLLATE utf8mb4_unicode_ci,
  `Derniere_Date` datetime DEFAULT CURRENT_TIMESTAMP,
  `Non_Lu_Etudiant` int DEFAULT '0',
  `Non_Lu_Prof` int DEFAULT '0',
  `CreatedAt` datetime DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`Id_Conversation`),
  UNIQUE KEY `unique_conv` (`Id_Etudiant`,`Id_Professeur`),
  KEY `Id_Professeur` (`Id_Professeur`)
) ENGINE=MyISAM AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Déchargement des données de la table `conversation`
--

INSERT INTO `conversation` (`Id_Conversation`, `Id_Etudiant`, `Id_Professeur`, `Dernier_Message`, `Derniere_Date`, `Non_Lu_Etudiant`, `Non_Lu_Prof`, `CreatedAt`) VALUES
(1, 20, 11, 'Sa va', '2026-03-15 14:33:19', 0, 0, '2026-03-14 18:33:09'),
(2, 11, 11, 'cc', '2026-03-14 18:53:24', 0, 0, '2026-03-14 18:53:24');

-- --------------------------------------------------------

--
-- Structure de la table `cycle_`
--

DROP TABLE IF EXISTS `cycle_`;
CREATE TABLE IF NOT EXISTS `cycle_` (
  `Id_CYCLE` int NOT NULL AUTO_INCREMENT,
  `Lib_Cycle` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `Id_SITE` int DEFAULT NULL,
  PRIMARY KEY (`Id_CYCLE`),
  KEY `Id_SITE` (`Id_SITE`)
) ENGINE=MyISAM AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Déchargement des données de la table `cycle_`
--

INSERT INTO `cycle_` (`Id_CYCLE`, `Lib_Cycle`, `Id_SITE`) VALUES
(1, 'Licence', 1),
(2, 'Master', 1),
(3, 'BTS', 1);

-- --------------------------------------------------------

--
-- Structure de la table `emploi_temps`
--

DROP TABLE IF EXISTS `emploi_temps`;
CREATE TABLE IF NOT EXISTS `emploi_temps` (
  `IdEmploi` int NOT NULL AUTO_INCREMENT,
  `Id_PROFESSEUR` int NOT NULL,
  `Id_SALLE` int NOT NULL,
  `Id_MATIERE` int NOT NULL,
  `Id_CLASSE` int NOT NULL,
  `IdEmploi_Temps` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `date_` datetime DEFAULT NULL,
  `Heure_Debut` time DEFAULT NULL,
  `Heure_Fin` time DEFAULT NULL,
  `Jour_Semaine` varchar(20) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  PRIMARY KEY (`IdEmploi`),
  KEY `Id_SALLE` (`Id_SALLE`),
  KEY `Id_MATIERE` (`Id_MATIERE`),
  KEY `Id_CLASSE` (`Id_CLASSE`)
) ENGINE=MyISAM AUTO_INCREMENT=19 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Déchargement des données de la table `emploi_temps`
--

INSERT INTO `emploi_temps` (`IdEmploi`, `Id_PROFESSEUR`, `Id_SALLE`, `Id_MATIERE`, `Id_CLASSE`, `IdEmploi_Temps`, `date_`, `Heure_Debut`, `Heure_Fin`, `Jour_Semaine`) VALUES
(1, 1, 1, 1, 1, '1', '2026-03-09 08:00:00', '08:00:00', '10:00:00', 'Lundi'),
(2, 1, 2, 2, 1, '2', '2026-03-09 10:00:00', '10:00:00', '12:00:00', 'Lundi'),
(3, 1, 1, 3, 1, '3', '2026-03-10 08:00:00', '08:00:00', '10:00:00', 'Mardi'),
(4, 2, 3, 4, 1, '4', '2026-03-11 14:00:00', '14:00:00', '16:00:00', 'Mercredi'),
(5, 2, 2, 5, 1, '5', '2026-03-12 10:00:00', '10:00:00', '12:00:00', 'Jeudi'),
(6, 1, 1, 6, 1, NULL, '2026-03-16 08:00:00', '08:00:00', '10:00:00', 'Lundi'),
(7, 2, 2, 7, 1, NULL, '2026-03-16 10:00:00', '10:00:00', '12:00:00', 'Lundi'),
(8, 1, 3, 8, 1, NULL, '2026-03-16 14:00:00', '14:00:00', '16:00:00', 'Lundi'),
(9, 2, 1, 9, 1, NULL, '2026-03-17 08:00:00', '08:00:00', '10:00:00', 'Mardi'),
(10, 1, 2, 10, 1, NULL, '2026-03-17 10:00:00', '10:00:00', '12:00:00', 'Mardi'),
(11, 3, 3, 11, 1, NULL, '2026-03-17 14:00:00', '14:00:00', '16:00:00', 'Mardi'),
(12, 3, 1, 12, 1, NULL, '2026-03-18 08:00:00', '08:00:00', '10:00:00', 'Mercredi'),
(13, 2, 2, 13, 1, NULL, '2026-03-18 10:00:00', '10:00:00', '12:00:00', 'Mercredi'),
(14, 2, 1, 11, 1, NULL, '2026-03-19 08:00:00', '08:00:00', '10:00:00', 'Jeudi'),
(15, 3, 2, 12, 1, NULL, '2026-03-19 14:00:00', '14:00:00', '16:00:00', 'Jeudi'),
(16, 2, 1, 13, 1, NULL, '2026-03-20 08:00:00', '08:00:00', '10:00:00', 'Vendredi'),
(17, 1, 2, 9, 1, NULL, '2026-03-20 10:00:00', '10:00:00', '12:00:00', 'Vendredi'),
(18, 3, 3, 10, 1, NULL, '2026-03-20 14:00:00', '14:00:00', '16:00:00', 'Vendredi');

-- --------------------------------------------------------

--
-- Structure de la table `enseigner`
--

DROP TABLE IF EXISTS `enseigner`;
CREATE TABLE IF NOT EXISTS `enseigner` (
  `Id_PROFESSEUR` int NOT NULL,
  `Id_MATIERE` int NOT NULL,
  PRIMARY KEY (`Id_PROFESSEUR`,`Id_MATIERE`),
  KEY `Id_MATIERE` (`Id_MATIERE`)
) ENGINE=MyISAM DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Déchargement des données de la table `enseigner`
--

INSERT INTO `enseigner` (`Id_PROFESSEUR`, `Id_MATIERE`) VALUES
(1, 1),
(1, 2),
(1, 3),
(2, 4),
(2, 5);

-- --------------------------------------------------------

--
-- Structure de la table `etudiant`
--

DROP TABLE IF EXISTS `etudiant`;
CREATE TABLE IF NOT EXISTS `etudiant` (
  `Id_ETUDIANT` int NOT NULL AUTO_INCREMENT,
  `Matricule_Etudiant` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `Nom_Etudiant` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `Prenoms_Etudiant` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `Genre_Etudiant` varchar(10) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `Tel_Etudiant` varchar(20) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `Email_Etudiant` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `Date_Naissance_Etudiant` date DEFAULT NULL,
  `Lieu_Naissance_Etudiant` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `Quartier_Etudiant` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `Image_Etudiant` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `Id_CLASSE` int DEFAULT NULL,
  PRIMARY KEY (`Id_ETUDIANT`),
  UNIQUE KEY `Matricule_Etudiant` (`Matricule_Etudiant`),
  KEY `Id_CLASSE` (`Id_CLASSE`)
) ENGINE=MyISAM AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Déchargement des données de la table `etudiant`
--

INSERT INTO `etudiant` (`Id_ETUDIANT`, `Matricule_Etudiant`, `Nom_Etudiant`, `Prenoms_Etudiant`, `Genre_Etudiant`, `Tel_Etudiant`, `Email_Etudiant`, `Date_Naissance_Etudiant`, `Lieu_Naissance_Etudiant`, `Quartier_Etudiant`, `Image_Etudiant`, `Id_CLASSE`) VALUES
(1, 'ETU2026001', 'Koné', 'Adama', 'M', '0701020304', 'adama@mycesa.ci', '2002-05-15', 'Abidjan', NULL, '/uploads/photos/etudiant_20_1773490293661.jpeg', 1),
(2, 'ETU2026002', 'Traoré', 'Fatou', 'F', '0705060708', 'fatou@mycesa.ci', '2003-08-22', 'Bouaké', NULL, NULL, 1),
(3, 'ETU2026003', 'Coulibaly', 'Ibrahim', 'M', '0709101112', 'ibrahim@mycesa.ci', '2001-12-10', 'Yamoussoukro', NULL, NULL, 2);

-- --------------------------------------------------------

--
-- Structure de la table `evaluation`
--

DROP TABLE IF EXISTS `evaluation`;
CREATE TABLE IF NOT EXISTS `evaluation` (
  `Id_EVALUATION` int NOT NULL AUTO_INCREMENT,
  `Lib_Evaluation` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `Date_Evaluation` datetime DEFAULT NULL,
  `Coef_Evaluation` decimal(4,2) DEFAULT NULL,
  `Type_Evaluation` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `Id_SEMESTRE` int DEFAULT NULL,
  PRIMARY KEY (`Id_EVALUATION`),
  KEY `Id_SEMESTRE` (`Id_SEMESTRE`)
) ENGINE=MyISAM AUTO_INCREMENT=64 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Déchargement des données de la table `evaluation`
--

INSERT INTO `evaluation` (`Id_EVALUATION`, `Lib_Evaluation`, `Date_Evaluation`, `Coef_Evaluation`, `Type_Evaluation`, `Id_SEMESTRE`) VALUES
(59, 'MAT_9_PROF_11_TP_1773601851835', '2026-03-15 19:10:51', 1.00, 'TP', 1),
(60, 'MAT_9_PROF_11_Devoir_1773601851863', '2026-03-15 19:10:51', 2.00, 'Devoir', 1),
(61, 'MAT_13_PROF_11_Devoir_1773601909949', '2026-03-15 19:11:49', 1.00, 'Devoir', 1),
(62, 'MAT_13_PROF_11_Devoir_1773601910043', '2026-03-15 19:11:50', 1.00, 'Devoir', 1),
(63, 'MAT_13_PROF_11_TP_1773601910078', '2026-03-15 19:11:50', 2.00, 'TP', 1);

-- --------------------------------------------------------

--
-- Structure de la table `evaluer`
--

DROP TABLE IF EXISTS `evaluer`;
CREATE TABLE IF NOT EXISTS `evaluer` (
  `Id_EVALUATION` int NOT NULL,
  `Id_CLASSE` int NOT NULL,
  PRIMARY KEY (`Id_EVALUATION`,`Id_CLASSE`),
  KEY `Id_CLASSE` (`Id_CLASSE`)
) ENGINE=MyISAM DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Déchargement des données de la table `evaluer`
--

INSERT INTO `evaluer` (`Id_EVALUATION`, `Id_CLASSE`) VALUES
(1, 1),
(2, 1),
(3, 1),
(4, 1),
(5, 1);

-- --------------------------------------------------------

--
-- Structure de la table `evenement_ecole`
--

DROP TABLE IF EXISTS `evenement_ecole`;
CREATE TABLE IF NOT EXISTS `evenement_ecole` (
  `Id_Evenement` int NOT NULL AUTO_INCREMENT,
  `Titre` varchar(200) COLLATE utf8mb4_unicode_ci NOT NULL,
  `Description` text COLLATE utf8mb4_unicode_ci,
  `Date_Evenement` datetime NOT NULL,
  `Type` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT 'examen',
  `Id_Classe` int DEFAULT NULL,
  `Id_Filiere` int DEFAULT NULL,
  `Pour_Tous` tinyint DEFAULT '0',
  `CreatedAt` datetime DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`Id_Evenement`),
  KEY `Id_Classe` (`Id_Classe`),
  KEY `Id_Filiere` (`Id_Filiere`)
) ENGINE=MyISAM AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Déchargement des données de la table `evenement_ecole`
--

INSERT INTO `evenement_ecole` (`Id_Evenement`, `Titre`, `Description`, `Date_Evenement`, `Type`, `Id_Classe`, `Id_Filiere`, `Pour_Tous`, `CreatedAt`) VALUES
(1, 'Examen de Marketing', 'Salle A12', '2026-03-20 08:00:00', 'examen', NULL, NULL, 1, '2026-03-14 14:23:13');

-- --------------------------------------------------------

--
-- Structure de la table `filiere`
--

DROP TABLE IF EXISTS `filiere`;
CREATE TABLE IF NOT EXISTS `filiere` (
  `Id_FILIERE` int NOT NULL AUTO_INCREMENT,
  `Nom_Filiere` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `Id_CYCLE` int DEFAULT NULL,
  PRIMARY KEY (`Id_FILIERE`),
  KEY `Id_CYCLE` (`Id_CYCLE`)
) ENGINE=MyISAM AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Déchargement des données de la table `filiere`
--

INSERT INTO `filiere` (`Id_FILIERE`, `Nom_Filiere`, `Id_CYCLE`) VALUES
(1, 'Informatique', NULL),
(2, 'Gestion', NULL),
(3, 'Réseaux & Télécommunications', NULL);

-- --------------------------------------------------------

--
-- Structure de la table `historique_points`
--

DROP TABLE IF EXISTS `historique_points`;
CREATE TABLE IF NOT EXISTS `historique_points` (
  `Id_Historique` int NOT NULL AUTO_INCREMENT,
  `Id_UTILISATEUR` int NOT NULL,
  `Points` int NOT NULL,
  `Raison` varchar(200) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `Type` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `CreatedAt` datetime DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`Id_Historique`),
  KEY `Id_UTILISATEUR` (`Id_UTILISATEUR`)
) ENGINE=MyISAM AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Déchargement des données de la table `historique_points`
--

INSERT INTO `historique_points` (`Id_Historique`, `Id_UTILISATEUR`, `Points`, `Raison`, `Type`, `CreatedAt`) VALUES
(1, 20, 10, '📅 Connexion journalière', 'connexion', '2026-03-14 13:53:58'),
(2, 11, 10, '📅 Connexion journalière', 'connexion', '2026-03-14 19:09:21'),
(3, 20, 10, '📅 Connexion journalière', 'connexion', '2026-03-15 19:40:08');

-- --------------------------------------------------------

--
-- Structure de la table `histo_versement`
--

DROP TABLE IF EXISTS `histo_versement`;
CREATE TABLE IF NOT EXISTS `histo_versement` (
  `Id_HISTO` int NOT NULL AUTO_INCREMENT,
  `Id_VERSEMENT` int DEFAULT NULL,
  `Id_UTILISATEUR` int DEFAULT NULL,
  `Date_Histo` datetime DEFAULT CURRENT_TIMESTAMP,
  `Action_Histo` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  PRIMARY KEY (`Id_HISTO`),
  KEY `Id_VERSEMENT` (`Id_VERSEMENT`),
  KEY `Id_UTILISATEUR` (`Id_UTILISATEUR`)
) ENGINE=MyISAM DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Structure de la table `matiere`
--

DROP TABLE IF EXISTS `matiere`;
CREATE TABLE IF NOT EXISTS `matiere` (
  `Id_MATIERE` int NOT NULL AUTO_INCREMENT,
  `Nom_Matiere` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  PRIMARY KEY (`Id_MATIERE`)
) ENGINE=MyISAM AUTO_INCREMENT=14 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Déchargement des données de la table `matiere`
--

INSERT INTO `matiere` (`Id_MATIERE`, `Nom_Matiere`) VALUES
(1, 'Algorithmique'),
(2, 'Base de données'),
(3, 'Développement Web'),
(4, 'Mathématiques'),
(5, 'Anglais Technique'),
(6, 'Mathématiques Financières'),
(7, 'Droit des Affaires'),
(8, 'Gestion de Projet'),
(9, 'Anglais des Affaires'),
(10, 'Informatique de Gestion'),
(11, 'Statistiques'),
(12, 'Marketing Digital'),
(13, 'Comptabilité Analytique');

-- --------------------------------------------------------

--
-- Structure de la table `message`
--

DROP TABLE IF EXISTS `message`;
CREATE TABLE IF NOT EXISTS `message` (
  `Id_Message` int NOT NULL AUTO_INCREMENT,
  `Id_Conversation` int NOT NULL,
  `Id_Expediteur` int NOT NULL,
  `Contenu` text COLLATE utf8mb4_unicode_ci NOT NULL,
  `Lu` tinyint DEFAULT '0',
  `CreatedAt` datetime DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`Id_Message`),
  KEY `Id_Conversation` (`Id_Conversation`),
  KEY `Id_Expediteur` (`Id_Expediteur`)
) ENGINE=MyISAM AUTO_INCREMENT=40 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Déchargement des données de la table `message`
--

INSERT INTO `message` (`Id_Message`, `Id_Conversation`, `Id_Expediteur`, `Contenu`, `Lu`, `CreatedAt`) VALUES
(1, 1, 20, 'Bonjour Mr', 1, '2026-03-14 18:33:09'),
(2, 1, 11, 'salut ca va', 1, '2026-03-14 18:33:51'),
(3, 1, 20, 'Oui ça va', 1, '2026-03-14 18:34:10'),
(4, 1, 11, 'cool', 1, '2026-03-14 18:34:23'),
(5, 1, 20, 'Fvch\nGh', 1, '2026-03-14 18:45:06'),
(6, 1, 11, 'sallk', 1, '2026-03-14 18:45:20'),
(7, 1, 11, 'iggi', 1, '2026-03-14 18:45:34'),
(8, 1, 11, 'hello world', 1, '2026-03-14 18:45:49'),
(9, 1, 11, 'rieuagiubeluos', 1, '2026-03-14 18:46:03'),
(10, 1, 11, 'nqhgfjhz', 1, '2026-03-14 18:46:13'),
(11, 1, 11, 'salut boss', 1, '2026-03-14 18:46:22'),
(12, 1, 11, 'saluutttyufih', 1, '2026-03-14 18:46:34'),
(13, 1, 11, 'cc', 1, '2026-03-14 18:51:35'),
(14, 1, 11, 'comment tu vas', 1, '2026-03-14 18:51:49'),
(15, 1, 20, 'Je vais bien et toi', 1, '2026-03-14 18:52:06'),
(16, 2, 11, 'cc', 0, '2026-03-14 18:53:24'),
(17, 1, 11, 'ça va', 1, '2026-03-14 18:53:49'),
(18, 1, 20, 'Fzzf', 1, '2026-03-14 18:59:19'),
(19, 1, 11, 'binenn', 1, '2026-03-14 18:59:39'),
(20, 1, 11, 'c\'est bon', 1, '2026-03-14 19:07:45'),
(21, 1, 20, 'Ok', 1, '2026-03-14 19:08:03'),
(22, 1, 20, 'Ddd', 1, '2026-03-14 21:00:49'),
(23, 1, 11, 'lol', 1, '2026-03-14 21:03:16'),
(24, 1, 11, 'holo', 1, '2026-03-15 11:20:51'),
(25, 1, 20, 'Li', 1, '2026-03-15 11:21:46'),
(26, 1, 20, 'Gh', 1, '2026-03-15 11:21:59'),
(27, 1, 11, 'fger', 1, '2026-03-15 11:27:41'),
(28, 1, 20, 'Fjruy', 1, '2026-03-15 11:27:53'),
(29, 1, 20, 'Gfg', 1, '2026-03-15 11:28:01'),
(30, 1, 11, 'qdq', 1, '2026-03-15 11:28:13'),
(31, 1, 11, 'comment', 1, '2026-03-15 11:28:18'),
(32, 1, 11, 'bien', 1, '2026-03-15 11:31:33'),
(33, 1, 11, 'dhg', 1, '2026-03-15 11:31:53'),
(34, 1, 11, 'voo', 1, '2026-03-15 11:31:57'),
(35, 1, 11, 'fhthrt', 1, '2026-03-15 11:32:03'),
(36, 1, 11, 'zet\"v\"', 1, '2026-03-15 11:32:06'),
(37, 1, 11, '\"\"\"\"\"\"\"\"\"', 1, '2026-03-15 11:32:10'),
(38, 1, 11, 'salugt toi', 1, '2026-03-15 14:33:02'),
(39, 1, 20, 'Sa va', 1, '2026-03-15 14:33:19');

-- --------------------------------------------------------

--
-- Structure de la table `notation`
--

DROP TABLE IF EXISTS `notation`;
CREATE TABLE IF NOT EXISTS `notation` (
  `Id_ETUDIANT` int NOT NULL,
  `Id_EVALUATION` int NOT NULL,
  `Note_Evaluation` decimal(5,2) DEFAULT NULL,
  PRIMARY KEY (`Id_ETUDIANT`,`Id_EVALUATION`),
  KEY `Id_EVALUATION` (`Id_EVALUATION`)
) ENGINE=MyISAM DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Déchargement des données de la table `notation`
--

INSERT INTO `notation` (`Id_ETUDIANT`, `Id_EVALUATION`, `Note_Evaluation`) VALUES
(1, 59, 9.00),
(1, 60, 16.00),
(1, 61, 10.00),
(1, 62, 12.00),
(1, 63, 8.00);

-- --------------------------------------------------------

--
-- Structure de la table `notification`
--

DROP TABLE IF EXISTS `notification`;
CREATE TABLE IF NOT EXISTS `notification` (
  `Id_EVENEMENT` int NOT NULL AUTO_INCREMENT,
  `Id_UTILISATEUR` int DEFAULT NULL,
  `Titre_Notif` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `Message_Notif` text COLLATE utf8mb4_unicode_ci,
  `Lu` tinyint(1) DEFAULT '0',
  `Date_Notif` datetime DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`Id_EVENEMENT`),
  KEY `Id_UTILISATEUR` (`Id_UTILISATEUR`)
) ENGINE=MyISAM DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Structure de la table `points_etudiant`
--

DROP TABLE IF EXISTS `points_etudiant`;
CREATE TABLE IF NOT EXISTS `points_etudiant` (
  `Id_Points` int NOT NULL AUTO_INCREMENT,
  `Id_UTILISATEUR` int NOT NULL,
  `Total_Points` int DEFAULT '0',
  `Niveau` int DEFAULT '1',
  `Streak_Connexion` int DEFAULT '0',
  `Derniere_Connexion` date DEFAULT NULL,
  PRIMARY KEY (`Id_Points`),
  KEY `Id_UTILISATEUR` (`Id_UTILISATEUR`)
) ENGINE=MyISAM AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Déchargement des données de la table `points_etudiant`
--

INSERT INTO `points_etudiant` (`Id_Points`, `Id_UTILISATEUR`, `Total_Points`, `Niveau`, `Streak_Connexion`, `Derniere_Connexion`) VALUES
(1, 20, 20, 1, 2, '2026-03-15'),
(2, 20, 10, 1, 2, '2026-03-15'),
(3, 20, 10, 1, 2, '2026-03-15'),
(4, 11, 10, 1, 1, '2026-03-14'),
(5, 20, 10, 1, 2, '2026-03-15');

-- --------------------------------------------------------

--
-- Structure de la table `professeur`
--

DROP TABLE IF EXISTS `professeur`;
CREATE TABLE IF NOT EXISTS `professeur` (
  `Id_PROFESSEUR` int NOT NULL AUTO_INCREMENT,
  `Nom_Prenoms_Profe` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `Tel_Profe` varchar(20) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `Quartier_Profe` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `email_Profe` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `Date_Naissance` date DEFAULT NULL,
  PRIMARY KEY (`Id_PROFESSEUR`)
) ENGINE=MyISAM AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Déchargement des données de la table `professeur`
--

INSERT INTO `professeur` (`Id_PROFESSEUR`, `Nom_Prenoms_Profe`, `Tel_Profe`, `Quartier_Profe`, `email_Profe`, `Date_Naissance`) VALUES
(1, 'Kouassi Jean', '0701020304', NULL, 'kouassi@mycesa.ci', '1985-03-10'),
(2, 'Diabaté Marie', '0705060708', NULL, 'diabate@mycesa.ci', '1988-07-22');

-- --------------------------------------------------------

--
-- Structure de la table `push_tokens`
--

DROP TABLE IF EXISTS `push_tokens`;
CREATE TABLE IF NOT EXISTS `push_tokens` (
  `Id_Token` int NOT NULL AUTO_INCREMENT,
  `Id_UTILISATEUR` int NOT NULL,
  `Token` varchar(500) COLLATE utf8mb4_unicode_ci NOT NULL,
  `Platform` varchar(20) COLLATE utf8mb4_unicode_ci DEFAULT 'android',
  `CreatedAt` datetime DEFAULT CURRENT_TIMESTAMP,
  `UpdatedAt` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`Id_Token`),
  UNIQUE KEY `unique_user` (`Id_UTILISATEUR`)
) ENGINE=MyISAM AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Déchargement des données de la table `push_tokens`
--

INSERT INTO `push_tokens` (`Id_Token`, `Id_UTILISATEUR`, `Token`, `Platform`, `CreatedAt`, `UpdatedAt`) VALUES
(1, 20, 'eWRfXL8LSW-dZ7pr7GZwsa:APA91bHN5cycxzMq9vq1RWnSQpL49ERscNkLU5uxTo35HrQQTYoS8TyaAycMKIix_ABB44HdXbvtidHrmPj9j2VgZgRjVC6BUI4T-4K4GfGjW55wiVVPjnw', 'android', '2026-03-14 13:20:53', '2026-03-14 13:27:00');

-- --------------------------------------------------------

--
-- Structure de la table `role`
--

DROP TABLE IF EXISTS `role`;
CREATE TABLE IF NOT EXISTS `role` (
  `Id_ROLE` int NOT NULL AUTO_INCREMENT,
  `Lib_Role` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  PRIMARY KEY (`Id_ROLE`)
) ENGINE=MyISAM AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Déchargement des données de la table `role`
--

INSERT INTO `role` (`Id_ROLE`, `Lib_Role`) VALUES
(1, 'Administrateur'),
(2, 'Secrétaire'),
(3, 'Professeur'),
(4, 'Etudiant');

-- --------------------------------------------------------

--
-- Structure de la table `salle`
--

DROP TABLE IF EXISTS `salle`;
CREATE TABLE IF NOT EXISTS `salle` (
  `Id_SALLE` int NOT NULL AUTO_INCREMENT,
  `Nom_Salle` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `Localisation_Salle` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `Superficie_Salle` varchar(20) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  PRIMARY KEY (`Id_SALLE`)
) ENGINE=MyISAM AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Déchargement des données de la table `salle`
--

INSERT INTO `salle` (`Id_SALLE`, `Nom_Salle`, `Localisation_Salle`, `Superficie_Salle`) VALUES
(1, 'Salle A101', 'Bâtiment A - 1er étage', '60'),
(2, 'Salle B202', 'Bâtiment B - 2ème étage', '50'),
(3, 'Amphi 1', 'Bâtiment Principal', '200');

-- --------------------------------------------------------

--
-- Structure de la table `semestre`
--

DROP TABLE IF EXISTS `semestre`;
CREATE TABLE IF NOT EXISTS `semestre` (
  `Id_SEMESTRE` int NOT NULL AUTO_INCREMENT,
  `Lib_Sem` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `Annee_Academique_Semestre` varchar(20) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  PRIMARY KEY (`Id_SEMESTRE`)
) ENGINE=MyISAM AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Déchargement des données de la table `semestre`
--

INSERT INTO `semestre` (`Id_SEMESTRE`, `Lib_Sem`, `Annee_Academique_Semestre`) VALUES
(1, 'Semestre 1', '2025-2026'),
(2, 'Semestre 2', '2025-2026');

-- --------------------------------------------------------

--
-- Structure de la table `site`
--

DROP TABLE IF EXISTS `site`;
CREATE TABLE IF NOT EXISTS `site` (
  `Id_SITE` int NOT NULL AUTO_INCREMENT,
  `Nom_Site` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `Localisation_Site` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `Contact_Site` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  PRIMARY KEY (`Id_SITE`)
) ENGINE=MyISAM AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Déchargement des données de la table `site`
--

INSERT INTO `site` (`Id_SITE`, `Nom_Site`, `Localisation_Site`, `Contact_Site`) VALUES
(1, 'CESA Abidjan', 'Abidjan, Côte d\'Ivoire', '+225 00 00 00 00');

-- --------------------------------------------------------

--
-- Structure de la table `utilisateur`
--

DROP TABLE IF EXISTS `utilisateur`;
CREATE TABLE IF NOT EXISTS `utilisateur` (
  `Id_UTILISATEUR` int NOT NULL AUTO_INCREMENT,
  `Nom_User` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `Login_User` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `Email_User` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `Password_User` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `Id_ROLE` int DEFAULT NULL,
  `Expo_Token` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  PRIMARY KEY (`Id_UTILISATEUR`),
  UNIQUE KEY `Login_User` (`Login_User`),
  UNIQUE KEY `Email_User` (`Email_User`),
  KEY `Id_ROLE` (`Id_ROLE`)
) ENGINE=MyISAM AUTO_INCREMENT=24 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Déchargement des données de la table `utilisateur`
--

INSERT INTO `utilisateur` (`Id_UTILISATEUR`, `Nom_User`, `Login_User`, `Email_User`, `Password_User`, `Id_ROLE`, `Expo_Token`) VALUES
(2, 'Administrateur', 'admin', 'admin@mycesa.ci', '$2b$12$AQkENoQjk5QTqCKuXjg0mOrcIK7HoooiA9Sb/k1DH6BPTKgR5emDO', 1, NULL),
(10, 'Kouassi Jean', 'prof.kouassi', 'kouassi@mycesa.ci', '$2b$12$AQkENoQjk5QTqCKuXjg0mOrcIK7HoooiA9Sb/k1DH6BPTKgR5emDO', 3, NULL),
(11, 'Diabaté Marie', 'prof.diabate', 'diabate@mycesa.ci', '$2b$12$AQkENoQjk5QTqCKuXjg0mOrcIK7HoooiA9Sb/k1DH6BPTKgR5emDO', 3, NULL),
(20, 'Koné Adama', 'adama.kone', 'adama@mycesa.ci', '$2b$12$AQkENoQjk5QTqCKuXjg0mOrcIK7HoooiA9Sb/k1DH6BPTKgR5emDO', 4, 'eWRfXL8LSW-dZ7pr7GZwsa:APA91bHN5cycxzMq9vq1RWnSQpL49ERscNkLU5uxTo35HrQQTYoS8TyaAycMKIix_ABB44HdXbvtidHrmPj9j2VgZgRjVC6BUI4T-4K4GfGjW55wiVVPjnw'),
(21, 'Traoré Fatou', 'fatou.traore', 'fatou@mycesa.ci', '$2b$12$AQkENoQjk5QTqCKuXjg0mOrcIK7HoooiA9Sb/k1DH6BPTKgR5emDO', 4, NULL),
(22, 'Coulibaly Ibrahim', 'ibrahim.coul', 'ibrahim@mycesa.ci', '$2b$12$AQkENoQjk5QTqCKuXjg0mOrcIK7HoooiA9Sb/k1DH6BPTKgR5emDO', 4, NULL),
(23, 'Test', 'testmdp', 'test@test.ci', '$2b$12$AQkENoQjk5QTqCKuXjg0mOrcIK7HoooiA9Sb/k1DH6BPTKgR5emDO', 4, NULL);

-- --------------------------------------------------------

--
-- Structure de la table `versement`
--

DROP TABLE IF EXISTS `versement`;
CREATE TABLE IF NOT EXISTS `versement` (
  `Id_VERSEMENT` int NOT NULL AUTO_INCREMENT,
  `Lib_Versement` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `Montant_Total` decimal(12,2) DEFAULT NULL,
  `Date_Versement` datetime DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`Id_VERSEMENT`)
) ENGINE=MyISAM AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Déchargement des données de la table `versement`
--

INSERT INTO `versement` (`Id_VERSEMENT`, `Lib_Versement`, `Montant_Total`, `Date_Versement`) VALUES
(1, 'Scolarité 2025-2026', 500000.00, '2025-09-01 00:00:00'),
(2, 'Scolarité 2025-2026', 500000.00, '2025-09-01 00:00:00'),
(3, 'Scolarité 2025-2026', 500000.00, '2025-09-01 00:00:00');

-- --------------------------------------------------------

--
-- Structure de la table `verser`
--

DROP TABLE IF EXISTS `verser`;
CREATE TABLE IF NOT EXISTS `verser` (
  `Id_ETUDIANT` int NOT NULL,
  `Id_VERSEMENT` int NOT NULL,
  `Montant` decimal(12,2) DEFAULT NULL,
  `Date_Paiement` datetime DEFAULT CURRENT_TIMESTAMP,
  `Statut` varchar(20) COLLATE utf8mb4_unicode_ci DEFAULT 'Payé',
  PRIMARY KEY (`Id_ETUDIANT`,`Id_VERSEMENT`),
  KEY `Id_VERSEMENT` (`Id_VERSEMENT`)
) ENGINE=MyISAM DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Déchargement des données de la table `verser`
--

INSERT INTO `verser` (`Id_ETUDIANT`, `Id_VERSEMENT`, `Montant`, `Date_Paiement`, `Statut`) VALUES
(1, 1, 250000.00, '2025-10-01 00:00:00', 'Payé'),
(2, 2, 150000.00, '2025-10-05 00:00:00', 'Payé'),
(3, 3, 500000.00, '2025-10-10 00:00:00', 'Payé'),
(1, 2, 250000.00, '2026-01-15 00:00:00', 'Payé'),
(2, 3, 150000.00, '2025-10-05 00:00:00', 'Payé');
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
