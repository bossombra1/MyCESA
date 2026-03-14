import React, { useEffect, useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, ActivityIndicator,
  Alert, RefreshControl, StatusBar, TouchableOpacity
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../context/ThemeContext';
import API from '../api/api';

const VERT   = '#2E7D32';
const ORANGE = '#D84315';

const JOURS = ['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi'];

const JOUR_COULEURS = {
  Lundi:    { bg: '#EFF6FF', border: '#2563EB', txt: '#1D4ED8' },
  Mardi:    { bg: '#FFF7ED', border: '#EA580C', txt: '#C2410C' },
  Mercredi: { bg: '#F0FDF4', border: VERT,      txt: VERT      },
  Jeudi:    { bg: '#FDF4FF', border: '#9333EA', txt: '#7E22CE' },
  Vendredi: { bg: '#FFF1F2', border: '#E11D48', txt: '#BE123C' },
  Samedi:   { bg: '#FFFBEB', border: '#D97706', txt: '#B45309' },
};

export default function EmploiTempsScreen() {
  const [emploi, setEmploi] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [jourActif, setJourActif] = useState(null);
  const insets = useSafeAreaInsets();
  const { theme } = useTheme();

  useEffect(() => {
    loadEmploi();
    // Sélectionner le jour actuel par défaut
    const today = new Date().getDay();
    const jourMap = { 1: 'Lundi', 2: 'Mardi', 3: 'Mercredi', 4: 'Jeudi', 5: 'Vendredi', 6: 'Samedi' };
    if (jourMap[today]) setJourActif(jourMap[today]);
  }, []);

  const loadEmploi = async () => {
    try {
      const stored = await AsyncStorage.getItem('user');
      const user = JSON.parse(stored);
      const response = await API.get(`/emploiTemps/etudiant/${user.Id_UTILISATEUR}`);
      setEmploi(response.data);
    } catch (err) {
      Alert.alert('Erreur', "Impossible de charger l'emploi du temps");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => { setRefreshing(true); loadEmploi(); };

  // Jours qui ont des cours
  const joursAvecCours = JOURS.filter(j => emploi.some(e => e.Jour_Semaine === j));

  // Cours du jour actif ou tous si pas de filtre
  const coursFiltres = jourActif
    ? emploi.filter(e => e.Jour_Semaine === jourActif)
    : emploi;

  const totalCours = emploi.length;
  const joursActifs = joursAvecCours.length;

  if (loading) return (
    <View style={styles.center}>
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
          <Text style={styles.heroTitre}>🕐 Emploi du Temps</Text>
          <Text style={styles.heroSub}>{totalCours} cours programmé(s)</Text>

          {/* STATS */}
          <View style={styles.statsRow}>
            <View style={styles.statCard}>
              <Text style={[styles.statVal, { color: '#4ADE80' }]}>{totalCours}</Text>
              <Text style={styles.statLabel}>Cours / semaine</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statCard}>
              <Text style={[styles.statVal, { color: '#60A5FA' }]}>{joursActifs}</Text>
              <Text style={styles.statLabel}>Jours de cours</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statCard}>
              <Text style={[styles.statVal, { color: ORANGE }]}>
                {6 - joursActifs}
              </Text>
              <Text style={styles.statLabel}>Jours libres</Text>
            </View>
          </View>
        </View>

        {/* FILTRES JOURS */}
        {joursAvecCours.length > 0 && (
          <ScrollView
            horizontal showsHorizontalScrollIndicator={false}
            style={styles.filtresScroll}
            contentContainerStyle={styles.filtresContent}
          >
            <TouchableOpacity
              style={[styles.filtre, !jourActif && styles.filtreActif]}
              onPress={() => setJourActif(null)}
            >
              <Text style={[styles.filtreTxt, !jourActif && styles.filtreTxtActif]}>Tous</Text>
            </TouchableOpacity>
            {joursAvecCours.map(jour => {
              const col = JOUR_COULEURS[jour];
              const isActif = jourActif === jour;
              return (
                <TouchableOpacity
                  key={jour}
                  style={[styles.filtre, isActif && { backgroundColor: col.border, borderColor: col.border }]}
                  onPress={() => setJourActif(jour)}
                >
                  <Text style={[styles.filtreTxt, isActif && styles.filtreTxtActif]}>{jour}</Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        )}

        {/* CONTENU */}
        {emploi.length === 0 ? (
          <View style={styles.emptyBox}>
            <Text style={styles.emptyIcon}>📭</Text>
            <Text style={styles.emptyTitre}>Aucun cours programmé</Text>
            <Text style={styles.emptyTxt}>L'emploi du temps n'est pas encore disponible</Text>
          </View>
        ) : (
          <View style={styles.listContainer}>
            {jourActif ? (
              // VUE PAR JOUR
              <View>
                <View style={[styles.jourHeader, { borderLeftColor: JOUR_COULEURS[jourActif]?.border || VERT }]}>
                  <Text style={[styles.jourTitre, { color: JOUR_COULEURS[jourActif]?.txt || VERT }]}>
                    {jourActif}
                  </Text>
                  <Text style={styles.jourCount}>{coursFiltres.length} cours</Text>
                </View>
                {coursFiltres
                  .sort((a, b) => (a.Heure_Debut || '').localeCompare(b.Heure_Debut || ''))
                  .map((c, i) => renderCours(c, i, JOUR_COULEURS[jourActif]))}
              </View>
            ) : (
              // VUE TOUS LES JOURS
              JOURS.map(jour => {
                const cours = emploi.filter(e => e.Jour_Semaine === jour);
                if (!cours.length) return null;
                const col = JOUR_COULEURS[jour];
                return (
                  <View key={jour} style={styles.jourSection}>
                    <View style={[styles.jourHeader, { borderLeftColor: col.border }]}>
                      <Text style={[styles.jourTitre, { color: col.txt }]}>{jour}</Text>
                      <Text style={styles.jourCount}>{cours.length} cours</Text>
                    </View>
                    {cours
                      .sort((a, b) => (a.Heure_Debut || '').localeCompare(b.Heure_Debut || ''))
                      .map((c, i) => renderCours(c, i, col, theme))}
                  </View>
                );
              })
            )}
          </View>
        )}

      </ScrollView>
    </View>
  );
}

function renderCours(c, i, col, theme) {
  return (
    <View key={i} style={[styles.card, { backgroundColor: theme.card, borderLeftColor: col?.border || '#2563EB' }]}>
      <View style={styles.cardTop}>
        <View style={styles.cardLeft}>
          <Text style={styles.matiere}>{c.Nom_Matiere || c.Lib_Matiere}</Text>
          <View style={[styles.horaireBadge, { backgroundColor: col?.bg || '#EFF6FF' }]}>
            <Text style={[styles.horaireTxt, { color: col?.txt || '#1D4ED8' }]}>
              ⏰ {c.Heure_Debut} — {c.Heure_Fin}
            </Text>
          </View>
        </View>
        <View style={[styles.jourBadgeMini, { backgroundColor: col?.bg, borderColor: col?.border }]}>
          <Text style={[styles.jourBadgeMiniTxt, { color: col?.txt }]}>
            {(c.Heure_Fin && c.Heure_Debut)
              ? `${Math.round((new Date(`2000-01-01T${c.Heure_Fin}`) - new Date(`2000-01-01T${c.Heure_Debut}`)) / 3600000)}h`
              : '?'}
          </Text>
        </View>
      </View>

      <View style={styles.cardInfos}>
        <View style={styles.infoRow}>
          <Text style={styles.infoIcon}>📍</Text>
          <Text style={[styles.infoTxt, { color: theme.textSub }]}> 
            {c.Nom_Salle}{c.Localisation_Salle ? ` — ${c.Localisation_Salle}` : ''}
          </Text>
        </View>
        <View style={styles.infoRow}>
          <Text style={styles.infoIcon}>👨‍🏫</Text>
          <Text style={[styles.infoTxt, { color: theme.textSub }]}>{c.Nom_Professeur || 'N/A'}</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: { flex: 1, backgroundColor: '#F5F7F5' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },

  hero: {
    backgroundColor: VERT, paddingTop: 20,
    paddingBottom: 32, paddingHorizontal: 20,
    borderBottomLeftRadius: 32, borderBottomRightRadius: 32, overflow: 'hidden',
  },
  decoCircle1: {
    position: 'absolute', width: 180, height: 180, borderRadius: 90,
    backgroundColor: 'rgba(255,255,255,0.08)', top: -50, right: -30,
  },
  decoCircle2: {
    position: 'absolute', width: 120, height: 120, borderRadius: 60,
    backgroundColor: 'rgba(255,255,255,0.05)', bottom: -20, left: -20,
  },
  heroTitre: { color: '#fff', fontSize: 24, fontWeight: '900', marginBottom: 4 },
  heroSub: { color: 'rgba(255,255,255,0.7)', fontSize: 14, marginBottom: 20 },

  statsRow: {
    flexDirection: 'row', backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 16, padding: 16,
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.15)',
  },
  statCard: { flex: 1, alignItems: 'center' },
  statVal: { fontSize: 20, fontWeight: '900' },
  statLabel: { fontSize: 10, color: 'rgba(255,255,255,0.6)', marginTop: 3, textAlign: 'center' },
  statDivider: { width: 1, backgroundColor: 'rgba(255,255,255,0.15)' },

  filtresScroll: { marginTop: 14 },
  filtresContent: { paddingHorizontal: 16, gap: 8 },
  filtre: {
    paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20,
    backgroundColor: '#fff', borderWidth: 1.5, borderColor: '#E2E8F0',
  },
  filtreActif: { backgroundColor: VERT, borderColor: VERT },
  filtreTxt: { fontSize: 13, fontWeight: '600', color: '#64748B' },
  filtreTxtActif: { color: '#fff' },

  listContainer: { padding: 16, paddingTop: 12 },
  jourSection: { marginBottom: 20 },
  jourHeader: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    borderLeftWidth: 4, paddingLeft: 12, marginBottom: 10,
  },
  jourTitre: { fontSize: 17, fontWeight: '900' },
  jourCount: { fontSize: 12, color: '#94A3B8', fontWeight: '600' },

  card: {
    backgroundColor: '#fff', borderRadius: 18, padding: 16,
    elevation: 3, borderLeftWidth: 4, marginBottom: 10,
    shadowColor: '#000', shadowOffset: { width: 0, height: 3 }, shadowOpacity: 0.07,
  },
  cardTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 },
  cardLeft: { flex: 1, marginRight: 10 },
  matiere: { fontSize: 15, fontWeight: '900', color: '#1E293B', marginBottom: 8 },
  horaireBadge: { paddingHorizontal: 10, paddingVertical: 5, borderRadius: 10, alignSelf: 'flex-start' },
  horaireTxt: { fontSize: 13, fontWeight: '700' },
  jourBadgeMini: {
    width: 44, height: 44, borderRadius: 12, justifyContent: 'center',
    alignItems: 'center', borderWidth: 1.5,
  },
  jourBadgeMiniTxt: { fontSize: 14, fontWeight: '900' },
  cardInfos: { gap: 6, borderTopWidth: 1, borderTopColor: '#F1F5F9', paddingTop: 10 },
  infoRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  infoIcon: { fontSize: 14 },
  infoTxt: { fontSize: 13, color: '#475569', fontWeight: '500' },

  emptyBox: { alignItems: 'center', marginTop: 60 },
  emptyIcon: { fontSize: 56 },
  emptyTitre: { fontSize: 20, fontWeight: '900', color: '#1E293B', marginTop: 12 },
  emptyTxt: { fontSize: 14, color: '#64748B', marginTop: 4, textAlign: 'center' },
});