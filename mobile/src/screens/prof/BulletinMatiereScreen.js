import React, { useEffect, useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  ActivityIndicator, StatusBar, Platform
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../../context/ThemeContext';
import API from '../../api/api';

const VERT   = '#2E7D32';
const ORANGE = '#D84315';

export default function BulletinMatiereScreen({ route, navigation }) {
  const { etudiant, matiere } = route.params || {};
  const [notes,   setNotes]   = useState([]);
  const [loading, setLoading] = useState(true);
  const insets   = useSafeAreaInsets();
  const themeCtx = useTheme();
  const theme    = themeCtx?.theme || {
    bg: '#F5F7F5', card: '#FFFFFF', cardBorder: '#E2E8F0',
    text: '#1E293B', textSub: '#64748B', textMuted: '#94A3B8',
  };

  useEffect(() => { loadNotes(); }, []);

  const loadNotes = async () => {
    setLoading(true);
    try {
      const res = await API.get(`/evaluations/${etudiant.Id_ETUDIANT}/notes`);
      // Filtrer uniquement les notes de cette matière
      const notesMat = res.data.filter(n => n.Id_MATIERE === matiere.Id_MATIERE);
      setNotes(notesMat);
    } catch (err) {
      console.log('Erreur bulletin matière:', err);
      setNotes([]);
    } finally {
      setLoading(false);
    }
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

  // Moyenne pondérée par coef
  const moyenneMatiere = (notesList) => {
    const vals = notesList
      .map(n => ({ v: parseFloat(n.Note_Evaluation), c: parseFloat(n.Coef_Evaluation) || 1 }))
      .filter(x => !isNaN(x.v));
    if (!vals.length) return null;
    const totalCoef = vals.reduce((s, x) => s + x.c, 0);
    return (vals.reduce((s, x) => s + x.v * x.c, 0) / totalCoef).toFixed(2);
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
        contentContainerStyle={{ paddingBottom: insets.bottom + 24 }}
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
              <Text style={styles.matiereHeroSub}>Bulletin de notes</Text>
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

        <View style={{ padding: 16, gap: 12 }}>
          {notes.length === 0 ? (
            <View style={[styles.emptyBox, { backgroundColor: theme.card }]}>
              <Text style={styles.emptyIcon}>📭</Text>
              <Text style={[styles.emptyTitre, { color: theme.text }]}>Aucune note</Text>
              <Text style={[styles.emptyTxt, { color: theme.textSub }]}>
                Pas encore de notes pour {matiere?.Nom_Matiere}
              </Text>
              <TouchableOpacity
                style={[styles.saisirBtn, { backgroundColor: VERT }]}
                onPress={() => navigation.navigate('SaisieNotesMatiere', { etudiant, matiere })}
              >
                <Text style={styles.saisirBtnTxt}>📝 Saisir des notes</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <>
              {/* NOTES PAR SEMESTRE */}
              {[1, 2].map(sem => {
                const notesSem = notes.filter(n => n.Id_SEMESTRE === sem);
                if (!notesSem.length) return null;

                const moy     = moyenneMatiere(notesSem);
                const mention = getMention(moy);
                const couleur = moy ? (parseFloat(moy) >= 10 ? VERT : ORANGE) : theme.cardBorder;

                return (
                  <View key={`sem-${sem}`}>
                    {/* TITRE SEMESTRE */}
                    <View style={[styles.semHeader, { backgroundColor: VERT + '15', borderColor: VERT }]}>
                      <Text style={[styles.semTitre, { color: VERT }]}>📅 Semestre {sem}</Text>
                      <Text style={[styles.semCount, { color: VERT }]}>{notesSem.length} note(s)</Text>
                    </View>

                    {/* MOYENNE SEMESTRE */}
                    {moy && (
                      <View style={[styles.moyenneCard, { backgroundColor: theme.card, borderColor: couleur + '40' }]}>
                        <View style={{ flex: 1 }}>
                          <Text style={[styles.moyenneTitre, { color: theme.textSub }]}>
                            Moyenne S{sem} — {matiere?.Nom_Matiere}
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

                    {/* LISTE DES NOTES */}
                    {notesSem.map((n, ni) => {
                      const noteVal = parseFloat(n.Note_Evaluation);
                      const coul    = noteVal >= 10 ? VERT : ORANGE;
                      const ment    = getMention(noteVal);
                      return (
                        <View
                          key={`note-${sem}-${ni}`}
                          style={[styles.noteCard, { backgroundColor: theme.card, borderLeftColor: coul }]}
                        >
                          <View style={{ flex: 1 }}>
                            <View style={styles.noteHead}>
                              <View style={[styles.typeBadge, { backgroundColor: VERT + '20' }]}>
                                <Text style={[styles.typeBadgeTxt, { color: VERT }]}>
                                  {n.Type_Evaluation || 'Devoir'}
                                </Text>
                              </View>
                              {n.Coef_Evaluation && n.Coef_Evaluation !== 1 && (
                                <View style={[styles.coefBadge, { backgroundColor: '#F1F5F9' }]}>
                                  <Text style={[styles.coefBadgeTxt, { color: theme.textSub }]}>
                                    Coef. {n.Coef_Evaluation}
                                  </Text>
                                </View>
                              )}
                            </View>
                            {n.Nom_Professeur && (
                              <Text style={[styles.noteProf, { color: theme.textMuted }]}>
                                👨‍🏫 {n.Nom_Professeur}
                              </Text>
                            )}
                            <Text style={[styles.noteDate, { color: theme.textMuted }]}>
                              📅 {new Date(n.Date_Evaluation).toLocaleDateString('fr-FR')}
                            </Text>
                          </View>
                          <View style={{ alignItems: 'flex-end', gap: 6 }}>
                            <Text style={[styles.noteValeur, { color: coul }]}>
                              {noteVal.toFixed(2)}
                              <Text style={[styles.noteValeurSur, { color: theme.textMuted }]}>/20</Text>
                            </Text>
                            {ment && (
                              <View style={[styles.mentionBadge, { backgroundColor: ment.bg }]}>
                                <Text style={[styles.mentionTxt, { color: ment.color }]}>{ment.txt}</Text>
                              </View>
                            )}
                          </View>
                        </View>
                      );
                    })}
                  </View>
                );
              })}

              {/* BOUTON AJOUTER/MODIFIER */}
              <TouchableOpacity
                style={[styles.saisirBtn, { backgroundColor: VERT }]}
                onPress={() => navigation.navigate('SaisieNotesMatiere', { etudiant, matiere })}
              >
                <Text style={styles.saisirBtnTxt}>📝 Modifier / Ajouter des notes</Text>
              </TouchableOpacity>
            </>
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
  deco1: { position: 'absolute', width: 200, height: 200, borderRadius: 100, backgroundColor: 'rgba(255,255,255,0.07)', top: -60, right: -40 },
  deco2: { position: 'absolute', width: 130, height: 130, borderRadius: 65, backgroundColor: 'rgba(255,255,255,0.05)', bottom: -20, left: -20 },
  backBtn:        { marginBottom: 14 },
  backTxt:        { color: 'rgba(255,255,255,0.8)', fontSize: 14, fontWeight: '600' },
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
  semHeader:    { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', borderRadius: 10, padding: 10, borderWidth: 1.5, marginBottom: 8 },
  semTitre:     { fontSize: 14, fontWeight: '800' },
  semCount:     { fontSize: 12, fontWeight: '600' },
  moyenneCard:  { borderRadius: 14, padding: 16, elevation: 2, flexDirection: 'row', alignItems: 'center', borderWidth: 1.5, marginBottom: 10 },
  moyenneTitre: { fontSize: 12, fontWeight: '600', marginBottom: 4 },
  moyenneVal:   { fontSize: 32, fontWeight: '900' },
  moyenneSur:   { fontSize: 16 },
  mentionBadge: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 12 },
  mentionTxt:   { fontSize: 12, fontWeight: '700' },
  noteCard:     { borderRadius: 14, padding: 14, elevation: 2, borderLeftWidth: 4, flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 8 },
  noteHead:     { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 6 },
  typeBadge:    { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 },
  typeBadgeTxt: { fontSize: 11, fontWeight: '700' },
  coefBadge:    { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8 },
  coefBadgeTxt: { fontSize: 11, fontWeight: '600' },
  noteProf:     { fontSize: 11, marginBottom: 2 },
  noteDate:     { fontSize: 11 },
  noteValeur:   { fontSize: 22, fontWeight: '900' },
  noteValeurSur:{ fontSize: 13 },
  emptyBox:     { borderRadius: 16, padding: 32, alignItems: 'center' },
  emptyIcon:    { fontSize: 48, marginBottom: 12 },
  emptyTitre:   { fontSize: 16, fontWeight: '800', marginBottom: 4 },
  emptyTxt:     { fontSize: 13, textAlign: 'center', marginBottom: 16 },
  saisirBtn:    { borderRadius: 14, padding: 14, alignItems: 'center', elevation: 2 },
  saisirBtnTxt: { color: '#fff', fontSize: 14, fontWeight: '800' },
});