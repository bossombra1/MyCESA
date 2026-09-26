import React, { useEffect, useState, useRef } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  Alert, StatusBar, Animated, RefreshControl,
  Image, ActivityIndicator
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../context/ThemeContext';
import API, { SERVER_URL } from '../api/api';
import { getClasseEtudiant } from '../utils/emploiTempsFichiers';

const VERT   = '#2E7D32';
const ORANGE = '#D84315';

// -- Emploi du temps : l'API évolue d'une liste de créneaux vers un fichier
// (image, PDF, Excel, Word) par classe. On lit ici le nouveau format, avec
// repli silencieux si le backend renvoie encore l'ancien tableau de créneaux.
const iconeFichier = (type = '') => {
  const t = type.toLowerCase();
  if (t.includes('pdf')) return '📕';
  if (t.includes('xls') || t.includes('sheet') || t.includes('excel')) return '📊';
  if (t.includes('doc') || t.includes('word')) return '📄';
  if (t.includes('png') || t.includes('jpg') || t.includes('jpeg') || t.includes('image')) return '🖼️';
  return '📁';
};

const libelleType = (type = '') => {
  const t = type.toLowerCase();
  if (t.includes('pdf')) return 'Document PDF';
  if (t.includes('xls') || t.includes('sheet') || t.includes('excel')) return 'Fichier Excel';
  if (t.includes('doc') || t.includes('word')) return 'Document Word';
  if (t.includes('png') || t.includes('jpg') || t.includes('jpeg') || t.includes('image')) return 'Image';
  return 'Fichier';
};

const formatDate = (iso) => {
  if (!iso) return '';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '';
  const jj = String(d.getDate()).padStart(2, '0');
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  return `${jj}/${mm}/${d.getFullYear()}`;
};

