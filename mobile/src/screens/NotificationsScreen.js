import React, { useEffect, useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, ActivityIndicator,
  TouchableOpacity, RefreshControl, StatusBar
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../context/ThemeContext';
import API from '../api/api';
import { Alert } from 'react-native';

// notifications push activées lors du build APK
const envoyerNotificationLocale = async (titre, corps) => {
  Alert.alert(titre, corps + '\n\n(Push notifications disponibles sur l\'APK final)');
};

const VERT   = '#2E7D32';
const ORANGE = '#D84315';

const getIcone = (titre) => {
  const t = (titre || '').toLowerCase();
  if (t.includes('note') || t.includes('évaluation')) return { icon: '📝', color: '#2563EB', bg: '#EFF6FF' };
  if (t.includes('absence')) return { icon: '📅', color: ORANGE, bg: '#FFF7ED' };
  if (t.includes('paiement') || t.includes('versement')) return { icon: '💰', color: VERT, bg: '#F0FDF4' };
  if (t.includes('annonce') || t.includes('info')) return { icon: '📢', color: '#7C3AED', bg: '#FDF4FF' };
  return { icon: '🔔', color: '#0EA5E9', bg: '#F0F9FF' };
};

export default function NotificationsScreen() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const insets = useSafeAreaInsets();
  const { theme } = useTheme();

  useEffect(() => { loadNotifications(); }, []);

  const loadNotifications = async () => {
    try {
      const stored = await AsyncStorage.getItem('user');
      const user = JSON.parse(stored);
      const response = await API.get(`/notifications/user/${user.Id_UTILISATEUR}`);
      setNotifications(response.data);
    } catch (err) {
      console.log('Erreur notifications:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const marquerLu = async (Id_EVENEMENT) => {
    try {
      await API.put(`/notifications/${Id_EVENEMENT}/lire`);
      setNotifications(prev =>
        prev.map(n => n.Id_EVENEMENT === Id_EVENEMENT ? { ...n, Lu: 1 } : n)
      );
    } catch (err) { console.log('Erreur marquer lu:', err); }
  };

  const marquerTousLus = async () => {
    try {
      const stored = await AsyncStorage.getItem('user');
      const user = JSON.parse(stored);
      await API.put(`/notifications/user/${user.Id_UTILISATEUR}/lire-tout`);
      setNotifications(prev => prev.map(n => ({ ...n, Lu: 1 })));
    } catch (err) { console.log('Erreur marquer tous lus:', err); }
  };

  const nonLus = notifications.filter(n => !n.Lu).length;
  const lus = notifications.filter(n => n.Lu).length;

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
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); loadNotifications(); }} colors={[VERT]} />}
        contentContainerStyle={{ paddingBottom: insets.bottom + 24 }}
      >

        {/* HERO */}
        <View style={styles.hero}>
          <View style={styles.decoCircle1} />
          <View style={styles.decoCircle2} />

          <View style={styles.heroTop}>
            <Text style={styles.heroTitre}>🔔 Notifications</Text>
            {nonLus > 0 && (
              <View style={styles.nonLuBadge}>
                <Text style={styles.nonLuBadgeTxt}>{nonLus} nouveau{nonLus > 1 ? 'x' : ''}</Text>
              </View>
            )}
          </View>
          <Text style={styles.heroSub}>{notifications.length} notification(s) au total</Text>

          {/* STATS */}
          <View style={styles.statsRow}>
            <View style={styles.statCard}>
              <Text style={[styles.statVal, { color: ORANGE }]}>{nonLus}</Text>
              <Text style={styles.statLabel}>Non lues</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statCard}>
              <Text style={[styles.statVal, { color: '#4ADE80' }]}>{lus}</Text>
              <Text style={styles.statLabel}>Lues</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statCard}>
              <Text style={[styles.statVal, { color: '#60A5FA' }]}>{notifications.length}</Text>
              <Text style={styles.statLabel}>Total</Text>
            </View>
          </View>

          {/* BOUTON TOUT MARQUER */}
          {nonLus > 0 && (
            <TouchableOpacity style={styles.toutLireBtn} onPress={marquerTousLus}>
              <Text style={styles.toutLireTxt}>✓ Tout marquer comme lu</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* BOUTON TEST NOTIFICATION */}
        <TouchableOpacity
          style={{ margin: 16, backgroundColor: '#2E7D32', padding: 14, borderRadius: 14, alignItems: 'center' }}
          onPress={() => envoyerNotificationLocale('🎓 MyCESA', 'Test notification push réussie !')}
        >
          <Text style={{ color: '#fff', fontWeight: '800' }}>🔔 Tester une notification</Text>
        </TouchableOpacity>

        {/* LISTE */}
        <View style={styles.listContainer}>
          {notifications.length === 0 ? (
            <View style={styles.emptyBox}>
              <Text style={styles.emptyIcon}>🔕</Text>
              <Text style={styles.emptyTitre}>Aucune notification</Text>
              <Text style={styles.emptyTxt}>Vous êtes à jour !</Text>
            </View>
          ) : (
            notifications.map((notif, index) => {
              const { icon, color, bg } = getIcone(notif.Titre_Notif);
              const nonLu = !notif.Lu;
              return (
                <TouchableOpacity
                  key={index}
                  style={[styles.card, { backgroundColor: theme.card }, nonLu && { borderLeftColor: color, backgroundColor: bg + '40' }]}
                  onPress={() => nonLu && marquerLu(notif.Id_EVENEMENT)}
                  activeOpacity={0.85}
                >
                  {/* ICONE */}
                  <View style={[styles.iconeBox, { backgroundColor: bg, borderColor: color + '40' }]}>
                    <Text style={styles.icone}>{icon}</Text>
                  </View>

                  {/* CONTENU */}
                  <View style={styles.cardContent}>
                    <View style={styles.cardTop}>
                      <Text style={[styles.titre, { color: theme.textSub }, nonLu && { color: theme.text, fontWeight: '900' }]} numberOfLines={1}>
                        {notif.Titre_Notif}
                      </Text>
                      {nonLu && <View style={[styles.dot, { backgroundColor: color }]} />}
                    </View>
                    <Text style={[styles.message, { color: theme.textSub }]} numberOfLines={2}>{notif.Message_Notif}</Text>
                    <View style={styles.cardFooter}>
                      <Text style={styles.date}>
                        🕐 {new Date(notif.Date_Notif).toLocaleDateString('fr-FR', {
                          day: '2-digit', month: 'short', year: 'numeric',
                          hour: '2-digit', minute: '2-digit'
                        })}
                      </Text>
                      {nonLu && (
                        <View style={[styles.statutBadge, { backgroundColor: bg, borderColor: color }]}>
                          <Text style={[styles.statutTxt, { color }]}>Nouveau</Text>
                        </View>
                      )}
                    </View>
                  </View>
                </TouchableOpacity>
              );
            })
          )}
        </View>

      </ScrollView>
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
  heroTop: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 4 },
  heroTitre: { color: '#fff', fontSize: 24, fontWeight: '900' },
  nonLuBadge: { backgroundColor: ORANGE, paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20 },
  nonLuBadgeTxt: { color: '#fff', fontSize: 12, fontWeight: '800' },
  heroSub: { color: 'rgba(255,255,255,0.7)', fontSize: 14, marginBottom: 20 },

  statsRow: {
    flexDirection: 'row', backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 16, padding: 16,
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.15)',
  },
  statCard: { flex: 1, alignItems: 'center' },
  statVal: { fontSize: 20, fontWeight: '900' },
  statLabel: { fontSize: 11, color: 'rgba(255,255,255,0.6)', marginTop: 3 },
  statDivider: { width: 1, backgroundColor: 'rgba(255,255,255,0.15)' },

  toutLireBtn: {
    marginTop: 14, alignSelf: 'flex-start',
    backgroundColor: 'rgba(255,255,255,0.15)',
    paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20,
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.25)',
  },
  toutLireTxt: { color: '#fff', fontSize: 13, fontWeight: '700' },

  listContainer: { padding: 16, paddingTop: 12, gap: 10 },
  emptyBox: { alignItems: 'center', marginTop: 60 },
  emptyIcon: { fontSize: 56 },
  emptyTitre: { fontSize: 20, fontWeight: '900', color: '#1E293B', marginTop: 12 },
  emptyTxt: { fontSize: 14, color: '#64748B', marginTop: 4 },

  card: {
    backgroundColor: '#fff', borderRadius: 18, padding: 14,
    flexDirection: 'row', elevation: 3, borderLeftWidth: 4,
    borderLeftColor: '#E2E8F0',
    shadowColor: '#000', shadowOffset: { width: 0, height: 3 }, shadowOpacity: 0.07,
  },
  iconeBox: {
    width: 48, height: 48, borderRadius: 14,
    justifyContent: 'center', alignItems: 'center',
    marginRight: 14, borderWidth: 1.5,
  },
  icone: { fontSize: 24 },
  cardContent: { flex: 1 },
  cardTop: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 },
  titre: { fontSize: 14, fontWeight: '700', color: '#475569', flex: 1 },
  dot: { width: 10, height: 10, borderRadius: 5, marginLeft: 8 },
  message: { fontSize: 13, color: '#64748B', lineHeight: 18, marginBottom: 8 },
  cardFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  date: { fontSize: 11, color: '#94A3B8' },
  statutBadge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 8, borderWidth: 1 },
  statutTxt: { fontSize: 11, fontWeight: '700' },
});