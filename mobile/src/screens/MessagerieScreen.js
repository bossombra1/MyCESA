import React, { useEffect, useState } from 'react';
import {
  View, Text, StyleSheet, FlatList, TouchableOpacity,
  ActivityIndicator, StatusBar, Image, RefreshControl
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import API, { SERVER_URL } from '../api/api';
import { useTheme } from '../context/ThemeContext';

const VERT   = '#2E7D32';
const ORANGE = '#D84315';

export default function MessagerieScreen({ navigation }) {
  const [conversations, setConversations] = useState([]);
  const [professeurs,   setProfesseurs]   = useState([]);
  const [user,          setUser]          = useState(null);
  const [loading,       setLoading]       = useState(true);
  const [refresh,       setRefresh]       = useState(false);
  const [vue,           setVue]           = useState('conversations');
  const insets   = useSafeAreaInsets();
  const themeCtx = useTheme();
  const theme    = themeCtx?.theme || {
    bg: '#F5F7F5', card: '#FFFFFF', cardBorder: '#E2E8F0',
    text: '#1E293B', textSub: '#64748B', textMuted: '#94A3B8',
  };

 useEffect(() => {
  loadData();
  // Auto-refresh toutes les 5 secondes pour les nouveaux messages
  const interval = setInterval(() => loadData(), 5000);
  return () => clearInterval(interval);
}, []);

  const loadData = async () => {
    try {
      const stored = await AsyncStorage.getItem('user');
      const u      = JSON.parse(stored);
      setUser(u);
      const [convRes, profRes] = await Promise.allSettled([
        API.get(`/messagerie/conversations/${u.Id_UTILISATEUR}`),
        API.get('/messagerie/professeurs'),
      ]);
      if (convRes.status === 'fulfilled') setConversations(convRes.value.data);
      if (profRes.status === 'fulfilled') setProfesseurs(profRes.value.data);
    } catch (err) {
      console.log('Erreur messagerie:', err);
    } finally {
      setLoading(false);
      setRefresh(false);
    }
  };

  const onRefresh = () => { setRefresh(true); loadData(); };

  const totalNonLus = conversations.reduce((s, c) => s + (c.Non_Lu || 0), 0);

  const ouvrirConversation = async (prof) => {
    navigation.navigate('Conversation', {
      Id_Etudiant:   user.Id_UTILISATEUR,
      Id_Professeur: prof.Id_UTILISATEUR,
      userId:        user.Id_UTILISATEUR,
      nomProf:       prof.Nom_User || prof.Nom_Prenoms_Profe,
    });
  };

  const ouvrirConvExistante = (conv) => {
    const isEtudiant = conv.Id_Etudiant === user?.Id_UTILISATEUR;
    navigation.navigate('Conversation', {
      Id_Etudiant:    conv.Id_Etudiant,
      Id_Professeur:  conv.Id_Professeur,
      Id_Conversation: conv.Id_Conversation,
      userId:         user?.Id_UTILISATEUR,
      nomProf:        isEtudiant ? conv.Nom_Professeur : conv.Nom_Etudiant,
    });
  };

  if (loading) return (
    <View style={[styles.center, { backgroundColor: theme.bg }]}>
      <ActivityIndicator size="large" color={VERT} />
    </View>
  );

  return (
    <View style={[styles.wrapper, { backgroundColor: theme.bg }]}>
      <StatusBar barStyle="light-content" backgroundColor={VERT} />

      {/* HERO */}
      <View style={styles.hero}>
        <View style={styles.deco1} />
        <View style={styles.deco2} />
        <Text style={styles.heroTitre}>💬 Messagerie</Text>
        <Text style={styles.heroSub}>
          {conversations.length} conversation(s)
          {totalNonLus > 0 ? ` · ${totalNonLus} non lu(s)` : ''}
        </Text>
      </View>

      {/* TABS */}
      <View style={[styles.tabs, { backgroundColor: theme.card }]}>
        <TouchableOpacity
          style={[styles.tab, vue === 'conversations' && { backgroundColor: VERT }]}
          onPress={() => setVue('conversations')}
        >
          <Text style={[styles.tabTxt, { color: vue === 'conversations' ? '#fff' : theme.textSub }]}>
            💬 Conversations {totalNonLus > 0 ? `(${totalNonLus})` : ''}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, vue === 'professeurs' && { backgroundColor: VERT }]}
          onPress={() => setVue('professeurs')}
        >
          <Text style={[styles.tabTxt, { color: vue === 'professeurs' ? '#fff' : theme.textSub }]}>
            👨‍🏫 Professeurs
          </Text>
        </TouchableOpacity>
      </View>

      {/* CONVERSATIONS */}
      {vue === 'conversations' && (
        <FlatList
          data={conversations}
          keyExtractor={item => `conv-${item.Id_Conversation}`}
          refreshControl={<RefreshControl refreshing={refresh} onRefresh={onRefresh} colors={[VERT]} />}
          contentContainerStyle={{ padding: 16, paddingBottom: insets.bottom + 24, gap: 10 }}
          ListEmptyComponent={() => (
            <View style={[styles.emptyBox, { backgroundColor: theme.card }]}>
              <Text style={styles.emptyIcon}>💬</Text>
              <Text style={[styles.emptyTitre, { color: theme.text }]}>Aucune conversation</Text>
              <Text style={[styles.emptyTxt, { color: theme.textSub }]}>
                Contactez un professeur via l'onglet "Professeurs"
              </Text>
            </View>
          )}
          renderItem={({ item }) => {
            const isEtudiant = item.Id_Etudiant === user?.Id_UTILISATEUR;
            const nom = isEtudiant ? item.Nom_Professeur : item.Nom_Etudiant;
            const nonLu = item.Non_Lu || 0;
            return (
              <TouchableOpacity
                style={[styles.convCard, { backgroundColor: theme.card, borderColor: nonLu > 0 ? VERT : theme.cardBorder }]}
                onPress={() => ouvrirConvExistante(item)}
                activeOpacity={0.85}
              >
                {/* AVATAR */}
                <View style={[styles.convAvatar, { backgroundColor: VERT + '20' }]}>
                  <Text style={styles.convAvatarTxt}>{nom?.charAt(0)?.toUpperCase() || '?'}</Text>
                </View>
                {/* CONTENU */}
                <View style={{ flex: 1 }}>
                  <View style={styles.convTop}>
                    <Text style={[styles.convNom, { color: theme.text, fontWeight: nonLu > 0 ? '900' : '700' }]} numberOfLines={1}>
                      {isEtudiant ? '👨‍🏫 ' : '🎓 '}{nom}
                    </Text>
                    <Text style={[styles.convDate, { color: theme.textMuted }]}>
                      {new Date(item.Derniere_Date).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })}
                    </Text>
                  </View>
                  <Text style={[styles.convDernier, { color: nonLu > 0 ? theme.text : theme.textSub, fontWeight: nonLu > 0 ? '700' : '400' }]} numberOfLines={1}>
                    {item.Dernier_Message || 'Démarrer la conversation'}
                  </Text>
                </View>
                {/* BADGE NON LU */}
                {nonLu > 0 && (
                  <View style={styles.nonLuBadge}>
                    <Text style={styles.nonLuTxt}>{nonLu}</Text>
                  </View>
                )}
              </TouchableOpacity>
            );
          }}
        />
      )}

      {/* PROFESSEURS */}
      {vue === 'professeurs' && (
        <FlatList
          data={professeurs}
          keyExtractor={item => `prof-${item.Id_UTILISATEUR}`}
          refreshControl={<RefreshControl refreshing={refresh} onRefresh={onRefresh} colors={[VERT]} />}
          contentContainerStyle={{ padding: 16, paddingBottom: insets.bottom + 24, gap: 10 }}
          ListEmptyComponent={() => (
            <View style={[styles.emptyBox, { backgroundColor: theme.card }]}>
              <Text style={styles.emptyIcon}>👨‍🏫</Text>
              <Text style={[styles.emptyTitre, { color: theme.text }]}>Aucun professeur</Text>
            </View>
          )}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={[styles.profCard, { backgroundColor: theme.card, borderColor: theme.cardBorder }]}
              onPress={() => ouvrirConversation(item)}
              activeOpacity={0.85}
            >
              <View style={[styles.convAvatar, { backgroundColor: ORANGE + '20' }]}>
                <Text style={[styles.convAvatarTxt, { color: ORANGE }]}>
                  {(item.Nom_User || item.Nom_Prenoms_Profe)?.charAt(0)?.toUpperCase() || '?'}
                </Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={[styles.convNom, { color: theme.text }]}>
                  {item.Nom_User || item.Nom_Prenoms_Profe}
                </Text>
                <Text style={[styles.convDernier, { color: theme.textSub }]}>
                  {item.Email_User}
                </Text>
              </View>
              <View style={[styles.msgBtn, { backgroundColor: VERT }]}>
                <Text style={styles.msgBtnTxt}>✉️ Écrire</Text>
              </View>
            </TouchableOpacity>
          )}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: { flex: 1 },
  center:  { flex: 1, justifyContent: 'center', alignItems: 'center' },
  hero: {
    backgroundColor: VERT, paddingTop: 100, paddingBottom: 54,
    paddingHorizontal: 40,
    borderBottomLeftRadius: 28, borderBottomRightRadius: 28, overflow: 'hidden',
  },
  deco1: { position: 'absolute', width: 180, height: 180, borderRadius: 90, backgroundColor: 'rgba(255,255,255,0.07)', top: -50, right: -30 },
  deco2: { position: 'absolute', width: 120, height: 120, borderRadius: 60, backgroundColor: 'rgba(255,255,255,0.05)', bottom: -20, left: -20 },
  heroTitre: { color: '#fff', fontSize: 24, fontWeight: '900' },
  heroSub:   { color: 'rgba(255,255,255,0.75)', fontSize: 13, marginTop: 4 },
  tabs: { flexDirection: 'row', marginHorizontal: 16, marginTop: 14, borderRadius: 16, padding: 4, elevation: 2 },
  tab:    { flex: 1, paddingVertical: 10, alignItems: 'center', borderRadius: 12 },
  tabTxt: { fontSize: 13, fontWeight: '700' },
  convCard: { borderRadius: 16, padding: 14, flexDirection: 'row', alignItems: 'center', gap: 12, borderWidth: 1.5, elevation: 2 },
  profCard: { borderRadius: 16, padding: 14, flexDirection: 'row', alignItems: 'center', gap: 12, borderWidth: 1, elevation: 2 },
  convAvatar: { width: 48, height: 48, borderRadius: 24, justifyContent: 'center', alignItems: 'center' },
  convAvatarTxt: { fontSize: 20, fontWeight: '900', color: VERT },
  convTop:  { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 },
  convNom:  { fontSize: 14, flex: 1 },
  convDate: { fontSize: 11 },
  convDernier: { fontSize: 13 },
  nonLuBadge: { backgroundColor: VERT, minWidth: 22, height: 22, borderRadius: 11, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 4 },
  nonLuTxt:   { color: '#fff', fontSize: 11, fontWeight: '900' },
  msgBtn:    { paddingHorizontal: 12, paddingVertical: 7, borderRadius: 12 },
  msgBtnTxt: { color: '#fff', fontSize: 12, fontWeight: '700' },
  emptyBox:   { borderRadius: 16, padding: 32, alignItems: 'center', marginTop: 20 },
  emptyIcon:  { fontSize: 48, marginBottom: 12 },
  emptyTitre: { fontSize: 16, fontWeight: '800', marginBottom: 4 },
  emptyTxt:   { fontSize: 13, textAlign: 'center' },
});