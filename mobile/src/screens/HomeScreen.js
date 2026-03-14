import React, { useEffect, useState, useRef, useCallback } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  Alert, Platform, StatusBar, Animated, RefreshControl,
  Image, ActivityIndicator
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../context/ThemeContext';
import API, { SERVER_URL } from '../api/api';

const VERT   = '#2E7D32';
const ORANGE = '#D84315';
const JOURS  = ['Dimanche','Lundi','Mardi','Mercredi','Jeudi','Vendredi','Samedi'];

export default function HomeScreen({ navigation }) {
  const [user, setUser]           = useState(null);
  const [stats, setStats]         = useState({ notes: 0, absences: 0, paiements: 0 });
  const [moyenneGen, setMoyenne]  = useState(null);
  const [coursJour, setCoursJour] = useState([]);
  const [refreshing, setRefresh]  = useState(false);
  const [menuVisible, setMenu]    = useState(false);
  const menuAnim = useRef(new Animated.Value(-280)).current;
  const insets   = useSafeAreaInsets();
  const { theme, isDark } = useTheme();

  useEffect(() => {
    loadAll();
    const unsub = navigation.addListener('focus', loadAll);
    return unsub;
  }, [navigation]);

  const loadAll = async () => {
    try {
      const stored = await AsyncStorage.getItem('user');
      if (!stored) return;
      const u = JSON.parse(stored);
      setUser(u);

      // Recharger photo depuis API
      try {
        const res = await API.get(`/etudiants/profil/${u.Id_UTILISATEUR}`);
        if (res.data?.Image_Etudiant) {
          const updated = { ...u, Image_Etudiant: res.data.Image_Etudiant };
          await AsyncStorage.setItem('user', JSON.stringify(updated));
          setUser(updated);
        }
      } catch (_) {}

      const [notesR, absR, paiR, emploiR] = await Promise.allSettled([
        API.get(`/evaluations/${u.Id_UTILISATEUR}/notes`),
        API.get(`/absences/etudiant/${u.Id_UTILISATEUR}`),
        API.get(`/versements/etudiant/${u.Id_UTILISATEUR}`),
        API.get(`/emploiTemps/etudiant/${u.Id_UTILISATEUR}`),
      ]);

      const notes  = notesR.status  === 'fulfilled' ? notesR.value.data  : [];
      const emploi = emploiR.status === 'fulfilled' ? emploiR.value.data : [];

      if (notes.length > 0) {
        const total = notes.reduce((s, n) => s + parseFloat(n.Note_Evaluation || 0), 0);
        setMoyenne((total / notes.length).toFixed(2));
      } else setMoyenne(null);

      const jourNow = JOURS[new Date().getDay()];
      setCoursJour(emploi.filter(c => c.Jour_Semaine === jourNow)
        .sort((a, b) => (a.Heure_Debut || '').localeCompare(b.Heure_Debut || '')));

      setStats({
        notes: notes.length,
        absences: absR.status === 'fulfilled' ? absR.value.data?.absences?.length || 0 : 0,
        paiements: paiR.status === 'fulfilled' ? paiR.value.data?.paiements?.length || 0 : 0,
      });
    } catch (_) {}
  };

  const onRefresh = async () => { setRefresh(true); await loadAll(); setRefresh(false); };

  const toggleMenu = () => {
    if (menuVisible) {
      Animated.timing(menuAnim, { toValue: -280, duration: 260, useNativeDriver: true }).start(() => setMenu(false));
    } else {
      setMenu(true);
      Animated.timing(menuAnim, { toValue: 0, duration: 260, useNativeDriver: true }).start();
    }
  };

  const goTo = (screen) => { toggleMenu(); setTimeout(() => navigation.navigate(screen), 280); };

  const logout = () => {
    toggleMenu();
    setTimeout(() => {
      Alert.alert('Déconnexion', 'Voulez-vous vous déconnecter ?', [
        { text: 'Annuler', style: 'cancel' },
        { text: 'Déconnexion', style: 'destructive', onPress: async () => {
          await AsyncStorage.removeItem('token');
          await AsyncStorage.removeItem('user');
          navigation.replace('Login');
        }},
      ]);
    }, 300);
  };

  const getMention = (m) => {
    if (!m) return null;
    const v = parseFloat(m);
    if (v >= 16) return { txt: '🏆 Très Bien', color: '#065F46', bg: '#D1FAE5' };
    if (v >= 14) return { txt: '⭐ Bien', color: '#065F46', bg: '#D1FAE5' };
    if (v >= 12) return { txt: '👍 Assez Bien', color: '#92400E', bg: '#FEF3C7' };
    if (v >= 10) return { txt: '✅ Passable', color: '#92400E', bg: '#FEF3C7' };
    return { txt: '⚠️ Insuffisant', color: '#991B1B', bg: '#FEE2E2' };
  };

  const mention   = getMention(moyenneGen);
  const initiale  = user?.Nom_User?.charAt(0)?.toUpperCase() || 'E';
  const heure     = new Date().getHours();
  const salut     = heure < 12 ? 'Bonjour' : heure < 18 ? 'Bon après-midi' : 'Bonsoir';
  const jourNow   = JOURS[new Date().getDay()];

  const menuItems = [
    { icon: '📝', label: 'Mes Notes',        screen: 'Notes' },
    { icon: '📅', label: 'Mes Absences',     screen: 'Absences' },
    { icon: '💰', label: 'Mes Paiements',    screen: 'Paiements' },

    { icon: '🔔', label: 'Notifications',    screen: 'Notifications' },
    { icon: '🏅', label: 'Classement',        screen: 'Leaderboard' },
        { icon: '🏆', label: 'Mes Récompenses',  screen: 'Recompenses' },
    { icon: '🤖', label: 'Assistant MyCESA', screen: 'ChatBot' },
    { icon: '🪪', label: 'Carte Scolaire',   screen: 'Carte' },
    { icon: 'ℹ️',  label: 'À propos de CESA', screen: 'APropos' },
  ];

  return (
    <View style={[styles.wrapper, { backgroundColor: theme.bg }]}> 
      <StatusBar barStyle="light-content" backgroundColor={VERT} />

      {/* OVERLAY MENU */}
      {menuVisible && (
        <TouchableOpacity style={styles.overlay} activeOpacity={1} onPress={toggleMenu} />
      )}

      {/* DRAWER GAUCHE */}
      <Animated.View style={[styles.drawer, { backgroundColor: theme.drawer, transform: [{ translateX: menuAnim }] }]}>
        <View style={styles.drawerHead}>
          {user?.Image_Etudiant ? (
            <Image source={{ uri: `${SERVER_URL}${user.Image_Etudiant}` }} style={styles.drawerAvImg} />
          ) : (
            <View style={styles.drawerAv}><Text style={styles.drawerAvTxt}>{initiale}</Text></View>
          )}
          <Text style={styles.drawerNom}>{user?.Nom_User || 'Étudiant'}</Text>
          <Text style={styles.drawerRole}>{user?.Lib_Role || 'Étudiant'}</Text>
        </View>
        <ScrollView style={{ flex: 1 }} showsVerticalScrollIndicator={false}>
          {menuItems.map((item) => (
            <TouchableOpacity key={item.screen} style={styles.drawerItem} onPress={() => goTo(item.screen)}>
              <Text style={styles.drawerItemIcon}>{item.icon}</Text>
              <Text style={[styles.drawerItemLabel, { color: theme.text }]}>{item.label}</Text>
              <Text style={styles.drawerArrow}>›</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
        <TouchableOpacity style={styles.drawerLogout} onPress={logout}>
          <Text style={styles.drawerLogoutTxt}>🚪 Se déconnecter</Text>
        </TouchableOpacity>
      </Animated.View>

      {/* HEADER */}
      <View style={[styles.header, { paddingTop: insets.top + 10, backgroundColor: theme.header }]}>
        <TouchableOpacity onPress={toggleMenu} style={styles.menuBtn}>
          <View style={styles.hamburger}>
            <View style={styles.hLine} />
            <View style={[styles.hLine, { width: 16 }]} />
            <View style={styles.hLine} />
          </View>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>MyCESA</Text>
        <TouchableOpacity onPress={() => navigation.navigate('Notifications')} style={styles.menuBtn}>
          <Text style={{ fontSize: 22 }}>🔔</Text>
        </TouchableOpacity>
      </View>

      {/* CONTENU */}
      <ScrollView
        style={{ flex: 1 }}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[VERT]} />}
        contentContainerStyle={{ paddingBottom: insets.bottom + 90 }}
      >
        {/* HERO SALUTATION */}
        <View style={[styles.hero, { backgroundColor: theme.hero }]}> 
          <View style={{ flex: 1 }}>
            <Text style={styles.heroSalut}>{salut} 👋</Text>
            <Text style={styles.heroNom}>{user?.Nom_User || 'Étudiant'}</Text>
          </View>
          <TouchableOpacity
            style={styles.heroAvatar}
            onPress={() => navigation.navigate('Profil')}
          >
            {user?.Image_Etudiant ? (
              <Image source={{ uri: `${SERVER_URL}${user.Image_Etudiant}` }} style={styles.heroAvatarImg} />
            ) : (
              <Text style={styles.heroAvatarTxt}>{initiale}</Text>
            )}
          </TouchableOpacity>
        </View>

        {/* CARTE MOYENNE */}
        <View style={[styles.moyenneCard, { backgroundColor: theme.card }]}> 
          <View style={{ flex: 1 }}>
            <Text style={[styles.moyenneLabel, { color: theme.textSub }]}>Moyenne Générale</Text>
            <Text style={[styles.moyenneVal, { color: theme.text }]}> 
              {moyenneGen || '--'}<Text style={styles.moyenneSur}>/20</Text>
            </Text>
          </View>
          {mention && (
            <View style={[styles.mentionBadge, { backgroundColor: mention.bg }]}>
              <Text style={[styles.mentionTxt, { color: mention.color }]}>{mention.txt}</Text>
            </View>
          )}
        </View>

        {/* COURS DU JOUR */}
        <View style={[styles.section, { backgroundColor: theme.section }]}> 
          <View style={styles.sectionHead}>
            <Text style={[styles.sectionTitre, { color: theme.text }]}>📅 Cours du jour — {jourNow}</Text>
            <TouchableOpacity onPress={() => navigation.navigate('EmploiTemps')}>
              <Text style={styles.voirTout}>Voir tout ›</Text>
            </TouchableOpacity>
          </View>
          {coursJour.length === 0 ? (
            <View style={styles.emptyBox}>
              <Text style={styles.emptyTxt}>Aucun cours prévu aujourd'hui 🎉</Text>
            </View>
          ) : (
            coursJour.map((cours, i) => (
            <View key={i} style={[styles.coursCard, { backgroundColor: theme.bg, borderLeftColor: '#2E7D32' }]}> 
                <View style={styles.coursHeureBadge}>
                  <Text style={styles.coursHeureDebut}>{cours.Heure_Debut || '--:--'}</Text>
                  <Text style={styles.coursHeureSep}>|</Text>
                  <Text style={styles.coursHeureFin}>{cours.Heure_Fin || '--:--'}</Text>
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.coursMatiere, { color: theme.text }]}>{cours.Lib_Matiere || cours.Lib_Cours || 'Cours'}</Text>
                  <Text style={[styles.coursSalle, { color: theme.textSub }]}>📍 {cours.Salle || 'Salle non définie'}</Text>
                </View>
              </View>
            ))
          )}
        </View>

        {/* STATISTIQUES */}
        <View style={[styles.section, { backgroundColor: theme.section }]}> 
          <Text style={[styles.sectionTitre, { color: theme.text }]}>📊 Mes Statistiques</Text>
          <View style={styles.statsRow}>
            <TouchableOpacity style={[styles.statCard, { borderTopColor: '#2563EB', backgroundColor: theme.card }]} onPress={() => navigation.navigate('Notes')}>
              <Text style={styles.statIcon}>📝</Text>
              <Text style={[styles.statVal, { color: theme.text }]}>{stats.notes}</Text>
              <Text style={[styles.statLbl, { color: theme.textSub }]}>Évaluations</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.statCard, { borderTopColor: ORANGE, backgroundColor: theme.card }]} onPress={() => navigation.navigate('Absences')}>
              <Text style={styles.statIcon}>📅</Text>
              <Text style={[styles.statVal, { color: theme.text }]}>{stats.absences}</Text>
              <Text style={[styles.statLbl, { color: theme.textSub }]}>Absences</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.statCard, { borderTopColor: '#10B981', backgroundColor: theme.card }]} onPress={() => navigation.navigate('Paiements')}>
              <Text style={styles.statIcon}>💰</Text>
              <Text style={[styles.statVal, { color: theme.text }]}>{stats.paiements}</Text>
              <Text style={[styles.statLbl, { color: theme.textSub }]}>Paiements</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* ÉCOLE */}
        <View style={styles.ecoleCard}>
          <Text style={styles.ecoleTitre}>🎓 GROUPE COFE-CESA</Text>
          <Text style={styles.ecoleSlogan}>Une excellence à votre service !</Text>
        </View>

      </ScrollView>

      {/* FAB ASSISTANT */}
      <TouchableOpacity
        style={[styles.fab, { bottom: insets.bottom + 80 }]}
        onPress={() => navigation.navigate('ChatBot')}
        activeOpacity={0.85}
      >
        <Text style={styles.fabIcon}>🤖</Text>
        <Text style={styles.fabTxt}>Assistant</Text>
      </TouchableOpacity>

    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: { flex: 1, backgroundColor: '#F5F7F5' },

  // OVERLAY + DRAWER
  overlay: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 10 },
  drawer: {
    position: 'absolute', top: 0, left: 0, bottom: 0, width: 280,
    backgroundColor: '#fff', zIndex: 20, elevation: 20,
    shadowColor: '#000', shadowOffset: { width: 4, height: 0 }, shadowOpacity: 0.2,
  },
  drawerHead: { backgroundColor: VERT, padding: 24, paddingTop: 52, alignItems: 'center' },
  drawerAv: {
    width: 72, height: 72, borderRadius: 36, backgroundColor: ORANGE,
    justifyContent: 'center', alignItems: 'center',
    borderWidth: 3, borderColor: '#fff', marginBottom: 10,
  },
  drawerAvImg: { width: 72, height: 72, borderRadius: 36, borderWidth: 3, borderColor: '#fff', marginBottom: 10 },
  drawerAvTxt: { color: '#fff', fontSize: 28, fontWeight: '900' },
  drawerNom: { color: '#fff', fontSize: 16, fontWeight: '800', textAlign: 'center' },
  drawerRole: { color: 'rgba(255,255,255,0.7)', fontSize: 13, marginTop: 4 },
  drawerItem: {
    flexDirection: 'row', alignItems: 'center',
    paddingVertical: 14, paddingHorizontal: 20,
    borderBottomWidth: 1, borderBottomColor: '#F1F5F9',
  },
  drawerItemIcon: { fontSize: 20, marginRight: 14 },
  drawerItemLabel: { flex: 1, fontSize: 15, fontWeight: '600', color: '#1E293B' },
  drawerArrow: { fontSize: 20, color: '#CBD5E1' },
  drawerLogout: { padding: 20, borderTopWidth: 1, borderTopColor: '#F1F5F9', backgroundColor: '#FFF1F2' },
  drawerLogoutTxt: { color: '#EF4444', fontSize: 15, fontWeight: '700', textAlign: 'center' },

