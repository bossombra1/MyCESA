import React, { useMemo, useRef, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Animated,
  ScrollView,
  Alert,
  Platform,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const BOTTOM_ITEMS = [
  { label: 'Accueil', icon: '🏠', screen: 'Home' },
  { label: 'Emploi', icon: '🕐', screen: 'EmploiTemps' },
  { label: 'Profil', icon: '👤', screen: 'Profil' },
];

const MENU_ITEMS = [
  { label: 'Mes Notes', icon: '📝', screen: 'Notes' },
  { label: 'Mes Absences', icon: '📅', screen: 'Absences' },
  { label: 'Mes Paiements', icon: '💰', screen: 'Paiements' },
  { label: 'Notifications', icon: '🔔', screen: 'Notifications' },
  { label: 'Assistant MyCESA', icon: '🤖', screen: 'ChatBot' },
  { label: 'Ma Carte Scolaire', icon: '🪪', screen: 'Carte' },
];

export default function AppShell({ navigation, currentScreen, title, children }) {
  const insets = useSafeAreaInsets();
  const [menuOpen, setMenuOpen] = useState(false);
  const slideAnim = useRef(new Animated.Value(-280)).current;

  const safeTitle = useMemo(() => title || 'MyCESA', [title]);

  const closeMenu = () => {
    Animated.timing(slideAnim, { toValue: -280, duration: 220, useNativeDriver: true }).start(() => setMenuOpen(false));
  };

  const openMenu = () => {
    setMenuOpen(true);
    Animated.timing(slideAnim, { toValue: 0, duration: 220, useNativeDriver: true }).start();
  };

  const handleNav = (screen) => {
    closeMenu();
    if (screen !== currentScreen) {
      setTimeout(() => navigation.navigate(screen), 180);
    }
  };

  const handleLogout = async () => {
    const doLogout = async () => {
      await AsyncStorage.removeItem('token');
      await AsyncStorage.removeItem('user');
      navigation.replace('Login');
    };

    if (Platform.OS === 'web') {
      if (window.confirm('Voulez-vous vous déconnecter ?')) doLogout();
      return;
    }

    Alert.alert('Déconnexion', 'Voulez-vous vous déconnecter ?', [
      { text: 'Annuler', style: 'cancel' },
      { text: 'Déconnexion', style: 'destructive', onPress: doLogout },
    ]);
  };

  return (
    <View style={styles.page}>
      {menuOpen && <TouchableOpacity style={styles.overlay} activeOpacity={1} onPress={closeMenu} />}

      <Animated.View style={[styles.sidebar, { paddingTop: insets.top + 16, transform: [{ translateX: slideAnim }] }]}>
        <Text style={styles.menuTitle}>Menu</Text>
        <ScrollView showsVerticalScrollIndicator={false}>
          {MENU_ITEMS.map((item) => (
            <TouchableOpacity key={item.screen} style={styles.menuItem} onPress={() => handleNav(item.screen)}>
              <Text style={styles.menuItemIcon}>{item.icon}</Text>
              <Text style={styles.menuItemLabel}>{item.label}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
          <Text style={styles.logoutTxt}>Se déconnecter</Text>
        </TouchableOpacity>
      </Animated.View>

      <View style={styles.header}>
        <TouchableOpacity onPress={openMenu} style={styles.menuBtn}>
          <Text style={styles.menuBtnTxt}>☰</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{safeTitle}</Text>
      </View>

      <View style={styles.content}>{children}</View>

      <View style={[styles.bottomBar, { paddingBottom: insets.bottom + 8 }]}>
        {BOTTOM_ITEMS.map((item) => {
          const active = currentScreen === item.screen;
          return (
            <TouchableOpacity key={item.screen} style={styles.bottomItem} onPress={() => handleNav(item.screen)}>
              <Text style={[styles.bottomIcon, active && styles.bottomIconActive]}>{item.icon}</Text>
              <Text style={[styles.bottomLabel, active && styles.bottomLabelActive]}>{item.label}</Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  page: { flex: 1, backgroundColor: '#F4F7FF' },
  overlay: {
    position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
    backgroundColor: 'rgba(15, 23, 42, 0.35)', zIndex: 20,
  },
  sidebar: {
    position: 'absolute', left: 0, top: 0, bottom: 0,
    width: 270, backgroundColor: '#FFFFFF', zIndex: 30,
    borderRightWidth: 1, borderRightColor: '#E2E8F0', paddingHorizontal: 16,
  },
  menuTitle: { fontSize: 20, fontWeight: '800', color: '#0F172A', marginBottom: 18 },
  menuItem: {
    flexDirection: 'row', alignItems: 'center', gap: 10,
    paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#EEF2FF',
  },
  menuItemIcon: { fontSize: 18 },
  menuItemLabel: { fontSize: 14, fontWeight: '600', color: '#1E293B' },
  logoutBtn: {
    marginVertical: 16, backgroundColor: '#FEE2E2', borderRadius: 12,
    paddingVertical: 12, alignItems: 'center',
  },
  logoutTxt: { color: '#B91C1C', fontWeight: '700' },
  header: {
    paddingTop: 14, paddingHorizontal: 16, paddingBottom: 12,
    flexDirection: 'row', alignItems: 'center', backgroundColor: '#ffffff',
    borderBottomWidth: 1, borderBottomColor: '#E2E8F0',
  },
  menuBtn: {
    width: 38, height: 38, borderRadius: 10, backgroundColor: '#EEF2FF',
    justifyContent: 'center', alignItems: 'center',
  },
  menuBtnTxt: { fontSize: 18, color: '#1D4ED8' },
  headerTitle: { marginLeft: 12, fontSize: 18, fontWeight: '800', color: '#0F172A' },
  content: { flex: 1 },
  bottomBar: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-around',
    paddingTop: 10, backgroundColor: '#FFFFFF', borderTopWidth: 1, borderTopColor: '#E2E8F0',
  },
  bottomItem: { alignItems: 'center', gap: 4, paddingHorizontal: 12 },
  bottomIcon: { fontSize: 20, color: '#64748B' },
  bottomIconActive: { color: '#2563EB' },
  bottomLabel: { fontSize: 12, color: '#64748B', fontWeight: '600' },
  bottomLabelActive: { color: '#1D4ED8', fontWeight: '800' },
});
