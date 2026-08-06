import React, { useState } from 'react';
import { StyleSheet, View, Text, SafeAreaView, TouchableOpacity, Dimensions } from 'react-native';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Colors } from '../src/constants/Colors';

const { width } = Dimensions.get('window');

export default function Onboarding() {
  const router = useRouter();
  const [slideIndex, setSlideIndex] = useState(0);

  const slides = [
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

  const handleFinish = async () => {
    try {
      await AsyncStorage.setItem('ciphereye_onboarded', 'true');
      router.replace('/(auth)/login');
    } catch {
      router.replace('/(auth)/login');
    }
  };

  const slide = slides[slideIndex];

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="dark" backgroundColor={Colors.bgPrimary} />
      
      <View style={styles.header}>
        <Text style={styles.logo}>👁️‍Q CypherEye</Text>
        <TouchableOpacity onPress={handleFinish}>
          <Text style={styles.skipText}>Skip</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.content}>
        <View style={[styles.illustration, { backgroundColor: slide.bg }]}>
          <Text style={{ fontSize: 80 }}>{slide.icon}</Text>
          {slideIndex === 2 && (
            <View style={styles.scannerLine} />
          )}
        </View>
        
        <View style={styles.textContainer}>
          <Text style={styles.title}>{slide.title}</Text>
          <Text style={styles.desc}>{slide.desc}</Text>
        </View>
      </View>

      <View style={styles.footer}>
        <View style={styles.dotsRow}>
          {slides.map((_, idx) => (
            <View 
              key={idx} 
              style={[
                styles.dot, 
                idx === slideIndex && styles.dotActive
              ]} 
            />
          ))}
        </View>

        {slideIndex < 3 ? (
          <TouchableOpacity 
            style={styles.btn} 
            onPress={() => setSlideIndex(slideIndex + 1)}
          >
            <Text style={styles.btnText}>Next</Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity 
            style={[styles.btn, { backgroundColor: Colors.accentPrimary }]} 
            onPress={handleFinish}
          >
            <Text style={styles.btnText}>Get Started</Text>
          </TouchableOpacity>
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F7F9FC',
    justifyContent: 'space-between',
    padding: 24,
    paddingTop: 50,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    height: 50,
  },
  logo: {
    fontSize: 18,
    fontWeight: '800',
    color: Colors.accentPrimary,
  },
  skipText: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.textSecondary,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 20,
  },
  illustration: {
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
    position: 'relative',
  },
  scannerLine: {
    position: 'absolute',
    left: 0,
    width: '100%',
    height: 4,
    backgroundColor: Colors.accentPrimary,
    top: '50%',
  },
  textContainer: {
    alignItems: 'center',
    paddingHorizontal: 16,
  },
  title: {
    fontSize: 22,
    fontWeight: '800',
    color: Colors.textPrimary,
    textAlign: 'center',
    marginBottom: 12,
  },
  desc: {
    fontSize: 14,
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
  },
  footer: {
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
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#CBD5E1',
  },
  dotActive: {
    width: 24,
    backgroundColor: Colors.accentPrimary,
  },
  btn: {
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
  btnText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
  }
});
