import React from 'react';
import {
  StyleSheet,
  View,
  Text,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { NotificationScanResult } from '../types';
import { RiskBadge } from '../components/RiskBadge';

interface NotificationAnalysisScreenProps {
  result: NotificationScanResult;
  onGoBack: () => void;
}

export const NotificationAnalysisScreen: React.FC<NotificationAnalysisScreenProps> = ({
  result,
  onGoBack,
}) => {
  const formattedTime = new Date(result.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
  const formattedDate = new Date(result.timestamp).toLocaleDateString([], { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' });

  const isScam = result.riskLevel === 'Critical Scam' || result.riskLevel === 'High Risk';
  const isSuspicious = result.riskLevel === 'Medium Risk';

  const heroBgColor = isScam ? '#FEF2F2' : isSuspicious ? '#FFFBEB' : '#ECFDF5';
  const heroBorderColor = isScam ? '#FCA5A5' : isSuspicious ? '#FDE68A' : '#A7F3D0';

  return (
    <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
      {/* Top Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={onGoBack} style={styles.backBtn}>
          <Text style={styles.backBtnText}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Forensic Audit Report</Text>
      </View>

      {/* Hero Overview Box */}
      <View style={[styles.heroBox, { backgroundColor: heroBgColor, borderColor: heroBorderColor }]}>
        <View style={styles.heroTopRow}>
          <RiskBadge level={result.riskLevel} size="large" />
          <Text style={styles.scoreText}>
            Score: <Text style={[styles.scoreNumber, isScam && { color: '#EF4444' }]}>{result.threatScore}</Text>/100
          </Text>
        </View>

        <Text style={styles.heroTitle}>{result.appName} Notification Audit</Text>
        <Text style={styles.heroSub}>
          Confidence Rating: {result.confidence}% • Analyzed at {formattedTime}
        </Text>

        <View style={styles.actionBox}>
          <Text style={styles.actionHeader}>RECOMMENDED ACTION</Text>
          <Text style={styles.actionText}>{result.recommendedAction}</Text>
        </View>
      </View>

      {/* Original Notification Body Panel */}
      <View style={styles.card}>
        <Text style={styles.sectionTitle}>ORIGINAL NOTIFICATION PAYLOAD</Text>
        
        <View style={styles.metaRow}>
          <Text style={styles.metaLabel}>Source App:</Text>
          <Text style={styles.metaValue}>{result.appName} ({result.packageName})</Text>
        </View>
        <View style={styles.metaRow}>
          <Text style={styles.metaLabel}>Category:</Text>
          <Text style={styles.metaValue}>{result.category}</Text>
        </View>
        <View style={styles.metaRow}>
          <Text style={styles.metaLabel}>Timestamp:</Text>
          <Text style={styles.metaValue}>{formattedDate} at {formattedTime}</Text>
        </View>

        <View style={styles.payloadBox}>
          <Text style={styles.payloadTitle}>{result.title || 'Untitled Notification'}</Text>
          <Text style={styles.payloadBody}>{result.body}</Text>
        </View>
      </View>

      {/* AI Explanation & Reasons Panel */}
      <View style={styles.card}>
        <Text style={styles.sectionTitle}>CYPHER AI FORENSIC REASONS</Text>

        {result.reasons && result.reasons.length > 0 ? (
          result.reasons.map((reason, idx) => (
            <View key={idx} style={styles.reasonRow}>
              <Text style={styles.reasonIcon}>{isScam ? '⚠️' : isSuspicious ? '⚡' : '✅'}</Text>
              <Text style={styles.reasonText}>{reason}</Text>
            </View>
          ))
        ) : (
          <Text style={{ fontSize: 13, color: '#64748B' }}>
            No specific threat vectors flagged by heuristic neural parser.
          </Text>
        )}
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
    marginRight: 14,
    padding: 4,
  },
  backBtnText: {
    fontSize: 22,
    color: '#0F172A',
    fontWeight: '800',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '900',
    color: '#0F172A',
  },
  heroBox: {
    borderRadius: 24,
    padding: 20,
    borderWidth: 1.5,
    marginBottom: 20,
  },
  heroTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
  },
  scoreText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#64748B',
  },
  scoreNumber: {
    fontSize: 18,
    fontWeight: '900',
    color: '#0F172A',
  },
  heroTitle: {
    fontSize: 20,
    fontWeight: '900',
    color: '#0F172A',
    marginBottom: 4,
  },
  heroSub: {
    fontSize: 12,
    color: '#64748B',
    marginBottom: 16,
  },
  actionBox: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: 'rgba(226, 232, 240, 0.8)',
  },
  actionHeader: {
    fontSize: 10,
    fontWeight: '900',
    color: '#94A3B8',
    letterSpacing: 0.8,
    marginBottom: 4,
  },
  actionText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#0F172A',
    lineHeight: 19,
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
  sectionTitle: {
    fontSize: 11,
    fontWeight: '900',
    color: '#94A3B8',
    letterSpacing: 0.8,
    marginBottom: 14,
  },
  metaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  metaLabel: {
    fontSize: 12,
    color: '#64748B',
    fontWeight: '600',
  },
  metaValue: {
    fontSize: 12,
    color: '#0F172A',
    fontWeight: '700',
  },
  payloadBox: {
    backgroundColor: '#F8FAFC',
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginTop: 8,
  },
  payloadTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: '#0F172A',
    marginBottom: 6,
  },
  payloadBody: {
    fontSize: 13,
    color: '#334155',
    lineHeight: 19,
  },
  reasonRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 10,
    gap: 10,
  },
  reasonIcon: {
    fontSize: 14,
    marginTop: 1,
  },
  reasonText: {
    flex: 1,
    fontSize: 13,
    fontWeight: '600',
    color: '#1E293B',
    lineHeight: 18,
  },
});
