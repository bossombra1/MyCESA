import React, { useEffect, useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, ActivityIndicator,
  Alert, RefreshControl, StatusBar
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import API from '../api/api';
import { useTheme } from '../context/ThemeContext';

const VERT   = '#2E7D32';
const ORANGE = '#D84315';

export default function AbsencesScreen() {
  const [data, setData] = useState({ absences: [], totalHeures: 0 });
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const insets = useSafeAreaInsets();
  const { theme, isDark } = useTheme();

  useEffect(() => { loadAbsences(); }, []);

  const loadAbsences = async () => {
    try {
      const stored = await AsyncStorage.getItem('user');
      const user = JSON.parse(stored);
      const response = await API.get(`/absences/etudiant/${user.Id_UTILISATEUR}`);
      setData(response.data);
    } catch (err) {
      Alert.alert('Erreur', 'Impossible de charger les absences');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => { setRefreshing(true); loadAbsences(); };

  const absences = data.absences || [];
  const totalHeures = data.totalHeures || 0;
  const justifiees = absences.filter(a => a.Justifiee).length;
  const nonJustifiees = absences.filter(a => !a.Justifiee).length;
  const seuilAlert = 30;
  const statutGlobal = totalHeures === 0 ? 'ok' : nonJustifiees > seuilAlert ? 'danger' : nonJustifiees > 0 ? 'warning' : 'ok';

  if (loading) return (
    <View style={[styles.center, { backgroundColor: theme.bg }]}>
      <ActivityIndicator size="large" color={VERT} />
    </View>
  );

  return (
    <View style={[styles.wrapper, { backgroundColor: theme.bg }]}>
      <StatusBar barStyle="light-content" backgroundColor={VERT} />
      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[VERT]} />}
        contentContainerStyle={{ paddingBottom: insets.bottom + 24 }}
      >
        {/* HERO */}
        <View style={styles.hero}>
          <View style={styles.decoCircle1} />
          <View style={styles.decoCircle2} />
          <Text style={styles.heroTitre}>📅 Mes Absences</Text>
          <Text style={styles.heroSub}>{absences.length} absence(s) enregistrée(s)</Text>
          <View style={styles.statsRow}>
            <View style={styles.statCard}>
              <Text style={[styles.statVal, { color: ORANGE }]}>{totalHeures}h</Text>
              <Text style={styles.statLabel}>Total</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statCard}>
              <Text style={[styles.statVal, { color: '#10B981' }]}>{justifiees}</Text>
              <Text style={styles.statLabel}>Justifiées</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statCard}>
              <Text style={[styles.statVal, { color: '#EF4444' }]}>{nonJustifiees}</Text>
              <Text style={styles.statLabel}>Non just.</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statCard}>
              <Text style={[styles.statVal, { color: '#60A5FA' }]}>{absences.length}</Text>
              <Text style={styles.statLabel}>Séances</Text>
            </View>
          </View>
        </View>

        {/* ALERTE */}
        {absences.length > 0 && (
          <View style={[styles.alertBox, {
            backgroundColor: statutGlobal === 'ok' ? (isDark ? '#1E3A2F' : '#F0FDF4') : statutGlobal === 'warning' ? (isDark ? '#2D2010' : '#FFFBEB') : (isDark ? '#2D1010' : '#FEF2F2'),
            borderLeftColor: statutGlobal === 'ok' ? VERT : statutGlobal === 'warning' ? '#F59E0B' : '#EF4444',
          }]}>
            <Text style={styles.alertIcon}>{statutGlobal === 'ok' ? '✅' : statutGlobal === 'warning' ? '⚠️' : '🚨'}</Text>
            <Text style={[styles.alertTxt, { color: statutGlobal === 'ok' ? (isDark ? '#4ADE80' : VERT) : statutGlobal === 'warning' ? '#F59E0B' : '#EF4444' }]}>
              {statutGlobal === 'ok' ? 'Excellent ! Aucune absence non justifiée.' : statutGlobal === 'warning' ? `Attention : ${nonJustifiees} absence(s) non justifiée(s).` : `Alerte : Trop d'absences ! Contactez la scolarité.`}
            </Text>
          </View>
        )}

        {/* LISTE */}
        <View style={styles.listContainer}>
          {absences.length === 0 ? (
            <View style={styles.emptyBox}>
              <Text style={styles.emptyIcon}>✅</Text>
              <Text style={[styles.emptyTitre, { color: VERT }]}>Parfait !</Text>
              <Text style={[styles.emptyTxt, { color: theme.textSub }]}>Aucune absence enregistrée</Text>
            </View>
          ) : (
            absences.map((abs, index) => {
              const justif = abs.Justifiee;
              return (
                <View key={index} style={[styles.card, { backgroundColor: theme.card, borderLeftColor: justif ? VERT : ORANGE }]}>
                  <View style={styles.cardTop}>
                    <View style={styles.cardLeft}>
                      <Text style={[styles.cardDate, { color: theme.text }]}>
                        📆 {new Date(abs.Date_absence).toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
                      </Text>
                      <View style={[styles.dureeBadge, { backgroundColor: theme.bg }]}>
                        <Text style={[styles.dureeTxt, { color: theme.textSub }]}>⏱ {abs.Nbre_heure}h d'absence</Text>
                      </View>
                    </View>
                    <View style={[styles.statutBadge, { backgroundColor: justif ? '#D1FAE5' : '#FEE2E2', borderColor: justif ? VERT : ORANGE }]}>
                      <Text style={[styles.statutTxt, { color: justif ? '#065F46' : '#991B1B' }]}>{justif ? '✓ Justifiée' : '✗ Non just.'}</Text>
                    </View>
                  </View>
                  {abs.Saisie_Par && (
                    <View style={[styles.cardFooter, { borderTopColor: theme.cardBorder }]}>
                      <Text style={[styles.cardFooterTxt, { color: theme.textMuted }]}>👤 Saisi par : {abs.Saisie_Par}</Text>
                    </View>
                  )}
                </View>
              );
            })
          )}
        </View>

        {/* CONTACT */}
        {nonJustifiees > 0 && (
          <View style={[styles.contactBox, { backgroundColor: theme.card, borderColor: theme.cardBorder }]}>
            <Text style={[styles.contactTitre, { color: VERT }]}>🏫 Régulariser vos absences</Text>
            <Text style={[styles.contactTxt, { color: theme.textSub }]}>Rendez-vous au service de scolarité muni d'un justificatif.</Text>
            <Text style={[styles.contactTxt, { color: theme.textSub }]}>📞 (+225) 27 21 56 31 74</Text>
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: { flex: 1 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  hero: { backgroundColor: VERT, paddingTop: 20, paddingBottom: 32, paddingHorizontal: 20, borderBottomLeftRadius: 32, borderBottomRightRadius: 32, overflow: 'hidden' },
  decoCircle1: { position: 'absolute', width: 180, height: 180, borderRadius: 90, backgroundColor: 'rgba(255,255,255,0.08)', top: -50, right: -30 },
  decoCircle2: { position: 'absolute', width: 120, height: 120, borderRadius: 60, backgroundColor: 'rgba(255,255,255,0.05)', bottom: -20, left: -20 },
  heroTitre: { color: '#fff', fontSize: 24, fontWeight: '900', marginBottom: 4 },
  heroSub: { color: 'rgba(255,255,255,0.7)', fontSize: 14, marginBottom: 20 },
  statsRow: { flexDirection: 'row', backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: 16, padding: 16, borderWidth: 1, borderColor: 'rgba(255,255,255,0.15)' },
  statCard: { flex: 1, alignItems: 'center' },
  statVal: { fontSize: 20, fontWeight: '900' },
  statLabel: { fontSize: 11, color: 'rgba(255,255,255,0.6)', marginTop: 3 },
  statDivider: { width: 1, backgroundColor: 'rgba(255,255,255,0.15)' },
  alertBox: { marginHorizontal: 16, marginTop: 16, borderRadius: 14, padding: 14, flexDirection: 'row', alignItems: 'center', borderLeftWidth: 4, gap: 10 },
  alertIcon: { fontSize: 20 },
  alertTxt: { flex: 1, fontSize: 13, fontWeight: '600', lineHeight: 18 },
  listContainer: { padding: 16, paddingTop: 12, gap: 12 },
  emptyBox: { alignItems: 'center', marginTop: 60, marginBottom: 20 },
  emptyIcon: { fontSize: 56 },
  emptyTitre: { fontSize: 20, fontWeight: '900', marginTop: 12 },
  emptyTxt: { fontSize: 15, marginTop: 4 },
  card: { borderRadius: 18, padding: 16, elevation: 3, borderLeftWidth: 4, shadowColor: '#000', shadowOffset: { width: 0, height: 3 }, shadowOpacity: 0.07 },
  cardTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  cardLeft: { flex: 1, marginRight: 10 },
  cardDate: { fontSize: 14, fontWeight: '700', marginBottom: 8, textTransform: 'capitalize' },
  dureeBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8, alignSelf: 'flex-start' },
  dureeTxt: { fontSize: 12, fontWeight: '600' },
  statutBadge: { paddingHorizontal: 10, paddingVertical: 6, borderRadius: 10, borderWidth: 1.5, alignItems: 'center', minWidth: 90 },
  statutTxt: { fontSize: 12, fontWeight: '800' },
  cardFooter: { marginTop: 10, paddingTop: 10, borderTopWidth: 1 },
  cardFooterTxt: { fontSize: 12 },
  contactBox: { marginHorizontal: 16, marginTop: 4, borderRadius: 20, padding: 18, elevation: 2, borderWidth: 1 },
  contactTitre: { fontSize: 14, fontWeight: '800', marginBottom: 10 },
  contactTxt: { fontSize: 13, marginBottom: 4, lineHeight: 20 },
});