export default function HomeScreen({ navigation }) {
  const [user, setUser]             = useState(null);
  const [stats, setStats]           = useState({ notes: 0, absences: 0, paiements: 0 });
  const [moyenneGen, setMoyenne]    = useState(null);
  const [emploi, setEmploi]         = useState(null); // { url, type, classe, updatedAt } | null
  const [refreshing, setRefresh]    = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [menuVisible, setMenu]      = useState(false);
  const [prochainEvenement, setProchainEvenement] = useState(null);
  const menuAnim = useRef(new Animated.Value(-280)).current;
  const insets   = useSafeAreaInsets();
  const { theme, isDark } = useTheme();

  useEffect(() => {
    loadAll();
    const unsub = navigation.addListener('focus', loadAll);
    return unsub;
  }, [navigation]);

  const loadAll = async () => {
    try {
      const stored = await AsyncStorage.getItem('user');
      if (!stored) { setInitialLoading(false); return; }
      const u = JSON.parse(stored);
      setUser(u);

      try {
        const res = await API.get(`/etudiants/profil/${u.Id_UTILISATEUR}`);
        if (res.data?.Image_Etudiant) {
          const updated = { ...u, Image_Etudiant: res.data.Image_Etudiant };
          await AsyncStorage.setItem('user', JSON.stringify(updated));
          setUser(updated);
        }
      } catch (_) {}

      const [notesR, absR, paiR, emploiR] = await Promise.allSettled([
        API.get(`/evaluations/${u.Id_UTILISATEUR}/notes`),
        API.get(`/absences/etudiant/${u.Id_UTILISATEUR}`),
        API.get(`/versements/etudiant/${u.Id_UTILISATEUR}`),
        getEmploiActif(u.Id_UTILISATEUR),
      ]);

      const notes = notesR.status === 'fulfilled' ? notesR.value.data : [];

      if (notes.length > 0) {
        const total = notes.reduce((s, n) => s + parseFloat(n.Note_Evaluation || 0), 0);
        setMoyenne((total / notes.length).toFixed(2));
      } else setMoyenne(null);

      const emploiData = emploiR.status === 'fulfilled' ? emploiR.value : null;
      setEmploi(emploiData?.actif || null);

      try {
        const evRes = await API.get(`/evenements/etudiant/${u.Id_UTILISATEUR}`);
        if (evRes.data.length > 0) setProchainEvenement(evRes.data[0]);
      } catch (_) {}

      setStats({
        notes: notes.length,
        absences: absR.status === 'fulfilled' ? absR.value.data?.absences?.length || 0 : 0,
        paiements: paiR.status === 'fulfilled' ? paiR.value.data?.paiements?.length || 0 : 0,
      });
    } catch (_) {}
    finally { setInitialLoading(false); }
  };

  // L'accueil ne montre que la version active. Les versions précédentes
  // restent accessibles dans l'écran Emploi du temps / bibliothèque.
  const getEmploiActif = async (userId) => {
    const classeId = await getClasseEtudiant(userId);
    if (!classeId) return null;
    const response = await API.get('/emplois-du-temps', { params: { classe_id: classeId } });
    return response.data;
  };

  const onRefresh = async () => { setRefresh(true); await loadAll(); setRefresh(false); };

  const toggleMenu = () => {
    if (menuVisible) {
      Animated.timing(menuAnim, { toValue: -280, duration: 260, useNativeDriver: true }).start(() => setMenu(false));
    } else {
      setMenu(true);
      Animated.timing(menuAnim, { toValue: 0, duration: 260, useNativeDriver: true }).start();
    }
  };

  const goTo = (screen) => { toggleMenu(); setTimeout(() => navigation.navigate(screen), 280); };

  const logout = () => {
    toggleMenu();
    setTimeout(() => {
      Alert.alert('Déconnexion', 'Voulez-vous vous déconnecter ?', [
        { text: 'Annuler', style: 'cancel' },
        { text: 'Déconnexion', style: 'destructive', onPress: async () => {
          await AsyncStorage.removeItem('token');
          await AsyncStorage.removeItem('user');
          navigation.replace('Login');
        }},
      ]);
    }, 300);
  };

  const getMention = (m) => {
    if (!m) return null;
    const v = parseFloat(m);
    if (v >= 16) return { txt: '🏆 Très Bien', color: '#065F46', bg: '#D1FAE5' };
    if (v >= 14) return { txt: '⭐ Bien', color: '#065F46', bg: '#D1FAE5' };
    if (v >= 12) return { txt: '👍 Assez Bien', color: '#92400E', bg: '#FEF3C7' };
    if (v >= 10) return { txt: '✅ Passable', color: '#92400E', bg: '#FEF3C7' };
    return { txt: '⚠️ Insuffisant', color: '#991B1B', bg: '#FEE2E2' };
  };

  const mention  = getMention(moyenneGen);
  const initiale = user?.Nom_User?.charAt(0)?.toUpperCase() || 'E';
  const heure    = new Date().getHours();
  const salut    = heure < 12 ? 'Bonjour' : heure < 18 ? 'Bon après-midi' : 'Bonsoir';

  const menuItems = [
    { icon: '📝', label: 'Mes Notes',        screen: 'Notes' },
    { icon: '📅', label: 'Mes Absences',     screen: 'Absences' },
    { icon: '💰', label: 'Mes Paiements',    screen: 'Paiements' },
    { icon: '⏳', label: 'Évènements', screen: 'Evenements' },
    { icon: '💬', label: 'Messagerie',       screen: 'Messagerie' },
    { icon: '🔔', label: 'Notifications',    screen: 'Notifications' },
    { icon: '🏅', label: 'Classement',       screen: 'Leaderboard' },
    { icon: '🏆', label: 'Mes Récompenses',  screen: 'Recompenses' },
    { icon: '🤖', label: 'Assistant MyCESA', screen: 'ChatBot' },
    { icon: '🪪', label: 'Carte Scolaire',   screen: 'Carte' },
    { icon: 'ℹ️',  label: 'À propos de CESA', screen: 'APropos' },
  ];

  if (initialLoading) {
    return (
      <View style={[styles.loaderWrap, { backgroundColor: theme.bg }]}>
        <StatusBar barStyle="light-content" backgroundColor={VERT} />
        <ActivityIndicator size="large" color={VERT} />
        <Text style={[styles.loaderTxt, { color: theme.textSub }]}>Chargement de votre espace…</Text>
      </View>
    );
  }

  return (
    <View style={[styles.wrapper, { backgroundColor: theme.bg }]}>
      <StatusBar barStyle="light-content" backgroundColor={VERT} />

      {menuVisible && (
        <TouchableOpacity style={styles.overlay} activeOpacity={1} onPress={toggleMenu} />
      )}

      <Animated.View style={[styles.drawer, { backgroundColor: theme.drawer, transform: [{ translateX: menuAnim }] }]}>
        <View style={styles.drawerHead}>
          {user?.Image_Etudiant ? (
            <Image source={{ uri: `${SERVER_URL}${user.Image_Etudiant}` }} style={styles.drawerAvImg} />
          ) : (
            <View style={styles.drawerAv}><Text style={styles.drawerAvTxt}>{initiale}</Text></View>
          )}
          <Text style={styles.drawerNom}>{user?.Nom_User || 'Étudiant'}</Text>
          <Text style={styles.drawerRole}>{user?.Lib_Role || 'Étudiant'}</Text>
        </View>
        <ScrollView style={{ flex: 1 }} showsVerticalScrollIndicator={false}>
          {menuItems.map((item) => (
            <TouchableOpacity key={item.screen} style={styles.drawerItem} activeOpacity={0.7} onPress={() => goTo(item.screen)}>
              <Text style={styles.drawerItemIcon}>{item.icon}</Text>
              <Text style={[styles.drawerItemLabel, { color: theme.text }]}>{item.label}</Text>
              <Text style={styles.drawerArrow}>›</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
        <TouchableOpacity style={styles.drawerLogout} activeOpacity={0.8} onPress={logout}>
          <Text style={styles.drawerLogoutTxt}>🚪 Se déconnecter</Text>
        </TouchableOpacity>
      </Animated.View>

      <View style={[styles.header, { paddingTop: insets.top + 10, backgroundColor: theme.header }]}>
        <TouchableOpacity onPress={toggleMenu} style={styles.menuBtn} activeOpacity={0.7}>
          <View style={styles.hamburger}>
            <View style={styles.hLine} />
            <View style={[styles.hLine, { width: 16 }]} />
            <View style={styles.hLine} />
          </View>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>MyCESA</Text>
        <TouchableOpacity onPress={() => navigation.navigate('Notifications')} style={styles.menuBtn} activeOpacity={0.7}>
          <Text style={{ fontSize: 22 }}>🔔</Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        style={{ flex: 1 }}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[VERT]} tintColor={VERT} />}
        contentContainerStyle={{ paddingBottom: insets.bottom + 90 }}
      >
        <View style={[styles.hero, { backgroundColor: theme.hero }]}>
          <View style={{ flex: 1 }}>
            <Text style={styles.heroSalut}>{salut} 👋</Text>
            <Text style={styles.heroNom}>{user?.Nom_User || 'Étudiant'}</Text>
          </View>
          <TouchableOpacity style={styles.heroAvatar} activeOpacity={0.85} onPress={() => navigation.navigate('Profil')}>
            {user?.Image_Etudiant ? (
              <Image source={{ uri: `${SERVER_URL}${user.Image_Etudiant}` }} style={styles.heroAvatarImg} />
            ) : (
              <Text style={styles.heroAvatarTxt}>{initiale}</Text>
            )}
          </TouchableOpacity>
        </View>

        <View style={[styles.moyenneCard, { backgroundColor: theme.card }]}>
          <View style={{ flex: 1 }}>
            <Text style={[styles.moyenneLabel, { color: theme.textSub }]}>Moyenne Générale</Text>
            <Text style={[styles.moyenneVal, { color: theme.text }]}>
              {moyenneGen || '--'}<Text style={styles.moyenneSur}>/20</Text>
            </Text>
            <View style={styles.moyenneBarTrack}>
              <View style={[styles.moyenneBarFill, {
                width: `${Math.min(100, Math.max(0, (parseFloat(moyenneGen) || 0) * 5))}%`,
                backgroundColor: mention ? mention.color : VERT,
              }]} />
            </View>
          </View>
          {mention && (
            <View style={[styles.mentionBadge, { backgroundColor: mention.bg }]}>
              <Text style={[styles.mentionTxt, { color: mention.color }]}>{mention.txt}</Text>
            </View>
          )}
        </View>

        {prochainEvenement && (
          <TouchableOpacity
            style={[styles.section, { backgroundColor: theme.section, marginBottom: 0 }]}
            activeOpacity={0.85}
            onPress={() => navigation.navigate('Evenements')}
          >
            <View style={styles.sectionHead}>
              <Text style={[styles.sectionTitre, { color: theme.text }]}>⏳ Prochain examen</Text>
              <Text style={[styles.voirTout, { color: VERT }]}>Voir tout ›</Text>
            </View>
            <View style={[styles.examCard, { backgroundColor: '#FEE2E2' }]}>
              <Text style={styles.examIcon}>📝</Text>
              <View style={{ flex: 1 }}>
                <Text style={[styles.examTitre, { color: '#991B1B' }]}>{prochainEvenement.Titre}</Text>
                <Text style={[styles.examDate, { color: '#EF4444' }]}>
                  Dans {prochainEvenement.jours_restants} jour(s)
                </Text>
              </View>
            </View>
          </TouchableOpacity>
        )}

        {/* EMPLOI DU TEMPS — référence rapide vers le fichier (image, PDF, Excel, Word…) */}
        <View style={[styles.section, { backgroundColor: theme.section }]}>
          <View style={styles.sectionHead}>
            <Text style={[styles.sectionTitre, { color: theme.text }]}>🗓️ Emploi du temps</Text>
            <TouchableOpacity onPress={() => navigation.navigate('EmploiTemps')}>
              <Text style={styles.voirTout}>Voir tout ›</Text>
            </TouchableOpacity>
          </View>

          {emploi ? (
            <TouchableOpacity
              style={styles.emploiCard} activeOpacity={0.85}
              onPress={() => navigation.navigate('EmploiTemps')}
            >
              <View style={styles.emploiIconWrap}>
                <Text style={styles.emploiIcon}>{iconeFichier(emploi.type_mime)}</Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={[styles.emploiTitre, { color: theme.text }]} numberOfLines={1}>
                  {emploi.nom_classe ? `Classe ${emploi.nom_classe}` : 'Mon emploi du temps'}
                </Text>
                <Text style={[styles.emploiSousTitre, { color: theme.textSub }]} numberOfLines={1}>
                  {libelleType(emploi.type_mime)}{emploi.created_at ? ` · Màj le ${formatDate(emploi.created_at)}` : ''}
                </Text>
              </View>
              <Text style={styles.emploiFleche}>›</Text>
            </TouchableOpacity>
          ) : (
            <View style={styles.emptyBox}>
              <Text style={styles.emptyTxt}>Aucun fichier actif publié pour votre classe</Text>
              <Text style={styles.emptyHint}>Les anciennes versions sont consultables dans la bibliothèque.</Text>
            </View>
          )}
        </View>

        <View style={[styles.section, { backgroundColor: theme.section }]}>
          <Text style={[styles.sectionTitre, { color: theme.text }]}>📊 Mes Statistiques</Text>
          <View style={styles.statsRow}>
            <TouchableOpacity style={[styles.statCard, { borderTopColor: '#2563EB', backgroundColor: theme.card }]} activeOpacity={0.85} onPress={() => navigation.navigate('Notes')}>
              <Text style={styles.statIcon}>📝</Text>
              <Text style={[styles.statVal, { color: theme.text }]}>{stats.notes}</Text>
              <Text style={[styles.statLbl, { color: theme.textSub }]}>Évaluations</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.statCard, { borderTopColor: ORANGE, backgroundColor: theme.card }]} activeOpacity={0.85} onPress={() => navigation.navigate('Absences')}>
              <Text style={styles.statIcon}>📅</Text>
              <Text style={[styles.statVal, { color: theme.text }]}>{stats.absences}</Text>
              <Text style={[styles.statLbl, { color: theme.textSub }]}>Absences</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.statCard, { borderTopColor: '#10B981', backgroundColor: theme.card }]} activeOpacity={0.85} onPress={() => navigation.navigate('Paiements')}>
              <Text style={styles.statIcon}>💰</Text>
              <Text style={[styles.statVal, { color: theme.text }]}>{stats.paiements}</Text>
              <Text style={[styles.statLbl, { color: theme.textSub }]}>Paiements</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.ecoleCard}>
          <Text style={styles.ecoleTitre}>🎓 GROUPE COFE-CESA</Text>
          <Text style={styles.ecoleSlogan}>Une excellence à votre service !</Text>
        </View>
      </ScrollView>

      <TouchableOpacity
        style={[styles.fab, { bottom: insets.bottom + 10 }]}
        onPress={() => navigation.navigate('ChatBot')}
        activeOpacity={0.85}
      >
        <Text style={styles.fabIcon}>🤖</Text>
        <Text style={styles.fabTxt}>Assistant</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: { flex: 1, backgroundColor: '#F5F7F5' },

  loaderWrap: { flex: 1, justifyContent: 'center', alignItems: 'center', gap: 12 },
  loaderTxt: { fontSize: 13, fontWeight: '600' },

  overlay: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 10 },
  drawer: {
    position: 'absolute', top: 0, left: 0, bottom: 0, width: 280,
    backgroundColor: '#fff', zIndex: 20, elevation: 20,
    shadowColor: '#000', shadowOffset: { width: 4, height: 0 }, shadowOpacity: 0.2,
  },
  drawerHead: { backgroundColor: VERT, padding: 24, paddingTop: 52, alignItems: 'center' },
  drawerAv: {
    width: 72, height: 72, borderRadius: 36, backgroundColor: ORANGE,
    justifyContent: 'center', alignItems: 'center',
    borderWidth: 3, borderColor: '#fff', marginBottom: 10,
  },
  drawerAvImg: { width: 72, height: 72, borderRadius: 36, borderWidth: 3, borderColor: '#fff', marginBottom: 10 },
  drawerAvTxt: { color: '#fff', fontSize: 28, fontWeight: '900' },
  drawerNom: { color: '#fff', fontSize: 16, fontWeight: '800', textAlign: 'center' },
  drawerRole: { color: 'rgba(255,255,255,0.7)', fontSize: 13, marginTop: 4 },
  drawerItem: {
    flexDirection: 'row', alignItems: 'center',
    paddingVertical: 14, paddingHorizontal: 20,
    borderBottomWidth: 1, borderBottomColor: '#F1F5F9',
  },
  drawerItemIcon: { fontSize: 20, marginRight: 14 },
  drawerItemLabel: { flex: 1, fontSize: 15, fontWeight: '600', color: '#1E293B' },
  drawerArrow: { fontSize: 20, color: '#CBD5E1' },
  drawerLogout: { padding: 20, borderTopWidth: 1, borderTopColor: '#F1F5F9', backgroundColor: '#FFF1F2' },
  drawerLogoutTxt: { color: '#EF4444', fontSize: 15, fontWeight: '700', textAlign: 'center' },

  fab: {
    position: 'absolute', right: 20,
    backgroundColor: ORANGE, borderRadius: 32,
    paddingHorizontal: 18, paddingVertical: 14,
    flexDirection: 'row', alignItems: 'center',
    elevation: 10,
    shadowColor: ORANGE, shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35, shadowRadius: 12,
  },
  fabIcon: { fontSize: 20 },
  fabTxt: { color: '#fff', fontSize: 14, fontWeight: '800', marginLeft: 8 },

  header: {
    backgroundColor: VERT,
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 16, paddingBottom: 16,
  },
  menuBtn: { width: 40, height: 40, justifyContent: 'center', alignItems: 'center' },
  hamburger: { gap: 5 },
  hLine: { width: 22, height: 2.5, backgroundColor: '#fff', borderRadius: 2 },
  headerTitle: { color: '#fff', fontSize: 20, fontWeight: '900', letterSpacing: 1 },

  hero: {
    backgroundColor: VERT,
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: 20, paddingBottom: 28,
    borderBottomLeftRadius: 28, borderBottomRightRadius: 28,
  },
  heroSalut: { color: 'rgba(255,255,255,0.75)', fontSize: 13 },
  heroNom: { color: '#fff', fontSize: 22, fontWeight: '900', marginTop: 2 },
  heroAvatar: {
    width: 50, height: 50, borderRadius: 25, backgroundColor: ORANGE,
    justifyContent: 'center', alignItems: 'center',
    borderWidth: 2.5, borderColor: '#fff', overflow: 'hidden',
  },
  heroAvatarTxt: { color: '#fff', fontSize: 20, fontWeight: '900' },
  heroAvatarImg: { width: 50, height: 50, borderRadius: 25 },

  moyenneCard: {
    backgroundColor: '#fff', marginHorizontal: 16, marginTop: 16,
    borderRadius: 20, padding: 20,
    flexDirection: 'row', alignItems: 'center',
    elevation: 4, shadowColor: VERT,
    shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.1, shadowRadius: 10,
  },
  moyenneLabel: { fontSize: 13, color: '#64748B', fontWeight: '600' },
  moyenneVal: { fontSize: 40, fontWeight: '900', color: '#1E293B', marginTop: 2 },
  moyenneSur: { fontSize: 18, color: '#94A3B8', fontWeight: '600' },
  moyenneBarTrack: { height: 6, borderRadius: 3, backgroundColor: '#E2E8F0', marginTop: 10, width: '90%', overflow: 'hidden' },
  moyenneBarFill: { height: '100%', borderRadius: 3 },
  mentionBadge: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 16 },
  mentionTxt: { fontSize: 13, fontWeight: '800' },

  section: {
    backgroundColor: '#fff', marginHorizontal: 16, marginTop: 14,
    borderRadius: 20, padding: 18,
    elevation: 2, shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06,
  },
  sectionHead: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  sectionTitre: { fontSize: 15, fontWeight: '800', color: '#1E293B' },
  voirTout: { color: VERT, fontSize: 13, fontWeight: '700' },

  emptyBox: { backgroundColor: '#F0FDF4', borderRadius: 12, padding: 14 },
  emptyTxt: { color: VERT, fontWeight: '600', textAlign: 'center' },
  emptyHint: { color: '#64748B', fontSize: 12, lineHeight: 18, marginTop: 5, textAlign: 'center' },

  emploiCard: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    backgroundColor: '#F8FAFC', borderRadius: 16, padding: 14,
  },
  emploiIconWrap: {
    width: 46, height: 46, borderRadius: 14, backgroundColor: '#DCFCE7',
    justifyContent: 'center', alignItems: 'center',
  },
  emploiIcon: { fontSize: 22 },
  emploiTitre: { fontSize: 14, fontWeight: '800', color: '#1E293B' },
  emploiSousTitre: { fontSize: 12, color: '#64748B', marginTop: 2 },
  emploiFleche: { fontSize: 22, color: '#CBD5E1', fontWeight: '700' },

  examCard:  { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FEE2E2', borderRadius: 12, padding: 12, gap: 10 },
  examIcon:  { fontSize: 28 },
  examTitre: { fontSize: 14, fontWeight: '800' },
  examDate:  { fontSize: 12, marginTop: 2, fontWeight: '600' },

  statsRow: { flexDirection: 'row', gap: 10, marginTop: 4 },
  statCard: {
    flex: 1, backgroundColor: '#F8FAFC', borderRadius: 16, padding: 14,
    alignItems: 'center', borderTopWidth: 3,
    elevation: 1,
  },
  statIcon: { fontSize: 24, marginBottom: 6 },
  statVal: { fontSize: 26, fontWeight: '900', color: '#1E293B' },
  statLbl: { fontSize: 11, color: '#64748B', fontWeight: '600', marginTop: 2, textAlign: 'center' },

  ecoleCard: {
    backgroundColor: VERT, marginHorizontal: 16, marginTop: 14, marginBottom: 8,
    borderRadius: 20, padding: 18, alignItems: 'center',
    borderWidth: 2, borderColor: ORANGE,
  },
  ecoleTitre: { color: '#fff', fontSize: 15, fontWeight: '800' },
  ecoleSlogan: { color: 'rgba(255,255,255,0.75)', fontSize: 12, marginTop: 4, fontStyle: 'italic' },
});