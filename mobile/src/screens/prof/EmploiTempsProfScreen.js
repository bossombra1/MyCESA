import React, { useEffect, useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, ActivityIndicator,
  Alert, RefreshControl, StatusBar, TouchableOpacity, Platform
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
// On ajoute "../" pour remonter d'un cran de plus (sortir de 'prof', puis sortir de 'screens')
import { useTheme } from '../../context/ThemeContext';
import API from '../../api/api';

const VERT   = '#2E7D32';
const ORANGE = '#D84315';

const JOURS_FR  = ['Dimanche','Lundi','Mardi','Mercredi','Jeudi','Vendredi','Samedi'];
const MOIS_FR   = ['Jan','Fév','Mar','Avr','Mai','Jun','Jul','Aoû','Sep','Oct','Nov','Déc'];
const MOIS_LONG = ['Janvier','Février','Mars','Avril','Mai','Juin','Juillet','Août','Septembre','Octobre','Novembre','Décembre'];
const JOURS_CAL = ['D','L','M','M','J','V','S'];

const JOUR_COULEURS = {
  Lundi:    { bg: '#EFF6FF', border: '#2563EB', txt: '#1D4ED8' },
  Mardi:    { bg: '#FFF7ED', border: '#EA580C', txt: '#C2410C' },
  Mercredi: { bg: '#F0FDF4', border: VERT,      txt: VERT      },
  Jeudi:    { bg: '#FDF4FF', border: '#9333EA', txt: '#7E22CE' },
  Vendredi: { bg: '#FFF1F2', border: '#E11D48', txt: '#BE123C' },
  Samedi:   { bg: '#FFFBEB', border: '#D97706', txt: '#B45309' },
};

const toDateStr = (date) => {
  const d = new Date(date);
  return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
};

// ── COMPOSANT CARTE (Style identique à l'étudiant) ──
function CoursCard({ cours, col, theme }) {
  return (
    <View style={[styles.card, { backgroundColor: theme.card, borderLeftColor: col?.border || '#2563EB' }]}>
      <View style={styles.cardTop}>
        <View style={styles.cardLeft}>
          <Text style={[styles.matiere, { color: theme.text }]}>
            {cours.Nom_Matiere || 'Cours'}
          </Text>
          <Text style={[styles.cardDate, { color: theme.textMuted }]}>
             Classe : {cours.Nom_Classe || 'N/A'}
          </Text>
        </View>
        <View style={styles.montantBox}>
          <Text style={[styles.heureVal, { color: col?.txt || VERT }]}>
            {cours.Heure_Debut?.substring(0,5)}
          </Text>
          <Text style={[styles.heureDevise, { color: theme.textSub }]}>
             Début
          </Text>
        </View>
      </View>
      <View style={[styles.cardFooter, { borderTopColor: theme.cardBorder }]}>
        <View style={[styles.horaireBadge, { backgroundColor: col?.bg || '#EFF6FF' }]}>
          <Text style={[styles.horaireTxt, { color: col?.txt || '#1D4ED8' }]}>
            ⏰ {cours.Heure_Debut} — {cours.Heure_Fin}
          </Text>
        </View>
        <View style={styles.infoRight}>
          <Text style={[styles.infoTxt, { color: theme.textSub }]}>
            📍 {cours.Nom_Salle || 'N/A'}
          </Text>
        </View>
      </View>
    </View>
  );
}

export default function EmploiTempsProfScreen() {
  const [emploi,  setEmploi]  = useState([]);
  const [loading, setLoading] = useState(false);
  const [refresh, setRefresh] = useState(false);
  const [vue,     setVue]     = useState('jour');
  const [dateRef, setDateRef] = useState(new Date());
  const insets   = useSafeAreaInsets();
  const themeCtx = useTheme();
  const theme    = themeCtx?.theme || {
    bg: '#F5F7F5', card: '#FFFFFF', cardBorder: '#E2E8F0',
    text: '#1E293B', textSub: '#64748B', textMuted: '#94A3B8',
  };

  useEffect(() => {
    loadEmploi();
  }, [dateRef]); // Recharge quand la date change

  const loadEmploi = async () => {
    setLoading(true);
    try {
      const stored = await AsyncStorage.getItem('user');
      if (!stored) return;
      const user = JSON.parse(stored);
      
      // ID du prof (On suppose qu'il est stocké dans Id_PROFESSEUR ou Id_UTILISATEUR)
      const idProf = user.Id_PROFESSEUR || user.Id_UTILISATEUR;
      const formattedDate = toDateStr(dateRef);

      console.log(`📅 Chargement pour ID Prof: ${idProf} à la date: ${formattedDate}`);

      // APPEL À LA ROUTE BACKEND PROFESSEUR AVEC DATE
      const res = await API.get(`/emploiTemps/professeur/${idProf}?date=${formattedDate}`);
      
      setEmploi(res.data);
    } catch (err) {
      console.error(err);
      Alert.alert('Erreur', "Impossible de charger l'emploi du temps");
    } finally {
      setLoading(false);
      setRefresh(false);
    }
  };

  const naviguer = (sens) => {
    const d = new Date(dateRef);
    d.setDate(d.getDate() + sens);
    setDateRef(d);
  };

  const getNavLabel = () => {
    return dateRef.toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' });
  };

  return (
    <View style={[styles.wrapper, { backgroundColor: theme.bg }]}>
      <StatusBar barStyle="light-content" backgroundColor={VERT} />
      
      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refresh} onRefresh={() => loadEmploi()} colors={[VERT]} />}
        contentContainerStyle={{ paddingBottom: insets.bottom + 24 }}
      >
        {/* HERO */}
        <View style={styles.hero}>
          <View style={styles.decoCircle1} />
          <View style={styles.decoCircle2} />
          <Text style={styles.heroTitre}>🕐 Mon Emploi du Temps</Text>
          <Text style={styles.heroSub}>Gestion de vos cours par journée</Text>
          
          <View style={styles.statsRow}>
            <View style={styles.statCard}>
              <Text style={[styles.statVal, { color: '#4ADE80' }]}>{emploi.length}</Text>
              <Text style={styles.statLabel}>Cours aujourd'hui</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statCard}>
               <Text style={[styles.statVal, { color: ORANGE }]}>Prof</Text>
               <Text style={styles.statLabel}>Espace Enseignant</Text>
            </View>
          </View>
        </View>

        {/* NAVIGATION DATE */}
        <View style={[styles.progressCard, { backgroundColor: theme.card }]}>
          <View style={styles.navRow}>
            <TouchableOpacity style={styles.navBtn} onPress={() => naviguer(-1)}>
              <Text style={[styles.navBtnTxt, { color: VERT }]}>‹</Text>
            </TouchableOpacity>
            <TouchableOpacity style={{ alignItems: 'center', flex: 1 }} onPress={() => setDateRef(new Date())}>
              <Text style={[styles.navLabel, { color: theme.text }]} numberOfLines={1}>{getNavLabel()}</Text>
              <Text style={[styles.navReset, { color: VERT }]}>↩ Aujourd'hui</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.navBtn} onPress={() => naviguer(1)}>
              <Text style={[styles.navBtnTxt, { color: VERT }]}>›</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* LISTE DES COURS */}
        <View style={styles.listContainer}>
          {loading && !refresh ? (
            <ActivityIndicator size="large" color={VERT} style={{ marginTop: 20 }} />
          ) : emploi.length === 0 ? (
            <View style={[styles.emptyBox, { backgroundColor: theme.card }]}>
              <Text style={styles.emptyIcon}>🏖️</Text>
              <Text style={[styles.emptyTitre, { color: theme.text }]}>Journée libre</Text>
              <Text style={[styles.emptyTxt, { color: theme.textSub }]}>Aucun cours programmé pour ce jour.</Text>
            </View>
          ) : (
            emploi.map((c, idx) => {
                const nomJour = JOURS_FR[dateRef.getDay()];
                const col = JOUR_COULEURS[nomJour] || JOUR_COULEURS['Lundi'];
                return <CoursCard key={idx} cours={c} col={col} theme={theme} />;
            })
          )}
        </View>

        {/* CONTACT INFO */}
        <View style={[styles.contactBox, { backgroundColor: theme.card, borderColor: theme.cardBorder }]}>
          <Text style={[styles.contactTitre, { color: VERT }]}>🏫 ADMINISTRATION</Text>
          <Text style={[styles.contactTxt, { color: theme.textSub }]}>En cas d'absence ou de modification, merci de contacter le service scolarité.</Text>
        </View>
      </ScrollView>
    </View>
  );
}

