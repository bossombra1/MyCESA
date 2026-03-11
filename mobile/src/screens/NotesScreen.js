import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import API from '../api/api';

export default function NotesScreen() {
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadNotes();
  }, []);

  const loadNotes = async () => {
    try {
      const stored = await AsyncStorage.getItem('user');
      const user = JSON.parse(stored);
      const response = await API.get(`/evaluations/${user.Id_UTILISATEUR}/notes`);
      setNotes(response.data);
    } catch (err) {
      Alert.alert('Erreur', 'Impossible de charger les notes');
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <View style={styles.center}><ActivityIndicator size="large" color="#2563EB" /></View>;

  return (
    <ScrollView style={styles.container}>
      <View style={styles.headerBox}>
        <Text style={styles.headerTitre}>📝 Mes Notes</Text>
        <Text style={styles.headerSub}>{notes.length} évaluation(s)</Text>
      </View>

      {notes.length === 0 ? (
        <View style={styles.emptyBox}>
          <Text style={styles.emptyIcon}>📭</Text>
          <Text style={styles.emptyTxt}>Aucune note disponible</Text>
        </View>
      ) : (
        notes.map((note, index) => (
          <View key={index} style={styles.card}>
            <View style={styles.cardTop}>
              <Text style={styles.matiere}>{note.Lib_Evaluation}</Text>
              <View style={[styles.noteBadge, { backgroundColor: parseFloat(note.Note_Evaluation) >= 10 ? '#D1FAE5' : '#FEE2E2' }]}>
                <Text style={[styles.noteVal, { color: parseFloat(note.Note_Evaluation) >= 10 ? '#065F46' : '#991B1B' }]}>
                  {note.Note_Evaluation}/20
                </Text>
              </View>
            </View>
            <Text style={styles.cardInfo}>Type : {note.Type_Evaluation || 'N/A'} • Coef : {note.Coef_Evaluation || 'N/A'}</Text>
            <Text style={styles.cardInfo}>Semestre : {note.Lib_Sem || 'N/A'}</Text>
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
  headerSub: { color: '#94A3B8', fontSize: 14, marginTop: 4 },
  emptyBox: { alignItems: 'center', marginTop: 80 },
  emptyIcon: { fontSize: 48 },
  emptyTxt: { fontSize: 16, color: '#64748B', marginTop: 12 },
  card: { backgroundColor: '#fff', margin: 12, marginBottom: 0, borderRadius: 16, padding: 16, elevation: 2 },
  cardTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  matiere: { fontSize: 15, fontWeight: '700', color: '#1B2A4A', flex: 1 },
  noteBadge: { paddingHorizontal: 12, paddingVertical: 4, borderRadius: 20 },
  noteVal: { fontSize: 15, fontWeight: '800' },
  cardInfo: { fontSize: 13, color: '#64748B', marginTop: 2 },
});