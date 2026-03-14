import React, { useEffect, useState, useContext } from 'react';
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
  const [stats,   setStats]   = useState({ etudiants: 0, cours: 0, messages: 0 });
  const [loading, setLoading] = useState(true);
  const [refresh, setRefresh] = useState(false);
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

      // Charger stats
      const [emploiRes, convRes] = await Promise.allSettled([
        API.get(`/emploiTemps/professeur/${u.Id_UTILISATEUR}`),
        API.get(`/messagerie/conversations/${u.Id_UTILISATEUR}`),
      ]);

      setStats({
        cours:    emploiRes.status === 'fulfilled' ? emploiRes.value.data.length : 0,
        messages: convRes.status   === 'fulfilled' ? convRes.value.data.length   : 0,
      });
    } catch (err) {
      console.log('Erreur home prof:', err);
    } finally {
      setLoading(false);
      setRefresh(false);
    }
  };

  const menuItems = [
    { icon: '🎓', label: 'Mes Étudiants',   screen: 'EtudiantsTab',  couleur: '#2563EB', bg: '#EFF6FF' },
    { icon: '📝', label: 'Saisir Notes',     screen: 'SaisieNotes',   couleur: ORANGE,    bg: '#FFF7ED' },
    { icon: '💬', label: 'Messagerie',       screen: 'Messagerie',    couleur: VERT,      bg: '#F0FDF4' },
    { icon: '🕐', label: 'Mon Emploi',       screen: 'EmploiProfTab', couleur: '#9333EA', bg: '#FDF4FF' },
  ];

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
              <Text style={styles.heroBonj}>👋 Bonjour,</Text>
              <Text style={styles.heroNom} numberOfLines={1}>{prof?.Nom_User || 'Professeur'}</Text>
              <View style={styles.roleBadge}>
                <Text style={styles.roleTxt}>👨‍🏫 Professeur</Text>
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
              <Text style={[styles.statVal, { color: '#60A5FA' }]}>{stats.messages}</Text>
              <Text style={styles.statLabel}>Conversations</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statCard}>
              <Text style={[styles.statVal, { color: ORANGE }]}>CESA</Text>
              <Text style={styles.statLabel}>Groupe</Text>
            </View>
          </View>
        </View>

        {/* MENU */}
        <Text style={[styles.sectionTitre, { color: theme.text }]}>Actions rapides</Text>
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
              <Text style={[styles.menuLabel, { color: theme.text }]}>{item.label}</Text>
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
  heroTop:    { flexDirection: 'row', alignItems: 'center', gap: 14, marginBottom: 20 },
  avatarBox:  { width: 60, height: 60, borderRadius: 30, backgroundColor: 'rgba(255,255,255,0.25)', justifyContent: 'center', alignItems: 'center', borderWidth: 2, borderColor: 'rgba(255,255,255,0.4)' },
  avatarTxt:  { fontSize: 26, fontWeight: '900', color: '#fff' },
  heroBonj:   { color: 'rgba(255,255,255,0.8)', fontSize: 13 },
  heroNom:    { color: '#fff', fontSize: 20, fontWeight: '900' },
  roleBadge:  { backgroundColor: 'rgba(255,255,255,0.2)', borderRadius: 10, paddingHorizontal: 10, paddingVertical: 3, alignSelf: 'flex-start', marginTop: 4 },
  roleTxt:    { color: '#fff', fontSize: 11, fontWeight: '700' },
  statsRow:   { flexDirection: 'row', backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: 16, padding: 16, borderWidth: 1, borderColor: 'rgba(255,255,255,0.15)' },
  statCard:   { flex: 1, alignItems: 'center' },
  statVal:    { fontSize: 18, fontWeight: '900' },
  statLabel:  { fontSize: 10, color: 'rgba(255,255,255,0.6)', marginTop: 3, textAlign: 'center' },
  statDivider:{ width: 1, backgroundColor: 'rgba(255,255,255,0.15)' },
  sectionTitre: { fontSize: 16, fontWeight: '800', marginHorizontal: 16, marginTop: 20, marginBottom: 12 },
  menuGrid:   { paddingHorizontal: 16, gap: 10 },
  menuCard:   { flexDirection: 'row', alignItems: 'center', borderRadius: 16, padding: 16, borderWidth: 1, elevation: 2, gap: 14 },
  menuIconBox:{ width: 46, height: 46, borderRadius: 14, justifyContent: 'center', alignItems: 'center' },
  menuIcon:   { fontSize: 22 },
  menuLabel:  { flex: 1, fontSize: 15, fontWeight: '700' },
  menuArrow:  { fontSize: 22, fontWeight: '300' },
  contactBox: { marginHorizontal: 16, marginTop: 20, borderRadius: 20, padding: 18, elevation: 2, borderWidth: 1 },
  contactTitre: { fontSize: 14, fontWeight: '800', marginBottom: 10 },
  contactTxt: { fontSize: 13, marginBottom: 4, lineHeight: 20 },
});