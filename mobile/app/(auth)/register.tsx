import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Alert, StyleSheet } from 'react-native';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useRouter } from 'expo-router';
import { useAuthContext } from '../../src/context/AuthContext';
import { CyberInput } from '../../src/components/CyberInput';
import { CyberButton } from '../../src/components/CyberButton';
import { Colors } from '../../src/constants/Colors';

const registerSchema = z.object({
  fullName: z.string().min(2, 'Name must be at least 2 characters'),
  username: z.string().min(3, 'Username must be at least 3 characters'),
  email: z.string().email('Please enter a valid email address.'),
  phone: z.string().refine(
    (val) => {
      if (!val) return false;
      const digits = val.replace(/\D/g, '');
      let checkNum = digits;
      if (digits.startsWith('91') && digits.length > 10) {
        checkNum = digits.substring(2);
      }
      return /^[6-9]\d{9}$/.test(checkNum);
    },
    { message: 'Enter a valid Indian mobile number.' }
  ),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  confirmPassword: z.string().min(8, 'Re-enter your password'),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

type RegisterFormData = z.infer<typeof registerSchema>;

export default function Register() {
  const router = useRouter();
  const { register } = useAuthContext();
  const [loading, setLoading] = useState(false);
  const [acceptTerms, setAcceptTerms] = useState(false);
  
  const [passwordStrength, setPasswordStrength] = useState({ score: 0, text: 'Empty', color: Colors.textMuted });

  const { control, handleSubmit, formState: { errors } } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    defaultValues: { fullName: '', username: '', email: '', phone: '', password: '', confirmPassword: '' }
  });

  const checkPasswordStrength = (pw: string) => {
    let score = 0;
    if (!pw) return setPasswordStrength({ score: 0, text: 'Empty', color: Colors.textMuted });
    if (pw.length >= 8) score += 1;
    if (/[A-Z]/.test(pw)) score += 1;
    if (/[0-9]/.test(pw)) score += 1;
    if (/[^A-Za-z0-9]/.test(pw)) score += 1;

    let text = 'Weak';
    let color = '#EF4444';
    if (score === 2) { text = 'Fair'; color = '#F59E0B'; }
    if (score === 3) { text = 'Good'; color = '#2563EB'; }
    if (score === 4) { text = 'Excellent'; color = '#10B981'; }

    setPasswordStrength({ score, text, color });
  };

const DISPOSABLE_DOMAINS = [
  'hbcibcc.com', 'randomdomain.xyz', 'mailinator.com', 'tempmail.com', '10minutemail.com', 'trashmail.com', 
  'guerrillamail.com', 'dispostable.com', 'getnada.com', 'yopmail.com', 
  'throwawaymail.com', 'temp-mail.org', 'fakeinbox.com', 'sharklasers.com', 
  'grr.la', 'guerrillamail.net', 'guerrillamail.org', 'example.com', 'test.com', 
  'fake.com', 'invalid.com', 'asdf.com', 'foo.com', 'bar.com', 'domain.com'
];

function checkEmailDomain(email: string): string | null {
  if (!email || !email.includes('@')) return 'Please enter a valid email format (e.g. name@domain.com).';
  const parts = email.trim().toLowerCase().split('@');
  if (parts.length !== 2) return 'Please enter a valid email address.';
  const usernamePart = parts[0];
  const domain = parts[1];
  if (usernamePart.length < 2) return 'Email username must be at least 2 characters long.';
  if (
    DISPOSABLE_DOMAINS.includes(domain) || 
    domain.endsWith('.xyz') || 
    domain.includes('temp') || 
    domain.includes('disposable') || 
    domain.includes('fake') || 
    domain.includes('random') || 
    domain.includes('hbcibcc')
  ) {
    return `Email domain '@${domain}' is invalid or not allowed. Please use a recognized email provider (e.g. Gmail, Yahoo, Outlook, iCloud, Proton, Zoho, AOL, etc.).`;
  }
  return null;
}

  const onSubmit = async (data: RegisterFormData) => {
    const domainErr = checkEmailDomain(data.email);
    if (domainErr) {
      Alert.alert('Invalid Email Provider', domainErr);
      return;
    }

    if (!acceptTerms) {
      Alert.alert('Protocol Error', 'You must agree to the data logs policies.');
      return;
    }
    setLoading(true);

    let formattedPhone = data.phone ? data.phone.replace(/\D/g, '') : '';
    if (formattedPhone) {
      if (formattedPhone.startsWith('91') && formattedPhone.length > 10) {
        formattedPhone = '+' + formattedPhone;
      } else {
        formattedPhone = '+91' + formattedPhone;
      }
    }

    try {
      await register(data.username, data.email, data.password, data.fullName, formattedPhone);
      router.replace('/(tabs)/home');
    } catch (err: any) {
      const msg = err.message || 'Check network server connectivity.';
      if (typeof msg === 'string' && (msg.includes('prisma') || msg.includes('Prisma') || msg.includes('findFirst') || msg.includes('findUnique') || msg.includes('3.106.'))) {
        Alert.alert('Registration Unavailable', 'Registration service is temporarily unavailable. Please try again later.');
      } else {
        Alert.alert('Registration Failed', msg);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView 
      contentContainerStyle={styles.scrollContainer} 
      keyboardShouldPersistTaps="handled"
    >
      <View style={styles.content}>
        {/* Header */}
        <View style={styles.headerContainer}>
          <View style={styles.logoBadge}>
            <Text style={styles.logoIcon}>🛡️</Text>
          </View>
          <Text style={styles.title}>Console Register</Text>
          <Text style={styles.subtitle}>
            Initialize identity credentials profile.
          </Text>
        </View>

        {/* Form Card */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Identity Creation</Text>
          <Text style={styles.cardSub}>
            Set up zero-trust console analyst accounts.
          </Text>

          <Controller
            control={control}
            name="fullName"
            render={({ field: { onChange, value } }) => (
              <CyberInput
                label="Full Name *"
                placeholder="Enter your full name"
                value={value}
                onChangeText={onChange}
                autoCapitalize="words"
              />
            )}
          />
          {errors.fullName && (
            <Text style={styles.errorText}>{errors.fullName.message}</Text>
          )}

          <Controller
            control={control}
            name="username"
            render={({ field: { onChange, value } }) => (
              <CyberInput
                label="Secure Username *"
                placeholder="analyst_id"
                value={value}
                onChangeText={onChange}
                autoCapitalize="none"
              />
            )}
          />
          {errors.username && (
            <Text style={styles.errorText}>{errors.username.message}</Text>
          )}

          <Controller
            control={control}
            name="email"
            render={({ field: { onChange, value } }) => (
              <CyberInput
                label="Corporate Email *"
                placeholder="analyst@yourcompany.com"
                value={value}
                onChangeText={onChange}
                autoCapitalize="none"
                keyboardType="email-address"
              />
            )}
          />
          {errors.email && (
            <Text style={styles.errorText}>{errors.email.message}</Text>
          )}

          <Controller
            control={control}
            name="phone"
            render={({ field: { onChange, value } }) => (
              <CyberInput
                label="Mobile Phone *"
                placeholder="9876543210"
                value={value || ''}
                onChangeText={onChange}
                keyboardType="numeric"
              />
            )}
          />
          {errors.phone && (
            <Text style={styles.errorText}>{errors.phone.message}</Text>
          )}

          <Controller
            control={control}
            name="password"
            render={({ field: { onChange, value } }) => (
              <CyberInput
                label="Analyst Password *"
                placeholder="Min 8 characters"
                value={value}
                onChangeText={(txt) => { onChange(txt); checkPasswordStrength(txt); }}
                secureTextEntry={true}
                autoCapitalize="none"
              />
            )}
          />
          {errors.password && (
            <Text style={styles.errorText}>{errors.password.message}</Text>
          )}

          {/* Strength bar */}
          <View style={styles.strengthBox}>
            <Text style={styles.strengthSub}>
              Strength: <Text style={{ color: passwordStrength.color, fontWeight: '800' }}>{passwordStrength.text}</Text>
            </Text>
            <View style={styles.strengthBarRow}>
              {[1, 2, 3, 4].map(idx => (
                <View 
                  key={idx} 
                  style={[
                    styles.strengthSegment,
                    { backgroundColor: passwordStrength.score >= idx ? passwordStrength.color : '#E2E8F0' }
                  ]}
                />
              ))}
            </View>
          </View>

          <Controller
            control={control}
            name="confirmPassword"
            render={({ field: { onChange, value } }) => (
              <CyberInput
                label="Confirm Password *"
                placeholder="Re-enter security password"
                value={value}
                onChangeText={onChange}
                secureTextEntry={true}
                autoCapitalize="none"
              />
            )}
          />
          {errors.confirmPassword && (
            <Text style={styles.errorText}>{errors.confirmPassword.message}</Text>
          )}

          <TouchableOpacity 
            style={styles.checkboxRow}
            onPress={() => setAcceptTerms(!acceptTerms)}
            activeOpacity={0.8}
          >
            <View 
              style={[
                styles.checkbox,
                acceptTerms ? styles.checkboxActive : styles.checkboxInactive
              ]}
            >
              {acceptTerms && <Text style={styles.checkmark}>✓</Text>}
            </View>
            <Text style={styles.checkboxLabel}>
              I agree to the cybersecurity data policy logs, threat scanning disclosures, and verification protocols.
            </Text>
          </TouchableOpacity>

          <CyberButton
            title={loading ? "Registering..." : "Initialize Profile Scan"}
            onPress={handleSubmit(onSubmit, (formErrors) => {
              const firstErrKey = Object.keys(formErrors)[0];
              const firstErrMsg = firstErrKey ? (formErrors as any)[firstErrKey]?.message : 'Please check required fields.';
              Alert.alert('Form Verification Failed', firstErrMsg || 'Please fill in all required registration fields correctly.');
            })}
            loading={loading}
            style={{ width: '100%', marginTop: 8 }}
          />

          <TouchableOpacity 
            onPress={() => router.push('/(auth)/login')} 
            style={styles.loginRow}
          >
            <Text style={styles.loginSub}>Have secure access? </Text>
            <Text style={styles.loginLink}>Log In</Text>
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
    shadowColor: '#2563EB',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 8,
    elevation: 3,
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
    marginBottom: 20,
  },
  errorText: {
    color: '#EF4444',
    fontSize: 11,
    fontWeight: '700',
    marginTop: -8,
    marginBottom: 12,
  },
  strengthBox: {
    marginBottom: 16,
    marginTop: -4,
  },
  strengthSub: {
    fontSize: 11,
    color: '#64748B',
    marginBottom: 6,
  },
  strengthBarRow: {
    flexDirection: 'row',
    gap: 4,
    height: 6,
    width: '100%',
  },
  strengthSegment: {
    flex: 1,
    height: '100%',
    borderRadius: 3,
  },
  checkboxRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
    marginBottom: 20,
    marginTop: 4,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 6,
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 2,
  },
  checkboxActive: {
    backgroundColor: '#2563EB',
    borderColor: '#2563EB',
  },
  checkboxInactive: {
    backgroundColor: '#FFFFFF',
    borderColor: '#CBD5E1',
  },
  checkmark: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '900',
  },
  checkboxLabel: {
    flex: 1,
    fontSize: 11,
    color: '#64748B',
    lineHeight: 16,
  },
  loginRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 18,
  },
  loginSub: {
    fontSize: 13,
    color: '#64748B',
  },
  loginLink: {
    fontSize: 13,
    fontWeight: '800',
    color: '#2563EB',
  },
});