fab: {
    position: 'absolute', right: 20,
    backgroundColor: ORANGE, borderRadius: 32,
    paddingHorizontal: 18, paddingVertical: 14,
    flexDirection: 'row', alignItems: 'center',
    elevation: 10,
    shadowColor: ORANGE, shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.4, shadowRadius: 12,
  },
  fabIcon: { fontSize: 20 },
  fabTxt: { color: '#fff', fontSize: 14, fontWeight: '800', marginLeft: 8 },

  // HEADER
  header: {
    backgroundColor: VERT,
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 16, paddingBottom: 16,
  },
  menuBtn: { width: 40, height: 40, justifyContent: 'center', alignItems: 'center' },
  hamburger: { gap: 5 },
  hLine: { width: 22, height: 2.5, backgroundColor: '#fff', borderRadius: 2 },
  headerTitle: { color: '#fff', fontSize: 20, fontWeight: '900', letterSpacing: 1 },

  // HERO
  hero: {
    backgroundColor: VERT,
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: 20, paddingBottom: 28,
    borderBottomLeftRadius: 28, borderBottomRightRadius: 28,
  },
  heroSalut: { color: 'rgba(255,255,255,0.75)', fontSize: 13 },
  heroNom: { color: '#fff', fontSize: 22, fontWeight: '900', marginTop: 2 },
  heroAvatar: {
    width: 50, height: 50, borderRadius: 25, backgroundColor: ORANGE,
    justifyContent: 'center', alignItems: 'center',
    borderWidth: 2.5, borderColor: '#fff', overflow: 'hidden',
  },
  heroAvatarTxt: { color: '#fff', fontSize: 20, fontWeight: '900' },
  heroAvatarImg: { width: 50, height: 50, borderRadius: 25 },

  // MOYENNE
  moyenneCard: {
    backgroundColor: '#fff', marginHorizontal: 16, marginTop: 16,
    borderRadius: 20, padding: 20,
    flexDirection: 'row', alignItems: 'center',
    elevation: 4, shadowColor: VERT,
    shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.1, shadowRadius: 10,
  },
  moyenneLabel: { fontSize: 13, color: '#64748B', fontWeight: '600' },
  moyenneVal: { fontSize: 40, fontWeight: '900', color: '#1E293B', marginTop: 2 },
  moyenneSur: { fontSize: 18, color: '#94A3B8', fontWeight: '600' },
  mentionBadge: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 16 },
  mentionTxt: { fontSize: 13, fontWeight: '800' },

  // SECTION
  section: {
    backgroundColor: '#fff', marginHorizontal: 16, marginTop: 14,
    borderRadius: 20, padding: 18,
    elevation: 2, shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06,
  },
  sectionHead: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  sectionTitre: { fontSize: 15, fontWeight: '800', color: '#1E293B' },
  voirTout: { color: VERT, fontSize: 13, fontWeight: '700' },

  // COURS
  emptyBox: { backgroundColor: '#F0FDF4', borderRadius: 12, padding: 14 },
  emptyTxt: { color: VERT, fontWeight: '600', textAlign: 'center' },
  coursCard: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    backgroundColor: '#F8FAFC', borderRadius: 14, padding: 12, marginBottom: 8,
    borderLeftWidth: 4, borderLeftColor: VERT,
  },
  coursHeureBadge: { alignItems: 'center', minWidth: 52 },
  coursHeureDebut: { fontSize: 13, fontWeight: '800', color: VERT },
  coursHeureSep: { color: '#CBD5E1', fontSize: 10 },
  coursHeureFin: { fontSize: 11, color: '#64748B' },
  coursMatiere: { fontSize: 14, fontWeight: '700', color: '#1E293B' },
  coursSalle: { fontSize: 12, color: '#64748B', marginTop: 2 },

  // STATS
  statsRow: { flexDirection: 'row', gap: 10, marginTop: 4 },
  statCard: {
    flex: 1, backgroundColor: '#F8FAFC', borderRadius: 16, padding: 14,
    alignItems: 'center', borderTopWidth: 3,
    elevation: 1,
  },
  statIcon: { fontSize: 24, marginBottom: 6 },
  statVal: { fontSize: 26, fontWeight: '900', color: '#1E293B' },
  statLbl: { fontSize: 11, color: '#64748B', fontWeight: '600', marginTop: 2, textAlign: 'center' },

  // ÉCOLE
  ecoleCard: {
    backgroundColor: VERT, marginHorizontal: 16, marginTop: 14, marginBottom: 8,
    borderRadius: 20, padding: 18, alignItems: 'center',
    borderWidth: 2, borderColor: ORANGE,
  },
  ecoleTitre: { color: '#fff', fontSize: 15, fontWeight: '800' },
  ecoleSlogan: { color: 'rgba(255,255,255,0.75)', fontSize: 12, marginTop: 4, fontStyle: 'italic' },
});