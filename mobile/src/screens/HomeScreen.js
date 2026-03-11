import React, { useEffect, useState, useRef } from 'react';
import {
  View, Text, StyleSheet, ScrollView,
  TouchableOpacity, Alert, Platform, StatusBar,
  Animated, Dimensions
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import API from '../api/api';

const { width } = Dimensions.get('window');

export default function HomeScreen({ navigation }) {
  const [user, setUser] = useState(null);
  const [menuVisible, setMenuVisible] = useState(false);
  const [stats, setStats] = useState({ notes: 0, absences: 0, paiements: 0, cours: 0 });
  const menuAnim = useRef(new Animated.Value(-300)).current;

  useEffect(() => {
    loadUser();
  }, []);

  const loadUser = async () => {
    try {
      const stored = await AsyncStorage.getItem('user');
      if (stored) {
        const u = JSON.parse(stored);
        setUser(u);
        loadStats(u);
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
      setStats({
        notes: notesRes.status === 'fulfilled' ? notesRes.value.data.length : 0,
        absences: absRes.status === 'fulfilled' ? absRes.value.data.absences?.length || 0 : 0,
        paiements: paiRes.status === 'fulfilled' ? paiRes.value.data.paiements?.length || 0 : 0,
      });
    } catch (e) {}
  };

  const toggleMenu = () => {
    if (menuVisible) {
      Animated.timing(menuAnim, {
        toValue: -300,
        duration: 280,
        useNativeDriver: true,
      }).start(() => setMenuVisible(false));
    } else {
      setMenuVisible(true);
      Animated.timing(menuAnim, {
        toValue: 0,
        duration: 280,
        useNativeDriver: true,
      }).start();
    }
  };

  const handleLogout = async () => {
    toggleMenu();
    setTimeout(async () => {
      if (Platform.OS === 'web') {
        if (window.confirm('Voulez-vous vous déconnecter ?')) {
          await AsyncStorage.removeItem('token');
          await AsyncStorage.removeItem('user');
          navigation.replace('Login');
        }
      } else {
        Alert.alert('Déconnexion', 'Voulez-vous vous déconnecter ?', [
          { text: 'Annuler', style: 'cancel' },
          {
            text: 'Déconnexion', style: 'destructive', onPress: async () => {
              await AsyncStorage.removeItem('token');
              await AsyncStorage.removeItem('user');
              navigation.replace('Login');
            }
          }
        ]);
      }
    }, 300);
  };

  const navigateTo = (screen) => {
    toggleMenu();
    setTimeout(() => navigation.navigate(screen), 300);
  };

  const initiale = user?.Nom_User?.charAt(0)?.toUpperCase() || 'E';

  const menuItems = [
    { icon: '📝', label: 'Mes Notes', screen: 'Notes' },
    { icon: '📅', label: 'Mes Absences', screen: 'Absences' },
    { icon: '💰', label: 'Mes Paiements', screen: 'Paiements' },
    { icon: '🕐', label: 'Emploi du Temps', screen: 'EmploiTemps' },
    { icon: '🔔', label: 'Notifications', screen: 'Notifications' },
    { icon: '🤖', label: 'Assistant MyCESA', screen: 'ChatBot' },
    { icon: '🪪', label: 'Ma Carte Scolaire', screen: 'Carte' },
    { icon: '👤', label: 'Mon Profil', screen: 'Profil' },
  ];

  return (
    <View style={styles.wrapper}>
      <StatusBar barStyle="light-content" backgroundColor="#0A1929" />

      {/* OVERLAY */}
      {menuVisible && (
        <TouchableOpacity
          style={styles.overlay}
          activeOpacity={1}
          onPress={toggleMenu}
        />
      )}

      {/* MENU DÉROULANT */}
      <Animated.View style={[styles.drawer, { transform: [{ translateX: menuAnim }] }]}>
        
        {/* PROFIL */}
        <View style={styles.drawerHeader}>
          <View style={styles.drawerAvatar}>
            <Text style={styles.drawerAvatarTxt}>{initiale}</Text>
          </View>
          <Text style={styles.drawerNom}>{user?.Nom_User || 'Étudiant'}</Text>
          <Text style={styles.drawerRole}>{user?.Lib_Role || ''}</Text>
          <Text style={styles.drawerEmail}>{user?.Email_User || ''}</Text>
        </View>

        {/* ITEMS */}
        <ScrollView style={styles.drawerItems}>
          {menuItems.map((item, index) => (
            <TouchableOpacity
              key={index}
              style={styles.drawerItem}
              onPress={() => navigateTo(item.screen)}
            >
              <Text style={styles.drawerItemIcon}>{item.icon}</Text>
              <Text style={styles.drawerItemLabel}>{item.label}</Text>
              <Text style={styles.drawerItemArrow}>›</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* DÉCONNEXION */}
        <TouchableOpacity style={styles.drawerLogout} onPress={handleLogout}>
          <Text style={styles.drawerLogoutIcon}>🚪</Text>
          <Text style={styles.drawerLogoutTxt}>Se déconnecter</Text>
        </TouchableOpacity>
      </Animated.View>

      {/* CONTENU PRINCIPAL */}
      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>

        {/* HEADER */}
        <View style={styles.header}>
          <TouchableOpacity style={styles.menuBtn} onPress={toggleMenu}>
            <Text style={styles.menuBtnIcon}>☰</Text>
          </TouchableOpacity>
          <View style={styles.headerCenter}>
            <Text style={styles.headerTitle}>MyCESA</Text>
          </View>
          <View style={styles.drawerAvatarSmall}>
            <Text style={styles.drawerAvatarSmallTxt}>{initiale}</Text>
          </View>
        </View>

        {/* SALUTATION */}
        <View style={styles.greetBox}>
          <Text style={styles.greetTxt}>
            {new Date().getHours() < 12 ? 'Bonjour' : new Date().getHours() < 18 ? 'Bon après-midi' : 'Bonsoir'} 👋
          </Text>
          <Text style={styles.greetNom}>{user?.Nom_User || 'Étudiant'}</Text>
          <View style={styles.greetBadge}>
            <Text style={styles.greetBadgeTxt}>{user?.Lib_Role || 'Étudiant'}</Text>
          </View>
        </View>

        {/* STATS */}
        <Text style={styles.sectionTitre}>Mes Statistiques</Text>

        <View style={styles.statsGrid}>
          <View style={[styles.statCard, { backgroundColor: '#EFF6FF', borderColor: '#BFDBFE' }]}>
            <Text style={styles.statIcon}>📝</Text>
            <Text style={styles.statVal}>{stats.notes}</Text>
            <Text style={styles.statLbl}>Notes</Text>
          </View>
          <View style={[styles.statCard, { backgroundColor: '#FFF7ED', borderColor: '#FED7AA' }]}>
            <Text style={styles.statIcon}>📅</Text>
            <Text style={styles.statVal}>{stats.absences}</Text>
            <Text style={styles.statLbl}>Absences</Text>
          </View>
          <View style={[styles.statCard, { backgroundColor: '#F0FDF4', borderColor: '#BBF7D0' }]}>
            <Text style={styles.statIcon}>💰</Text>
            <Text style={styles.statVal}>{stats.paiements}</Text>
            <Text style={styles.statLbl}>Paiements</Text>
          </View>
        </View>

        {/* CARTE INFO */}
        <View style={styles.infoCard}>
          <View>
            <Text style={styles.infoCardTitre}>🎓 MyCESA</Text>
            <Text style={styles.infoCardSub}>Application de Gestion Scolaire</Text>
          </View>
          <View style={styles.infoCardBadge}>
            <Text style={styles.infoCardBadgeTxt}>● En ligne</Text>
          </View>
        </View>

        <View style={{ height: 120 }} />
      </ScrollView>

      {/* FAB CHATBOT */}
      <TouchableOpacity
        style={styles.fab}
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
  wrapper: { flex: 1, backgroundColor: '#F0F4FF' },
  container: { flex: 1 },

  // OVERLAY
  overlay: {
    position: 'absolute',
    top: 0, left: 0, right: 0, bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.5)',
    zIndex: 10,
  },

  // DRAWER
  drawer: {
    position: 'absolute',
    top: 0, left: 0, bottom: 0,
    width: 280,
    backgroundColor: '#fff',
    zIndex: 20,
    shadowColor: '#000',
    shadowOffset: { width: 4, height: 0 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 20,
  },
  drawerHeader: {
    backgroundColor: '#1B2A4A',
    padding: 24,
    paddingTop: 48,
    alignItems: 'center',
  },
  drawerAvatar: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: '#2563EB',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: '#60A5FA',
    marginBottom: 12,
  },
  drawerAvatarTxt: { color: '#fff', fontSize: 28, fontWeight: '800' },
  drawerNom: { color: '#fff', fontSize: 18, fontWeight: '800', textAlign: 'center' },
  drawerRole: { color: '#60A5FA', fontSize: 13, marginTop: 4 },
  drawerEmail: { color: '#94A3B8', fontSize: 12, marginTop: 2 },
  drawerItems: { flex: 1, paddingTop: 8 },
  drawerItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  drawerItemIcon: { fontSize: 22, marginRight: 14 },
  drawerItemLabel: { flex: 1, fontSize: 15, fontWeight: '600', color: '#1B2A4A' },
  drawerItemArrow: { fontSize: 20, color: '#94A3B8' },
  drawerLogout: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
    backgroundColor: '#FFF1F2',
  },
  drawerLogoutIcon: { fontSize: 22, marginRight: 12 },
  drawerLogoutTxt: { fontSize: 15, fontWeight: '700', color: '#EF4444' },

  // HEADER
  header: {
    backgroundColor: '#1B2A4A',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: Platform.OS === 'ios' ? 52 : (StatusBar.currentHeight || 24) + 12,
    paddingBottom: 16,
  },
  menuBtn: {
    width: 40, height: 40,
    justifyContent: 'center', alignItems: 'center',
  },
  menuBtnIcon: { color: '#fff', fontSize: 24 },
  headerCenter: { flex: 1, alignItems: 'center' },
  headerTitle: { color: '#fff', fontSize: 20, fontWeight: '800' },
  drawerAvatarSmall: {
    width: 40, height: 40,
    borderRadius: 20,
    backgroundColor: '#2563EB',
    justifyContent: 'center',
    alignItems: 'center',
  },
  drawerAvatarSmallTxt: { color: '#fff', fontSize: 16, fontWeight: '800' },

  // SALUTATION
  greetBox: {
    backgroundColor: '#1B2A4A',
    paddingHorizontal: 20,
    paddingBottom: 28,
    borderBottomLeftRadius: 28,
    borderBottomRightRadius: 28,
  },
  greetTxt: { color: '#94A3B8', fontSize: 14 },
  greetNom: { color: '#fff', fontSize: 26, fontWeight: '800', marginTop: 4 },
  greetBadge: {
    backgroundColor: 'rgba(255,255,255,0.15)',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 20,
    alignSelf: 'flex-start',
    marginTop: 8,
  },
  greetBadgeTxt: { color: '#60A5FA', fontSize: 13, fontWeight: '600' },

  // STATS
  sectionTitre: {
    fontSize: 18, fontWeight: '800', color: '#1B2A4A',
    marginHorizontal: 16, marginTop: 24, marginBottom: 12,
  },
  statsGrid: {
    flexDirection: 'row',
    paddingHorizontal: 12,
    gap: 10,
  },
  statCard: {
    flex: 1,
    borderWidth: 1.5,
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
    elevation: 2,
  },
  statIcon: { fontSize: 28, marginBottom: 8 },
  statVal: { fontSize: 28, fontWeight: '800', color: '#1B2A4A' },
  statLbl: { fontSize: 12, color: '#64748B', marginTop: 4, fontWeight: '600' },

  // CARTE INFO
  infoCard: {
    backgroundColor: '#2563EB',
    margin: 16,
    borderRadius: 20,
    padding: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    elevation: 8,
  },
  infoCardTitre: { color: '#fff', fontSize: 18, fontWeight: '800' },
  infoCardSub: { color: 'rgba(255,255,255,0.7)', fontSize: 12, marginTop: 4 },
  infoCardBadge: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  infoCardBadgeTxt: { color: '#86EFAC', fontSize: 12, fontWeight: '700' },

  // FAB
  fab: {
    position: 'absolute',
    bottom: 28, right: 20,
    backgroundColor: '#2563EB',
    borderRadius: 32,
    paddingHorizontal: 18,
    paddingVertical: 14,
    flexDirection: 'row',
    alignItems: 'center',
    elevation: 10,
  },
  fabIcon: { fontSize: 22 },
  fabTxt: { color: '#fff', fontSize: 14, fontWeight: '800', marginLeft: 8 },
});