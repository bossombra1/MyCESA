-- ============================================================
--  MyCESA — Script SQL Complet
--  Base de données : mycesa_db
--  Encodage : utf8mb4_unicode_ci
--  Mars 2026 — Version 1.0
-- ============================================================

CREATE DATABASE IF NOT EXISTS mycesa_db
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE mycesa_db;

-- ============================================================
-- 1. SITE
-- ============================================================
CREATE TABLE SITE (
  Id_SITE         INT AUTO_INCREMENT PRIMARY KEY,
  Nom_Site        VARCHAR(100) NOT NULL,
  Localisation_Site VARCHAR(100),
  Contact_Site    VARCHAR(50)
);

-- ============================================================
-- 2. CYCLE_
-- ============================================================
CREATE TABLE CYCLE_ (
  Id_CYCLE  INT AUTO_INCREMENT PRIMARY KEY,
  Lib_Cycle VARCHAR(50) NOT NULL,
  Id_SITE   INT,
  FOREIGN KEY (Id_SITE) REFERENCES SITE(Id_SITE) ON DELETE SET NULL
);

-- ============================================================
-- 3. FILIERE
-- ============================================================
CREATE TABLE FILIERE (
  Id_FILIERE  INT AUTO_INCREMENT PRIMARY KEY,
  Nom_Filiere VARCHAR(100) NOT NULL,
  Id_CYCLE    INT,
  FOREIGN KEY (Id_CYCLE) REFERENCES CYCLE_(Id_CYCLE) ON DELETE SET NULL
);

-- ============================================================
-- 4. SEMESTRE
-- ============================================================
CREATE TABLE SEMESTRE (
  Id_SEMESTRE              INT AUTO_INCREMENT PRIMARY KEY,
  Lib_Sem                  VARCHAR(50) NOT NULL,
  Annee_Academique_Semestre VARCHAR(20)
);

-- ============================================================
-- 5. SALLE
-- ============================================================
CREATE TABLE SALLE (
  Id_SALLE          INT AUTO_INCREMENT PRIMARY KEY,
  Nom_Salle         VARCHAR(50) NOT NULL,
  Localisation_Salle VARCHAR(100),
  Superficie_Salle  VARCHAR(20)
);

-- ============================================================
-- 6. MATIERE
-- ============================================================
CREATE TABLE MATIERE (
  Id_MATIERE  INT AUTO_INCREMENT PRIMARY KEY,
  Nom_Matiere VARCHAR(100) NOT NULL
);

-- ============================================================
-- 7. ROLE
-- ============================================================
CREATE TABLE ROLE (
  Id_ROLE  INT AUTO_INCREMENT PRIMARY KEY,
  Lib_Role VARCHAR(50) NOT NULL
);

-- ============================================================
-- 8. UTILISATEUR
-- ============================================================
CREATE TABLE UTILISATEUR (
  Id_UTILISATEUR INT AUTO_INCREMENT PRIMARY KEY,
  Nom_User       VARCHAR(100) NOT NULL,
  Login_User     VARCHAR(50)  UNIQUE NOT NULL,
  Email_User     VARCHAR(100) UNIQUE,
  Password_User  VARCHAR(255) NOT NULL,
  Id_ROLE        INT,
  FOREIGN KEY (Id_ROLE) REFERENCES ROLE(Id_ROLE)
);

-- ============================================================
-- 9. CLASSE
-- ============================================================
CREATE TABLE CLASSE (
  Id_CLASSE              INT AUTO_INCREMENT PRIMARY KEY,
  Nom_Classe             VARCHAR(50) NOT NULL,
  Effectif_Prevu_Etudiant INT DEFAULT 0,
  Id_FILIERE             INT,
  FOREIGN KEY (Id_FILIERE) REFERENCES FILIERE(Id_FILIERE)
);

-- ============================================================
-- 10. PROFESSEUR
-- ============================================================
CREATE TABLE PROFESSEUR (
  Id_PROFESSEUR         INT AUTO_INCREMENT PRIMARY KEY,
  Nom_Prenoms_Profe     VARCHAR(100) NOT NULL,
  Tel_Profe             VARCHAR(20),
  Quartier_Profe        VARCHAR(100),
  email_Profe           VARCHAR(100),
  Date_Naissance        DATE
);

