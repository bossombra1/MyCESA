-- Migration: Ajout de la gestion des périodes d'emploi du temps
-- Date: 2026-03-16
-- Description: Crée la nouvelle table PERIODE_EMPLOI_TEMPS et modifie EMPLOI_TEMPS

-- 1. Créer la table des périodes
CREATE TABLE IF NOT EXISTS PERIODE_EMPLOI_TEMPS (
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

-- 2. Ajouter la colonne Id_PERIODE à EMPLOI_TEMPS si elle n'existe pas
ALTER TABLE EMPLOI_TEMPS ADD COLUMN Id_PERIODE INT DEFAULT NULL;

-- 3. Ajouter la contrainte de clé étrangère
ALTER TABLE EMPLOI_TEMPS 
ADD CONSTRAINT fk_emploi_temps_periode 
FOREIGN KEY (Id_PERIODE) REFERENCES PERIODE_EMPLOI_TEMPS(Id_PERIODE) ON DELETE CASCADE;

-- 4. Modifier la clé primaire d'EMPLOI_TEMPS si nécessaire
-- (Déjà fait dans le schéma, mais on peut vérifier)
ALTER TABLE EMPLOI_TEMPS MODIFY PRIMARY KEY (Id_PROFESSEUR, Id_SALLE, Id_MATIERE, Id_CLASSE, Jour_Semaine, Heure_Debut);
