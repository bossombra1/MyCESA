import React, { useEffect, useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, ActivityIndicator,
  StatusBar, RefreshControl, Image, TouchableOpacity
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import API, { SERVER_URL } from '../api/api';
import { useTheme } from '../context/ThemeContext';

const VERT   = '#2E7D32';
const ORANGE = '#D84315';

const PODIUM_COLORS = ['#F59E0B', '#94A3B8', '#D84315'];
const PODIUM_ICONS  = ['🥇', '🥈', '🥉'];

export default function LeaderboardScreen() {
  const [classement, setClassement] = useState([]);
  const [monRang, setMonRang]       = useState(null);
  const [monUser, setMonUser]       = useState(null);
  const [loading, setLoading]       = useState(true);
  const [refresh, setRefresh]       = useState(false);
  const insets  = useSafeAreaInsets();
  const { theme, isDark } = useTheme();

  useEffect(() => { loadClassement(); }, []);

  const loadClassement = async () => {
    try {
      const stored = await AsyncStorage.getItem('user');
      const user   = JSON.parse(stored);
      setMonUser(user);

      const [classRes, rangRes] = await Promise.allSettled([
        API.get('/recompenses/classement/top'),
        API.get(`/recompenses/classement/rang/${user.Id_UTILISATEUR}`),
      ]);

      if (classRes.status === 'fulfilled') setClassement(classRes.value.data);
      if (rangRes.status  === 'fulfilled') setMonRang(rangRes.value.data);
    } catch (err) {
      console.log('Erreur classement:', err);
    } finally {
      setLoading(false);
      setRefresh(false);
    }
  };

  const onRefresh = () => { setRefresh(true); loadClassement(); };

  if (loading) return (
    <View style={[styles.center, { backgroundColor: theme.bg }]}>
      <ActivityIndicator size="large" color={VERT} />
    </View>
  );

  const top3    = classement.slice(0, 3);
  const reste   = classement.slice(3);
  const monEntry = classement.find(e => e.Id_UTILISATEUR === monUser?.Id_UTILISATEUR);

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
          <Text style={styles.heroTitre}>🏅 Classement</Text>
          <Text style={styles.heroSub}>Top {classement.length} étudiants</Text>

          {/* MON RANG */}
          {monRang && (
            <View style={styles.monRangBox}>
              <Text style={styles.monRangTxt}>
                🎯 Mon rang : <Text style={styles.monRangVal}>#{monRang.rang}</Text> sur {monRang.total} étudiants
              </Text>
            </View>
          )}
        </View>

        {/* PODIUM TOP 3 */}
        {top3.length >= 3 && (
          <View style={[styles.podiumCard, { backgroundColor: theme.card }]}>
            <Text style={[styles.podiumTitre, { color: theme.text }]}>🏆 Podium</Text>
            <View style={styles.podiumRow}>
              {/* 2ème */}
              <View style={styles.podiumItem}>
                <Text style={styles.podiumIcon}>{PODIUM_ICONS[1]}</Text>
                {top3[1]?.Image_Etudiant ? (
                  <Image source={{ uri: `${SERVER_URL}${top3[1].Image_Etudiant}` }} style={[styles.podiumAvatar, { borderColor: PODIUM_COLORS[1] }]} />
                ) : (
                  <View style={[styles.podiumAvatarDefault, { backgroundColor: PODIUM_COLORS[1] + '30', borderColor: PODIUM_COLORS[1] }]}>
                    <Text style={styles.podiumAvatarTxt}>{top3[1]?.Nom_User?.charAt(0)}</Text>
                  </View>
                )}
                <Text style={[styles.podiumNom, { color: theme.text }]} numberOfLines={1}>{top3[1]?.Nom_User}</Text>
                <Text style={[styles.podiumPts, { color: PODIUM_COLORS[1] }]}>{top3[1]?.Total_Points} pts</Text>
                <View style={[styles.podiumBarre, { height: 60, backgroundColor: PODIUM_COLORS[1] }]} />
              </View>

              {/* 1er */}
              <View style={[styles.podiumItem, { marginBottom: 20 }]}>
                <Text style={styles.podiumIcon}>{PODIUM_ICONS[0]}</Text>
                {top3[0]?.Image_Etudiant ? (
                  <Image source={{ uri: `${SERVER_URL}${top3[0].Image_Etudiant}` }} style={[styles.podiumAvatar, { borderColor: PODIUM_COLORS[0], width: 70, height: 70, borderRadius: 35 }]} />
                ) : (
                  <View style={[styles.podiumAvatarDefault, { backgroundColor: PODIUM_COLORS[0] + '30', borderColor: PODIUM_COLORS[0], width: 70, height: 70, borderRadius: 35 }]}>
                    <Text style={[styles.podiumAvatarTxt, { fontSize: 28 }]}>{top3[0]?.Nom_User?.charAt(0)}</Text>
                  </View>
                )}
                <Text style={[styles.podiumNom, { color: theme.text, fontWeight: '900' }]} numberOfLines={1}>{top3[0]?.Nom_User}</Text>
                <Text style={[styles.podiumPts, { color: PODIUM_COLORS[0], fontSize: 16 }]}>{top3[0]?.Total_Points} pts</Text>
                <View style={[styles.podiumBarre, { height: 80, backgroundColor: PODIUM_COLORS[0] }]} />
              </View>

              {/* 3ème */}
              <View style={styles.podiumItem}>
                <Text style={styles.podiumIcon}>{PODIUM_ICONS[2]}</Text>
                {top3[2]?.Image_Etudiant ? (
                  <Image source={{ uri: `${SERVER_URL}${top3[2].Image_Etudiant}` }} style={[styles.podiumAvatar, { borderColor: PODIUM_COLORS[2] }]} />
                ) : (
                  <View style={[styles.podiumAvatarDefault, { backgroundColor: PODIUM_COLORS[2] + '30', borderColor: PODIUM_COLORS[2] }]}>
                    <Text style={styles.podiumAvatarTxt}>{top3[2]?.Nom_User?.charAt(0)}</Text>
                  </View>
                )}
                <Text style={[styles.podiumNom, { color: theme.text }]} numberOfLines={1}>{top3[2]?.Nom_User}</Text>
                <Text style={[styles.podiumPts, { color: PODIUM_COLORS[2] }]}>{top3[2]?.Total_Points} pts</Text>
                <View style={[styles.podiumBarre, { height: 40, backgroundColor: PODIUM_COLORS[2] }]} />
              </View>
            </View>
          </View>
        )}

        {/* LISTE COMPLÈTE */}
        <View style={[styles.listeCard, { backgroundColor: theme.card }]}>
          <Text style={[styles.listeTitre, { color: theme.text }]}>📋 Classement complet</Text>

          {classement.length === 0 ? (
            <View style={styles.emptyBox}>
              <Text style={styles.emptyIcon}>🏅</Text>
              <Text style={[styles.emptyTxt, { color: theme.textSub }]}>Aucun étudiant classé pour l'instant</Text>
            </View>
          ) : (
            classement.map((etudiant, i) => {
              const estMoi = etudiant.Id_UTILISATEUR === monUser?.Id_UTILISATEUR;
              return (
                <View key={i} style={[
                  styles.listeRow,
                  { borderBottomColor: theme.cardBorder },
                  estMoi && { backgroundColor: VERT + '15', borderRadius: 12 }
                ]}>
                  {/* RANG */}
                  <View style={[styles.rangBox, {
                    backgroundColor: i < 3 ? PODIUM_COLORS[i] + '20' : theme.bg,
                    borderColor: i < 3 ? PODIUM_COLORS[i] : theme.cardBorder,
                  }]}>
                    <Text style={[styles.rangTxt, { color: i < 3 ? PODIUM_COLORS[i] : theme.textSub }]}>
                      {i < 3 ? PODIUM_ICONS[i] : `#${i + 1}`}
                    </Text>
                  </View>

                  {/* AVATAR */}
                  {etudiant.Image_Etudiant ? (
                    <Image source={{ uri: `${SERVER_URL}${etudiant.Image_Etudiant}` }} style={styles.listeAvatar} />
                  ) : (
                    <View style={[styles.listeAvatarDefault, { backgroundColor: etudiant.couleur + '30' }]}>
                      <Text style={[styles.listeAvatarTxt, { color: etudiant.couleur }]}>
                        {etudiant.Nom_User?.charAt(0)}
                      </Text>
                    </View>
                  )}

                  {/* INFOS */}
                  <View style={{ flex: 1 }}>
                    <View style={styles.infoRow}>
                      <Text style={[styles.listeNom, { color: theme.text }]} numberOfLines={1}>
                        {etudiant.Nom_User}
                        {estMoi && <Text style={{ color: VERT }}> (moi)</Text>}
                      </Text>
                      <Text style={[styles.listeTitreBadge, { color: etudiant.couleur || VERT }]}>
                        {etudiant.titre}
                      </Text>
                    </View>
                    <View style={styles.infoRow}>
                      <Text style={[styles.listeClasse, { color: theme.textSub }]}>
                        {etudiant.Nom_Classe || 'N/A'} • {etudiant.Nom_Filiere || 'N/A'}
                      </Text>
                      <Text style={[styles.listeStreak, { color: ORANGE }]}>
                        🔥 {etudiant.Streak_Connexion}j
                      </Text>
                    </View>
                  </View>

                  {/* POINTS */}
                  <Text style={[styles.listePts, { color: etudiant.couleur || VERT }]}>
                    {etudiant.Total_Points}
                    <Text style={[styles.listePtsSub, { color: theme.textMuted }]}> pts</Text>
                  </Text>
                </View>
              );
            })
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
    backgroundColor: VERT, paddingTop: 24, paddingBottom: 32,
    paddingHorizontal: 20, alignItems: 'center',
    borderBottomLeftRadius: 32, borderBottomRightRadius: 32, overflow: 'hidden',
  },
  deco1: { position: 'absolute', width: 200, height: 200, borderRadius: 100, backgroundColor: 'rgba(255,255,255,0.07)', top: -60, right: -40 },
  deco2: { position: 'absolute', width: 140, height: 140, borderRadius: 70,  backgroundColor: 'rgba(255,255,255,0.05)', bottom: -30, left: -30 },
  heroTitre: { color: '#fff', fontSize: 26, fontWeight: '900' },
  heroSub:   { color: 'rgba(255,255,255,0.75)', fontSize: 14, marginTop: 4 },
  monRangBox: { backgroundColor: 'rgba(255,255,255,0.15)', paddingHorizontal: 18, paddingVertical: 8, borderRadius: 20, marginTop: 14, borderWidth: 1, borderColor: 'rgba(255,255,255,0.25)' },
  monRangTxt: { color: '#fff', fontSize: 14, fontWeight: '600' },
  monRangVal: { fontWeight: '900', fontSize: 16 },

  podiumCard:  { marginHorizontal: 16, marginTop: 16, borderRadius: 20, padding: 18, elevation: 4, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.08 },
  podiumTitre: { fontSize: 16, fontWeight: '900', marginBottom: 16, textAlign: 'center' },
  podiumRow:   { flexDirection: 'row', justifyContent: 'center', alignItems: 'flex-end', gap: 12 },
  podiumItem:  { flex: 1, alignItems: 'center', gap: 4 },
  podiumIcon:  { fontSize: 28 },
  podiumAvatar:        { width: 56, height: 56, borderRadius: 28, borderWidth: 3 },
  podiumAvatarDefault: { width: 56, height: 56, borderRadius: 28, borderWidth: 3, justifyContent: 'center', alignItems: 'center' },
  podiumAvatarTxt:     { fontSize: 22, fontWeight: '900', color: '#fff' },
  podiumNom:  { fontSize: 12, fontWeight: '700', textAlign: 'center' },
  podiumPts:  { fontSize: 13, fontWeight: '800' },
  podiumBarre: { width: '100%', borderTopLeftRadius: 6, borderTopRightRadius: 6, marginTop: 6 },

  listeCard:  { marginHorizontal: 16, marginTop: 14, borderRadius: 20, padding: 18, elevation: 3, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.07 },
  listeTitre: { fontSize: 15, fontWeight: '800', marginBottom: 12 },
  emptyBox:   { alignItems: 'center', paddingVertical: 32 },
  emptyIcon:  { fontSize: 48, marginBottom: 12 },
  emptyTxt:   { fontSize: 14 },
  listeRow:   { flexDirection: 'row', alignItems: 'center', paddingVertical: 12, borderBottomWidth: 1, gap: 10 },
  rangBox:    { width: 38, height: 38, borderRadius: 10, justifyContent: 'center', alignItems: 'center', borderWidth: 1.5 },
  rangTxt:    { fontSize: 13, fontWeight: '900' },
  listeAvatar:        { width: 42, height: 42, borderRadius: 21 },
  listeAvatarDefault: { width: 42, height: 42, borderRadius: 21, justifyContent: 'center', alignItems: 'center' },
  listeAvatarTxt:     { fontSize: 18, fontWeight: '900' },
  infoRow:     { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  listeNom:    { fontSize: 14, fontWeight: '700', flex: 1 },
  listeTitreBadge: { fontSize: 11, fontWeight: '700' },
  listeClasse: { fontSize: 11, flex: 1 },
  listeStreak: { fontSize: 11, fontWeight: '700' },
  listePts:    { fontSize: 18, fontWeight: '900', minWidth: 50, textAlign: 'right' },
  listePtsSub: { fontSize: 10 },
});