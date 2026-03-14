import React, { useEffect, useState, useRef } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  TextInput, Alert, Platform, ActivityIndicator, StatusBar,
  Image, Animated
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as ImagePicker from 'expo-image-picker';
import API, { SERVER_URL } from '../api/api';
import { useTheme } from '../context/ThemeContext';

const VERT   = '#2E7D32';
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
  const [photoUri, setPhotoUri] = useState(null);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const insets = useSafeAreaInsets();
  const { theme, isDark, toggleTheme } = useTheme(); // ✅ corrigé

  // Animation toggle
  const toggleAnim = useRef(new Animated.Value(isDark ? 1 : 0)).current;

  const handleToggle = () => {
    Animated.timing(toggleAnim, {
      toValue: isDark ? 0 : 1,
      duration: 250,
      useNativeDriver: true,
    }).start();
    toggleTheme();
  };

  const toggleX = toggleAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [2, 22],
  });

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

  const choisirPhoto = async () => {
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        showAlertMsg('Permission refusée', "Autorisez l'accès à la galerie dans les paramètres.");
        return;
      }
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.7,
      });
      if (!result.canceled) {
        const uri = result.assets[0].uri;
        setPhotoUri(uri);
        await uploadPhoto(uri);
      }
    } catch (err) {
      showAlertMsg('Erreur', "Impossible d'ouvrir la galerie");
    }
  };

  const uploadPhoto = async (uri) => {
    setUploadingPhoto(true);
    try {
      const formData = new FormData();
      const filename = uri.split('/').pop();
      const ext = filename.split('.').pop();
      formData.append('photo', { uri, name: filename, type: `image/${ext === 'jpg' ? 'jpeg' : ext}` });
      const response = await API.post(`/upload/photo/${user.Id_UTILISATEUR}`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      if (response.data.imageUrl) {
        setEtudiant(prev => ({ ...prev, Image_Etudiant: response.data.imageUrl }));
        const stored = await AsyncStorage.getItem('user');
        const u = JSON.parse(stored);
        await AsyncStorage.setItem('user', JSON.stringify({ ...u, Image_Etudiant: response.data.imageUrl }));
        setPhotoUri(null);
        showAlertMsg('✅ Succès', 'Photo mise à jour !');
      }
    } catch (err) {
      showAlertMsg('Erreur', "Impossible d'uploader la photo");
    } finally {
      setUploadingPhoto(false);
    }
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
        ancienPassword: ancienMdp, nouveauPassword: nouveauMdp,
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

  const strength  = getStrength(nouveauMdp);
  const initiale  = user?.Nom_User?.charAt(0)?.toUpperCase() || 'E';
  const photoSource = photoUri
    ? { uri: photoUri }
    : etudiant?.Image_Etudiant
      ? { uri: `${SERVER_URL}${etudiant.Image_Etudiant}` }
      : null;

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
        <View style={[styles.profileCard, { backgroundColor: theme.card }]}>
          <TouchableOpacity style={styles.avatarWrapper} onPress={choisirPhoto} disabled={uploadingPhoto}>
            {photoSource ? (
              <Image source={photoSource} style={styles.avatarImg} />
            ) : (
              <View style={styles.avatar}>
                <Text style={styles.avatarTxt}>{initiale}</Text>
              </View>
            )}
            <View style={[styles.avatarBadge, uploadingPhoto && { backgroundColor: '#94A3B8' }]}>
              {uploadingPhoto
                ? <ActivityIndicator size="small" color={BLANC} />
                : <Text style={styles.avatarBadgeTxt}>📷</Text>
              }
            </View>
          </TouchableOpacity>

          <Text style={[styles.profileNom, { color: theme.text }]}>{user?.Nom_User}</Text>
          <View style={styles.profileRoleBadge}>
            <Text style={styles.profileRoleTxt}>🎓 {user?.Lib_Role || 'Étudiant'}</Text>
          </View>
          <Text style={[styles.profileEmail, { color: theme.textSub }]}>{user?.Email_User}</Text>

          {etudiant && (
            <View style={[styles.infoGrid, { borderTopColor: theme.cardBorder }]}>
              <View style={styles.infoItem}>
                <Text style={[styles.infoVal, { color: theme.text }]}>{etudiant.Matricule_Etudiant || 'N/A'}</Text>
                <Text style={[styles.infoLabel, { color: theme.textSub }]}>Matricule</Text>
              </View>
              <View style={[styles.infoDivider, { backgroundColor: theme.cardBorder }]} />
              <View style={styles.infoItem}>
                <Text style={[styles.infoVal, { color: theme.text }]}>{etudiant.Nom_Classe || 'N/A'}</Text>
                <Text style={[styles.infoLabel, { color: theme.textSub }]}>Classe</Text>
              </View>
              <View style={[styles.infoDivider, { backgroundColor: theme.cardBorder }]} />
              <View style={styles.infoItem}>
                <Text style={[styles.infoVal, { color: theme.text }]}>{etudiant.Nom_Filiere || 'N/A'}</Text>
                <Text style={[styles.infoLabel, { color: theme.textSub }]}>Filière</Text>
              </View>
            </View>
          )}
        </View>

        {/* TABS */}
        <View style={[styles.tabs, { backgroundColor: isDark ? '#1E293B' : '#E8F5E9' }]}>
          {[
            { key: 'infos',     icon: '👤', label: 'Infos' },
            { key: 'password',  icon: '🔒', label: 'Sécurité' },
            { key: 'apparence', icon: '🎨', label: 'Thème' },
          ].map((t) => (
            <TouchableOpacity
              key={t.key}
              style={[styles.tab, activeTab === t.key && { backgroundColor: theme.card, elevation: 3 }]}
              onPress={() => setActiveTab(t.key)}
            >
              <Text style={styles.tabIcon}>{t.icon}</Text>
              <Text style={[styles.tabTxt, activeTab === t.key && { color: VERT, fontWeight: '800' }]}>
                {t.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* CONTENU */}
        <View style={[styles.contentCard, { backgroundColor: theme.card }]}>

          {activeTab === 'infos' && (
            <>
              <Text style={[styles.sectionTitre, { color: theme.text }]}>Informations personnelles</Text>

              <Text style={[styles.label, { color: theme.textSub }]}>Nom complet</Text>
              <View style={[styles.inputWrapper, { backgroundColor: theme.input, borderColor: theme.inputBorder }]}>
                <Text style={styles.inputIcon}>👤</Text>
                <TextInput
                  style={[styles.input, { color: theme.text }]}
                  value={nom} onChangeText={setNom}
                  placeholder="Votre nom complet" placeholderTextColor={theme.textMuted}
                />
              </View>

              <Text style={[styles.label, { color: theme.textSub }]}>Adresse email</Text>
              <View style={[styles.inputWrapper, { backgroundColor: theme.input, borderColor: theme.inputBorder }]}>
                <Text style={styles.inputIcon}>📧</Text>
                <TextInput
                  style={[styles.input, { color: theme.text }]}
                  value={email} onChangeText={setEmail}
                  placeholder="Votre adresse email" placeholderTextColor={theme.textMuted}
                  keyboardType="email-address" autoCapitalize="none"
                />
              </View>

              <Text style={[styles.label, { color: theme.textSub }]}>Rôle</Text>
              <View style={[styles.inputWrapper, styles.inputDisabled, { backgroundColor: theme.input, borderColor: theme.inputBorder }]}>
                <Text style={styles.inputIcon}>🎓</Text>
                <Text style={[styles.inputDisabledTxt, { color: theme.textMuted }]}>{user?.Lib_Role || 'Étudiant'}</Text>
              </View>

              {etudiant && (
                <>
                  <Text style={[styles.label, { color: theme.textSub }]}>Matricule</Text>
                  <View style={[styles.inputWrapper, styles.inputDisabled, { backgroundColor: theme.input, borderColor: theme.inputBorder }]}>
                    <Text style={styles.inputIcon}>🪪</Text>
                    <Text style={[styles.inputDisabledTxt, { color: theme.textMuted }]}>{etudiant.Matricule_Etudiant || 'N/A'}</Text>
                  </View>
                </>
              )}

              <TouchableOpacity
                style={[styles.btn, saving && styles.btnDisabled]}
                onPress={sauvegarderInfos} disabled={saving}
              >
                {saving ? <ActivityIndicator color={BLANC} /> : <Text style={styles.btnTxt}>💾 Enregistrer les modifications</Text>}
              </TouchableOpacity>
            </>
          )}

          {activeTab === 'password' && (
            <>
              <Text style={[styles.sectionTitre, { color: theme.text }]}>Modifier le mot de passe</Text>
              <View style={[styles.tipCard, { backgroundColor: isDark ? '#1E3A2F' : '#E8F5E9' }]}>
                <Text style={[styles.tipTxt, { color: isDark ? '#4ADE80' : VERT }]}>
                  💡 Utilisez au moins 8 caractères avec des chiffres et des lettres.
                </Text>
              </View>

              {[
                { label: 'Mot de passe actuel', icon: '🔑', val: ancienMdp, set: setAncienMdp, show: showAncien, toggleShow: () => setShowAncien(!showAncien) },
                { label: 'Nouveau mot de passe', icon: '🔒', val: nouveauMdp, set: setNouveauMdp, show: showNouveau, toggleShow: () => setShowNouveau(!showNouveau) },
              ].map((f, i) => (
                <View key={i}>
                  <Text style={[styles.label, { color: theme.textSub }]}>{f.label}</Text>
                  <View style={[styles.inputWrapper, { backgroundColor: theme.input, borderColor: theme.inputBorder }]}>
                    <Text style={styles.inputIcon}>{f.icon}</Text>
                    <TextInput
                      style={[styles.input, { color: theme.text }]}
                      value={f.val} onChangeText={f.set}
                      placeholder={f.label} placeholderTextColor={theme.textMuted}
                      secureTextEntry={!f.show}
                    />
                    <TouchableOpacity onPress={f.toggleShow}>
                      <Text style={styles.eyeBtn}>{f.show ? '🙈' : '👁️'}</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              ))}

              {nouveauMdp.length > 0 && (
                <View style={styles.strengthBox}>
                  <View style={[styles.strengthBg, { backgroundColor: theme.cardBorder }]}>
                    <View style={[styles.strengthFill, { width: strength.width, backgroundColor: strength.color }]} />
                  </View>
                  <View style={styles.strengthRow}>
                    <Text style={[styles.strengthLbl, { color: strength.color }]}>{strength.label}</Text>
                    <Text style={[styles.strengthCount, { color: theme.textSub }]}>{nouveauMdp.length} caractères</Text>
                  </View>
                </View>
              )}

              <Text style={[styles.label, { color: theme.textSub }]}>Confirmer le mot de passe</Text>
              <View style={[styles.inputWrapper, { backgroundColor: theme.input, borderColor: confirmMdp && nouveauMdp !== confirmMdp ? '#EF4444' : theme.inputBorder }]}>
                <Text style={styles.inputIcon}>✅</Text>
                <TextInput
                  style={[styles.input, { color: theme.text }]}
                  value={confirmMdp} onChangeText={setConfirmMdp}
                  placeholder="Confirmer le mot de passe" placeholderTextColor={theme.textMuted}
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
                onPress={changerMotDePasse} disabled={saving}
              >
                {saving ? <ActivityIndicator color={BLANC} /> : <Text style={styles.btnTxt}>🔒 Changer le mot de passe</Text>}
              </TouchableOpacity>
            </>
          )}

          {activeTab === 'apparence' && (
            <>
              <Text style={[styles.sectionTitre, { color: theme.text }]}>🎨 Apparence</Text>

              {/* TOGGLE MODE SOMBRE */}
              <View style={[styles.themeRow, { backgroundColor: theme.input, borderColor: theme.inputBorder }]}>
                <Text style={{ fontSize: 32 }}>{isDark ? '🌙' : '☀️'}</Text>
                <View style={{ flex: 1, marginLeft: 14 }}>
                  <Text style={[styles.themeLabel, { color: theme.text }]}>
                    {isDark ? 'Mode Sombre' : 'Mode Clair'}
                  </Text>
                  <Text style={[styles.themeSub, { color: theme.textSub }]}>
                    {isDark ? 'Interface sombre activée' : 'Interface claire activée'}
                  </Text>
                </View>
                <TouchableOpacity
                  style={[styles.toggleBtn, { backgroundColor: isDark ? VERT : '#E2E8F0' }]}
                  onPress={handleToggle}
                  activeOpacity={0.8}
                >
                  <Animated.View style={[styles.toggleCircle, { transform: [{ translateX: toggleX }] }]}>
                    <Text style={{ fontSize: 11 }}>{isDark ? '🌙' : '☀️'}</Text>
                  </Animated.View>
                </TouchableOpacity>
              </View>

              {/* PRÉVISUALISATION */}
              <View style={[styles.previewBox, { backgroundColor: isDark ? '#0F172A' : '#F8FAFC', borderColor: theme.cardBorder }]}>
                <Text style={[styles.previewTxt, { color: theme.text }]}>Aperçu du thème</Text>
                <Text style={[styles.previewSub, { color: theme.textSub }]}>Voici comment l'appli apparaîtra</Text>
                <View style={[styles.previewCard, { backgroundColor: isDark ? '#1E293B' : '#FFFFFF' }]}>
                  <Text style={[{ color: theme.text, fontWeight: '700' }]}>MyCESA</Text>
                  <Text style={[{ color: theme.textSub, fontSize: 12 }]}>GROUPE COFE-CESA</Text>
                </View>
              </View>
            </>
          )}
        </View>

        {/* FOOTER */}
        <View style={styles.footer}>
          <Text style={[styles.footerTxt, { color: theme.textSub }]}>GROUPE COFE-CESA © {new Date().getFullYear()}</Text>
          <Text style={[styles.footerSub, { color: theme.textMuted }]}>Une excellence à votre service !</Text>
        </View>

      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: { flex: 1 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },

  hero: {
    backgroundColor: VERT,
    paddingTop: Platform.OS === 'ios' ? 60 : (StatusBar.currentHeight || 24) + 20,
    paddingBottom: 70, paddingHorizontal: 20, overflow: 'hidden', alignItems: 'center',
  },
  decoCircle1: {
    position: 'absolute', width: 200, height: 200, borderRadius: 100,
    backgroundColor: 'rgba(255,255,255,0.07)', top: -60, right: -40,
  },
  decoCircle2: {
    position: 'absolute', width: 140, height: 140, borderRadius: 70,
    backgroundColor: 'rgba(255,255,255,0.05)', bottom: -30, left: -30,
  },
  backBtn: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 60 : (StatusBar.currentHeight || 24) + 10,
    left: 16,
  },
  backTxt: { color: BLANC, fontSize: 32, fontWeight: '300' },
  heroTitle: { color: BLANC, fontSize: 20, fontWeight: '800', letterSpacing: 1 },

  profileCard: {
    marginHorizontal: 20, marginTop: -44,
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
  avatarImg: { width: 90, height: 90, borderRadius: 45, borderWidth: 4, borderColor: BLANC },
  avatarBadge: {
    position: 'absolute', bottom: 0, right: 0,
    backgroundColor: ORANGE, width: 30, height: 30,
    borderRadius: 15, justifyContent: 'center', alignItems: 'center',
    borderWidth: 2, borderColor: BLANC,
  },
  avatarBadgeTxt: { fontSize: 14 },
  profileNom: { fontSize: 22, fontWeight: '900' },
  profileRoleBadge: {
    backgroundColor: '#E8F5E9', paddingHorizontal: 14, paddingVertical: 5,
    borderRadius: 20, marginTop: 6, marginBottom: 4,
    borderWidth: 1, borderColor: VERT + '40',
  },
  profileRoleTxt: { color: VERT, fontSize: 13, fontWeight: '700' },
  profileEmail: { fontSize: 13, marginBottom: 16 },
  infoGrid: { flexDirection: 'row', width: '100%', borderTopWidth: 1, paddingTop: 16 },
  infoItem: { flex: 1, alignItems: 'center' },
  infoVal: { fontSize: 14, fontWeight: '800' },
  infoLabel: { fontSize: 11, marginTop: 3, textTransform: 'uppercase', letterSpacing: 0.5 },
  infoDivider: { width: 1 },

  tabs: {
    flexDirection: 'row', marginHorizontal: 20, marginTop: 16,
    borderRadius: 16, padding: 4,
  },
  tab: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 12, borderRadius: 12, gap: 4 },
  tabIcon: { fontSize: 14 },
  tabTxt: { fontSize: 12, fontWeight: '600', color: '#64748B' },

  contentCard: {
    marginHorizontal: 20, marginTop: 12,
    borderRadius: 24, padding: 22, elevation: 4,
    shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.08,
  },
  sectionTitre: { fontSize: 16, fontWeight: '900', marginBottom: 20 },

  label: { fontSize: 11, fontWeight: '700', marginBottom: 6, marginTop: 14, textTransform: 'uppercase', letterSpacing: 0.5 },
  inputWrapper: {
    flexDirection: 'row', alignItems: 'center',
    borderWidth: 1.5, borderRadius: 14, paddingHorizontal: 14,
  },
  inputDisabled: {},
  inputIcon: { fontSize: 18, marginRight: 10 },
  input: { flex: 1, fontSize: 15, paddingVertical: 13 },
  inputDisabledTxt: { flex: 1, fontSize: 15, paddingVertical: 13 },
  eyeBtn: { fontSize: 18, padding: 4 },
  errorTxt: { fontSize: 12, color: '#EF4444', marginTop: 4 },

  strengthBox: { marginTop: 8, marginBottom: 4 },
  strengthBg: { height: 6, borderRadius: 6, overflow: 'hidden' },
  strengthFill: { height: '100%', borderRadius: 6 },
  strengthRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 4 },
  strengthLbl: { fontSize: 12, fontWeight: '700' },
  strengthCount: { fontSize: 12 },

  tipCard: { borderRadius: 12, padding: 12, marginBottom: 8, borderLeftWidth: 3, borderLeftColor: VERT },
  tipTxt: { fontSize: 12, lineHeight: 18 },

  btn: {
    backgroundColor: VERT, borderRadius: 16, padding: 17,
    alignItems: 'center', marginTop: 22,
    shadowColor: VERT, shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35, shadowRadius: 12, elevation: 6,
  },
  btnOrange: { backgroundColor: ORANGE, shadowColor: ORANGE },
  btnDisabled: { opacity: 0.5, shadowOpacity: 0, elevation: 0 },
  btnTxt: { color: BLANC, fontSize: 15, fontWeight: '800' },

  footer: { alignItems: 'center', padding: 24 },
  footerTxt: { fontSize: 12, fontWeight: '600' },
  footerSub: { fontSize: 11, marginTop: 3, fontStyle: 'italic' },

  // THÈME
  themeRow: {
    flexDirection: 'row', alignItems: 'center',
    borderWidth: 1.5, borderRadius: 16, padding: 16, marginBottom: 16,
  },
  themeLabel: { fontSize: 15, fontWeight: '700' },
  themeSub: { fontSize: 12, marginTop: 2 },
  toggleBtn: {
    width: 52, height: 30, borderRadius: 15,
    justifyContent: 'center', padding: 2,
  },
  toggleCircle: {
    width: 26, height: 26, borderRadius: 13,
    backgroundColor: '#fff',
    justifyContent: 'center', alignItems: 'center',
    elevation: 2,
  },
  previewBox: {
    borderWidth: 1.5, borderRadius: 16, padding: 16,
  },
  previewTxt: { fontSize: 14, fontWeight: '700', marginBottom: 4 },
  previewSub: { fontSize: 12, marginBottom: 12 },
  previewCard: {
    borderRadius: 12, padding: 12,
    alignItems: 'center', elevation: 2,
  },
});