// COPIE EXACTE DES STYLES POUR L'HARMONIE VISUELLE
const styles = StyleSheet.create({
  wrapper: { flex: 1 },
  hero: {
    backgroundColor: VERT,
    paddingTop: Platform.OS === 'ios' ? 20 : (StatusBar.currentHeight || 24) + 16,
    paddingBottom: 32, paddingHorizontal: 20,
    borderBottomLeftRadius: 32, borderBottomRightRadius: 32, overflow: 'hidden',
  },
  decoCircle1: { position: 'absolute', width: 180, height: 180, borderRadius: 90, backgroundColor: 'rgba(255,255,255,0.08)', top: -50, right: -30 },
  decoCircle2: { position: 'absolute', width: 120, height: 120, borderRadius: 60, backgroundColor: 'rgba(255,255,255,0.05)', bottom: -20, left: -20 },
  heroTitre: { color: '#fff', fontSize: 24, fontWeight: '900', marginBottom: 4 },
  heroSub:   { color: 'rgba(255,255,255,0.7)', fontSize: 14, marginBottom: 20 },
  statsRow:  { flexDirection: 'row', backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: 16, padding: 16, borderWidth: 1, borderColor: 'rgba(255,255,255,0.15)' },
  statCard:  { flex: 1, alignItems: 'center' },
  statVal:   { fontSize: 20, fontWeight: '900' },
  statLabel: { fontSize: 10, color: 'rgba(255,255,255,0.6)', marginTop: 3, textAlign: 'center' },
  statDivider: { width: 1, backgroundColor: 'rgba(255,255,255,0.15)' },
  progressCard: { marginHorizontal: 16, marginTop: 16, borderRadius: 20, padding: 18, elevation: 4, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.08 },
  navRow:    { flexDirection: 'row', alignItems: 'center' },
  navBtn:    { width: 36, height: 36, justifyContent: 'center', alignItems: 'center' },
  navBtnTxt: { fontSize: 28, fontWeight: '300' },
  navLabel:  { fontSize: 13, fontWeight: '800', textAlign: 'center' },
  navReset:  { fontSize: 10, fontWeight: '600', textAlign: 'center', marginTop: 2 },
  listContainer: { padding: 16, paddingTop: 12, gap: 12 },
  card: { borderRadius: 18, padding: 16, elevation: 3, borderLeftWidth: 4, shadowColor: '#000', shadowOffset: { width: 0, height: 3 }, shadowOpacity: 0.07 },
  cardTop:  { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 },
  cardLeft: { flex: 1, marginRight: 12 },
  matiere:  { fontSize: 15, fontWeight: '800', marginBottom: 4 },
  cardDate: { fontSize: 12 },
  montantBox: { alignItems: 'flex-end' },
  heureVal:   { fontSize: 20, fontWeight: '900' },
  heureDevise: { fontSize: 11, fontWeight: '600' },
  cardFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingTop: 10, borderTopWidth: 1 },
  horaireBadge: { paddingHorizontal: 12, paddingVertical: 5, borderRadius: 10 },
  horaireTxt:   { fontSize: 12, fontWeight: '700' },
  infoRight:    { alignItems: 'flex-end', gap: 2 },
  infoTxt:      { fontSize: 11 },
  emptyBox:   { borderRadius: 18, padding: 32, alignItems: 'center', elevation: 2 },
  emptyIcon:  { fontSize: 48, marginBottom: 12 },
  emptyTitre: { fontSize: 18, fontWeight: '900', marginBottom: 4 },
  emptyTxt:   { fontSize: 13 },
  contactBox: { marginHorizontal: 16, marginTop: 4, borderRadius: 20, padding: 18, elevation: 2, marginBottom: 8, borderWidth: 1 },
  contactTitre: { fontSize: 14, fontWeight: '800', marginBottom: 10 },
  contactTxt: { fontSize: 13, marginBottom: 4, lineHeight: 20 },
});