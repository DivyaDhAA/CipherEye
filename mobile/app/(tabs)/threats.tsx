import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, StyleSheet, Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

interface IncidentItem {
  id: string;
  time: string;
  location: string;
  ip: string;
  title: string;
  risk: 'High' | 'Medium' | 'Low';
  status: string;
}

export default function Threats() {
  const insets = useSafeAreaInsets();

  const [incidents, setIncidents] = useState<IncidentItem[]>([
    { id: '1', time: '14:13:02 PM', location: 'Beijing, CN', ip: '221.4.18.9', title: 'SQL Injection Attack Blocked', risk: 'High', status: 'Quarantined' },
    { id: '2', time: '14:13:10 PM', location: 'Sofia, BG', ip: '193.102.1.88', title: 'Quishing QR Payload Decoded', risk: 'Medium', status: 'Blocked' },
    { id: '3', time: '14:13:18 PM', location: 'Moscow, RU', ip: '185.12.4.9', title: 'Phishing SMS Vector Quarantined', risk: 'High', status: 'Intercepted' },
    { id: '4', time: '14:13:24 PM', location: 'Dallas, US', ip: '74.200.12.4', title: 'Clean SSL Certificate Audit', risk: 'Low', status: 'Audited' }
  ]);

  useEffect(() => {
    const interval = setInterval(() => {
      const origins = [
        { location: 'Shenzhen, CN', ip: '202.43.18.9' },
        { location: 'St. Petersburg, RU', ip: '95.101.44.18' },
        { location: 'Sofia, BG', ip: '82.200.10.4' },
        { location: 'Frankfurt, DE', ip: '94.103.1.20' },
        { location: 'Tokyo, JP', ip: '133.242.18.5' }
      ];
      const titles = [
        'Phishing Domain Decoded & Blocked',
        'Malicious EML Attachment Quarantined',
        'XSS Script Injection Defeated',
        'Suspicious SMS Gateway Intercepted',
        'Zero-Day Anomaly Isolated'
      ];
      const risks: ('High' | 'Medium' | 'Low')[] = ['High', 'Medium', 'Low'];
      const statuses = ['Intercepted', 'Quarantined', 'Blocked', 'Mitigated'];

      const randomOrigin = origins[Math.floor(Math.random() * origins.length)];
      const randomTitle = titles[Math.floor(Math.random() * titles.length)];
      const randomRisk = risks[Math.floor(Math.random() * risks.length)];
      const randomStatus = statuses[Math.floor(Math.random() * statuses.length)];
      const timestamp = new Date().toLocaleTimeString('en-US', { hour12: true });

      setIncidents(prev => [
        {
          id: Math.random().toString(),
          time: timestamp,
          location: randomOrigin.location,
          ip: randomOrigin.ip,
          title: randomTitle,
          risk: randomRisk,
          status: randomStatus
        },
        ...prev.slice(0, 9)
      ]);
    }, 6000);

    return () => clearInterval(interval);
  }, []);

  const getSeverityStyle = (risk: 'High' | 'Medium' | 'Low') => {
    if (risk === 'High') {
      return {
        badgeBg: 'rgba(239, 68, 68, 0.1)',
        badgeBorder: 'rgba(239, 68, 68, 0.25)',
        badgeText: '#EF4444',
        icon: '🛑'
      };
    }
    if (risk === 'Medium') {
      return {
        badgeBg: 'rgba(245, 158, 11, 0.1)',
        badgeBorder: 'rgba(245, 158, 11, 0.25)',
        badgeText: '#F59E0B',
        icon: '⚠️'
      };
    }
    return {
      badgeBg: 'rgba(16, 185, 129, 0.1)',
      badgeBorder: 'rgba(16, 185, 129, 0.25)',
      badgeText: '#10B981',
      icon: '🛡️'
    };
  };

  return (
    <ScrollView 
      contentContainerStyle={[
        styles.scrollContainer, 
        { paddingTop: Math.max(insets.top + 16, 32), paddingBottom: Math.max(insets.bottom + 90, 100) },
        Platform.OS === 'web' && { paddingLeft: 260 }
      ]}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.header}>
        <View style={styles.headerTitleRow}>
          <Text style={styles.headerIcon}>🌐</Text>
          <Text style={styles.headerTitle}>Global Incident Feed</Text>
        </View>
        <Text style={styles.headerSubtitle}>
          Real-time stream of security threats intercepted globally by CypherEye filters.
        </Text>
      </View>

      <View style={styles.cardList}>
        {incidents.map(inc => {
          const severity = getSeverityStyle(inc.risk);
          return (
            <View key={inc.id} style={styles.card}>
              {/* Header Row */}
              <View style={styles.cardHeader}>
                <View style={styles.titleContainer}>
                  <Text style={styles.incidentIcon}>{severity.icon}</Text>
                  <Text style={styles.cardTitle} numberOfLines={2}>{inc.title}</Text>
                </View>
                <View style={[styles.severityBadge, { backgroundColor: severity.badgeBg, borderColor: severity.badgeBorder }]}>
                  <Text style={[styles.severityText, { color: severity.badgeText }]}>
                    {inc.risk} SEVERITY
                  </Text>
                </View>
              </View>

              {/* Meta Row */}
              <View style={styles.metaRow}>
                <View style={styles.metaBadge}>
                  <Text style={styles.metaLabel}>🕒 Time:</Text>
                  <Text style={styles.metaValue}>{inc.time}</Text>
                </View>
                <View style={styles.metaBadge}>
                  <Text style={styles.metaLabel}>📍 Location:</Text>
                  <Text style={styles.metaValue}>{inc.location}</Text>
                </View>
              </View>

              <View style={styles.metaRow}>
                <View style={styles.metaBadge}>
                  <Text style={styles.metaLabel}>🌐 Origin IP:</Text>
                  <Text style={styles.metaValue}>{inc.ip}</Text>
                </View>
                <View style={styles.statusBadge}>
                  <Text style={styles.statusIcon}>✓</Text>
                  <Text style={styles.statusText}>{inc.status}</Text>
                </View>
              </View>
            </View>
          );
        })}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scrollContainer: {
    flexGrow: 1,
    backgroundColor: '#F8FAFC',
    paddingHorizontal: 16,
  },
  header: {
    marginBottom: 20,
  },
  headerTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  headerIcon: {
    fontSize: 22,
    marginRight: 8,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: '900',
    color: '#0F172A',
    letterSpacing: 0.3,
  },
  headerSubtitle: {
    fontSize: 13,
    color: '#64748B',
    lineHeight: 18,
  },
  cardList: {
    gap: 14,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: 10,
  },
  incidentIcon: {
    fontSize: 18,
    marginRight: 8,
  },
  cardTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: '#0F172A',
    flexShrink: 1,
    lineHeight: 20,
  },
  severityBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
    alignSelf: 'flex-start',
  },
  severityText: {
    fontSize: 10,
    fontWeight: '900',
    letterSpacing: 0.5,
  },
  metaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8,
    gap: 8,
  },
  metaBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
    flexShrink: 1,
  },
  metaLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: '#64748B',
    marginRight: 4,
  },
  metaValue: {
    fontSize: 11,
    fontWeight: '700',
    color: '#1E293B',
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EFF6FF',
    borderWidth: 1,
    borderColor: '#BFDBFE',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
  },
  statusIcon: {
    fontSize: 11,
    fontWeight: '900',
    color: '#2563EB',
    marginRight: 4,
  },
  statusText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#1D4ED8',
  },
});
