import React, { useState, useRef } from 'react';
import {
  View, Text, TextInput, TouchableOpacity,
  StyleSheet, ScrollView, ActivityIndicator,
  KeyboardAvoidingView, Platform, StatusBar
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../context/ThemeContext';
import API from '../api/api';

const VERT   = '#2E7D32';
const ORANGE = '#D84315';

const SUGGESTIONS = [
  'Quelle est ma moyenne ?',
  'Combien d\'absences ai-je ?',
  'Mon emploi du temps',
  'Mes paiements en cours',
];

const SUGGESTIONS_NAV = {
  'Quelle est ma moyenne ?': 'Notes',
  "Combien d'absences ai-je ?": 'Absences',
  'Mon emploi du temps': 'EmploiTemps',
  'Mes paiements en cours': 'Paiements',
};

export default function ChatBotScreen({ navigation }) {
  const [messages, setMessages] = useState([
    {
      from: 'bot',
      text: 'Bonjour ! Je suis l\'assistant MyCESA 🎓\nJe peux t\'aider avec tes notes, absences, paiements et emploi du temps.\nComment puis-je t\'aider ?',
      heure: new Date(),
    }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef();
  const insets = useSafeAreaInsets();
  const { theme, isDark } = useTheme();

  const sendMessage = async (texte) => {
    const question = (texte || input).trim();
    if (!question) return;
    setInput('');
    setMessages(prev => [...prev, { from: 'user', text: question, heure: new Date() }]);
    setLoading(true);
    try {
      const stored = await AsyncStorage.getItem('user');
      const user = JSON.parse(stored);
      const response = await API.post('/chatbot/ask', {
        question,
        Id_ETUDIANT: user.Id_UTILISATEUR,
      });
      const ecranCible = SUGGESTIONS_NAV[question];
      setMessages(prev => [...prev, {
        from: 'bot',
        text: response.data.reponse,
        heure: new Date(),
        lienEcran: ecranCible || null,
        lienLabel: ecranCible ? `Voir ${question.replace('?','').trim()}` : null,
      }]);
    } catch (err) {
      setMessages(prev => [...prev, {
        from: 'bot',
        text: 'Désolé, une erreur est survenue. Réessaie plus tard. 🙏',
        heure: new Date(),
        erreur: true,
      }]);
    } finally {
      setLoading(false);
      setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 100);
    }
  };

  const formatHeure = (date) => {
    if (!date) return '';
    return new Date(date).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
    >
      <View style={[styles.wrapper, { backgroundColor: theme.bg }]}> 
        <StatusBar barStyle="light-content" backgroundColor={VERT} />

        {/* HEADER */}
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <View style={styles.botAvatar}>
              <Text style={styles.botAvatarTxt}>🤖</Text>
            </View>
            <View>
              <Text style={styles.headerTitre}>Assistant MyCESA</Text>
              <View style={styles.onlineRow}>
                <View style={styles.onlineDot} />
                <Text style={styles.onlineTxt}>En ligne</Text>
              </View>
            </View>
          </View>
          <View style={styles.headerLogo}>
            <Text style={styles.headerLogoTxt}>CESA</Text>
          </View>
        </View>

        {/* MESSAGES */}
        <ScrollView
          ref={scrollRef}
          style={styles.messages}
          contentContainerStyle={{ padding: 16, paddingBottom: 8 }}
          keyboardShouldPersistTaps="handled"
          onContentSizeChange={() => scrollRef.current?.scrollToEnd({ animated: true })}
          showsVerticalScrollIndicator={false}
        >

          {/* SUGGESTIONS (affichées seulement au début) */}
          {messages.length === 1 && (
          <View style={[styles.suggestionsBox, { backgroundColor: theme.card, borderColor: theme.cardBorder }]}> 
              <Text style={styles.suggestionsTitre}>💡 Suggestions</Text>
              <View style={styles.suggestionsRow}>
                {SUGGESTIONS.map((s, i) => (
                  <TouchableOpacity
                    key={i}
                    style={styles.suggestionBtn}
                    onPress={() => sendMessage(s)}
                  >
                    <Text style={styles.suggestionTxt}>{s}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          )}

          {/* BULLES */}
          {messages.map((msg, index) => (
            <View
              key={index}
              style={[styles.bubbleRow, msg.from === 'user' ? styles.bubbleRowUser : styles.bubbleRowBot]}
            >
              {msg.from === 'bot' && (
                <View style={styles.botAvatarSmall}>
                  <Text style={{ fontSize: 16 }}>🤖</Text>
                </View>
              )}
              <View style={styles.bubbleCol}>
                <View style={[
                  styles.bubble,
                  msg.from === 'user'
                    ? styles.bubbleUser
                    : [styles.bubbleBot, { backgroundColor: theme.card, borderColor: theme.cardBorder }],
                  msg.erreur && styles.bubbleErreur,
                ]}>
                  <Text style={[
                    styles.bubbleTxt,
                    msg.from === 'user'
                      ? styles.bubbleTxtUser
                      : { color: theme.text },
                  ]}>
                    {msg.text}
                  </Text>
                  {msg.lienEcran && (
                    <TouchableOpacity
                      style={styles.lienBtn}
                      onPress={() => navigation.navigate(msg.lienEcran)}
                    >
                      <Text style={styles.lienTxt}>
                        ▶ {msg.lienLabel}
                      </Text>
                    </TouchableOpacity>
                  )}
                </View>
                <Text style={[styles.heure, msg.from === 'user' && styles.heureUser]}>
                  {formatHeure(msg.heure)}
                </Text>
              </View>
            </View>
          ))}

          {/* CHARGEMENT */}
          {loading && (
            <View style={[styles.bubbleRow, styles.bubbleRowBot]}>
              <View style={styles.botAvatarSmall}>
                <Text style={{ fontSize: 16 }}>🤖</Text>
              </View>
              <View style={[styles.bubble, styles.bubbleBot, styles.bubbleLoading]}>
                <View style={styles.dotsRow}>
                  <View style={[styles.dot, styles.dot1]} />
                  <View style={[styles.dot, styles.dot2]} />
                  <View style={[styles.dot, styles.dot3]} />
                </View>
              </View>
            </View>
          )}
        </ScrollView>

        {/* BARRE DE SAISIE */}
        <View style={[styles.inputBar, { backgroundColor: theme.card, borderTopColor: theme.cardBorder, paddingBottom: insets.bottom + 8 }]}>
          <TextInput
            style={[styles.input, { backgroundColor: theme.input, borderColor: theme.inputBorder, color: theme.text }]}
            placeholder="Pose ta question..."
            placeholderTextColor="#94A3B8"
            value={input}
            onChangeText={setInput}
            onSubmitEditing={() => sendMessage()}
            returnKeyType="send"
            multiline
          />
          <TouchableOpacity
            style={[styles.sendBtn, (!input.trim() || loading) && styles.sendBtnDisabled]}
            onPress={() => sendMessage()}
            disabled={!input.trim() || loading}
          >
            {loading
              ? <ActivityIndicator size="small" color="#fff" />
              : <Text style={styles.sendTxt}>▶</Text>
            }
          </TouchableOpacity>
        </View>

      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  wrapper: { flex: 1, backgroundColor: '#F5F7F5' },

  // HEADER
  header: {
    backgroundColor: VERT, paddingHorizontal: 20, paddingTop: 16, paddingBottom: 16,
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
  },
  headerLeft: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  botAvatar: {
    width: 44, height: 44, borderRadius: 22,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center', alignItems: 'center',
    borderWidth: 2, borderColor: 'rgba(255,255,255,0.3)',
  },
  botAvatarTxt: { fontSize: 22 },
  headerTitre: { color: '#fff', fontSize: 16, fontWeight: '900' },
  onlineRow: { flexDirection: 'row', alignItems: 'center', gap: 5, marginTop: 2 },
  onlineDot: { width: 7, height: 7, borderRadius: 4, backgroundColor: '#4ADE80' },
  onlineTxt: { color: 'rgba(255,255,255,0.75)', fontSize: 12 },
  headerLogo: {
    backgroundColor: 'rgba(255,255,255,0.15)', paddingHorizontal: 12,
    paddingVertical: 5, borderRadius: 10,
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.25)',
  },
  headerLogoTxt: { color: '#fff', fontSize: 13, fontWeight: '900', letterSpacing: 1 },

  // MESSAGES
  messages: { flex: 1 },

  // SUGGESTIONS
  suggestionsBox: {
    backgroundColor: '#fff', borderRadius: 18, padding: 16, marginBottom: 16,
    elevation: 2, borderWidth: 1, borderColor: '#E8F5E9',
  },
  suggestionsTitre: { fontSize: 13, fontWeight: '700', color: VERT, marginBottom: 10 },
  suggestionsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  suggestionBtn: {
    backgroundColor: '#F0FDF4', paddingHorizontal: 12, paddingVertical: 7,
    borderRadius: 20, borderWidth: 1.5, borderColor: VERT + '50',
  },
  suggestionTxt: { fontSize: 12, color: VERT, fontWeight: '600' },

  // BULLES
  bubbleRow: { flexDirection: 'row', alignItems: 'flex-end', marginBottom: 12, gap: 8 },
  bubbleRowBot: { alignSelf: 'flex-start', maxWidth: '85%' },
  bubbleRowUser: { alignSelf: 'flex-end', flexDirection: 'row-reverse', maxWidth: '85%' },
  botAvatarSmall: {
    width: 32, height: 32, borderRadius: 16,
    backgroundColor: '#E8F5E9', justifyContent: 'center', alignItems: 'center',
  },
  bubbleCol: { flex: 1 },
  bubble: { padding: 12, borderRadius: 18, elevation: 1 },
  bubbleBot: {
    borderBottomLeftRadius: 4,
    borderWidth: 1,
  },
  bubbleUser: { backgroundColor: VERT, borderBottomRightRadius: 4 },
  bubbleErreur: { backgroundColor: '#FEF2F2', borderColor: '#FECACA' },
  bubbleTxt: { fontSize: 14, lineHeight: 21 },
  bubbleTxtBot: { color: '#1E293B' },
  bubbleTxtUser: { color: '#fff' },
  heure: { fontSize: 10, color: '#94A3B8', marginTop: 4, marginLeft: 4 },
  heureUser: { textAlign: 'right', marginRight: 4 },

  // ANIMATION CHARGEMENT
  bubbleLoading: { paddingVertical: 14, paddingHorizontal: 16 },
  dotsRow: { flexDirection: 'row', gap: 5, alignItems: 'center' },
  dot: { width: 8, height: 8, borderRadius: 4, backgroundColor: VERT + '80' },

  // BARRE SAISIE
  inputBar: {
    flexDirection: 'row', paddingHorizontal: 12, paddingTop: 10,
    backgroundColor: '#fff', borderTopWidth: 1, borderTopColor: '#E2E8F0',
    alignItems: 'flex-end', gap: 10,
  },
  input: {
    flex: 1, minHeight: 46, maxHeight: 100,
    backgroundColor: '#F5F7F5', borderRadius: 24,
    paddingHorizontal: 18, paddingVertical: 12,
    fontSize: 14, color: '#1E293B',
    borderWidth: 1.5, borderColor: '#E2E8F0',
  },
  sendBtn: {
    width: 46, height: 46, backgroundColor: VERT,
    borderRadius: 23, justifyContent: 'center', alignItems: 'center',
    shadowColor: VERT, shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35, shadowRadius: 8, elevation: 6,
  },
  sendBtnDisabled: { backgroundColor: '#94A3B8', shadowOpacity: 0, elevation: 0 },
  sendTxt: { color: '#fff', fontSize: 16 },
  lienBtn: {
    marginTop: 10, backgroundColor: VERT,
    paddingHorizontal: 14, paddingVertical: 8,
    borderRadius: 20, alignSelf: 'flex-start',
  },
  lienTxt: { color: '#fff', fontSize: 12, fontWeight: '800' },
});