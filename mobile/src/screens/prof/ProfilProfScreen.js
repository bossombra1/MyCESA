import React, { useEffect, useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  StatusBar, Alert, Platform
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../../context/ThemeContext';

const VERT   = '#2E7D32';
const ORANGE = '#D84315';

export default function ProfilProfScreen({ navigation }) {
  const [prof, setProf] = useState(null);
  const insets   = useSafeAreaInsets();
  const themeCtx = useTheme();
  const theme    = themeCtx?.theme || {
    bg: '#F5F7F5', card: '#FFFFFF', cardBorder: '#E2E8F0',
    text: '#1E293B', textSub: '#64748B', textMuted: '#94A3B8',
  };

  useEffect(() => {
    AsyncStorage.getItem('user').then(s => setProf(JSON.parse(s)));
  }, []);

  const deconnexion = () => {
    Alert.alert('Déconnexion', 'Voulez-vous vous déconnecter ?', [
      { text: 'Annuler', style: 'cancel' },
      { text: 'Oui', style: 'destructive', onPress: async () => {
        await AsyncStorage.removeItem('token');
        await AsyncStorage.removeItem('user');
        navigation.replace('Login');
      }},
    ]);
  };

  return (
    <View style={[styles.wrapper, { backgroundColor: theme.bg }]}>
      <StatusBar barStyle="light-content" backgroundColor={VERT} />
      <ScrollView contentContainerStyle={{ paddingBottom: insets.bottom + 24 }}>

        {/* HERO */}
        <View style={styles.hero}>
          <View style={styles.deco1} />
          <View style={styles.deco2} />
          <View style={styles.avatarBox}>
            <Text style={styles.avatarTxt}>
              {prof?.Nom_User?.charAt(0)?.toUpperCase() || 'P'}
            </Text>
          </View>
          <Text style={styles.heroNom}>{prof?.Nom_User}</Text>
          <Text style={styles.heroEmail}>{prof?.Email_User}</Text>
          <View style={styles.roleBadge}>
            <Text style={styles.roleTxt}>👨‍🏫 Professeur · GROUPE COFE-CESA</Text>
          </View>
        </View>

        {/* OPTIONS */}
        <View style={{ padding: 16, gap: 10 }}>

          {/* Mode sombre */}
          <TouchableOpacity
            style={[styles.optionCard, { backgroundColor: theme.card, borderColor: theme.cardBorder }]}
            onPress={() => themeCtx?.toggleTheme?.()}
          >
            <Text style={styles.optionIcon}>{themeCtx?.isDark ? '☀️' : '🌙'}</Text>
            <Text style={[styles.optionLabel, { color: theme.text }]}>
              {themeCtx?.isDark ? 'Mode clair' : 'Mode sombre'}
            </Text>
            <Text style={[styles.optionArrow, { color: VERT }]}>›</Text>
          </TouchableOpacity>

          {/* Messagerie */}
          <TouchableOpacity
            style={[styles.optionCard, { backgroundColor: theme.card, borderColor: theme.cardBorder }]}
            onPress={() => navigation.navigate('Messagerie')}
          >
            <Text style={styles.optionIcon}>💬</Text>
            <Text style={[styles.optionLabel, { color: theme.text }]}>Messagerie</Text>
            <Text style={[styles.optionArrow, { color: VERT }]}>›</Text>
          </TouchableOpacity>

          {/* À propos */}
          <TouchableOpacity
            style={[styles.optionCard, { backgroundColor: theme.card, borderColor: theme.cardBorder }]}
            onPress={() => navigation.navigate('APropos')}
          >
            <Text style={styles.optionIcon}>ℹ️</Text>
            <Text style={[styles.optionLabel, { color: theme.text }]}>À propos de CESA</Text>
            <Text style={[styles.optionArrow, { color: VERT }]}>›</Text>
          </TouchableOpacity>

          {/* Déconnexion */}
          <TouchableOpacity
            style={[styles.optionCard, { backgroundColor: '#FEE2E2', borderColor: '#EF4444' }]}
            onPress={deconnexion}
          >
            <Text style={styles.optionIcon}>🚪</Text>
            <Text style={[styles.optionLabel, { color: '#EF4444' }]}>Déconnexion</Text>
            <Text style={[styles.optionArrow, { color: '#EF4444' }]}>›</Text>
          </TouchableOpacity>
        </View>

        {/* SECTION À PROPOS */}
        <View style={[styles.aProposCard, { backgroundColor: theme.card, borderColor: theme.cardBorder }]}>
          <Text style={[styles.aProposTitre, { color: VERT }]}>🏫 GROUPE COFE-CESA</Text>
          <Text style={[styles.aProposSlogan, { color: theme.textSub }]}>
            « Une excellence à votre service ! »
          </Text>
          <View style={styles.aProposSep} />
          <View style={styles.aProposRow}>
            <Text style={styles.aProposIcon}>📍</Text>
            <Text style={[styles.aProposTxt, { color: theme.textSub }]}>
              Koumassi Nord-Est, Terminus Bus 05, Abidjan
            </Text>
          </View>
          <View style={styles.aProposRow}>
            <Text style={styles.aProposIcon}>📞</Text>
            <Text style={[styles.aProposTxt, { color: theme.textSub }]}>
              (+225) 27 21 56 31 74
            </Text>
          </View>
          <View style={styles.aProposRow}>
            <Text style={styles.aProposIcon}>📞</Text>
            <Text style={[styles.aProposTxt, { color: theme.textSub }]}>
              (+225) 07 07 67 84 97
            </Text>
          </View>
          <View style={styles.aProposRow}>
            <Text style={styles.aProposIcon}>🌐</Text>
            <Text style={[styles.aProposTxt, { color: VERT }]}>
              cesa-elearning.com
            </Text>
          </View>
          <View style={styles.aProposRow}>
            <Text style={styles.aProposIcon}>🏛️</Text>
            <Text style={[styles.aProposTxt, { color: theme.textSub }]}>
              Fondé en 1992
            </Text>
          </View>
        </View>

        {/* FOOTER */}
        <View style={styles.footer}>
          <Text style={[styles.footerTxt, { color: theme.textMuted }]}>MyCESA © 2026</Text>
          <Text style={[styles.footerSub, { color: theme.textMuted }]}>
            GROUPE COFE-CESA — Tous droits réservés
          </Text>
        </View>

      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: { flex: 1 },
  hero: {
    backgroundColor: VERT,
    paddingTop: Platform.OS === 'ios' ? 20 : (StatusBar.currentHeight || 24) + 16,
    paddingBottom: 32, paddingHorizontal: 20,
    borderBottomLeftRadius: 32, borderBottomRightRadius: 32,
    overflow: 'hidden', alignItems: 'center',
  },
  deco1: { position: 'absolute', width: 180, height: 180, borderRadius: 90, backgroundColor: 'rgba(255,255,255,0.07)', top: -50, right: -30 },
  deco2: { position: 'absolute', width: 120, height: 120, borderRadius: 60, backgroundColor: 'rgba(255,255,255,0.05)', bottom: -20, left: -20 },
  avatarBox:  { width: 80, height: 80, borderRadius: 40, backgroundColor: 'rgba(255,255,255,0.25)', justifyContent: 'center', alignItems: 'center', borderWidth: 3, borderColor: 'rgba(255,255,255,0.4)', marginBottom: 12 },
  avatarTxt:  { fontSize: 32, fontWeight: '900', color: '#fff' },
  heroNom:    { color: '#fff', fontSize: 22, fontWeight: '900', marginBottom: 4 },
  heroEmail:  { color: 'rgba(255,255,255,0.75)', fontSize: 13, marginBottom: 10 },
  roleBadge:  { backgroundColor: 'rgba(255,255,255,0.2)', borderRadius: 12, paddingHorizontal: 14, paddingVertical: 5 },
  roleTxt:    { color: '#fff', fontSize: 12, fontWeight: '700' },
  optionCard: { flexDirection: 'row', alignItems: 'center', borderRadius: 16, padding: 16, borderWidth: 1, elevation: 2, gap: 14 },
  optionIcon:  { fontSize: 22 },
  optionLabel: { flex: 1, fontSize: 15, fontWeight: '700' },
  optionArrow: { fontSize: 22 },
  aProposCard: { marginHorizontal: 16, marginTop: 4, borderRadius: 20, padding: 18, elevation: 2, borderWidth: 1 },
  aProposTitre:  { fontSize: 15, fontWeight: '800', marginBottom: 4 },
  aProposSlogan: { fontSize: 12, fontStyle: 'italic', marginBottom: 12 },
  aProposSep:    { height: 1, backgroundColor: '#E2E8F0', marginBottom: 12 },
  aProposRow:    { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 8 },
  aProposIcon:   { fontSize: 16 },
  aProposTxt:    { fontSize: 13, flex: 1 },
  footer:    { alignItems: 'center', padding: 20 },
  footerTxt: { fontSize: 12, fontWeight: '600' },
  footerSub: { fontSize: 11, marginTop: 4 },
});