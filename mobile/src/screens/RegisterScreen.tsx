import React, { useState } from 'react';
import { StyleSheet, View, Text, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { Colors } from '../constants/Colors';
import { CyberInput } from '../components/CyberInput';
import { CyberButton } from '../components/CyberButton';

interface RegisterScreenProps {
  onRegister: (username: string, email: string, password: string, fullName: string) => Promise<any>;
  onGoToLogin: () => void;
}

export const RegisterScreen: React.FC<RegisterScreenProps> = ({ onRegister, onGoToLogin }) => {
  const [fullName, setFullName] = useState('');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [acceptTerms, setAcceptTerms] = useState(false);
  const [loading, setLoading] = useState(false);
  
  const [passwordStrength, setPasswordStrength] = useState({ score: 0, text: 'Empty', color: Colors.textMuted });

  const checkPasswordStrength = (pw: string) => {
    let score = 0;
    if (!pw) return setPasswordStrength({ score: 0, text: 'Empty', color: Colors.textMuted });
    if (pw.length >= 8) score += 1;
    if (/[A-Z]/.test(pw)) score += 1;
    if (/[0-9]/.test(pw)) score += 1;
    if (/[^A-Za-z0-9]/.test(pw)) score += 1;

    let text = 'Weak';
    let color = Colors.accentRose;
    if (score === 2) { text = 'Fair'; color = Colors.accentAmber; }
    if (score === 3) { text = 'Good'; color = Colors.accentPrimary; }
    if (score === 4) { text = 'Excellent'; color = Colors.accentEmerald; }

    setPasswordStrength({ score, text, color });
  };

  const handleRegister = async () => {
    if (!fullName || !username || !email || !password) {
      Alert.alert('Registration Denied', 'Please fill out all required credentials.');
      return;
    }

    const trustedDomains = [
      'gmail.com', 'googlemail.com', 'yahoo.com', 'yahoo.co.in', 'yahoo.co.uk', 'yahoo.ca', 'ymail.com', 'myyahoo.com', 
      'outlook.com', 'hotmail.com', 'live.com', 'msn.com', 'office365.com', 'microsoft.com', 
      'icloud.com', 'me.com', 'mac.com', 'protonmail.com', 'proton.me', 'pm.me', 
      'zoho.com', 'zohomail.com', 'aol.com', 'rediffmail.com', 'gmx.com', 'gmx.net', 
      'mail.com', 'yandex.com', 'tutanota.com', 'tuta.io', 'fastmail.com', 'cyphereye.ai', 'cyphereye.com'
    ];

    const disposableDomains = [
      'hbcibcc.com', 'randomdomain.xyz', 'mailinator.com', 'tempmail.com', '10minutemail.com', 'trashmail.com', 
      'guerrillamail.com', 'dispostable.com', 'getnada.com', 'yopmail.com', 
      'throwawaymail.com', 'temp-mail.org', 'fakeinbox.com', 'sharklasers.com', 
      'grr.la', 'guerrillamail.net', 'guerrillamail.org', 'example.com', 'test.com', 
      'fake.com', 'invalid.com', 'asdf.com', 'foo.com', 'bar.com', 'domain.com'
    ];

    const parts = email.trim().toLowerCase().split('@');
    if (parts.length !== 2) {
      Alert.alert('Invalid Email', 'Please enter a valid email format (e.g. name@domain.com).');
      return;
    }
    const usernamePart = parts[0];
    const domain = parts[1];

    if (usernamePart.length < 2) {
      Alert.alert('Invalid Email', 'Email username must be at least 2 characters long.');
      return;
    }

    if (
      disposableDomains.includes(domain) || 
      domain.endsWith('.xyz') || 
      domain.includes('temp') || 
      domain.includes('disposable') || 
      domain.includes('fake') || 
      domain.includes('random') || 
      domain.includes('hbcibcc')
    ) {
      Alert.alert('Invalid Email Provider', `Email domain '@${domain}' is invalid or not allowed. Please use a recognized email provider (e.g. Gmail, Yahoo, Outlook, iCloud, Proton, Zoho, AOL, etc.).`);
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert('Verification Error', 'Passwords do not match.');
      return;
    }
    if (!acceptTerms) {
      Alert.alert('Security Protocol', 'Please agree to security audits and terms.');
      return;
    }

    setLoading(true);
    try {
      await onRegister(username, email, password, fullName);
    } catch (err: any) {
      Alert.alert('Registration Failed', err.message || 'Verification email dispatch failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
      <View style={styles.headerContainer}>
        <View style={styles.logoBadge}>
          <Text style={{ fontSize: 32 }}>🛡️</Text>
        </View>
        <Text style={styles.title}>Console Register</Text>
        <Text style={styles.subtitle}>Initialize identity credentials profile.</Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Identity Creation</Text>
        <Text style={styles.cardDesc}>Set up zero-trust console analyst accounts.</Text>

        <CyberInput
          label="Full Name *"
          placeholder="Elizabeth Shaw"
          value={fullName}
          onChangeText={setFullName}
          autoCapitalize="words"
        />

        <CyberInput
          label="Secure Username *"
          placeholder="shaw_analyst"
          value={username}
          onChangeText={setUsername}
          autoCapitalize="none"
        />

        <CyberInput
          label="Corporate Email *"
          placeholder="shaw@cyphereye.ai"
          value={email}
          onChangeText={setEmail}
          autoCapitalize="none"
          keyboardType="email-address"
        />

        <CyberInput
          label="Mobile Phone"
          placeholder="+1 (555) 234-9081"
          value={phone}
          onChangeText={setPhone}
          keyboardType="numeric"
        />

        <CyberInput
          label="Analyst Password *"
          placeholder="Min 8 characters"
          value={password}
          onChangeText={(txt) => { setPassword(txt); checkPasswordStrength(txt); }}
          secureTextEntry={true}
          autoCapitalize="none"
        />

        {/* Password strength details */}
        <View style={styles.strengthRow}>
          <Text style={styles.strengthText}>Strength: <Text style={{ color: passwordStrength.color, fontWeight: '700' }}>{passwordStrength.text}</Text></Text>
          <View style={styles.barContainer}>
            {[1, 2, 3, 4].map(idx => (
              <View 
                key={idx} 
                style={[
                  styles.barItem, 
                  { backgroundColor: passwordStrength.score >= idx ? passwordStrength.color : Colors.bgTertiary }
                ]} 
              />
            ))}
          </View>
        </View>

        <CyberInput
          label="Confirm Password *"
          placeholder="Re-enter security password"
          value={confirmPassword}
          onChangeText={setConfirmPassword}
          secureTextEntry={true}
          autoCapitalize="none"
        />

        <TouchableOpacity 
          style={styles.termsRow}
          onPress={() => setAcceptTerms(!acceptTerms)}
          activeOpacity={0.8}
        >
          <View style={[styles.checkbox, acceptTerms && styles.checkboxChecked]}>
            {acceptTerms && <Text style={styles.checkboxTick}>✓</Text>}
          </View>
          <Text style={styles.termsText}>
            I agree to the cybersecurity data policy logs, threat scanning disclosures, and verification protocols.
          </Text>
        </TouchableOpacity>

        <CyberButton
          title="Initialize Profile Scan"
          onPress={handleRegister}
          loading={loading}
          style={styles.button}
        />

        <TouchableOpacity onPress={onGoToLogin} style={styles.linkContainer}>
          <Text style={styles.linkLabel}>Have secure access? </Text>
          <Text style={styles.linkText}>Log In</Text>
        </TouchableOpacity>
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
  },
  strengthRow: {
    marginBottom: 16,
    marginTop: -8,
  },
  strengthText: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginBottom: 6,
  },
  barContainer: {
    flexDirection: 'row',
    gap: 4,
    height: 6,
    width: '100%',
  },
  barItem: {
    flex: 1,
    height: '100%',
    borderRadius: 3,
  },
  termsRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
    marginBottom: 24,
    marginTop: 8,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: 'rgba(79, 124, 255, 0.4)',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    marginTop: 2,
  },
  checkboxChecked: {
    backgroundColor: Colors.accentPrimary,
    borderColor: Colors.accentPrimary,
  },
  checkboxTick: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '900',
  },
  termsText: {
    flex: 1,
    fontSize: 12,
    color: Colors.textSecondary,
    lineHeight: 16,
  },
  button: {
    width: '100%',
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
