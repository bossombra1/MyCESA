import React, { useEffect, useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  TextInput, Alert, Platform, ActivityIndicator
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import API from '../api/api';

export default function ProfilScreen({ navigation }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState('infos'); // 'infos' ou 'password'

  // Infos
  const [nom, setNom] = useState('');
  const [email, setEmail] = useState('');

  // Mot de passe
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
      }
    } catch (e) {}
    finally { setLoading(false); }
  };

  const showAlert = (titre, message) => {
    if (Platform.OS === 'web') {
      window.alert(`${titre}: ${message}`);
    } else {
      Alert.alert(titre, message);
    }
  };

  const sauvegarderInfos = async () => {
    if (!nom.trim()) return showAlert('Erreur', 'Le nom ne peut pas être vide');
    if (!email.trim()) return showAlert('Erreur', "L'email ne peut pas être vide");

    setSaving(true);
    try {
      await API.put(`/auth/profil/${user.Id_UTILISATEUR}`, {
        Nom_User: nom,
        Email_User: email,
      });

      // Mettre à jour AsyncStorage
      const updatedUser = { ...user, Nom_User: nom, Email_User: email };
      await AsyncStorage.setItem('user', JSON.stringify(updatedUser));
      setUser(updatedUser);

      showAlert('✅ Succès', 'Profil mis à jour avec succès !');
    } catch (err) {
      showAlert('Erreur', err.response?.data?.error || 'Impossible de mettre à jour le profil');
    } finally {
      setSaving(false);
    }
  };

  const changerMotDePasse = async () => {
    if (!ancienMdp || !nouveauMdp || !confirmMdp) {
      return showAlert('Erreur', 'Tous les champs sont requis');
    }
    if (nouveauMdp !== confirmMdp) {
      return showAlert('Erreur', 'Les nouveaux mots de passe ne correspondent pas');
    }
    if (nouveauMdp.length < 6) {
      return showAlert('Erreur', 'Le mot de passe doit contenir au moins 6 caractères');
    }

    setSaving(true);
    try {
      await API.put(`/auth/password/${user.Id_UTILISATEUR}`, {
        ancienPassword: ancienMdp,
        nouveauPassword: nouveauMdp,
      });

      setAncienMdp('');
      setNouveauMdp('');
      setConfirmMdp('');
      showAlert('✅ Succès', 'Mot de passe modifié avec succès !');
    } catch (err) {
      showAlert('Erreur', err.response?.data?.error || 'Mot de passe actuel incorrect');
    } finally {
      setSaving(false);
    }
  };

  const initiale = user?.Nom_User?.charAt(0)?.toUpperCase() || 'E';

  if (loading) return (
    <View style={styles.center}>
      <ActivityIndicator size="large" color="#2563EB" />
    </View>
  );

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>

      {/* HEADER PROFIL */}
      <View style={styles.headerBox}>
        <View style={styles.avatar}>
          <Text style={styles.avatarTxt}>{initiale}</Text>
        </View>
        <Text style={styles.nom}>{user?.Nom_User}</Text>
        <Text style={styles.role}>{user?.Lib_Role}</Text>
        <Text style={styles.emailHeader}>{user?.Email_User}</Text>
      </View>

      {/* TABS */}
      <View style={styles.tabs}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'infos' && styles.tabActive]}
          onPress={() => setActiveTab('infos')}
        >
          <Text style={[styles.tabTxt, activeTab === 'infos' && styles.tabTxtActive]}>
            👤 Mes Infos
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'password' && styles.tabActive]}
          onPress={() => setActiveTab('password')}
        >
          <Text style={[styles.tabTxt, activeTab === 'password' && styles.tabTxtActive]}>
            🔒 Mot de passe
          </Text>
        </TouchableOpacity>
      </View>

      {/* ONGLET INFOS */}
      {activeTab === 'infos' && (
        <View style={styles.card}>
          <Text style={styles.cardTitre}>Informations personnelles</Text>

          <Text style={styles.label}>Nom complet</Text>
          <TextInput
            style={styles.input}
            value={nom}
            onChangeText={setNom}
            placeholder="Votre nom"
            placeholderTextColor="#94A3B8"
          />

          <Text style={styles.label}>Adresse email</Text>
          <TextInput
            style={styles.input}
            value={email}
            onChangeText={setEmail}
            placeholder="Votre email"
            placeholderTextColor="#94A3B8"
            keyboardType="email-address"
            autoCapitalize="none"
          />

          <Text style={styles.label}>Rôle</Text>
          <View style={styles.inputDisabled}>
            <Text style={styles.inputDisabledTxt}>{user?.Lib_Role || 'Étudiant'}</Text>
          </View>

          <TouchableOpacity
            style={[styles.btn, saving && styles.btnDisabled]}
            onPress={sauvegarderInfos}
            disabled={saving}
          >
            {saving
              ? <ActivityIndicator color="#fff" />
              : <Text style={styles.btnTxt}>💾 Sauvegarder</Text>
            }
          </TouchableOpacity>
        </View>
      )}

      {/* ONGLET MOT DE PASSE */}
      {activeTab === 'password' && (
        <View style={styles.card}>
          <Text style={styles.cardTitre}>Changer le mot de passe</Text>

          <Text style={styles.label}>Mot de passe actuel</Text>
          <View style={styles.inputRow}>
            <TextInput
              style={styles.inputFlex}
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
          <View style={styles.inputRow}>
            <TextInput
              style={styles.inputFlex}
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

          <Text style={styles.label}>Confirmer le nouveau mot de passe</Text>
          <View style={styles.inputRow}>
            <TextInput
              style={styles.inputFlex}
              value={confirmMdp}
              onChangeText={setConfirmMdp}
              placeholder="Confirmer mot de passe"
              placeholderTextColor="#94A3B8"
              secureTextEntry={!showConfirm}
            />
            <TouchableOpacity onPress={() => setShowConfirm(!showConfirm)} style={styles.eyeBtn}>
              <Text style={styles.eyeIcon}>{showConfirm ? '🙈' : '👁️'}</Text>
            </TouchableOpacity>
          </View>

          {nouveauMdp.length > 0 && (
            <View style={styles.forceBar}>
              <View style={[
                styles.forceBarFill,
                {
                  width: nouveauMdp.length < 6 ? '30%' : nouveauMdp.length < 10 ? '60%' : '100%',
                  backgroundColor: nouveauMdp.length < 6 ? '#EF4444' : nouveauMdp.length < 10 ? '#F59E0B' : '#10B981'
                }
              ]} />
              <Text style={styles.forceTxt}>
                {nouveauMdp.length < 6 ? 'Faible' : nouveauMdp.length < 10 ? 'Moyen' : 'Fort'}
              </Text>
            </View>
          )}

          <TouchableOpacity
            style={[styles.btn, saving && styles.btnDisabled]}
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
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F0F4FF' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  headerBox: {
    backgroundColor: '#1B2A4A', padding: 32, alignItems: 'center',
    borderBottomLeftRadius: 28, borderBottomRightRadius: 28,
  },
  avatar: {
    width: 88, height: 88, borderRadius: 44, backgroundColor: '#2563EB',
    justifyContent: 'center', alignItems: 'center',
    borderWidth: 4, borderColor: '#60A5FA', marginBottom: 14,
  },
  avatarTxt: { color: '#fff', fontSize: 36, fontWeight: '800' },
  nom: { color: '#fff', fontSize: 22, fontWeight: '800' },
  role: { color: '#60A5FA', fontSize: 14, marginTop: 4 },
  emailHeader: { color: '#94A3B8', fontSize: 13, marginTop: 4 },
  tabs: {
    flexDirection: 'row', margin: 16, backgroundColor: '#E2E8F0',
    borderRadius: 14, padding: 4,
  },
  tab: { flex: 1, paddingVertical: 10, borderRadius: 10, alignItems: 'center' },
  tabActive: { backgroundColor: '#fff', elevation: 3 },
  tabTxt: { fontSize: 14, fontWeight: '600', color: '#64748B' },
  tabTxtActive: { color: '#1B2A4A', fontWeight: '800' },
  card: {
    backgroundColor: '#fff', marginHorizontal: 16, borderRadius: 20,
    padding: 20, elevation: 3,
  },
  cardTitre: { fontSize: 16, fontWeight: '800', color: '#1B2A4A', marginBottom: 20 },
  label: { fontSize: 13, fontWeight: '700', color: '#64748B', marginBottom: 6, marginTop: 12 },
  input: {
    backgroundColor: '#F8FAFC', borderWidth: 1.5, borderColor: '#E2E8F0',
    borderRadius: 12, padding: 14, fontSize: 15, color: '#1B2A4A',
  },
  inputDisabled: {
    backgroundColor: '#F1F5F9', borderWidth: 1.5, borderColor: '#E2E8F0',
    borderRadius: 12, padding: 14,
  },
  inputDisabledTxt: { fontSize: 15, color: '#94A3B8' },
  inputRow: { flexDirection: 'row', alignItems: 'center' },
  inputFlex: {
    flex: 1, backgroundColor: '#F8FAFC', borderWidth: 1.5, borderColor: '#E2E8F0',
    borderRadius: 12, padding: 14, fontSize: 15, color: '#1B2A4A',
  },
  eyeBtn: { padding: 10, marginLeft: 8 },
  eyeIcon: { fontSize: 20 },
  forceBar: { marginTop: 10 },
  forceBarFill: { height: 5, borderRadius: 5, marginBottom: 4 },
  forceTxt: { fontSize: 12, color: '#64748B' },
  btn: {
    backgroundColor: '#2563EB', borderRadius: 14, padding: 16,
    alignItems: 'center', marginTop: 24,
  },
  btnDisabled: { backgroundColor: '#93C5FD' },
  btnTxt: { color: '#fff', fontSize: 16, fontWeight: '800' },
});