-- ============================================================
-- 11. ETUDIANT
-- ============================================================
CREATE TABLE ETUDIANT (
  Id_ETUDIANT                INT AUTO_INCREMENT PRIMARY KEY,
  Matricule_Etudiant         VARCHAR(50) UNIQUE NOT NULL,
  Nom_Etudiant               VARCHAR(50)  NOT NULL,
  Prenoms_Etudiant           VARCHAR(100),
  Genre_Etudiant             VARCHAR(10),
  Tel_Etudiant               VARCHAR(20),
  Email_Etudiant             VARCHAR(100),
  Date_Naissance_Etudiant    DATE,
  Lieu_Naissance_Etudiant    VARCHAR(100),
  Quartier_Etudiant          VARCHAR(100),
  Image_Etudiant             VARCHAR(255),
  Id_CLASSE                  INT,
  Id_FILIERE                 INT,
  FOREIGN KEY (Id_CLASSE) REFERENCES CLASSE(Id_CLASSE),
  FOREIGN KEY (Id_FILIERE) REFERENCES FILIERE(Id_FILIERE) ON DELETE SET NULL
);

-- ============================================================
-- 12. EVALUATION
-- ============================================================
CREATE TABLE EVALUATION (
  Id_EVALUATION  INT AUTO_INCREMENT PRIMARY KEY,
  Lib_Evaluation VARCHAR(100),
  Date_Evaluation DATETIME,
  Coef_Evaluation DECIMAL(4,2),
  Type_Evaluation VARCHAR(50),
  Id_SEMESTRE    INT,
  FOREIGN KEY (Id_SEMESTRE) REFERENCES SEMESTRE(Id_SEMESTRE)
);

