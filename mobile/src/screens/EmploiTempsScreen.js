import React, { useEffect, useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, ActivityIndicator,
  Alert, RefreshControl, StatusBar, TouchableOpacity, Platform
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../context/ThemeContext';
import API from '../api/api';

const VERT   = '#2E7D32';
const ORANGE = '#D84315';

const JOURS_FR  = ['Dimanche','Lundi','Mardi','Mercredi','Jeudi','Vendredi','Samedi'];
const MOIS_FR   = ['Jan','Fév','Mar','Avr','Mai','Jun','Jul','Aoû','Sep','Oct','Nov','Déc'];
const MOIS_LONG = ['Janvier','Février','Mars','Avril','Mai','Juin','Juillet','Août','Septembre','Octobre','Novembre','Décembre'];
const JOURS_CAL = ['D','L','M','M','J','V','S'];

const JOUR_COULEURS = {
  Lundi:    { bg: '#EFF6FF', border: '#2563EB', txt: '#1D4ED8' },
  Mardi:    { bg: '#FFF7ED', border: '#EA580C', txt: '#C2410C' },
  Mercredi: { bg: '#F0FDF4', border: VERT,      txt: VERT      },
  Jeudi:    { bg: '#FDF4FF', border: '#9333EA', txt: '#7E22CE' },
  Vendredi: { bg: '#FFF1F2', border: '#E11D48', txt: '#BE123C' },
  Samedi:   { bg: '#FFFBEB', border: '#D97706', txt: '#B45309' },
};

const toDateStr = (date) => {
  const d = new Date(date);
  return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
};

function getLundiDeSemaine(date) {
  const d    = new Date(date);
  const jour = d.getDay();
  const diff = jour === 0 ? -6 : 1 - jour;
  d.setDate(d.getDate() + diff);
  return d;
}

function getSemaine(dateRef) {
  const lundi = getLundiDeSemaine(dateRef);
  return Array.from({ length: 6 }, (_, i) => {
    const d = new Date(lundi);
    d.setDate(lundi.getDate() + i);
    return d;
  });
}

// ── CARD COURS — style identique à PaiementsScreen ──
function CoursCard({ cours, col, theme }) {
  const duree = (cours.Heure_Fin && cours.Heure_Debut)
    ? Math.round((new Date(`2000-01-01T${cours.Heure_Fin}`) - new Date(`2000-01-01T${cours.Heure_Debut}`)) / 3600000)
    : null;

  return (
    <View style={[styles.card, { backgroundColor: theme.card, borderLeftColor: col?.border || '#2563EB' }]}>
      {/* LIGNE PRINCIPALE */}
      <View style={styles.cardTop}>
        <View style={styles.cardLeft}>
          <Text style={[styles.matiere, { color: theme.text }]}>
            {cours.Nom_Matiere || cours.Lib_Matiere || 'Cours'}
          </Text>
          <Text style={[styles.cardDate, { color: theme.textMuted }]}>
            {cours.Date_Cours
              ? `📆 ${new Date(cours.Date_Cours).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}`
              : `📅 ${cours.Jour_Semaine}`
            }
          </Text>
        </View>
        <View style={styles.montantBox}>
          <Text style={[styles.heureVal, { color: col?.txt || VERT }]}>
            {cours.Heure_Debut?.substring(0,5)}
          </Text>
          <Text style={[styles.heureDevise, { color: theme.textSub }]}>
            {duree ? `${duree}h` : ''}
          </Text>
        </View>
      </View>
      {/* FOOTER */}
      <View style={[styles.cardFooter, { borderTopColor: theme.cardBorder }]}>
        <View style={[styles.horaireBadge, { backgroundColor: col?.bg || '#EFF6FF' }]}>
          <Text style={[styles.horaireTxt, { color: col?.txt || '#1D4ED8' }]}>
            ⏰ {cours.Heure_Debut} — {cours.Heure_Fin}
          </Text>
        </View>
        <View style={styles.infoRight}>
          <Text style={[styles.infoTxt, { color: theme.textSub }]}>
            📍 {cours.Nom_Salle || 'N/A'}
          </Text>
          <Text style={[styles.infoTxt, { color: theme.textSub }]}>
            👨‍🏫 {cours.Nom_Professeur || 'N/A'}
          </Text>
        </View>
      </View>
    </View>
  );
}

export default function EmploiTempsScreen() {
  const [emploi,  setEmploi]  = useState([]);
  const [loading, setLoading] = useState(true);
  const [refresh, setRefresh] = useState(false);
  const [vue,     setVue]     = useState('jour');
  const [dateRef, setDateRef] = useState(new Date());
  const insets   = useSafeAreaInsets();
  const themeCtx = useTheme();
  const theme    = themeCtx?.theme || {
    bg: '#F5F7F5', card: '#FFFFFF', cardBorder: '#E2E8F0',
    text: '#1E293B', textSub: '#64748B', textMuted: '#94A3B8',
  };
  const today = new Date();

  useEffect(() => { loadEmploi(); }, []);

  const loadEmploi = async () => {
    try {
      const stored = await AsyncStorage.getItem('user');
      const user   = JSON.parse(stored);
      const res    = await API.get(`/emploiTemps/etudiant/${user.Id_UTILISATEUR}`);
      setEmploi(res.data);
    } catch (err) {
      Alert.alert('Erreur', "Impossible de charger l'emploi du temps");
    } finally {
      setLoading(false);
      setRefresh(false);
    }
  };

  const getCoursDuJour = (date) => {
    const dateStr = toDateStr(date);
    const nomJour = JOURS_FR[date.getDay()];
    const avecDate  = emploi.filter(e => e.Date_Cours);
    const sansDate  = emploi.filter(e => !e.Date_Cours);
    const coursDateExacte = avecDate.filter(e => toDateStr(e.Date_Cours) === dateStr);
    const joursAvecDateCeSemaine = new Set(avecDate.map(e => toDateStr(e.Date_Cours)));
    const coursRecurrents = sansDate.filter(e =>
      e.Jour_Semaine === nomJour && !joursAvecDateCeSemaine.has(dateStr)
    );
    return [...coursDateExacte, ...coursRecurrents]
      .sort((a, b) => (a.Heure_Debut || '').localeCompare(b.Heure_Debut || ''));
  };

  const naviguer = (sens) => {
    const d = new Date(dateRef);
    if (vue === 'jour')    d.setDate(d.getDate() + sens);
    if (vue === 'semaine') d.setDate(d.getDate() + sens * 7);
    if (vue === 'mois')    d.setMonth(d.getMonth() + sens);
    if (vue === 'annee')   d.setFullYear(d.getFullYear() + sens);
    setDateRef(d);
  };

  const getNavLabel = () => {
    if (vue === 'jour')    return dateRef.toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' });
    if (vue === 'semaine') {
      const sem = getSemaine(dateRef);
      return `${sem[0].getDate()} ${MOIS_FR[sem[0].getMonth()]} — ${sem[5].getDate()} ${MOIS_FR[sem[5].getMonth()]} ${sem[5].getFullYear()}`;
    }
    if (vue === 'mois')  return `${MOIS_LONG[dateRef.getMonth()]} ${dateRef.getFullYear()}`;
    if (vue === 'annee') return `${dateRef.getFullYear()}`;
    return '';
  };

  const coursAujourdhui = getCoursDuJour(today);
  const totalCours  = emploi.length;
  const joursActifs = Object.keys(JOUR_COULEURS).filter(j => emploi.some(e => e.Jour_Semaine === j)).length;

  // ── VUE JOUR ─────────────────────────────────
  const VueJour = () => {
    const nomJour = JOURS_FR[dateRef.getDay()];
    const col     = JOUR_COULEURS[nomJour];
    const isToday = dateRef.toDateString() === today.toDateString();
    const cours   = getCoursDuJour(dateRef);
    return (
      <View style={styles.listContainer}>
        {isToday && (
          <View style={[styles.todayBanner, { backgroundColor: VERT + '15', borderColor: VERT }]}>
            <Text style={[styles.todayBannerTxt, { color: VERT }]}>
              ✅ Aujourd'hui — {dateRef.toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' })}
            </Text>
          </View>
        )}
        {!col ? (
          <View style={[styles.emptyBox, { backgroundColor: theme.card }]}>
            <Text style={styles.emptyIcon}>🏖️</Text>
            <Text style={[styles.emptyTitre, { color: theme.text }]}>Jour libre</Text>
            <Text style={[styles.emptyTxt, { color: theme.textSub }]}>Pas de cours ce jour</Text>
          </View>
        ) : cours.length === 0 ? (
          <View style={[styles.emptyBox, { backgroundColor: theme.card }]}>
            <Text style={styles.emptyIcon}>📭</Text>
            <Text style={[styles.emptyTitre, { color: theme.text }]}>Aucun cours prévu</Text>
            <Text style={[styles.emptyTxt, { color: theme.textSub }]}>
              {dateRef.toLocaleDateString('fr-FR', { day: 'numeric', month: 'long' })}
            </Text>
          </View>
        ) : (
          cours.map((c, idx) => (
            <CoursCard key={`jour-${toDateStr(dateRef)}-${c.Id_MATIERE}-${idx}`} cours={c} col={col} theme={theme} />
          ))
        )}
      </View>
    );
  };

  // ── VUE SEMAINE ───────────────────────────────
  const VueSemaine = () => {
    const datesSemaine = getSemaine(dateRef);
    return (
      <View style={styles.listContainer}>
        {datesSemaine.map((date, semIdx) => {
          const nomJour = JOURS_FR[date.getDay()];
          const col     = JOUR_COULEURS[nomJour];
          const isToday = date.toDateString() === today.toDateString();
          const cours   = getCoursDuJour(date);
          if (!col) return null;
          return (
            <View key={`sem-${semIdx}-${toDateStr(date)}`} style={styles.jourSection}>
              <View style={[styles.jourHeader, { borderLeftColor: col.border }, isToday && { backgroundColor: col.bg, borderRadius: 10, paddingRight: 8 }]}>
                <View>
                  <Text style={[styles.jourTitre, { color: col.txt }]}>{nomJour}</Text>
                  <Text style={[styles.jourDate, { color: theme.textSub }]}>
                    {date.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })}
                    {isToday ? " • Aujourd'hui" : ''}
                  </Text>
                </View>
                <View style={[styles.coursCountBadge, { backgroundColor: col.border + '20' }]}>
                  <Text style={[styles.jourCount, { color: col.border }]}>{cours.length} cours</Text>
                </View>
              </View>
              {cours.length === 0 ? (
                <Text style={[styles.jourVide, { color: theme.textMuted }]}>Aucun cours ce jour</Text>
              ) : (
                cours.map((c, cIdx) => (
                  <CoursCard key={`sem-${semIdx}-${toDateStr(date)}-${cIdx}-${c.Id_MATIERE}`} cours={c} col={col} theme={theme} />
                ))
              )}
            </View>
          );
        })}
      </View>
    );
  };

  // ── VUE MOIS ──────────────────────────────────
  const VueMois = () => {
    const annee = dateRef.getFullYear();
    const mois  = dateRef.getMonth();
    const premierJour = new Date(annee, mois, 1).getDay();
    const nbJours     = new Date(annee, mois + 1, 0).getDate();
    const cases = [...Array(premierJour).fill(null), ...Array.from({ length: nbJours }, (_, i) => i + 1)];

    return (
      <View style={styles.listContainer}>
        {/* CALENDRIER */}
        <View style={[styles.progressCard, { backgroundColor: theme.card }]}>
          <Text style={[styles.calTitre, { color: theme.text }]}>{MOIS_LONG[mois]} {annee}</Text>
          <View style={styles.calJoursSemaine}>
            {JOURS_CAL.map((j, ji) => (
              <Text key={`jcal-${mois}-${ji}`} style={[styles.calJourSemaineTxt, { color: theme.textMuted }]}>{j}</Text>
            ))}
          </View>
          <View style={styles.calGrille}>
            {cases.map((jour, ci) => {
              if (!jour) return <View key={`vide-${annee}-${mois}-${ci}`} style={styles.calCase} />;
              const date    = new Date(annee, mois, jour);
              const nomJour = JOURS_FR[date.getDay()];
              const col     = JOUR_COULEURS[nomJour];
              const hasCours = getCoursDuJour(date).length > 0;
              const isToday  = date.toDateString() === today.toDateString();
              const isWeekend = [0, 6].includes(date.getDay());
              return (
                <View key={`case-${annee}-${mois}-${jour}`} style={[
                  styles.calCase,
                  isToday  && { backgroundColor: VERT, borderRadius: 18 },
                  hasCours && !isToday && col && { backgroundColor: col.bg + '80', borderRadius: 18 },
                ]}>
                  <Text style={[
                    styles.calJourTxt,
                    { color: isToday ? '#fff' : isWeekend ? ORANGE : theme.text },
                    hasCours && !isToday && col && { color: col.txt, fontWeight: '900' },
                  ]}>{jour}</Text>
                  {hasCours && !isToday && col && <View style={[styles.calPoint, { backgroundColor: col.border }]} />}
                </View>
              );
            })}
          </View>
          <View style={styles.calLegende}>
            <View style={styles.calLegendeItem}>
              <View style={[styles.calLegendeDot, { backgroundColor: VERT }]} />
              <Text style={[styles.calLegendeTxt, { color: theme.textSub }]}>Aujourd'hui</Text>
            </View>
            {Object.entries(JOUR_COULEURS).filter(([j]) => emploi.some(e => e.Jour_Semaine === j)).map(([j, col]) => (
              <View key={`leg-${j}`} style={styles.calLegendeItem}>
                <View style={[styles.calLegendeDot, { backgroundColor: col.border }]} />
                <Text style={[styles.calLegendeTxt, { color: theme.textSub }]}>{j.substring(0,3)}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* COURS PAR JOUR */}
        {Object.entries(JOUR_COULEURS).map(([nomJour, col]) => {
          const coursCeJourCeMois = [];
          for (let d = 1; d <= nbJours; d++) {
            const date = new Date(annee, mois, d);
            if (JOURS_FR[date.getDay()] === nomJour) {
              const cours = getCoursDuJour(date);
              if (cours.length > 0) coursCeJourCeMois.push({ date, cours });
            }
          }
          if (!coursCeJourCeMois.length) return null;
          return (
            <View key={`mois-${nomJour}`} style={styles.jourSection}>
              <View style={[styles.jourHeader, { borderLeftColor: col.border }]}>
                <Text style={[styles.jourTitre, { color: col.txt }]}>{nomJour}</Text>
                <Text style={[styles.jourCount, { color: theme.textMuted }]}>{coursCeJourCeMois.length}× ce mois</Text>
              </View>
              {coursCeJourCeMois.map(({ date, cours }, semIdx) => (
                <View key={`mois-sem-${nomJour}-${toDateStr(date)}`}>
                  <Text style={[styles.dateSemaine, { color: theme.textMuted, backgroundColor: theme.bg }]}>
                    📅 {date.toLocaleDateString('fr-FR', { day: 'numeric', month: 'long' })}
                  </Text>
                  {cours.map((c, cIdx) => (
                    <CoursCard key={`mois-${nomJour}-${toDateStr(date)}-${cIdx}`} cours={c} col={col} theme={theme} />
                  ))}
                </View>
              ))}
            </View>
          );
        })}
      </View>
    );
  };

  // ── VUE ANNÉE ─────────────────────────────────
  const VueAnnee = () => {
    const annee = dateRef.getFullYear();
    return (
      <View style={styles.listContainer}>
        {/* RÉSUMÉ — style progressCard */}
        <View style={[styles.progressCard, { backgroundColor: theme.card }]}>
          <View style={styles.progressHeader}>
            <Text style={[styles.progressTitre, { color: theme.text }]}>📊 Résumé {annee}</Text>
          </View>
          <View style={styles.statsRow}>
            <View style={styles.statCard}>
              <Text style={[styles.statVal, { color: VERT }]}>{totalCours}</Text>
              <Text style={styles.statLabel}>Cours/sem</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statCard}>
              <Text style={[styles.statVal, { color: '#2563EB' }]}>{totalCours * 36}</Text>
              <Text style={styles.statLabel}>Cours/an</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statCard}>
              <Text style={[styles.statVal, { color: ORANGE }]}>{joursActifs}</Text>
              <Text style={styles.statLabel}>Jours actifs</Text>
            </View>
          </View>
        </View>

        {/* 12 MOIS MINI */}
        <View style={styles.anneeGrille}>
          {MOIS_LONG.map((nomMois, moisIdx) => {
            const premierJour = new Date(annee, moisIdx, 1).getDay();
            const nbJours     = new Date(annee, moisIdx + 1, 0).getDate();
            const cases = [...Array(premierJour).fill(null), ...Array.from({ length: nbJours }, (_, i) => i + 1)];
            return (
              <View key={`annee-mois-${annee}-${moisIdx}`} style={[styles.moisMiniCard, { backgroundColor: theme.card }]}>
                <Text style={[styles.moisMiniTitre, { color: theme.text }]}>{nomMois}</Text>
                <View style={styles.calGrilleMini}>
                  {JOURS_CAL.map((j, ji) => (
                    <Text key={`head-${annee}-${moisIdx}-${ji}`} style={[styles.calJourSemaineMini, { color: theme.textMuted }]}>{j}</Text>
                  ))}
                  {cases.map((jour, ci) => {
                    if (!jour) return <View key={`v-${annee}-${moisIdx}-${ci}`} style={styles.calCaseMini} />;
                    const date    = new Date(annee, moisIdx, jour);
                    const nomJour = JOURS_FR[date.getDay()];
                    const col     = JOUR_COULEURS[nomJour];
                    const hasCours = getCoursDuJour(date).length > 0;
                    const isToday  = date.toDateString() === today.toDateString();
                    return (
                      <View key={`mini-${annee}-${moisIdx}-${jour}`} style={[
                        styles.calCaseMini,
                        isToday  && { backgroundColor: VERT, borderRadius: 8 },
                        hasCours && !isToday && col && { backgroundColor: col.bg, borderRadius: 8 },
                      ]}>
                        <Text style={[styles.calJourMini, { color: isToday ? '#fff' : hasCours && col ? col.txt : theme.textMuted }]}>
                          {jour}
                        </Text>
                      </View>
                    );
                  })}
                </View>
              </View>
            );
          })}
        </View>
      </View>
    );
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
        refreshControl={<RefreshControl refreshing={refresh} onRefresh={() => { setRefresh(true); loadEmploi(); }} colors={[VERT]} />}
        contentContainerStyle={{ paddingBottom: insets.bottom + 24 }}
      >
        {/* HERO — identique Paiements */}
        <View style={styles.hero}>
          <View style={styles.decoCircle1} />
          <View style={styles.decoCircle2} />
          <Text style={styles.heroTitre}>🕐 Emploi du Temps</Text>
          <Text style={styles.heroSub}>{totalCours} cours programmé(s)</Text>
          <View style={styles.statsRow}>
            <View style={styles.statCard}>
              <Text style={[styles.statVal, { color: '#4ADE80' }]}>{totalCours}</Text>
              <Text style={styles.statLabel}>Cours/sem</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statCard}>
              <Text style={[styles.statVal, { color: '#60A5FA' }]}>{joursActifs}</Text>
              <Text style={styles.statLabel}>Jours actifs</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statCard}>
              <Text style={[styles.statVal, { color: ORANGE }]}>{coursAujourdhui.length}</Text>
              <Text style={styles.statLabel}>Aujourd'hui</Text>
            </View>
          </View>
        </View>

        {/* TABS VUES — style progressCard */}
        <View style={[styles.progressCard, { backgroundColor: theme.card, padding: 4, flexDirection: 'row' }]}>
          {[
            { key: 'jour',    label: 'Jour' },
            { key: 'semaine', label: 'Semaine' },
            { key: 'mois',    label: 'Mois' },
            { key: 'annee',   label: 'Année' },
          ].map(v => (
            <TouchableOpacity
              key={`tab-${v.key}`}
              style={[styles.tabVue, vue === v.key && { backgroundColor: VERT }]}
              onPress={() => { setVue(v.key); setDateRef(new Date()); }}
            >
              <Text style={[styles.tabVueTxt, { color: vue === v.key ? '#fff' : theme.textSub }]}>
                {v.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* NAVIGATION DATE — style progressCard */}
        <View style={[styles.progressCard, { backgroundColor: theme.card }]}>
          <View style={styles.navRow}>
            <TouchableOpacity style={styles.navBtn} onPress={() => naviguer(-1)}>
              <Text style={[styles.navBtnTxt, { color: VERT }]}>‹</Text>
            </TouchableOpacity>
            <TouchableOpacity style={{ alignItems: 'center', flex: 1 }} onPress={() => setDateRef(new Date())}>
              <Text style={[styles.navLabel, { color: theme.text }]} numberOfLines={1}>{getNavLabel()}</Text>
              <Text style={[styles.navReset, { color: VERT }]}>↩ Aujourd'hui</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.navBtn} onPress={() => naviguer(1)}>
              <Text style={[styles.navBtnTxt, { color: VERT }]}>›</Text>
            </TouchableOpacity>
          </View>
        </View>

        {vue === 'jour'    && <VueJour />}
        {vue === 'semaine' && <VueSemaine />}
        {vue === 'mois'    && <VueMois />}
        {vue === 'annee'   && <VueAnnee />}

        {/* CONTACT — identique Paiements */}
        <View style={[styles.contactBox, { backgroundColor: theme.card, borderColor: theme.cardBorder }]}>
          <Text style={[styles.contactTitre, { color: VERT }]}>🏫 GROUPE COFE-CESA</Text>
          <Text style={[styles.contactTxt, { color: theme.textSub }]}>📍 Koumassi Nord-Est, Abidjan</Text>
          <Text style={[styles.contactTxt, { color: theme.textSub }]}>📞 (+225) 27 21 56 31 74</Text>
        </View>

      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: { flex: 1 },
  center:  { flex: 1, justifyContent: 'center', alignItems: 'center' },

  // APRÈS
hero: {
  backgroundColor: VERT,
  paddingTop: Platform.OS === 'ios' ? 20 : (StatusBar.currentHeight || 24) + 16,
  paddingBottom: 32, paddingHorizontal: 20,
  borderBottomLeftRadius: 32, borderBottomRightRadius: 32, overflow: 'hidden',
},
  decoCircle1: { position: 'absolute', width: 180, height: 180, borderRadius: 90, backgroundColor: 'rgba(255,255,255,0.08)', top: -50, right: -30 },
  decoCircle2: { position: 'absolute', width: 120, height: 120, borderRadius: 60, backgroundColor: 'rgba(255,255,255,0.05)', bottom: -20, left: -20 },
  heroTitre: { color: '#fff', fontSize: 24, fontWeight: '900', marginBottom: 4 },
  heroSub:   { color: 'rgba(255,255,255,0.7)', fontSize: 14, marginBottom: 20 },
  statsRow:  { flexDirection: 'row', backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: 16, padding: 16, borderWidth: 1, borderColor: 'rgba(255,255,255,0.15)' },
  statCard:  { flex: 1, alignItems: 'center' },
  statVal:   { fontSize: 20, fontWeight: '900' },
  statLabel: { fontSize: 10, color: 'rgba(255,255,255,0.6)', marginTop: 3, textAlign: 'center' },
  statDivider: { width: 1, backgroundColor: 'rgba(255,255,255,0.15)' },

  // PROGRESS CARD — copié de Paiements
  progressCard: { marginHorizontal: 16, marginTop: 16, borderRadius: 20, padding: 18, elevation: 4, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.08 },
  progressHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
  progressTitre: { fontSize: 14, fontWeight: '700' },

  // TABS
  tabVue:    { flex: 1, paddingVertical: 9, alignItems: 'center', borderRadius: 16 },
  tabVueTxt: { fontSize: 12, fontWeight: '700' },

  // NAVIGATION
  navRow:    { flexDirection: 'row', alignItems: 'center' },
  navBtn:    { width: 36, height: 36, justifyContent: 'center', alignItems: 'center' },
  navBtnTxt: { fontSize: 28, fontWeight: '300' },
  navLabel:  { fontSize: 13, fontWeight: '800', textAlign: 'center' },
  navReset:  { fontSize: 10, fontWeight: '600', textAlign: 'center', marginTop: 2 },

  // LISTE — copié de Paiements
  listContainer: { padding: 16, paddingTop: 12, gap: 12 },

  // CARD COURS — style carte paiement
  card: { borderRadius: 18, padding: 16, elevation: 3, borderLeftWidth: 4, shadowColor: '#000', shadowOffset: { width: 0, height: 3 }, shadowOpacity: 0.07 },
  cardTop:  { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 },
  cardLeft: { flex: 1, marginRight: 12 },
  matiere:  { fontSize: 15, fontWeight: '800', marginBottom: 4 },
  cardDate: { fontSize: 12 },
  montantBox: { alignItems: 'flex-end' },
  heureVal:   { fontSize: 20, fontWeight: '900' },
  heureDevise: { fontSize: 11, fontWeight: '600' },
  cardFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingTop: 10, borderTopWidth: 1 },
  horaireBadge: { paddingHorizontal: 12, paddingVertical: 5, borderRadius: 10 },
  horaireTxt:   { fontSize: 12, fontWeight: '700' },
  infoRight:    { alignItems: 'flex-end', gap: 2 },
  infoTxt:      { fontSize: 11 },

  // SECTION JOUR
  jourSection: { gap: 8 },
  jourHeader:  { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', borderLeftWidth: 4, paddingLeft: 10, paddingVertical: 4, marginBottom: 4 },
  jourTitre:   { fontSize: 15, fontWeight: '900' },
  jourDate:    { fontSize: 11, marginTop: 1 },
  coursCountBadge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 10 },
  jourCount:   { fontSize: 11, fontWeight: '700' },
  jourVide:    { fontSize: 12, fontStyle: 'italic', paddingLeft: 14, color: '#94A3B8' },
  dateSemaine: { fontSize: 11, fontWeight: '700', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8, marginBottom: 4, alignSelf: 'flex-start' },

  todayBanner:    { borderRadius: 10, padding: 10, borderWidth: 1.5, alignItems: 'center' },
  todayBannerTxt: { fontSize: 13, fontWeight: '700' },

  // CALENDRIER
  calTitre: { fontSize: 14, fontWeight: '800', marginBottom: 10, textAlign: 'center' },
  calJoursSemaine: { flexDirection: 'row', marginBottom: 4 },
  calJourSemaineTxt: { flex: 1, textAlign: 'center', fontSize: 10, fontWeight: '700' },
  calGrille: { flexDirection: 'row', flexWrap: 'wrap' },
  calCase:   { width: '14.28%', aspectRatio: 1, justifyContent: 'center', alignItems: 'center' },
  calJourTxt: { fontSize: 11, fontWeight: '600' },
  calPoint:   { width: 4, height: 4, borderRadius: 2, marginTop: 1 },
  calLegende: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 8, paddingTop: 8, borderTopWidth: 1, borderTopColor: '#F1F5F9', justifyContent: 'center' },
  calLegendeItem: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  calLegendeDot:  { width: 7, height: 7, borderRadius: 4 },
  calLegendeTxt:  { fontSize: 10, fontWeight: '600' },

  // ANNÉE
  anneeGrille: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  moisMiniCard: { width: '47.5%', borderRadius: 12, padding: 10, elevation: 2 },
  moisMiniTitre: { fontSize: 12, fontWeight: '800', marginBottom: 6 },
  calGrilleMini: { flexDirection: 'row', flexWrap: 'wrap' },
  calCaseMini:   { width: '14.28%', aspectRatio: 1, justifyContent: 'center', alignItems: 'center' },
  calJourSemaineMini: { width: '14.28%', textAlign: 'center', fontSize: 8, fontWeight: '700' },
  calJourMini:   { fontSize: 8, fontWeight: '600' },

  // EMPTY
  emptyBox:   { borderRadius: 18, padding: 32, alignItems: 'center', elevation: 2 },
  emptyIcon:  { fontSize: 48, marginBottom: 12 },
  emptyTitre: { fontSize: 18, fontWeight: '900', marginBottom: 4 },
  emptyTxt:   { fontSize: 13 },

  // CONTACT — copié de Paiements
  contactBox: { marginHorizontal: 16, marginTop: 4, borderRadius: 20, padding: 18, elevation: 2, marginBottom: 8, borderWidth: 1 },
  contactTitre: { fontSize: 14, fontWeight: '800', marginBottom: 10 },
  contactTxt: { fontSize: 13, marginBottom: 4, lineHeight: 20 },
});