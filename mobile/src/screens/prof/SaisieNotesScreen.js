import React, { useEffect, useState } from 'react';
import {
  View, Text, StyleSheet, FlatList, TouchableOpacity,
  ActivityIndicator, StatusBar, TextInput, Alert, Platform,
  ScrollView, Modal
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../../context/ThemeContext';
import API from '../../api/api';

const VERT   = '#2E7D32';
const ORANGE = '#D84315';
const TYPES_EVAL = ['Devoir', 'Examen', 'TP', 'Projet', 'Oral'];

export default function SaisieNotesScreen({ navigation }) {
  const [prof,         setProf]         = useState(null);
  const [filtres,      setFiltres]      = useState({ classes: [], matieres: [], filieres: [] });
  const [etudiants,    setEtudiants]    = useState([]);
  const [classeActif,  setClasseActif]  = useState(null);
  const [matiereActif, setMatiereActif] = useState(null);
  const [filiereActif, setFiliereActif] = useState(null);
  const [loading,      setLoading]      = useState(true);
  const [loadingEtuds, setLoadingEtuds] = useState(false);
  const [etudiantSel,  setEtudiantSel]  = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [matieres,     setMatieres]     = useState([]);
  const [semestre,     setSemestre]     = useState(1);
  const [saving,       setSaving]       = useState(false);
  const [recherche,    setRecherche]    = useState('');
  const [notesPar,     setNotesPar]     = useState({});
  const insets   = useSafeAreaInsets();
  const themeCtx = useTheme();
  const theme    = themeCtx?.theme || {
    bg: '#F5F7F5', card: '#FFFFFF', cardBorder: '#E2E8F0',
    text: '#1E293B', textSub: '#64748B', textMuted: '#94A3B8',
  };

  useEffect(() => { loadFiltres(); }, []);

  const loadFiltres = async () => {
    try {
      const stored = await AsyncStorage.getItem('user');
      const u      = JSON.parse(stored);
      setProf(u);
      const [filtreRes, emploiRes] = await Promise.allSettled([
        API.get(`/etudiants/filtres-prof/${u.Id_UTILISATEUR}`),
        API.get(`/emploiTemps/professeur/${u.Id_UTILISATEUR}`),
      ]);
      if (filtreRes.status === 'fulfilled') setFiltres(filtreRes.value.data);
      if (emploiRes.status === 'fulfilled') {
        const mat = emploiRes.value.data.reduce((acc, cur) => {
          if (!acc.find(m => m.Id_MATIERE === cur.Id_MATIERE))
            acc.push({ Id_MATIERE: cur.Id_MATIERE, Nom_Matiere: cur.Nom_Matiere });
          return acc;
        }, []);
        setMatieres(mat);
      }
    } catch (err) { console.log('Erreur filtres:', err); }
    finally { setLoading(false); }
  };

  const chargerEtudiants = async (classe, matiere, filiere) => {
    if (!classe && !matiere && !filiere) return;
    setLoadingEtuds(true);
    try {
      const stored = await AsyncStorage.getItem('user');
      const u      = JSON.parse(stored);
      const params = new URLSearchParams();
      if (classe)  params.append('classe',  classe);
      if (matiere) params.append('matiere', matiere);
      if (filiere) params.append('filiere', filiere);
      const res = await API.get(`/etudiants/par-prof/${u.Id_UTILISATEUR}?${params}`);
      setEtudiants(res.data);
    } catch (err) { console.log('Erreur étudiants:', err); }
    finally { setLoadingEtuds(false); }
  };

  const appliquerFiltre = (type, val) => {
    let c = classeActif, m = matiereActif, f = filiereActif;
    if (type === 'classe')  c = classeActif  === val ? null : val;
    if (type === 'matiere') m = matiereActif === val ? null : val;
    if (type === 'filiere') f = filiereActif === val ? null : val;
    setClasseActif(c); setMatiereActif(m); setFiliereActif(f);
    setEtudiantSel(null); setNotesPar({});
    chargerEtudiants(c, m, f);
  };

  const initNotesPar = (matieresListe) => {
    const init = {};
    matieresListe.forEach(mat => {
      init[mat.Id_MATIERE] = [{ type: 'Devoir', note: '', coef: '1' }];
    });
    return init;
  };

  // ── NAVIGATION : si matière sélectionnée → page dédiée, sinon → modal général
  const ouvrirSaisie = async (etudiant) => {
    if (matiereActif) {
      // Matière sélectionnée → naviguer vers la page dédiée
      const matiereInfo = filtres.matieres.find(m => m.Id_MATIERE === matiereActif);
      navigation.navigate('SaisieNotesMatiere', {
        etudiant,
        matiere:  matiereInfo,
        semestre,
        prof,
      });
    } else {
      // Pas de matière → modal général toutes matières
      await ouvrirModal(etudiant);
    }
  };

  const ouvrirModal = async (etudiant) => {
    setEtudiantSel(etudiant);
    setNotesPar({});
    try {
      const res = await API.get(`/evaluations/${etudiant.Id_ETUDIANT}/notes`);
      const notesFiltrees = res.data.filter(n => n.Id_SEMESTRE === semestre);
      const parMatiere = {};
      notesFiltrees.forEach(n => {
        if (!n.Id_MATIERE) return;
        if (!parMatiere[n.Id_MATIERE]) parMatiere[n.Id_MATIERE] = [];
        parMatiere[n.Id_MATIERE].push({
          type: n.Type_Evaluation || 'Devoir',
          note: String(n.Note_Evaluation || ''),
          coef: String(n.Coef_Evaluation || '1'),
          id:   n.Id_EVALUATION,
        });
      });
      const init = {};
      matieres.forEach(mat => {
        init[mat.Id_MATIERE] = parMatiere[mat.Id_MATIERE]?.length > 0
          ? parMatiere[mat.Id_MATIERE]
          : [{ type: 'Devoir', note: '', coef: '1' }];
      });
      setNotesPar(init);
    } catch (_) {
      setNotesPar(initNotesPar(matieres));
    }
    setModalVisible(true);
  };

  const ajouterNote = (matiereId) => {
    setNotesPar(prev => ({
      ...prev,
      [matiereId]: [...(prev[matiereId] || []), { type: 'Devoir', note: '', coef: '1' }]
    }));
  };

  const supprimerNote = (matiereId, idx) => {
    setNotesPar(prev => {
      const lignes = [...(prev[matiereId] || [])];
      if (lignes.length <= 1) return prev;
      lignes.splice(idx, 1);
      return { ...prev, [matiereId]: lignes };
    });
  };

  const modifierNote = (matiereId, idx, champ, valeur) => {
    setNotesPar(prev => {
      const lignes = [...(prev[matiereId] || [])];
      lignes[idx] = { ...lignes[idx], [champ]: valeur };
      return { ...prev, [matiereId]: lignes };
    });
  };

  const moyenneMatiere = (matiereId) => {
    const lignes = notesPar[matiereId] || [];
    const vals = lignes
      .filter(l => l.note !== '')
      .map(l => ({ n: parseFloat(l.note), c: parseFloat(l.coef) || 1 }))
      .filter(l => !isNaN(l.n));
    if (!vals.length) return null;
    const totalCoef = vals.reduce((s, v) => s + v.c, 0);
    const total     = vals.reduce((s, v) => s + v.n * v.c, 0);
    return (total / totalCoef).toFixed(2);
  };

  const enregistrer = async () => {
    const lignesAEnr = [];
    Object.entries(notesPar).forEach(([matiereId, lignes]) => {
      lignes.forEach(l => {
        if (l.note !== '') {
          const n = parseFloat(l.note);
          if (!isNaN(n) && n >= 0 && n <= 20)
            lignesAEnr.push({ matiereId: parseInt(matiereId), note: n, type: l.type, coef: parseFloat(l.coef) || 1 });
        }
      });
    });
    if (!lignesAEnr.length) { Alert.alert('Attention', 'Entrez au moins une note'); return; }
    setSaving(true);
    try {
      for (const ligne of lignesAEnr) {
        await API.post('/evaluations/saisie', {
          Id_ETUDIANT:   etudiantSel.Id_ETUDIANT,
          Id_MATIERE:    ligne.matiereId,
          Id_PROFESSEUR: prof.Id_UTILISATEUR,
          Note:          ligne.note,
          Semestre:      semestre,
          Type:          ligne.type,
          Coef:          ligne.coef,
        });
      }
      Alert.alert('✅ Succès', `${lignesAEnr.length} note(s) enregistrée(s) !`, [
        { text: 'OK', onPress: () => setModalVisible(false) }
      ]);
    } catch (err) {
      Alert.alert('Erreur', err.response?.data?.error || 'Erreur sauvegarde');
    } finally { setSaving(false); }
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

  const filtreActif = classeActif || matiereActif || filiereActif;
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
    const moyennes = matieres
      .map(m => moyenneMatiere(m.Id_MATIERE))
      .filter(v => v !== null).map(v => parseFloat(v));
    if (!moyennes.length) return null;
    return (moyennes.reduce((s, v) => s + v, 0) / moyennes.length).toFixed(2);
  };

  if (loading) return (
    <View style={[styles.center, { backgroundColor: theme.bg }]}>
      <ActivityIndicator size="large" color={VERT} />
    </View>
  );

  const moyGen = moyenneGenerale();
  const matiereSelInfo = matiereActif ? filtres.matieres.find(m => m.Id_MATIERE === matiereActif) : null;

  return (
    <View style={[styles.wrapper, { backgroundColor: theme.bg }]}>
      <StatusBar barStyle="light-content" backgroundColor={VERT} />

      {/* ── MODAL GÉNÉRAL (sans filtre matière) ── */}
      <Modal visible={modalVisible} animationType="slide" transparent={false} onRequestClose={() => setModalVisible(false)}>
        <View style={[styles.wrapper, { backgroundColor: theme.bg }]}>
          <ScrollView contentContainerStyle={{ paddingBottom: insets.bottom + 24 }} keyboardShouldPersistTaps="handled">
            <View style={styles.modalHero}>
              <View style={styles.deco1} /><View style={styles.deco2} />
              <TouchableOpacity onPress={() => setModalVisible(false)} style={styles.backBtn}>
                <Text style={styles.backTxt}>← Retour</Text>
              </TouchableOpacity>
              <Text style={styles.modalTitre}>📝 Saisie des Notes</Text>
              <View style={styles.etudiantBox}>
                <View style={styles.etudiantAvatar}>
                  <Text style={styles.etudiantAvatarTxt}>{etudiantSel?.Nom_Etudiant?.charAt(0)?.toUpperCase()}</Text>
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.etudiantNom}>{etudiantSel?.Nom_Etudiant} {etudiantSel?.Prenoms_Etudiant}</Text>
                  <Text style={styles.etudiantMatricule}>📋 {etudiantSel?.Matricule_Etudiant}</Text>
                  {etudiantSel?.Nom_Classe && <Text style={styles.etudiantClasse}>📚 {etudiantSel?.Nom_Classe}</Text>}
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
                      style={[styles.semestreBtn, { backgroundColor: semestre === s ? VERT : theme.bg, borderColor: semestre === s ? VERT : theme.cardBorder }]}
                      onPress={() => setSemestre(s)}
                    >
                      <Text style={[styles.semestreBtnTxt, { color: semestre === s ? '#fff' : theme.textSub }]}>Semestre {s}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              {/* MOYENNE GÉNÉRALE */}
              {moyGen && (
                <View style={[styles.moyGenCard, { backgroundColor: theme.card }]}>
                  <View style={{ flex: 1 }}>
                    <Text style={[styles.moyGenTitre, { color: theme.textSub }]}>Moyenne générale</Text>
                    <Text style={[styles.moyGenVal, { color: theme.text }]}>{moyGen}<Text style={styles.moyGenSur}>/20</Text></Text>
                  </View>
                  {getMention(moyGen) && (
                    <View style={[styles.mentionBadge, { backgroundColor: getMention(moyGen).bg }]}>
                      <Text style={[styles.mentionTxt, { color: getMention(moyGen).color }]}>{getMention(moyGen).txt}</Text>
                    </View>
                  )}
                </View>
              )}

              {/* SECTIONS PAR MATIÈRE */}
              {matieres.map((mat) => {
                const lignes  = notesPar[mat.Id_MATIERE] || [{ type: 'Devoir', note: '', coef: '1' }];
                const moy     = moyenneMatiere(mat.Id_MATIERE);
                const mention = getMention(moy);
                const couleur = moy ? (parseFloat(moy) >= 10 ? VERT : ORANGE) : theme.cardBorder;
                return (
                  <View key={`sect-${mat.Id_MATIERE}`} style={[styles.matiereSection, { backgroundColor: theme.card, borderLeftColor: couleur }]}>
                    <View style={styles.matiereSectionHead}>
                      <View style={{ flex: 1 }}>
                        <Text style={[styles.matiereNom, { color: theme.text }]}>{mat.Nom_Matiere}</Text>
                        <Text style={[styles.matiereLignes, { color: theme.textMuted }]}>
                          {lignes.filter(l => l.note !== '').length} note(s) saisie(s)
                        </Text>
                      </View>
                      {moy && (
                        <View style={{ alignItems: 'flex-end', gap: 4 }}>
                          <Text style={[styles.matiereMoy, { color: couleur }]}>{moy}<Text style={[styles.matiereMoySur, { color: theme.textMuted }]}>/20</Text></Text>
                          {mention && <View style={[styles.mentionBadge, { backgroundColor: mention.bg }]}><Text style={[styles.mentionTxt, { color: mention.color }]}>{mention.txt}</Text></View>}
                        </View>
                      )}
                    </View>

                    {lignes.map((ligne, idx) => {
                      const noteVal = parseFloat(ligne.note);
                      const coul    = !ligne.note ? theme.cardBorder : noteVal >= 10 ? VERT : ORANGE;
                      return (
                        <View key={`ligne-${mat.Id_MATIERE}-${idx}`} style={[styles.ligneNote, { borderTopColor: theme.cardBorder }]}>
                          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 8 }}>
                            <View style={styles.typesRow}>
                              {TYPES_EVAL.map(t => (
                                <TouchableOpacity key={t}
                                  style={[styles.typeBtn, { backgroundColor: ligne.type === t ? VERT : theme.bg, borderColor: ligne.type === t ? VERT : theme.cardBorder }]}
                                  onPress={() => modifierNote(mat.Id_MATIERE, idx, 'type', t)}
                                >
                                  <Text style={[styles.typeBtnTxt, { color: ligne.type === t ? '#fff' : theme.textSub }]}>{t}</Text>
                                </TouchableOpacity>
                              ))}
                            </View>
                          </ScrollView>
                          <View style={styles.noteCoefRow}>
                            <View style={{ flex: 2 }}>
                              <Text style={[styles.inputLabel, { color: theme.textSub }]}>Note /20</Text>
                              <View style={styles.noteInputRow}>
                                <TextInput
                                  style={[styles.noteInput, { backgroundColor: theme.bg, borderColor: coul, color: theme.text }]}
                                  placeholder="0.00" placeholderTextColor={theme.textMuted}
                                  keyboardType="decimal-pad" value={ligne.note}
                                  onChangeText={v => modifierNote(mat.Id_MATIERE, idx, 'note', v)} maxLength={5}
                                />
                                <Text style={[styles.surVingt, { color: theme.textSub }]}>/20</Text>
                              </View>
                            </View>
                            <View style={{ flex: 1, marginLeft: 10 }}>
                              <Text style={[styles.inputLabel, { color: theme.textSub }]}>Coef.</Text>
                              <TextInput
                                style={[styles.coefInput, { backgroundColor: theme.bg, borderColor: theme.cardBorder, color: theme.text }]}
                                placeholder="1" placeholderTextColor={theme.textMuted}
                                keyboardType="decimal-pad" value={ligne.coef}
                                onChangeText={v => modifierNote(mat.Id_MATIERE, idx, 'coef', v)} maxLength={3}
                              />
                            </View>
                            {lignes.length > 1 && (
                              <TouchableOpacity style={styles.suppBtn} onPress={() => supprimerNote(mat.Id_MATIERE, idx)}>
                                <Text style={styles.suppBtnTxt}>🗑️</Text>
                              </TouchableOpacity>
                            )}
                          </View>
                          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginTop: 8 }}>
                            <View style={styles.quickBtns}>
                              {[0, 5, 8, 10, 12, 14, 16, 18, 20].map(v => (
                                <TouchableOpacity key={v}
                                  style={[styles.quickBtn, { backgroundColor: parseFloat(ligne.note) === v ? VERT : theme.bg, borderColor: parseFloat(ligne.note) === v ? VERT : theme.cardBorder }]}
                                  onPress={() => modifierNote(mat.Id_MATIERE, idx, 'note', String(v))}
                                >
                                  <Text style={[styles.quickBtnTxt, { color: parseFloat(ligne.note) === v ? '#fff' : theme.textSub }]}>{v}</Text>
                                </TouchableOpacity>
                              ))}
                            </View>
                          </ScrollView>
                        </View>
                      );
                    })}

                    <TouchableOpacity style={[styles.ajouterBtn, { borderColor: couleur }]} onPress={() => ajouterNote(mat.Id_MATIERE)}>
                      <Text style={[styles.ajouterBtnTxt, { color: couleur }]}>+ Ajouter une note</Text>
                    </TouchableOpacity>
                  </View>
                );
              })}

              <TouchableOpacity style={[styles.saveBtn, { backgroundColor: saving ? '#94A3B8' : VERT }]} onPress={enregistrer} disabled={saving}>
                {saving ? <ActivityIndicator color="#fff" /> : <Text style={styles.saveBtnTxt}>✅ Enregistrer toutes les notes</Text>}
              </TouchableOpacity>
            </View>
          </ScrollView>
        </View>
      </Modal>

      {/* ── PAGE PRINCIPALE ── */}
      <FlatList
        data={filtreActif ? etudiantsFiltres : []}
        keyExtractor={item => `etu-${item.Id_ETUDIANT}`}
        contentContainerStyle={{ paddingBottom: insets.bottom + 24 }}
        ListHeaderComponent={() => (
          <View>
            <View style={styles.hero}>
              <View style={styles.deco1} /><View style={styles.deco2} />
              <Text style={styles.heroTitre}>📝 Saisie des Notes</Text>
              <Text style={styles.heroSub}>Sélectionnez un filtre pour voir les étudiants</Text>
            </View>

            {/* BADGE MATIÈRE SÉLECTIONNÉE */}
            {matiereSelInfo && (
              <View style={[styles.matiereActiveBadge, { backgroundColor: VERT + '15', borderColor: VERT }]}>
                <Text style={[styles.matiereActiveTxt, { color: VERT }]}>
                  📖 Matière sélectionnée : <Text style={{ fontWeight: '900' }}>{matiereSelInfo.Nom_Matiere}</Text>
                </Text>
                <Text style={[styles.matiereActiveInfo, { color: VERT }]}>
                  → Cliquer sur un étudiant ouvrira la page dédiée à cette matière
                </Text>
              </View>
            )}

            <View style={[styles.filtresCard, { backgroundColor: theme.card }]}>
              <Text style={[styles.filtresTitre, { color: theme.text }]}>🎯 Filtrer les étudiants</Text>
              <Text style={[styles.filtresSub, { color: theme.textSub }]}>Choisissez au moins un filtre</Text>

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

            {filtreActif && (
              <View style={[styles.rechercheBox, { backgroundColor: theme.card }]}>
                <Text style={styles.rechercheIcon}>🔍</Text>
                <TextInput
                  style={[styles.rechercheInput, { color: theme.text }]}
                  placeholder="Rechercher un étudiant..."
                  placeholderTextColor={theme.textMuted}
                  value={recherche} onChangeText={setRecherche}
                />
                {recherche.length > 0 && (
                  <TouchableOpacity onPress={() => setRecherche('')}>
                    <Text style={{ color: theme.textMuted, fontSize: 16 }}>✕</Text>
                  </TouchableOpacity>
                )}
              </View>
            )}

            {filtreActif && !loadingEtuds && (
              <Text style={[styles.resultTxt, { color: theme.textSub }]}>
                {etudiantsFiltres.length} étudiant(s) trouvé(s)
                {matiereSelInfo ? ` — ${matiereSelInfo.Nom_Matiere}` : ''}
              </Text>
            )}
            {loadingEtuds && <ActivityIndicator size="small" color={VERT} style={{ margin: 20 }} />}
          </View>
        )}

        ListEmptyComponent={() => !loadingEtuds ? (
          <View style={[styles.emptyBox, { backgroundColor: theme.card, margin: 16 }]}>
            <Text style={styles.emptyIcon}>{filtreActif ? '👥' : '🎯'}</Text>
            <Text style={[styles.emptyTitre, { color: theme.text }]}>
              {filtreActif ? 'Aucun étudiant trouvé' : 'Sélectionnez un filtre'}
            </Text>
            <Text style={[styles.emptyTxt, { color: theme.textSub }]}>
              {filtreActif ? 'Essayez un autre filtre' : 'Choisissez une classe, matière ou filière'}
            </Text>
          </View>
        ) : null}

        renderItem={({ item }) => (
          <TouchableOpacity
            style={[styles.card, { backgroundColor: theme.card, borderColor: matiereSelInfo ? VERT : theme.cardBorder }]}
            onPress={() => ouvrirSaisie(item)}
            activeOpacity={0.85}
          >
            <View style={[styles.avatar, { backgroundColor: VERT + '20' }]}>
              <Text style={[styles.avatarTxt, { color: VERT }]}>{item.Nom_Etudiant?.charAt(0)?.toUpperCase()}</Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={[styles.nom, { color: theme.text }]}>{item.Nom_Etudiant} {item.Prenoms_Etudiant}</Text>
              <Text style={[styles.matricule, { color: theme.textSub }]}>📋 {item.Matricule_Etudiant}</Text>
              <View style={styles.badgesRow}>
                {item.Nom_Classe && <View style={[styles.badge, { backgroundColor: '#EFF6FF' }]}><Text style={[styles.badgeTxt, { color: '#2563EB' }]}>📚 {item.Nom_Classe}</Text></View>}
                {item.Nom_Filiere && <View style={[styles.badge, { backgroundColor: '#FDF4FF' }]}><Text style={[styles.badgeTxt, { color: '#9333EA' }]}>🏫 {item.Nom_Filiere}</Text></View>}
              </View>
            </View>
            <View style={[styles.noteBtn, { backgroundColor: matiereSelInfo ? VERT : '#64748B' }]}>
              <Text style={styles.noteBtnTxt}>{matiereSelInfo ? '📖 Matière' : '📝 Tout'}</Text>
            </View>
          </TouchableOpacity>
        )}
        ItemSeparatorComponent={() => <View style={{ height: 10, marginHorizontal: 16 }} />}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: { flex: 1 },
  center:  { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 },
  hero: {
    backgroundColor: VERT,
    paddingTop: Platform.OS === 'ios' ? 20 : (StatusBar.currentHeight || 24) + 16,
    paddingBottom: 28, paddingHorizontal: 20,
    borderBottomLeftRadius: 32, borderBottomRightRadius: 32, overflow: 'hidden', marginBottom: 12,
  },
  deco1: { position: 'absolute', width: 180, height: 180, borderRadius: 90, backgroundColor: 'rgba(255,255,255,0.07)', top: -50, right: -30 },
  deco2: { position: 'absolute', width: 120, height: 120, borderRadius: 60, backgroundColor: 'rgba(255,255,255,0.05)', bottom: -20, left: -20 },
  heroTitre: { color: '#fff', fontSize: 24, fontWeight: '900', marginBottom: 4 },
  heroSub:   { color: 'rgba(255,255,255,0.75)', fontSize: 13 },
  matiereActiveBadge: { marginHorizontal: 16, marginBottom: 10, borderRadius: 12, padding: 12, borderWidth: 1.5 },
  matiereActiveTxt:   { fontSize: 13, fontWeight: '700', marginBottom: 4 },
  matiereActiveInfo:  { fontSize: 11 },
  filtresCard:   { marginHorizontal: 16, borderRadius: 16, padding: 14, elevation: 2, marginBottom: 10 },
  filtresTitre:  { fontSize: 15, fontWeight: '800', marginBottom: 4 },
  filtresSub:    { fontSize: 12, marginBottom: 12 },
  filtreSection: { marginBottom: 12 },
  filtreLabel:   { fontSize: 12, fontWeight: '700', marginBottom: 6 },
  chipsRow:      { flexDirection: 'row', gap: 8 },
  chip:          { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20, borderWidth: 1.5 },
  chipTxt:       { fontSize: 12, fontWeight: '700' },
  rechercheBox:   { flexDirection: 'row', alignItems: 'center', marginHorizontal: 16, borderRadius: 14, padding: 12, gap: 10, elevation: 2, marginBottom: 8 },
  rechercheIcon:  { fontSize: 16 },
  rechercheInput: { flex: 1, fontSize: 14 },
  resultTxt:      { marginHorizontal: 16, fontSize: 12, fontWeight: '600', marginBottom: 8 },
  card:       { flexDirection: 'row', alignItems: 'center', marginHorizontal: 16, borderRadius: 16, padding: 14, borderWidth: 1.5, elevation: 2, gap: 12 },
  avatar:     { width: 48, height: 48, borderRadius: 24, justifyContent: 'center', alignItems: 'center' },
  avatarTxt:  { fontSize: 20, fontWeight: '900' },
  nom:        { fontSize: 15, fontWeight: '800', marginBottom: 3 },
  matricule:  { fontSize: 12, marginBottom: 6 },
  badgesRow:  { flexDirection: 'row', gap: 6, flexWrap: 'wrap' },
  badge:      { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 8 },
  badgeTxt:   { fontSize: 10, fontWeight: '700' },
  noteBtn:    { paddingHorizontal: 12, paddingVertical: 7, borderRadius: 12 },
  noteBtnTxt: { color: '#fff', fontSize: 12, fontWeight: '700' },
  emptyBox:   { borderRadius: 16, padding: 32, alignItems: 'center' },
  emptyIcon:  { fontSize: 48, marginBottom: 12 },
  emptyTitre: { fontSize: 16, fontWeight: '800', marginBottom: 4 },
  emptyTxt:   { fontSize: 13, textAlign: 'center' },
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
  semestreCard:   { borderRadius: 14, padding: 12, elevation: 2 },
  semestreTitre:  { fontSize: 13, fontWeight: '700', marginBottom: 8 },
  semestreRow:    { flexDirection: 'row', gap: 10 },
  semestreBtn:    { flex: 1, paddingVertical: 10, borderRadius: 12, alignItems: 'center', borderWidth: 1.5 },
  semestreBtnTxt: { fontSize: 13, fontWeight: '700' },
  moyGenCard:  { borderRadius: 14, padding: 16, elevation: 3, flexDirection: 'row', alignItems: 'center', borderWidth: 1.5, borderColor: VERT + '40' },
  moyGenTitre: { fontSize: 12, fontWeight: '600', marginBottom: 4 },
  moyGenVal:   { fontSize: 32, fontWeight: '900' },
  moyGenSur:   { fontSize: 16 },
  mentionBadge: { paddingHorizontal: 10, paddingVertical: 5, borderRadius: 10 },
  mentionTxt:   { fontSize: 11, fontWeight: '700' },
  matiereSection:     { borderRadius: 16, padding: 14, elevation: 2, borderLeftWidth: 4, gap: 10 },
  matiereSectionHead: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  matiereNom:         { fontSize: 15, fontWeight: '900', marginBottom: 2 },
  matiereLignes:      { fontSize: 11 },
  matiereMoy:         { fontSize: 22, fontWeight: '900' },
  matiereMoySur:      { fontSize: 12 },
  ligneNote:   { paddingTop: 10, borderTopWidth: 1, gap: 6 },
  typesRow:    { flexDirection: 'row', gap: 6 },
  typeBtn:     { paddingHorizontal: 10, paddingVertical: 6, borderRadius: 10, borderWidth: 1.5 },
  typeBtnTxt:  { fontSize: 11, fontWeight: '700' },
  noteCoefRow: { flexDirection: 'row', alignItems: 'flex-end', gap: 8 },
  inputLabel:  { fontSize: 11, fontWeight: '600', marginBottom: 4 },
  noteInputRow:{ flexDirection: 'row', alignItems: 'center', gap: 4 },
  noteInput:   { flex: 1, height: 44, borderRadius: 10, paddingHorizontal: 12, fontSize: 18, fontWeight: '800', borderWidth: 1.5, textAlign: 'center' },
  surVingt:    { fontSize: 13, fontWeight: '600' },
  coefInput:   { height: 44, borderRadius: 10, paddingHorizontal: 12, fontSize: 16, fontWeight: '700', borderWidth: 1.5, textAlign: 'center' },
  suppBtn:     { width: 40, height: 44, justifyContent: 'center', alignItems: 'center' },
  suppBtnTxt:  { fontSize: 18 },
  quickBtns:   { flexDirection: 'row', gap: 5 },
  quickBtn:    { paddingHorizontal: 9, paddingVertical: 5, borderRadius: 8, borderWidth: 1.5 },
  quickBtnTxt: { fontSize: 11, fontWeight: '700' },
  ajouterBtn:  { borderRadius: 10, padding: 10, alignItems: 'center', borderWidth: 1.5, borderStyle: 'dashed' },
  ajouterBtnTxt: { fontSize: 13, fontWeight: '700' },
  saveBtn:     { borderRadius: 16, padding: 16, alignItems: 'center', marginTop: 4, elevation: 3 },
  saveBtnTxt:  { color: '#fff', fontSize: 16, fontWeight: '900' },
});