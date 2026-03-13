import React, { useEffect, useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  TextInput, Alert, Platform, ActivityIndicator, StatusBar
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import API from '../api/api';

const VERT   = '#2E7D32';
const VERT2  = '#388E3C';
const ORANGE = '#D84315';
const BLANC  = '#FFFFFF';

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
  const insets = useSafeAreaInsets();

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

  const showAlertMsg = (titre, message) => {
    if (Platform.OS === 'web') window.alert(`${titre}: ${message}`);
    else Alert.alert(titre, message);
  };

  const sauvegarderInfos = async () => {
    if (!nom.trim()) return showAlertMsg('Erreur', 'Le nom ne peut pas être vide');
    if (!email.trim()) return showAlertMsg('Erreur', "L'email ne peut pas être vide");
    setSaving(true);
    try {
      await API.put(`/auth/profil/${user.Id_UTILISATEUR}`, { Nom_User: nom, Email_User: email });
      const updatedUser = { ...user, Nom_User: nom, Email_User: email };
      await AsyncStorage.setItem('user', JSON.stringify(updatedUser));
      setUser(updatedUser);
      showAlertMsg('✅ Succès', 'Profil mis à jour avec succès !');
    } catch (err) {
      showAlertMsg('Erreur', err.response?.data?.error || 'Impossible de mettre à jour');
    } finally { setSaving(false); }
  };

  const changerMotDePasse = async () => {
    if (!ancienMdp || !nouveauMdp || !confirmMdp) return showAlertMsg('Erreur', 'Tous les champs sont requis');
    if (nouveauMdp !== confirmMdp) return showAlertMsg('Erreur', 'Les mots de passe ne correspondent pas');
    if (nouveauMdp.length < 6) return showAlertMsg('Erreur', 'Minimum 6 caractères requis');
    setSaving(true);
    try {
      await API.put(`/auth/password/${user.Id_UTILISATEUR}`, {
        ancienPassword: ancienMdp,
        nouveauPassword: nouveauMdp,
      });
      setAncienMdp(''); setNouveauMdp(''); setConfirmMdp('');
      showAlertMsg('✅ Succès', 'Mot de passe modifié avec succès !');
    } catch (err) {
      showAlertMsg('Erreur', err.response?.data?.error || 'Mot de passe actuel incorrect');
    } finally { setSaving(false); }
  };

  const getStrength = (pwd) => {
    if (!pwd) return { color: '#E2E8F0', label: '', width: '0%' };
    if (pwd.length < 6) return { color: '#EF4444', label: 'Faible', width: '33%' };
    if (pwd.length < 10) return { color: '#F59E0B', label: 'Moyen', width: '66%' };
    return { color: VERT, label: 'Fort', width: '100%' };
  };

  const strength = getStrength(nouveauMdp);
  const initiale = user?.Nom_User?.charAt(0)?.toUpperCase() || 'E';

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
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={{ paddingBottom: insets.bottom + 32 }}
      >

        {/* HERO */}
        <View style={styles.hero}>
          <View style={styles.decoCircle1} />
          <View style={styles.decoCircle2} />

          <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
            <Text style={styles.backTxt}>‹</Text>
          </TouchableOpacity>

          <Text style={styles.heroTitle}>Mon Profil</Text>
        </View>

        {/* CARTE PROFIL */}
        <View style={styles.profileCard}>
          {/* AVATAR */}
          <View style={styles.avatarWrapper}>
            <View style={styles.avatar}>
              <Text style={styles.avatarTxt}>{initiale}</Text>
            </View>
            {/* 📸 PHOTO : quand Image_Etudiant sera disponible, remplacer par :
              <Image source={{ uri: etudiant?.Image_Etudiant }} style={styles.avatarImg} />
            */}
            <View style={styles.avatarBadge}>
              <Text style={styles.avatarBadgeTxt}>📷</Text>
            </View>
          </View>

          <Text style={styles.profileNom}>{user?.Nom_User}</Text>
          <View style={styles.profileRoleBadge}>
            <Text style={styles.profileRoleTxt}>🎓 {user?.Lib_Role || 'Étudiant'}</Text>
          </View>
          <Text style={styles.profileEmail}>{user?.Email_User}</Text>

          {/* INFOS ACADÉMIQUES */}
          {etudiant && (
            <View style={styles.infoGrid}>
              <View style={styles.infoItem}>
                <Text style={styles.infoVal}>{etudiant.Matricule_Etudiant || 'N/A'}</Text>
                <Text style={styles.infoLabel}>Matricule</Text>
              </View>
              <View style={styles.infoDivider} />
              <View style={styles.infoItem}>
                <Text style={styles.infoVal}>{etudiant.Nom_Classe || 'N/A'}</Text>
                <Text style={styles.infoLabel}>Classe</Text>
              </View>
              <View style={styles.infoDivider} />
              <View style={styles.infoItem}>
                <Text style={styles.infoVal}>{etudiant.Nom_Filiere || 'N/A'}</Text>
                <Text style={styles.infoLabel}>Filière</Text>
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
            <Text style={[styles.tabTxt, activeTab === 'infos' && styles.tabTxtActive]}>
              Informations
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'password' && styles.tabActive]}
            onPress={() => setActiveTab('password')}
          >
            <Text style={styles.tabIcon}>🔒</Text>
            <Text style={[styles.tabTxt, activeTab === 'password' && styles.tabTxtActive]}>
              Sécurité
            </Text>
          </TouchableOpacity>
        </View>

        {/* CONTENU */}
        <View style={styles.contentCard}>

          {activeTab === 'infos' ? (
            <>
              <Text style={styles.sectionTitre}>Informations personnelles</Text>

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
              <View style={[styles.inputWrapper, styles.inputDisabled]}>
                <Text style={styles.inputIcon}>🎓</Text>
                <Text style={styles.inputDisabledTxt}>{user?.Lib_Role || 'Étudiant'}</Text>
              </View>

              {etudiant && (
                <>
                  <Text style={styles.label}>Matricule</Text>
                  <View style={[styles.inputWrapper, styles.inputDisabled]}>
                    <Text style={styles.inputIcon}>🪪</Text>
                    <Text style={styles.inputDisabledTxt}>{etudiant.Matricule_Etudiant || 'N/A'}</Text>
                  </View>
                </>
              )}

              {/* NOTE PHOTO */}
              <View style={styles.photoNote}>
                <Text style={styles.photoNoteTxt}>
                  📷 La fonctionnalité de photo de profil sera disponible prochainement.
                  Votre photo sera liée à la colonne <Text style={{ fontWeight: '800' }}>Image_Etudiant</Text> de la base de données.
                </Text>
              </View>

              <TouchableOpacity
                style={[styles.btn, saving && styles.btnDisabled]}
                onPress={sauvegarderInfos}
                disabled={saving}
              >
                {saving
                  ? <ActivityIndicator color={BLANC} />
                  : <Text style={styles.btnTxt}>💾 Enregistrer les modifications</Text>
                }
              </TouchableOpacity>
            </>
          ) : (
            <>
              <Text style={styles.sectionTitre}>Modifier le mot de passe</Text>

              <View style={styles.tipCard}>
                <Text style={styles.tipTxt}>
                  💡 Utilisez au moins 8 caractères avec des chiffres et des lettres pour plus de sécurité.
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
                <TouchableOpacity onPress={() => setShowAncien(!showAncien)}>
                  <Text style={styles.eyeBtn}>{showAncien ? '🙈' : '👁️'}</Text>
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
                <TouchableOpacity onPress={() => setShowNouveau(!showNouveau)}>
                  <Text style={styles.eyeBtn}>{showNouveau ? '🙈' : '👁️'}</Text>
                </TouchableOpacity>
              </View>

              {nouveauMdp.length > 0 && (
                <View style={styles.strengthBox}>
                  <View style={styles.strengthBg}>
                    <View style={[styles.strengthFill, { width: strength.width, backgroundColor: strength.color }]} />
                  </View>
                  <View style={styles.strengthRow}>
                    <Text style={[styles.strengthLbl, { color: strength.color }]}>{strength.label}</Text>
                    <Text style={styles.strengthCount}>{nouveauMdp.length} caractères</Text>
                  </View>
                </View>
              )}

              <Text style={styles.label}>Confirmer le mot de passe</Text>
              <View style={[
                styles.inputWrapper,
                confirmMdp && nouveauMdp !== confirmMdp && styles.inputError
              ]}>
                <Text style={styles.inputIcon}>✅</Text>
                <TextInput
                  style={styles.input}
                  value={confirmMdp}
                  onChangeText={setConfirmMdp}
                  placeholder="Confirmer le mot de passe"
                  placeholderTextColor="#94A3B8"
                  secureTextEntry={!showConfirm}
                />
                <TouchableOpacity onPress={() => setShowConfirm(!showConfirm)}>
                  <Text style={styles.eyeBtn}>{showConfirm ? '🙈' : '👁️'}</Text>
                </TouchableOpacity>
              </View>
              {confirmMdp && nouveauMdp !== confirmMdp && (
                <Text style={styles.errorTxt}>⚠️ Les mots de passe ne correspondent pas</Text>
              )}

              <TouchableOpacity
                style={[styles.btn, styles.btnOrange, saving && styles.btnDisabled]}
                onPress={changerMotDePasse}
                disabled={saving}
              >
                {saving
                  ? <ActivityIndicator color={BLANC} />
                  : <Text style={styles.btnTxt}>🔒 Changer le mot de passe</Text>
                }
              </TouchableOpacity>
            </>
          )}
        </View>

        {/* FOOTER */}
        <View style={styles.footer}>
          <Text style={styles.footerTxt}>GROUPE COFE-CESA © {new Date().getFullYear()}</Text>
          <Text style={styles.footerSub}>Une excellence à votre service !</Text>
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
    backgroundColor: VERT, paddingTop: Platform.OS === 'ios' ? 60 : (StatusBar.currentHeight || 24) + 20,
    paddingBottom: 70, paddingHorizontal: 20, overflow: 'hidden',
    alignItems: 'center',
  },
  decoCircle1: {
    position: 'absolute', width: 200, height: 200, borderRadius: 100,
    backgroundColor: 'rgba(255,255,255,0.07)', top: -60, right: -40,
  },
  decoCircle2: {
    position: 'absolute', width: 140, height: 140, borderRadius: 70,
    backgroundColor: 'rgba(255,255,255,0.05)', bottom: -30, left: -30,
  },
  backBtn: { position: 'absolute', top: Platform.OS === 'ios' ? 60 : (StatusBar.currentHeight || 24) + 10, left: 16 },
  backTxt: { color: BLANC, fontSize: 32, fontWeight: '300' },
  heroTitle: { color: BLANC, fontSize: 20, fontWeight: '800', letterSpacing: 1 },

  // CARTE PROFIL
  profileCard: {
    backgroundColor: BLANC, marginHorizontal: 20, marginTop: -44,
    borderRadius: 28, padding: 24, alignItems: 'center',
    elevation: 10, shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.12,
  },
  avatarWrapper: { position: 'relative', marginTop: -50, marginBottom: 14 },
  avatar: {
    width: 90, height: 90, borderRadius: 45, backgroundColor: VERT,
    justifyContent: 'center', alignItems: 'center',
    borderWidth: 4, borderColor: BLANC,
    shadowColor: VERT, shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3, elevation: 8,
  },
  avatarTxt: { color: BLANC, fontSize: 36, fontWeight: '900' },
  avatarBadge: {
    position: 'absolute', bottom: 0, right: 0,
    backgroundColor: ORANGE, width: 30, height: 30,
    borderRadius: 15, justifyContent: 'center', alignItems: 'center',
    borderWidth: 2, borderColor: BLANC,
  },
  avatarBadgeTxt: { fontSize: 14 },
  profileNom: { fontSize: 22, fontWeight: '900', color: '#1E293B' },
  profileRoleBadge: {
    backgroundColor: '#E8F5E9', paddingHorizontal: 14,
    paddingVertical: 5, borderRadius: 20, marginTop: 6, marginBottom: 4,
    borderWidth: 1, borderColor: VERT + '40',
  },
  profileRoleTxt: { color: VERT, fontSize: 13, fontWeight: '700' },
  profileEmail: { fontSize: 13, color: '#94A3B8', marginBottom: 16 },
  infoGrid: {
    flexDirection: 'row', width: '100%',
    borderTopWidth: 1, borderTopColor: '#F1F5F9', paddingTop: 16,
  },
  infoItem: { flex: 1, alignItems: 'center' },
  infoVal: { fontSize: 14, fontWeight: '800', color: '#1E293B' },
  infoLabel: { fontSize: 11, color: '#94A3B8', marginTop: 3, textTransform: 'uppercase', letterSpacing: 0.5 },
  infoDivider: { width: 1, backgroundColor: '#F1F5F9' },

  // TABS
  tabs: {
    flexDirection: 'row', marginHorizontal: 20, marginTop: 16,
    backgroundColor: '#E8F5E9', borderRadius: 16, padding: 4,
  },
  tab: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 12, borderRadius: 12, gap: 6 },
  tabActive: { backgroundColor: BLANC, elevation: 3 },
  tabIcon: { fontSize: 16 },
  tabTxt: { fontSize: 13, fontWeight: '600', color: '#64748B' },
  tabTxtActive: { color: VERT, fontWeight: '800' },

  // CONTENT CARD
  contentCard: {
    backgroundColor: BLANC, marginHorizontal: 20, marginTop: 12,
    borderRadius: 24, padding: 22, elevation: 4,
    shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.08,
  },
  sectionTitre: { fontSize: 16, fontWeight: '900', color: '#1E293B', marginBottom: 20 },

  // INPUTS
  label: {
    fontSize: 11, fontWeight: '700', color: '#64748B',
    marginBottom: 6, marginTop: 14,
    textTransform: 'uppercase', letterSpacing: 0.5,
  },
  inputWrapper: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: '#F8FAFC', borderWidth: 1.5, borderColor: '#E2E8F0',
    borderRadius: 14, paddingHorizontal: 14,
  },
  inputDisabled: { backgroundColor: '#F1F5F9' },
  inputError: { borderColor: '#EF4444' },
  inputIcon: { fontSize: 18, marginRight: 10 },
  input: { flex: 1, fontSize: 15, color: '#1E293B', paddingVertical: 13 },
  inputDisabledTxt: { flex: 1, fontSize: 15, color: '#94A3B8', paddingVertical: 13 },
  eyeBtn: { fontSize: 18, padding: 4 },
  errorTxt: { fontSize: 12, color: '#EF4444', marginTop: 4 },

  // STRENGTH
  strengthBox: { marginTop: 8, marginBottom: 4 },
  strengthBg: { height: 6, backgroundColor: '#E2E8F0', borderRadius: 6, overflow: 'hidden' },
  strengthFill: { height: '100%', borderRadius: 6 },
  strengthRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 4 },
  strengthLbl: { fontSize: 12, fontWeight: '700' },
  strengthCount: { fontSize: 12, color: '#94A3B8' },

  // TIP
  tipCard: {
    backgroundColor: '#E8F5E9', borderRadius: 12, padding: 12, marginBottom: 8,
    borderLeftWidth: 3, borderLeftColor: VERT,
  },
  tipTxt: { fontSize: 12, color: VERT, lineHeight: 18 },

  // PHOTO NOTE
  photoNote: {
    backgroundColor: '#FFF7ED', borderRadius: 12, padding: 12, marginTop: 14,
    borderLeftWidth: 3, borderLeftColor: ORANGE,
  },
  photoNoteTxt: { fontSize: 12, color: '#92400E', lineHeight: 18 },

  // BOUTONS
  btn: {
    backgroundColor: VERT, borderRadius: 16, padding: 17,
    alignItems: 'center', marginTop: 22,
    shadowColor: VERT, shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35, shadowRadius: 12, elevation: 6,
  },
  btnOrange: { backgroundColor: ORANGE, shadowColor: ORANGE },
  btnDisabled: { opacity: 0.5, shadowOpacity: 0, elevation: 0 },
  btnTxt: { color: BLANC, fontSize: 15, fontWeight: '800' },

  // FOOTER
  footer: { alignItems: 'center', padding: 24 },
  footerTxt: { color: '#64748B', fontSize: 12, fontWeight: '600' },
  footerSub: { color: '#94A3B8', fontSize: 11, marginTop: 3, fontStyle: 'italic' },
});