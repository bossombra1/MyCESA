import React, { useEffect, useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, ActivityIndicator,
  Alert, RefreshControl, StatusBar
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import API from '../api/api';

const VERT   = '#2E7D32';
const VERT2  = '#388E3C';
const ORANGE = '#D84315';

export default function PaiementsScreen() {
  const [data, setData] = useState({ paiements: [], totalPaye: 0 });
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const insets = useSafeAreaInsets();

  useEffect(() => { loadPaiements(); }, []);

  const loadPaiements = async () => {
    try {
      const stored = await AsyncStorage.getItem('user');
      const user = JSON.parse(stored);
      const response = await API.get(`/versements/etudiant/${user.Id_UTILISATEUR}`);
      setData(response.data);
    } catch (err) {
      Alert.alert('Erreur', 'Impossible de charger les paiements');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => { setRefreshing(true); loadPaiements(); };

  const paiements = data.paiements || [];
  const totalPaye = data.totalPaye || 0;
  const totalDu = data.totalDu || 0;
  const reste = totalDu - totalPaye;
  const progression = totalDu > 0 ? Math.min((totalPaye / totalDu) * 100, 100) : 100;

  const getStatutColor = (statut) => {
    const s = (statut || '').toLowerCase();
    if (s === 'payé' || s === 'paye') return { bg: '#D1FAE5', txt: '#065F46', border: VERT };
    if (s === 'partiel') return { bg: '#FEF3C7', txt: '#92400E', border: '#F59E0B' };
    return { bg: '#FEE2E2', txt: '#991B1B', border: ORANGE };
  };

  if (loading) return (
    <View style={styles.center}>
      <ActivityIndicator size="large" color={VERT} />
    </View>
  );

  return (
    <View style={styles.wrapper}>
      <StatusBar barStyle="light-content" backgroundColor={VERT} />
      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[VERT]} />}
        contentContainerStyle={{ paddingBottom: insets.bottom + 24 }}
      >

        {/* HERO VERT CESA */}
        <View style={styles.hero}>
          <View style={styles.decoCircle1} />
          <View style={styles.decoCircle2} />
          <Text style={styles.heroTitre}>💰 Mes Paiements</Text>
          <Text style={styles.heroSub}>{paiements.length} versement(s) enregistré(s)</Text>

          {/* STATS */}
          <View style={styles.statsRow}>
            <View style={styles.statCard}>
              <Text style={[styles.statVal, { color: '#4ADE80' }]}>
                {totalPaye.toLocaleString()}
              </Text>
              <Text style={styles.statLabel}>Payé (FCFA)</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statCard}>
              <Text style={[styles.statVal, { color: reste > 0 ? ORANGE : '#4ADE80' }]}>
                {reste > 0 ? reste.toLocaleString() : '0'}
              </Text>
              <Text style={styles.statLabel}>Reste (FCFA)</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statCard}>
              <Text style={[styles.statVal, { color: '#60A5FA' }]}>{paiements.length}</Text>
              <Text style={styles.statLabel}>Versements</Text>
            </View>
          </View>
        </View>

        {/* PROGRESSION PAIEMENT */}
        <View style={styles.progressCard}>
          <View style={styles.progressHeader}>
            <Text style={styles.progressTitre}>Progression des paiements</Text>
            <Text style={[styles.progressPct, { color: progression >= 100 ? VERT : ORANGE }]}>
              {progression.toFixed(0)}%
            </Text>
          </View>
          <View style={styles.progressBg}>
            <View style={[styles.progressFill, {
              width: `${progression}%`,
              backgroundColor: progression >= 100 ? VERT : progression >= 50 ? '#F59E0B' : ORANGE,
            }]} />
          </View>
          <View style={styles.progressFooter}>
            <Text style={styles.progressLbl}>
              {progression >= 100 ? '✅ Scolarité à jour !' : `⚠️ ${(100 - progression).toFixed(0)}% restant`}
            </Text>
            {totalDu > 0 && (
              <Text style={styles.progressTotal}>Sur {totalDu.toLocaleString()} FCFA</Text>
            )}
          </View>
        </View>

        {/* LISTE PAIEMENTS */}
        <View style={styles.listContainer}>
          {paiements.length === 0 ? (
            <View style={styles.emptyBox}>
              <Text style={styles.emptyIcon}>📭</Text>
              <Text style={styles.emptyTitre}>Aucun paiement</Text>
              <Text style={styles.emptyTxt}>Aucun versement enregistré</Text>
            </View>
          ) : (
            paiements.map((p, index) => {
              const colors = getStatutColor(p.Statut);
              return (
                <View key={index} style={[styles.card, { borderLeftColor: colors.border }]}>
                  <View style={styles.cardTop}>
                    <View style={styles.cardLeft}>
                      <Text style={styles.libelle}>{p.Lib_Versement || 'Paiement scolarité'}</Text>
                      <Text style={styles.cardDate}>
                        📅 {new Date(p.Date_Versement).toLocaleDateString('fr-FR', {
                          day: 'numeric', month: 'long', year: 'numeric'
                        })}
                      </Text>
                    </View>
                    <View style={styles.montantBox}>
                      <Text style={styles.montantVal}>
                        {parseFloat(p.Montant).toLocaleString()}
                      </Text>
                      <Text style={styles.montantDevise}>FCFA</Text>
                    </View>
                  </View>

                  <View style={styles.cardFooter}>
                    <View style={[styles.statutBadge, {
                      backgroundColor: colors.bg, borderColor: colors.border
                    }]}>
                      <Text style={[styles.statutTxt, { color: colors.txt }]}>
                        {(p.Statut || 'Payé') === 'Payé' || (p.Statut || '').toLowerCase() === 'paye'
                          ? '✓ Payé' : p.Statut || 'Payé'}
                      </Text>
                    </View>
                    {p.Montant_Total && (
                      <Text style={styles.montantTotalTxt}>
                        Sur {parseFloat(p.Montant_Total).toLocaleString()} FCFA
                      </Text>
                    )}
                  </View>
                </View>
              );
            })
          )}
        </View>

        {/* CONTACT SCOLARITÉ */}
        <View style={styles.contactBox}>
          <Text style={styles.contactTitre}>🏫 Service de Scolarité</Text>
          <Text style={styles.contactTxt}>Pour tout renseignement sur vos frais de scolarité :</Text>
          <Text style={styles.contactTxt}>📞 (+225) 27 21 56 31 74</Text>
          <Text style={styles.contactTxt}>📞 (+225) 07 07 67 84 97</Text>
          <Text style={styles.contactTxt}>📍 Koumassi Nord-Est, Terminus Bus 05</Text>
        </View>

      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: { flex: 1, backgroundColor: '#F5F7F5' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },

  // HERO
  hero: {
    backgroundColor: VERT, paddingTop: 20,
    paddingBottom: 32, paddingHorizontal: 20,
    borderBottomLeftRadius: 32, borderBottomRightRadius: 32,
    overflow: 'hidden',
  },
  decoCircle1: {
    position: 'absolute', width: 180, height: 180, borderRadius: 90,
    backgroundColor: 'rgba(255,255,255,0.08)', top: -50, right: -30,
  },
  decoCircle2: {
    position: 'absolute', width: 120, height: 120, borderRadius: 60,
    backgroundColor: 'rgba(255,255,255,0.05)', bottom: -20, left: -20,
  },
  heroTitre: { color: '#fff', fontSize: 24, fontWeight: '900', marginBottom: 4 },
  heroSub: { color: 'rgba(255,255,255,0.7)', fontSize: 14, marginBottom: 20 },

  // STATS
  statsRow: {
    flexDirection: 'row', backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 16, padding: 16,
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.15)',
  },
  statCard: { flex: 1, alignItems: 'center' },
  statVal: { fontSize: 16, fontWeight: '900' },
  statLabel: { fontSize: 10, color: 'rgba(255,255,255,0.6)', marginTop: 3, textAlign: 'center' },
  statDivider: { width: 1, backgroundColor: 'rgba(255,255,255,0.15)' },

  // PROGRESSION
  progressCard: {
    backgroundColor: '#fff', marginHorizontal: 16, marginTop: 16,
    borderRadius: 20, padding: 18, elevation: 4,
    shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.08,
  },
  progressHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
  progressTitre: { fontSize: 14, fontWeight: '700', color: '#1E293B' },
  progressPct: { fontSize: 22, fontWeight: '900' },
  progressBg: { height: 10, backgroundColor: '#F1F5F9', borderRadius: 10, overflow: 'hidden' },
  progressFill: { height: '100%', borderRadius: 10 },
  progressFooter: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 8 },
  progressLbl: { fontSize: 12, color: '#64748B', fontWeight: '600' },
  progressTotal: { fontSize: 12, color: '#94A3B8' },

  // LISTE
  listContainer: { padding: 16, paddingTop: 12, gap: 12 },
  emptyBox: { alignItems: 'center', marginTop: 60 },
  emptyIcon: { fontSize: 48 },
  emptyTitre: { fontSize: 20, fontWeight: '900', color: '#1E293B', marginTop: 12 },
  emptyTxt: { fontSize: 14, color: '#64748B', marginTop: 4 },

  // CARD
  card: {
    backgroundColor: '#fff', borderRadius: 18, padding: 16,
    elevation: 3, borderLeftWidth: 4,
    shadowColor: '#000', shadowOffset: { width: 0, height: 3 }, shadowOpacity: 0.07,
  },
  cardTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 },
  cardLeft: { flex: 1, marginRight: 12 },
  libelle: { fontSize: 15, fontWeight: '800', color: '#1E293B', marginBottom: 4 },
  cardDate: { fontSize: 12, color: '#94A3B8' },
  montantBox: { alignItems: 'flex-end' },
  montantVal: { fontSize: 20, fontWeight: '900', color: VERT },
  montantDevise: { fontSize: 11, color: '#64748B', fontWeight: '600' },
  cardFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingTop: 10, borderTopWidth: 1, borderTopColor: '#F1F5F9' },
  statutBadge: { paddingHorizontal: 12, paddingVertical: 5, borderRadius: 10, borderWidth: 1.5 },
  statutTxt: { fontSize: 12, fontWeight: '800' },
  montantTotalTxt: { fontSize: 12, color: '#94A3B8' },

  // CONTACT
  contactBox: {
    backgroundColor: '#fff', marginHorizontal: 16, marginTop: 4,
    borderRadius: 20, padding: 18, elevation: 2, marginBottom: 8,
    borderWidth: 1, borderColor: '#E8F5E9',
  },
  contactTitre: { fontSize: 14, fontWeight: '800', color: VERT, marginBottom: 10 },
  contactTxt: { fontSize: 13, color: '#64748B', marginBottom: 4, lineHeight: 20 },
});