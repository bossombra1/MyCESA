import React, { useCallback, useState } from 'react';
import { Alert, Image, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Sharing from 'expo-sharing';
import { getEmploisRecus, ouvrirFichierLocal } from '../utils/emploiTempsFichiers';

const VERT = '#2E7D32';
const isImage = (file) => file.type_mime?.startsWith('image/');

export default function EmploisRecusScreen() {
  const [files, setFiles] = useState([]);
  const insets = useSafeAreaInsets();

  useFocusEffect(useCallback(() => {
    getEmploisRecus().then(setFiles).catch(() => setFiles([]));
  }, []));

  const openFile = async (file) => {
    try {
      await ouvrirFichierLocal(file);
    } catch (error) {
      Alert.alert('Ouverture impossible', error.message || 'Installez une application compatible avec ce format.');
    }
  };

  const shareFile = async (file) => {
    if (!file.chemin_local) return Alert.alert('Fichier introuvable', 'Ce fichier n’est plus présent sur l’appareil.');
    if (!(await Sharing.isAvailableAsync())) return Alert.alert('Partage indisponible', 'Le partage de fichier n’est pas disponible sur cet appareil.');
    try {
      await Sharing.shareAsync(file.chemin_local, { mimeType: file.type_mime, dialogTitle: 'Rendre le fichier accessible' });
    } catch (error) {
      Alert.alert('Partage impossible', error.message || 'Réessayez plus tard.');
    }
  };

  return <View style={styles.container}><ScrollView contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + 24 }]}>
    <Text style={styles.title}>Mes emplois du temps reçus</Text>
    <Text style={styles.subtitle}>Disponibles hors connexion, classés par classe.</Text>
    {files.length === 0 ? <View style={styles.empty}><Text style={styles.emptyIcon}>📂</Text><Text style={styles.emptyTitle}>Aucun fichier enregistré</Text><Text style={styles.emptyText}>Le prochain emploi du temps téléchargé restera disponible ici.</Text></View> : files.map((file) => <View key={file.id} style={styles.card}>
      <TouchableOpacity onPress={() => openFile(file)} activeOpacity={0.8}>
        {isImage(file) ? <Image source={{ uri: file.chemin_local }} style={styles.preview} resizeMode="contain" /> : <View style={styles.filePreview}><Text style={styles.fileIcon}>{file.type_mime === 'application/pdf' ? 'PDF' : 'DOC'}</Text><Text style={styles.openHint}>Ouvrir avec l’application adaptée</Text></View>}
        <Text style={styles.fileName} numberOfLines={2}>{file.nom_fichier_original}</Text>
        <Text style={styles.className}>Classe {file.nom_classe || file.classe_id} · reçu le {new Date(file.created_at).toLocaleDateString('fr-FR')}</Text>
      </TouchableOpacity>
      <TouchableOpacity onPress={() => shareFile(file)} style={styles.downloadButton}><Text style={styles.downloadText}>Télécharger dans les fichiers</Text></TouchableOpacity>
    </View>)}
  </ScrollView></View>;
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F5F7F5' },
  content: { padding: 20 },
  title: { color: '#1E293B', fontSize: 26, fontWeight: '900', marginTop: 12 },
  subtitle: { color: '#64748B', fontSize: 14, marginTop: 6, marginBottom: 20 },
  card: { backgroundColor: '#FFFFFF', borderColor: '#E2E8F0', borderWidth: 1, borderRadius: 16, padding: 14, marginBottom: 14 },
  preview: { width: '100%', height: 190, backgroundColor: '#F8FAFC', borderRadius: 10 },
  filePreview: { height: 140, borderRadius: 10, backgroundColor: '#EFF6FF', alignItems: 'center', justifyContent: 'center' },
  fileIcon: { color: VERT, fontSize: 28, fontWeight: '900' },
  openHint: { color: '#64748B', fontSize: 12, marginTop: 8 },
  fileName: { color: '#1E293B', fontSize: 16, fontWeight: '800', marginTop: 12 },
  className: { color: '#64748B', fontSize: 12, marginTop: 5 },
  downloadButton: { backgroundColor: VERT, borderRadius: 10, padding: 12, alignItems: 'center', marginTop: 14 },
  downloadText: { color: '#FFFFFF', fontWeight: '800' },
  empty: { backgroundColor: '#FFFFFF', borderRadius: 16, padding: 30, alignItems: 'center', marginTop: 30 },
  emptyIcon: { fontSize: 38 }, emptyTitle: { color: '#1E293B', fontWeight: '900', fontSize: 17, marginTop: 10 },
  emptyText: { color: '#64748B', textAlign: 'center', marginTop: 6, lineHeight: 20 },
});