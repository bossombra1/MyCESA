import React, { useEffect, useState, useRef } from 'react';
import {
  View, Text, StyleSheet, FlatList, TextInput, TouchableOpacity,
  ActivityIndicator, StatusBar, Platform
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import API from '../api/api';
import { useTheme } from '../context/ThemeContext';

const VERT   = '#2E7D32';
const ORANGE = '#D84315';

export default function ConversationScreen({ route, navigation }) {
  const { Id_Etudiant, Id_Professeur, Id_Conversation, userId, nomProf } = route.params;
  const [messages, setMessages] = useState([]);
  const [input,    setInput]    = useState('');
  const [loading,  setLoading]  = useState(true);
  const [sending,  setSending]  = useState(false);
  const [convId,   setConvId]   = useState(Id_Conversation || null);
  const flatRef = useRef();
  const insets  = useSafeAreaInsets();
  const themeCtx = useTheme();
  const theme    = themeCtx?.theme || {
    bg: '#F5F7F5', card: '#FFFFFF', cardBorder: '#E2E8F0',
    text: '#1E293B', textSub: '#64748B', textMuted: '#94A3B8',
  };

  useEffect(() => {
    navigation.setOptions({ title: nomProf || 'Conversation' });
    if (convId) {
      loadMessages();
      const interval = setInterval(() => loadMessages(true), 3000);
      return () => clearInterval(interval);
    } else {
      setLoading(false);
    }
  }, [convId]);

  const loadMessages = async (silently = false) => {
    try {
      if (!silently) setLoading(true);
      const id = convId || Id_Conversation;
      if (!id) return;
      const res = await API.get(`/messagerie/messages/${id}`);
      setMessages(res.data);
      await API.put(`/messagerie/lire/${id}/${userId}`);
    } catch (err) {
      console.log('Erreur messages:', err);
    } finally {
      setLoading(false);
    }
  };

  const envoyer = async () => {
    if (!input.trim() || sending) return;
    const texte = input.trim();
    setInput('');
    setSending(true);

    const msgTemp = {
      Id_Message: Date.now(),
      Id_Expediteur: userId,
      Contenu: texte,
      CreatedAt: new Date().toISOString(),
      Lu: 0,
      temp: true,
    };
    setMessages(prev => [...prev, msgTemp]);
    setTimeout(() => flatRef.current?.scrollToEnd({ animated: true }), 100);

    try {
      const res = await API.post('/messagerie/envoyer', {
        Id_Etudiant, Id_Professeur,
        Id_Expediteur: userId,
        Contenu: texte,
      });
      const newConvId = convId || res.data.Id_Conversation;
      if (!convId && newConvId) setConvId(newConvId);
      if (newConvId) {
        const msgRes = await API.get(`/messagerie/messages/${newConvId}`);
        setMessages(msgRes.data);
      }
    } catch (err) {
      console.log('Erreur envoi:', err);
      setMessages(prev => prev.filter(m => !m.temp));
    } finally {
      setSending(false);
      setTimeout(() => flatRef.current?.scrollToEnd({ animated: true }), 100);
    }
  };

  const formatHeure = (date) => new Date(date).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
  const formatDate  = (date) => new Date(date).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long' });

  if (loading) return (
    <View style={[styles.center, { backgroundColor: theme.bg }]}>
      <ActivityIndicator size="large" color={VERT} />
    </View>
  );

  const renderMessage = ({ item, index }) => {
    const isMe    = item.Id_Expediteur === userId;
    const prevMsg = messages[index - 1];
    const showDate = !prevMsg || formatDate(item.CreatedAt) !== formatDate(prevMsg.CreatedAt);
    return (
      <View>
        {showDate && (
          <View style={styles.dateSep}>
            <Text style={[styles.dateSepTxt, { color: theme.textMuted, backgroundColor: theme.bg }]}>
              {formatDate(item.CreatedAt)}
            </Text>
          </View>
        )}
        <View style={[styles.bubbleRow, isMe ? styles.bubbleRowMe : styles.bubbleRowOther]}>
          {!isMe && (
            <View style={[styles.avatarMini, { backgroundColor: VERT + '20' }]}>
              <Text style={[styles.avatarMiniTxt, { color: VERT }]}>
                {nomProf?.charAt(0)?.toUpperCase()}
              </Text>
            </View>
          )}
          <View style={[
            styles.bubble,
            isMe
              ? { backgroundColor: VERT, borderBottomRightRadius: 4 }
              : { backgroundColor: theme.card, borderBottomLeftRadius: 4, borderWidth: 1, borderColor: theme.cardBorder }
          ]}>
            <Text style={[styles.bubbleTxt, { color: isMe ? '#fff' : theme.text }]}>
              {item.Contenu}
            </Text>
            <Text style={[styles.bubbleHeure, { color: isMe ? 'rgba(255,255,255,0.7)' : theme.textMuted }]}>
              {formatHeure(item.CreatedAt)}
              {isMe && <Text>{item.Lu ? ' ✓✓' : ' ✓'}</Text>}
            </Text>
          </View>
        </View>
      </View>
    );
  };

  return (
    <View style={[styles.wrapper, { backgroundColor: theme.bg }]}>
      <StatusBar barStyle="light-content" backgroundColor={VERT} />

      <FlatList
        ref={flatRef}
        data={messages}
        keyExtractor={item => `msg-${item.Id_Message}`}
        renderItem={renderMessage}
        contentContainerStyle={{
          padding: 16,
          paddingBottom: insets.bottom + 80,
          gap: 4,
        }}
        onContentSizeChange={() => flatRef.current?.scrollToEnd({ animated: false })}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        ListEmptyComponent={() => (
          <View style={styles.emptyBox}>
            <Text style={styles.emptyIcon}>💬</Text>
            <Text style={[styles.emptyTxt, { color: theme.textSub }]}>
              Démarrez la conversation avec {nomProf}
            </Text>
          </View>
        )}
      />

      {/* BARRE SAISIE */}
      <View style={[
        styles.inputBar,
        {
          backgroundColor: theme.card,
          borderTopColor: theme.cardBorder,
          paddingBottom: insets.bottom + 8,
        }
      ]}>
        <TextInput
          style={[styles.input, {
            backgroundColor: theme.bg,
            borderColor: theme.cardBorder,
            color: theme.text,
          }]}
          placeholder={`Message à ${nomProf}...`}
          placeholderTextColor={theme.textMuted}
          value={input}
          onChangeText={setInput}
          multiline
          maxLength={500}
        />
        <TouchableOpacity
          style={[styles.sendBtn, { backgroundColor: input.trim() ? VERT : theme.cardBorder }]}
          onPress={envoyer}
          disabled={!input.trim() || sending}
        >
          {sending
            ? <ActivityIndicator size="small" color="#fff" />
            : <Text style={styles.sendTxt}>▶</Text>
          }
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: { flex: 1 },
  center:  { flex: 1, justifyContent: 'center', alignItems: 'center' },
  emptyBox:  { alignItems: 'center', marginTop: 80 },
  emptyIcon: { fontSize: 48, marginBottom: 12 },
  emptyTxt:  { fontSize: 14, textAlign: 'center' },
  dateSep:    { alignItems: 'center', marginVertical: 8 },
  dateSepTxt: { fontSize: 11, fontWeight: '600', paddingHorizontal: 12, paddingVertical: 3, borderRadius: 10 },
  bubbleRow:      { flexDirection: 'row', alignItems: 'flex-end', marginBottom: 6, gap: 6 },
  bubbleRowMe:    { justifyContent: 'flex-end' },
  bubbleRowOther: { justifyContent: 'flex-start' },
  avatarMini:    { width: 28, height: 28, borderRadius: 14, justifyContent: 'center', alignItems: 'center' },
  avatarMiniTxt: { fontSize: 12, fontWeight: '900' },
  bubble:      { maxWidth: '75%', padding: 10, borderRadius: 16 },
  bubbleTxt:   { fontSize: 14, lineHeight: 20 },
  bubbleHeure: { fontSize: 10, marginTop: 4, textAlign: 'right' },
  inputBar: {
    flexDirection: 'row',
    paddingHorizontal: 12,
    paddingTop: 10,
    borderTopWidth: 1,
    alignItems: 'flex-end',
    gap: 8,
  },
  input: {
    flex: 1, minHeight: 44, maxHeight: 100,
    borderRadius: 22, paddingHorizontal: 16,
    paddingVertical: 10, fontSize: 14, borderWidth: 1.5,
  },
  sendBtn: { width: 44, height: 44, borderRadius: 22, justifyContent: 'center', alignItems: 'center' },
  sendTxt: { color: '#fff', fontSize: 16 },
});