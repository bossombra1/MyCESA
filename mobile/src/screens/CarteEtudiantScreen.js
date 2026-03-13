import React, { useEffect, useState, useRef } from 'react';
import {
  View, Text, StyleSheet, ScrollView, ActivityIndicator,
  Image, StatusBar, Dimensions, TouchableOpacity, Animated
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import API, { SERVER_URL } from '../api/api';

const VERT   = '#2E7D32';
const ORANGE = '#D84315';
const BLANC  = '#FFFFFF';
const { width } = Dimensions.get('window');

export default function CarteEtudiantScreen() {
  const [user, setUser] = useState(null);
  const [etudiant, setEtudiant] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isFlipped, setIsFlipped] = useState(false);
  const flipAnim = useRef(new Animated.Value(0)).current;
  const insets = useSafeAreaInsets();
  const anneeAcad = '2025 - 2026';

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
    } catch (e) { console.log('Erreur carte:', e); }
    finally { setLoading(false); }
  };

  const flipCarte = () => {
    if (isFlipped) {
      Animated.spring(flipAnim, {
        toValue: 0,
        friction: 8,
        tension: 10,
        useNativeDriver: true,
      }).start();
    } else {
      Animated.spring(flipAnim, {
        toValue: 180,
        friction: 8,
        tension: 10,
        useNativeDriver: true,
      }).start();
    }
    setIsFlipped(!isFlipped);
  };

  // Interpolations pour la rotation
  const frontRotate = flipAnim.interpolate({
    inputRange: [0, 180],
    outputRange: ['0deg', '180deg'],
  });
  const backRotate = flipAnim.interpolate({
    inputRange: [0, 180],
    outputRange: ['180deg', '360deg'],
  });

  // Opacité pour cacher la face invisible
  const frontOpacity = flipAnim.interpolate({
    inputRange: [89, 90],
    outputRange: [1, 0],
  });
  const backOpacity = flipAnim.interpolate({
    inputRange: [89, 90],
    outputRange: [0, 1],
  });

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
        contentContainerStyle={{ paddingBottom: insets.bottom + 32 }}
      >

        {/* HERO */}
        <View style={styles.hero}>
          <View style={styles.decoCircle1} />
          <View style={styles.decoCircle2} />
          <Text style={styles.heroTitre}>🪪 Carte Scolaire</Text>
          <Text style={styles.heroSub}>Année académique {anneeAcad}</Text>
        </View>

        {/* INSTRUCTION */}
        <TouchableOpacity style={styles.flipHint} onPress={flipCarte} activeOpacity={0.8}>
          <Text style={styles.flipHintTxt}>
            {isFlipped ? '↩️ Voir le recto' : '🔄 Appuyez pour retourner la carte'}
          </Text>
        </TouchableOpacity>

        {/* CARTE ANIMÉE */}
        <View style={styles.carteContainer}>

          {/* RECTO */}
          <Animated.View style={[
            styles.carteAnimee,
            {
              transform: [{ perspective: 1200 }, { rotateY: frontRotate }],
              opacity: frontOpacity,
            }
          ]}>
            {/* HEADER */}
            <View style={styles.cardHeader}>
              <View style={styles.logoWrapper}>
                <Image
                  source={require('../../assets/logo cesa.jpg')}
                  style={styles.logoImg}
                  resizeMode="contain"
                />
              </View>
              <View style={styles.headerCenter}>
                <Text style={styles.schoolName}>GROUPE COFE-CESA</Text>
                <Text style={styles.schoolSub}>CESA ABIDJAN</Text>
                <Text style={styles.schoolSlogan}>« Une excellence à votre service ! »</Text>
              </View>
              <Text style={styles.ciFlag}>🇨🇮</Text>
            </View>

            {/* BANDE TITRE */}
            <View style={styles.titreBande}>
              <Text style={styles.titreBandeTxt}>CARTE D'ÉTUDIANT</Text>
              <Text style={styles.titreBandeAnnee}>{anneeAcad}</Text>
            </View>

            {/* CORPS */}
            <View style={styles.cardBody}>
              <View style={styles.photoBox}>
                {etudiant?.Image_Etudiant ? (
                  <Image
                    source={{ uri: `${SERVER_URL}${etudiant.Image_Etudiant}` }}
                    style={styles.avatarPhoto}
                  />
                ) : (
                  <View style={styles.avatar}>
                    <Text style={styles.avatarTxt}>{initiale}</Text>
                  </View>
                )}
                <View style={styles.matriculeBadge}>
                  <Text style={styles.matriculeTxt}>
                    {etudiant?.Matricule_Etudiant || 'N/A'}
                  </Text>
                </View>
                <View style={styles.validBadge}>
                  <Text style={styles.validTxt}>✓ VALIDE</Text>
                </View>
              </View>

              <View style={styles.infosBox}>
                <Text style={styles.etudiantNom}>
                  {etudiant?.Nom_Etudiant?.toUpperCase() || user?.Nom_User?.toUpperCase()}
                </Text>
                <Text style={styles.etudiantPrenom}>
                  {etudiant?.Prenoms_Etudiant || ''}
                </Text>
                {[
                  { label: 'Classe',  val: etudiant?.Nom_Classe },
                  { label: 'Filière', val: etudiant?.Nom_Filiere },
                  { label: 'Cycle',   val: etudiant?.Lib_Cycle },
                  { label: 'Genre',   val: etudiant?.Genre_Etudiant === 'M' ? 'Masculin' : etudiant?.Genre_Etudiant === 'F' ? 'Féminin' : null },
                  { label: 'Né(e) le', val: etudiant?.Date_Naissance_Etudiant ? new Date(etudiant.Date_Naissance_Etudiant).toLocaleDateString('fr-FR') : null },
                  { label: 'À',       val: etudiant?.Lieu_Naissance_Etudiant },
                ].map((row, i) => row.val ? (
                  <View key={i} style={styles.infoRow}>
                    <Text style={styles.infoLabel}>{row.label} :</Text>
                    <Text style={styles.infoVal}>{row.val}</Text>
                  </View>
                ) : null)}
              </View>
            </View>

            {/* FOOTER */}
            <View style={styles.cardFooter}>
              <View>
                <Text style={styles.footerTxt}>📍 Koumassi Nord-Est, Abidjan</Text>
                <Text style={styles.footerTxt}>📞 (+225) 27 21 56 31 74</Text>
              </View>
              <Image
                source={require('../../assets/logo cesa.jpg')}
                style={styles.footerLogo}
                resizeMode="contain"
              />
            </View>

            <View style={styles.bottomBande}>
              <Text style={styles.bottomBandeTxt}>
                Propriété du GROUPE COFE-CESA • cesa-elearning.com
              </Text>
            </View>
          </Animated.View>

          {/* VERSO */}
          <Animated.View style={[
            styles.carteAnimee,
            styles.carteVerso,
            {
              transform: [{ perspective: 1200 }, { rotateY: backRotate }],
              opacity: backOpacity,
            }
          ]}>
            <View style={styles.versoHeader}>
              <Image
                source={require('../../assets/logo cesa.jpg')}
                style={styles.versoLogo}
                resizeMode="contain"
              />
              <Text style={styles.versoTitre}>INFORMATIONS COMPLÉMENTAIRES</Text>
            </View>

            <View style={styles.versoBody}>
              {[
                { icon: '📧', label: 'Email',    val: etudiant?.Email_Etudiant || user?.Email_User },
                { icon: '📱', label: 'Contact',  val: etudiant?.Tel_Etudiant },
                { icon: '🏠', label: 'Quartier', val: etudiant?.Quartier_Etudiant },
                { icon: '🎓', label: 'Cycle',    val: etudiant?.Lib_Cycle },
              ].map((row, i, arr) => (
                <View key={i}>
                  <View style={styles.versoRow}>
                    <Text style={styles.versoIcon}>{row.icon}</Text>
                    <View>
                      <Text style={styles.versoLabel}>{row.label}</Text>
                      <Text style={styles.versoVal}>{row.val || 'N/A'}</Text>
                    </View>
                  </View>
                  {i < arr.length - 1 && <View style={styles.separator} />}
                </View>
              ))}
            </View>

            <View style={styles.avertBox}>
              <Text style={styles.avertTxt}>
                ⚠️ En cas de perte, contactez immédiatement le service de scolarité.
                Cette carte est strictement personnelle et non transférable.
              </Text>
            </View>

            <View style={styles.versoFooter}>
              <Text style={styles.versoFooterTxt}>GROUPE COFE-CESA © {new Date().getFullYear()}</Text>
              <Text style={styles.versoFooterTxt}>cesa-elearning.com</Text>
            </View>
          </Animated.View>

        </View>

        {/* BOUTON RETOURNER */}
        <TouchableOpacity style={styles.flipBtn} onPress={flipCarte} activeOpacity={0.85}>
          <Text style={styles.flipBtnTxt}>
            {isFlipped ? '↩️  Voir le recto' : '🔄  Retourner la carte'}
          </Text>
        </TouchableOpacity>

      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: { flex: 1, backgroundColor: '#F5F7F5' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },

  hero: {
    backgroundColor: VERT, paddingTop: 20, paddingBottom: 32,
    paddingHorizontal: 20, alignItems: 'center',
    borderBottomLeftRadius: 32, borderBottomRightRadius: 32, overflow: 'hidden',
  },
  decoCircle1: {
    position: 'absolute', width: 180, height: 180, borderRadius: 90,
    backgroundColor: 'rgba(255,255,255,0.08)', top: -50, right: -30,
  },
  decoCircle2: {
    position: 'absolute', width: 120, height: 120, borderRadius: 60,
    backgroundColor: 'rgba(255,255,255,0.05)', bottom: -20, left: -20,
  },
  heroTitre: { color: BLANC, fontSize: 24, fontWeight: '900' },
  heroSub: { color: 'rgba(255,255,255,0.7)', fontSize: 14, marginTop: 4 },

  // HINT
  flipHint: {
    alignSelf: 'center', marginTop: 16, marginBottom: 4,
    backgroundColor: '#E8F5E9', paddingHorizontal: 18,
    paddingVertical: 8, borderRadius: 20,
    borderWidth: 1.5, borderColor: VERT + '60',
  },
  flipHintTxt: { color: VERT, fontSize: 13, fontWeight: '700' },

  // CARTE ANIMÉE
  carteContainer: {
    marginHorizontal: 16, marginTop: 12,
    height: 320,
  },
  carteAnimee: {
    position: 'absolute', width: '100%',
    borderRadius: 20, overflow: 'hidden',
    backgroundColor: BLANC,
    backfaceVisibility: 'hidden',
    shadowColor: '#000', shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.18, shadowRadius: 16, elevation: 12,
  },
  carteVerso: { backgroundColor: BLANC },

  // HEADER CARTE
  cardHeader: {
    backgroundColor: VERT, flexDirection: 'row',
    alignItems: 'center', padding: 12, paddingHorizontal: 14, gap: 10,
  },
  logoWrapper: {
    width: 48, height: 48, borderRadius: 10, backgroundColor: BLANC,
    overflow: 'hidden', justifyContent: 'center', alignItems: 'center',
    borderWidth: 2, borderColor: ORANGE,
  },
  logoImg: { width: 44, height: 44 },
  headerCenter: { flex: 1 },
  schoolName: { color: BLANC, fontSize: 12, fontWeight: '900', letterSpacing: 0.5 },
  schoolSub: { color: ORANGE, fontSize: 11, fontWeight: '700', marginTop: 1 },
  schoolSlogan: { color: 'rgba(255,255,255,0.75)', fontSize: 8, fontStyle: 'italic', marginTop: 1 },
  ciFlag: { fontSize: 24 },

  // BANDE TITRE
  titreBande: {
    backgroundColor: ORANGE, flexDirection: 'row',
    justifyContent: 'space-between', paddingHorizontal: 14, paddingVertical: 5,
  },
  titreBandeTxt: { color: BLANC, fontSize: 12, fontWeight: '900', letterSpacing: 1 },
  titreBandeAnnee: { color: BLANC, fontSize: 10, fontWeight: '700' },

  // CORPS
  cardBody: { flexDirection: 'row', padding: 12, gap: 12, backgroundColor: '#FAFBFF' },
  photoBox: { alignItems: 'center', gap: 5 },
  avatar: {
    width: 72, height: 72, borderRadius: 10, backgroundColor: VERT,
    justifyContent: 'center', alignItems: 'center',
    borderWidth: 2.5, borderColor: ORANGE,
  },
  avatarTxt: { color: BLANC, fontSize: 28, fontWeight: '900' },
  avatarPhoto: {
    width: 82, height: 82, borderRadius: 12,
    borderWidth: 2.5, borderColor: ORANGE,
  },
  matriculeBadge: {
    backgroundColor: VERT, borderRadius: 6,
    paddingHorizontal: 6, paddingVertical: 3, maxWidth: 85,
  },
  matriculeTxt: { color: ORANGE, fontSize: 8, fontWeight: '900', textAlign: 'center' },
  validBadge: {
    backgroundColor: ORANGE, borderRadius: 6,
    paddingHorizontal: 7, paddingVertical: 2,
  },
  validTxt: { color: BLANC, fontSize: 8, fontWeight: '900' },
  infosBox: { flex: 1 },
  etudiantNom: { fontSize: 14, fontWeight: '900', color: VERT, letterSpacing: 0.5 },
  etudiantPrenom: { fontSize: 12, fontWeight: '600', color: '#1E293B', marginBottom: 6 },
  infoRow: { flexDirection: 'row', marginTop: 2, flexWrap: 'wrap' },
  infoLabel: { fontSize: 10, color: '#64748B', fontWeight: '700', width: 58 },
  infoVal: { fontSize: 10, color: '#1E293B', fontWeight: '600', flex: 1 },

  // FOOTER
  cardFooter: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingHorizontal: 14, paddingVertical: 8,
    backgroundColor: '#F0FDF4', borderTopWidth: 1, borderTopColor: '#D1FAE5',
  },
  footerTxt: { fontSize: 9, color: VERT, fontWeight: '600', marginTop: 1 },
  footerLogo: { width: 34, height: 34, borderRadius: 6 },
  bottomBande: { backgroundColor: VERT, padding: 5, alignItems: 'center' },
  bottomBandeTxt: { color: 'rgba(255,255,255,0.65)', fontSize: 8 },

  // VERSO
  versoHeader: {
    backgroundColor: VERT, padding: 12,
    flexDirection: 'row', alignItems: 'center', gap: 12,
  },
  versoLogo: { width: 34, height: 34, borderRadius: 6, backgroundColor: BLANC },
  versoTitre: { color: ORANGE, fontSize: 11, fontWeight: '900', letterSpacing: 0.5, flex: 1 },
  versoBody: { padding: 14 },
  versoRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 6 },
  versoIcon: { fontSize: 18, marginRight: 12 },
  versoLabel: { fontSize: 10, color: '#64748B', fontWeight: '700' },
  versoVal: { fontSize: 12, color: '#1E293B', fontWeight: '600', marginTop: 1 },
  separator: { height: 1, backgroundColor: '#F1F5F9' },
  avertBox: {
    margin: 12, marginTop: 4, backgroundColor: '#FFF7ED',
    borderRadius: 10, padding: 10, borderLeftWidth: 3, borderLeftColor: ORANGE,
  },
  avertTxt: { fontSize: 10, color: '#92400E', lineHeight: 14 },
  versoFooter: {
    backgroundColor: VERT, padding: 8,
    flexDirection: 'row', justifyContent: 'space-between',
  },
  versoFooterTxt: { color: 'rgba(255,255,255,0.6)', fontSize: 9 },

  // BOUTON FLIP
  flipBtn: {
    alignSelf: 'center', marginTop: 340,
    backgroundColor: VERT, paddingHorizontal: 28,
    paddingVertical: 14, borderRadius: 28,
    shadowColor: VERT, shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35, shadowRadius: 12, elevation: 8,
  },
  flipBtnTxt: { color: BLANC, fontSize: 15, fontWeight: '800' },
});