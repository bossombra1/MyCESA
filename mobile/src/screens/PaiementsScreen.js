import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import API from '../api/api';

export default function PaiementsScreen() {
  const [data, setData] = useState({ paiements: [], totalPaye: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => { loadPaiements(); }, []);

  const loadPaiements = async () => {
    try {
      const stored = await AsyncStorage.getItem('user');
      const user = JSON.parse(stored);
      const response = await API.get(`/versements/etudiant/${user.Id_UTILISATEUR}`);
      setData(response.data);
    } catch (err) {
      Alert.alert('Erreur', 'Impossible de charger les paiements');
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <View style={styles.center}><ActivityIndicator size="large" color="#2563EB" /></View>;

  return (
    <ScrollView style={styles.container}>
      <View style={styles.headerBox}>
        <Text style={styles.headerTitre}>💰 Mes Paiements</Text>
        <View style={styles.totalBox}>
          <Text style={styles.totalLabel}>Total payé</Text>
          <Text style={styles.totalVal}>{data.totalPaye.toLocaleString()} FCFA</Text>
        </View>
      </View>

      {data.paiements.length === 0 ? (
        <View style={styles.emptyBox}>
          <Text style={styles.emptyIcon}>📭</Text>
          <Text style={styles.emptyTxt}>Aucun paiement enregistré</Text>
        </View>
      ) : (
        data.paiements.map((p, index) => (
          <View key={index} style={styles.card}>
            <View style={styles.cardTop}>
              <Text style={styles.libelle}>{p.Lib_Versement || 'Paiement scolarité'}</Text>
              <Text style={styles.montant}>{parseFloat(p.Montant).toLocaleString()} FCFA</Text>
            </View>
            <Text style={styles.cardInfo}>
              Date : {new Date(p.Date_Versement).toLocaleDateString('fr-FR')}
            </Text>
            <View style={styles.statutBadge}>
              <Text style={styles.statutTxt}>✅ {p.Statut || 'Payé'}</Text>
            </View>
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
  libelle: { fontSize: 15, fontWeight: '700', color: '#1B2A4A', flex: 1 },
  montant: { fontSize: 16, fontWeight: '800', color: '#16A34A' },
  cardInfo: { fontSize: 13, color: '#64748B', marginTop: 2 },
  statutBadge: { backgroundColor: '#D1FAE5', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20, alignSelf: 'flex-start', marginTop: 8 },
  statutTxt: { fontSize: 12, fontWeight: '700', color: '#065F46' },
});