-- phpMyAdmin SQL Dump
-- version 5.2.3
-- https://www.phpmyadmin.net/
--
-- Hôte : 127.0.0.1:3306
-- Généré le : mer. 11 mars 2026 à 18:18
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
) ENGINE=MyISAM AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Déchargement des données de la table `chat_bot`
--

INSERT INTO `chat_bot` (`Id_Chat`, `Id_ETUDIANT`, `Id_UTILISATEUR`, `Question`, `Reponse`, `Date_Chat`) VALUES
(1, 2, 2, 'comment tu vas?', 'Je n\'ai pas compris ta question. Tu peux me demander des informations sur : tes notes 📝, tes absences 📅, tes paiements 💰 ou ton emploi du temps 🕐. Tu peux aussi contacter le secrétariat directement.', '2026-03-08 18:13:25'),
(2, 2, 2, 'j\'ai combien d\'heure d\'abscence', 'Je n\'ai pas compris ta question. Tu peux me demander des informations sur : tes notes 📝, tes absences 📅, tes paiements 💰 ou ton emploi du temps 🕐. Tu peux aussi contacter le secrétariat directement.', '2026-03-08 18:13:49'),
(3, 2, 2, 'notes', 'Pour consulter tes notes, va dans la section \"Mes Notes\" depuis le menu principal. Tu y trouveras toutes tes évaluations et ta moyenne par matière.', '2026-03-09 00:07:58'),
(4, 2, 2, 'merci', 'Avec plaisir ! N\'hésite pas si tu as d\'autres questions. Bonne journée ! 😊', '2026-03-09 00:08:18');

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
) ENGINE=MyISAM DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

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
) ENGINE=MyISAM DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Structure de la table `emploi_temps`
--

DROP TABLE IF EXISTS `emploi_temps`;
CREATE TABLE IF NOT EXISTS `emploi_temps` (
  `Id_PROFESSEUR` int NOT NULL,
  `Id_SALLE` int NOT NULL,
  `Id_MATIERE` int NOT NULL,
  `Id_CLASSE` int NOT NULL,
  `IdEmploi_Temps` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `date_` datetime DEFAULT NULL,
  `Heure_Debut` time DEFAULT NULL,
  `Heure_Fin` time DEFAULT NULL,
  `Jour_Semaine` varchar(20) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  PRIMARY KEY (`Id_PROFESSEUR`,`Id_SALLE`,`Id_MATIERE`,`Id_CLASSE`),
  KEY `Id_SALLE` (`Id_SALLE`),
  KEY `Id_MATIERE` (`Id_MATIERE`),
  KEY `Id_CLASSE` (`Id_CLASSE`)
) ENGINE=MyISAM DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

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
) ENGINE=MyISAM DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

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
) ENGINE=MyISAM DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

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
) ENGINE=MyISAM DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

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
) ENGINE=MyISAM DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

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
) ENGINE=MyISAM DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

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
) ENGINE=MyISAM DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

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
  PRIMARY KEY (`Id_UTILISATEUR`),
  UNIQUE KEY `Login_User` (`Login_User`),
  UNIQUE KEY `Email_User` (`Email_User`),
  KEY `Id_ROLE` (`Id_ROLE`)
) ENGINE=MyISAM AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Déchargement des données de la table `utilisateur`
--

INSERT INTO `utilisateur` (`Id_UTILISATEUR`, `Nom_User`, `Login_User`, `Email_User`, `Password_User`, `Id_ROLE`) VALUES
(2, 'Administrateur', 'admin', 'admin@mycesa.ci', '$2b$12$gSmP3CiRTE3PpVywXGzUpeGt7IaYlNfrhGqexU75W2CxCz7h1Ob2a', 1);

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
) ENGINE=MyISAM DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

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
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
