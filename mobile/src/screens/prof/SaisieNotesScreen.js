import React, { useEffect, useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  ActivityIndicator, StatusBar, TextInput, Alert, Platform
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../../context/ThemeContext';
import API from '../../api/api';

const VERT   = '#2E7D32';
const ORANGE = '#D84315';

export default function SaisieNotesScreen({ route, navigation }) {
  const { etudiant } = route.params || {};
  const [matieres,   setMatieres]   = useState([]);
  const [notes,      setNotes]      = useState({});
  const [prof,       setProf]       = useState(null);
  const [loading,    setLoading]    = useState(true);
  const [saving,     setSaving]     = useState(false);
  const insets   = useSafeAreaInsets();
  const themeCtx = useTheme();
  const theme    = themeCtx?.theme || {
    bg: '#F5F7F5', card: '#FFFFFF', cardBorder: '#E2E8F0',
    text: '#1E293B', textSub: '#64748B', textMuted: '#94A3B8',
  };

  useEffect(() => { loadData(); }, []);

  const loadData = async () => {
    try {
      const stored = await AsyncStorage.getItem('user');
      const u      = JSON.parse(stored);
      setProf(u);
      // Charger matières du prof
      const res = await API.get(`/emploiTemps/professeur/${u.Id_UTILISATEUR}`);
      // Dédoublonner les matières
      const mat = res.data.reduce((acc, cur) => {
        if (!acc.find(m => m.Id_MATIERE === cur.Id_MATIERE)) {
          acc.push({ Id_MATIERE: cur.Id_MATIERE, Nom_Matiere: cur.Nom_Matiere });
        }
        return acc;
      }, []);
      setMatieres(mat);
    } catch (err) {
      console.log('Erreur saisie notes:', err);
    } finally {
      setLoading(false);
    }
  };

  const enregistrer = async () => {
    const notesAEnregistrer = Object.entries(notes).filter(([_, v]) => v !== '');
    if (!notesAEnregistrer.length) {
      Alert.alert('Attention', 'Entrez au moins une note');
      return;
    }
    setSaving(true);
    try {
      for (const [Id_MATIERE, Note] of notesAEnregistrer) {
        const noteVal = parseFloat(Note);
        if (isNaN(noteVal) || noteVal < 0 || noteVal > 20) {
          Alert.alert('Erreur', `Note invalide pour la matière ${Id_MATIERE} (0-20)`);
          setSaving(false);
          return;
        }
        await API.post('/evaluations/saisie', {
          Id_ETUDIANT:   etudiant.Id_ETUDIANT,
          Id_MATIERE:    parseInt(Id_MATIERE),
          Id_PROFESSEUR: prof.Id_UTILISATEUR,
          Note:          noteVal,
          Semestre:      1,
        });
      }
      Alert.alert('✅ Succès', 'Notes enregistrées avec succès !', [
        { text: 'OK', onPress: () => navigation.goBack() }
      ]);
    } catch (err) {
      Alert.alert('Erreur', err.response?.data?.error || 'Erreur lors de la sauvegarde');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return (
    <View style={[styles.center, { backgroundColor: theme.bg }]}>
      <ActivityIndicator size="large" color={VERT} />
    </View>
  );

  return (
    <View style={[styles.wrapper, { backgroundColor: theme.bg }]}>
      <StatusBar barStyle="light-content" backgroundColor={VERT} />
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: insets.bottom + 24 }}
        keyboardShouldPersistTaps="handled"
      >
        {/* HERO */}
        <View style={styles.hero}>
          <View style={styles.deco1} />
          <View style={styles.deco2} />
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
            <Text style={styles.backTxt}>← Retour</Text>
          </TouchableOpacity>
          <Text style={styles.heroTitre}>📝 Saisie des Notes</Text>
          <Text style={styles.heroSub}>
            🎓 {etudiant?.Nom_Etudiant} {etudiant?.Prenoms_Etudiant}
          </Text>
          <Text style={styles.heroMatricule}>📋 {etudiant?.Matricule_Etudiant}</Text>
        </View>

        {/* MATIÈRES */}
        <View style={{ padding: 16, gap: 12 }}>
          <Text style={[styles.sectionTitre, { color: theme.text }]}>
            Entrez les notes sur 20
          </Text>

          {matieres.length === 0 ? (
            <View style={[styles.emptyBox, { backgroundColor: theme.card }]}>
              <Text style={styles.emptyIcon}>📚</Text>
              <Text style={[styles.emptyTitre, { color: theme.text }]}>Aucune matière</Text>
              <Text style={[styles.emptyTxt, { color: theme.textSub }]}>
                Aucune matière assignée à votre emploi du temps
              </Text>
            </View>
          ) : (
            matieres.map((mat) => {
              const note = notes[mat.Id_MATIERE] || '';
              const noteVal = parseFloat(note);
              const couleur = !note ? theme.cardBorder
                : noteVal >= 10 ? VERT
                : ORANGE;
              return (
                <View key={`mat-${mat.Id_MATIERE}`} style={[styles.matiereCard, { backgroundColor: theme.card, borderColor: couleur }]}>
                  <View style={styles.matiereTop}>
                    <Text style={[styles.matiereNom, { color: theme.text }]}>{mat.Nom_Matiere}</Text>
                    {note !== '' && (
                      <View style={[styles.noteBadge, { backgroundColor: noteVal >= 10 ? VERT + '20' : ORANGE + '20' }]}>
                        <Text style={[styles.noteBadgeTxt, { color: noteVal >= 10 ? VERT : ORANGE }]}>
                          {noteVal >= 10 ? '✓ Admis' : '✗ Insuffisant'}
                        </Text>
                      </View>
                    )}
                  </View>
                  <View style={styles.noteInputRow}>
                    <TextInput
                      style={[styles.noteInput, {
                        backgroundColor: theme.bg,
                        borderColor: couleur,
                        color: theme.text,
                      }]}
                      placeholder="Note /20"
                      placeholderTextColor={theme.textMuted}
                      keyboardType="decimal-pad"
                      value={note}
                      onChangeText={(v) => setNotes(prev => ({ ...prev, [mat.Id_MATIERE]: v }))}
                      maxLength={4}
                    />
                    <Text style={[styles.surVingt, { color: theme.textSub }]}> / 20</Text>
                  </View>
                </View>
              );
            })
          )}

          {/* BOUTON ENREGISTRER */}
          {matieres.length > 0 && (
            <TouchableOpacity
              style={[styles.saveBtn, { backgroundColor: saving ? '#94A3B8' : VERT }]}
              onPress={enregistrer}
              disabled={saving}
            >
              {saving
                ? <ActivityIndicator color="#fff" />
                : <Text style={styles.saveBtnTxt}>✅ Enregistrer les notes</Text>
              }
            </TouchableOpacity>
          )}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: { flex: 1 },
  center:  { flex: 1, justifyContent: 'center', alignItems: 'center' },
  hero: {
    backgroundColor: VERT,
    paddingTop: Platform.OS === 'ios' ? 20 : (StatusBar.currentHeight || 24) + 16,
    paddingBottom: 28, paddingHorizontal: 20,
    borderBottomLeftRadius: 32, borderBottomRightRadius: 32, overflow: 'hidden',
  },
  deco1: { position: 'absolute', width: 180, height: 180, borderRadius: 90, backgroundColor: 'rgba(255,255,255,0.07)', top: -50, right: -30 },
  deco2: { position: 'absolute', width: 120, height: 120, borderRadius: 60, backgroundColor: 'rgba(255,255,255,0.05)', bottom: -20, left: -20 },
  backBtn:       { marginBottom: 12 },
  backTxt:       { color: 'rgba(255,255,255,0.8)', fontSize: 14, fontWeight: '600' },
  heroTitre:     { color: '#fff', fontSize: 22, fontWeight: '900', marginBottom: 8 },
  heroSub:       { color: 'rgba(255,255,255,0.9)', fontSize: 16, fontWeight: '700' },
  heroMatricule: { color: 'rgba(255,255,255,0.7)', fontSize: 13, marginTop: 4 },
  sectionTitre:  { fontSize: 15, fontWeight: '800', marginBottom: 4 },
  matiereCard:   { borderRadius: 16, padding: 16, elevation: 2, borderWidth: 2 },
  matiereTop:    { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  matiereNom:    { fontSize: 15, fontWeight: '800', flex: 1 },
  noteBadge:     { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 10 },
  noteBadgeTxt:  { fontSize: 11, fontWeight: '700' },
  noteInputRow:  { flexDirection: 'row', alignItems: 'center' },
  noteInput:     { flex: 1, height: 48, borderRadius: 12, paddingHorizontal: 16, fontSize: 18, fontWeight: '800', borderWidth: 1.5, textAlign: 'center' },
  surVingt:      { fontSize: 16, fontWeight: '600', marginLeft: 8 },
  saveBtn:       { borderRadius: 16, padding: 16, alignItems: 'center', marginTop: 8, elevation: 3 },
  saveBtnTxt:    { color: '#fff', fontSize: 16, fontWeight: '900' },
  emptyBox:      { borderRadius: 16, padding: 32, alignItems: 'center', elevation: 1 },
  emptyIcon:     { fontSize: 48, marginBottom: 12 },
  emptyTitre:    { fontSize: 16, fontWeight: '800', marginBottom: 4 },
  emptyTxt:      { fontSize: 13, textAlign: 'center' },
});