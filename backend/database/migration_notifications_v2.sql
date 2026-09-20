-- Migration : Système de notifications ciblées MyCESA v2
-- Date : 6 avril 2026
-- Description : Ajout du système de ciblage sans modifier la table NOTIFICATION existante

-- Création de la table des contenus de notifications
CREATE TABLE IF NOT EXISTS notification_contents (
  id              INT AUTO_INCREMENT PRIMARY KEY,
  Titre_Notif     VARCHAR(255) NOT NULL,
  Message_Notif   TEXT NOT NULL,
  Type            ENUM('academique','vie_scolaire','finance','autre') DEFAULT 'autre',
  Cible           ENUM('tous','filiere','classe','etudiant') DEFAULT 'tous',
  Id_Filiere      INT NULL,
  Id_Classe       INT NULL,
  Id_Etudiant     INT NULL,
  Scheduled_At    DATETIME NULL,
  Sent_At         DATETIME NULL,
  created_by      INT NULL,
  Date_Notif      DATETIME DEFAULT CURRENT_TIMESTAMP,
  COMMENT = 'Notifications ciblées admin — séparées de la table NOTIFICATION'
);

-- Création de la table des destinataires
CREATE TABLE IF NOT EXISTS notification_recipients (
  id               INT AUTO_INCREMENT PRIMARY KEY,
  id_notification  INT NOT NULL,
  Id_UTILISATEUR   INT NOT NULL,
  Lu               TINYINT(1) DEFAULT 0,
  Date_Lecture     DATETIME NULL,
  Date_Notif       DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (id_notification) REFERENCES notification_contents(id) ON DELETE CASCADE,
  INDEX idx_user   (Id_UTILISATEUR),
  INDEX idx_notif  (id_notification),
  INDEX idx_lu     (Lu)
);

-- Insertion de données de test (optionnel - à supprimer en production)
-- INSERT INTO notification_contents (Titre_Notif, Message_Notif, Type, Cible, created_by)
-- VALUES ('Bienvenue à MyCESA', 'Votre plateforme scolaire est maintenant opérationnelle.', 'autre', 'tous', 1);