import React, { useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Switch,
} from 'react-native';
import { NotificationSettingsConfig, SensitivityLevel } from '../types';

interface NotificationSettingsScreenProps {
  settings: NotificationSettingsConfig;
  permissionGranted: boolean;
  onUpdateSettings: (settings: NotificationSettingsConfig) => void;
  onRequestPermission: () => void;
  onGoBack?: () => void;
}

export const NotificationSettingsScreen: React.FC<NotificationSettingsScreenProps> = ({
  settings,
  permissionGranted,
  onUpdateSettings,
  onRequestPermission,
  onGoBack,
}) => {
  const [config, setConfig] = useState<NotificationSettingsConfig>(settings);

  const handleToggle = (key: keyof NotificationSettingsConfig, value: any) => {
    const updated = { ...config, [key]: value };
    setConfig(updated);
    onUpdateSettings(updated);
  };

  const handleSensitivitySelect = (level: SensitivityLevel) => {
    const updated = { ...config, sensitivity: level };
    setConfig(updated);
    onUpdateSettings(updated);
  };

  return (
    <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
      {/* Header */}
      <View style={styles.header}>
        {onGoBack && (
          <TouchableOpacity onPress={onGoBack} style={styles.backBtn}>
            <Text style={styles.backBtnText}>←</Text>
          </TouchableOpacity>
        )}
        <View style={{ flex: 1 }}>
          <Text style={styles.title}>Notification Protection Settings</Text>
          <Text style={styles.subtitle}>Configure AI threat detection parameters</Text>
        </View>
      </View>

      {/* Permission Access Card */}
      <View style={styles.card}>
        <View style={styles.cardHeaderRow}>
          <Text style={styles.cardIcon}>🛡️</Text>
          <View style={{ flex: 1 }}>
            <Text style={styles.cardTitle}>Android Notification Access</Text>
            <Text style={styles.cardDesc}>
              {permissionGranted
                ? 'CipherEye AI is authorized to intercept incoming scam vectors.'
                : 'Notification access permission is required for background monitoring.'}
            </Text>
          </View>
          <View
            style={[
              styles.statusBadge,
              permissionGranted ? styles.statusBadgeActive : styles.statusBadgeWarning,
            ]}
          >
            <Text
              style={[
                styles.statusBadgeText,
                permissionGranted ? styles.statusBadgeTextActive : styles.statusBadgeTextWarning,
              ]}
            >
              {permissionGranted ? 'Granted' : 'Required'}
            </Text>
          </View>
        </View>

        <View style={{ gap: 8, marginTop: 12 }}>
          {!permissionGranted && (
            <TouchableOpacity style={styles.grantBtn} onPress={onRequestPermission}>
              <Text style={styles.grantBtnText}>Grant Notification Access Permission</Text>
            </TouchableOpacity>
          )}

          <TouchableOpacity 
            style={[styles.grantBtn, { backgroundColor: '#059669' }]} 
            onPress={async () => {
              const { NotificationPermissionService } = require('../services/NotificationPermission');
              await NotificationPermissionService.requestSmsPermissions();
            }}
          >
            <Text style={styles.grantBtnText}>Grant SMS Scam Scanner Permissions (RECEIVE_SMS)</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Primary Toggles Card */}
      <View style={styles.card}>
        <Text style={styles.sectionHeader}>PROTECTION PARAMETERS</Text>

        <View style={styles.settingRow}>
          <View style={styles.settingTextCol}>
            <Text style={styles.settingTitle}>Enable Protection</Text>
            <Text style={styles.settingSub}>Continuously monitor incoming notifications</Text>
          </View>
          <Switch
            value={config.protectionEnabled}
            onValueChange={val => handleToggle('protectionEnabled', val)}
            trackColor={{ false: '#CBD5E1', true: '#2563EB' }}
            thumbColor="#FFFFFF"
          />
        </View>

        <View style={styles.settingRow}>
          <View style={styles.settingTextCol}>
            <Text style={styles.settingTitle}>Background Monitoring</Text>
            <Text style={styles.settingSub}>Analyze notifications when application is in background</Text>
          </View>
          <Switch
            value={config.backgroundMonitoring}
            onValueChange={val => handleToggle('backgroundMonitoring', val)}
            trackColor={{ false: '#CBD5E1', true: '#2563EB' }}
            thumbColor="#FFFFFF"
          />
        </View>

        <View style={styles.settingRow}>
          <View style={styles.settingTextCol}>
            <Text style={styles.settingTitle}>Live Notification Center Alerts</Text>
            <Text style={styles.settingSub}>Show system alerts when high threats or scams trigger</Text>
          </View>
          <Switch
            value={config.notificationAlerts}
            onValueChange={val => handleToggle('notificationAlerts', val)}
            trackColor={{ false: '#CBD5E1', true: '#2563EB' }}
            thumbColor="#FFFFFF"
          />
        </View>
      </View>

      {/* Sensitivity Selection Card */}
      <View style={styles.card}>
        <Text style={styles.sectionHeader}>AI SENSITIVITY LEVEL</Text>
        <Text style={styles.cardDesc}>
          Adjust heuristic threat thresholds. High sensitivity flags subtle social engineering patterns.
        </Text>

        <View style={styles.sensitivityRow}>
          {(['Low', 'Medium', 'High'] as SensitivityLevel[]).map(level => {
            const isSelected = config.sensitivity === level;
            return (
              <TouchableOpacity
                key={level}
                style={[
                  styles.sensitivityBtn,
                  isSelected && styles.sensitivityBtnSelected,
                ]}
                onPress={() => handleSensitivitySelect(level)}
              >
                <Text
                  style={[
                    styles.sensitivityText,
                    isSelected && styles.sensitivityTextSelected,
                  ]}
                >
                  {level}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </View>

      {/* Sound & Vibration Card */}
      <View style={styles.card}>
        <Text style={styles.sectionHeader}>ALERT FEEDBACK</Text>

        <View style={styles.settingRow}>
          <View style={styles.settingTextCol}>
            <Text style={styles.settingTitle}>Sound Alert</Text>
            <Text style={styles.settingSub}>Play audio chime when scam is detected</Text>
          </View>
          <Switch
            value={config.soundEnabled}
            onValueChange={val => handleToggle('soundEnabled', val)}
            trackColor={{ false: '#CBD5E1', true: '#2563EB' }}
            thumbColor="#FFFFFF"
          />
        </View>

        <View style={styles.settingRow}>
          <View style={styles.settingTextCol}>
            <Text style={styles.settingTitle}>Haptic Vibration</Text>
            <Text style={styles.settingSub}>Vibrate phone on critical threat alerts</Text>
          </View>
          <Switch
            value={config.vibrationEnabled}
            onValueChange={val => handleToggle('vibrationEnabled', val)}
            trackColor={{ false: '#CBD5E1', true: '#2563EB' }}
            thumbColor="#FFFFFF"
          />
        </View>
      </View>

      {/* Privacy Notice Card */}
      <View style={[styles.card, { backgroundColor: '#EFF6FF', borderColor: '#BFDBFE' }]}>
        <Text style={{ fontSize: 13, fontWeight: '800', color: '#1E40AF', marginBottom: 4 }}>
          🔒 Privacy & WhatsApp Exclusion Note
        </Text>
        <Text style={{ fontSize: 12, color: '#1E3A8A', lineHeight: 18 }}>
          WhatsApp notifications (com.whatsapp) are strictly excluded from monitoring for user privacy compliance. All notification data is analyzed locally and stored securely on your device.
        </Text>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 20,
    paddingBottom: 60,
    backgroundColor: '#F8FAFC',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
    marginTop: 10,
  },
  backBtn: {
    marginRight: 12,
    padding: 4,
  },
  backBtnText: {
    fontSize: 22,
    color: '#0F172A',
    fontWeight: '800',
  },
  title: {
    fontSize: 20,
    fontWeight: '900',
    color: '#0F172A',
  },
  subtitle: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 2,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 20,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },
  cardHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  cardIcon: {
    fontSize: 28,
  },
  cardTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: '#0F172A',
  },
  cardDesc: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 2,
    lineHeight: 17,
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusBadgeActive: {
    backgroundColor: '#DCFCE7',
  },
  statusBadgeWarning: {
    backgroundColor: '#FEF3C7',
  },
  statusBadgeText: {
    fontSize: 11,
    fontWeight: '800',
  },
  statusBadgeTextActive: {
    color: '#16A34A',
  },
  statusBadgeTextWarning: {
    color: '#D97706',
  },
  grantBtn: {
    backgroundColor: '#2563EB',
    borderRadius: 14,
    paddingVertical: 12,
    alignItems: 'center',
    marginTop: 16,
  },
  grantBtnText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '800',
  },
  sectionHeader: {
    fontSize: 11,
    fontWeight: '900',
    color: '#94A3B8',
    letterSpacing: 0.8,
    marginBottom: 12,
  },
  settingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
    paddingVertical: 12,
  },
  settingTextCol: {
    flex: 1,
    marginRight: 12,
  },
  settingTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: '#0F172A',
  },
  settingSub: {
    fontSize: 11,
    color: '#64748B',
    marginTop: 2,
  },
  sensitivityRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 14,
  },
  sensitivityBtn: {
    flex: 1,
    height: 42,
    borderRadius: 12,
    backgroundColor: '#F1F5F9',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  sensitivityBtnSelected: {
    backgroundColor: '#2563EB',
    borderColor: '#2563EB',
  },
  sensitivityText: {
    fontSize: 13,
    fontWeight: '800',
    color: '#475569',
  },
  sensitivityTextSelected: {
    color: '#FFFFFF',
  },
});
