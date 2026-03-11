import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import API from '../api/api';

export default function AbsencesScreen() {
  const [data, setData] = useState({ absences: [], totalHeures: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => { loadAbsences(); }, []);

  const loadAbsences = async () => {
    try {
      const stored = await AsyncStorage.getItem('user');
      const user = JSON.parse(stored);
      const response = await API.get(`/absences/etudiant/${user.Id_UTILISATEUR}`);
      setData(response.data);
    } catch (err) {
      Alert.alert('Erreur', 'Impossible de charger les absences');
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <View style={styles.center}><ActivityIndicator size="large" color="#2563EB" /></View>;

  return (
    <ScrollView style={styles.container}>
      <View style={styles.headerBox}>
        <Text style={styles.headerTitre}>📅 Mes Absences</Text>
        <View style={styles.totalBox}>
          <Text style={styles.totalLabel}>Total heures d'absence</Text>
          <Text style={styles.totalVal}>{data.totalHeures}h</Text>
        </View>
      </View>

      {data.absences.length === 0 ? (
        <View style={styles.emptyBox}>
          <Text style={styles.emptyIcon}>✅</Text>
          <Text style={styles.emptyTxt}>Aucune absence enregistrée</Text>
        </View>
      ) : (
        data.absences.map((abs, index) => (
          <View key={index} style={styles.card}>
            <View style={styles.cardTop}>
              <Text style={styles.date}>{new Date(abs.Date_absence).toLocaleDateString('fr-FR')}</Text>
              <View style={[styles.badge, { backgroundColor: abs.Justifiee ? '#D1FAE5' : '#FEE2E2' }]}>
                <Text style={[styles.badgeTxt, { color: abs.Justifiee ? '#065F46' : '#991B1B' }]}>
                  {abs.Justifiee ? 'Justifiée' : 'Non justifiée'}
                </Text>
              </View>
            </View>
            <Text style={styles.cardInfo}>Durée : {abs.Nbre_heure}h</Text>
            {abs.Saisie_Par && <Text style={styles.cardInfo}>Saisi par : {abs.Saisie_Par}</Text>}
          </View>
        ))
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F0F4FF' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  headerBox: { backgroundColor: '#1B2A4A', padding: 24, paddingTop: 32 },
  headerTitre: { color: '#fff', fontSize: 22, fontWeight: '800' },
  totalBox: { backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: 12, padding: 12, marginTop: 12 },
  totalLabel: { color: '#94A3B8', fontSize: 13 },
  totalVal: { color: '#fff', fontSize: 28, fontWeight: '800', marginTop: 4 },
  emptyBox: { alignItems: 'center', marginTop: 80 },
  emptyIcon: { fontSize: 48 },
  emptyTxt: { fontSize: 16, color: '#64748B', marginTop: 12 },
  card: { backgroundColor: '#fff', margin: 12, marginBottom: 0, borderRadius: 16, padding: 16, elevation: 2 },
  cardTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  date: { fontSize: 15, fontWeight: '700', color: '#1B2A4A' },
  badge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20 },
  badgeTxt: { fontSize: 12, fontWeight: '700' },
  cardInfo: { fontSize: 13, color: '#64748B', marginTop: 2 },
});