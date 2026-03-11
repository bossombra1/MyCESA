import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import API from '../api/api';

const JOURS = ['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi'];
const COULEURS = ['#EFF6FF', '#FFF7ED', '#F0FDF4', '#FDF4FF', '#FFF1F2', '#FFFBEB'];

export default function EmploiTempsScreen() {
  const [emploi, setEmploi] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { loadEmploi(); }, []);

  const loadEmploi = async () => {
    try {
      const stored = await AsyncStorage.getItem('user');
      const user = JSON.parse(stored);
      const response = await API.get(`/emploiTemps/etudiant/${user.Id_UTILISATEUR}`);
      setEmploi(response.data);
    } catch (err) {
      Alert.alert('Erreur', 'Impossible de charger l\'emploi du temps');
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <View style={styles.center}><ActivityIndicator size="large" color="#2563EB" /></View>;

  return (
    <ScrollView style={styles.container}>
      <View style={styles.headerBox}>
        <Text style={styles.headerTitre}>🕐 Emploi du Temps</Text>
        <Text style={styles.headerSub}>{emploi.length} cours programmé(s)</Text>
      </View>

      {emploi.length === 0 ? (
        <View style={styles.emptyBox}>
          <Text style={styles.emptyIcon}>📭</Text>
          <Text style={styles.emptyTxt}>Aucun cours programmé</Text>
        </View>
      ) : (
        JOURS.map((jour, ji) => {
          const cours = emploi.filter(e => e.Jour_Semaine === jour);
          if (!cours.length) return null;
          return (
            <View key={jour} style={styles.jourSection}>
              <Text style={styles.jourTitre}>{jour}</Text>
              {cours.map((c, i) => (
                <View key={i} style={[styles.card, { backgroundColor: COULEURS[ji % COULEURS.length] }]}>
                  <Text style={styles.matiere}>{c.Nom_Matiere}</Text>
                  <Text style={styles.horaire}>⏰ {c.Heure_Debut} — {c.Heure_Fin}</Text>
                  <Text style={styles.info}>📍 {c.Nom_Salle} {c.Localisation_Salle ? `(${c.Localisation_Salle})` : ''}</Text>
                  <Text style={styles.info}>👨‍🏫 {c.Nom_Professeur}</Text>
                </View>
              ))}
            </View>
          );
        })
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F0F4FF' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  headerBox: { backgroundColor: '#1B2A4A', padding: 24, paddingTop: 32 },
  headerTitre: { color: '#fff', fontSize: 22, fontWeight: '800' },
  headerSub: { color: '#94A3B8', fontSize: 14, marginTop: 4 },
  emptyBox: { alignItems: 'center', marginTop: 80 },
  emptyIcon: { fontSize: 48 },
  emptyTxt: { fontSize: 16, color: '#64748B', marginTop: 12 },
  jourSection: { marginHorizontal: 12, marginTop: 16 },
  jourTitre: { fontSize: 16, fontWeight: '800', color: '#1B2A4A', marginBottom: 8, paddingLeft: 4 },
  card: { borderRadius: 16, padding: 16, marginBottom: 8, elevation: 2 },
  matiere: { fontSize: 16, fontWeight: '800', color: '#1B2A4A', marginBottom: 6 },
  horaire: { fontSize: 14, fontWeight: '600', color: '#2563EB', marginBottom: 4 },
  info: { fontSize: 13, color: '#64748B', marginTop: 2 },
});