import React, { useState } from 'react';
import { View, Text, ScrollView, Switch, Alert, StyleSheet, Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useAuthContext } from '../../src/context/AuthContext';
import { CyberInput } from '../../src/components/CyberInput';
import { CyberButton } from '../../src/components/CyberButton';

export default function Profile() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { user, apiBaseUrl, updateServerIp, logout } = useAuthContext();

  const [darkMode, setDarkMode] = useState(false);
  const [alerts, setAlerts] = useState(true);
  const [mfa, setMfa] = useState(true);
  
  const [serverUrl, setServerUrl] = useState(apiBaseUrl.replace('/api/v1', ''));
  const [updating, setUpdating] = useState(false);

  const handleToggleDark = (val: boolean) => {
    setDarkMode(val);
    Alert.alert(val ? 'Console Dark Mode' : 'Light Mode', val ? 'Applied dark visual theme configuration.' : 'Applied default light theme configuration.');
  };

  const handleToggleAlerts = (val: boolean) => {
    setAlerts(val);
    Alert.alert('Real-Time Alerts', val ? 'Alert notifications enabled.' : 'Alert notifications muted.');
  };

  const handleToggleMfa = (val: boolean) => {
    setMfa(val);
    Alert.alert('OTP Protocol', val ? '2FA verification required on signin.' : 'Standard password clearance enabled.');
  };

  const handleUpdateIp = async () => {
    if (!serverUrl) return;
    setUpdating(true);
    try {
      await updateServerIp(serverUrl);
      Alert.alert('Success', 'Console gateway address updated.');
    } catch {
      Alert.alert('Error', 'Failed to update endpoint');
    } finally {
      setUpdating(false);
    }
  };

  const handleLogout = async () => {
    Alert.alert(
      'Logout Session', 
      'Are you sure you want to end your secure console session?', 
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Logout', 
          style: 'destructive',
          onPress: async () => {
            await logout();
            router.replace('/(auth)/login');
          } 
        }
      ]
    );
  };

  const themeBg = darkMode ? '#0F172A' : '#F8FAFC';
  const cardBg = darkMode ? '#1E293B' : '#FFFFFF';
  const cardBorder = darkMode ? '#334155' : '#E2E8F0';
  const textTitle = darkMode ? '#F8FAFC' : '#0F172A';
  const textSub = darkMode ? '#94A3B8' : '#64748B';
  const dividerColor = darkMode ? '#334155' : '#F1F5F9';

  return (
    <ScrollView 
      contentContainerStyle={[
        styles.scrollContainer,
        { 
          backgroundColor: themeBg,
          paddingTop: Math.max(insets.top + 12, 24), 
          paddingBottom: Math.max(insets.bottom + 90, 100) 
        },
        Platform.OS === 'web' && { paddingLeft: 260 }
      ]} 
      keyboardShouldPersistTaps="handled"
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.content}>
        
        {/* Profile Card */}
        <View style={[styles.profileCard, { backgroundColor: cardBg, borderColor: cardBorder }]}>
          <View style={styles.profileHeader}>
            <View style={styles.avatarCircle}>
              <Text style={styles.avatarInitials}>
                {(user?.fullName || user?.username || user?.email || 'AS').substring(0, 2).toUpperCase()}
              </Text>
            </View>
            <View style={styles.profileTextCol}>
              <Text style={[styles.profileName, { color: textTitle }]}>{user?.fullName || user?.username || 'Security Analyst'}</Text>
              <Text style={[styles.profileRole, { color: textSub }]}>Clearance Tier: {user?.role || 'Enterprise CISO Analyst'}</Text>
              {user?.email && <Text style={{ fontSize: 11, color: '#3B82F6', marginTop: 2 }}>{user.email}</Text>}
            </View>
          </View>

          <View style={[styles.divider, { backgroundColor: dividerColor }]} />

          {/* Core Stats */}
          <View style={styles.statsRow}>
            <View style={styles.statCol}>
              <Text style={[styles.statVal, { color: textTitle }]}>94</Text>
              <Text style={styles.statLabel}>SCORE</Text>
            </View>
            <View style={[styles.statCol, styles.statColBorder, { borderColor: dividerColor }]}>
              <Text style={[styles.statVal, { color: textTitle }]}>32</Text>
              <Text style={styles.statLabel}>TOTAL SCANS</Text>
            </View>
            <View style={styles.statCol}>
              <Text style={[styles.statVal, { color: textTitle }]}>4</Text>
              <Text style={styles.statLabel}>BLOCKED</Text>
            </View>
          </View>
        </View>

        {/* System Settings */}
        <Text style={styles.sectionTitle}>SYSTEM SETTINGS</Text>
        <View style={[styles.settingsCard, { backgroundColor: cardBg, borderColor: cardBorder }]}>
          
          <View style={[styles.settingRow, { borderBottomColor: dividerColor }]}>
            <View style={styles.settingTextCol}>
              <Text style={[styles.settingTitle, { color: textTitle }]}>Console Dark Mode</Text>
              <Text style={[styles.settingSub, { color: textSub }]}>Swap visual theme configurations</Text>
            </View>
            <Switch
              value={darkMode}
              onValueChange={handleToggleDark}
              trackColor={{ false: '#CBD5E1', true: '#2563EB' }}
              thumbColor="#FFFFFF"
            />
          </View>

          <View style={[styles.settingRow, { borderBottomColor: dividerColor }]}>
            <View style={styles.settingTextCol}>
              <Text style={[styles.settingTitle, { color: textTitle }]}>Real-Time Alerts</Text>
              <Text style={[styles.settingSub, { color: textSub }]}>Dispatch alert logs to inbox</Text>
            </View>
            <Switch
              value={alerts}
              onValueChange={handleToggleAlerts}
              trackColor={{ false: '#CBD5E1', true: '#2563EB' }}
              thumbColor="#FFFFFF"
            />
          </View>

          <View style={[styles.settingRow, { borderBottomWidth: 0 }]}>
            <View style={styles.settingTextCol}>
              <Text style={[styles.settingTitle, { color: textTitle }]}>Enforce OTP Verification (2FA)</Text>
              <Text style={[styles.settingSub, { color: textSub }]}>Require OTP tokens at console signin</Text>
            </View>
            <Switch
              value={mfa}
              onValueChange={handleToggleMfa}
              trackColor={{ false: '#CBD5E1', true: '#2563EB' }}
              thumbColor="#FFFFFF"
            />
          </View>
        </View>

        {/* Server IP */}
        <View style={[styles.settingsCard, { backgroundColor: cardBg, borderColor: cardBorder }]}>
          <Text style={[styles.cardHeaderTitle, { color: textTitle }]}>Console Gateway Config</Text>
          <CyberInput
            label="Backend Console API URL"
            value={serverUrl}
            onChangeText={setServerUrl}
            autoCapitalize="none"
          />
          <CyberButton
            title={updating ? "Updating Server..." : "Update Console IP"}
            onPress={handleUpdateIp}
            loading={updating}
            variant="secondary"
          />
        </View>

        {/* Logouts */}
        <CyberButton
          title="Logout Secure Session"
          onPress={handleLogout}
          variant="rose"
        />

      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scrollContainer: {
    flexGrow: 1,
    paddingBottom: 100,
  },
  content: {
    paddingHorizontal: 20,
    paddingTop: 16,
  },
  profileCard: {
    borderRadius: 24,
    padding: 20,
    borderWidth: 1,
    marginBottom: 20,
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 12,
    elevation: 2,
  },
  profileHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  avatarCircle: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#2563EB',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
  },
  avatarInitials: {
    fontSize: 18,
    fontWeight: '900',
    color: '#FFFFFF',
  },
  profileTextCol: {
    flex: 1,
  },
  profileName: {
    fontSize: 18,
    fontWeight: '900',
  },
  profileRole: {
    fontSize: 12,
    fontWeight: '600',
    marginTop: 2,
  },
  divider: {
    height: 1,
    marginBottom: 16,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  statCol: {
    flex: 1,
    alignItems: 'center',
  },
  statColBorder: {
    borderLeftWidth: 1,
    borderRightWidth: 1,
  },
  statVal: {
    fontSize: 20,
    fontWeight: '900',
  },
  statLabel: {
    fontSize: 10,
    fontWeight: '800',
    color: '#94A3B8',
    marginTop: 4,
    letterSpacing: 0.5,
  },
  sectionTitle: {
    fontSize: 11,
    fontWeight: '900',
    color: '#94A3B8',
    marginBottom: 10,
    letterSpacing: 0.8,
  },
  settingsCard: {
    borderRadius: 24,
    padding: 20,
    borderWidth: 1,
    marginBottom: 20,
  },
  cardHeaderTitle: {
    fontSize: 15,
    fontWeight: '800',
    marginBottom: 14,
  },
  settingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomWidth: 1,
    paddingBottom: 14,
    marginBottom: 14,
  },
  settingTextCol: {
    flex: 1,
    paddingRight: 10,
  },
  settingTitle: {
    fontSize: 13,
    fontWeight: '700',
  },
  settingSub: {
    fontSize: 10,
    marginTop: 2,
  },
});
