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
const TYPES_EVAL = ['Devoir', 'Examen', 'TP', 'Projet', 'Oral'];

export default function SaisieNotesMatiereScreen({ route, navigation }) {
  const { etudiant, matiere, semestre: semestreInit, prof: profInit } = route.params || {};
  const [prof,     setProf]     = useState(profInit || null);
  const [semestre, setSemestre] = useState(semestreInit || 1);
  const [lignes,   setLignes]   = useState([{ type: 'Devoir', note: '', coef: '1' }]);
  const [loading,  setLoading]  = useState(true);
  const [saving,   setSaving]   = useState(false);
  const insets   = useSafeAreaInsets();
  const themeCtx = useTheme();
  const theme    = themeCtx?.theme || {
    bg: '#F5F7F5', card: '#FFFFFF', cardBorder: '#E2E8F0',
    text: '#1E293B', textSub: '#64748B', textMuted: '#94A3B8',
  };

  useEffect(() => { loadNotesExistantes(); }, [semestre]);

  const loadNotesExistantes = async () => {
    setLoading(true);
    try {
      if (!prof) {
        const stored = await AsyncStorage.getItem('user');
        setProf(JSON.parse(stored));
      }
      const res = await API.get(`/evaluations/${etudiant.Id_ETUDIANT}/notes`);
      const notesMat = res.data.filter(
        n => n.Id_MATIERE === matiere.Id_MATIERE && n.Id_SEMESTRE === semestre
      );
      if (notesMat.length > 0) {
        setLignes(notesMat.map(n => ({
          type: n.Type_Evaluation || 'Devoir',
          note: String(n.Note_Evaluation || ''),
          coef: String(n.Coef_Evaluation || '1'),
          id:   n.Id_EVALUATION,
        })));
      } else {
        setLignes([{ type: 'Devoir', note: '', coef: '1' }]);
      }
    } catch (_) {
      setLignes([{ type: 'Devoir', note: '', coef: '1' }]);
    } finally {
      setLoading(false);
    }
  };

  const ajouterLigne = () => {
    setLignes(prev => [...prev, { type: 'Devoir', note: '', coef: '1' }]);
  };

  const supprimerLigne = (idx) => {
    if (lignes.length <= 1) return;
    setLignes(prev => prev.filter((_, i) => i !== idx));
  };

  const modifierLigne = (idx, champ, valeur) => {
    setLignes(prev => {
      const copy = [...prev];
      copy[idx] = { ...copy[idx], [champ]: valeur };
      return copy;
    });
  };

  const moyenne = () => {
    const vals = lignes
      .filter(l => l.note !== '')
      .map(l => ({ n: parseFloat(l.note), c: parseFloat(l.coef) || 1 }))
      .filter(l => !isNaN(l.n));
    if (!vals.length) return null;
    const totalCoef = vals.reduce((s, v) => s + v.c, 0);
    const total     = vals.reduce((s, v) => s + v.n * v.c, 0);
    return (total / totalCoef).toFixed(2);
  };

  const getMention = (note) => {
    const n = parseFloat(note);
    if (isNaN(n)) return null;
    if (n >= 16) return { txt: 'Très Bien',  color: '#065F46', bg: '#D1FAE5' };
    if (n >= 14) return { txt: 'Bien',       color: '#065F46', bg: '#D1FAE5' };
    if (n >= 12) return { txt: 'Assez Bien', color: '#92400E', bg: '#FEF3C7' };
    if (n >= 10) return { txt: 'Passable',   color: '#92400E', bg: '#FEF3C7' };
    return              { txt: 'Insuffisant',color: '#991B1B', bg: '#FEE2E2' };
  };

  const enregistrer = async () => {
    const lignesValides = lignes.filter(l => l.note !== '');
    if (!lignesValides.length) {
      Alert.alert('Attention', 'Entrez au moins une note');
      return;
    }
    for (const l of lignesValides) {
      const n = parseFloat(l.note);
      if (isNaN(n) || n < 0 || n > 20) {
        Alert.alert('Erreur', `Note invalide : ${l.note} (doit être entre 0 et 20)`);
        return;
      }
    }
    setSaving(true);
    try {
      const profData = prof || JSON.parse(await AsyncStorage.getItem('user'));
      for (const l of lignesValides) {
        await API.post('/evaluations/saisie', {
          Id_ETUDIANT:   etudiant.Id_ETUDIANT,
          Id_MATIERE:    matiere.Id_MATIERE,
          Id_PROFESSEUR: profData.Id_UTILISATEUR,
          Note:          parseFloat(l.note),
          Semestre:      semestre,
          Type:          l.type,
          Coef:          parseFloat(l.coef) || 1,
        });
      }
      Alert.alert('✅ Succès', `${lignesValides.length} note(s) enregistrée(s) pour ${matiere.Nom_Matiere} !`, [
        { text: 'Continuer', style: 'cancel', onPress: () => loadNotesExistantes() },
        { text: 'Retour',    onPress: () => navigation.goBack() },
      ]);
    } catch (err) {
      Alert.alert('Erreur', err.response?.data?.error || 'Erreur sauvegarde');
    } finally {
      setSaving(false);
    }
  };

  const moy     = moyenne();
  const mention = getMention(moy);
  const couleur = moy ? (parseFloat(moy) >= 10 ? VERT : ORANGE) : VERT;

  if (loading) return (
    <View style={[styles.center, { backgroundColor: theme.bg }]}>
      <ActivityIndicator size="large" color={VERT} />
    </View>
  );

  return (
    <View style={[styles.wrapper, { backgroundColor: theme.bg }]}>
      <StatusBar barStyle="light-content" backgroundColor={VERT} />
      <ScrollView
        contentContainerStyle={{ paddingBottom: insets.bottom + 24 }}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* HERO */}
        <View style={styles.hero}>
          <View style={styles.deco1} /><View style={styles.deco2} />
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
            <Text style={styles.backTxt}>← Retour</Text>
          </TouchableOpacity>

          {/* MATIÈRE */}
          <View style={styles.matiereHero}>
            <View style={[styles.matiereIconBox, { backgroundColor: 'rgba(255,255,255,0.2)' }]}>
              <Text style={styles.matiereIcon}>📖</Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.matiereHeroNom}>{matiere?.Nom_Matiere}</Text>
              <Text style={styles.matiereHeroSub}>Semestre {semestre}</Text>
            </View>
          </View>

          {/* ÉTUDIANT */}
          <View style={styles.etudiantBox}>
            <View style={styles.etudiantAvatar}>
              <Text style={styles.etudiantAvatarTxt}>
                {etudiant?.Nom_Etudiant?.charAt(0)?.toUpperCase()}
              </Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.etudiantNom}>
                {etudiant?.Nom_Etudiant} {etudiant?.Prenoms_Etudiant}
              </Text>
              <Text style={styles.etudiantMatricule}>📋 {etudiant?.Matricule_Etudiant}</Text>
              {etudiant?.Nom_Classe && (
                <Text style={styles.etudiantClasse}>📚 {etudiant?.Nom_Classe}</Text>
              )}
            </View>
          </View>
        </View>

        <View style={{ padding: 16, gap: 14 }}>
          {/* SEMESTRE */}
          <View style={[styles.semestreCard, { backgroundColor: theme.card }]}>
            <Text style={[styles.semestreTitre, { color: theme.text }]}>📅 Semestre</Text>
            <View style={styles.semestreRow}>
              {[1, 2].map(s => (
                <TouchableOpacity key={s}
                  style={[styles.semestreBtn, {
                    backgroundColor: semestre === s ? VERT : theme.bg,
                    borderColor:     semestre === s ? VERT : theme.cardBorder,
                  }]}
                  onPress={() => setSemestre(s)}
                >
                  <Text style={[styles.semestreBtnTxt, { color: semestre === s ? '#fff' : theme.textSub }]}>
                    Semestre {s}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* MOYENNE TEMPS RÉEL */}
          {moy && (
            <View style={[styles.moyenneCard, { backgroundColor: theme.card, borderColor: couleur + '40' }]}>
              <View style={{ flex: 1 }}>
                <Text style={[styles.moyenneTitre, { color: theme.textSub }]}>
                  Moyenne — {matiere?.Nom_Matiere}
                </Text>
                <Text style={[styles.moyenneVal, { color: couleur }]}>
                  {moy}<Text style={[styles.moyenneSur, { color: theme.textMuted }]}>/20</Text>
                </Text>
              </View>
              {mention && (
                <View style={[styles.mentionBadge, { backgroundColor: mention.bg }]}>
                  <Text style={[styles.mentionTxt, { color: mention.color }]}>{mention.txt}</Text>
                </View>
              )}
            </View>
          )}

          {/* TITRE */}
          <View style={styles.titreRow}>
            <Text style={[styles.titreSection, { color: theme.text }]}>
              📝 Notes — {lignes.length} ligne(s)
            </Text>
          </View>

          {/* LIGNES DE NOTES */}
          {lignes.map((ligne, idx) => {
            const noteVal = parseFloat(ligne.note);
            const coul    = !ligne.note ? theme.cardBorder : noteVal >= 10 ? VERT : ORANGE;
            return (
              <View key={`ligne-${idx}`} style={[styles.ligneCard, { backgroundColor: theme.card, borderLeftColor: coul }]}>
                {/* NUMÉRO + SUPPRIMER */}
                <View style={styles.ligneHead}>
                  <View style={[styles.ligneNumBadge, { backgroundColor: VERT + '20' }]}>
                    <Text style={[styles.ligneNum, { color: VERT }]}>#{idx + 1}</Text>
                  </View>
                  <Text style={[styles.ligneTitre, { color: theme.text }]}>
                    {ligne.type}
                    {ligne.coef !== '1' && ligne.coef !== '' ? ` — Coef. ${ligne.coef}` : ''}
                  </Text>
                  {lignes.length > 1 && (
                    <TouchableOpacity
                      style={[styles.suppBtn, { backgroundColor: '#FEE2E2' }]}
                      onPress={() => supprimerLigne(idx)}
                    >
                      <Text style={styles.suppBtnTxt}>🗑️</Text>
                    </TouchableOpacity>
                  )}
                </View>

                {/* TYPE */}
                <Text style={[styles.inputLabel, { color: theme.textSub }]}>Type d'évaluation</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 12 }}>
                  <View style={styles.typesRow}>
                    {TYPES_EVAL.map(t => (
                      <TouchableOpacity key={t}
                        style={[styles.typeBtn, {
                          backgroundColor: ligne.type === t ? VERT : theme.bg,
                          borderColor:     ligne.type === t ? VERT : theme.cardBorder,
                        }]}
                        onPress={() => modifierLigne(idx, 'type', t)}
                      >
                        <Text style={[styles.typeBtnTxt, { color: ligne.type === t ? '#fff' : theme.textSub }]}>
                          {t}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </ScrollView>

                {/* NOTE + COEF */}
                <View style={styles.noteCoefRow}>
                  <View style={{ flex: 2 }}>
                    <Text style={[styles.inputLabel, { color: theme.textSub }]}>Note /20</Text>
                    <View style={styles.noteInputWrapper}>
                      <TextInput
                        style={[styles.noteInput, { backgroundColor: theme.bg, borderColor: coul, color: theme.text }]}
                        placeholder="0.00"
                        placeholderTextColor={theme.textMuted}
                        keyboardType="decimal-pad"
                        value={ligne.note}
                        onChangeText={v => modifierLigne(idx, 'note', v)}
                        maxLength={5}
                      />
                      <Text style={[styles.surVingt, { color: theme.textSub }]}>/20</Text>
                    </View>
                  </View>
                  <View style={{ flex: 1, marginLeft: 12 }}>
                    <Text style={[styles.inputLabel, { color: theme.textSub }]}>Coefficient</Text>
                    <TextInput
                      style={[styles.coefInput, { backgroundColor: theme.bg, borderColor: theme.cardBorder, color: theme.text }]}
                      placeholder="1"
                      placeholderTextColor={theme.textMuted}
                      keyboardType="decimal-pad"
                      value={ligne.coef}
                      onChangeText={v => modifierLigne(idx, 'coef', v)}
                      maxLength={3}
                    />
                  </View>
                </View>

                {/* BOUTONS RAPIDES */}
                <Text style={[styles.inputLabel, { color: theme.textSub, marginTop: 10 }]}>Saisie rapide</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                  <View style={styles.quickBtns}>
                    {[0, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20].map(v => (
                      <TouchableOpacity key={v}
                        style={[styles.quickBtn, {
                          backgroundColor: parseFloat(ligne.note) === v ? VERT : theme.bg,
                          borderColor:     parseFloat(ligne.note) === v ? VERT : theme.cardBorder,
                        }]}
                        onPress={() => modifierLigne(idx, 'note', String(v))}
                      >
                        <Text style={[styles.quickBtnTxt, { color: parseFloat(ligne.note) === v ? '#fff' : theme.textSub }]}>
                          {v}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </ScrollView>

                {/* MENTION EN TEMPS RÉEL */}
                {ligne.note !== '' && getMention(ligne.note) && (
                  <View style={[styles.mentionRow, { backgroundColor: getMention(ligne.note).bg }]}>
                    <Text style={[styles.mentionRowTxt, { color: getMention(ligne.note).color }]}>
                      {noteVal.toFixed(2)}/20 — {getMention(ligne.note).txt}
                    </Text>
                  </View>
                )}
              </View>
            );
          })}

          {/* BOUTON AJOUTER LIGNE */}
          <TouchableOpacity
            style={[styles.ajouterBtn, { borderColor: VERT }]}
            onPress={ajouterLigne}
          >
            <Text style={[styles.ajouterBtnTxt, { color: VERT }]}>
              + Ajouter une autre note
            </Text>
          </TouchableOpacity>

          {/* BOUTON ENREGISTRER */}
          <TouchableOpacity
            style={[styles.saveBtn, { backgroundColor: saving ? '#94A3B8' : VERT }]}
            onPress={enregistrer}
            disabled={saving}
          >
            {saving
              ? <ActivityIndicator color="#fff" />
              : <Text style={styles.saveBtnTxt}>
                  ✅ Enregistrer {lignes.filter(l => l.note !== '').length} note(s)
                </Text>
            }
          </TouchableOpacity>
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
  deco1: { position: 'absolute', width: 200, height: 200, borderRadius: 100, backgroundColor: 'rgba(255,255,255,0.07)', top: -60, right: -40 },
  deco2: { position: 'absolute', width: 130, height: 130, borderRadius: 65, backgroundColor: 'rgba(255,255,255,0.05)', bottom: -20, left: -20 },
  backBtn:  { marginBottom: 14 },
  backTxt:  { color: 'rgba(255,255,255,0.8)', fontSize: 14, fontWeight: '600' },
  matiereHero:    { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 14 },
  matiereIconBox: { width: 48, height: 48, borderRadius: 14, justifyContent: 'center', alignItems: 'center' },
  matiereIcon:    { fontSize: 24 },
  matiereHeroNom: { color: '#fff', fontSize: 20, fontWeight: '900' },
  matiereHeroSub: { color: 'rgba(255,255,255,0.7)', fontSize: 12, marginTop: 2 },
  etudiantBox:       { flexDirection: 'row', alignItems: 'center', gap: 12, backgroundColor: 'rgba(255,255,255,0.15)', borderRadius: 14, padding: 12 },
  etudiantAvatar:    { width: 44, height: 44, borderRadius: 22, backgroundColor: 'rgba(255,255,255,0.25)', justifyContent: 'center', alignItems: 'center' },
  etudiantAvatarTxt: { fontSize: 20, fontWeight: '900', color: '#fff' },
  etudiantNom:       { color: '#fff', fontSize: 15, fontWeight: '800' },
  etudiantMatricule: { color: 'rgba(255,255,255,0.75)', fontSize: 12, marginTop: 2 },
  etudiantClasse:    { color: 'rgba(255,255,255,0.7)', fontSize: 11, marginTop: 2 },
  semestreCard:   { borderRadius: 14, padding: 12, elevation: 2 },
  semestreTitre:  { fontSize: 13, fontWeight: '700', marginBottom: 8 },
  semestreRow:    { flexDirection: 'row', gap: 10 },
  semestreBtn:    { flex: 1, paddingVertical: 10, borderRadius: 12, alignItems: 'center', borderWidth: 1.5 },
  semestreBtnTxt: { fontSize: 13, fontWeight: '700' },
  moyenneCard:    { borderRadius: 14, padding: 16, elevation: 2, flexDirection: 'row', alignItems: 'center', borderWidth: 1.5 },
  moyenneTitre:   { fontSize: 12, fontWeight: '600', marginBottom: 4 },
  moyenneVal:     { fontSize: 32, fontWeight: '900' },
  moyenneSur:     { fontSize: 16 },
  mentionBadge:   { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 12 },
  mentionTxt:     { fontSize: 12, fontWeight: '700' },
  titreRow:       { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  titreSection:   { fontSize: 15, fontWeight: '800' },
  ligneCard:      { borderRadius: 16, padding: 16, elevation: 2, borderLeftWidth: 4, gap: 8 },
  ligneHead:      { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 4 },
  ligneNumBadge:  { width: 28, height: 28, borderRadius: 8, justifyContent: 'center', alignItems: 'center' },
  ligneNum:       { fontSize: 12, fontWeight: '900' },
  ligneTitre:     { flex: 1, fontSize: 14, fontWeight: '700' },
  suppBtn:        { width: 36, height: 36, borderRadius: 10, justifyContent: 'center', alignItems: 'center' },
  suppBtnTxt:     { fontSize: 16 },
  inputLabel:     { fontSize: 11, fontWeight: '700', marginBottom: 6 },
  typesRow:       { flexDirection: 'row', gap: 8 },
  typeBtn:        { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 12, borderWidth: 1.5 },
  typeBtnTxt:     { fontSize: 12, fontWeight: '700' },
  noteCoefRow:    { flexDirection: 'row', alignItems: 'flex-end' },
  noteInputWrapper:{ flexDirection: 'row', alignItems: 'center', gap: 6 },
  noteInput:      { flex: 1, height: 50, borderRadius: 12, paddingHorizontal: 14, fontSize: 22, fontWeight: '900', borderWidth: 1.5, textAlign: 'center' },
  surVingt:       { fontSize: 14, fontWeight: '600' },
  coefInput:      { height: 50, borderRadius: 12, paddingHorizontal: 12, fontSize: 18, fontWeight: '700', borderWidth: 1.5, textAlign: 'center' },
  quickBtns:      { flexDirection: 'row', gap: 5 },
  quickBtn:       { width: 36, height: 36, borderRadius: 8, justifyContent: 'center', alignItems: 'center', borderWidth: 1.5 },
  quickBtnTxt:    { fontSize: 11, fontWeight: '700' },
  mentionRow:     { borderRadius: 10, padding: 8, alignItems: 'center', marginTop: 4 },
  mentionRowTxt:  { fontSize: 13, fontWeight: '800' },
  ajouterBtn:     { borderRadius: 14, padding: 14, alignItems: 'center', borderWidth: 2, borderStyle: 'dashed' },
  ajouterBtnTxt:  { fontSize: 14, fontWeight: '700' },
  saveBtn:        { borderRadius: 16, padding: 16, alignItems: 'center', elevation: 3 },
  saveBtnTxt:     { color: '#fff', fontSize: 16, fontWeight: '900' },
});