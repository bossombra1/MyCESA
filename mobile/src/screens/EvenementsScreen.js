import React, { useEffect, useState, useRef } from 'react';
import {
  View, Text, StyleSheet, ScrollView, ActivityIndicator,
  StatusBar, RefreshControl, TouchableOpacity
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import API from '../api/api';
import { useTheme } from '../context/ThemeContext';

const VERT   = '#2E7D32';
const ORANGE = '#D84315';

const TYPE_CONFIG = {
  examen:     { icon: '📝', couleur: '#EF4444', bg: '#FEE2E2', label: 'Examen' },
  devoir:     { icon: '📋', couleur: '#F59E0B', bg: '#FEF3C7', label: 'Devoir' },
  soutenance: { icon: '🎓', couleur: '#8B5CF6', bg: '#F5F3FF', label: 'Soutenance' },
  evenement:  { icon: '🎉', couleur: '#2563EB', bg: '#EFF6FF', label: 'Événement' },
  paiement:   { icon: '💰', couleur: VERT,      bg: '#F0FDF4', label: 'Paiement' },
  conge:      { icon: '🏖️', couleur: '#0EA5E9', bg: '#F0F9FF', label: 'Congé' },
};

const MOIS = ['Janvier','Février','Mars','Avril','Mai','Juin','Juillet','Août','Septembre','Octobre','Novembre','Décembre'];
const JOURS_SEMAINE = ['Dim','Lun','Mar','Mer','Jeu','Ven','Sam'];

function CompteARebours({ date }) {
  const [temps, setTemps] = useState('');
  const intervalRef = useRef(null);

  useEffect(() => {
    const calculer = () => {
      const diff = new Date(date) - new Date();
      if (diff <= 0) { setTemps('Terminé'); return; }
      const j = Math.floor(diff / 86400000);
      const h = Math.floor((diff % 86400000) / 3600000);
      const m = Math.floor((diff % 3600000) / 60000);
      const s = Math.floor((diff % 60000) / 1000);
      if (j > 0) setTemps(`${j}j ${h}h ${m}m`);
      else if (h > 0) setTemps(`${h}h ${m}m ${s}s`);
      else setTemps(`${m}m ${s}s`);
    };
    calculer();
    intervalRef.current = setInterval(calculer, 1000);
    return () => clearInterval(intervalRef.current);
  }, [date]);

  return <Text style={styles.reboursTxt}>{temps}</Text>;
}

function Calendrier({ evenements, theme }) {
  const today      = new Date();
  const [annee, setAnnee] = useState(today.getFullYear());
  const [mois, setMois]   = useState(today.getMonth());

  const premierJour = new Date(annee, mois, 1).getDay();
  const nbJours     = new Date(annee, mois + 1, 0).getDate();

  // Jours avec événements ce mois
  const joursAvecEv = evenements
    .filter(e => {
      const d = new Date(e.Date_Evenement);
      return d.getFullYear() === annee && d.getMonth() === mois;
    })
    .map(e => new Date(e.Date_Evenement).getDate());

  const cases = [];
  for (let i = 0; i < premierJour; i++) cases.push(null);
  for (let d = 1; d <= nbJours; d++) cases.push(d);

  const moisPrecedent = () => {
    if (mois === 0) { setMois(11); setAnnee(annee - 1); }
    else setMois(mois - 1);
  };
  const moisSuivant = () => {
    if (mois === 11) { setMois(0); setAnnee(annee + 1); }
    else setMois(mois + 1);
  };

  return (
    <View style={[styles.calCard, { backgroundColor: theme?.card || '#fff' }]}>
      {/* NAVIGATION */}
      <View style={styles.calNav}>
        <TouchableOpacity style={styles.calNavBtn} onPress={moisPrecedent}>
          <Text style={[styles.calNavTxt, { color: VERT }]}>‹</Text>
        </TouchableOpacity>
        <View style={{ alignItems: 'center' }}>
          <Text style={[styles.calMois, { color: theme?.text || '#1E293B' }]}>
            {MOIS[mois]} {annee}
          </Text>
          <TouchableOpacity onPress={() => { setAnnee(today.getFullYear()); setMois(today.getMonth()); }}>
            <Text style={[styles.calAujourdhui, { color: VERT }]}>Aujourd'hui</Text>
          </TouchableOpacity>
        </View>
        <TouchableOpacity style={styles.calNavBtn} onPress={moisSuivant}>
          <Text style={[styles.calNavTxt, { color: VERT }]}>›</Text>
        </TouchableOpacity>
      </View>

      {/* NAVIGATION ANNÉE */}
      <View style={styles.anneeNav}>
        <TouchableOpacity onPress={() => setAnnee(annee - 1)} style={styles.anneeBtn}>
          <Text style={[styles.anneeTxt, { color: theme?.textSub || '#64748B' }]}>◀ {annee - 1}</Text>
        </TouchableOpacity>
        <Text style={[styles.anneeActuelle, { color: theme?.text || '#1E293B' }]}>{annee}</Text>
        <TouchableOpacity onPress={() => setAnnee(annee + 1)} style={styles.anneeBtn}>
          <Text style={[styles.anneeTxt, { color: theme?.textSub || '#64748B' }]}>{annee + 1} ▶</Text>
        </TouchableOpacity>
      </View>

      {/* JOURS SEMAINE */}
      <View style={styles.calJoursSemaine}>
        {JOURS_SEMAINE.map(j => (
          <Text key={j} style={[styles.calJourSemaineTxt, { color: theme?.textMuted || '#94A3B8' }]}>{j}</Text>
        ))}
      </View>

      {/* GRILLE */}
      <View style={styles.calGrille}>
        {cases.map((jour, i) => {
          const isToday    = jour === today.getDate() && mois === today.getMonth() && annee === today.getFullYear();
          const hasEv      = jour && joursAvecEv.includes(jour);
          const isWeekend  = jour ? new Date(annee, mois, jour).getDay() === 0 || new Date(annee, mois, jour).getDay() === 6 : false;
          return (
            <View key={i} style={[
              styles.calCase,
              isToday && { backgroundColor: VERT, borderRadius: 20 },
            ]}>
              {jour ? (
                <>
                  <Text style={[
                    styles.calJourTxt,
                    { color: isToday ? '#fff' : isWeekend ? ORANGE : (theme?.text || '#1E293B') },
                    hasEv && !isToday && { fontWeight: '900', color: '#EF4444' },
                  ]}>
                    {jour}
                  </Text>
                  {hasEv && !isToday && <View style={styles.calPoint} />}
                </>
              ) : null}
            </View>
          );
        })}
      </View>

      {/* LÉGENDE */}
      <View style={styles.calLegende}>
        <View style={styles.calLegendeItem}>
          <View style={[styles.calLegendeDot, { backgroundColor: VERT }]} />
          <Text style={[styles.calLegendeTxt, { color: theme?.textSub || '#64748B' }]}>Aujourd'hui</Text>
        </View>
        <View style={styles.calLegendeItem}>
          <View style={[styles.calLegendeDot, { backgroundColor: '#EF4444' }]} />
          <Text style={[styles.calLegendeTxt, { color: theme?.textSub || '#64748B' }]}>Événement</Text>
        </View>
        <View style={styles.calLegendeItem}>
          <Text style={[styles.calLegendeTxt, { color: ORANGE }]}>Sam/Dim</Text>
        </View>
      </View>
    </View>
  );
}

export default function EvenementsScreen() {
  const [evenements, setEvenements] = useState([]);
  const [loading, setLoading]       = useState(true);
  const [refresh, setRefresh]       = useState(false);
  const [filtre, setFiltre]         = useState('tous');
  const [vue, setVue]               = useState('liste'); // 'liste' ou 'calendrier'
  const insets  = useSafeAreaInsets();
  const themeCtx = useTheme();
  const theme   = themeCtx?.theme || {
    bg: '#F5F7F5', card: '#FFFFFF', cardBorder: '#E2E8F0',
    text: '#1E293B', textSub: '#64748B', textMuted: '#94A3B8',
  };

  useEffect(() => { loadEvenements(); }, []);

  const loadEvenements = async () => {
    try {
      const stored = await AsyncStorage.getItem('user');
      const user   = JSON.parse(stored);
      const res    = await API.get(`/evenements/etudiant/${user.Id_UTILISATEUR}`);
      setEvenements(res.data);
    } catch (err) {
      console.log('Erreur événements:', err);
    } finally {
      setLoading(false);
      setRefresh(false);
    }
  };

  const onRefresh = () => { setRefresh(true); loadEvenements(); };

  const getUrgence = (jours) => {
    if (jours <= 1)  return { couleur: '#EF4444', label: '🔴 Demain !' };
    if (jours <= 3)  return { couleur: '#F59E0B', label: '🟠 Très bientôt' };
    if (jours <= 7)  return { couleur: '#F59E0B', label: '🟡 Cette semaine' };
    if (jours <= 30) return { couleur: VERT,      label: '🟢 Ce mois-ci' };
    return                   { couleur: '#64748B', label: '⚪ Plus tard' };
  };

  const types   = ['tous', ...new Set(evenements.map(e => e.Type))];
  const filtres = filtre === 'tous' ? evenements : evenements.filter(e => e.Type === filtre);
  const prochain = evenements[0];

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
        refreshControl={<RefreshControl refreshing={refresh} onRefresh={onRefresh} colors={[VERT]} />}
        contentContainerStyle={{ paddingBottom: insets.bottom + 32 }}
      >
        {/* HERO */}
        <View style={styles.hero}>
          <View style={styles.deco1} />
          <View style={styles.deco2} />
          <Text style={styles.heroTitre}>⏳ Échéances</Text>
          <Text style={styles.heroSub}>{evenements.length} événement(s) à venir</Text>
          <View style={styles.statsRow}>
            {['examen', 'devoir', 'soutenance'].map(type => {
              const count = evenements.filter(e => e.Type === type).length;
              const cfg   = TYPE_CONFIG[type];
              return (
                <View key={type} style={styles.statCard}>
                  <Text style={styles.statIcon}>{cfg.icon}</Text>
                  <Text style={[styles.statVal, { color: cfg.couleur }]}>{count}</Text>
                  <Text style={styles.statLabel}>{cfg.label}</Text>
                </View>
              );
            })}
          </View>
        </View>

        {/* TOGGLE VUE */}
        <View style={[styles.toggleVue, { backgroundColor: theme.card }]}>
          <TouchableOpacity
            style={[styles.toggleBtn, vue === 'liste' && { backgroundColor: VERT }]}
            onPress={() => setVue('liste')}
          >
            <Text style={[styles.toggleTxt, vue === 'liste' && { color: '#fff' }]}>📋 Liste</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.toggleBtn, vue === 'calendrier' && { backgroundColor: VERT }]}
            onPress={() => setVue('calendrier')}
          >
            <Text style={[styles.toggleTxt, vue === 'calendrier' && { color: '#fff' }]}>📅 Calendrier</Text>
          </TouchableOpacity>
        </View>

        {/* VUE CALENDRIER */}
        {vue === 'calendrier' && (
          <View style={{ marginHorizontal: 16, marginTop: 14 }}>
            <Calendrier evenements={evenements} theme={theme} />

            {/* ÉVÉNEMENTS DU MOIS SÉLECTIONNÉ */}
            {evenements.length > 0 && (
              <View style={[styles.evMoisCard, { backgroundColor: theme.card }]}>
                <Text style={[styles.evMoisTitre, { color: theme.text }]}>📌 Tous les événements</Text>
                {evenements.map((ev, i) => {
                  const cfg = TYPE_CONFIG[ev.Type] || TYPE_CONFIG.evenement;
                  return (
                    <View key={i} style={[styles.evMoisRow, { borderBottomColor: theme.cardBorder }]}>
                      <Text style={styles.evMoisIcon}>{cfg.icon}</Text>
                      <View style={{ flex: 1 }}>
                        <Text style={[styles.evMoisNom, { color: theme.text }]}>{ev.Titre}</Text>
                        <Text style={[styles.evMoisDate, { color: theme.textSub }]}>
                          {new Date(ev.Date_Evenement).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}
                        </Text>
                      </View>
                      <Text style={[styles.evMoisJours, { color: cfg.couleur }]}>
                        J-{ev.jours_restants}
                      </Text>
                    </View>
                  );
                })}
              </View>
            )}
          </View>
        )}

        {/* VUE LISTE */}
        {vue === 'liste' && (
          <>
            {/* COMPTE À REBOURS PROCHAIN */}
            {prochain && (
              <View style={[styles.prochainCard, { backgroundColor: TYPE_CONFIG[prochain.Type]?.couleur || VERT }]}>
                <Text style={styles.prochainLabel}>⚡ Prochain événement</Text>
                <Text style={styles.prochainTitre}>{prochain.Titre}</Text>
                <Text style={styles.prochainDate}>
                  📅 {new Date(prochain.Date_Evenement).toLocaleDateString('fr-FR', {
                    weekday: 'long', day: 'numeric', month: 'long', year: 'numeric'
                  })}
                </Text>
                <View style={styles.rebroursBox}>
                  <Text style={styles.reboursTitre}>⏱ Compte à rebours</Text>
                  <CompteARebours date={prochain.Date_Evenement} />
                </View>
              </View>
            )}

            {/* FILTRES */}
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filtresScroll} contentContainerStyle={styles.filtresContent}>
              {types.map(type => {
                const cfg     = TYPE_CONFIG[type];
                const isActif = filtre === type;
                return (
                  <TouchableOpacity
                    key={type}
                    style={[styles.filtre, { backgroundColor: theme.card, borderColor: theme.cardBorder },
                      isActif && { backgroundColor: cfg?.couleur || VERT, borderColor: cfg?.couleur || VERT }
                    ]}
                    onPress={() => setFiltre(type)}
                  >
                    <Text style={styles.filtreIcon}>{cfg?.icon || '📅'}</Text>
                    <Text style={[styles.filtreTxt, { color: theme.textSub }, isActif && { color: '#fff' }]}>
                      {type === 'tous' ? 'Tous' : cfg?.label || type}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>

            {/* LISTE ÉVÉNEMENTS */}
            <View style={styles.liste}>
              {filtres.length === 0 ? (
                <View style={[styles.emptyBox, { backgroundColor: theme.card }]}>
                  <Text style={styles.emptyIcon}>🎉</Text>
                  <Text style={[styles.emptyTitre, { color: theme.text }]}>Aucun événement</Text>
                  <Text style={[styles.emptyTxt, { color: theme.textSub }]}>Pas d'échéance pour l'instant !</Text>
                </View>
              ) : (
                filtres.map((ev, i) => {
                  const cfg     = TYPE_CONFIG[ev.Type] || TYPE_CONFIG.evenement;
                  const urgence = getUrgence(ev.jours_restants);
                  return (
                    <View key={i} style={[styles.card, { backgroundColor: theme.card, borderLeftColor: cfg.couleur }]}>
                      <View style={styles.cardHead}>
                        <View style={[styles.typeBox, { backgroundColor: cfg.bg }]}>
                          <Text style={styles.typeIcon}>{cfg.icon}</Text>
                          <Text style={[styles.typeTxt, { color: cfg.couleur }]}>{cfg.label}</Text>
                        </View>
                        <View style={[styles.urgenceBadge, { backgroundColor: urgence.couleur + '20' }]}>
                          <Text style={[styles.urgenceTxt, { color: urgence.couleur }]}>{urgence.label}</Text>
                        </View>
                      </View>
                      <Text style={[styles.cardTitre, { color: theme.text }]}>{ev.Titre}</Text>
                      {ev.Description && (
                        <Text style={[styles.cardDesc, { color: theme.textSub }]}>{ev.Description}</Text>
                      )}
                      <Text style={[styles.cardDate, { color: theme.textSub }]}>
                        📅 {new Date(ev.Date_Evenement).toLocaleDateString('fr-FR', {
                          weekday: 'long', day: 'numeric', month: 'long',
                          hour: '2-digit', minute: '2-digit'
                        })}
                      </Text>
                      <View style={[styles.rebours, { backgroundColor: cfg.bg, borderColor: cfg.couleur + '40' }]}>
                        <Text style={[styles.reboursLabel, { color: cfg.couleur }]}>⏱ Dans</Text>
                        <CompteARebours date={ev.Date_Evenement} />
                      </View>
                    </View>
                  );
                })
              )}
            </View>
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
    backgroundColor: VERT, paddingTop: 24, paddingBottom: 32,
    paddingHorizontal: 20, alignItems: 'center',
    borderBottomLeftRadius: 32, borderBottomRightRadius: 32, overflow: 'hidden',
  },
  deco1: { position: 'absolute', width: 200, height: 200, borderRadius: 100, backgroundColor: 'rgba(255,255,255,0.07)', top: -60, right: -40 },
  deco2: { position: 'absolute', width: 140, height: 140, borderRadius: 70, backgroundColor: 'rgba(255,255,255,0.05)', bottom: -30, left: -30 },
  heroTitre: { color: '#fff', fontSize: 26, fontWeight: '900' },
  heroSub:   { color: 'rgba(255,255,255,0.75)', fontSize: 14, marginTop: 4, marginBottom: 20 },
  statsRow:  { flexDirection: 'row', backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: 16, padding: 14, borderWidth: 1, borderColor: 'rgba(255,255,255,0.15)', gap: 20 },
  statCard:  { alignItems: 'center' },
  statIcon:  { fontSize: 22 },
  statVal:   { fontSize: 20, fontWeight: '900', marginTop: 2 },
  statLabel: { fontSize: 11, color: 'rgba(255,255,255,0.6)', marginTop: 2 },

  // TOGGLE VUE
  toggleVue: { flexDirection: 'row', marginHorizontal: 16, marginTop: 16, borderRadius: 16, padding: 4, elevation: 2, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06 },
  toggleBtn: { flex: 1, paddingVertical: 10, alignItems: 'center', borderRadius: 12 },
  toggleTxt: { fontSize: 14, fontWeight: '700', color: '#64748B' },

  // CALENDRIER
  calCard: { borderRadius: 20, padding: 16, elevation: 3, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.07 },
  calNav:  { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  calNavBtn: { width: 36, height: 36, justifyContent: 'center', alignItems: 'center' },
  calNavTxt: { fontSize: 28, fontWeight: '300' },
  calMois:   { fontSize: 17, fontWeight: '900', textAlign: 'center' },
  calAujourdhui: { fontSize: 11, fontWeight: '600', textAlign: 'center', marginTop: 2 },
  anneeNav:  { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12, paddingHorizontal: 4 },
  anneeBtn:  { padding: 6 },
  anneeTxt:  { fontSize: 12, fontWeight: '600' },
  anneeActuelle: { fontSize: 15, fontWeight: '900' },
  calJoursSemaine: { flexDirection: 'row', marginBottom: 6 },
  calJourSemaineTxt: { flex: 1, textAlign: 'center', fontSize: 11, fontWeight: '700' },
  calGrille: { flexDirection: 'row', flexWrap: 'wrap' },
  calCase:   { width: '14.28%', aspectRatio: 1, justifyContent: 'center', alignItems: 'center' },
  calJourTxt: { fontSize: 13, fontWeight: '600' },
  calPoint:  { width: 5, height: 5, borderRadius: 3, backgroundColor: '#EF4444', marginTop: 1 },
  calLegende: { flexDirection: 'row', justifyContent: 'center', gap: 16, marginTop: 10, paddingTop: 10, borderTopWidth: 1, borderTopColor: '#F1F5F9' },
  calLegendeItem: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  calLegendeDot:  { width: 8, height: 8, borderRadius: 4 },
  calLegendeTxt:  { fontSize: 11, fontWeight: '600' },

  // ÉVÉNEMENTS DU MOIS
  evMoisCard:  { borderRadius: 20, padding: 16, marginTop: 14, elevation: 2 },
  evMoisTitre: { fontSize: 15, fontWeight: '800', marginBottom: 12 },
  evMoisRow:   { flexDirection: 'row', alignItems: 'center', paddingVertical: 10, borderBottomWidth: 1, gap: 10 },
  evMoisIcon:  { fontSize: 20 },
  evMoisNom:   { fontSize: 13, fontWeight: '700' },
  evMoisDate:  { fontSize: 11, marginTop: 2 },
  evMoisJours: { fontSize: 14, fontWeight: '900' },

  prochainCard: { marginHorizontal: 16, marginTop: 16, borderRadius: 20, padding: 20, overflow: 'hidden', elevation: 6 },
  prochainLabel: { color: 'rgba(255,255,255,0.8)', fontSize: 12, fontWeight: '700', marginBottom: 6 },
  prochainTitre: { color: '#fff', fontSize: 20, fontWeight: '900', marginBottom: 6 },
  prochainDate:  { color: 'rgba(255,255,255,0.8)', fontSize: 13, marginBottom: 14, textTransform: 'capitalize' },
  rebroursBox:   { backgroundColor: 'rgba(255,255,255,0.2)', borderRadius: 14, padding: 14, alignItems: 'center' },
  reboursTitre:  { color: 'rgba(255,255,255,0.8)', fontSize: 12, fontWeight: '700', marginBottom: 4 },
  reboursTxt:    { color: '#fff', fontSize: 28, fontWeight: '900', letterSpacing: 2 },

  filtresScroll:  { marginTop: 14 },
  filtresContent: { paddingHorizontal: 16, gap: 8 },
  filtre: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20, borderWidth: 1.5, gap: 6 },
  filtreIcon: { fontSize: 14 },
  filtreTxt:  { fontSize: 13, fontWeight: '600' },

  liste: { padding: 16, paddingTop: 12, gap: 12 },
  emptyBox:   { borderRadius: 20, padding: 32, alignItems: 'center', elevation: 2 },
  emptyIcon:  { fontSize: 48, marginBottom: 12 },
  emptyTitre: { fontSize: 18, fontWeight: '900', marginBottom: 4 },
  emptyTxt:   { fontSize: 14 },

  card: { borderRadius: 18, padding: 16, elevation: 3, borderLeftWidth: 4, shadowColor: '#000', shadowOffset: { width: 0, height: 3 }, shadowOpacity: 0.07 },
  cardHead:  { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
  typeBox:   { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 10, paddingVertical: 5, borderRadius: 10, gap: 5 },
  typeIcon:  { fontSize: 14 },
  typeTxt:   { fontSize: 12, fontWeight: '700' },
  urgenceBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 10 },
  urgenceTxt:   { fontSize: 11, fontWeight: '700' },
  cardTitre: { fontSize: 16, fontWeight: '900', marginBottom: 6 },
  cardDesc:  { fontSize: 13, lineHeight: 18, marginBottom: 8 },
  cardDate:  { fontSize: 12, marginBottom: 10, textTransform: 'capitalize' },
  rebours:   { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', borderRadius: 12, padding: 10, borderWidth: 1 },
  reboursLabel: { fontSize: 12, fontWeight: '700' },
});