import React, { useEffect, useState, useCallback } from 'react';
import {
  View, Text, StyleSheet, ScrollView,
  ActivityIndicator, TouchableOpacity, RefreshControl
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import API from '../api/api';

export default function NotificationsScreen() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

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
    } catch (err) {
      console.log('Erreur marquer lu:', err);
    }
  };

  const marquerTousLus = async () => {
    try {
      const stored = await AsyncStorage.getItem('user');
      const user = JSON.parse(stored);
      await API.put(`/notifications/user/${user.Id_UTILISATEUR}/lire-tout`);
      setNotifications(prev => prev.map(n => ({ ...n, Lu: 1 })));
    } catch (err) {
      console.log('Erreur marquer tous lus:', err);
    }
  };

  const getIcone = (titre) => {
    if (titre?.includes('note')) return '📝';
    if (titre?.includes('bsence')) return '📅';
    if (titre?.includes('aiement') || titre?.includes('ersion')) return '💰';
    return '🔔';
  };

  const nonLus = notifications.filter(n => !n.Lu).length;

  if (loading) return (
    <View style={styles.center}>
      <ActivityIndicator size="large" color="#2563EB" />
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.headerBox}>
        <View style={styles.headerRow}>
          <Text style={styles.headerTitre}>🔔 Notifications</Text>
          {nonLus > 0 && (
            <View style={styles.badgeTotal}>
              <Text style={styles.badgeTotalTxt}>{nonLus} non lu(s)</Text>
            </View>
          )}
        </View>
        {nonLus > 0 && (
          <TouchableOpacity style={styles.toutLireBtn} onPress={marquerTousLus}>
            <Text style={styles.toutLireTxt}>✓ Tout marquer comme lu</Text>
          </TouchableOpacity>
        )}
      </View>

      <ScrollView
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={() => {
            setRefreshing(true);
            loadNotifications();
          }} />
        }
      >
        {notifications.length === 0 ? (
          <View style={styles.emptyBox}>
            <Text style={styles.emptyIcon}>🔕</Text>
            <Text style={styles.emptyTxt}>Aucune notification</Text>
          </View>
        ) : (
          notifications.map((notif, index) => (
            <TouchableOpacity
              key={index}
              style={[styles.card, !notif.Lu && styles.cardNonLu]}
              onPress={() => !notif.Lu && marquerLu(notif.Id_EVENEMENT)}
            >
              <View style={styles.cardLeft}>
                <Text style={styles.icone}>{getIcone(notif.Titre_Notif)}</Text>
              </View>
              <View style={styles.cardRight}>
                <View style={styles.cardTop}>
                  <Text style={styles.titre} numberOfLines={1}>{notif.Titre_Notif}</Text>
                  {!notif.Lu && <View style={styles.dot} />}
                </View>
                <Text style={styles.message} numberOfLines={2}>{notif.Message_Notif}</Text>
                <Text style={styles.date}>
                  {new Date(notif.Date_Notif).toLocaleDateString('fr-FR', {
                    day: '2-digit', month: 'short', year: 'numeric',
                    hour: '2-digit', minute: '2-digit'
                  })}
                </Text>
              </View>
            </TouchableOpacity>
          ))
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F0F4FF' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  headerBox: { backgroundColor: '#1B2A4A', padding: 24, paddingTop: 32 },
  headerRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  headerTitre: { color: '#fff', fontSize: 22, fontWeight: '800' },
  badgeTotal: { backgroundColor: '#EF4444', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20 },
  badgeTotalTxt: { color: '#fff', fontSize: 12, fontWeight: '700' },
  toutLireBtn: { marginTop: 10, alignSelf: 'flex-start', backgroundColor: 'rgba(255,255,255,0.15)', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20 },
  toutLireTxt: { color: '#fff', fontSize: 13, fontWeight: '600' },
  emptyBox: { alignItems: 'center', marginTop: 80 },
  emptyIcon: { fontSize: 48 },
  emptyTxt: { fontSize: 16, color: '#64748B', marginTop: 12 },
  card: { backgroundColor: '#fff', marginHorizontal: 12, marginTop: 8, borderRadius: 16, padding: 14, flexDirection: 'row', elevation: 2 },
  cardNonLu: { backgroundColor: '#EFF6FF', borderLeftWidth: 4, borderLeftColor: '#2563EB' },
  cardLeft: { marginRight: 12, justifyContent: 'center' },
  icone: { fontSize: 28 },
  cardRight: { flex: 1 },
  cardTop: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  titre: { fontSize: 14, fontWeight: '700', color: '#1B2A4A', flex: 1 },
  dot: { width: 10, height: 10, borderRadius: 5, backgroundColor: '#2563EB', marginLeft: 8 },
  message: { fontSize: 13, color: '#64748B', marginTop: 4, lineHeight: 18 },
  date: { fontSize: 11, color: '#94A3B8', marginTop: 6 },
});