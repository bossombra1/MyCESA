import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity,
  StyleSheet, Alert, ActivityIndicator,
  KeyboardAvoidingView, Platform, ScrollView, Pressable
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import API from '../api/api';

export default function LoginScreen({ navigation }) {
  const [login, setLogin] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!login || !password) {
      if (Platform.OS === 'web') {
        window.alert('Veuillez remplir tous les champs');
      } else {
        Alert.alert('Erreur', 'Veuillez remplir tous les champs');
      }
      return;
    }
    setLoading(true);
    try {
      const response = await API.post('/auth/login', {
        Login_User: login,
        Password_User: password,
      });
      await AsyncStorage.setItem('token', response.data.token);
      await AsyncStorage.setItem('user', JSON.stringify(response.data.user));
      navigation.replace('Home');
    } catch (error) {
      const msg = error.response?.data?.error || 'Problème réseau';
      if (Platform.OS === 'web') {
        window.alert('Erreur de connexion : ' + msg);
      } else {
        Alert.alert('Erreur de connexion', msg);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.nativeEvent.key === 'Enter') handleLogin();
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.logoBox}>
          <Text style={styles.logoText}>🎓</Text>
          <Text style={styles.titre}>MyCESA</Text>
          <Text style={styles.sousTitre}>Espace Étudiant</Text>
        </View>

        <View style={styles.formBox}>
          <Text style={styles.label}>Identifiant</Text>
          <TextInput
            style={styles.input}
            placeholder="Votre identifiant"
            placeholderTextColor="#94A3B8"
            value={login}
            onChangeText={setLogin}
            autoCapitalize="none"
            onSubmitEditing={handleLogin}
          />

          <Text style={styles.label}>Mot de passe</Text>
          <TextInput
            style={styles.input}
            placeholder="Votre mot de passe"
            placeholderTextColor="#94A3B8"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            onKeyPress={handleKeyPress}
            onSubmitEditing={handleLogin}
          />

          <Pressable
            style={({ pressed, hovered }) => [
              styles.btn,
              pressed && { opacity: 0.8, transform: [{ scale: 0.98 }] },
              hovered && { backgroundColor: '#1D4ED8' },
            ]}
            onPress={handleLogin}
            disabled={loading}
          >
            {loading
              ? <ActivityIndicator color="#fff" />
              : <Text style={styles.btnTxt}>Se connecter</Text>
            }
          </Pressable>
        </View>

        <Text style={styles.footer}>MyCESA © 2026</Text>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    backgroundColor: '#F0F4FF',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  logoBox: {
    alignItems: 'center',
    marginBottom: 40,
  },
  logoText: { fontSize: 64 },
  titre: {
    fontSize: 40,
    fontWeight: '800',
    color: '#1B2A4A',
    marginTop: 8,
  },
  sousTitre: {
    fontSize: 16,
    color: '#64748B',
    marginTop: 4,
  },
  formBox: {
    width: '100%',
    maxWidth: 420,
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 5,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1B2A4A',
    marginBottom: 6,
  },
  input: {
    width: '100%',
    height: 52,
    borderWidth: 1.5,
    borderColor: '#CBD5E1',
    borderRadius: 12,
    paddingHorizontal: 16,
    marginBottom: 16,
    backgroundColor: '#F8FAFF',
    fontSize: 15,
    color: '#1B2A4A',
    outlineStyle: 'none',
  },
  btn: {
    width: '100%',
    height: 52,
    backgroundColor: '#2563EB',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 8,
    cursor: 'pointer',
  },
  btnTxt: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
  footer: {
    marginTop: 32,
    color: '#94A3B8',
    fontSize: 13,
  },
});