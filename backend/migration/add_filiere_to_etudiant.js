// migration/add_filiere_to_etudiant.js
const mysql = require('mysql2/promise');

async function migrate() {
  const connection = await mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'mycesa_db'
  });

  try {
    console.log('Migration: Ajout du champ Id_FILIERE à ETUDIANT...');
    
    // Vérifier si la colonne existe déjà
    const [columns] = await connection.query(
      `SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS 
       WHERE TABLE_NAME = 'ETUDIANT' AND COLUMN_NAME = 'Id_FILIERE'`
    );

    if (columns.length === 0) {
      await connection.query(
        'ALTER TABLE ETUDIANT ADD COLUMN Id_FILIERE INT AFTER Id_CLASSE'
      );
      console.log('✓ Colonne Id_FILIERE ajoutée');

      await connection.query(
        'ALTER TABLE ETUDIANT ADD FOREIGN KEY (Id_FILIERE) REFERENCES FILIERE(Id_FILIERE) ON DELETE SET NULL'
      );
      console.log('✓ Clé étrangère ajoutée');
    } else {
      console.log('✓ Colonne Id_FILIERE existe déjà');
    }

    console.log('Migration terminée avec succès!');
  } catch (error) {
    console.error('Erreur lors de la migration:', error.message);
  } finally {
    await connection.end();
  }
}

migrate();
