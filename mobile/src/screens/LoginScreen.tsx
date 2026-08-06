import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Text, ScrollView, TouchableOpacity, Alert, Image, Switch, Modal } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Colors } from '../constants/Colors';
import { CyberInput } from '../components/CyberInput';
import { CyberButton } from '../components/CyberButton';

interface LoginScreenProps {
  onLogin: (username: string, pass: string) => Promise<any>;
  onGoToRegister: () => void;
}

export const LoginScreen: React.FC<LoginScreenProps> = ({ onLogin, onGoToRegister }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(true);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    AsyncStorage.getItem('ciphereye_remember_email').then(val => {
      if (val) {
        setEmail(val);
        setRememberMe(true);
      }
    }).catch(() => {});
  }, []);

  // Forgot password modal state
  const [showForgotModal, setShowForgotModal] = useState(false);
  const [forgotStep, setForgotStep] = useState<1 | 2>(1);
  const [forgotEmail, setForgotEmail] = useState('');
  const [resetCode, setResetCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [forgotLoading, setForgotLoading] = useState(false);
  const [otpDebug, setOtpDebug] = useState<string | undefined>(undefined);

  const handleSendResetLink = async () => {
    if (!forgotEmail || !forgotEmail.includes('@')) {
      Alert.alert('Email Required', 'Please enter a valid registered email address.');
      return;
    }
    setForgotLoading(true);
    try {
      const { Config } = require('../constants/Config');
      const res = await fetch(`${Config.apiBase}/auth/forgot-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: forgotEmail.trim() })
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Account not found.');
      }
      setOtpDebug(data.otpDebug);
      setForgotStep(2);
      Alert.alert('OTP Code Sent', `A 6-digit password reset code has been sent to ${forgotEmail}.`);
    } catch (err: any) {
      Alert.alert('Reset Failed', err.message || 'Error sending reset code.');
    } finally {
      setForgotLoading(false);
    }
  };

  const handleCompleteReset = async () => {
    if (!resetCode || resetCode.length < 6) {
      Alert.alert('Code Required', 'Please enter the 6-digit OTP code.');
      return;
    }
    if (!newPassword || newPassword.length < 8) {
      Alert.alert('Password Required', 'New password must be at least 8 characters long.');
      return;
    }

    setForgotLoading(true);
    try {
      const { Config } = require('../constants/Config');
      const res = await fetch(`${Config.apiBase}/auth/reset-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: forgotEmail.trim(),
          code: resetCode.trim(),
          newPassword: newPassword
        })
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Invalid code or password reset failed.');
      }
      Alert.alert('Success', 'Your password has been updated. You can now log in.');
      setShowForgotModal(false);
      setForgotStep(1);
      setResetCode('');
      setNewPassword('');
    } catch (err: any) {
      Alert.alert('Reset Failed', err.message || 'Password update failed.');
    } finally {
      setForgotLoading(false);
    }
  };

  const handleLogin = async () => {
    console.log('LOGIN BUTTON CLICKED');
    if (!email || !password) {
      Alert.alert('Access Denied', 'Please fill out your identity credentials.');
      return;
    }
    setLoading(true);
    try {
      if (rememberMe) {
        await AsyncStorage.setItem('ciphereye_remember_email', email);
      } else {
        await AsyncStorage.removeItem('ciphereye_remember_email');
      }
      await onLogin(email, password);
    } catch (err: any) {
      Alert.alert('Authentication Failed', err.message || 'Check server connection.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
      <View style={styles.headerContainer}>
        {/* Brand logo illustration representation */}
        <View style={styles.logoBadge}>
          <Text style={{ fontSize: 32 }}>👁️‍🗨️</Text>
        </View>
        <Text style={styles.title}>CypherEye AI</Text>
        <Text style={styles.subtitle}>Enterprises Fraud & Scam Protection Console</Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Identity Login</Text>
        <Text style={styles.cardDesc}>Access security scanners with CISO credentials.</Text>

        <CyberInput
          label="Email or Username"
          placeholder="analyst@cyphereye.ai"
          value={email}
          onChangeText={setEmail}
          autoCapitalize="none"
          keyboardType="email-address"
          testID="UsernameInput"
        />

        <CyberInput
          label="Secure Password"
          placeholder="••••••••"
          value={password}
          onChangeText={setPassword}
          secureTextEntry={true}
          autoCapitalize="none"
          testID="PasswordInput"
        />

        <View style={styles.row}>
          <View style={styles.rememberRow}>
            <Switch
              value={rememberMe}
              onValueChange={setRememberMe}
              trackColor={{ false: '#E2E8F0', true: Colors.accentPrimary }}
              thumbColor="#FFFFFF"
            />
            <Text style={styles.rememberText}>Remember me</Text>
          </View>
          <TouchableOpacity onPress={() => { setForgotStep(1); setShowForgotModal(true); }}>
            <Text style={styles.forgotText}>Forgot password?</Text>
          </TouchableOpacity>
        </View>

        <CyberButton
          title="Unlock Security Console"
          onPress={handleLogin}
          loading={loading}
          style={styles.button}
          testID="LoginButton"
        />

        <TouchableOpacity onPress={onGoToRegister} style={styles.linkContainer}>
          <Text style={styles.linkLabel}>Need secure access? </Text>
          <Text style={styles.linkText}>Register Profile</Text>
        </TouchableOpacity>
      </View>

      {/* FORGOT PASSWORD INTERACTIVE MODAL */}
      <Modal visible={showForgotModal} animationType="slide" transparent={true}>
        <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'center', padding: 20 }}>
          <View style={{ backgroundColor: '#FFFFFF', borderRadius: 24, padding: 24, borderWidth: 1, borderColor: Colors.cardBorder }}>
            <Text style={{ fontSize: 20, fontWeight: '800', color: Colors.textPrimary, marginBottom: 6 }}>
              {forgotStep === 1 ? 'Reset Password' : 'Enter OTP Code'}
            </Text>
            <Text style={{ fontSize: 13, color: Colors.textSecondary, marginBottom: 20 }}>
              {forgotStep === 1 
                ? 'Enter your registered email address to receive a secure OTP code.' 
                : `Enter the 6-digit OTP code sent to ${forgotEmail} and choose a new password.`}
            </Text>
            
            {forgotStep === 1 ? (
              <>
                <CyberInput
                  label="Registered Email Address"
                  placeholder="analyst@cyphereye.ai"
                  value={forgotEmail}
                  onChangeText={setForgotEmail}
                  autoCapitalize="none"
                  keyboardType="email-address"
                />
                <CyberButton
                  title="Send Password Reset Code"
                  onPress={handleSendResetLink}
                  loading={forgotLoading}
                  style={{ marginTop: 10 }}
                />
                <TouchableOpacity onPress={() => setShowForgotModal(false)} style={{ marginTop: 16, alignItems: 'center' }}>
                  <Text style={{ fontSize: 14, color: Colors.textSecondary, fontWeight: '600' }}>Cancel</Text>
                </TouchableOpacity>
              </>
            ) : (
              <>
                <CyberInput
                  label="6-Digit OTP Code"
                  placeholder="123456"
                  value={resetCode}
                  onChangeText={setResetCode}
                  keyboardType="number-pad"
                />
                <CyberInput
                  label="New Password (min 8 chars)"
                  placeholder="••••••••"
                  value={newPassword}
                  onChangeText={setNewPassword}
                  secureTextEntry={true}
                  autoCapitalize="none"
                />
                <CyberButton
                  title="Update Password"
                  onPress={handleCompleteReset}
                  loading={forgotLoading}
                  style={{ marginTop: 10 }}
                />
                <TouchableOpacity onPress={() => setForgotStep(1)} style={{ marginTop: 16, alignItems: 'center' }}>
                  <Text style={{ fontSize: 14, color: Colors.accentPrimary, fontWeight: '600' }}>← Back to Email</Text>
                </TouchableOpacity>
              </>
            )}
          </View>
        </View>
      </Modal>
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
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  rememberRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  rememberText: {
    fontSize: 13,
    color: Colors.textSecondary,
    fontWeight: '500',
  },
  forgotText: {
    fontSize: 13,
    color: Colors.accentPrimary,
    fontWeight: '600',
  },
  button: {
    width: '100%',
    marginTop: 4,
  },
  dividerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 20,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: Colors.bgTertiary,
  },
  dividerText: {
    fontSize: 10,
    fontWeight: '700',
    color: Colors.textMuted,
    marginHorizontal: 12,
    letterSpacing: 0.5,
  },
  ssoBtn: {
    height: 48,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: Colors.bgTertiary,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
  },
  ssoBtnText: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.textSecondary,
  },
  linkContainer: {
    marginTop: 24,
    flexDirection: 'row',
    justifyContent: 'center',
  },
  linkLabel: {
    color: Colors.textSecondary,
    fontSize: 14,
  },
  linkText: {
    color: Colors.accentPrimary,
    fontSize: 14,
    fontWeight: '700',
  }
});
