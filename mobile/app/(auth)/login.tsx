import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Alert, StyleSheet, ActivityIndicator } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useRouter } from 'expo-router';
import { useAuthContext } from '../../src/context/AuthContext';
import { CyberInput } from '../../src/components/CyberInput';
import { CyberButton } from '../../src/components/CyberButton';
import { Colors } from '../../src/constants/Colors';

const loginSchema = z.object({
  email: z.string().min(1, 'Identity credential is required'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

type LoginFormData = z.infer<typeof loginSchema>;

export default function Login() {
  const router = useRouter();
  const { login } = useAuthContext();
  const [loading, setLoading] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);

  const { control, handleSubmit, setValue, formState: { errors } } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: '', password: '' }
  });

  React.useEffect(() => {
    AsyncStorage.getItem('ciphereye_remember_email').then(savedEmail => {
      if (savedEmail) {
        setValue('email', savedEmail);
      }
    }).catch(() => {});
  }, []);

  const onSubmit = async (data: LoginFormData) => {
    console.log('LOGIN BUTTON CLICKED');
    setLoading(true);
    try {
      if (rememberMe) {
        await AsyncStorage.setItem('ciphereye_remember_email', data.email);
      } else {
        await AsyncStorage.removeItem('ciphereye_remember_email');
      }
      await login(data.email, data.password);
      router.replace('/(tabs)/home');
    } catch (err: any) {
      Alert.alert('Access Denied', err.message || 'Verification rejected');
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
        {/* Logo & Header */}
        <View style={styles.headerContainer}>
          <View style={styles.logoBadge}>
            <Text style={styles.logoIcon}>👁️‍🗨️</Text>
          </View>
          <Text style={styles.title}>CypherEye AI</Text>
          <Text style={styles.subtitle}>
            Enterprise Fraud & Scam Protection Console
          </Text>
        </View>

        {/* Card Box */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Identity Login</Text>
          <Text style={styles.cardSub}>
            Access security scanners with CISO credentials.
          </Text>

          <Controller
            control={control}
            name="email"
            render={({ field: { onChange, value } }) => (
              <CyberInput
                label="Email or Username"
                placeholder="analyst@cyphereye.ai"
                value={value}
                onChangeText={onChange}
                autoCapitalize="none"
              />
            )}
          />
          {errors.email && (
            <Text style={styles.errorText}>{errors.email.message}</Text>
          )}

          <Controller
            control={control}
            name="password"
            render={({ field: { onChange, value } }) => (
              <CyberInput
                label="Secure Password"
                placeholder="••••••••"
                value={value}
                onChangeText={onChange}
                secureTextEntry={true}
                autoCapitalize="none"
              />
            )}
          />
          {errors.password && (
            <Text style={styles.errorText}>{errors.password.message}</Text>
          )}

          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16, marginTop: 4 }}>
            <TouchableOpacity 
              style={{ flexDirection: 'row', alignItems: 'center' }} 
              onPress={() => setRememberMe(!rememberMe)}
            >
              <View style={{
                width: 18,
                height: 18,
                borderRadius: 5,
                borderWidth: 1.5,
                borderColor: rememberMe ? '#2563EB' : '#94A3B8',
                backgroundColor: rememberMe ? '#2563EB' : 'transparent',
                justifyContent: 'center',
                alignItems: 'center',
                marginRight: 8
              }}>
                {rememberMe && <Text style={{ color: '#FFFFFF', fontSize: 11, fontWeight: '900' }}>✓</Text>}
              </View>
              <Text style={{ fontSize: 12, fontWeight: '600', color: '#475569' }}>Remember Me</Text>
            </TouchableOpacity>

            <TouchableOpacity onPress={() => router.push('/(auth)/forgot')}>
              <Text style={styles.forgotText}>Forgot password?</Text>
            </TouchableOpacity>
          </View>

          <CyberButton
            title={loading ? "Unlocking Console..." : "Unlock Security Console"}
            onPress={handleSubmit(onSubmit, () => {
              Alert.alert('Input Required', 'Please enter your email or username and password to proceed.');
            })}
            loading={loading}
            style={{ width: '100%', marginTop: 8 }}
          />

          <TouchableOpacity 
            onPress={() => router.push('/(auth)/register')} 
            style={styles.registerRow}
          >
            <Text style={styles.registerSub}>Need secure access? </Text>
            <Text style={styles.registerLink}>Register Profile</Text>
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
    marginBottom: 28,
  },
  logoBadge: {
    width: 68,
    height: 68,
    borderRadius: 20,
    backgroundColor: '#EFF6FF',
    borderWidth: 1,
    borderColor: '#DBEAFE',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
    shadowColor: '#3B82F6',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 10,
    elevation: 3,
  },
  logoIcon: {
    fontSize: 32,
  },
  title: {
    fontSize: 26,
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
  forgotRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginBottom: 16,
  },
  forgotText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#2563EB',
  },
  dividerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 20,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#E2E8F0',
  },
  dividerText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#94A3B8',
    marginHorizontal: 12,
    letterSpacing: 0.8,
  },
  ssoBtn: {
    height: 48,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    marginBottom: 10,
  },
  ssoIcon: {
    fontSize: 16,
    marginRight: 8,
  },
  ssoText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#334155',
  },
  registerRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 18,
  },
  registerSub: {
    fontSize: 13,
    color: '#64748B',
  },
  registerLink: {
    fontSize: 13,
    fontWeight: '800',
    color: '#2563EB',
  },
});
