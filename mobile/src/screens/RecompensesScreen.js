import React, { useEffect, useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView,
  ActivityIndicator, StatusBar, TouchableOpacity,
  RefreshControl, Animated
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import API from '../api/api';
import { useTheme } from '../context/ThemeContext';

const VERT   = '#2E7D32';
const ORANGE = '#D84315';

export default function RecompensesScreen() {
  const [data, setData]       = useState(null);
  const [loading, setLoading] = useState(true);
  const [refresh, setRefresh] = useState(false);
  const [anim]                = useState(new Animated.Value(0));
  const insets = useSafeAreaInsets();
  const { theme, isDark } = useTheme();

  useEffect(() => { loadRecompenses(); }, []);

  const loadRecompenses = async () => {
    try {
      const stored = await AsyncStorage.getItem('user');
      const user   = JSON.parse(stored);

      // Enregistrer connexion journalière
      try {
        await API.post(`/recompenses/connexion/${user.Id_UTILISATEUR}`);
      } catch (_) {}

      const res = await API.get(`/recompenses/${user.Id_UTILISATEUR}`);
      setData(res.data);

      // Animation progression
      Animated.timing(anim, {
        toValue: parseFloat(res.data.progression) / 100,
        duration: 1000,
        useNativeDriver: false,
      }).start();
    } catch (err) {
      console.log('Erreur récompenses:', err);
    } finally {
      setLoading(false);
      setRefresh(false);
    }
  };

  const onRefresh = () => { setRefresh(true); loadRecompenses(); };

  const BADGES = [
    { icon: '⭐', titre: 'Novice',    pts: 0,    couleur: '#64748B' },
    { icon: '🥉', titre: 'Débutant',  pts: 100,  couleur: '#2E7D32' },
    { icon: '🥈', titre: 'Confirmé',  pts: 500,  couleur: '#10B981' },
    { icon: '🥇', titre: 'Avancé',    pts: 1000, couleur: '#2563EB' },
    { icon: '💎', titre: 'Expert',    pts: 2000, couleur: '#8B5CF6' },
    { icon: '🏆', titre: 'Élite',     pts: 5000, couleur: '#F59E0B' },
  ];

  const TYPE_ICONS = {
    connexion: '📅',
    note:      '📝',
    bonus:     '🎁',
    presence:  '✅',
  };

  if (loading) return (
    <View style={[styles.center, { backgroundColor: theme.bg }]}>
      <ActivityIndicator size="large" color={VERT} />
    </View>
  );

  const barWidth = anim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0%', '100%'],
  });

  return (
    <View style={[styles.wrapper, { backgroundColor: theme.bg }]}>
      <StatusBar barStyle="light-content" backgroundColor={VERT} />
      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refresh} onRefresh={onRefresh} colors={[VERT]} />}
        contentContainerStyle={{ paddingBottom: insets.bottom + 32 }}
      >

        {/* HERO */}
        <View style={[styles.hero, { backgroundColor: data?.couleur || VERT }]}>
          <View style={styles.deco1} />
          <View style={styles.deco2} />
          <Text style={styles.heroIcon}>{data?.titre?.split(' ')[0] || '⭐'}</Text>
          <Text style={styles.heroTitre}>{data?.titre || 'Novice'}</Text>
          <Text style={styles.heroPoints}>{data?.Total_Points || 0} pts</Text>
          <View style={styles.streakBadge}>
            <Text style={styles.streakTxt}>🔥 Streak : {data?.Streak_Connexion || 0} jour(s)</Text>
          </View>
        </View>

        {/* PROGRESSION NIVEAU */}
        <View style={[styles.card, { backgroundColor: theme.card }]}>
          <View style={styles.cardHead}>
            <Text style={[styles.cardTitre, { color: theme.text }]}>Progression vers le niveau suivant</Text>
            <Text style={[styles.cardPct, { color: data?.couleur || VERT }]}>{data?.progression}%</Text>
          </View>
          <View style={[styles.barreBg, { backgroundColor: theme.cardBorder }]}>
            <Animated.View style={[styles.barreFill, { width: barWidth, backgroundColor: data?.couleur || VERT }]} />
          </View>
          <Text style={[styles.cardSub, { color: theme.textSub }]}>
            {data?.Total_Points} / {data?.prochainSeuil} points pour le prochain niveau
          </Text>
        </View>

        {/* BADGES NIVEAUX */}
        <View style={[styles.card, { backgroundColor: theme.card }]}>
          <Text style={[styles.cardTitre, { color: theme.text }]}>🎖️ Niveaux</Text>
          <View style={styles.badgesGrid}>
            {BADGES.map((b, i) => {
              const atteint = (data?.Total_Points || 0) >= b.pts;
              return (
                <View key={i} style={[
                  styles.badgeItem,
                  { backgroundColor: atteint ? b.couleur + '20' : theme.bg, borderColor: atteint ? b.couleur : theme.cardBorder }
                ]}>
                  <Text style={[styles.badgeIcon, { opacity: atteint ? 1 : 0.3 }]}>{b.icon}</Text>
                  <Text style={[styles.badgeTitre, { color: atteint ? b.couleur : theme.textMuted }]}>{b.titre}</Text>
                  <Text style={[styles.badgePts, { color: theme.textMuted }]}>{b.pts} pts</Text>
                </View>
              );
            })}
          </View>
        </View>

        {/* COMMENT GAGNER DES POINTS */}
        <View style={[styles.card, { backgroundColor: theme.card }]}>
          <Text style={[styles.cardTitre, { color: theme.text }]}>💡 Comment gagner des points ?</Text>
          {[
            { icon: '📅', action: 'Connexion journalière',        pts: '+10 pts' },
            { icon: '🔥', action: 'Streak 7 jours',               pts: '+30 pts' },
            { icon: '🔥', action: 'Streak 14 jours',              pts: '+50 pts' },
            { icon: '🔥', action: 'Streak 30 jours',              pts: '+100 pts' },
            { icon: '📝', action: 'Note réussie (≥10)',           pts: '+10 pts' },
            { icon: '📝', action: 'Très bonne note (≥14)',        pts: '+30 pts' },
            { icon: '📝', action: 'Note excellente (≥16)',        pts: '+50 pts' },
            { icon: '✅', action: 'Aucune absence non justifiée', pts: '+100 pts' },
          ].map((item, i) => (
            <View key={i} style={[styles.ruleRow, { borderBottomColor: theme.cardBorder }]}>
              <Text style={styles.ruleIcon}>{item.icon}</Text>
              <Text style={[styles.ruleAction, { color: theme.text }]}>{item.action}</Text>
              <Text style={[styles.rulePts, { color: VERT }]}>{item.pts}</Text>
            </View>
          ))}
        </View>

        {/* HISTORIQUE */}
        {data?.historique?.length > 0 && (
          <View style={[styles.card, { backgroundColor: theme.card }]}>
            <Text style={[styles.cardTitre, { color: theme.text }]}>📜 Historique récent</Text>
            {data.historique.map((h, i) => (
              <View key={i} style={[styles.histRow, { borderBottomColor: theme.cardBorder }]}>
                <Text style={styles.histIcon}>{TYPE_ICONS[h.Type] || '🎁'}</Text>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.histRaison, { color: theme.text }]}>{h.Raison}</Text>
                  <Text style={[styles.histDate, { color: theme.textMuted }]}>
                    {new Date(h.CreatedAt).toLocaleDateString('fr-FR')}
                  </Text>
                </View>
                <Text style={[styles.histPts, { color: VERT }]}>+{h.Points}</Text>
              </View>
            ))}
          </View>
        )}

      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: { flex: 1 },
  center:  { flex: 1, justifyContent: 'center', alignItems: 'center' },

  hero: {
    paddingTop: 40, paddingBottom: 36,
    alignItems: 'center', overflow: 'hidden',
    borderBottomLeftRadius: 32, borderBottomRightRadius: 32,
  },
  deco1: { position: 'absolute', width: 200, height: 200, borderRadius: 100, backgroundColor: 'rgba(255,255,255,0.08)', top: -60, right: -40 },
  deco2: { position: 'absolute', width: 140, height: 140, borderRadius: 70,  backgroundColor: 'rgba(255,255,255,0.05)', bottom: -30, left: -30 },
  heroIcon:   { fontSize: 64, marginBottom: 8 },
  heroTitre:  { color: '#fff', fontSize: 26, fontWeight: '900' },
  heroPoints: { color: 'rgba(255,255,255,0.85)', fontSize: 18, fontWeight: '700', marginTop: 4 },
  streakBadge: { backgroundColor: 'rgba(255,255,255,0.2)', paddingHorizontal: 16, paddingVertical: 7, borderRadius: 20, marginTop: 12, borderWidth: 1, borderColor: 'rgba(255,255,255,0.3)' },
  streakTxt:  { color: '#fff', fontSize: 14, fontWeight: '700' },

  card: {
    marginHorizontal: 16, marginTop: 14, borderRadius: 20, padding: 18,
    elevation: 3, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.07,
  },
  cardHead:  { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
  cardTitre: { fontSize: 15, fontWeight: '800', marginBottom: 12 },
  cardPct:   { fontSize: 20, fontWeight: '900' },
  cardSub:   { fontSize: 12, marginTop: 6 },
  barreBg:   { height: 10, borderRadius: 10, overflow: 'hidden' },
  barreFill: { height: '100%', borderRadius: 10 },

  badgesGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginTop: 4 },
  badgeItem:  { width: '30%', alignItems: 'center', padding: 12, borderRadius: 14, borderWidth: 2 },
  badgeIcon:  { fontSize: 28, marginBottom: 4 },
  badgeTitre: { fontSize: 12, fontWeight: '800', textAlign: 'center' },
  badgePts:   { fontSize: 10, marginTop: 2 },

  ruleRow:    { flexDirection: 'row', alignItems: 'center', paddingVertical: 10, borderBottomWidth: 1, gap: 10 },
  ruleIcon:   { fontSize: 20, width: 28 },
  ruleAction: { flex: 1, fontSize: 13, fontWeight: '600' },
  rulePts:    { fontSize: 13, fontWeight: '800' },

  histRow:    { flexDirection: 'row', alignItems: 'center', paddingVertical: 10, borderBottomWidth: 1, gap: 10 },
  histIcon:   { fontSize: 20 },
  histRaison: { fontSize: 13, fontWeight: '600' },
  histDate:   { fontSize: 11, marginTop: 2 },
  histPts:    { fontSize: 16, fontWeight: '900' },
});