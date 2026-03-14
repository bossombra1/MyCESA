import React, { useEffect, useState } from 'react';
import {
  View, Text, StyleSheet, FlatList, TouchableOpacity,
  ActivityIndicator, StatusBar, RefreshControl, Platform
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../../context/ThemeContext';
import API from '../../api/api';

const VERT   = '#2E7D32';
const ORANGE = '#D84315';

export default function MesEtudiantsScreen({ navigation }) {
  const [etudiants, setEtudiants] = useState([]);
  const [prof,      setProf]      = useState(null);
  const [loading,   setLoading]   = useState(true);
  const [refresh,   setRefresh]   = useState(false);
  const insets   = useSafeAreaInsets();
  const themeCtx = useTheme();
  const theme    = themeCtx?.theme || {
    bg: '#F5F7F5', card: '#FFFFFF', cardBorder: '#E2E8F0',
    text: '#1E293B', textSub: '#64748B', textMuted: '#94A3B8',
  };

  useEffect(() => { loadData(); }, []);

  const loadData = async () => {
    try {
      const stored = await AsyncStorage.getItem('user');
      const u      = JSON.parse(stored);
      setProf(u);
      const res = await API.get(`/etudiants/par-prof/${u.Id_UTILISATEUR}`);
      setEtudiants(res.data);
    } catch (err) {
      console.log('Erreur étudiants:', err);
    } finally {
      setLoading(false);
      setRefresh(false);
    }
  };

  if (loading) return (
    <View style={[styles.center, { backgroundColor: theme.bg }]}>
      <ActivityIndicator size="large" color={VERT} />
    </View>
  );

  return (
    <View style={[styles.wrapper, { backgroundColor: theme.bg }]}>
      <StatusBar barStyle="light-content" backgroundColor={VERT} />
      <FlatList
        data={etudiants}
        keyExtractor={item => `etu-${item.Id_ETUDIANT}`}
        refreshControl={<RefreshControl refreshing={refresh} onRefresh={() => { setRefresh(true); loadData(); }} colors={[VERT]} />}
        ListHeaderComponent={() => (
          <View style={styles.hero}>
            <View style={styles.deco1} />
            <View style={styles.deco2} />
            <Text style={styles.heroTitre}>🎓 Mes Étudiants</Text>
            <Text style={styles.heroSub}>{etudiants.length} étudiant(s)</Text>
          </View>
        )}
        contentContainerStyle={{ paddingBottom: insets.bottom + 24 }}
        ListEmptyComponent={() => (
          <View style={[styles.emptyBox, { backgroundColor: theme.card, margin: 16 }]}>
            <Text style={styles.emptyIcon}>👥</Text>
            <Text style={[styles.emptyTitre, { color: theme.text }]}>Aucun étudiant</Text>
            <Text style={[styles.emptyTxt, { color: theme.textSub }]}>Aucun étudiant assigné pour l'instant</Text>
          </View>
        )}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={[styles.card, { backgroundColor: theme.card, borderColor: theme.cardBorder }]}
            onPress={() => navigation.navigate('SaisieNotes', { etudiant: item })}
            activeOpacity={0.85}
          >
            <View style={[styles.avatar, { backgroundColor: VERT + '20' }]}>
              <Text style={[styles.avatarTxt, { color: VERT }]}>
                {item.Nom_Etudiant?.charAt(0)?.toUpperCase()}
              </Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={[styles.nom, { color: theme.text }]}>
                {item.Nom_Etudiant} {item.Prenoms_Etudiant}
              </Text>
              <Text style={[styles.matricule, { color: theme.textSub }]}>
                📋 {item.Matricule_Etudiant}
              </Text>
            </View>
            <View style={[styles.noteBtn, { backgroundColor: VERT }]}>
              <Text style={styles.noteBtnTxt}>📝 Notes</Text>
            </View>
          </TouchableOpacity>
        )}
        ItemSeparatorComponent={() => <View style={{ height: 10 }} />}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: { flex: 1 },
  center:  { flex: 1, justifyContent: 'center', alignItems: 'center' },
  hero: {
    backgroundColor: VERT,
    paddingTop: Platform.OS === 'ios' ? 20 : (StatusBar.currentHeight || 24) + 16,
    paddingBottom: 28, paddingHorizontal: 20,
    borderBottomLeftRadius: 32, borderBottomRightRadius: 32,
    overflow: 'hidden', marginBottom: 16,
  },
  deco1: { position: 'absolute', width: 180, height: 180, borderRadius: 90, backgroundColor: 'rgba(255,255,255,0.07)', top: -50, right: -30 },
  deco2: { position: 'absolute', width: 120, height: 120, borderRadius: 60, backgroundColor: 'rgba(255,255,255,0.05)', bottom: -20, left: -20 },
  heroTitre: { color: '#fff', fontSize: 24, fontWeight: '900', marginBottom: 4 },
  heroSub:   { color: 'rgba(255,255,255,0.75)', fontSize: 14 },
  card: { flexDirection: 'row', alignItems: 'center', marginHorizontal: 16, borderRadius: 16, padding: 14, borderWidth: 1, elevation: 2, gap: 12 },
  avatar:    { width: 48, height: 48, borderRadius: 24, justifyContent: 'center', alignItems: 'center' },
  avatarTxt: { fontSize: 20, fontWeight: '900' },
  nom:       { fontSize: 15, fontWeight: '800', marginBottom: 3 },
  matricule: { fontSize: 12 },
  noteBtn:   { paddingHorizontal: 12, paddingVertical: 7, borderRadius: 12 },
  noteBtnTxt:{ color: '#fff', fontSize: 12, fontWeight: '700' },
  emptyBox:  { borderRadius: 16, padding: 32, alignItems: 'center' },
  emptyIcon: { fontSize: 48, marginBottom: 12 },
  emptyTitre:{ fontSize: 16, fontWeight: '800', marginBottom: 4 },
  emptyTxt:  { fontSize: 13, textAlign: 'center' },
});