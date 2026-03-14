import React, { useEffect, useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, ActivityIndicator,
  Alert, TouchableOpacity, RefreshControl, StatusBar, Platform
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import API from '../api/api';
import { useTheme } from '../context/ThemeContext';

export default function NotesScreen() {
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [filtreActif, setFiltreActif] = useState('Tous');
  const insets = useSafeAreaInsets();
  const { theme, isDark } = useTheme();

  useEffect(() => { loadNotes(); }, []);

  const loadNotes = async () => {
    try {
      const stored = await AsyncStorage.getItem('user');
      const user = JSON.parse(stored);
      const response = await API.get(`/evaluations/${user.Id_UTILISATEUR}/notes`);
      setNotes(response.data);
    } catch (err) {
      Alert.alert('Erreur', 'Impossible de charger les notes');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => { setRefreshing(true); loadNotes(); };

  const moyenne = notes.length
    ? (notes.reduce((s, n) => s + parseFloat(n.Note_Evaluation || 0), 0) / notes.length).toFixed(2)
    : null;
  const reussies = notes.filter(n => parseFloat(n.Note_Evaluation) >= 10).length;
  const echouees = notes.filter(n => parseFloat(n.Note_Evaluation) < 10).length;
  const semestres = ['Tous', ...new Set(notes.map(n => n.Lib_Sem || 'N/A'))];
  const notesFiltrees = filtreActif === 'Tous' ? notes : notes.filter(n => (n.Lib_Sem || 'N/A') === filtreActif);

  const getMoyenneColor = (moy) => {
    const m = parseFloat(moy);
    if (m >= 14) return '#10B981';
    if (m >= 10) return '#F59E0B';
    return '#EF4444';
  };

  const getNoteColor = (note) => {
    const n = parseFloat(note);
    if (n >= 14) return { bg: '#D1FAE5', txt: '#065F46', border: '#10B981' };
    if (n >= 10) return { bg: '#FEF3C7', txt: '#92400E', border: '#F59E0B' };
    return { bg: '#FEE2E2', txt: '#991B1B', border: '#EF4444' };
  };

  if (loading) return (
    <View style={[styles.center, { backgroundColor: theme.bg }]}>
      <ActivityIndicator size="large" color="#2563EB" />
    </View>
  );

  return (
    <View style={[styles.wrapper, { backgroundColor: theme.bg }]}>
      <StatusBar barStyle="light-content" backgroundColor="#0F172A" />
      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#2563EB']} />}
        contentContainerStyle={{ paddingBottom: insets.bottom + 24 }}
      >
        {/* HERO */}
        <View style={[styles.hero, { backgroundColor: isDark ? '#1E293B' : '#0F172A' }]}>
          <View style={styles.decoCircle1} />
          <View style={styles.decoCircle2} />
          <Text style={styles.heroTitre}>📝 Mes Notes</Text>
          <Text style={styles.heroSub}>{notes.length} évaluation(s) enregistrée(s)</Text>
          {notes.length > 0 && (
            <View style={styles.statsRow}>
              <View style={styles.statCard}>
                <Text style={[styles.statVal, { color: getMoyenneColor(moyenne) }]}>{moyenne}</Text>
                <Text style={styles.statLabel}>Moyenne</Text>
              </View>
              <View style={styles.statDivider} />
              <View style={styles.statCard}>
                <Text style={[styles.statVal, { color: '#10B981' }]}>{reussies}</Text>
                <Text style={styles.statLabel}>Réussies</Text>
              </View>
              <View style={styles.statDivider} />
              <View style={styles.statCard}>
                <Text style={[styles.statVal, { color: '#EF4444' }]}>{echouees}</Text>
                <Text style={styles.statLabel}>Échouées</Text>
              </View>
              <View style={styles.statDivider} />
              <View style={styles.statCard}>
                <Text style={[styles.statVal, { color: '#60A5FA' }]}>{notes.length}</Text>
                <Text style={styles.statLabel}>Total</Text>
              </View>
            </View>
          )}
        </View>

        {/* MOYENNE */}
        {moyenne && (
          <View style={[styles.moyenneCard, { backgroundColor: theme.card }]}>
            <View style={styles.moyenneRow}>
              <Text style={[styles.moyenneTitre, { color: theme.text }]}>Moyenne générale</Text>
              <Text style={[styles.moyenneVal, { color: getMoyenneColor(moyenne) }]}>{moyenne}/20</Text>
            </View>
            <View style={[styles.progressBg, { backgroundColor: theme.cardBorder }]}>
              <View style={[styles.progressFill, { width: `${(parseFloat(moyenne) / 20) * 100}%`, backgroundColor: getMoyenneColor(moyenne) }]} />
            </View>
            <Text style={[styles.moyenneLabel, { color: theme.textSub }]}>
              {parseFloat(moyenne) >= 14 ? '🏆 Excellent !' : parseFloat(moyenne) >= 10 ? '✅ Passable' : '⚠️ Insuffisant'}
            </Text>
          </View>
        )}

        {/* FILTRES */}
        {semestres.length > 1 && (
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filtresScroll} contentContainerStyle={styles.filtresContent}>
            {semestres.map(sem => (
              <TouchableOpacity
                key={sem}
                style={[styles.filtre, { backgroundColor: theme.card, borderColor: theme.cardBorder }, filtreActif === sem && styles.filtreActif]}
                onPress={() => setFiltreActif(sem)}
              >
                <Text style={[styles.filtreTxt, { color: theme.textSub }, filtreActif === sem && styles.filtreTxtActif]}>{sem}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        )}

        {/* LISTE */}
        <View style={styles.listContainer}>
          {notesFiltrees.length === 0 ? (
            <View style={styles.emptyBox}>
              <Text style={styles.emptyIcon}>📭</Text>
              <Text style={[styles.emptyTxt, { color: theme.textSub }]}>Aucune note pour ce semestre</Text>
            </View>
          ) : (
            notesFiltrees.map((note, index) => {
              const colors = getNoteColor(note.Note_Evaluation);
              const n = parseFloat(note.Note_Evaluation);
              return (
                <View key={index} style={[styles.card, { backgroundColor: theme.card, borderLeftColor: colors.border }]}>
                  <View style={styles.cardTop}>
                    <View style={styles.cardLeft}>
                      <Text style={[styles.matiere, { color: theme.text }]}>{note.Lib_Evaluation}</Text>
                      <View style={styles.cardBadges}>
                        {note.Type_Evaluation && (
                          <View style={styles.typeBadge}>
                            <Text style={styles.typeBadgeTxt}>{note.Type_Evaluation}</Text>
                          </View>
                        )}
                        {note.Coef_Evaluation && (
                          <View style={styles.coefBadge}>
                            <Text style={styles.coefBadgeTxt}>Coef. {note.Coef_Evaluation}</Text>
                          </View>
                        )}
                      </View>
                    </View>
                    <View style={[styles.noteBadge, { backgroundColor: colors.bg, borderColor: colors.border }]}>
                      <Text style={[styles.noteVal, { color: colors.txt }]}>{note.Note_Evaluation}</Text>
                      <Text style={[styles.noteSur, { color: colors.txt }]}>/20</Text>
                    </View>
                  </View>
                  <View style={[styles.noteBarBg, { backgroundColor: theme.cardBorder }]}>
                    <View style={[styles.noteBarFill, { width: `${(n / 20) * 100}%`, backgroundColor: colors.border }]} />
                  </View>
                  <View style={styles.cardBottom}>
                    <Text style={[styles.cardInfo, { color: theme.textMuted }]}>📅 {note.Date_Evaluation ? new Date(note.Date_Evaluation).toLocaleDateString('fr-FR') : 'N/A'}</Text>
                    <Text style={[styles.cardInfo, { color: theme.textMuted }]}>📚 {note.Lib_Sem || 'N/A'}</Text>
                  </View>
                </View>
              );
            })
          )}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: { flex: 1 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  hero: {
    paddingTop: 20, paddingBottom: 32, paddingHorizontal: 20,
    borderBottomLeftRadius: 32, borderBottomRightRadius: 32, overflow: 'hidden',
  },
  decoCircle1: { position: 'absolute', width: 180, height: 180, borderRadius: 90, backgroundColor: 'rgba(37,99,235,0.12)', top: -50, right: -30 },
  decoCircle2: { position: 'absolute', width: 120, height: 120, borderRadius: 60, backgroundColor: 'rgba(37,99,235,0.08)', bottom: -20, left: -20 },
  heroTitre: { color: '#fff', fontSize: 24, fontWeight: '900', marginBottom: 4 },
  heroSub: { color: '#64748B', fontSize: 14, marginBottom: 20 },
  statsRow: { flexDirection: 'row', backgroundColor: 'rgba(255,255,255,0.07)', borderRadius: 16, padding: 16, borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)' },
  statCard: { flex: 1, alignItems: 'center' },
  statVal: { fontSize: 20, fontWeight: '900' },
  statLabel: { fontSize: 11, color: '#64748B', marginTop: 3 },
  statDivider: { width: 1, backgroundColor: 'rgba(255,255,255,0.1)' },
  moyenneCard: { marginHorizontal: 16, marginTop: 16, borderRadius: 20, padding: 18, elevation: 4, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.08 },
  moyenneRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
  moyenneTitre: { fontSize: 14, fontWeight: '700' },
  moyenneVal: { fontSize: 22, fontWeight: '900' },
  progressBg: { height: 8, borderRadius: 8, overflow: 'hidden' },
  progressFill: { height: '100%', borderRadius: 8 },
  moyenneLabel: { fontSize: 12, marginTop: 6, textAlign: 'right' },
  filtresScroll: { marginTop: 14 },
  filtresContent: { paddingHorizontal: 16, gap: 8 },
  filtre: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20, borderWidth: 1.5 },
  filtreActif: { backgroundColor: '#2563EB', borderColor: '#2563EB' },
  filtreTxt: { fontSize: 13, fontWeight: '600' },
  filtreTxtActif: { color: '#fff' },
  listContainer: { padding: 16, paddingTop: 12, gap: 12 },
  emptyBox: { alignItems: 'center', marginTop: 60 },
  emptyIcon: { fontSize: 48 },
  emptyTxt: { fontSize: 16, marginTop: 12 },
  card: { borderRadius: 18, padding: 16, elevation: 3, borderLeftWidth: 4, shadowColor: '#000', shadowOffset: { width: 0, height: 3 }, shadowOpacity: 0.07 },
  cardTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 },
  cardLeft: { flex: 1, marginRight: 12 },
  matiere: { fontSize: 15, fontWeight: '800', marginBottom: 6 },
  cardBadges: { flexDirection: 'row', gap: 6, flexWrap: 'wrap' },
  typeBadge: { backgroundColor: '#EFF6FF', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 8 },
  typeBadgeTxt: { fontSize: 11, color: '#2563EB', fontWeight: '600' },
  coefBadge: { backgroundColor: '#F5F3FF', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 8 },
  coefBadgeTxt: { fontSize: 11, color: '#7C3AED', fontWeight: '600' },
  noteBadge: { alignItems: 'center', justifyContent: 'center', paddingHorizontal: 14, paddingVertical: 8, borderRadius: 14, borderWidth: 1.5, minWidth: 70 },
  noteVal: { fontSize: 22, fontWeight: '900' },
  noteSur: { fontSize: 11, fontWeight: '600' },
  noteBarBg: { height: 5, borderRadius: 5, overflow: 'hidden', marginBottom: 10 },
  noteBarFill: { height: '100%', borderRadius: 5 },
  cardBottom: { flexDirection: 'row', justifyContent: 'space-between' },
  cardInfo: { fontSize: 12 },
});