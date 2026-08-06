import React, { useState } from 'react';
import { StyleSheet, View, Text, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { Colors } from '../constants/Colors';
import { CyberInput } from '../components/CyberInput';
import { CyberButton } from '../components/CyberButton';

interface OtpScreenProps {
  userId: string;
  otpDebug?: string;
  onVerify: (userId: string, code: string) => Promise<any>;
}

export const OtpScreen: React.FC<OtpScreenProps> = ({ userId, otpDebug, onVerify }) => {
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);

  const handleVerify = async () => {
    if (!code || code.length !== 6) {
      Alert.alert('Verification Refused', 'Please enter the 6-digit OTP code.');
      return;
    }
    setLoading(true);
    try {
      await onVerify(userId, code);
    } catch (err: any) {
      Alert.alert('Verification Failed', err.message || 'Verification failed. Recheck code.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
      <View style={styles.headerContainer}>
        <View style={styles.logoBadge}>
          <Text style={{ fontSize: 32 }}>🔑</Text>
        </View>
        <Text style={styles.title}>Secure OTP</Text>
        <Text style={styles.subtitle}>Multi-Factor Verification clearance required.</Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Enter Verification Code</Text>
        <Text style={styles.cardDesc}>We have dispatched a 6-digit OTP code. Enter it below to unlock access.</Text>

        {otpDebug && (
          <View style={styles.debugBox}>
            <Text style={styles.debugTitle}>🔑 Debug OTP Token:</Text>
            <Text style={styles.debugValue}>{otpDebug}</Text>
          </View>
        )}

        <CyberInput
          placeholder="000000"
          value={code}
          onChangeText={setCode}
          keyboardType="numeric"
        />

        <CyberButton
          title="Verify Secure Credentials"
          onPress={handleVerify}
          loading={loading}
          style={styles.button}
        />

        <View style={styles.resendRow}>
          <Text style={styles.resendText}>Didn't receive token? </Text>
          <TouchableOpacity onPress={() => Alert.alert('OTP Re-sent', 'Check corporate logs/SMS for details.')}>
            <Text style={styles.resendLink}>Resend Code</Text>
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    backgroundColor: Colors.bgPrimary,
    justifyContent: 'center',
    padding: 20,
    paddingTop: 40,
    paddingBottom: 40,
  },
  headerContainer: {
    alignItems: 'center',
    marginBottom: 24,
  },
  logoBadge: {
    width: 64,
    height: 64,
    borderRadius: 18,
    backgroundColor: Colors.accentLight,
    borderWidth: 1,
    borderColor: Colors.accentLightBorder,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  title: {
    fontSize: 26,
    fontWeight: '800',
    color: Colors.textPrimary,
    letterSpacing: 0.5,
  },
  subtitle: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginTop: 6,
    textAlign: 'center',
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: Colors.cardBorder,
    borderRadius: 24,
    padding: 24,
    shadowColor: Colors.accentPrimary,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.05,
    shadowRadius: 20,
    elevation: 4,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.textPrimary,
    marginBottom: 4,
  },
  cardDesc: {
    fontSize: 13,
    color: Colors.textSecondary,
    marginBottom: 20,
    lineHeight: 18,
  },
  debugBox: {
    backgroundColor: 'rgba(79, 124, 255, 0.08)',
    borderWidth: 1,
    borderColor: 'rgba(79, 124, 255, 0.2)',
    borderRadius: 12,
    padding: 12,
    marginBottom: 20,
    alignItems: 'center',
  },
  debugTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.accentPrimary,
    marginBottom: 2,
    textTransform: 'uppercase',
  },
  debugValue: {
    fontSize: 20,
    fontWeight: '800',
    color: Colors.textPrimary,
    letterSpacing: 2,
  },
  button: {
    width: '100%',
    marginTop: 8,
  },
  resendRow: {
    marginTop: 20,
    flexDirection: 'row',
    justifyContent: 'center',
  },
  resendText: {
    color: Colors.textSecondary,
    fontSize: 13,
  },
  resendLink: {
    color: Colors.accentPrimary,
    fontSize: 13,
    fontWeight: '700',
  }
});
