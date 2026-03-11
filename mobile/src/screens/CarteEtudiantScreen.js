import React, { useEffect, useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView,
  ActivityIndicator, Dimensions
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import API from '../api/api';

const { width } = Dimensions.get('window');
const CARD_WIDTH = width - 32;

export default function CarteEtudiantScreen() {
  const [user, setUser] = useState(null);
  const [etudiant, setEtudiant] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => { loadData(); }, []);

  const loadData = async () => {
    try {
      const stored = await AsyncStorage.getItem('user');
      if (stored) {
        const u = JSON.parse(stored);
        setUser(u);
        const res = await API.get(`/etudiants/profil/${u.Id_UTILISATEUR}`);
        setEtudiant(res.data);
      }
    } catch (e) {
      console.log('Erreur carte:', e);
    } finally {
      setLoading(false);
    }
  };

  const initiale = user?.Nom_User?.charAt(0)?.toUpperCase() || 'E';
  const anneeAcad = '2025 - 2026';

  if (loading) return (
    <View style={styles.center}>
      <ActivityIndicator size="large" color="#1B3A6B" />
    </View>
  );

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <View style={styles.pageTitre}>
        <Text style={styles.pageTitreTxt}>🪪 Ma Carte Scolaire</Text>
        <Text style={styles.pageTitreSub}>Année académique {anneeAcad}</Text>
      </View>

      {/* ─── CARTE RECTO ─── */}
      <View style={styles.card}>

        {/* HEADER CARTE */}
        <View style={styles.cardHeader}>
          <View style={styles.headerLeft}>
            {/* Logo simulé */}
            <View style={styles.logoBox}>
              <Text style={styles.logoTxt}>CESA</Text>
            </View>
          </View>
          <View style={styles.headerCenter}>
            <Text style={styles.schoolName}>GROUPE COFE-CESA</Text>
            <Text style={styles.schoolSub}>CESA ABIDJAN</Text>
            <Text style={styles.schoolSlogan}>Une excellence à votre service !</Text>
          </View>
          <View style={styles.headerRight}>
            <Text style={styles.ciFlag}>🇨🇮</Text>
          </View>
        </View>

        {/* BANDE TITRE */}
        <View style={styles.titreBande}>
          <Text style={styles.titreBandeTxt}>CARTE D'ÉTUDIANT</Text>
          <Text style={styles.titreBandeAnnee}>{anneeAcad}</Text>
        </View>

        {/* CORPS CARTE */}
        <View style={styles.cardBody}>

          {/* PHOTO / AVATAR */}
          <View style={styles.photoBox}>
            <View style={styles.avatar}>
              <Text style={styles.avatarTxt}>{initiale}</Text>
            </View>
            <View style={styles.matriculeBadge}>
              <Text style={styles.matriculeTxt}>
                {etudiant?.Matricule_Etudiant || 'N/A'}
              </Text>
            </View>
          </View>

          {/* INFOS */}
          <View style={styles.infosBox}>
            <Text style={styles.etudiantNom}>
              {etudiant?.Nom_Etudiant?.toUpperCase() || user?.Nom_User?.toUpperCase()}
            </Text>
            <Text style={styles.etudiantPrenom}>
              {etudiant?.Prenoms_Etudiant || ''}
            </Text>

            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Classe :</Text>
              <Text style={styles.infoVal}>{etudiant?.Nom_Classe || 'N/A'}</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Filière :</Text>
              <Text style={styles.infoVal}>{etudiant?.Nom_Filiere || 'N/A'}</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Genre :</Text>
              <Text style={styles.infoVal}>
                {etudiant?.Genre_Etudiant === 'M' ? 'Masculin' : etudiant?.Genre_Etudiant === 'F' ? 'Féminin' : 'N/A'}
              </Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Né(e) le :</Text>
              <Text style={styles.infoVal}>
                {etudiant?.Date_Naissance_Etudiant
                  ? new Date(etudiant.Date_Naissance_Etudiant).toLocaleDateString('fr-FR')
                  : 'N/A'}
              </Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>À :</Text>
              <Text style={styles.infoVal}>{etudiant?.Lieu_Naissance_Etudiant || 'N/A'}</Text>
            </View>
          </View>
        </View>

        {/* FOOTER CARTE */}
        <View style={styles.cardFooter}>
          <View style={styles.footerLeft}>
            <Text style={styles.footerTxt}>📍 Koumassi Nord-Est, Abidjan</Text>
            <Text style={styles.footerTxt}>📞 (+225) 27 21 56 31 74</Text>
          </View>
          <View style={styles.footerRight}>
            <View style={styles.validBadge}>
              <Text style={styles.validTxt}>✓ VALIDE</Text>
              <Text style={styles.validAnnee}>{anneeAcad}</Text>
            </View>
          </View>
        </View>

        {/* BANDE BAS */}
        <View style={styles.bottomBande}>
          <Text style={styles.bottomBandeTxt}>
            Cette carte est la propriété du GROUPE COFE-CESA • www.cesa-elearning.com
          </Text>
        </View>
      </View>

      {/* ─── CARTE VERSO ─── */}
      <View style={[styles.card, styles.cardVerso]}>
        <View style={styles.versoHeader}>
          <Text style={styles.versoTitre}>INFORMATIONS COMPLÉMENTAIRES</Text>
        </View>

        <View style={styles.versoBody}>
          <View style={styles.versoRow}>
            <Text style={styles.versoIcon}>📧</Text>
            <View>
              <Text style={styles.versoLabel}>Email</Text>
              <Text style={styles.versoVal}>{etudiant?.Email_Etudiant || user?.Email_User || 'N/A'}</Text>
            </View>
          </View>
          <View style={styles.separator} />

          <View style={styles.versoRow}>
            <Text style={styles.versoIcon}>📱</Text>
            <View>
              <Text style={styles.versoLabel}>Contact</Text>
              <Text style={styles.versoVal}>{etudiant?.Tel_Etudiant || 'N/A'}</Text>
            </View>
          </View>
          <View style={styles.separator} />

          <View style={styles.versoRow}>
            <Text style={styles.versoIcon}>🏠</Text>
            <View>
              <Text style={styles.versoLabel}>Quartier</Text>
              <Text style={styles.versoVal}>{etudiant?.Quartier_Etudiant || 'N/A'}</Text>
            </View>
          </View>
          <View style={styles.separator} />

          <View style={styles.versoRow}>
            <Text style={styles.versoIcon}>🎓</Text>
            <View>
              <Text style={styles.versoLabel}>Cycle</Text>
              <Text style={styles.versoVal}>{etudiant?.Lib_Cycle || 'N/A'}</Text>
            </View>
          </View>
        </View>

        {/* AVERTISSEMENT */}
        <View style={styles.avertBox}>
          <Text style={styles.avertTxt}>
            ⚠️ En cas de perte, veuillez contacter immédiatement le service de scolarité.
            Cette carte est strictement personnelle et non transférable.
          </Text>
        </View>

        <View style={styles.versoFooter}>
          <Text style={styles.versoFooterTxt}>GROUPE COFE-CESA © {new Date().getFullYear()}</Text>
          <Text style={styles.versoFooterTxt}>cesa-elearning.com</Text>
        </View>
      </View>

      <View style={{ height: 40 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F0F4FF' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },

  pageTitre: {
    padding: 20, paddingBottom: 12,
    backgroundColor: '#1B3A6B',
    alignItems: 'center',
  },
  pageTitreTxt: { color: '#fff', fontSize: 20, fontWeight: '800' },
  pageTitreSub: { color: '#93C5FD', fontSize: 13, marginTop: 4 },

  // CARTE
  card: {
    margin: 16, borderRadius: 20, overflow: 'hidden',
    backgroundColor: '#fff',
    shadowColor: '#000', shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.15, shadowRadius: 12, elevation: 10,
  },
  cardVerso: { marginTop: 0 },

  // HEADER
  cardHeader: {
    backgroundColor: '#1B3A6B',
    flexDirection: 'row', alignItems: 'center',
    padding: 14, paddingHorizontal: 16,
  },
  headerLeft: { marginRight: 12 },
  logoBox: {
    width: 48, height: 48, borderRadius: 10,
    backgroundColor: '#D4A017',
    justifyContent: 'center', alignItems: 'center',
    borderWidth: 2, borderColor: '#fff',
  },
  logoTxt: { color: '#fff', fontSize: 13, fontWeight: '900' },
  headerCenter: { flex: 1 },
  schoolName: { color: '#fff', fontSize: 14, fontWeight: '900', letterSpacing: 0.5 },
  schoolSub: { color: '#D4A017', fontSize: 12, fontWeight: '700', marginTop: 2 },
  schoolSlogan: { color: 'rgba(255,255,255,0.7)', fontSize: 10, fontStyle: 'italic', marginTop: 2 },
  headerRight: {},
  ciFlag: { fontSize: 28 },

  // BANDE TITRE
  titreBande: {
    backgroundColor: '#D4A017',
    flexDirection: 'row', justifyContent: 'space-between',
    paddingHorizontal: 16, paddingVertical: 7,
    alignItems: 'center',
  },
  titreBandeTxt: { color: '#fff', fontSize: 14, fontWeight: '900', letterSpacing: 1 },
  titreBandeAnnee: { color: '#fff', fontSize: 12, fontWeight: '700' },

  // CORPS
  cardBody: {
    flexDirection: 'row', padding: 16, gap: 16,
    backgroundColor: '#FAFBFF',
  },
  photoBox: { alignItems: 'center' },
  avatar: {
    width: 80, height: 80, borderRadius: 12,
    backgroundColor: '#1B3A6B',
    justifyContent: 'center', alignItems: 'center',
    borderWidth: 3, borderColor: '#D4A017',
  },
  avatarTxt: { color: '#fff', fontSize: 32, fontWeight: '900' },
  matriculeBadge: {
    backgroundColor: '#1B3A6B', borderRadius: 8,
    paddingHorizontal: 8, paddingVertical: 4, marginTop: 8,
    maxWidth: 90,
  },
  matriculeTxt: { color: '#D4A017', fontSize: 10, fontWeight: '800', textAlign: 'center' },

  infosBox: { flex: 1, justifyContent: 'center' },
  etudiantNom: { fontSize: 17, fontWeight: '900', color: '#1B3A6B', letterSpacing: 0.5 },
  etudiantPrenom: { fontSize: 14, fontWeight: '600', color: '#1B3A6B', marginBottom: 8 },
  infoRow: { flexDirection: 'row', marginTop: 3, flexWrap: 'wrap' },
  infoLabel: { fontSize: 12, color: '#64748B', fontWeight: '700', width: 65 },
  infoVal: { fontSize: 12, color: '#1B2A4A', fontWeight: '600', flex: 1 },

  // FOOTER
  cardFooter: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingHorizontal: 16, paddingVertical: 10,
    backgroundColor: '#EFF6FF',
    borderTopWidth: 1, borderTopColor: '#DBEAFE',
  },
  footerLeft: {},
  footerTxt: { fontSize: 10, color: '#1B3A6B', fontWeight: '600', marginTop: 2 },
  footerRight: {},
  validBadge: {
    backgroundColor: '#1B3A6B', borderRadius: 10,
    paddingHorizontal: 12, paddingVertical: 6, alignItems: 'center',
    borderWidth: 2, borderColor: '#D4A017',
  },
  validTxt: { color: '#D4A017', fontSize: 12, fontWeight: '900' },
  validAnnee: { color: '#fff', fontSize: 10, fontWeight: '700', marginTop: 2 },

  // BANDE BAS
  bottomBande: {
    backgroundColor: '#1B3A6B', padding: 6, alignItems: 'center',
  },
  bottomBandeTxt: { color: 'rgba(255,255,255,0.6)', fontSize: 9 },

  // VERSO
  versoHeader: {
    backgroundColor: '#1B3A6B', padding: 12, alignItems: 'center',
  },
  versoTitre: { color: '#D4A017', fontSize: 13, fontWeight: '900', letterSpacing: 1 },
  versoBody: { padding: 16 },
  versoRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 8 },
  versoIcon: { fontSize: 22, marginRight: 14 },
  versoLabel: { fontSize: 11, color: '#64748B', fontWeight: '700' },
  versoVal: { fontSize: 14, color: '#1B2A4A', fontWeight: '600', marginTop: 2 },
  separator: { height: 1, backgroundColor: '#F1F5F9' },
  avertBox: {
    margin: 16, marginTop: 4, backgroundColor: '#FFF7ED',
    borderRadius: 12, padding: 12,
    borderLeftWidth: 4, borderLeftColor: '#D4A017',
  },
  avertTxt: { fontSize: 11, color: '#92400E', lineHeight: 16 },
  versoFooter: {
    backgroundColor: '#1B3A6B', padding: 10,
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
  },
  versoFooterTxt: { color: 'rgba(255,255,255,0.6)', fontSize: 10 },
});