import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Alert, StyleSheet, TextInput } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useAuthContext } from '../../src/context/AuthContext';
import { CyberButton } from '../../src/components/CyberButton';

export default function OtpScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ userId?: string; otpDebug?: string; email?: string }>();
  const { verifyOtp } = useAuthContext();
  
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);

  const userId = params.userId || 'demo-user-id';
  const otpDebug = params.otpDebug;
  const userEmail = params.email || 'your email';

  const handleVerify = async () => {
    if (code.trim().length < 6) {
      Alert.alert('Invalid OTP', 'Please enter the complete 6-digit security code.');
      return;
    }

    setLoading(true);
    try {
      await verifyOtp(userId, code.trim());
      Alert.alert('Verification Successful', 'Your email has been verified. Welcome to CypherEye!', [
        { text: 'Continue to Console', onPress: () => router.replace('/(tabs)/home') }
      ]);
    } catch (err: any) {
      Alert.alert('Verification Failed', err.message || 'Incorrect security code. Please check and try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.scrollContainer} keyboardShouldPersistTaps="handled">
      <View style={styles.content}>
        <View style={styles.headerContainer}>
          <View style={styles.logoBadge}>
            <Text style={styles.logoIcon}>🛡️</Text>
          </View>
          <Text style={styles.title}>Email Verification</Text>
          <Text style={styles.subtitle}>
            Enter the 6-digit security code sent to {userEmail}
          </Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Security Code Verification</Text>
          <Text style={styles.cardSub}>
            Verify your email identity to unlock complete threat intelligence scanners.
          </Text>

          {otpDebug && (
            <View style={styles.debugBox}>
              <Text style={styles.debugText}>[Sandbox Security Code: {otpDebug}]</Text>
            </View>
          )}

          <TextInput
            style={styles.otpInput}
            value={code}
            onChangeText={setCode}
            placeholder="000000"
            placeholderTextColor="#94A3B8"
            keyboardType="number-pad"
            maxLength={6}
            autoFocus={true}
          />

          <CyberButton
            title={loading ? "Verifying Code..." : "Verify & Unlock Console"}
            onPress={handleVerify}
            loading={loading}
            style={{ width: '100%', marginTop: 16 }}
          />

          <TouchableOpacity 
            onPress={() => router.replace('/(auth)/login')} 
            style={styles.backRow}
          >
            <Text style={styles.backLink}>Return to Login</Text>
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scrollContainer: {
    flexGrow: 1,
    backgroundColor: '#F8FAFC',
    justifyContent: 'center',
  },
  content: {
    paddingHorizontal: 20,
    paddingVertical: 40,
  },
  headerContainer: {
    alignItems: 'center',
    marginBottom: 24,
  },
  logoBadge: {
    width: 64,
    height: 64,
    borderRadius: 20,
    backgroundColor: '#EFF6FF',
    borderWidth: 1,
    borderColor: '#BFDBFE',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  logoIcon: {
    fontSize: 28,
  },
  title: {
    fontSize: 24,
    fontWeight: '900',
    color: '#0F172A',
    letterSpacing: 0.5,
  },
  subtitle: {
    fontSize: 13,
    fontWeight: '500',
    color: '#64748B',
    marginTop: 6,
    textAlign: 'center',
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 24,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.08,
    shadowRadius: 16,
    elevation: 4,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#0F172A',
    marginBottom: 4,
  },
  cardSub: {
    fontSize: 12,
    color: '#64748B',
    lineHeight: 18,
    marginBottom: 20,
  },
  debugBox: {
    backgroundColor: '#FEF3C7',
    borderColor: '#F59E0B',
    borderWidth: 1,
    borderRadius: 8,
    padding: 10,
    marginBottom: 16,
    alignItems: 'center',
  },
  debugText: {
    color: '#92400E',
    fontWeight: '700',
    fontSize: 12,
  },
  otpInput: {
    backgroundColor: '#F1F5F9',
    borderWidth: 1.5,
    borderColor: '#CBD5E1',
    borderRadius: 14,
    paddingVertical: 14,
    fontSize: 26,
    fontWeight: '800',
    textAlign: 'center',
    letterSpacing: 10,
    color: '#0F172A',
  },
  backRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 20,
  },
  backLink: {
    fontSize: 13,
    fontWeight: '800',
    color: '#2563EB',
  },
});
