import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import LoginScreen from '../screens/LoginScreen';
import HomeScreen from '../screens/HomeScreen';
import NotesScreen from '../screens/NotesScreen';
import AbsencesScreen from '../screens/AbsencesScreen';
import PaiementsScreen from '../screens/PaiementsScreen';
import EmploiTempsScreen from '../screens/EmploiTempsScreen';
import ChatBotScreen from '../screens/ChatBotScreen';
import NotificationsScreen from '../screens/NotificationsScreen';
import ProfilScreen from '../screens/ProfilScreen';

const Stack = createNativeStackNavigator();

export default function AppNavigator() {
  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName="Login"
        screenOptions={{
          headerStyle: { backgroundColor: '#1B2A4A' },
          headerTintColor: '#fff',
          headerTitleStyle: { fontWeight: 'bold' },
        }}>
        <Stack.Screen name="Login" component={LoginScreen} options={{ headerShown: false }} />
        <Stack.Screen name="Home" component={HomeScreen} options={{ headerShown: false }} />
        <Stack.Screen name="Notes" component={NotesScreen} options={{ title: 'Mes Notes' }} />
        <Stack.Screen name="Absences" component={AbsencesScreen} options={{ title: 'Mes Absences' }} />
        <Stack.Screen name="Paiements" component={PaiementsScreen} options={{ title: 'Mes Paiements' }} />
        <Stack.Screen name="EmploiTemps" component={EmploiTempsScreen} options={{ title: 'Emploi du Temps' }} />
        <Stack.Screen name="ChatBot" component={ChatBotScreen} options={{ title: 'Assistant MyCESA' }} />
        <Stack.Screen name="Notifications" component={NotificationsScreen} options={{ title: 'Notifications' }} />
        <Stack.Screen name="Profil" component={ProfilScreen} options={{ title: 'Mon Profil' }} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}