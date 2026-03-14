import React, { useEffect, useRef } from 'react';
import {
  View, Text, StyleSheet, Animated, Dimensions, StatusBar
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

const { width, height } = Dimensions.get('window');
const VERT   = '#2E7D32';
const VERT2  = '#1B5E20';
const ORANGE = '#D84315';

export default function SplashAnimScreen({ onFinish }) {

  // Animations
  const logoScale    = useRef(new Animated.Value(0)).current;
  const logoOpacity  = useRef(new Animated.Value(0)).current;
  const textOpacity  = useRef(new Animated.Value(0)).current;
  const sloganOpacity = useRef(new Animated.Value(0)).current;
  const barreWidth   = useRef(new Animated.Value(0)).current;
  const circleScale  = useRef(new Animated.Value(0)).current;
  const fadeOut      = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.sequence([
      // 1. Cercle décoratif apparaît
      Animated.spring(circleScale, {
        toValue: 1, friction: 6, tension: 40, useNativeDriver: true,
      }),
      // 2. Logo pop
      Animated.parallel([
        Animated.spring(logoScale, {
          toValue: 1, friction: 5, tension: 60, useNativeDriver: true,
        }),
        Animated.timing(logoOpacity, {
          toValue: 1, duration: 400, useNativeDriver: true,
        }),
      ]),
      // 3. Texte apparaît
      Animated.timing(textOpacity, {
        toValue: 1, duration: 500, useNativeDriver: true,
      }),
      // 4. Slogan
      Animated.timing(sloganOpacity, {
        toValue: 1, duration: 400, useNativeDriver: true,
      }),
      // 5. Barre de progression (pas useNativeDriver car width)
      Animated.timing(barreWidth, {
        toValue: width * 0.6, duration: 800, useNativeDriver: false,
      }),
      // 6. Pause
      Animated.delay(400),
      // 7. Fade out
      Animated.timing(fadeOut, {
        toValue: 0, duration: 500, useNativeDriver: true,
      }),
    ]).start(() => onFinish());
  }, []);

  return (
    <Animated.View style={[styles.wrapper, { opacity: fadeOut }]}>
      <StatusBar barStyle="light-content" backgroundColor={VERT2} />
      <LinearGradient
        colors={[VERT2, VERT, '#2E7D32']}
        style={styles.gradient}
      >
        {/* CERCLES DÉCORATIFS */}
        <Animated.View style={[styles.decoCircle1, { transform: [{ scale: circleScale }] }]} />
        <Animated.View style={[styles.decoCircle2, { transform: [{ scale: circleScale }] }]} />
        <Animated.View style={[styles.decoCircle3, { transform: [{ scale: circleScale }] }]} />

        {/* LOGO */}
        <Animated.View style={[
          styles.logoBadge,
          { opacity: logoOpacity, transform: [{ scale: logoScale }] }
        ]}>
          <Text style={styles.logoCofe}>COFE</Text>
          <View style={styles.logoDivider} />
          <Text style={styles.logoCesa}>CESA</Text>
        </Animated.View>

        {/* TEXTE */}
        <Animated.View style={{ opacity: textOpacity, alignItems: 'center', marginTop: 28 }}>
          <Text style={styles.appName}>MyCESA</Text>
          <Text style={styles.groupeName}>GROUPE COFE-CESA</Text>
        </Animated.View>

        {/* SLOGAN */}
        <Animated.View style={{ opacity: sloganOpacity, alignItems: 'center', marginTop: 12 }}>
          <Text style={styles.slogan}>« Une excellence à votre service ! »</Text>
          <Text style={styles.annee}>Fondé en 1992 · Abidjan, Côte d'Ivoire 🇨🇮</Text>
        </Animated.View>

        {/* BARRE PROGRESSION */}
        <View style={styles.barreContainer}>
          <Animated.View style={[styles.barre, { width: barreWidth }]} />
        </View>
        <Text style={styles.chargement}>Chargement...</Text>

      </LinearGradient>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  wrapper: { flex: 1 },
  gradient: {
    flex: 1, justifyContent: 'center', alignItems: 'center',
    overflow: 'hidden',
  },

  // DÉCOS
  decoCircle1: {
    position: 'absolute', width: 350, height: 350, borderRadius: 175,
    backgroundColor: 'rgba(255,255,255,0.05)',
    top: -80, right: -80,
  },
  decoCircle2: {
    position: 'absolute', width: 250, height: 250, borderRadius: 125,
    backgroundColor: 'rgba(255,255,255,0.04)',
    bottom: -60, left: -60,
  },
  decoCircle3: {
    position: 'absolute', width: 150, height: 150, borderRadius: 75,
    backgroundColor: 'rgba(216,67,21,0.15)',
    top: height * 0.2, left: -40,
  },

  // LOGO
  logoBadge: {
    width: 110, height: 110, borderRadius: 28,
    backgroundColor: '#fff',
    justifyContent: 'center', alignItems: 'center',
    borderWidth: 4, borderColor: ORANGE,
    elevation: 12,
    shadowColor: '#000', shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3, shadowRadius: 16,
  },
  logoCofe: { color: VERT, fontSize: 22, fontWeight: '900', letterSpacing: 2 },
  logoDivider: { width: 40, height: 2, backgroundColor: ORANGE, marginVertical: 4 },
  logoCesa: { color: ORANGE, fontSize: 18, fontWeight: '900', letterSpacing: 2 },

  // TEXTES
  appName: {
    color: '#fff', fontSize: 38, fontWeight: '900',
    letterSpacing: 3,
    textShadowColor: 'rgba(0,0,0,0.2)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  groupeName: {
    color: 'rgba(255,255,255,0.75)', fontSize: 14,
    fontWeight: '700', letterSpacing: 1, marginTop: 4,
  },
  slogan: {
    color: 'rgba(255,255,255,0.85)', fontSize: 13,
    fontStyle: 'italic', textAlign: 'center',
  },
  annee: {
    color: 'rgba(255,255,255,0.55)', fontSize: 12,
    marginTop: 6, textAlign: 'center',
  },

  // BARRE
  barreContainer: {
    width: width * 0.6, height: 4, backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 4, marginTop: 48, overflow: 'hidden',
  },
  barre: {
    height: '100%', backgroundColor: ORANGE, borderRadius: 4,
  },
  chargement: {
    color: 'rgba(255,255,255,0.5)', fontSize: 12,
    marginTop: 10, letterSpacing: 1,
  },
});