-- ============================================================
-- 13. VERSEMENT
-- ============================================================
CREATE TABLE VERSEMENT (
  Id_VERSEMENT     INT AUTO_INCREMENT PRIMARY KEY,
  Lib_Versement    VARCHAR(100),
  Montant_Total    DECIMAL(12,2),
  Date_Versement   DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================
-- 14. PERIODE_EMPLOI_TEMPS
-- ============================================================
CREATE TABLE PERIODE_EMPLOI_TEMPS (
  Id_PERIODE      INT AUTO_INCREMENT PRIMARY KEY,
  Id_CLASSE       INT NOT NULL,
  Type_Periode    VARCHAR(50) NOT NULL,
  Date_Debut      DATE NOT NULL,
  Date_Fin        DATE NOT NULL,
  Nom_Periode     VARCHAR(100),
  Date_Creation   DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (Id_CLASSE) REFERENCES CLASSE(Id_CLASSE) ON DELETE CASCADE,
  UNIQUE KEY unique_periode (Id_CLASSE, Type_Periode, Date_Debut)
);

-- ============================================================
-- 15. EMPLOI_TEMPS
-- ============================================================
CREATE TABLE EMPLOI_TEMPS (
  Id_PROFESSEUR  INT,
  Id_SALLE       INT,
  Id_MATIERE     INT,
  Id_CLASSE      INT,
  Id_PERIODE     INT,
  IdEmploi_Temps VARCHAR(50),
  date_          DATETIME,
  Heure_Debut    TIME,
  Heure_Fin      TIME,
  Jour_Semaine   VARCHAR(20),
  PRIMARY KEY (Id_PROFESSEUR, Id_SALLE, Id_MATIERE, Id_CLASSE, Jour_Semaine, Heure_Debut),
  FOREIGN KEY (Id_PROFESSEUR) REFERENCES PROFESSEUR(Id_PROFESSEUR),
  FOREIGN KEY (Id_SALLE)      REFERENCES SALLE(Id_SALLE),
  FOREIGN KEY (Id_MATIERE)    REFERENCES MATIERE(Id_MATIERE),
  FOREIGN KEY (Id_CLASSE)     REFERENCES CLASSE(Id_CLASSE),
  FOREIGN KEY (Id_PERIODE)    REFERENCES PERIODE_EMPLOI_TEMPS(Id_PERIODE) ON DELETE CASCADE
);

-- ============================================================
-- 15. VERSER (Etudiant <-> Versement)
-- ============================================================
CREATE TABLE VERSER (
  Id_ETUDIANT  INT,
  Id_VERSEMENT INT,
  Montant      DECIMAL(12,2),
  Date_Paiement DATETIME DEFAULT CURRENT_TIMESTAMP,
  Statut       VARCHAR(20) DEFAULT 'Payé',
  PRIMARY KEY (Id_ETUDIANT, Id_VERSEMENT),
  FOREIGN KEY (Id_ETUDIANT)  REFERENCES ETUDIANT(Id_ETUDIANT),
  FOREIGN KEY (Id_VERSEMENT) REFERENCES VERSEMENT(Id_VERSEMENT)
);

-- ============================================================
-- 16. HISTO_VERSEMENT
-- ============================================================
CREATE TABLE HISTO_VERSEMENT (
  Id_HISTO        INT AUTO_INCREMENT PRIMARY KEY,
  Id_VERSEMENT    INT,
  Id_UTILISATEUR  INT,
  Date_Histo      DATETIME DEFAULT CURRENT_TIMESTAMP,
  Action_Histo    VARCHAR(100),
  FOREIGN KEY (Id_VERSEMENT)   REFERENCES VERSEMENT(Id_VERSEMENT),
  FOREIGN KEY (Id_UTILISATEUR) REFERENCES UTILISATEUR(Id_UTILISATEUR)
);

-- ============================================================
-- 17. ABSENTER
-- ============================================================
CREATE TABLE ABSENTER (
  Id_ETUDIANT    INT,
  Id_UTILISATEUR INT,
  Date_absence   DATE,
  Nbre_heure     DECIMAL(4,1),
  Justifiee      TINYINT(1) DEFAULT 0,
  PRIMARY KEY (Id_ETUDIANT, Id_UTILISATEUR, Date_absence),
  FOREIGN KEY (Id_ETUDIANT)    REFERENCES ETUDIANT(Id_ETUDIANT),
  FOREIGN KEY (Id_UTILISATEUR) REFERENCES UTILISATEUR(Id_UTILISATEUR)
);

-- ============================================================
-- 18. EVALUER (Evaluation <-> Classe)
-- ============================================================
CREATE TABLE EVALUER (
  Id_EVALUATION INT,
  Id_CLASSE     INT,
  PRIMARY KEY (Id_EVALUATION, Id_CLASSE),
  FOREIGN KEY (Id_EVALUATION) REFERENCES EVALUATION(Id_EVALUATION),
  FOREIGN KEY (Id_CLASSE)     REFERENCES CLASSE(Id_CLASSE)
);

-- ============================================================
-- 19. NOTATION
-- ============================================================
CREATE TABLE NOTATION (
  Id_ETUDIANT    INT,
  Id_EVALUATION  INT,
  Note_Evaluation DECIMAL(5,2),
  PRIMARY KEY (Id_ETUDIANT, Id_EVALUATION),
  FOREIGN KEY (Id_ETUDIANT)   REFERENCES ETUDIANT(Id_ETUDIANT),
  FOREIGN KEY (Id_EVALUATION) REFERENCES EVALUATION(Id_EVALUATION)
);

-- ============================================================
-- 20. CHAT_BOT
-- ============================================================
CREATE TABLE CHAT_BOT (
  Id_Chat         INT AUTO_INCREMENT PRIMARY KEY,
  Id_ETUDIANT     INT,
  Id_UTILISATEUR  INT,
  Question        TEXT,
  Reponse         TEXT,
  Date_Chat       DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (Id_ETUDIANT)    REFERENCES ETUDIANT(Id_ETUDIANT),
  FOREIGN KEY (Id_UTILISATEUR) REFERENCES UTILISATEUR(Id_UTILISATEUR)
);

-- ============================================================
-- 21. ENSEIGNER (Professeur <-> Matière)
-- ============================================================
CREATE TABLE ENSEIGNER (
  Id_PROFESSEUR INT,
  Id_MATIERE    INT,
  PRIMARY KEY (Id_PROFESSEUR, Id_MATIERE),
  FOREIGN KEY (Id_PROFESSEUR) REFERENCES PROFESSEUR(Id_PROFESSEUR),
  FOREIGN KEY (Id_MATIERE)    REFERENCES MATIERE(Id_MATIERE)
);

-- ============================================================
-- 22. NOTIFICATION
-- ============================================================
CREATE TABLE NOTIFICATION (
  Id_EVENEMENT   INT AUTO_INCREMENT PRIMARY KEY,
  Id_UTILISATEUR INT,
  Titre_Notif    VARCHAR(100),
  Message_Notif  TEXT,
  Lu             TINYINT(1) DEFAULT 0,
  Date_Notif     DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (Id_UTILISATEUR) REFERENCES UTILISATEUR(Id_UTILISATEUR)
);

-- ============================================================
-- DONNÉES INITIALES
-- ============================================================

-- Rôles
INSERT INTO ROLE (Lib_Role) VALUES ('Administrateur'), ('Secrétaire'), ('Professeur'), ('Etudiant');

-- Site principal
INSERT INTO SITE (Nom_Site, Localisation_Site, Contact_Site)
VALUES ('CESA Abidjan', 'Abidjan, Côte d\'Ivoire', '+225 00 00 00 00');

-- Semestres
INSERT INTO SEMESTRE (Lib_Sem, Annee_Academique_Semestre)
VALUES ('Semestre 1', '2025-2026'), ('Semestre 2', '2025-2026');

-- Utilisateur admin par défaut (mot de passe: admin123)
INSERT INTO UTILISATEUR (Nom_User, Login_User, Email_User, Password_User, Id_ROLE)
VALUES ('Administrateur', 'admin', 'admin@mycesa.ci',
  '$2a$12$K.tq6W5FzI/VgYT5kk2vRuTGhN5/dJpgEMAnlGkVVuvK7f2tFdJhC', 1);
