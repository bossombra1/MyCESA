import React, { useEffect, useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  TextInput, Alert, Platform, ActivityIndicator, StatusBar
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import API from '../api/api';

export default function ProfilScreen({ navigation }) {
  const [user, setUser] = useState(null);
  const [etudiant, setEtudiant] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState('infos');

  const [nom, setNom] = useState('');
  const [email, setEmail] = useState('');
  const [ancienMdp, setAncienMdp] = useState('');
  const [nouveauMdp, setNouveauMdp] = useState('');
  const [confirmMdp, setConfirmMdp] = useState('');
  const [showAncien, setShowAncien] = useState(false);
  const [showNouveau, setShowNouveau] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  useEffect(() => { loadUser(); }, []);

  const loadUser = async () => {
    try {
      const stored = await AsyncStorage.getItem('user');
      if (stored) {
        const u = JSON.parse(stored);
        setUser(u);
        setNom(u.Nom_User || '');
        setEmail(u.Email_User || '');
        try {
          const res = await API.get(`/etudiants/profil/${u.Id_UTILISATEUR}`);
          setEtudiant(res.data);
        } catch (e) {}
      }
    } catch (e) {}
    finally { setLoading(false); }
  };

  const showAlert = (titre, message) => {
    if (Platform.OS === 'web') window.alert(`${titre}: ${message}`);
    else Alert.alert(titre, message);
  };

  const sauvegarderInfos = async () => {
    if (!nom.trim()) return showAlert('Erreur', 'Le nom ne peut pas être vide');
    if (!email.trim()) return showAlert('Erreur', "L'email ne peut pas être vide");
    setSaving(true);
    try {
      await API.put(`/auth/profil/${user.Id_UTILISATEUR}`, { Nom_User: nom, Email_User: email });
      const updatedUser = { ...user, Nom_User: nom, Email_User: email };
      await AsyncStorage.setItem('user', JSON.stringify(updatedUser));
      setUser(updatedUser);
      showAlert('✅ Succès', 'Profil mis à jour avec succès !');
    } catch (err) {
      showAlert('Erreur', err.response?.data?.error || 'Impossible de mettre à jour le profil');
    } finally { setSaving(false); }
  };

  const changerMotDePasse = async () => {
    if (!ancienMdp || !nouveauMdp || !confirmMdp) return showAlert('Erreur', 'Tous les champs sont requis');
    if (nouveauMdp !== confirmMdp) return showAlert('Erreur', 'Les mots de passe ne correspondent pas');
    if (nouveauMdp.length < 6) return showAlert('Erreur', 'Minimum 6 caractères requis');
    setSaving(true);
    try {
      await API.put(`/auth/password/${user.Id_UTILISATEUR}`, {
        ancienPassword: ancienMdp,
        nouveauPassword: nouveauMdp,
      });
      setAncienMdp(''); setNouveauMdp(''); setConfirmMdp('');
      showAlert('✅ Succès', 'Mot de passe modifié avec succès !');
    } catch (err) {
      showAlert('Erreur', err.response?.data?.error || 'Mot de passe actuel incorrect');
    } finally { setSaving(false); }
  };

  const initiale = user?.Nom_User?.charAt(0)?.toUpperCase() || 'E';
  const forceColor = nouveauMdp.length < 6 ? '#EF4444' : nouveauMdp.length < 10 ? '#F59E0B' : '#10B981';
  const forceLabel = nouveauMdp.length < 6 ? 'Faible' : nouveauMdp.length < 10 ? 'Moyen' : 'Fort';
  const forcePct = nouveauMdp.length < 6 ? '30%' : nouveauMdp.length < 10 ? '65%' : '100%';

  if (loading) return (
    <View style={styles.center}>
      <ActivityIndicator size="large" color="#2563EB" />
    </View>
  );

  return (
    <View style={styles.wrapper}>
      <StatusBar barStyle="light-content" backgroundColor="#0F172A" />
      <ScrollView showsVerticalScrollIndicator={false}>

        {/* HERO */}
        <View style={styles.hero}>
          <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
            <Text style={styles.backTxt}>‹</Text>
          </TouchableOpacity>
          <View style={styles.avatarBox}>
            <View style={styles.avatar}>
              <Text style={styles.avatarTxt}>{initiale}</Text>
            </View>
            <View style={styles.avatarBadge}>
              <Text style={styles.avatarBadgeTxt}>✏️</Text>
            </View>
          </View>
          <Text style={styles.heroNom}>{user?.Nom_User}</Text>
          <View style={styles.heroRoleBadge}>
            <Text style={styles.heroRoleTxt}>🎓 {user?.Lib_Role || 'Étudiant'}</Text>
          </View>
          <Text style={styles.heroEmail}>{user?.Email_User}</Text>

          {/* INFOS RAPIDES */}
          {etudiant && (
            <View style={styles.quickInfos}>
              <View style={styles.quickInfoItem}>
                <Text style={styles.quickInfoVal}>{etudiant.Matricule_Etudiant || 'N/A'}</Text>
                <Text style={styles.quickInfoLabel}>Matricule</Text>
              </View>
              <View style={styles.quickInfoDivider} />
              <View style={styles.quickInfoItem}>
                <Text style={styles.quickInfoVal}>{etudiant.Nom_Classe || 'N/A'}</Text>
                <Text style={styles.quickInfoLabel}>Classe</Text>
              </View>
              <View style={styles.quickInfoDivider} />
              <View style={styles.quickInfoItem}>
                <Text style={styles.quickInfoVal}>{etudiant.Nom_Filiere || 'N/A'}</Text>
                <Text style={styles.quickInfoLabel}>Filière</Text>
              </View>
            </View>
          )}
        </View>

        {/* TABS */}
        <View style={styles.tabs}>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'infos' && styles.tabActive]}
            onPress={() => setActiveTab('infos')}
          >
            <Text style={styles.tabIcon}>👤</Text>
            <Text style={[styles.tabTxt, activeTab === 'infos' && styles.tabTxtActive]}>Mes Infos</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'password' && styles.tabActive]}
            onPress={() => setActiveTab('password')}
          >
            <Text style={styles.tabIcon}>🔒</Text>
            <Text style={[styles.tabTxt, activeTab === 'password' && styles.tabTxtActive]}>Sécurité</Text>
          </TouchableOpacity>
        </View>

        {/* ONGLET INFOS */}
        {activeTab === 'infos' && (
          <View style={styles.card}>
            <View style={styles.cardTitreRow}>
              <Text style={styles.cardTitre}>Informations personnelles</Text>
            </View>

            <Text style={styles.label}>Nom complet</Text>
            <View style={styles.inputWrapper}>
              <Text style={styles.inputIcon}>👤</Text>
              <TextInput
                style={styles.input}
                value={nom}
                onChangeText={setNom}
                placeholder="Votre nom complet"
                placeholderTextColor="#94A3B8"
              />
            </View>

            <Text style={styles.label}>Adresse email</Text>
            <View style={styles.inputWrapper}>
              <Text style={styles.inputIcon}>📧</Text>
              <TextInput
                style={styles.input}
                value={email}
                onChangeText={setEmail}
                placeholder="Votre adresse email"
                placeholderTextColor="#94A3B8"
                keyboardType="email-address"
                autoCapitalize="none"
              />
            </View>

            <Text style={styles.label}>Rôle</Text>
            <View style={[styles.inputWrapper, styles.inputWrapperDisabled]}>
              <Text style={styles.inputIcon}>🎓</Text>
              <Text style={styles.inputDisabledTxt}>{user?.Lib_Role || 'Étudiant'}</Text>
            </View>

            {etudiant && (
              <>
                <Text style={styles.label}>Matricule</Text>
                <View style={[styles.inputWrapper, styles.inputWrapperDisabled]}>
                  <Text style={styles.inputIcon}>🪪</Text>
                  <Text style={styles.inputDisabledTxt}>{etudiant.Matricule_Etudiant || 'N/A'}</Text>
                </View>
              </>
            )}

            <TouchableOpacity
              style={[styles.btn, saving && styles.btnDisabled]}
              onPress={sauvegarderInfos}
              disabled={saving}
            >
              {saving
                ? <ActivityIndicator color="#fff" />
                : <Text style={styles.btnTxt}>💾 Sauvegarder les modifications</Text>
              }
            </TouchableOpacity>
          </View>
        )}

        {/* ONGLET MOT DE PASSE */}
        {activeTab === 'password' && (
          <View style={styles.card}>
            <View style={styles.cardTitreRow}>
              <Text style={styles.cardTitre}>Changer le mot de passe</Text>
            </View>

            <View style={styles.securityTip}>
              <Text style={styles.securityTipTxt}>
                💡 Utilisez un mot de passe fort avec au moins 8 caractères, des chiffres et des lettres.
              </Text>
            </View>

            <Text style={styles.label}>Mot de passe actuel</Text>
            <View style={styles.inputWrapper}>
              <Text style={styles.inputIcon}>🔑</Text>
              <TextInput
                style={styles.input}
                value={ancienMdp}
                onChangeText={setAncienMdp}
                placeholder="Mot de passe actuel"
                placeholderTextColor="#94A3B8"
                secureTextEntry={!showAncien}
              />
              <TouchableOpacity onPress={() => setShowAncien(!showAncien)} style={styles.eyeBtn}>
                <Text style={styles.eyeIcon}>{showAncien ? '🙈' : '👁️'}</Text>
              </TouchableOpacity>
            </View>

            <Text style={styles.label}>Nouveau mot de passe</Text>
            <View style={styles.inputWrapper}>
              <Text style={styles.inputIcon}>🔒</Text>
              <TextInput
                style={styles.input}
                value={nouveauMdp}
                onChangeText={setNouveauMdp}
                placeholder="Nouveau mot de passe"
                placeholderTextColor="#94A3B8"
                secureTextEntry={!showNouveau}
              />
              <TouchableOpacity onPress={() => setShowNouveau(!showNouveau)} style={styles.eyeBtn}>
                <Text style={styles.eyeIcon}>{showNouveau ? '🙈' : '👁️'}</Text>
              </TouchableOpacity>
            </View>

            {nouveauMdp.length > 0 && (
              <View style={styles.forceContainer}>
                <View style={styles.forceBarBg}>
                  <View style={[styles.forceBarFill, { width: forcePct, backgroundColor: forceColor }]} />
                </View>
                <View style={styles.forceRow}>
                  <Text style={[styles.forceTxt, { color: forceColor }]}>{forceLabel}</Text>
                  <Text style={styles.forceCount}>{nouveauMdp.length} caractères</Text>
                </View>
              </View>
            )}

            <Text style={styles.label}>Confirmer le nouveau mot de passe</Text>
            <View style={[styles.inputWrapper, confirmMdp && nouveauMdp !== confirmMdp && styles.inputWrapperError]}>
              <Text style={styles.inputIcon}>✅</Text>
              <TextInput
                style={styles.input}
                value={confirmMdp}
                onChangeText={setConfirmMdp}
                placeholder="Confirmer le mot de passe"
                placeholderTextColor="#94A3B8"
                secureTextEntry={!showConfirm}
              />
              <TouchableOpacity onPress={() => setShowConfirm(!showConfirm)} style={styles.eyeBtn}>
                <Text style={styles.eyeIcon}>{showConfirm ? '🙈' : '👁️'}</Text>
              </TouchableOpacity>
            </View>
            {confirmMdp && nouveauMdp !== confirmMdp && (
              <Text style={styles.errorTxt}>⚠️ Les mots de passe ne correspondent pas</Text>
            )}

            <TouchableOpacity
              style={[styles.btn, styles.btnDanger, saving && styles.btnDisabled]}
              onPress={changerMotDePasse}
              disabled={saving}
            >
              {saving
                ? <ActivityIndicator color="#fff" />
                : <Text style={styles.btnTxt}>🔒 Changer le mot de passe</Text>
              }
            </TouchableOpacity>
          </View>
        )}

        <View style={{ height: 40 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: { flex: 1, backgroundColor: '#F8FAFF' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },

  // HERO
  hero: {
    backgroundColor: '#0F172A', alignItems: 'center',
    paddingTop: Platform.OS === 'ios' ? 60 : (StatusBar.currentHeight || 24) + 20,
    paddingBottom: 32, paddingHorizontal: 20,
    borderBottomLeftRadius: 32, borderBottomRightRadius: 32,
  },
  backBtn: {
    position: 'absolute', top: Platform.OS === 'ios' ? 60 : (StatusBar.currentHeight || 24) + 10,
    left: 16, width: 40, height: 40,
    justifyContent: 'center', alignItems: 'center',
  },
  backTxt: { color: '#fff', fontSize: 32, fontWeight: '300' },
  avatarBox: { position: 'relative', marginBottom: 16 },
  avatar: {
    width: 96, height: 96, borderRadius: 48, backgroundColor: '#2563EB',
    justifyContent: 'center', alignItems: 'center',
    borderWidth: 4, borderColor: '#60A5FA',
  },
  avatarTxt: { color: '#fff', fontSize: 38, fontWeight: '900' },
  avatarBadge: {
    position: 'absolute', bottom: 0, right: 0,
    backgroundColor: '#F59E0B', width: 28, height: 28,
    borderRadius: 14, justifyContent: 'center', alignItems: 'center',
    borderWidth: 2, borderColor: '#0F172A',
  },
  avatarBadgeTxt: { fontSize: 14 },
  heroNom: { color: '#fff', fontSize: 22, fontWeight: '900', textAlign: 'center' },
  heroRoleBadge: {
    backgroundColor: 'rgba(37,99,235,0.3)', paddingHorizontal: 14,
    paddingVertical: 5, borderRadius: 20, marginTop: 8,
    borderWidth: 1, borderColor: 'rgba(96,165,250,0.4)',
  },
  heroRoleTxt: { color: '#60A5FA', fontSize: 13, fontWeight: '600' },
  heroEmail: { color: '#64748B', fontSize: 13, marginTop: 6 },

  // QUICK INFOS
  quickInfos: {
    flexDirection: 'row', backgroundColor: 'rgba(255,255,255,0.08)',
    borderRadius: 16, padding: 16, marginTop: 20, width: '100%',
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)',
  },
  quickInfoItem: { flex: 1, alignItems: 'center' },
  quickInfoVal: { color: '#fff', fontSize: 14, fontWeight: '800' },
  quickInfoLabel: { color: '#64748B', fontSize: 11, marginTop: 3 },
  quickInfoDivider: { width: 1, backgroundColor: 'rgba(255,255,255,0.1)' },

  // TABS
  tabs: {
    flexDirection: 'row', margin: 16, backgroundColor: '#E2E8F0',
    borderRadius: 16, padding: 4,
  },
  tab: {
    flex: 1, paddingVertical: 12, borderRadius: 12,
    alignItems: 'center', flexDirection: 'row', justifyContent: 'center', gap: 6,
  },
  tabActive: { backgroundColor: '#fff', elevation: 4,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1,
  },
  tabIcon: { fontSize: 16 },
  tabTxt: { fontSize: 14, fontWeight: '600', color: '#64748B' },
  tabTxtActive: { color: '#1E293B', fontWeight: '800' },

  // CARD
  card: {
    backgroundColor: '#fff', marginHorizontal: 16, borderRadius: 24,
    padding: 22, elevation: 4,
    shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.08,
  },
  cardTitreRow: { marginBottom: 20 },
  cardTitre: { fontSize: 17, fontWeight: '900', color: '#1E293B' },

  // SECURITY TIP
  securityTip: {
    backgroundColor: '#EFF6FF', borderRadius: 12, padding: 12,
    borderLeftWidth: 4, borderLeftColor: '#2563EB', marginBottom: 8,
  },
  securityTipTxt: { fontSize: 12, color: '#1E40AF', lineHeight: 18 },

  // INPUTS
  label: { fontSize: 12, fontWeight: '700', color: '#64748B', marginBottom: 6, marginTop: 14, textTransform: 'uppercase', letterSpacing: 0.5 },
  inputWrapper: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: '#F8FAFC', borderWidth: 1.5, borderColor: '#E2E8F0',
    borderRadius: 14, paddingHorizontal: 14, paddingVertical: 2,
  },
  inputWrapperDisabled: { backgroundColor: '#F1F5F9', borderColor: '#E2E8F0' },
  inputWrapperError: { borderColor: '#EF4444', backgroundColor: '#FFF5F5' },
  inputIcon: { fontSize: 18, marginRight: 10 },
  input: { flex: 1, fontSize: 15, color: '#1E293B', paddingVertical: 13 },
  inputDisabledTxt: { flex: 1, fontSize: 15, color: '#94A3B8', paddingVertical: 13 },
  eyeBtn: { padding: 8 },
  eyeIcon: { fontSize: 18 },
  errorTxt: { fontSize: 12, color: '#EF4444', marginTop: 4, marginLeft: 4 },

  // FORCE MDP
  forceContainer: { marginTop: 8, marginBottom: 4 },
  forceBarBg: { height: 6, backgroundColor: '#E2E8F0', borderRadius: 6, overflow: 'hidden' },
  forceBarFill: { height: '100%', borderRadius: 6 },
  forceRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 4 },
  forceTxt: { fontSize: 12, fontWeight: '700' },
  forceCount: { fontSize: 12, color: '#94A3B8' },

  // BTN
  btn: {
    backgroundColor: '#2563EB', borderRadius: 16, padding: 17,
    alignItems: 'center', marginTop: 24,
    shadowColor: '#2563EB', shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35, shadowRadius: 12, elevation: 6,
  },
  btnDanger: {
    backgroundColor: '#DC2626',
    shadowColor: '#DC2626',
  },
  btnDisabled: { backgroundColor: '#93C5FD', shadowOpacity: 0, elevation: 0 },
  btnTxt: { color: '#fff', fontSize: 15, fontWeight: '800' },
});