import React, { useEffect, useState, useRef } from 'react';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  View, Text, StyleSheet, ScrollView,
  TouchableOpacity, Alert, Platform, StatusBar,
  Animated, Dimensions, RefreshControl, Image
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import API, { SERVER_URL } from '../api/api';

const VERT   = '#2E7D32';
const ORANGE = '#D84315';

const { width } = Dimensions.get('window');

export default function HomeScreen({ navigation }) {
  const [user, setUser] = useState(null);
  const [menuVisible, setMenuVisible] = useState(false);
  const [stats, setStats] = useState({ notes: 0, absences: 0, paiements: 0 });
  const [nonLus, setNonLus] = useState(0);
  const [moyenneGen, setMoyenneGen] = useState(null);
  const [refreshing, setRefreshing] = useState(false);
  const menuAnim = useRef(new Animated.Value(-300)).current;
  const insets = useSafeAreaInsets();

  useEffect(() => {
    loadUser();
    const unsubscribe = navigation.addListener('focus', loadUser);
    return unsubscribe;
  }, [navigation]);

 const loadUser = async () => {
  try {
    const stored = await AsyncStorage.getItem('user');
    if (stored) {
      const u = JSON.parse(stored);
      setUser(u);
      loadStats(u);
      loadNonLus(u);
      // Recharger la photo depuis l'API à chaque focus
      try {
        const res = await API.get(`/etudiants/profil/${u.Id_UTILISATEUR}`);
        if (res.data?.Image_Etudiant) {
          const updatedUser = { ...u, Image_Etudiant: res.data.Image_Etudiant };
          await AsyncStorage.setItem('user', JSON.stringify(updatedUser));
          setUser(updatedUser);
        }
      } catch (e) {}
    }
  } catch (e) {}
};

  const loadStats = async (u) => {
    try {
      const [notesRes, absRes, paiRes] = await Promise.allSettled([
        API.get(`/evaluations/${u.Id_UTILISATEUR}/notes`),
        API.get(`/absences/etudiant/${u.Id_UTILISATEUR}`),
        API.get(`/versements/etudiant/${u.Id_UTILISATEUR}`),
      ]);
      const notes = notesRes.status === 'fulfilled' ? notesRes.value.data : [];
      if (notes.length > 0) {
        const total = notes.reduce((s, n) => s + parseFloat(n.Note_Evaluation || 0), 0);
        setMoyenneGen((total / notes.length).toFixed(2));
      }
      setStats({
        notes: notes.length,
        absences: absRes.status === 'fulfilled' ? absRes.value.data.absences?.length || 0 : 0,
        paiements: paiRes.status === 'fulfilled' ? paiRes.value.data.paiements?.length || 0 : 0,
      });
    } catch (e) {}
  };

  const loadNonLus = async (u) => {
    try {
      const res = await API.get(`/notifications/user/${u.Id_UTILISATEUR}`);
      setNonLus(res.data.filter(n => !n.Lu).length);
    } catch (e) {}
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadUser();
    setRefreshing(false);
  };

  const toggleMenu = () => {
    if (menuVisible) {
      Animated.timing(menuAnim, { toValue: -300, duration: 280, useNativeDriver: true }).start(() => setMenuVisible(false));
    } else {
      setMenuVisible(true);
      Animated.timing(menuAnim, { toValue: 0, duration: 280, useNativeDriver: true }).start();
    }
  };

  const handleLogout = async () => {
    toggleMenu();
    setTimeout(async () => {
      const doLogout = async () => {
        await AsyncStorage.removeItem('token');
        await AsyncStorage.removeItem('user');
        navigation.replace('Login');
      };
      if (Platform.OS === 'web') {
        if (window.confirm('Voulez-vous vous déconnecter ?')) doLogout();
      } else {
        Alert.alert('Déconnexion', 'Voulez-vous vous déconnecter ?', [
          { text: 'Annuler', style: 'cancel' },
          { text: 'Déconnexion', style: 'destructive', onPress: doLogout }
        ]);
      }
    }, 300);
  };

  const navigateTo = (screen) => {
    toggleMenu();
    setTimeout(() => navigation.navigate(screen), 300);
  };

  const initiale = user?.Nom_User?.charAt(0)?.toUpperCase() || 'E';
  const heure = new Date().getHours();
  const salutation = heure < 12 ? 'Bonjour' : heure < 18 ? 'Bon après-midi' : 'Bonsoir';

  const menuItems = [
    { icon: '📝', label: 'Mes Notes', screen: 'Notes', color: '#EFF6FF' },
    { icon: '📅', label: 'Mes Absences', screen: 'Absences', color: '#FFF7ED' },
    { icon: '💰', label: 'Mes Paiements', screen: 'Paiements', color: '#F0FDF4' },
    { icon: '🕐', label: 'Emploi du Temps', screen: 'EmploiTemps', color: '#FDF4FF' },
    { icon: '🔔', label: 'Notifications', screen: 'Notifications', color: '#FFF1F2', badge: nonLus },
    { icon: '🪪', label: 'Ma Carte Scolaire', screen: 'Carte', color: '#FFFBEB' },
    { icon: '👤', label: 'Mon Profil', screen: 'Profil', color: '#F0F9FF' },
    { icon: '🤖', label: 'Assistant MyCESA', screen: 'ChatBot', color: '#F5F3FF' },
  ];

  const quickActions = [
    { icon: '📝', label: 'Notes', screen: 'Notes', bg: '#2563EB' },
    { icon: '📅', label: 'Absences', screen: 'Absences', bg: '#F59E0B' },
    { icon: '💰', label: 'Paiements', screen: 'Paiements', bg: '#10B981' },
    { icon: '🕐', label: 'Emploi', screen: 'EmploiTemps', bg: '#8B5CF6' },
  ];

  return (
    <View style={[styles.wrapper, { paddingBottom: insets.bottom + 16 }]}>
      <StatusBar barStyle="light-content" backgroundColor={VERT} />

      {menuVisible && (
        <TouchableOpacity style={styles.overlay} activeOpacity={1} onPress={toggleMenu} />
      )}

      {/* DRAWER */}
      <Animated.View style={[styles.drawer, { transform: [{ translateX: menuAnim }] }]}>
        <View style={styles.drawerHeader}>
          {/* AVATAR DRAWER avec photo */}
          {user?.Image_Etudiant ? (
            <Image
              source={{ uri: `${SERVER_URL}${user.Image_Etudiant}` }}
              style={styles.drawerAvatarImg}
            />
          ) : (
            <View style={styles.drawerAvatar}>
              <Text style={styles.drawerAvatarTxt}>{initiale}</Text>
            </View>
          )}
          <Text style={styles.drawerNom}>{user?.Nom_User || 'Étudiant'}</Text>
          <Text style={styles.drawerRole}>{user?.Lib_Role || ''}</Text>
          <Text style={styles.drawerEmail}>{user?.Email_User || ''}</Text>
        </View>

        <ScrollView style={styles.drawerItems} showsVerticalScrollIndicator={false}>
          {menuItems.map((item, index) => (
            <TouchableOpacity key={index} style={styles.drawerItem} onPress={() => navigateTo(item.screen)}>
              <View style={[styles.drawerIconBox, { backgroundColor: item.color }]}>
                <Text style={styles.drawerItemIcon}>{item.icon}</Text>
              </View>
              <Text style={styles.drawerItemLabel}>{item.label}</Text>
              {item.badge > 0 && (
                <View style={styles.drawerBadge}>
                  <Text style={styles.drawerBadgeTxt}>{item.badge}</Text>
                </View>
              )}
              <Text style={styles.drawerItemArrow}>›</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        <TouchableOpacity style={styles.drawerLogout} onPress={handleLogout}>
          <Text style={styles.drawerLogoutIcon}>🚪</Text>
          <Text style={styles.drawerLogoutTxt}>Se déconnecter</Text>
        </TouchableOpacity>
      </Animated.View>

      {/* CONTENU */}
      <ScrollView
        style={styles.container}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={VERT} />}
      >
        {/* HEADER */}
        <View style={styles.header}>
          <TouchableOpacity style={styles.menuBtn} onPress={toggleMenu}>
            <View style={styles.hamburger}>
              <View style={styles.hamburgerLine} />
              <View style={[styles.hamburgerLine, { width: 16 }]} />
              <View style={styles.hamburgerLine} />
            </View>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>MyCESA</Text>
          <TouchableOpacity style={styles.notifBtn} onPress={() => navigation.navigate('Notifications')}>
            <Text style={styles.notifIcon}>🔔</Text>
            {nonLus > 0 && (
              <View style={styles.notifBadge}>
                <Text style={styles.notifBadgeTxt}>{nonLus > 9 ? '9+' : nonLus}</Text>
              </View>
            )}
          </TouchableOpacity>
        </View>

        {/* HERO */}
        <View style={styles.hero}>
          <View style={styles.heroContent}>
            <Text style={styles.heroSalut}>{salutation} 👋</Text>
            <Text style={styles.heroNom}>{user?.Nom_User || 'Étudiant'}</Text>
            <View style={styles.heroRoleBadge}>
              <Text style={styles.heroRoleTxt}>🎓 {user?.Lib_Role || 'Étudiant'}</Text>
            </View>
          </View>
          <TouchableOpacity style={styles.heroAvatar} onPress={() => navigation.navigate('Profil')}>
            {user?.Image_Etudiant ? (
              <Image
                source={{ uri: `${SERVER_URL}${user.Image_Etudiant}` }}
                style={styles.heroAvatarImg}
              />
            ) : (
              <Text style={styles.heroAvatarTxt}>{initiale}</Text>
            )}
          </TouchableOpacity>
        </View>

        {/* CARTE MOYENNE */}
        {moyenneGen && (
          <View style={styles.moyenneCard}>
            <View style={styles.moyenneLeft}>
              <Text style={styles.moyenneLabel}>Moyenne Générale</Text>
              <Text style={styles.moyenneVal}>{moyenneGen}<Text style={styles.moyenneSur}>/20</Text></Text>
            </View>
            <View style={styles.moyenneRight}>
              <View style={[styles.moyenneBadge, {
                backgroundColor: parseFloat(moyenneGen) >= 14 ? '#D1FAE5' : parseFloat(moyenneGen) >= 10 ? '#FEF3C7' : '#FEE2E2'
              }]}>
                <Text style={[styles.moyenneBadgeTxt, {
                  color: parseFloat(moyenneGen) >= 14 ? '#065F46' : parseFloat(moyenneGen) >= 10 ? '#92400E' : '#991B1B'
                }]}>
                  {parseFloat(moyenneGen) >= 14 ? '⭐ Excellent' : parseFloat(moyenneGen) >= 10 ? '👍 Passable' : '⚠️ Insuffisant'}
                </Text>
              </View>
            </View>
          </View>
        )}

        {/* ACCÈS RAPIDE */}
        <Text style={styles.sectionTitre}>Accès Rapide</Text>
        <View style={styles.quickGrid}>
          {quickActions.map((item, i) => (
            <TouchableOpacity key={i} style={[styles.quickCard, { backgroundColor: item.bg }]} onPress={() => navigation.navigate(item.screen)}>
              <Text style={styles.quickIcon}>{item.icon}</Text>
              <Text style={styles.quickLabel}>{item.label}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* STATS */}
        <Text style={styles.sectionTitre}>Mes Statistiques</Text>
        <View style={styles.statsRow}>
          <TouchableOpacity style={[styles.statCard, { borderLeftColor: '#2563EB' }]} onPress={() => navigation.navigate('Notes')}>
            <Text style={styles.statIcon}>📝</Text>
            <View>
              <Text style={styles.statVal}>{stats.notes}</Text>
              <Text style={styles.statLbl}>Évaluations</Text>
            </View>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.statCard, { borderLeftColor: '#F59E0B' }]} onPress={() => navigation.navigate('Absences')}>
            <Text style={styles.statIcon}>📅</Text>
            <View>
              <Text style={styles.statVal}>{stats.absences}</Text>
              <Text style={styles.statLbl}>Absences</Text>
            </View>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.statCard, { borderLeftColor: '#10B981' }]} onPress={() => navigation.navigate('Paiements')}>
            <Text style={styles.statIcon}>💰</Text>
            <View>
              <Text style={styles.statVal}>{stats.paiements}</Text>
              <Text style={styles.statLbl}>Paiements</Text>
            </View>
          </TouchableOpacity>
        </View>

        {/* CARTE SCOLAIRE RAPIDE */}
        <TouchableOpacity style={styles.carteBtn} onPress={() => navigation.navigate('Carte')}>
          <Text style={styles.carteBtnIcon}>🪪</Text>
          <View>
            <Text style={styles.carteBtnTitre}>Ma Carte Scolaire</Text>
            <Text style={styles.carteBtnSub}>Voir ma carte virtuelle CESA</Text>
          </View>
          <Text style={styles.carteBtnArrow}>›</Text>
        </TouchableOpacity>

        {/* FOOTER INFO */}
        <View style={styles.infoCard}>
          <Text style={styles.infoCardTitre}>🎓 GROUPE COFE-CESA</Text>
          <Text style={styles.infoCardSub}>Une excellence à votre service !</Text>
          <View style={styles.infoCardBadge}>
            <Text style={styles.infoCardBadgeTxt}>● En ligne</Text>
          </View>
        </View>

        <View style={{ height: 120 }} />
      </ScrollView>

      {/* FAB */}
      <TouchableOpacity style={styles.fab} onPress={() => navigation.navigate('ChatBot')} activeOpacity={0.85}>
        <Text style={styles.fabIcon}>🤖</Text>
        <Text style={styles.fabTxt}>Assistant</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: { flex: 1, backgroundColor: '#F8FAFF' },
  container: { flex: 1 },
  overlay: {
    position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.55)', zIndex: 10,
  },

  // DRAWER
  drawer: {
    position: 'absolute', top: 0, left: 0, bottom: 0, width: 285,
    backgroundColor: '#fff', zIndex: 20, elevation: 20,
    shadowColor: '#000', shadowOffset: { width: 4, height: 0 },
    shadowOpacity: 0.2, shadowRadius: 16,
  },
  drawerHeader: {
    backgroundColor: VERT, padding: 24, paddingTop: 52, alignItems: 'center',
  },
  drawerAvatar: {
    width: 76, height: 76, borderRadius: 38, backgroundColor: ORANGE,
    justifyContent: 'center', alignItems: 'center',
    borderWidth: 3, borderColor: '#fff', marginBottom: 12,
  },
  drawerAvatarImg: {
    width: 76, height: 76, borderRadius: 38,
    borderWidth: 3, borderColor: '#fff', marginBottom: 12,
  },
  drawerAvatarTxt: { color: '#fff', fontSize: 30, fontWeight: '800' },
  drawerNom: { color: '#fff', fontSize: 17, fontWeight: '800', textAlign: 'center' },
  drawerRole: { color: 'rgba(255,255,255,0.75)', fontSize: 13, marginTop: 4 },
  drawerEmail: { color: 'rgba(255,255,255,0.55)', fontSize: 12, marginTop: 3 },
  drawerItems: { flex: 1, paddingVertical: 8 },
  drawerItem: {
    flexDirection: 'row', alignItems: 'center',
    paddingVertical: 12, paddingHorizontal: 16,
    borderBottomWidth: 1, borderBottomColor: '#F1F5F9',
  },
  drawerIconBox: {
    width: 36, height: 36, borderRadius: 10,
    justifyContent: 'center', alignItems: 'center', marginRight: 12,
  },
  drawerItemIcon: { fontSize: 18 },
  drawerItemLabel: { flex: 1, fontSize: 14, fontWeight: '600', color: '#1E293B' },
  drawerItemArrow: { fontSize: 20, color: '#CBD5E1' },
  drawerBadge: {
    backgroundColor: '#EF4444', minWidth: 20, height: 20,
    borderRadius: 10, justifyContent: 'center', alignItems: 'center',
    paddingHorizontal: 4, marginRight: 6,
  },
  drawerBadgeTxt: { color: '#fff', fontSize: 11, fontWeight: '800' },
  drawerLogout: {
    flexDirection: 'row', alignItems: 'center', padding: 18,
    borderTopWidth: 1, borderTopColor: '#F1F5F9', backgroundColor: '#FFF1F2',
  },
  drawerLogoutIcon: { fontSize: 20, marginRight: 12 },
  drawerLogoutTxt: { fontSize: 15, fontWeight: '700', color: '#EF4444' },

  // HEADER
  header: {
    backgroundColor: VERT,
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: Platform.OS === 'ios' ? 52 : (StatusBar.currentHeight || 24) + 12,
    paddingBottom: 16,
  },
  menuBtn: { width: 40, height: 40, justifyContent: 'center', alignItems: 'center' },
  hamburger: { gap: 5 },
  hamburgerLine: { width: 22, height: 2.5, backgroundColor: '#fff', borderRadius: 2 },
  headerTitle: { color: '#fff', fontSize: 20, fontWeight: '900', letterSpacing: 1 },
  notifBtn: { width: 40, height: 40, justifyContent: 'center', alignItems: 'center' },
  notifIcon: { fontSize: 22 },
  notifBadge: {
    position: 'absolute', top: 5, right: 5,
    backgroundColor: ORANGE, minWidth: 17, height: 17,
    borderRadius: 9, justifyContent: 'center', alignItems: 'center',
    paddingHorizontal: 3, borderWidth: 1.5, borderColor: VERT,
  },
  notifBadgeTxt: { color: '#fff', fontSize: 9, fontWeight: '900' },

  // HERO
  hero: {
    backgroundColor: VERT,
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 20, paddingBottom: 32,
    borderBottomLeftRadius: 32, borderBottomRightRadius: 32,
  },
  heroContent: { flex: 1 },
  heroSalut: { color: 'rgba(255,255,255,0.75)', fontSize: 14 },
  heroNom: { color: '#fff', fontSize: 24, fontWeight: '900', marginTop: 4 },
  heroRoleBadge: {
    backgroundColor: 'rgba(255,255,255,0.15)', paddingHorizontal: 12,
    paddingVertical: 5, borderRadius: 20, alignSelf: 'flex-start', marginTop: 8,
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.3)',
  },
  heroRoleTxt: { color: '#fff', fontSize: 13, fontWeight: '600' },
  heroAvatar: {
    width: 52, height: 52, borderRadius: 26, backgroundColor: ORANGE,
    justifyContent: 'center', alignItems: 'center',
    borderWidth: 2.5, borderColor: '#fff', overflow: 'hidden',
  },
  heroAvatarTxt: { color: '#fff', fontSize: 20, fontWeight: '900' },
  heroAvatarImg: { width: 52, height: 52, borderRadius: 26 },

  // MOYENNE
  moyenneCard: {
    backgroundColor: '#fff', margin: 16, marginBottom: 0, borderRadius: 20,
    padding: 18, flexDirection: 'row', alignItems: 'center',
    justifyContent: 'space-between', elevation: 4,
    shadowColor: '#2563EB', shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1, shadowRadius: 12,
    borderWidth: 1, borderColor: '#EFF6FF',
  },
  moyenneLeft: {},
  moyenneLabel: { fontSize: 13, color: '#64748B', fontWeight: '600' },
  moyenneVal: { fontSize: 36, fontWeight: '900', color: '#1E293B', marginTop: 2 },
  moyenneSur: { fontSize: 18, color: '#94A3B8', fontWeight: '600' },
  moyenneRight: {},
  moyenneBadge: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20 },
  moyenneBadgeTxt: { fontSize: 13, fontWeight: '700' },

  sectionTitre: {
    fontSize: 16, fontWeight: '800', color: '#1E293B',
    marginHorizontal: 16, marginTop: 24, marginBottom: 12,
  },

  // QUICK ACTIONS
  quickGrid: { flexDirection: 'row', paddingHorizontal: 12, gap: 10 },
  quickCard: {
    flex: 1, borderRadius: 18, padding: 16, alignItems: 'center',
    elevation: 4, shadowColor: '#000', shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.15, shadowRadius: 8,
  },
  quickIcon: { fontSize: 28, marginBottom: 6 },
  quickLabel: { color: '#fff', fontSize: 12, fontWeight: '800' },

  // STATS
  statsRow: { paddingHorizontal: 12, gap: 10 },
  statCard: {
    backgroundColor: '#fff', borderRadius: 16, padding: 16,
    flexDirection: 'row', alignItems: 'center', gap: 14,
    elevation: 2, borderLeftWidth: 4, marginBottom: 10,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06,
  },
  statIcon: { fontSize: 28 },
  statVal: { fontSize: 24, fontWeight: '900', color: '#1E293B' },
  statLbl: { fontSize: 12, color: '#64748B', fontWeight: '600', marginTop: 2 },

  // CARTE BTN
  carteBtn: {
    backgroundColor: '#fff', marginHorizontal: 16, marginTop: 4,
    borderRadius: 18, padding: 18, flexDirection: 'row', alignItems: 'center',
    elevation: 3, borderWidth: 1.5, borderColor: '#E2E8F0',
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.08,
  },
  carteBtnIcon: { fontSize: 32, marginRight: 14 },
  carteBtnTitre: { fontSize: 15, fontWeight: '800', color: '#1E293B' },
  carteBtnSub: { fontSize: 12, color: '#64748B', marginTop: 2 },
  carteBtnArrow: { marginLeft: 'auto', fontSize: 24, color: '#CBD5E1' },

  // INFO CARD
  infoCard: {
    backgroundColor: VERT, margin: 16, borderRadius: 20, padding: 20,
    alignItems: 'center', elevation: 8,
    borderWidth: 2, borderColor: ORANGE,
  },
  infoCardTitre: { color: '#fff', fontSize: 16, fontWeight: '800', textAlign: 'center' },
  infoCardSub: { color: 'rgba(255,255,255,0.7)', fontSize: 12, marginTop: 4, fontStyle: 'italic' },
  infoCardBadge: {
    backgroundColor: 'rgba(16,185,129,0.2)', paddingHorizontal: 14,
    paddingVertical: 6, borderRadius: 20, marginTop: 10,
    borderWidth: 1, borderColor: 'rgba(16,185,129,0.4)',
  },
  infoCardBadgeTxt: { color: '#34D399', fontSize: 12, fontWeight: '700' },

  // FAB
  fab: {
    position: 'absolute', bottom: 28, right: 20,
    backgroundColor: ORANGE, borderRadius: 32,
    paddingHorizontal: 18, paddingVertical: 14,
    flexDirection: 'row', alignItems: 'center', elevation: 10,
    shadowColor: ORANGE, shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.4, shadowRadius: 12,
  },
  fabIcon: { fontSize: 22 },
  fabTxt: { color: '#fff', fontSize: 14, fontWeight: '800', marginLeft: 8 },
});