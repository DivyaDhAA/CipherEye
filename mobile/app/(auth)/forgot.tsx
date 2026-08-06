import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Alert, StyleSheet, TextInput } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuthContext } from '../../src/context/AuthContext';
import { CyberInput } from '../../src/components/CyberInput';
import { CyberButton } from '../../src/components/CyberButton';

export default function ForgotPassword() {
  const router = useRouter();
  const { forgotPassword, resetPassword } = useAuthContext();
  
  const [step, setStep] = useState<1 | 2>(1);
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [otpDebug, setOtpDebug] = useState<string | undefined>(undefined);

  const handleRequestReset = async () => {
    if (!email || !email.includes('@')) {
      Alert.alert('Invalid Email', 'Please enter a valid email address.');
      return;
    }

    setLoading(true);
    try {
      const res = await forgotPassword(email.trim());
      setOtpDebug(res.otpDebug);
      setStep(2);
      Alert.alert('Reset Code Sent', `A 6-digit reset code has been sent to ${email}.`);
    } catch (err: any) {
      Alert.alert('Reset Request Failed', err.message || 'Account not found or network error.');
    } finally {
      setLoading(false);
    }
  };

  const handleCompleteReset = async () => {
    if (!code || code.length < 6) {
      Alert.alert('Invalid Code', 'Please enter the 6-digit verification code.');
      return;
    }
    if (!newPassword || newPassword.length < 8) {
      Alert.alert('Weak Password', 'New password must be at least 8 characters long.');
      return;
    }
    if (newPassword !== confirmPassword) {
      Alert.alert('Password Mismatch', 'New passwords do not match.');
      return;
    }

    setLoading(true);
    try {
      await resetPassword(email.trim(), code.trim(), newPassword);
      Alert.alert('Password Reset Complete', 'Your password has been reset successfully. Please log in with your new password.', [
        { text: 'Log In Now', onPress: () => router.replace('/(auth)/login') }
      ]);
    } catch (err: any) {
      Alert.alert('Reset Failed', err.message || 'Invalid reset code or expired session.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.scrollContainer} keyboardShouldPersistTaps="handled">
      <View style={styles.content}>
        <View style={styles.headerContainer}>
          <View style={styles.logoBadge}>
            <Text style={styles.logoIcon}>🔑</Text>
          </View>
          <Text style={styles.title}>Password Recovery</Text>
          <Text style={styles.subtitle}>
            {step === 1 ? 'Reset your lost account credentials' : 'Verify reset code and choose a new password'}
          </Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>{step === 1 ? 'Step 1: Request Reset Code' : 'Step 2: Set New Password'}</Text>
          <Text style={styles.cardSub}>
            {step === 1 
              ? 'Enter your registered email address below.' 
              : `Enter the code sent to ${email} along with your new password.`}
          </Text>

          {step === 1 ? (
            <>
              <CyberInput
                label="Account Email *"
                placeholder="analyst@domain.com"
                value={email}
                onChangeText={setEmail}
                autoCapitalize="none"
                keyboardType="email-address"
              />

              <CyberButton
                title={loading ? "Requesting Code..." : "Send Security Code"}
                onPress={handleRequestReset}
                loading={loading}
                style={{ width: '100%', marginTop: 12 }}
              />
            </>
          ) : (
            <>
              {otpDebug && (
                <View style={styles.debugBox}>
                  <Text style={styles.debugText}>[Sandbox Reset Code: {otpDebug}]</Text>
                </View>
              )}

              <CyberInput
                label="6-Digit Reset Code *"
                placeholder="000000"
                value={code}
                onChangeText={setCode}
                keyboardType="numeric"
                maxLength={6}
              />

              <CyberInput
                label="New Password *"
                placeholder="Minimum 8 characters"
                value={newPassword}
                onChangeText={setNewPassword}
                secureTextEntry={true}
              />

              <CyberInput
                label="Confirm New Password *"
                placeholder="Re-enter new password"
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                secureTextEntry={true}
              />

              <CyberButton
                title={loading ? "Updating Password..." : "Reset Password"}
                onPress={handleCompleteReset}
                loading={loading}
                style={{ width: '100%', marginTop: 12 }}
              />

              <TouchableOpacity onPress={() => setStep(1)} style={{ alignSelf: 'center', marginTop: 12 }}>
                <Text style={{ fontSize: 12, color: '#64748B', fontWeight: '600' }}>← Re-enter Email</Text>
              </TouchableOpacity>
            </>
          )}

          <TouchableOpacity 
            onPress={() => router.replace('/(auth)/login')} 
            style={styles.backRow}
          >
            <Text style={styles.backLink}>Back to Login</Text>
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
    fontSize: 12,
    fontWeight: '600',
    color: '#64748B',
    marginTop: 4,
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
    marginBottom: 2,
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
