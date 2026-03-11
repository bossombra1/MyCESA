import React, { useState, useRef } from 'react';
import {
  View, Text, TextInput, TouchableOpacity,
  StyleSheet, ScrollView, ActivityIndicator,
  KeyboardAvoidingView, Platform
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import API from '../api/api';

export default function ChatBotScreen() {
  const [messages, setMessages] = useState([
    { from: 'bot', text: 'Bonjour ! Je suis l\'assistant MyCESA 🎓. Comment puis-je t\'aider ?' }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef();

  const sendMessage = async () => {
    if (!input.trim()) return;
    const question = input.trim();
    setInput('');
    setMessages(prev => [...prev, { from: 'user', text: question }]);
    setLoading(true);
    try {
      const stored = await AsyncStorage.getItem('user');
      const user = JSON.parse(stored);
      const response = await API.post('/chatbot/ask', {
        question,
        Id_ETUDIANT: user.Id_UTILISATEUR,
      });
      setMessages(prev => [...prev, { from: 'bot', text: response.data.reponse }]);
    } catch (err) {
      setMessages(prev => [...prev, { from: 'bot', text: 'Désolé, une erreur est survenue. Réessaie plus tard.' }]);
    } finally {
      setLoading(false);
      setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 100);
    }
  };

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <View style={styles.container}>
        <ScrollView
          ref={scrollRef}
          style={styles.messages}
          contentContainerStyle={{ padding: 16 }}
          onContentSizeChange={() => scrollRef.current?.scrollToEnd({ animated: true })}
        >
          {messages.map((msg, index) => (
            <View key={index} style={[styles.bubble, msg.from === 'user' ? styles.userBubble : styles.botBubble]}>
              {msg.from === 'bot' && <Text style={styles.botIcon}>🤖</Text>}
              <Text style={[styles.bubbleTxt, msg.from === 'user' ? styles.userTxt : styles.botTxt]}>
                {msg.text}
              </Text>
            </View>
          ))}
          {loading && (
            <View style={styles.botBubble}>
              <Text style={styles.botIcon}>🤖</Text>
              <ActivityIndicator size="small" color="#2563EB" />
            </View>
          )}
        </ScrollView>

        <View style={styles.inputBox}>
          <TextInput
            style={styles.input}
            placeholder="Pose ta question..."
            placeholderTextColor="#94A3B8"
            value={input}
            onChangeText={setInput}
            onSubmitEditing={sendMessage}
            returnKeyType="send"
          />
          <TouchableOpacity style={styles.sendBtn} onPress={sendMessage} disabled={loading}>
            <Text style={styles.sendTxt}>➤</Text>
          </TouchableOpacity>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F0F4FF' },
  messages: { flex: 1 },
  bubble: { flexDirection: 'row', alignItems: 'flex-end', marginBottom: 12, maxWidth: '80%' },
  botBubble: { alignSelf: 'flex-start' },
  userBubble: { alignSelf: 'flex-end', flexDirection: 'row-reverse' },
  botIcon: { fontSize: 20, marginRight: 8 },
  bubbleTxt: { padding: 12, borderRadius: 16, fontSize: 14, lineHeight: 20 },
  botTxt: { backgroundColor: '#fff', color: '#1B2A4A', borderBottomLeftRadius: 4, elevation: 1 },
  userTxt: { backgroundColor: '#2563EB', color: '#fff', borderBottomRightRadius: 4 },
  inputBox: { flexDirection: 'row', padding: 12, backgroundColor: '#fff', borderTopWidth: 1, borderTopColor: '#E2E8F0', alignItems: 'center' },
  input: { flex: 1, height: 48, backgroundColor: '#F0F4FF', borderRadius: 24, paddingHorizontal: 16, fontSize: 14, color: '#1B2A4A' },
  sendBtn: { width: 48, height: 48, backgroundColor: '#2563EB', borderRadius: 24, justifyContent: 'center', alignItems: 'center', marginLeft: 8 },
  sendTxt: { color: '#fff', fontSize: 18 },
});