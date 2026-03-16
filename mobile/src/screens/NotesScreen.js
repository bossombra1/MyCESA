import React, { useEffect, useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, ActivityIndicator,
  TouchableOpacity, RefreshControl, StatusBar, Platform
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import API from '../api/api';
import { useTheme } from '../context/ThemeContext';

const BLEU   = '#2E7D32';
const BLEU2  = '#2563EB';
const VERT   = '#059669';
const ORANGE = '#D97706';
const ROUGE  = '#DC2626';

export default function NotesScreen() {
  const [notes,      setNotes]      = useState([]);
  const [loading,    setLoading]    = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [semestreActif, setSemestreActif] = useState(null);
  const insets = useSafeAreaInsets();
  const { theme, isDark } = useTheme();

  useEffect(() => { loadNotes(); }, []);

  const loadNotes = async () => {
    try {
      const stored = await AsyncStorage.getItem('user');
      const user   = JSON.parse(stored);
      const res    = await API.get(`/evaluations/${user.Id_UTILISATEUR}/notes`);
      setNotes(res.data);
      // Activer le premier semestre par défaut
      if (res.data.length > 0) {
        const premiers = [...new Set(res.data.map(n => n.Id_SEMESTRE))].sort();
        setSemestreActif(premiers[0]);
      }
    } catch (err) {
      console.log('Erreur notes:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const getMention = (note) => {
    const n = parseFloat(note);
    if (isNaN(n)) return null;
    if (n >= 16) return { txt: 'Très Bien',  color: '#065F46', bg: '#D1FAE5', bar: VERT };
    if (n >= 14) return { txt: 'Bien',       color: '#065F46', bg: '#D1FAE5', bar: VERT };
    if (n >= 12) return { txt: 'Assez Bien', color: '#92400E', bg: '#FEF3C7', bar: ORANGE };
    if (n >= 10) return { txt: 'Passable',   color: '#92400E', bg: '#FEF3C7', bar: ORANGE };
    return              { txt: 'Insuffisant',color: '#991B1B', bg: '#FEE2E2', bar: ROUGE };
  };

  // Grouper par semestre puis par matière
  const semestres = [...new Set(notes.map(n => n.Id_SEMESTRE))].filter(Boolean).sort();

  const notesFiltrees = semestreActif
    ? notes.filter(n => n.Id_SEMESTRE === semestreActif)
    : notes;

  // Grouper par matière
  const parMatiere = notesFiltrees.reduce((acc, n) => {
    const key = String(n.Id_MATIERE || 0);
    if (!acc[key]) acc[key] = {
      nom:   n.Nom_Matiere    || n.Lib_Evaluation || `Matière ${n.Id_MATIERE}`,
      prof:  n.Nom_Professeur || null,
      notes: [],
    };
    acc[key].notes.push(n);
    return acc;
  }, {});

  // Moyenne pondérée d'une liste de notes
  const moyenneNotes = (notesList) => {
    const vals = notesList
      .map(n => ({ v: parseFloat(n.Note_Evaluation), c: parseFloat(n.Coef_Evaluation) || 1 }))
      .filter(x => !isNaN(x.v));
    if (!vals.length) return null;
    const totalCoef = vals.reduce((s, x) => s + x.c, 0);
    return (vals.reduce((s, x) => s + x.v * x.c, 0) / totalCoef).toFixed(2);
  };

  // Moyenne générale (moyenne des moyennes par matière)
  const moyenneGenerale = () => {
    const moys = Object.values(parMatiere)
      .map(m => moyenneNotes(m.notes))
      .filter(v => v !== null)
      .map(v => parseFloat(v));
    if (!moys.length) return null;
    return (moys.reduce((s, v) => s + v, 0) / moys.length).toFixed(2);
  };

  const moyGen    = moyenneGenerale();
  const mentionGen = getMention(moyGen);

  // Stats globales
  const toutesNotes = notes.map(n => parseFloat(n.Note_Evaluation)).filter(v => !isNaN(v));
  const reussies = toutesNotes.filter(v => v >= 10).length;
  const echouees = toutesNotes.filter(v => v < 10).length;

  if (loading) return (
    <View style={[styles.center, { backgroundColor: theme.bg }]}>
      <ActivityIndicator size="large" color={BLEU2} />
    </View>
  );

  return (
    <View style={[styles.wrapper, { backgroundColor: theme.bg }]}>
      <StatusBar barStyle="light-content" backgroundColor={BLEU} />
      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); loadNotes(); }} colors={[BLEU2]} />}
        contentContainerStyle={{ paddingBottom: insets.bottom + 24 }}
      >
        {/* ── HERO ── */}
        <View style={[styles.hero, { backgroundColor: isDark ? '#1E293B' : BLEU }]}>
          <View style={styles.deco1} /><View style={styles.deco2} /><View style={styles.deco3} />
          <Text style={styles.heroTitre}>📝 Mon Bulletin</Text>
          <Text style={styles.heroSub}>Année Académique 2025-2026</Text>

          {/* STATS RAPIDES */}
          {notes.length > 0 && (
            <View style={styles.statsRow}>
              <View style={styles.statCard}>
                <Text style={[styles.statVal, { color: mentionGen ? mentionGen.bar : '#60A5FA' }]}>
                  {moyGen || '-'}
                </Text>
                <Text style={styles.statLabel}>Moy. Gén.</Text>
              </View>
              <View style={styles.statDiv} />
              <View style={styles.statCard}>
                <Text style={[styles.statVal, { color: '#4ADE80' }]}>{reussies}</Text>
                <Text style={styles.statLabel}>Réussies</Text>
              </View>
              <View style={styles.statDiv} />
              <View style={styles.statCard}>
                <Text style={[styles.statVal, { color: '#F87171' }]}>{echouees}</Text>
                <Text style={styles.statLabel}>Échouées</Text>
              </View>
              <View style={styles.statDiv} />
              <View style={styles.statCard}>
                <Text style={[styles.statVal, { color: '#60A5FA' }]}>{notes.length}</Text>
                <Text style={styles.statLabel}>Total</Text>
              </View>
            </View>
          )}
        </View>

        {notes.length === 0 ? (
          <View style={[styles.emptyBox, { backgroundColor: theme.card, margin: 16 }]}>
            <Text style={styles.emptyIcon}>📭</Text>
            <Text style={[styles.emptyTitre, { color: theme.text }]}>Aucune note</Text>
            <Text style={[styles.emptyTxt, { color: theme.textSub }]}>
              Vos notes apparaîtront ici dès que vos professeurs les auront saisies
            </Text>
          </View>
        ) : (
          <>
            {/* ── CARTE MOYENNE GÉNÉRALE ── */}
            {moyGen && (
              <View style={[styles.moyGenCard, { backgroundColor: isDark ? '#1E293B' : BLEU }]}>
                <View style={styles.deco1} /><View style={styles.deco2} />
                <View style={styles.moyGenContent}>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.moyGenTitre}>Moyenne Générale</Text>
                    <Text style={styles.moyGenSub}>
                      {Object.keys(parMatiere).length} matière(s) · Semestre {semestreActif}
                    </Text>
                    <View style={styles.moyGenBarBg}>
                      <View style={[styles.moyGenBarFill, {
                        width: `${(parseFloat(moyGen) / 20) * 100}%`,
                        backgroundColor: mentionGen?.bar || '#60A5FA'
                      }]} />
                    </View>
                  </View>
                  <View style={{ alignItems: 'center' }}>
                    <Text style={[styles.moyGenVal, { color: mentionGen?.bar || '#fff' }]}>
                      {moyGen}
                    </Text>
                    <Text style={styles.moyGenSur}>/20</Text>
                    {mentionGen && (
                      <View style={[styles.mentionBadge, { backgroundColor: mentionGen.bg }]}>
                        <Text style={[styles.mentionTxt, { color: mentionGen.color }]}>{mentionGen.txt}</Text>
                      </View>
                    )}
                  </View>
                </View>
              </View>
            )}

            {/* ── ONGLETS SEMESTRES ── */}
            {semestres.length > 1 && (
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginVertical: 12 }}>
                <View style={styles.semOnglets}>
                  {semestres.map(sem => (
                    <TouchableOpacity
                      key={sem}
                      style={[styles.semOnglet, {
                        backgroundColor: semestreActif === sem ? BLEU2 : theme.card,
                        borderColor:     semestreActif === sem ? BLEU2 : theme.cardBorder,
                      }]}
                      onPress={() => setSemestreActif(sem)}
                    >
                      <Text style={[styles.semOngletTxt, { color: semestreActif === sem ? '#fff' : theme.textSub }]}>
                        📅 Semestre {sem}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </ScrollView>
            )}

            {/* ── SECTIONS PAR MATIÈRE ── */}
            <View style={{ paddingHorizontal: 16, gap: 14 }}>
              {Object.entries(parMatiere).map(([matiereId, { nom, prof, notes: notesMatiere }]) => {
                const moy        = moyenneNotes(notesMatiere);
                const mention    = getMention(moy);
                const couleur    = moy ? (parseFloat(moy) >= 10 ? VERT : ROUGE) : BLEU2;
                const pct        = moy ? (parseFloat(moy) / 20) * 100 : 0;

                return (
                  <View key={`mat-${matiereId}`} style={[styles.matiereCard, { backgroundColor: theme.card }]}>
                    {/* EN-TÊTE MATIÈRE */}
                    <View style={[styles.matiereHeader, { backgroundColor: couleur + '18', borderBottomColor: couleur + '30' }]}>
                      <View style={{ flex: 1 }}>
                        <Text style={[styles.matiereNom, { color: theme.text }]}>{nom}</Text>
                        {prof && (
                          <Text style={[styles.matiereProf, { color: theme.textMuted }]}>
                            👨‍🏫 {prof}
                          </Text>
                        )}
                        <Text style={[styles.matiereNbNotes, { color: theme.textMuted }]}>
                          {notesMatiere.length} évaluation(s)
                        </Text>
                      </View>
                      {moy && (
                        <View style={[styles.matiereMoyBox, { backgroundColor: couleur + '20', borderColor: couleur }]}>
                          <Text style={[styles.matiereMoyVal, { color: couleur }]}>{moy}</Text>
                          <Text style={[styles.matiereMoySur, { color: couleur + 'AA' }]}>/20</Text>
                          {mention && (
                            <View style={[styles.matiereMentionBadge, { backgroundColor: mention.bg }]}>
                              <Text style={[styles.matiereMentionTxt, { color: mention.color }]}>{mention.txt}</Text>
                            </View>
                          )}
                        </View>
                      )}
                    </View>

                    {/* BARRE DE PROGRESSION */}
                    {moy && (
                      <View style={[styles.matiereBarBg, { backgroundColor: theme.cardBorder }]}>
                        <View style={[styles.matiereBarFill, { width: `${pct}%`, backgroundColor: couleur }]} />
                      </View>
                    )}

                    {/* LISTE DES NOTES */}
                    <View style={{ padding: 12, gap: 8 }}>
                      {notesMatiere.map((n, ni) => {
                        const noteVal  = parseFloat(n.Note_Evaluation);
                        const coul     = noteVal >= 14 ? VERT : noteVal >= 10 ? ORANGE : ROUGE;
                        const mentNote = getMention(noteVal);
                        const pctNote  = (noteVal / 20) * 100;
                        return (
                          <View key={`note-${matiereId}-${ni}`} style={[styles.noteItem, { backgroundColor: theme.bg, borderColor: theme.cardBorder }]}>
                            <View style={styles.noteItemTop}>
                              <View style={{ flex: 1 }}>
                                <View style={styles.noteItemBadges}>
                                  <View style={[styles.typeBadge, { backgroundColor: BLEU2 + '20' }]}>
                                    <Text style={[styles.typeBadgeTxt, { color: BLEU2 }]}>
                                      {n.Type_Evaluation || 'Devoir'}
                                    </Text>
                                  </View>
                                  {n.Coef_Evaluation && n.Coef_Evaluation !== 1 && n.Coef_Evaluation !== '1' && (
                                    <View style={[styles.coefBadge, { backgroundColor: '#7C3AED20' }]}>
                                      <Text style={[styles.coefBadgeTxt, { color: '#7C3AED' }]}>
                                        Coef. {n.Coef_Evaluation}
                                      </Text>
                                    </View>
                                  )}
                                </View>
                                <Text style={[styles.noteItemDate, { color: theme.textMuted }]}>
                                  📅 {n.Date_Evaluation ? new Date(n.Date_Evaluation).toLocaleDateString('fr-FR') : 'N/A'}
                                </Text>
                              </View>
                              <View style={{ alignItems: 'flex-end', gap: 4 }}>
                                <Text style={[styles.noteItemVal, { color: coul }]}>
                                  {noteVal.toFixed(2)}
                                  <Text style={[styles.noteItemSur, { color: theme.textMuted }]}>/20</Text>
                                </Text>
                                {mentNote && (
                                  <View style={[styles.mentionBadge, { backgroundColor: mentNote.bg }]}>
                                    <Text style={[styles.mentionTxt, { color: mentNote.color }]}>{mentNote.txt}</Text>
                                  </View>
                                )}
                              </View>
                            </View>
                            {/* BARRE NOTE */}
                            <View style={[styles.noteBarBg, { backgroundColor: theme.cardBorder }]}>
                              <View style={[styles.noteBarFill, { width: `${pctNote}%`, backgroundColor: coul }]} />
                            </View>
                          </View>
                        );
                      })}
                    </View>

                    {/* RÉCAP MATIÈRE EN BAS */}
                    {moy && (
                      <View style={[styles.matiereFooter, { borderTopColor: theme.cardBorder, backgroundColor: couleur + '08' }]}>
                        <Text style={[styles.matiereFooterTxt, { color: theme.textSub }]}>
                          Moyenne : <Text style={{ color: couleur, fontWeight: '900' }}>{moy}/20</Text>
                          {mention ? `  ·  ${mention.txt}` : ''}
                        </Text>
                      </View>
                    )}
                  </View>
                );
              })}
            </View>

            {/* ── RÉCAP SEMESTRE ── */}
            {moyGen && (
              <View style={[styles.recapCard, { backgroundColor: theme.card, marginHorizontal: 16, marginTop: 14 }]}>
                <Text style={[styles.recapTitre, { color: theme.text }]}>
                  📊 Récapitulatif — Semestre {semestreActif}
                </Text>
                <View style={styles.recapGrid}>
                  <View style={[styles.recapItem, { backgroundColor: BLEU2 + '12' }]}>
                    <Text style={[styles.recapVal, { color: BLEU2 }]}>{Object.keys(parMatiere).length}</Text>
                    <Text style={[styles.recapLabel, { color: theme.textSub }]}>Matières</Text>
                  </View>
                  <View style={[styles.recapItem, { backgroundColor: VERT + '12' }]}>
                    <Text style={[styles.recapVal, { color: VERT }]}>{notesFiltrees.filter(n => parseFloat(n.Note_Evaluation) >= 10).length}</Text>
                    <Text style={[styles.recapLabel, { color: theme.textSub }]}>Notes ≥10</Text>
                  </View>
                  <View style={[styles.recapItem, { backgroundColor: ROUGE + '12' }]}>
                    <Text style={[styles.recapVal, { color: ROUGE }]}>{notesFiltrees.filter(n => parseFloat(n.Note_Evaluation) < 10).length}</Text>
                    <Text style={[styles.recapLabel, { color: theme.textSub }]}>Notes &lt;10</Text>
                  </View>
                  <View style={[styles.recapItem, { backgroundColor: (mentionGen?.bar || BLEU2) + '12' }]}>
                    <Text style={[styles.recapVal, { color: mentionGen?.bar || BLEU2 }]}>{moyGen}</Text>
                    <Text style={[styles.recapLabel, { color: theme.textSub }]}>Moy. Gén.</Text>
                  </View>
                </View>
                {mentionGen && (
                  <View style={[styles.recapMention, { backgroundColor: mentionGen.bg, borderColor: mentionGen.bar }]}>
                    <Text style={[styles.recapMentionTxt, { color: mentionGen.color }]}>
                      🎓 Mention : {mentionGen.txt} — {moyGen}/20
                    </Text>
                  </View>
                )}
              </View>
            )}
          </>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: { flex: 1 },
  center:  { flex: 1, justifyContent: 'center', alignItems: 'center' },
  hero: {
    paddingTop: Platform.OS === 'ios' ? 20 : (StatusBar.currentHeight || 24) + 16,
    paddingBottom: 32, paddingHorizontal: 20,
    borderBottomLeftRadius: 36, borderBottomRightRadius: 36, overflow: 'hidden',
  },
  deco1: { position: 'absolute', width: 220, height: 220, borderRadius: 110, backgroundColor: 'rgba(255,255,255,0.07)', top: -70, right: -50 },
  deco2: { position: 'absolute', width: 150, height: 150, borderRadius: 75, backgroundColor: 'rgba(255,255,255,0.05)', bottom: -30, left: -30 },
  deco3: { position: 'absolute', width: 80, height: 80, borderRadius: 40, backgroundColor: 'rgba(255,255,255,0.04)', top: 20, left: 40 },
  heroTitre: { color: '#fff', fontSize: 26, fontWeight: '900', marginBottom: 4 },
  heroSub:   { color: 'rgba(255,255,255,0.6)', fontSize: 13, marginBottom: 20 },
  statsRow: { flexDirection: 'row', backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: 16, padding: 14, borderWidth: 1, borderColor: 'rgba(255,255,255,0.12)' },
  statCard:  { flex: 1, alignItems: 'center' },
  statVal:   { fontSize: 18, fontWeight: '900' },
  statLabel: { fontSize: 10, color: 'rgba(255,255,255,0.5)', marginTop: 3, textAlign: 'center' },
  statDiv:   { width: 1, backgroundColor: 'rgba(255,255,255,0.12)' },

  moyGenCard: {
    marginHorizontal: 16, marginTop: 16, borderRadius: 20,
    padding: 20, overflow: 'hidden', elevation: 4,
  },
  moyGenContent:  { flexDirection: 'row', alignItems: 'center', gap: 16 },
  moyGenTitre:    { color: '#fff', fontSize: 14, fontWeight: '800', marginBottom: 4 },
  moyGenSub:      { color: 'rgba(255,255,255,0.6)', fontSize: 11, marginBottom: 10 },
  moyGenBarBg:    { height: 6, borderRadius: 6, backgroundColor: 'rgba(255,255,255,0.15)', overflow: 'hidden' },
  moyGenBarFill:  { height: '100%', borderRadius: 6 },
  moyGenVal:      { fontSize: 38, fontWeight: '900' },
  moyGenSur:      { color: 'rgba(255,255,255,0.6)', fontSize: 14, textAlign: 'center' },
  mentionBadge:   { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 10, marginTop: 4 },
  mentionTxt:     { fontSize: 11, fontWeight: '700' },

  semOnglets: { flexDirection: 'row', gap: 10, paddingHorizontal: 16 },
  semOnglet:  { paddingHorizontal: 18, paddingVertical: 10, borderRadius: 20, borderWidth: 1.5 },
  semOngletTxt: { fontSize: 13, fontWeight: '700' },

  matiereCard:   { borderRadius: 20, overflow: 'hidden', elevation: 3, shadowColor: '#000', shadowOffset: { width: 0, height: 3 }, shadowOpacity: 0.08 },
  matiereHeader: { flexDirection: 'row', alignItems: 'flex-start', padding: 16, borderBottomWidth: 1, gap: 12 },
  matiereNom:    { fontSize: 16, fontWeight: '900', marginBottom: 4 },
  matiereProf:   { fontSize: 11, marginBottom: 2 },
  matiereNbNotes:{ fontSize: 10 },
  matiereMoyBox: { alignItems: 'center', borderRadius: 14, padding: 10, borderWidth: 1.5, minWidth: 80 },
  matiereMoyVal: { fontSize: 26, fontWeight: '900' },
  matiereMoySur: { fontSize: 12 },
  matiereMentionBadge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 8, marginTop: 4 },
  matiereMentionTxt:   { fontSize: 10, fontWeight: '700' },
  matiereBarBg:  { height: 4, backgroundColor: '#E2E8F0' },
  matiereBarFill:{ height: '100%' },
  matiereFooter: { padding: 12, borderTopWidth: 1 },
  matiereFooterTxt: { fontSize: 13, fontWeight: '600', textAlign: 'center' },

  noteItem:     { borderRadius: 12, padding: 12, borderWidth: 1, gap: 8 },
  noteItemTop:  { flexDirection: 'row', alignItems: 'flex-start', gap: 8 },
  noteItemBadges: { flexDirection: 'row', gap: 6, flexWrap: 'wrap', marginBottom: 4 },
  typeBadge:    { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 8 },
  typeBadgeTxt: { fontSize: 11, fontWeight: '700' },
  coefBadge:    { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 8 },
  coefBadgeTxt: { fontSize: 11, fontWeight: '600' },
  noteItemDate: { fontSize: 11 },
  noteItemVal:  { fontSize: 20, fontWeight: '900' },
  noteItemSur:  { fontSize: 12 },
  noteBarBg:    { height: 4, borderRadius: 4, overflow: 'hidden' },
  noteBarFill:  { height: '100%', borderRadius: 4 },

  recapCard:    { borderRadius: 20, padding: 16, elevation: 3 },
  recapTitre:   { fontSize: 14, fontWeight: '800', marginBottom: 12 },
  recapGrid:    { flexDirection: 'row', gap: 8, marginBottom: 12 },
  recapItem:    { flex: 1, borderRadius: 12, padding: 10, alignItems: 'center' },
  recapVal:     { fontSize: 20, fontWeight: '900', marginBottom: 2 },
  recapLabel:   { fontSize: 10, fontWeight: '600', textAlign: 'center' },
  recapMention: { borderRadius: 12, padding: 12, alignItems: 'center', borderWidth: 1.5 },
  recapMentionTxt: { fontSize: 14, fontWeight: '800' },

  emptyBox:   { borderRadius: 20, padding: 40, alignItems: 'center' },
  emptyIcon:  { fontSize: 56, marginBottom: 16 },
  emptyTitre: { fontSize: 18, fontWeight: '900', marginBottom: 8 },
  emptyTxt:   { fontSize: 13, textAlign: 'center', lineHeight: 20 },
});