import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { View, Text, StyleSheet, Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import LoginScreen from '../screens/LoginScreen';
import HomeScreen from '../screens/HomeScreen';
import NotesScreen from '../screens/NotesScreen';
import AbsencesScreen from '../screens/AbsencesScreen';
import PaiementsScreen from '../screens/PaiementsScreen';
import EmploiTempsScreen from '../screens/EmploiTempsScreen';
import ChatBotScreen from '../screens/ChatBotScreen';
import NotificationsScreen from '../screens/NotificationsScreen';
import RecompensesScreen from '../screens/RecompensesScreen';
import ProfilScreen from '../screens/ProfilScreen';
import CarteEtudiantScreen from '../screens/CarteEtudiantScreen';
import AProposScreen from '../screens/AProposScreen';

const Stack = createNativeStackNavigator();
const Tab   = createBottomTabNavigator();

const VERT   = '#2E7D32';
const ORANGE = '#D84315';

function TabIcon({ icon, label, focused }) {
  return (
    <View style={styles.tabItem}>
      <Text style={[styles.tabIcon, focused && styles.tabIconActive]}>{icon}</Text>
      <Text style={[styles.tabLabel, focused && styles.tabLabelActive]}>{label}</Text>
      {focused && <View style={styles.tabDot} />}
    </View>
  );
}

function MainTabs() {
  const insets = useSafeAreaInsets();
  // Sur Android, on ajoute du padding manuel pour éviter la barre de navigation
  const bottomPad = Platform.OS === 'android' ? Math.max(insets.bottom, 16) + 8 : insets.bottom;

  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarStyle: [styles.tabBar, { 
          paddingBottom: bottomPad, 
          height: 60 + bottomPad 
        }],
        tabBarShowLabel: false,
      }}
    >
      <Tab.Screen
        name="Home"
        component={HomeScreen}
        options={{
          tabBarIcon: ({ focused }) => <TabIcon icon="🏠" label="Accueil" focused={focused} />,
        }}
      />
      <Tab.Screen
        name="EmploiTemps"
        component={EmploiTempsScreen}
        options={{
          tabBarIcon: ({ focused }) => <TabIcon icon="🕐" label="Emploi" focused={focused} />,
        }}
      />
      <Tab.Screen
        name="Profil"
        component={ProfilScreen}
        options={{
          tabBarIcon: ({ focused }) => <TabIcon icon="👤" label="Profil" focused={focused} />,
        }}
      />
    </Tab.Navigator>
  );
}

export default function AppNavigator() {
  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName="Login"
        screenOptions={{
          headerStyle: { backgroundColor: VERT },
          headerTintColor: '#fff',
          headerTitleStyle: { fontWeight: 'bold' },
        }}
      >
        <Stack.Screen name="Login"         component={LoginScreen}         options={{ headerShown: false }} />
        <Stack.Screen name="Main"          component={MainTabs}            options={{ headerShown: false }} />
        <Stack.Screen name="Notes"         component={NotesScreen}         options={{ title: 'Mes Notes' }} />
        <Stack.Screen name="Absences"      component={AbsencesScreen}      options={{ title: 'Mes Absences' }} />
        <Stack.Screen name="Paiements"     component={PaiementsScreen}     options={{ title: 'Mes Paiements' }} />
        <Stack.Screen name="ChatBot"       component={ChatBotScreen}       options={{ title: 'Assistant MyCESA' }} />
        <Stack.Screen name="Notifications" component={NotificationsScreen} options={{ title: 'Notifications' }} />
        <Stack.Screen name="Recompenses"   component={RecompensesScreen} options={{ title: '🏆 Mes Récompenses' }} />
        <Stack.Screen name="Carte"         component={CarteEtudiantScreen} options={{ title: 'Ma Carte Scolaire' }} />
        <Stack.Screen name="APropos"       component={AProposScreen}       options={{ title: 'À propos de CESA' }} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    backgroundColor: '#fff',
    borderTopWidth: 0,
    elevation: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
  },
  tabItem: { alignItems: 'center', justifyContent: 'center', paddingTop: 6 },
  tabIcon: { fontSize: 24, opacity: 0.4 },
  tabIconActive: { opacity: 1 },
  tabLabel: { fontSize: 11, color: '#94A3B8', fontWeight: '600', marginTop: 2 },
  tabLabelActive: { color: VERT, fontWeight: '800' },
  tabDot: { width: 4, height: 4, borderRadius: 2, backgroundColor: VERT, marginTop: 3 },
});