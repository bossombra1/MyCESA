import AsyncStorage from '@react-native-async-storage/async-storage';
import * as FileSystem from 'expo-file-system/legacy';
import * as IntentLauncher from 'expo-intent-launcher';
import * as Sharing from 'expo-sharing';
import { Platform } from 'react-native';
import API, { SERVER_URL } from '../api/api';

export const EMPLOIS_RECUS_KEY = '@mycesa/emplois-du-temps-recus';

// Dossier local (persistant) où sont conservés les fichiers pour l'accès hors connexion.
const DOSSIER_LOCAL = `${FileSystem.documentDirectory || ''}emplois-du-temps/`;

/** Retrouve l'extension du fichier (le type MIME sert de repli). */
const extensionDe = (file = {}) => {
  const nom = file.nom_fichier_original || '';
  const point = nom.lastIndexOf('.');
  if (point > 0) return nom.slice(point).toLowerCase();

  const mime = file.type_mime || '';
  if (mime === 'application/pdf') return '.pdf';
  if (mime.startsWith('image/')) return `.${mime.slice('image/'.length)}`;
  if (mime.includes('wordprocessingml')) return '.docx';
  if (mime.includes('spreadsheetml')) return '.xlsx';
  return '';
};

export async function getEmploisRecus() {
  try {
    const value = await AsyncStorage.getItem(EMPLOIS_RECUS_KEY);
    return value ? JSON.parse(value) : [];
  } catch (error) {
    console.log('Lecture des emplois reçus impossible:', error);
    return [];
  }
}

async function preparerDossier() {
  if (!FileSystem.documentDirectory) throw new Error('Stockage local indisponible sur cet appareil.');
  const info = await FileSystem.getInfoAsync(DOSSIER_LOCAL);
  if (!info.exists) await FileSystem.makeDirectoryAsync(DOSSIER_LOCAL, { intermediates: true });
}

export async function saveEmploiDuTemps(file, token) {
  if (!file || !file.id) throw new Error('Fichier de classe invalide.');

  const existants = await getEmploisRecus();

  // Déjà téléchargé et toujours présent : on évite un nouvel appel réseau.
  const dejaRecu = existants.find((item) => item.id === file.id);
  if (dejaRecu && dejaRecu.chemin_local) {
    const info = await FileSystem.getInfoAsync(dejaRecu.chemin_local);
    if (info.exists) return dejaRecu;
  }

  await preparerDossier();
  const cheminLocal = `${DOSSIER_LOCAL}${file.id}${extensionDe(file)}`;

  const resultat = await FileSystem.downloadAsync(
    `${SERVER_URL}/api/emplois-du-temps/${file.id}/download`,
    cheminLocal,
    { headers: token ? { Authorization: `Bearer ${token}` } : {} },
  );

  if (resultat.status !== 200) {
    await FileSystem.deleteAsync(cheminLocal, { idempotent: true });
    throw new Error(`Téléchargement impossible (code ${resultat.status}).`);
  }

  const metadata = { ...file, chemin_local: resultat.uri, downloaded_at: new Date().toISOString() };
  const suivant = [metadata, ...existants.filter((item) => item.id !== file.id)];
  await AsyncStorage.setItem(EMPLOIS_RECUS_KEY, JSON.stringify(suivant));
  return metadata;
}

/**
 * Ouvre un fichier enregistré avec l'application adaptée du téléphone.
 * - Android : FileProvider (getContentUriAsync) + Intent "VIEW" (ex. PDF, Excel, Word).
 * - iOS : feuille de partage / Quick Look.
 */
export async function ouvrirFichierLocal(file) {
  const chemin = file && file.chemin_local;
  if (!chemin) throw new Error('Fichier introuvable sur l’appareil.');

  const info = await FileSystem.getInfoAsync(chemin);
  if (!info.exists) throw new Error('Ce fichier n’est plus présent sur l’appareil. Rechargez votre emploi du temps.');

  const typeMime = file.type_mime || '*/*';

  if (Platform.OS === 'android') {
    // flags: 1 -> FLAG_GRANT_READ_URI_PERMISSION (obligatoire pour un content://)
    const uri = await FileSystem.getContentUriAsync(chemin);
    await IntentLauncher.startActivityAsync('android.intent.action.VIEW', { data: uri, type: typeMime, flags: 1 });
    return;
  }

  if (await Sharing.isAvailableAsync()) {
    await Sharing.shareAsync(chemin, { mimeType: typeMime, UTI: typeMime, dialogTitle: file.nom_fichier_original });
    return;
  }

  throw new Error('Aucune application compatible n’est installée sur cet appareil.');
}

export async function getClasseEtudiant(userId) {
  const response = await API.get(`/etudiants/profil/${userId}`);
  return response.data.Id_CLASSE;
}