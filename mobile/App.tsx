import React, { useState, useEffect, useRef } from 'react';
import { 
  StyleSheet, View, SafeAreaView, StatusBar, ActivityIndicator, 
  Text, TouchableOpacity, Animated, Easing, Dimensions
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Colors } from './src/constants/Colors';
import { useAuth } from './src/hooks/useAuth';
import { LoginScreen } from './src/screens/LoginScreen';
import { RegisterScreen } from './src/screens/RegisterScreen';
import { OtpScreen } from './src/screens/OtpScreen';
import { DashboardScreen } from './src/screens/DashboardScreen';

import { AuthProvider } from './src/context/AuthContext';

const { width } = Dimensions.get('window');

function AppContent() {
  const {
    token,
    user,
    loading: authLoading,
    apiBaseUrl,
    updateServerIp,
    login,
    register,
    logout
  } = useAuth();

  const [showSplash, setShowSplash] = useState(true);
  const [onboarded, setOnboarded] = useState(false);
  const [navigationState, setNavigationState] = useState<'login' | 'register'>('login');
  
  // Onboarding slide index
  const [onboardingIndex, setOnboardingIndex] = useState(0);

  // Animations
  const rotateAnim = useRef(new Animated.Value(0)).current;
  const fadeAnim = useRef(new Animated.Value(1)).current;
  const slideAnim = useRef(new Animated.Value(0)).current;

  // Initialize Splash and Onboarding states
  useEffect(() => {
    // Spin animation for Splash Shield
    Animated.loop(
      Animated.timing(rotateAnim, {
        toValue: 1,
        duration: 3500,
        easing: Easing.linear,
        useNativeDriver: true,
      })
    ).start();

    const checkStates = async () => {
      try {
        const hasOnboarded = await AsyncStorage.getItem('ciphereye_onboarded');
        if (hasOnboarded === 'true') {
          setOnboarded(true);
        }
      } catch (err) {
        console.warn('AsyncStorage read error', err);
      } finally {
        // Dismiss Splash Screen after 1.2s
        setTimeout(() => {
          Animated.timing(fadeAnim, {
            toValue: 0,
            duration: 400,
            useNativeDriver: false,
          }).start();
          setShowSplash(false);
        }, 1200);
      }
    };
    checkStates();
  }, []);

  const handleRegisterSuccess = async (usernameField: string, emailField: string, passwordField: string, fullNameField: string) => {
    await register(usernameField, emailField, passwordField, fullNameField);
  };

  const handleCompleteOnboarding = async () => {
    try {
      await AsyncStorage.setItem('ciphereye_onboarded', 'true');
      setOnboarded(true);
    } catch (err) {
      setOnboarded(true);
    }
  };

  // Rotate spin mapping
  const spin = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  // Loading indicator for authorization check
  if (authLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={Colors.accentPrimary} />
      </View>
    );
  }

  // 1. SPLASH SCREEN VIEW
  if (showSplash) {
    return (
      <Animated.View style={[styles.splashContainer, { opacity: fadeAnim }]}>
        <StatusBar barStyle="light-content" backgroundColor="#0A0E1A" />
        <View style={styles.splashContent}>
          
          {/* Animated Shield Logo Grid */}
          <View style={styles.shieldWrapper}>
            <Animated.View style={[styles.glowingShield, { transform: [{ rotate: spin }] }]}>
              {/* Outer SVG shield approximation */}
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

  // 2. ONBOARDING SCREEN DECK
  if (!onboarded) {
    const onboardingSlides = [
      {
        title: 'Protect Against Scams',
        desc: 'Advanced autonomous machine learning classifiers protect you from fraudulent online vectors in real-time.',
        icon: '🛡️',
        bg: '#F0F4FF'
      },
      {
        title: 'Instant QR Scanners',
        desc: 'Intercept malicious redirection chains hidden inside printed stickers or payment QR codes instantly.',
        icon: '📷',
        bg: '#EAF8FF'
      },
      {
        title: 'Scam Messages Detector',
        desc: 'NLP transformers parse suspicious SMS, emails, and link redirects to audit threat credentials safety.',
        icon: '🔍',
        bg: '#EEF2F6'
      },
      {
        title: 'Cypher AI Chat Advisor',
        desc: 'A smart chatbot assistant ready 24/7 to answer threat vulnerabilities and explain cybersecurity topics.',
        icon: '🤖',
        bg: '#F5F0FF'
      }
    ];

    const slide = onboardingSlides[onboardingIndex];

    return (
      <SafeAreaView style={styles.onboardingRoot}>
        <StatusBar barStyle="dark-content" backgroundColor="#F7F9FC" />
        
        {/* Onboarding header */}
        <View style={styles.onboardingHeader}>
          <Text style={styles.onboardingLogo}>👁️‍🗨️ CypherEye</Text>
          <TouchableOpacity onPress={handleCompleteOnboarding}>
            <Text style={styles.skipButtonText}>Skip</Text>
          </TouchableOpacity>
        </View>

        {/* Dynamic slide page content */}
        <View style={styles.slideContent}>
          <View style={[styles.illustrationContainer, { backgroundColor: slide.bg }]}>
            <Text style={styles.illustrationText}>{slide.icon}</Text>
            {/* Animated scanning bar overlay for visual premium */}
            {onboardingIndex === 2 && (
              <View style={styles.scannerAnimationLine} />
            )}
          </View>
          
          <View style={styles.textContainer}>
            <Text style={styles.slideTitle}>{slide.title}</Text>
            <Text style={styles.slideDesc}>{slide.desc}</Text>
          </View>
        </View>

        {/* Footer Navigation panel */}
        <View style={styles.onboardingFooter}>
          {/* Index Dots */}
          <View style={styles.dotsRow}>
            {onboardingSlides.map((_, idx) => (
              <View 
                key={idx} 
                style={[
                  styles.dotItem, 
                  idx === onboardingIndex && styles.dotItemActive
                ]} 
              />
            ))}
          </View>

          {/* Nav triggers */}
          {onboardingIndex < 3 ? (
            <TouchableOpacity 
              style={styles.onboardingBtn} 
              onPress={() => setOnboardingIndex(onboardingIndex + 1)}
            >
              <Text style={styles.onboardingBtnText}>Next</Text>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity 
              style={[styles.onboardingBtn, { backgroundColor: Colors.accentPrimary }]} 
              onPress={handleCompleteOnboarding}
            >
              <Text style={styles.onboardingBtnText}>Get Started</Text>
            </TouchableOpacity>
          )}
        </View>
      </SafeAreaView>
    );
  }

  // 3. MAIN SECURITY ROUTER
  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor={Colors.bgPrimary} />
      
      {token && user ? (
        <DashboardScreen
          user={user}
          token={token}
          apiBaseUrl={apiBaseUrl}
          onLogout={logout}
          onUpdateServerIp={updateServerIp}
        />
      ) : navigationState === 'register' ? (
        <RegisterScreen
          onRegister={handleRegisterSuccess}
          onGoToLogin={() => setNavigationState('login')}
        />
      ) : (
        <LoginScreen
          onLogin={async (userVal, passVal) => {
            await login(userVal, passVal);
          }}
          onGoToRegister={() => setNavigationState('register')}
        />
      )}
    </SafeAreaView>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Colors.bgPrimary,
  },
  loadingContainer: {
    flex: 1,
    backgroundColor: Colors.bgPrimary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  
  // Splash styles
  splashContainer: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#0A0E1A',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 9999,
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

  // Onboarding styles
  onboardingRoot: {
    flex: 1,
    backgroundColor: '#F7F9FC',
    justifyContent: 'space-between',
    padding: 24,
  },
  onboardingHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    height: 50,
  },
  onboardingLogo: {
    fontSize: 18,
    fontWeight: '800',
    color: Colors.accentPrimary,
  },
  skipButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.textSecondary,
  },
  slideContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 20,
  },
  illustrationContainer: {
    width: width * 0.72,
    height: width * 0.72,
    borderRadius: 36,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 40,
    shadowColor: Colors.accentPrimary,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.05,
    shadowRadius: 20,
    elevation: 2,
    overflow: 'hidden',
  },
  illustrationText: {
    fontSize: 80,
  },
  scannerAnimationLine: {
    position: 'absolute',
    left: 0,
    width: '100%',
    height: 4,
    backgroundColor: Colors.accentPrimary,
    shadowColor: Colors.accentPrimary,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 10,
    elevation: 4,
    top: '50%',
  },
  textContainer: {
    alignItems: 'center',
    paddingHorizontal: 16,
  },
  slideTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: Colors.textPrimary,
    textAlign: 'center',
    marginBottom: 12,
  },
  slideDesc: {
    fontSize: 14,
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
  },
  onboardingFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    height: 60,
    marginTop: 20,
  },
  dotsRow: {
    flexDirection: 'row',
    gap: 8,
  },
  dotItem: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#CBD5E1',
  },
  dotItemActive: {
    width: 24,
    backgroundColor: Colors.accentPrimary,
  },
  onboardingBtn: {
    height: 48,
    backgroundColor: Colors.textPrimary,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 2,
  },
  onboardingBtnText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
  }
});
