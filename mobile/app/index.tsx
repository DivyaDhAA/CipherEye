import React, { useEffect } from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuthContext } from '../src/context/AuthContext';

export default function Index() {
  const router = useRouter();
  const { token, user, loading } = useAuthContext();

  useEffect(() => {
    if (loading) return;
    const timeout = setTimeout(() => {
      if (token && user) {
        router.replace('/(tabs)/home');
      } else {
        router.replace('/(auth)/login');
      }
    }, 100);
    return () => clearTimeout(timeout);
  }, [loading, token, user]);

  return (
    <View style={styles.loadingContainer}>
      <ActivityIndicator size="large" color="#2563EB" />
    </View>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
  },
});
