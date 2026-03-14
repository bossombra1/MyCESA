import React, { useState, useEffect } from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { AuthProvider } from './src/context/AuthContext';
import { ThemeProvider } from './src/context/ThemeContext';
import AppNavigator from './src/navigation/AppNavigator';
import SplashAnimScreen from './src/screens/SplashAnimScreen';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function App() {
  const [splashDone, setSplashDone] = useState(false);

  useEffect(() => {
    if (splashDone) initNotifications();
  }, [splashDone]);

  const initNotifications = async () => {
    try {
      const { enregistrerTokenPush } = await import('./src/utils/notifications');
      const stored = await AsyncStorage.getItem('user');
      if (stored) {
        const user = JSON.parse(stored);
        await enregistrerTokenPush(user.Id_UTILISATEUR);
      }
    } catch (e) {
      console.log('Init notifs:', e);
    }
  };

  if (!splashDone) {
    return <SplashAnimScreen onFinish={() => setSplashDone(true)} />;
  }

  return (
    <SafeAreaProvider>
      <ThemeProvider>
        <AuthProvider>
          <AppNavigator />
        </AuthProvider>
      </ThemeProvider>
    </SafeAreaProvider>
  );
}