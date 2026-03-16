import React, { useEffect, useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  StatusBar, ActivityIndicator, RefreshControl, Platform
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../../context/ThemeContext';
import API from '../../api/api';

const VERT   = '#2E7D32';
const ORANGE = '#D84315';

export default function HomeProfScreen({ navigation }) {
  const [prof,    setProf]    = useState(null);
  const [stats,   setStats]   = useState({
    cours: 0, etudiants: 0, messages: 0, matieres: 0
  });
  const [coursAujourdhui, setCoursAujourdhui] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refresh, setRefresh] = useState(false);
  const insets   = useSafeAreaInsets();
  const themeCtx = useTheme();
  const theme    = themeCtx?.theme || {
    bg: '#F5F7F5', card: '#FFFFFF', cardBorder: '#E2E8F0',
    text: '#1E293B', textSub: '#64748B', textMuted: '#94A3B8',
  };

  const JOURS_FR = ['Dimanche','Lundi','Mardi','Mercredi','Jeudi','Vendredi','Samedi'];

  useEffect(() => { loadData(); }, []);

  const loadData = async () => {
    try {
      const stored = await AsyncStorage.getItem('user');
      const u      = JSON.parse(stored);
      setProf(u);

      const [emploiRes, convRes, etudRes] = await Promise.allSettled([
        API.get(`/emploiTemps/professeur/${u.Id_UTILISATEUR}`),
        API.get(`/messagerie/conversations/${u.Id_UTILISATEUR}`),
        API.get(`/etudiants/par-prof/${u.Id_UTILISATEUR}`),
      ]);

      const emploi   = emploiRes.status === 'fulfilled' ? emploiRes.value.data : [];
      const convs    = convRes.status   === 'fulfilled' ? convRes.value.data   : [];
      const etuds    = etudRes.status   === 'fulfilled' ? etudRes.value.data   : [];

      // Cours d'aujourd'hui
      const jourNow  = JOURS_FR[new Date().getDay()];
      const aujour   = emploi
        .filter(c => c.Jour_Semaine === jourNow)
        .sort((a, b) => (a.Heure_Debut || '').localeCompare(b.Heure_Debut || ''));
      setCoursAujourdhui(aujour);

      // Matières uniques
      const matieres = [...new Set(emploi.map(e => e.Id_MATIERE))];

      // Messages non lus
      const nonLus = convs.reduce((s, c) => s + (c.Non_Lu || 0), 0);

      setStats({
        cours:     emploi.length,
        etudiants: etuds.length,
        messages:  nonLus,
        matieres:  matieres.length,
      });

    } catch (err) {
      console.log('Erreur home prof:', err);
    } finally {
      setLoading(false);
      setRefresh(false);
    }
  };

  const menuItems = [
    { icon: '🎓', label: 'Mes Étudiants',  screen: 'MesEtudiants', couleur: '#2563EB', bg: '#EFF6FF', badge: stats.etudiants },
    { icon: '📝', label: 'Saisir des Notes', screen: 'SaisieNotes', couleur: ORANGE, bg: '#FFF7ED', badge: null },
    { icon: '💬', label: 'Messagerie',     screen: 'Messagerie',   couleur: VERT,      bg: '#F0FDF4', badge: stats.messages > 0 ? stats.messages : null },
    { icon: '🕐', label: 'Mon Emploi du Temps',     screen: 'EmploiProf',   couleur: '#9333EA', bg: '#FDF4FF', badge: stats.cours },
  ];

  if (loading) return (
    <View style={[styles.center, { backgroundColor: theme.bg }]}>
      <ActivityIndicator size="large" color={VERT} />
    </View>
  );

  const heure  = new Date().getHours();
  const salut  = heure < 12 ? '🌅 Bonjour' : heure < 18 ? '☀️ Bon après-midi' : '🌙 Bonsoir';

  return (
    <View style={[styles.wrapper, { backgroundColor: theme.bg }]}>
      <StatusBar barStyle="light-content" backgroundColor={VERT} />
      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refresh} onRefresh={() => { setRefresh(true); loadData(); }} colors={[VERT]} />}
        contentContainerStyle={{ paddingBottom: insets.bottom + 24 }}
      >
        {/* HERO */}
        <View style={styles.hero}>
          <View style={styles.deco1} />
          <View style={styles.deco2} />
          <View style={styles.heroTop}>
            <View style={styles.avatarBox}>
              <Text style={styles.avatarTxt}>
                {prof?.Nom_User?.charAt(0)?.toUpperCase() || 'P'}
              </Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.heroBonj}>{salut},</Text>
              <Text style={styles.heroNom} numberOfLines={1}>{prof?.Nom_User || 'Professeur'}</Text>
              <View style={styles.roleBadge}>
                <Text style={styles.roleTxt}>👨‍🏫 Professeur — GROUPE COFE-CESA</Text>
              </View>
            </View>
          </View>

          {/* STATS */}
          <View style={styles.statsRow}>
            <View style={styles.statCard}>
              <Text style={[styles.statVal, { color: '#4ADE80' }]}>{stats.cours}</Text>
              <Text style={styles.statLabel}>Cours/sem</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statCard}>
              <Text style={[styles.statVal, { color: '#60A5FA' }]}>{stats.etudiants}</Text>
              <Text style={styles.statLabel}>Étudiants</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statCard}>
              <Text style={[styles.statVal, { color: '#F59E0B' }]}>{stats.matieres}</Text>
              <Text style={styles.statLabel}>Matières</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statCard}>
              <Text style={[styles.statVal, { color: stats.messages > 0 ? ORANGE : '#4ADE80' }]}>
                {stats.messages}
              </Text>
              <Text style={styles.statLabel}>Non lus</Text>
            </View>
          </View>
        </View>

        {/* COURS AUJOURD'HUI */}
        {coursAujourdhui.length > 0 && (
          <View style={[styles.section, { backgroundColor: theme.card }]}>
            <View style={styles.sectionHead}>
              <Text style={[styles.sectionTitre, { color: theme.text }]}>
                📅 Cours aujourd'hui — {JOURS_FR[new Date().getDay()]}
              </Text>
              <TouchableOpacity onPress={() => navigation.navigate('EmploiProf')}>
                <Text style={[styles.voirTout, { color: VERT }]}>Voir tout ›</Text>
              </TouchableOpacity>
            </View>
            {coursAujourdhui.map((c, i) => (
              <View key={i} style={[styles.coursCard, { backgroundColor: theme.bg, borderLeftColor: VERT }]}>
                <View style={styles.coursHeure}>
                  <Text style={[styles.coursHeureDebut, { color: VERT }]}>{c.Heure_Debut}</Text>
                  <Text style={[styles.coursHeureFin, { color: theme.textMuted }]}>{c.Heure_Fin}</Text>
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.coursMatiere, { color: theme.text }]}>{c.Nom_Matiere}</Text>
                  <Text style={[styles.coursSalle, { color: theme.textSub }]}>
                    📍 {c.Nom_Salle || 'Salle N/A'} · 🎓 {c.Nom_Classe || 'Classe N/A'}
                  </Text>
                </View>
              </View>
            ))}
          </View>
        )}

        {/* MENU ACTIONS */}
        <Text style={[styles.menuTitre, { color: theme.text }]}>Actions rapides</Text>
        <View style={styles.menuGrid}>
          {menuItems.map((item, i) => (
            <TouchableOpacity
              key={i}
              style={[styles.menuCard, { backgroundColor: theme.card, borderColor: theme.cardBorder }]}
              onPress={() => navigation.navigate(item.screen)}
              activeOpacity={0.85}
            >
              <View style={[styles.menuIconBox, { backgroundColor: item.bg }]}>
                <Text style={styles.menuIcon}>{item.icon}</Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={[styles.menuLabel, { color: theme.text }]}>{item.label}</Text>
              </View>
              {item.badge !== null && item.badge !== undefined && (
                <View style={[styles.menuBadge, { backgroundColor: item.badge > 0 && item.label === 'Messagerie' ? ORANGE : item.couleur + '20' }]}>
                  <Text style={[styles.menuBadgeTxt, { color: item.badge > 0 && item.label === 'Messagerie' ? '#fff' : item.couleur }]}>
                    {item.badge}
                  </Text>
                </View>
              )}
              <Text style={[styles.menuArrow, { color: item.couleur }]}>›</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* CONTACT */}
        <View style={[styles.contactBox, { backgroundColor: theme.card, borderColor: theme.cardBorder }]}>
          <Text style={[styles.contactTitre, { color: VERT }]}>🏫 GROUPE COFE-CESA</Text>
          <Text style={[styles.contactTxt, { color: theme.textSub }]}>📍 Koumassi Nord-Est, Abidjan</Text>
          <Text style={[styles.contactTxt, { color: theme.textSub }]}>📞 (+225) 27 21 56 31 74</Text>
        </View>

      </ScrollView>
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
    borderBottomLeftRadius: 32, borderBottomRightRadius: 32, overflow: 'hidden',
  },
  deco1: { position: 'absolute', width: 200, height: 200, borderRadius: 100, backgroundColor: 'rgba(255,255,255,0.07)', top: -60, right: -40 },
  deco2: { position: 'absolute', width: 140, height: 140, borderRadius: 70, backgroundColor: 'rgba(255,255,255,0.05)', bottom: -30, left: -30 },
  heroTop:     { flexDirection: 'row', alignItems: 'center', gap: 14, marginBottom: 20 },
  avatarBox:   { width: 60, height: 60, borderRadius: 30, backgroundColor: 'rgba(255,255,255,0.25)', justifyContent: 'center', alignItems: 'center', borderWidth: 2, borderColor: 'rgba(255,255,255,0.4)' },
  avatarTxt:   { fontSize: 26, fontWeight: '900', color: '#fff' },
  heroBonj:    { color: 'rgba(255,255,255,0.8)', fontSize: 13 },
  heroNom:     { color: '#fff', fontSize: 20, fontWeight: '900' },
  roleBadge:   { backgroundColor: 'rgba(255,255,255,0.2)', borderRadius: 10, paddingHorizontal: 10, paddingVertical: 3, alignSelf: 'flex-start', marginTop: 4 },
  roleTxt:     { color: '#fff', fontSize: 11, fontWeight: '700' },
  statsRow:    { flexDirection: 'row', backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: 16, padding: 14, borderWidth: 1, borderColor: 'rgba(255,255,255,0.15)' },
  statCard:    { flex: 1, alignItems: 'center' },
  statVal:     { fontSize: 18, fontWeight: '900' },
  statLabel:   { fontSize: 9, color: 'rgba(255,255,255,0.6)', marginTop: 3, textAlign: 'center' },
  statDivider: { width: 1, backgroundColor: 'rgba(255,255,255,0.15)' },

  section:     { marginHorizontal: 16, marginTop: 16, borderRadius: 20, padding: 16, elevation: 2 },
  sectionHead: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  sectionTitre:{ fontSize: 14, fontWeight: '800' },
  voirTout:    { fontSize: 13, fontWeight: '700' },
  coursCard:   { flexDirection: 'row', alignItems: 'center', gap: 12, borderRadius: 12, padding: 10, marginBottom: 8, borderLeftWidth: 4 },
  coursHeure:  { alignItems: 'center', minWidth: 52 },
  coursHeureDebut: { fontSize: 13, fontWeight: '800' },
  coursHeureFin:   { fontSize: 11 },
  coursMatiere:    { fontSize: 13, fontWeight: '700', marginBottom: 2 },
  coursSalle:      { fontSize: 11 },

  menuTitre:   { fontSize: 16, fontWeight: '800', marginHorizontal: 16, marginTop: 20, marginBottom: 12 },
  menuGrid:    { paddingHorizontal: 16, gap: 10 },
  menuCard:    { flexDirection: 'row', alignItems: 'center', borderRadius: 16, padding: 16, borderWidth: 1, elevation: 2, gap: 14 },
  menuIconBox: { width: 46, height: 46, borderRadius: 14, justifyContent: 'center', alignItems: 'center' },
  menuIcon:    { fontSize: 22 },
  menuLabel:   { fontSize: 15, fontWeight: '700' },
  menuBadge:   { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 10 },
  menuBadgeTxt:{ fontSize: 12, fontWeight: '800' },
  menuArrow:   { fontSize: 22, fontWeight: '300' },

  contactBox:   { marginHorizontal: 16, marginTop: 20, borderRadius: 20, padding: 18, elevation: 2, borderWidth: 1 },
  contactTitre: { fontSize: 14, fontWeight: '800', marginBottom: 10 },
  contactTxt:   { fontSize: 13, marginBottom: 4, lineHeight: 20 },
});