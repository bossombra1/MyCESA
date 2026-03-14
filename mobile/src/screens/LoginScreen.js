import React, { useState } from 'react';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  View, Text, TextInput, TouchableOpacity,
  StyleSheet, Alert, ActivityIndicator,
  Platform, ScrollView, StatusBar
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import API from '../api/api';

const VERT    = '#2E7D32';
const VERT2   = '#388E3C';
const ORANGE  = '#D84315';
const BLANC   = '#FFFFFF';
const GRIS_BG = '#F5F7F5';

export default function LoginScreen({ navigation }) {
  const [login, setLogin] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const insets = useSafeAreaInsets();

  const handleLogin = async () => {
    if (!login || !password) {
      if (Platform.OS === 'web') window.alert('Veuillez remplir tous les champs');
      else Alert.alert('Erreur', 'Veuillez remplir tous les champs');
      return;
    }
    setLoading(true);
    try {
      const response = await API.post('/auth/login', {
        Login_User: login,
        Password_User: password,
      });
      await AsyncStorage.setItem('token', response.data.token);
      await AsyncStorage.setItem('user', JSON.stringify(response.data.user));
      navigation.replace('Main');
    } catch (error) {
      const msg = error.response?.data?.error || 'Problème réseau';
      if (Platform.OS === 'web') window.alert('Erreur de connexion : ' + msg);
      else Alert.alert('Erreur de connexion', msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: GRIS_BG }}
      contentContainerStyle={[styles.container, { paddingBottom: insets.bottom + 16 }]}
      showsVerticalScrollIndicator={false}
      keyboardShouldPersistTaps="always"
    >
      <StatusBar barStyle="light-content" backgroundColor={VERT} />

      {/* HEADER */}
      <View style={styles.header}>
        <View style={styles.decoCircle1} />
        <View style={styles.decoCircle2} />

        <View style={styles.logoBox}>
          <View style={styles.logoOuter}>
            <View style={styles.logoInner}>
              <Text style={styles.logoTxt}>GROUPE</Text>
              <Text style={styles.logoTxtBold}>COFE-CESA</Text>
            </View>
            <View style={styles.logoLines}>
              <View style={[styles.logoLine, { width: 80 }]} />
              <View style={[styles.logoLine, { width: 60 }]} />
              <View style={[styles.logoLine, { width: 40 }]} />
            </View>
          </View>
        </View>

        <Text style={styles.appNom}>MyCESA</Text>
        <Text style={styles.slogan}>« Une excellence à votre service ! »</Text>

        <View style={styles.badgesRow}>
          <View style={styles.badge}>
            <Text style={styles.badgeTxt}>📍 Abidjan</Text>
          </View>
        </View>
      </View>

      {/* FORMULAIRE */}
      <View style={styles.formCard}>
        <Text style={styles.formTitre}>Connexion</Text>
        <Text style={styles.formSub}>Accédez à votre espace étudiant</Text>

        <Text style={styles.label}>Identifiant</Text>
        <View style={styles.inputWrapper}>
          <Text style={styles.inputIcon}>👤</Text>
          <TextInput
            style={styles.input}
            placeholder="Votre identifiant"
            placeholderTextColor="#94A3B8"
            value={login}
            onChangeText={setLogin}
            autoCapitalize="none"
            autoCorrect={false}
            returnKeyType="next"
          />
          {login.length > 0 && (
            <TouchableOpacity onPress={() => setLogin('')}>
              <Text style={styles.clearBtn}>✕</Text>
            </TouchableOpacity>
          )}
        </View>

        <Text style={styles.label}>Mot de passe</Text>
        <View style={styles.inputWrapper}>
          <Text style={styles.inputIcon}>🔒</Text>
          <TextInput
            style={styles.input}
            placeholder="Votre mot de passe"
            placeholderTextColor="#94A3B8"
            value={password}
            onChangeText={setPassword}
            secureTextEntry={!showPassword}
            autoCapitalize="none"
            autoCorrect={false}
            returnKeyType="done"
            onSubmitEditing={handleLogin}
          />
          <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
            <Text style={styles.eyeBtn}>{showPassword ? '🙈' : '👁️'}</Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity
          style={[styles.btn, loading && styles.btnLoading]}
          onPress={handleLogin}
          disabled={loading}
          activeOpacity={0.85}
        >
          {loading ? (
            <View style={styles.btnRow}>
              <ActivityIndicator color="#fff" size="small" />
              <Text style={styles.btnTxt}>Connexion...</Text>
            </View>
          ) : (
            <View style={styles.btnRow}>
              <Text style={styles.btnTxt}>Se connecter  ›</Text>
            </View>
          )}
        </TouchableOpacity>

        <View style={styles.helpBox}>
          <Text style={styles.helpTxt}>
            🔑 Vos identifiants vous sont fournis par le service de scolarité du GROUPE COFE-CESA
          </Text>
        </View>
      </View>

      {/* INFOS ÉCOLE */}
      <View style={styles.infoBox}>
        <Text style={styles.infoTitre}>📞 Contacts</Text>
        <View style={styles.infoRow}>
          <Text style={styles.infoIcon}>🏫</Text>
          <View>
            <Text style={styles.infoLabel}>CESA Abidjan (Siège)</Text>
            <Text style={styles.infoVal}>Koumassi Nord-Est, Terminus Bus 05</Text>
            <Text style={styles.infoVal}>(+225) 27 21 56 31 74</Text>
          </View>
        </View>
        <View style={styles.infoRow}>
          <Text style={styles.infoIcon}>🌐</Text>
          <View>
            <Text style={styles.infoLabel}>Site web</Text>
            <Text style={[styles.infoVal, { color: VERT }]}>cesa-elearning.com</Text>
          </View>
        </View>
      </View>

      <View style={styles.footer}>
        <Text style={styles.footerTxt}>MyCESA © 2026</Text>
        <Text style={styles.footerSub}>GROUPE COFE-CESA — Fondé en 1992</Text>
      </View>

    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flexGrow: 1, backgroundColor: GRIS_BG },

  header: {
    backgroundColor: VERT, alignItems: 'center',
    paddingTop: Platform.OS === 'ios' ? 60 : (StatusBar.currentHeight || 24) + 20,
    paddingBottom: 40, paddingHorizontal: 24,
    borderBottomLeftRadius: 36, borderBottomRightRadius: 36, overflow: 'hidden',
  },
  decoCircle1: {
    position: 'absolute', width: 200, height: 200, borderRadius: 100,
    backgroundColor: 'rgba(255,255,255,0.06)', top: -60, right: -40,
  },
  decoCircle2: {
    position: 'absolute', width: 140, height: 140, borderRadius: 70,
    backgroundColor: 'rgba(255,255,255,0.05)', bottom: -20, left: -20,
  },
  logoBox: { marginBottom: 16, zIndex: 1 },
  logoOuter: {
    backgroundColor: BLANC, borderRadius: 12, padding: 12,
    alignItems: 'center', minWidth: 140,
    borderWidth: 2, borderColor: ORANGE,
  },
  logoInner: { alignItems: 'center', marginBottom: 6 },
  logoTxt: { color: ORANGE, fontSize: 11, fontWeight: '700', letterSpacing: 1 },
  logoTxtBold: { color: ORANGE, fontSize: 14, fontWeight: '900', letterSpacing: 1 },
  logoLines: { gap: 3, alignItems: 'center' },
  logoLine: { height: 2, backgroundColor: VERT2, borderRadius: 2 },
  appNom: { color: BLANC, fontSize: 32, fontWeight: '900', letterSpacing: 2, marginBottom: 6 },
  slogan: { color: 'rgba(255,255,255,0.85)', fontSize: 13, fontStyle: 'italic', textAlign: 'center' },
  badgesRow: { flexDirection: 'row', gap: 10, marginTop: 14 },
  badge: {
    backgroundColor: 'rgba(255,255,255,0.15)', paddingHorizontal: 12,
    paddingVertical: 5, borderRadius: 20,
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.25)',
  },
  badgeTxt: { color: BLANC, fontSize: 12, fontWeight: '600' },

  formCard: {
    backgroundColor: BLANC, marginHorizontal: 20, marginTop: -20,
    borderRadius: 28, padding: 24, elevation: 10,
    shadowColor: '#000', shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.12, shadowRadius: 16,
  },
  formTitre: { fontSize: 22, fontWeight: '900', color: '#1E293B', marginBottom: 4 },
  formSub: { fontSize: 14, color: '#64748B', marginBottom: 20 },
  label: {
    fontSize: 12, fontWeight: '700', color: '#64748B',
    marginBottom: 8, marginTop: 14,
    textTransform: 'uppercase', letterSpacing: 0.5,
  },
  inputWrapper: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: '#F8FAFC', borderWidth: 1.5, borderColor: '#E2E8F0',
    borderRadius: 14, paddingHorizontal: 14,
  },
  inputIcon: { fontSize: 18, marginRight: 10 },
  input: { flex: 1, fontSize: 15, color: '#1E293B', paddingVertical: 14 },
  clearBtn: { fontSize: 13, color: '#94A3B8', padding: 4 },
  eyeBtn: { fontSize: 18, padding: 4 },

  btn: {
    backgroundColor: ORANGE, borderRadius: 16, padding: 17,
    alignItems: 'center', marginTop: 24,
    shadowColor: ORANGE, shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.4, shadowRadius: 12, elevation: 8,
  },
  btnLoading: { backgroundColor: '#EF6C00', shadowOpacity: 0.2 },
  btnRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  btnTxt: { color: BLANC, fontSize: 16, fontWeight: '800' },

  helpBox: {
    backgroundColor: '#F0FDF4', borderRadius: 12, padding: 12, marginTop: 16,
    borderLeftWidth: 3, borderLeftColor: VERT,
  },
  helpTxt: { fontSize: 12, color: VERT, lineHeight: 18 },

  infoBox: {
    backgroundColor: BLANC, marginHorizontal: 20, marginTop: 16,
    borderRadius: 20, padding: 20, elevation: 3,
    borderWidth: 1, borderColor: '#E8F5E9',
  },
  infoTitre: { fontSize: 14, fontWeight: '800', color: VERT, marginBottom: 14 },
  infoRow: { flexDirection: 'row', alignItems: 'flex-start', marginBottom: 12, gap: 12 },
  infoIcon: { fontSize: 22 },
  infoLabel: { fontSize: 13, fontWeight: '700', color: '#1E293B' },
  infoVal: { fontSize: 12, color: '#64748B', marginTop: 2 },

  footer: { alignItems: 'center', padding: 24 },
  footerTxt: { color: '#64748B', fontSize: 13, fontWeight: '600' },
  footerSub: { color: '#94A3B8', fontSize: 11, marginTop: 4 },
});