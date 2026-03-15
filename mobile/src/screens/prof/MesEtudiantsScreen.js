import React, { useEffect, useState } from 'react';
import {
  View, Text, StyleSheet, FlatList, TouchableOpacity,
  ActivityIndicator, StatusBar, RefreshControl, Platform,
  TextInput, ScrollView, Modal
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../../context/ThemeContext';
import API from '../../api/api';

const VERT   = '#2E7D32';
const ORANGE = '#D84315';

export default function MesEtudiantsScreen({ navigation }) {
  const [etudiants,    setEtudiants]    = useState([]);
  const [filtres,      setFiltres]      = useState({ classes: [], matieres: [], filieres: [] });
  const [loading,      setLoading]      = useState(true);
  const [refresh,      setRefresh]      = useState(false);
  const [recherche,    setRecherche]    = useState('');
  const [classeActif,  setClasseActif]  = useState(null);
  const [matiereActif, setMatiereActif] = useState(null);
  const [filiereActif, setFiliereActif] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [etudiantSel,  setEtudiantSel]  = useState(null);
  const [bulletin,     setBulletin]     = useState([]);
  const [loadingBull,  setLoadingBull]  = useState(false);
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
      const [etudRes, filtreRes] = await Promise.allSettled([
        API.get(`/etudiants/par-prof/${u.Id_UTILISATEUR}`),
        API.get(`/etudiants/filtres-prof/${u.Id_UTILISATEUR}`),
      ]);
      if (etudRes.status   === 'fulfilled') setEtudiants(etudRes.value.data);
      if (filtreRes.status === 'fulfilled') setFiltres(filtreRes.value.data);
    } catch (err) {
      console.log('Erreur étudiants:', err);
    } finally {
      setLoading(false);
      setRefresh(false);
    }
  };

  const appliquerFiltres = async (classe, matiere, filiere) => {
    try {
      const stored = await AsyncStorage.getItem('user');
      const u      = JSON.parse(stored);
      const params = new URLSearchParams();
      if (classe)  params.append('classe',  classe);
      if (matiere) params.append('matiere', matiere);
      if (filiere) params.append('filiere', filiere);
      const res = await API.get(`/etudiants/par-prof/${u.Id_UTILISATEUR}?${params}`);
      setEtudiants(res.data);
    } catch (err) { console.log('Erreur filtres:', err); }
  };

  // ── NAVIGATION : si matière sélectionnée → page dédiée, sinon → modal général
  const ouvrirBulletin = async (etudiant) => {
    if (matiereActif) {
      // Matière sélectionnée → page dédiée bulletin
      const matiereInfo = filtres.matieres.find(m => m.Id_MATIERE === matiereActif);
      navigation.navigate('BulletinMatiere', {
        etudiant,
        matiere: matiereInfo,
      });
    } else {
      // Pas de matière → modal général toutes matières
      setEtudiantSel(etudiant);
      setLoadingBull(true);
      setModalVisible(true);
      setBulletin([]);
      try {
        const res = await API.get(`/evaluations/${etudiant.Id_ETUDIANT}/notes`);
        setBulletin(res.data);
      } catch (err) {
        console.log('Erreur bulletin:', err);
        setBulletin([]);
      } finally {
        setLoadingBull(false);
      }
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

  const appliquerFiltre = (type, val) => {
    let c = classeActif, m = matiereActif, f = filiereActif;
    if (type === 'classe')  c = classeActif  === val ? null : val;
    if (type === 'matiere') m = matiereActif === val ? null : val;
    if (type === 'filiere') f = filiereActif === val ? null : val;
    setClasseActif(c); setMatiereActif(m); setFiliereActif(f);
    appliquerFiltres(c, m, f);
  };

  const etudiantsFiltres = etudiants.filter(e => {
    if (!recherche) return true;
    const q = recherche.toLowerCase();
    return (
      e.Nom_Etudiant?.toLowerCase().includes(q) ||
      e.Prenoms_Etudiant?.toLowerCase().includes(q) ||
      e.Matricule_Etudiant?.toLowerCase().includes(q)
    );
  });

  const moyenneGenerale = () => {
    if (!bulletin.length) return null;
    const vals = bulletin.map(n => parseFloat(n.Note_Evaluation)).filter(v => !isNaN(v));
    if (!vals.length) return null;
    return (vals.reduce((s, v) => s + v, 0) / vals.length).toFixed(2);
  };

  if (loading) return (
    <View style={[styles.center, { backgroundColor: theme.bg }]}>
      <ActivityIndicator size="large" color={VERT} />
    </View>
  );

  const moyVal     = moyenneGenerale();
  const mentionMoy = getMention(moyVal);
  const matiereSelInfo = matiereActif ? filtres.matieres.find(m => m.Id_MATIERE === matiereActif) : null;

  return (
    <View style={[styles.wrapper, { backgroundColor: theme.bg }]}>
      <StatusBar barStyle="light-content" backgroundColor={VERT} />

      {/* ── MODAL BULLETIN GÉNÉRAL ── */}
      <Modal
        visible={modalVisible}
        animationType="slide"
        transparent={false}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={[styles.wrapper, { backgroundColor: theme.bg }]}>
          <ScrollView contentContainerStyle={{ paddingBottom: insets.bottom + 24 }}>
            <View style={styles.modalHero}>
              <View style={styles.deco1} /><View style={styles.deco2} />
              <TouchableOpacity onPress={() => setModalVisible(false)} style={styles.backBtn}>
                <Text style={styles.backTxt}>← Retour</Text>
              </TouchableOpacity>
              <Text style={styles.modalTitre}>📋 Bulletin de Notes</Text>
              <View style={styles.etudiantBox}>
                <View style={styles.etudiantAvatar}>
                  <Text style={styles.etudiantAvatarTxt}>
                    {etudiantSel?.Nom_Etudiant?.charAt(0)?.toUpperCase()}
                  </Text>
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.etudiantNom}>
                    {etudiantSel?.Nom_Etudiant} {etudiantSel?.Prenoms_Etudiant}
                  </Text>
                  <Text style={styles.etudiantMatricule}>📋 {etudiantSel?.Matricule_Etudiant}</Text>
                  {etudiantSel?.Nom_Classe && (
                    <Text style={styles.etudiantClasse}>📚 {etudiantSel?.Nom_Classe}</Text>
                  )}
                </View>
              </View>
            </View>

            <View style={{ padding: 16, gap: 12 }}>
              {loadingBull ? (
                <View style={[styles.center, { paddingTop: 40 }]}>
                  <ActivityIndicator size="large" color={VERT} />
                  <Text style={[styles.loadingTxt, { color: theme.textSub }]}>Chargement du bulletin...</Text>
                </View>
              ) : bulletin.length === 0 ? (
                <View style={[styles.emptyBox, { backgroundColor: theme.card }]}>
                  <Text style={styles.emptyIcon}>📭</Text>
                  <Text style={[styles.emptyTitre, { color: theme.text }]}>Aucune note</Text>
                  <Text style={[styles.emptyTxt, { color: theme.textSub }]}>
                    Pas encore de notes enregistrées pour cet étudiant
                  </Text>
                  <TouchableOpacity
                    style={[styles.saisirBtn, { backgroundColor: VERT }]}
                    onPress={() => { setModalVisible(false); navigation.navigate('SaisieNotes'); }}
                  >
                    <Text style={styles.saisirBtnTxt}>📝 Saisir des notes</Text>
                  </TouchableOpacity>
                </View>
              ) : (
                <>
                  {/* MOYENNE GÉNÉRALE */}
                  {moyVal && (
                    <View style={[styles.moyenneCard, { backgroundColor: theme.card }]}>
                      <View style={{ flex: 1 }}>
                        <Text style={[styles.moyenneTitre, { color: theme.textSub }]}>
                          Moyenne dans mes matières
                        </Text>
                        <Text style={[styles.moyenneVal, { color: theme.text }]}>
                          {moyVal}<Text style={[styles.moyenneSur, { color: theme.textMuted }]}>/20</Text>
                        </Text>
                      </View>
                      {mentionMoy && (
                        <View style={[styles.mentionBadge, { backgroundColor: mentionMoy.bg }]}>
                          <Text style={[styles.mentionTxt, { color: mentionMoy.color }]}>{mentionMoy.txt}</Text>
                        </View>
                      )}
                    </View>
                  )}

                  {/* NOTES PAR SEMESTRE PUIS PAR MATIÈRE */}
                  {[1, 2].map(sem => {
                    const notesSem = bulletin.filter(n => n.Id_SEMESTRE === sem);
                    if (!notesSem.length) return null;
                    const parMatiere = notesSem.reduce((acc, n) => {
                      const key = String(n.Id_MATIERE || 0);
                      if (!acc[key]) acc[key] = { nom: n.Nom_Matiere || `Matière ${n.Id_MATIERE}`, prof: n.Nom_Professeur || null, notes: [] };
                      acc[key].notes.push(n);
                      return acc;
                    }, {});

                    return (
                      <View key={`sem-${sem}`}>
                        <View style={[styles.semHeader, { backgroundColor: VERT + '15', borderColor: VERT }]}>
                          <Text style={[styles.semTitre, { color: VERT }]}>📅 Semestre {sem}</Text>
                          <Text style={[styles.semCount, { color: VERT }]}>{Object.keys(parMatiere).length} matière(s)</Text>
                        </View>

                        {Object.entries(parMatiere).map(([matiereId, { nom, prof, notes: notesMatiere }]) => {
                          const vals = notesMatiere
                            .map(n => ({ v: parseFloat(n.Note_Evaluation), c: parseFloat(n.Coef_Evaluation) || 1 }))
                            .filter(x => !isNaN(x.v));
                          const totalCoef = vals.reduce((s, x) => s + x.c, 0);
                          const moyMat    = vals.length ? (vals.reduce((s, x) => s + x.v * x.c, 0) / totalCoef).toFixed(2) : null;
                          const mentionMat = getMention(moyMat);
                          const couleurMat = moyMat ? (parseFloat(moyMat) >= 10 ? VERT : ORANGE) : theme.cardBorder;

                          return (
                            <View key={`mat-${sem}-${matiereId}`} style={[styles.matiereSection, { backgroundColor: theme.card, borderLeftColor: couleurMat }]}>
                              <View style={styles.matiereSectionHead}>
                                <View style={{ flex: 1 }}>
                                  <Text style={[styles.matiereSectionNom, { color: theme.text }]}>{nom}</Text>
                                  {prof && <Text style={[styles.matiereSectionProf, { color: theme.textMuted }]}>👨‍🏫 {prof}</Text>}
                                  <Text style={[styles.matiereNbNotes, { color: theme.textMuted }]}>{notesMatiere.length} note(s)</Text>
                                </View>
                                {moyMat && (
                                  <View style={{ alignItems: 'flex-end', gap: 4 }}>
                                    <Text style={[styles.matiereMoy, { color: couleurMat }]}>
                                      {moyMat}<Text style={[styles.matiereMoySur, { color: theme.textMuted }]}>/20</Text>
                                    </Text>
                                    {mentionMat && (
                                      <View style={[styles.mentionBadge, { backgroundColor: mentionMat.bg }]}>
                                        <Text style={[styles.mentionTxt, { color: mentionMat.color }]}>{mentionMat.txt}</Text>
                                      </View>
                                    )}
                                  </View>
                                )}
                              </View>

                              {notesMatiere.map((n, ni) => {
                                const noteVal = parseFloat(n.Note_Evaluation);
                                const coul    = noteVal >= 10 ? VERT : ORANGE;
                                return (
                                  <View key={`note-${sem}-${matiereId}-${ni}`} style={[styles.noteRow, { borderTopColor: theme.cardBorder }]}>
                                    <View style={{ flex: 1 }}>
                                      <Text style={[styles.noteType, { color: theme.textSub }]}>
                                        {n.Type_Evaluation || 'Devoir'}
                                        {n.Coef_Evaluation && n.Coef_Evaluation !== '1' && n.Coef_Evaluation !== 1 ? ` — Coef. ${n.Coef_Evaluation}` : ''}
                                      </Text>
                                      <Text style={[styles.noteDate, { color: theme.textMuted }]}>
                                        📅 {new Date(n.Date_Evaluation).toLocaleDateString('fr-FR')}
                                      </Text>
                                    </View>
                                    <View style={{ alignItems: 'flex-end' }}>
                                      <Text style={[styles.noteValeur, { color: coul }]}>
                                        {noteVal.toFixed(2)}<Text style={[styles.noteValeurSur, { color: theme.textMuted }]}>/20</Text>
                                      </Text>
                                      {getMention(noteVal) && (
                                        <View style={[styles.noteMentionBadge, { backgroundColor: getMention(noteVal).bg }]}>
                                          <Text style={[styles.noteMentionTxt, { color: getMention(noteVal).color }]}>{getMention(noteVal).txt}</Text>
                                        </View>
                                      )}
                                    </View>
                                  </View>
                                );
                              })}
                            </View>
                          );
                        })}
                      </View>
                    );
                  })}

                  <TouchableOpacity
                    style={[styles.saisirBtn, { backgroundColor: VERT }]}
                    onPress={() => { setModalVisible(false); navigation.navigate('SaisieNotes'); }}
                  >
                    <Text style={styles.saisirBtnTxt}>📝 Modifier / Ajouter des notes</Text>
                  </TouchableOpacity>
                </>
              )}
            </View>
          </ScrollView>
        </View>
      </Modal>

      {/* ── PAGE PRINCIPALE ── */}
      <FlatList
        data={etudiantsFiltres}
        keyExtractor={item => `etu-${item.Id_ETUDIANT}`}
        refreshControl={<RefreshControl refreshing={refresh} onRefresh={() => { setRefresh(true); loadData(); }} colors={[VERT]} />}
        contentContainerStyle={{ paddingBottom: insets.bottom + 24 }}

        ListHeaderComponent={() => (
          <View>
            <View style={styles.hero}>
              <View style={styles.deco1} /><View style={styles.deco2} />
              <Text style={styles.heroTitre}>🎓 Mes Étudiants</Text>
              <Text style={styles.heroSub}>{etudiantsFiltres.length} / {etudiants.length} étudiant(s)</Text>
            </View>

            {/* BADGE MATIÈRE SÉLECTIONNÉE */}
            {matiereSelInfo && (
              <View style={[styles.matiereActiveBadge, { backgroundColor: VERT + '15', borderColor: VERT }]}>
                <Text style={[styles.matiereActiveTxt, { color: VERT }]}>
                  📖 Matière : <Text style={{ fontWeight: '900' }}>{matiereSelInfo.Nom_Matiere}</Text>
                </Text>
                <Text style={[styles.matiereActiveInfo, { color: VERT }]}>
                  → Cliquer sur un étudiant affiche le bulletin de cette matière
                </Text>
              </View>
            )}

            <View style={[styles.rechercheBox, { backgroundColor: theme.card }]}>
              <Text style={styles.rechercheIcon}>🔍</Text>
              <TextInput
                style={[styles.rechercheInput, { color: theme.text }]}
                placeholder="Rechercher par nom, matricule..."
                placeholderTextColor={theme.textMuted}
                value={recherche}
                onChangeText={setRecherche}
              />
              {recherche.length > 0 && (
                <TouchableOpacity onPress={() => setRecherche('')}>
                  <Text style={{ color: theme.textMuted, fontSize: 16 }}>✕</Text>
                </TouchableOpacity>
              )}
            </View>

            <View style={[styles.filtresCard, { backgroundColor: theme.card }]}>
              <Text style={[styles.filtresTitre, { color: theme.text }]}>🎯 Filtres</Text>

              {filtres.classes.length > 0 && (
                <View style={styles.filtreSection}>
                  <Text style={[styles.filtreLabel, { color: theme.textSub }]}>📚 Classe</Text>
                  <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                    <View style={styles.chipsRow}>
                      {filtres.classes.map(c => (
                        <TouchableOpacity key={`cl-${c.Id_CLASSE}`}
                          style={[styles.chip, { backgroundColor: classeActif === c.Id_CLASSE ? '#2563EB' : theme.bg, borderColor: classeActif === c.Id_CLASSE ? '#2563EB' : theme.cardBorder }]}
                          onPress={() => appliquerFiltre('classe', c.Id_CLASSE)}
                        >
                          <Text style={[styles.chipTxt, { color: classeActif === c.Id_CLASSE ? '#fff' : theme.textSub }]}>{c.Nom_Classe}</Text>
                        </TouchableOpacity>
                      ))}
                    </View>
                  </ScrollView>
                </View>
              )}

              {filtres.matieres.length > 0 && (
                <View style={styles.filtreSection}>
                  <Text style={[styles.filtreLabel, { color: theme.textSub }]}>📖 Matière</Text>
                  <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                    <View style={styles.chipsRow}>
                      {filtres.matieres.map(m => (
                        <TouchableOpacity key={`mat-${m.Id_MATIERE}`}
                          style={[styles.chip, { backgroundColor: matiereActif === m.Id_MATIERE ? VERT : theme.bg, borderColor: matiereActif === m.Id_MATIERE ? VERT : theme.cardBorder }]}
                          onPress={() => appliquerFiltre('matiere', m.Id_MATIERE)}
                        >
                          <Text style={[styles.chipTxt, { color: matiereActif === m.Id_MATIERE ? '#fff' : theme.textSub }]}>{m.Nom_Matiere}</Text>
                        </TouchableOpacity>
                      ))}
                    </View>
                  </ScrollView>
                </View>
              )}

              {filtres.filieres.length > 0 && (
                <View style={styles.filtreSection}>
                  <Text style={[styles.filtreLabel, { color: theme.textSub }]}>🏫 Filière</Text>
                  <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                    <View style={styles.chipsRow}>
                      {filtres.filieres.map(f => (
                        <TouchableOpacity key={`fil-${f.Id_FILIERE}`}
                          style={[styles.chip, { backgroundColor: filiereActif === f.Id_FILIERE ? '#9333EA' : theme.bg, borderColor: filiereActif === f.Id_FILIERE ? '#9333EA' : theme.cardBorder }]}
                          onPress={() => appliquerFiltre('filiere', f.Id_FILIERE)}
                        >
                          <Text style={[styles.chipTxt, { color: filiereActif === f.Id_FILIERE ? '#fff' : theme.textSub }]}>{f.Nom_Filiere}</Text>
                        </TouchableOpacity>
                      ))}
                    </View>
                  </ScrollView>
                </View>
              )}
            </View>
          </View>
        )}

        ListEmptyComponent={() => (
          <View style={[styles.emptyBox, { backgroundColor: theme.card, margin: 16 }]}>
            <Text style={styles.emptyIcon}>👥</Text>
            <Text style={[styles.emptyTitre, { color: theme.text }]}>Aucun étudiant</Text>
            <Text style={[styles.emptyTxt, { color: theme.textSub }]}>
              {recherche ? `Aucun résultat pour "${recherche}"` : 'Aucun étudiant trouvé'}
            </Text>
          </View>
        )}

        renderItem={({ item }) => (
          <TouchableOpacity
            style={[styles.card, { backgroundColor: theme.card, borderColor: matiereSelInfo ? VERT : theme.cardBorder }]}
            onPress={() => ouvrirBulletin(item)}
            activeOpacity={0.85}
          >
            <View style={[styles.avatar, { backgroundColor: VERT + '20' }]}>
              <Text style={[styles.avatarTxt, { color: VERT }]}>
                {item.Nom_Etudiant?.charAt(0)?.toUpperCase()}
              </Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={[styles.nom, { color: theme.text }]}>{item.Nom_Etudiant} {item.Prenoms_Etudiant}</Text>
              <Text style={[styles.matricule, { color: theme.textSub }]}>📋 {item.Matricule_Etudiant}</Text>
              <View style={styles.badgesRow}>
                {item.Nom_Classe && <View style={[styles.badge, { backgroundColor: '#EFF6FF' }]}><Text style={[styles.badgeTxt, { color: '#2563EB' }]}>📚 {item.Nom_Classe}</Text></View>}
                {item.Nom_Filiere && <View style={[styles.badge, { backgroundColor: '#FDF4FF' }]}><Text style={[styles.badgeTxt, { color: '#9333EA' }]}>🏫 {item.Nom_Filiere}</Text></View>}
              </View>
            </View>
            <View style={styles.bulletinBtn}>
              <Text style={styles.bulletinBtnIcon}>📋</Text>
              <Text style={[styles.bulletinBtnTxt, { color: VERT }]}>
                {matiereSelInfo ? 'Matière' : 'Bulletin'}
              </Text>
            </View>
          </TouchableOpacity>
        )}

        ItemSeparatorComponent={() => <View style={{ height: 10, marginHorizontal: 16 }} />}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper:    { flex: 1 },
  center:     { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 },
  loadingTxt: { marginTop: 12, fontSize: 13 },
  hero: {
    backgroundColor: VERT,
    paddingTop: Platform.OS === 'ios' ? 20 : (StatusBar.currentHeight || 24) + 16,
    paddingBottom: 28, paddingHorizontal: 20,
    borderBottomLeftRadius: 32, borderBottomRightRadius: 32,
    overflow: 'hidden', marginBottom: 12,
  },
  deco1: { position: 'absolute', width: 180, height: 180, borderRadius: 90, backgroundColor: 'rgba(255,255,255,0.07)', top: -50, right: -30 },
  deco2: { position: 'absolute', width: 120, height: 120, borderRadius: 60, backgroundColor: 'rgba(255,255,255,0.05)', bottom: -20, left: -20 },
  heroTitre:  { color: '#fff', fontSize: 24, fontWeight: '900', marginBottom: 4 },
  heroSub:    { color: 'rgba(255,255,255,0.75)', fontSize: 14 },
  matiereActiveBadge: { marginHorizontal: 16, marginBottom: 10, borderRadius: 12, padding: 12, borderWidth: 1.5 },
  matiereActiveTxt:   { fontSize: 13, fontWeight: '700', marginBottom: 4 },
  matiereActiveInfo:  { fontSize: 11 },
  rechercheBox:   { flexDirection: 'row', alignItems: 'center', marginHorizontal: 16, borderRadius: 16, padding: 12, gap: 10, elevation: 2, marginBottom: 10 },
  rechercheIcon:  { fontSize: 18 },
  rechercheInput: { flex: 1, fontSize: 14, fontWeight: '500' },
  filtresCard:    { marginHorizontal: 16, borderRadius: 16, padding: 14, elevation: 2, marginBottom: 10 },
  filtresTitre:   { fontSize: 14, fontWeight: '800', marginBottom: 10 },
  filtreSection:  { marginBottom: 10 },
  filtreLabel:    { fontSize: 12, fontWeight: '700', marginBottom: 6 },
  chipsRow:       { flexDirection: 'row', gap: 8 },
  chip:           { paddingHorizontal: 14, paddingVertical: 7, borderRadius: 20, borderWidth: 1.5 },
  chipTxt:        { fontSize: 12, fontWeight: '700' },
  card:           { flexDirection: 'row', alignItems: 'center', marginHorizontal: 16, borderRadius: 16, padding: 14, borderWidth: 1.5, elevation: 2, gap: 12 },
  avatar:         { width: 48, height: 48, borderRadius: 24, justifyContent: 'center', alignItems: 'center' },
  avatarTxt:      { fontSize: 20, fontWeight: '900' },
  nom:            { fontSize: 15, fontWeight: '800', marginBottom: 3 },
  matricule:      { fontSize: 12, marginBottom: 6 },
  badgesRow:      { flexDirection: 'row', gap: 6, flexWrap: 'wrap' },
  badge:          { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 8 },
  badgeTxt:       { fontSize: 10, fontWeight: '700' },
  bulletinBtn:    { alignItems: 'center', gap: 2 },
  bulletinBtnIcon:{ fontSize: 22 },
  bulletinBtnTxt: { fontSize: 10, fontWeight: '700' },
  emptyBox:       { borderRadius: 16, padding: 32, alignItems: 'center' },
  emptyIcon:      { fontSize: 48, marginBottom: 12 },
  emptyTitre:     { fontSize: 16, fontWeight: '800', marginBottom: 4 },
  emptyTxt:       { fontSize: 13, textAlign: 'center' },
  // MODAL
  modalHero: {
    backgroundColor: VERT,
    paddingTop: Platform.OS === 'ios' ? 20 : (StatusBar.currentHeight || 24) + 16,
    paddingBottom: 24, paddingHorizontal: 20,
    borderBottomLeftRadius: 28, borderBottomRightRadius: 28, overflow: 'hidden',
  },
  backBtn:           { marginBottom: 10 },
  backTxt:           { color: 'rgba(255,255,255,0.8)', fontSize: 14, fontWeight: '600' },
  modalTitre:        { color: '#fff', fontSize: 22, fontWeight: '900', marginBottom: 12 },
  etudiantBox:       { flexDirection: 'row', alignItems: 'center', gap: 12, backgroundColor: 'rgba(255,255,255,0.15)', borderRadius: 14, padding: 12 },
  etudiantAvatar:    { width: 44, height: 44, borderRadius: 22, backgroundColor: 'rgba(255,255,255,0.25)', justifyContent: 'center', alignItems: 'center' },
  etudiantAvatarTxt: { fontSize: 20, fontWeight: '900', color: '#fff' },
  etudiantNom:       { color: '#fff', fontSize: 15, fontWeight: '800' },
  etudiantMatricule: { color: 'rgba(255,255,255,0.75)', fontSize: 12, marginTop: 2 },
  etudiantClasse:    { color: 'rgba(255,255,255,0.7)', fontSize: 11, marginTop: 2 },
  moyenneCard:  { borderRadius: 14, padding: 16, elevation: 2, flexDirection: 'row', alignItems: 'center' },
  moyenneTitre: { fontSize: 12, fontWeight: '600', marginBottom: 4 },
  moyenneVal:   { fontSize: 32, fontWeight: '900' },
  moyenneSur:   { fontSize: 16 },
  mentionBadge: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 12 },
  mentionTxt:   { fontSize: 12, fontWeight: '700' },
  semHeader:    { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', borderRadius: 10, padding: 10, borderWidth: 1.5, marginBottom: 8 },
  semTitre:     { fontSize: 14, fontWeight: '800' },
  semCount:     { fontSize: 12, fontWeight: '600' },
  matiereSection:     { borderRadius: 14, padding: 14, elevation: 2, borderLeftWidth: 4, marginBottom: 10 },
  matiereSectionHead: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 },
  matiereSectionNom:  { fontSize: 15, fontWeight: '900', marginBottom: 3 },
  matiereSectionProf: { fontSize: 11, marginBottom: 2 },
  matiereNbNotes:     { fontSize: 10 },
  matiereMoy:         { fontSize: 22, fontWeight: '900' },
  matiereMoySur:      { fontSize: 13 },
  noteRow:          { flexDirection: 'row', alignItems: 'center', paddingTop: 8, borderTopWidth: 1, marginTop: 4 },
  noteType:         { fontSize: 12, fontWeight: '600', marginBottom: 2 },
  noteDate:         { fontSize: 11 },
  noteValeur:       { fontSize: 18, fontWeight: '900' },
  noteValeurSur:    { fontSize: 12 },
  noteMentionBadge: { paddingHorizontal: 6, paddingVertical: 2, borderRadius: 6, marginTop: 3 },
  noteMentionTxt:   { fontSize: 9, fontWeight: '700' },
  saisirBtn:        { borderRadius: 14, padding: 14, alignItems: 'center', marginTop: 8, elevation: 2 },
  saisirBtnTxt:     { color: '#fff', fontSize: 14, fontWeight: '800' },
});