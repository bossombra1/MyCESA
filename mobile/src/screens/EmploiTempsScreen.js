import React, { useCallback, useState } from 'react';
import { ActivityIndicator, Alert, RefreshControl, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import API from '../api/api';
import { getClasseEtudiant, getEmploisRecus, ouvrirFichierLocal, saveEmploiDuTemps } from '../utils/emploiTempsFichiers';

const VERT = '#2E7D32';

export default function EmploiTempsScreen({ navigation }) {
  const [active, setActive] = useState(null);
  const [localFiles, setLocalFiles] = useState([]);
  const [erreur, setErreur] = useState('');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const insets = useSafeAreaInsets();

  const load = useCallback(async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true); else setLoading(true);

    try {
      const storedUser = await AsyncStorage.getItem('user');
      const user = storedUser ? JSON.parse(storedUser) : null;
      if (!user?.Id_UTILISATEUR) throw new Error('Session expirée, reconnectez-vous.');

      const classeId = await getClasseEtudiant(user.Id_UTILISATEUR);
      const response = await API.get('/emplois-du-temps', { params: { classe_id: classeId } });
      const fichier = response.data?.actif;

      if (fichier) {
        const token = await AsyncStorage.getItem('token');
        // Le fichier actif est systématiquement conservé pour l'accès hors connexion.
        const local = await saveEmploiDuTemps(fichier, token);
        setActive(local);
        setErreur('');
      } else {
        setActive(null);
        setErreur('Votre administration n’a pas encore publié l’emploi du temps de votre classe.');
      }
    } catch (error) {
      // Hors connexion (ou API indisponible) : on affiche la dernière version enregistrée.
      const enregistres = await getEmploisRecus();
      setActive((actuel) => actuel || enregistres[0] || null);
      setErreur(enregistres.length
        ? 'Hors connexion : dernière version enregistrée affichée.'
        : (error.message || 'Impossible de charger votre emploi du temps.'));
    } finally {
      setLocalFiles(await getEmploisRecus());
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useFocusEffect(useCallback(() => { load(); }, [load]));

  const ouvrir = async () => {
    if (!active) return;
    try {
      await ouvrirFichierLocal(active);
    } catch (error) {
      Alert.alert('Ouverture impossible', error.message || 'Aucune application compatible trouvée sur cet appareil.');
    }
  };

  const voirBibliotheque = () => navigation.navigate('EmploisRecus');

  return <View style={styles.container}><ScrollView refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => load(true)} colors={[VERT]} />} contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + 30 }]}>
    <View style={styles.hero}><Text style={styles.eyebrow}>DOCUMENT DE CLASSE</Text><Text style={styles.title}>Mon emploi du temps</Text><Text style={styles.subtitle}>Le dernier fichier est automatiquement conservé sur votre téléphone.</Text></View>
    {erreur ? <View style={styles.info}><Text style={styles.infoText}>{erreur}</Text></View> : null}
    {loading ? <ActivityIndicator color={VERT} size="large" style={styles.loader} /> : active ? <View style={styles.card}><Text style={styles.fileBadge}>{active.type_mime?.split('/').pop()?.toUpperCase()}</Text><Text style={styles.fileName} numberOfLines={2}>{active.nom_fichier_original}</Text><Text style={styles.meta}>Classe {active.nom_classe || active.classe_id}</Text><Text style={styles.meta}>Enregistré pour l’accès hors connexion</Text><TouchableOpacity style={styles.primary} onPress={ouvrir}><Text style={styles.primaryText}>Ouvrir mon fichier</Text></TouchableOpacity></View> : <View style={styles.empty}><Text style={styles.emptyIcon}>{'\u{1F4ED}'}</Text><Text style={styles.emptyTitle}>Aucun fichier reçu</Text><Text style={styles.meta}>Votre administration n’a pas encore publié l’emploi du temps de votre classe.</Text></View>}
    <TouchableOpacity style={styles.library} onPress={voirBibliotheque}><View><Text style={styles.libraryTitle}>Mes emplois du temps reçus</Text><Text style={styles.meta}>{localFiles.length} fichier(s) conservé(s) localement</Text></View><Text style={styles.arrow}>›</Text></TouchableOpacity>
  </ScrollView></View>;
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F5F7F5' }, content: { padding: 20 },
  hero: { backgroundColor: VERT, borderRadius: 22, padding: 22, marginBottom: 18 },
  eyebrow: { color: '#BBF7D0', fontSize: 11, fontWeight: '900', letterSpacing: 1.4 },
  title: { color: '#FFFFFF', fontSize: 27, fontWeight: '900', marginTop: 8 },
  subtitle: { color: '#DCFCE7', fontSize: 14, lineHeight: 20, marginTop: 8 },
  loader: { marginTop: 40 },
  card: { backgroundColor: '#FFFFFF', borderColor: '#E2E8F0', borderWidth: 1, borderRadius: 16, padding: 18 },
  fileBadge: { color: VERT, fontWeight: '900', fontSize: 13 }, fileName: { color: '#1E293B', fontSize: 18, fontWeight: '900', marginTop: 10 },
  meta: { color: '#64748B', fontSize: 13, lineHeight: 19, marginTop: 6 },
  primary: { backgroundColor: VERT, borderRadius: 10, alignItems: 'center', padding: 13, marginTop: 18 }, primaryText: { color: '#FFFFFF', fontWeight: '900' },
  empty: { backgroundColor: '#FFFFFF', borderRadius: 16, padding: 28, alignItems: 'center' }, emptyIcon: { fontSize: 36 }, emptyTitle: { color: '#1E293B', fontSize: 17, fontWeight: '900', marginTop: 10 },
  library: { backgroundColor: '#FFFFFF', borderColor: '#E2E8F0', borderWidth: 1, borderRadius: 16, padding: 17, marginTop: 16, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }, libraryTitle: { color: '#1E293B', fontWeight: '900', fontSize: 16 }, arrow: { color: VERT, fontSize: 30, fontWeight: '300' },
  info: { backgroundColor: '#FFF7ED', borderColor: '#FED7AA', borderWidth: 1, borderRadius: 12, padding: 13, marginBottom: 14 },
  infoText: { color: '#9A3412', fontSize: 13, lineHeight: 19, fontWeight: '600' },
});
