-- Emplois du temps publies sous forme de fichiers.
CREATE TABLE IF NOT EXISTS EMPLOI_DU_TEMPS_FICHIER (
  id INT AUTO_INCREMENT PRIMARY KEY,
  classe_id INT NOT NULL,
  nom_fichier_original VARCHAR(255) NOT NULL,
  type_mime VARCHAR(120) NOT NULL,
  chemin_stockage VARCHAR(500) NOT NULL,
  uploaded_by INT NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_emploi_fichier_classe
    FOREIGN KEY (classe_id) REFERENCES CLASSE(Id_CLASSE) ON DELETE CASCADE,
  CONSTRAINT fk_emploi_fichier_utilisateur
    FOREIGN KEY (uploaded_by) REFERENCES UTILISATEUR(Id_UTILISATEUR) ON DELETE SET NULL,
  INDEX idx_emploi_fichier_classe_date (classe_id, created_at)
);