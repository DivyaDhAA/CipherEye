import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Alert, StyleSheet, Dimensions, Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useAuthContext } from '../../src/context/AuthContext';

const { width } = Dimensions.get('window');
const cardWidth = (width - 52) / 2;

export default function Home() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { user } = useAuthContext();
  
  const [hoveredCard, setHoveredCard] = useState<string | null>(null);

  const [logs] = useState([
    { id: '1', type: 'Website', input: 'https://login-verify-paypal.secure-update.xyz', risk: 'High Risk', time: '1h ago' },
    { id: '2', type: 'SMS', input: 'URGENT: SecureChecking account deactivated. Unlock logs: http://bit.ly/bank-verify', risk: 'High Risk', time: '3h ago' },
    { id: '3', type: 'Link', input: 'https://google.com', risk: 'Safe', time: 'Yesterday' }
  ]);

  const weeklyStats = [
    { d: 'M', v: 12 },
    { d: 'T', v: 18 },
    { d: 'W', v: 8 },
    { d: 'T', v: 24 },
    { d: 'F', v: 15 },
    { d: 'S', v: 6 },
    { d: 'S', v: 14 }
  ];

  const modules = [
    { key: 'website', name: 'Website Scanner', icon: '🌐', desc: 'Audit destination URLs for credential harvesting threat vectors.' },
    { key: 'link', name: 'Link Hops Trace', icon: '🔗', desc: 'Audit redirection hops, SSL certifications, and host domains.' },
    { key: 'notif', name: 'Notification Scam Guard', icon: '🔔', desc: 'Real-time background interceptor & status bar alert scanner.' },
    { key: 'qr', name: 'QR Code Decoder', icon: '📷', desc: 'Audit physical QR code redirection routes safely.' },
    { key: 'sms', name: 'SMS Scam NLP', icon: '💬', desc: 'Audit urgencies and phishing semantics in SMS messages.' },
    { key: 'email', name: 'EML Email Audit', icon: '✉️', desc: 'Audit DKIM, SPF, and DMARC envelope spoofing routes.' },
    { key: 'chat', name: 'AI Cyber Advisor', icon: '🤖', desc: 'Consult Cypher AI threat advisor on security topics.' }
  ];

  const handleDeviceCheck = () => {
    Alert.alert(
      'System Diagnostics', 
      'Scanning local connections, active ports, and downloaded packages...',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Verify', onPress: () => Alert.alert('Clean System', '0 malicious assets quarantined. Security status: Protected.') }
      ]
    );
  };

  const handlePress = (key: string) => {
    if (key === 'chat') {
      router.push('/(tabs)/chat');
    } else {
      router.push({ pathname: '/(tabs)/scanner', params: { defaultTab: key } });
    }
  };

  return (
    <ScrollView 
      contentContainerStyle={[
        styles.scrollContainer,
        { paddingTop: Math.max(insets.top + 12, 24), paddingBottom: Math.max(insets.bottom + 90, 100) },
        Platform.OS === 'web' && { paddingLeft: 260 }
      ]} 
      keyboardShouldPersistTaps="handled"
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.content}>
        
        {/* Header section (Web vs Native) */}
        {Platform.OS === 'web' ? (
          <View style={styles.webHeader}>
            <Text style={styles.breadcrumbs}>Console  /  Dashboard  /  Overview</Text>
            
            <View style={styles.webHeaderMain}>
              <View>
                <Text style={styles.webTitle}>Security Command Center</Text>
                <Text style={styles.webSubtitle}>Welcome back, {user?.fullName || user?.username || 'Analyst'} • Real-time protection is active.</Text>
              </View>
              
              <View style={styles.webHeaderRight}>
                <View style={styles.webSearchContainer}>
                  <Text style={styles.webSearchIcon}>🔍</Text>
                  <Text style={styles.webSearchPlaceholder}>Search threats...</Text>
                </View>
                
                <TouchableOpacity style={styles.webNotificationBtn}>
                  <Text style={styles.webNotificationIcon}>🔔</Text>
                  <View style={styles.webNotificationBadge} />
                </TouchableOpacity>
                
                <View style={styles.avatarBadge}>
                  <Text style={styles.avatarText}>
                    {(user?.fullName || user?.username || 'Analyst').substring(0, 2).toUpperCase()}
                  </Text>
                </View>
              </View>
            </View>
          </View>
        ) : (
          <View style={styles.headerRow}>
            <View>
              <Text style={styles.greetingSub}>Good Morning,</Text>
              <Text style={styles.greetingName}>
                {user?.fullName || user?.username || user?.email?.split('@')[0] || 'Security Analyst'}
              </Text>
            </View>
            <View style={styles.avatarBadge}>
              <Text style={styles.avatarText}>
                {(user?.fullName || user?.username || 'Analyst').substring(0, 2).toUpperCase()}
              </Text>
            </View>
          </View>
        )}

        {/* Shield Banner */}
        <View style={styles.bannerCard}>
          <View style={styles.bannerHeader}>
            <Text style={styles.shieldIcon}>🛡️</Text>
            <View style={styles.bannerTextCol}>
              <Text style={styles.bannerTitle}>Your Device is Protected</Text>
              <Text style={styles.bannerSub}>Real-time fraud interceptors active</Text>
            </View>
          </View>
          
          <TouchableOpacity 
            style={[styles.auditBtn, Platform.OS === 'web' && styles.auditBtnWeb]}
            onPress={handleDeviceCheck}
          >
            <Text style={styles.auditBtnText}>Audit Local Connections</Text>
          </TouchableOpacity>
        </View>

        {/* Module Launcher Grid */}
        <Text style={styles.sectionTitle}>
          SECURITY MODULES LAUNCHER
        </Text>
        <View style={styles.gridContainer}>
          {modules.map(module => {
            const isHovered = hoveredCard === module.key;
            return (
              <TouchableOpacity 
                key={module.key}
                style={[
                  styles.gridCard,
                  Platform.OS === 'web' && styles.gridCardWeb,
                  Platform.OS === 'web' && isHovered && styles.gridCardWebHovered
                ]}
                onPress={() => handlePress(module.key)}
                // @ts-ignore
                onMouseEnter={() => setHoveredCard(module.key)}
                // @ts-ignore
                onMouseLeave={() => setHoveredCard(null)}
              >
                <Text style={styles.moduleIcon}>{module.icon}</Text>
                <Text style={styles.moduleName}>{module.name}</Text>
                
                {Platform.OS === 'web' && (
                  <>
                    <Text style={styles.moduleDesc}>{module.desc}</Text>
                    <View style={[styles.openModuleBtn, isHovered && styles.openModuleBtnHovered]}>
                      <Text style={[styles.openModuleBtnText, isHovered && styles.openModuleBtnTextHovered]}>Open Module</Text>
                    </View>
                  </>
                )}
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Split Section on Web vs Stacked on Native */}
        {Platform.OS === 'web' ? (
          <View style={styles.dashboardSplitRow}>
            
            <View style={styles.dashboardSplitCol}>
              <Text style={styles.sectionTitle}>WEEKLY INTERCEPTS STATISTICS</Text>
              <View style={styles.statsCard}>
                <View style={styles.barsContainer}>
                  {weeklyStats.map((bar, idx) => (
                    <View key={idx} style={styles.barCol}>
                      <View 
                        style={[
                          styles.barFill,
                          { height: bar.v * 3 },
                          idx === 3 && { backgroundColor: '#EF4444' }
                        ]}
                      />
                      <Text style={styles.barLabel}>{bar.d}</Text>
                    </View>
                  ))}
                </View>
                <Text style={styles.statsSub}>
                  Average intercept rate: 14 scam vectors/day
                </Text>
              </View>
            </View>

            <View style={styles.dashboardSplitCol}>
              <Text style={styles.sectionTitle}>RECENT SECURITY LOGS</Text>
              <View style={styles.logsList}>
                {logs.map((log) => (
                  <View key={log.id} style={styles.logCard}>
                    <View style={styles.logIconBox}>
                      <Text style={styles.logIconText}>
                        {log.type === 'Website' ? '🌐' : (log.type === 'SMS' ? '💬' : '🔗')}
                      </Text>
                    </View>
                    <View style={styles.logTextCol}>
                      <Text style={styles.logInputText} numberOfLines={1}>
                        {log.input}
                      </Text>
                      <Text style={styles.logMetaText}>
                        Module: {log.type} • {log.time}
                      </Text>
                    </View>
                    <View 
                      style={[
                        styles.riskBadge,
                        log.risk.includes('High') ? styles.riskHigh : styles.riskSafe
                      ]}
                    >
                      <Text 
                        style={[
                          styles.riskBadgeText,
                          log.risk.includes('High') ? styles.riskHighText : styles.riskSafeText
                        ]}
                      >
                        {log.risk}
                      </Text>
                    </View>
                  </View>
                ))}
              </View>
            </View>
            
          </View>
        ) : (
          <>
            {/* Native Stacked Stats */}
            <Text style={styles.sectionTitle}>
              WEEKLY INTERCEPTS STATISTICS
            </Text>
            <View style={styles.statsCard}>
              <View style={styles.barsContainer}>
                {weeklyStats.map((bar, idx) => (
                  <View key={idx} style={styles.barCol}>
                    <View 
                      style={[
                        styles.barFill,
                        { height: bar.v * 3 },
                        idx === 3 && { backgroundColor: '#EF4444' }
                      ]}
                    />
                    <Text style={styles.barLabel}>{bar.d}</Text>
                  </View>
                ))}
              </View>
              <Text style={styles.statsSub}>
                Average intercept rate: 14 scam vectors/day
              </Text>
            </View>

            {/* Native Stacked Logs */}
            <Text style={styles.sectionTitle}>
              RECENT SECURITY LOGS
            </Text>
            <View style={styles.logsList}>
              {logs.map((log) => (
                <View key={log.id} style={styles.logCard}>
                  <View style={styles.logIconBox}>
                    <Text style={styles.logIconText}>
                      {log.type === 'Website' ? '🌐' : (log.type === 'SMS' ? '💬' : '🔗')}
                    </Text>
                  </View>
                  <View style={styles.logTextCol}>
                    <Text style={styles.logInputText} numberOfLines={1}>
                      {log.input}
                    </Text>
                    <Text style={styles.logMetaText}>
                      Module: {log.type} • {log.time}
                    </Text>
                  </View>
                  <View 
                    style={[
                      styles.riskBadge,
                      log.risk.includes('High') ? styles.riskHigh : styles.riskSafe
                    ]}
                  >
                    <Text 
                      style={[
                        styles.riskBadgeText,
                        log.risk.includes('High') ? styles.riskHighText : styles.riskSafeText
                      ]}
                    >
                      {log.risk}
                    </Text>
                  </View>
                </View>
              ))}
            </View>
          </>
        )}

      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scrollContainer: {
    flexGrow: 1,
    backgroundColor: '#F8FAFC',
    paddingBottom: 100,
  },
  content: {
    paddingHorizontal: 20,
    paddingTop: 48,
    maxWidth: Platform.OS === 'web' ? 1400 : undefined,
    alignSelf: Platform.OS === 'web' ? 'center' : undefined,
    width: '100%',
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  greetingSub: {
    fontSize: 12,
    fontWeight: '600',
    color: '#64748B',
  },
  greetingName: {
    fontSize: 22,
    fontWeight: '900',
    color: '#0F172A',
  },
  avatarBadge: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#EFF6FF',
    borderWidth: 1,
    borderColor: '#BFDBFE',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    fontSize: 13,
    fontWeight: '800',
    color: '#2563EB',
  },
  bannerCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: 24,
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
    flexDirection: Platform.OS === 'web' ? 'row' : 'column',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  bannerHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: Platform.OS === 'web' ? 1 : undefined,
    marginBottom: Platform.OS === 'web' ? 0 : 16,
  },
  shieldIcon: {
    fontSize: 32,
    marginRight: 14,
  },
  bannerTextCol: {
    flex: 1,
  },
  bannerTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: '#0F172A',
  },
  bannerSub: {
    fontSize: 11,
    color: '#64748B',
    marginTop: 2,
  },
  auditBtn: {
    height: 44,
    backgroundColor: '#2563EB',
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
  },
  auditBtnWeb: {
    paddingHorizontal: 20,
    width: 'auto',
  },
  auditBtnText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '800',
  },
  sectionTitle: {
    fontSize: 11,
    fontWeight: '900',
    color: '#94A3B8',
    marginBottom: 12,
    letterSpacing: 0.8,
  },
  gridContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 24,
    gap: Platform.OS === 'web' ? 24 : undefined,
  },
  gridCard: {
    width: cardWidth,
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 16,
    alignItems: 'center',
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 1,
  },
  gridCardWeb: {
    flexBasis: 280,
    flexGrow: 1,
    flexShrink: 1,
    minWidth: 260,
    maxWidth: 380,
    height: 220,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    padding: 24,
    alignItems: 'center',
    justifyContent: 'center',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    marginBottom: 0,
    // @ts-ignore
    transition: 'all 0.2s ease-in-out',
  },
  gridCardWebHovered: {
    borderColor: '#2563EB',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.12,
    shadowRadius: 16,
    // @ts-ignore
    transform: 'translateY(-4px)',
  },
  moduleIcon: {
    fontSize: 26,
    marginBottom: 8,
  },
  moduleName: {
    fontSize: 13,
    fontWeight: '800',
    color: '#1E293B',
    textAlign: 'center',
  },
  moduleDesc: {
    fontSize: 11,
    color: '#64748B',
    textAlign: 'center',
    marginTop: 8,
    lineHeight: 15,
  },
  openModuleBtn: {
    marginTop: 16,
    backgroundColor: '#EFF6FF',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(37, 99, 235, 0.15)',
    // @ts-ignore
    transition: 'all 0.2s ease-in-out',
  },
  openModuleBtnHovered: {
    backgroundColor: '#2563EB',
    borderColor: '#2563EB',
  },
  openModuleBtnText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#2563EB',
  },
  openModuleBtnTextHovered: {
    color: '#FFFFFF',
  },
  statsCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: 24,
    flex: 1,
  },
  barsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    height: 90,
    marginBottom: 12,
    paddingHorizontal: 8,
  },
  barCol: {
    alignItems: 'center',
  },
  barFill: {
    width: 14,
    borderRadius: 6,
    backgroundColor: '#3B82F6',
  },
  barLabel: {
    fontSize: 10,
    fontWeight: '800',
    color: '#64748B',
    marginTop: 6,
  },
  statsSub: {
    fontSize: 11,
    color: '#64748B',
    textAlign: 'center',
  },
  logsList: {
    gap: 10,
    flex: 1,
  },
  logCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 12,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: 10,
  },
  logIconBox: {
    width: 40,
    height: 40,
    borderRadius: 10,
    backgroundColor: '#F1F5F9',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  logIconText: {
    fontSize: 18,
  },
  logTextCol: {
    flex: 1,
    marginRight: 8,
  },
  logInputText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#1E293B',
  },
  logMetaText: {
    fontSize: 10,
    color: '#64748B',
    marginTop: 2,
  },
  riskBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  riskHigh: {
    backgroundColor: '#FEE2E2',
  },
  riskSafe: {
    backgroundColor: '#DCFCE7',
  },
  riskBadgeText: {
    fontSize: 10,
    fontWeight: '800',
  },
  riskHighText: {
    color: '#EF4444',
  },
  riskSafeText: {
    color: '#16A34A',
  },
  
  // Web specific top header styling
  webHeader: {
    marginBottom: 28,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
    paddingBottom: 16,
    width: '100%',
  },
  breadcrumbs: {
    fontSize: 10,
    fontWeight: '600',
    color: '#94A3B8',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 6,
  },
  webTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: '#0F172A',
  },
  webSubtitle: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 4,
  },
  webHeaderMain: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 16,
  },
  webHeaderRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  webSearchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 8,
    paddingHorizontal: 12,
    height: 38,
    width: 220,
  },
  webSearchIcon: {
    fontSize: 12,
    marginRight: 8,
  },
  webSearchPlaceholder: {
    fontSize: 12,
    color: '#94A3B8',
  },
  webNotificationBtn: {
    width: 38,
    height: 38,
    borderRadius: 8,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  webNotificationIcon: {
    fontSize: 16,
  },
  webNotificationBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#FF4D4F',
  },
  dashboardSplitRow: {
    flexDirection: 'row',
    gap: 24,
    width: '100%',
    marginTop: 16,
  },
  dashboardSplitCol: {
    flex: 1,
    minWidth: 320,
  },
});
