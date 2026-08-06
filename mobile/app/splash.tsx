import React, { useEffect, useRef } from 'react';
import { StyleSheet, View, Text, ActivityIndicator, Animated, Easing } from 'react-native';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { Colors } from '../src/constants/Colors';

export default function SplashScreen() {
  const router = useRouter();
  const rotateAnim = useRef(new Animated.Value(0)).current;
  const fadeAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    // Spin animation
    Animated.loop(
      Animated.timing(rotateAnim, {
        toValue: 1,
        duration: 3000,
        easing: Easing.linear,
        useNativeDriver: true,
      })
    ).start();

    // Redirect to onboarding
    const timer = setTimeout(() => {
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 500,
        useNativeDriver: true,
      }).start(() => {
        router.replace('/onboarding');
      });
    }, 2500);

    return () => clearTimeout(timer);
  }, []);

  const spin = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  return (
    <Animated.View style={[styles.container, { opacity: fadeAnim }]}>
      <StatusBar style="light" backgroundColor="#0A0E1A" />
      <View style={styles.splashContent}>
        <View style={styles.shieldWrapper}>
          <Animated.View style={[styles.glowingShield, { transform: [{ rotate: spin }] }]}>
            <View style={styles.shieldRing1} />
            <View style={styles.shieldRing2} />
          </Animated.View>
          <View style={styles.shieldCore}>
            <Text style={{ fontSize: 32 }}>🛡️</Text>
          </View>
        </View>

        <Text style={styles.splashTitle}>CypherEye AI</Text>
        <Text style={styles.splashTagline}>Your Personal AI Fraud Protection</Text>
        
        <ActivityIndicator size="small" color={Colors.accentPrimary} style={{ marginTop: 40 }} />
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0A0E1A',
    justifyContent: 'center',
    alignItems: 'center',
  },
  splashContent: {
    alignItems: 'center',
    width: '100%',
  },
  shieldWrapper: {
    position: 'relative',
    width: 140,
    height: 140,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  glowingShield: {
    position: 'absolute',
    width: 120,
    height: 120,
    justifyContent: 'center',
    alignItems: 'center',
  },
  shieldRing1: {
    position: 'absolute',
    width: 110,
    height: 110,
    borderWidth: 2,
    borderColor: Colors.accentPrimary,
    borderRadius: 55,
    borderStyle: 'dashed',
  },
  shieldRing2: {
    position: 'absolute',
    width: 120,
    height: 120,
    borderWidth: 1,
    borderColor: 'rgba(79, 124, 255, 0.3)',
    borderRadius: 60,
  },
  shieldCore: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(79, 124, 255, 0.12)',
    borderWidth: 1,
    borderColor: 'rgba(79, 124, 255, 0.4)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  splashTitle: {
    fontFamily: 'System',
    fontSize: 32,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: 1,
  },
  splashTagline: {
    fontFamily: 'System',
    fontSize: 14,
    color: Colors.textMuted,
    marginTop: 8,
    letterSpacing: 0.5,
  },
});
