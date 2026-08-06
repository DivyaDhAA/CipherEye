import React from 'react';
import { StyleSheet, View, Text, ViewStyle } from 'react-native';
import { Colors } from '../constants/Colors';

interface ThreatCardProps {
  type: string;
  inputData: string;
  threatScore: number;
  riskLevel: string;
  confidence: number;
  explanation?: string;
  style?: ViewStyle;
}

export const ThreatCard: React.FC<ThreatCardProps> = ({
  type,
  inputData,
  threatScore,
  riskLevel,
  confidence,
  explanation,
  style
}) => {
  const isHighRisk = threatScore > 70 || riskLevel.toLowerCase() === 'high';
  const isMediumRisk = !isHighRisk && (threatScore > 35 || riskLevel.toLowerCase() === 'medium');

  const getStatusColor = () => {
    if (isHighRisk) return Colors.accentRose;
    if (isMediumRisk) return Colors.accentAmber;
    return Colors.accentEmerald;
  };

  const getStatusBgColor = () => {
    if (isHighRisk) return Colors.bgRoseLight;
    if (isMediumRisk) return Colors.bgAmberLight;
    return Colors.bgEmeraldLight;
  };

  return (
    <View style={[styles.card, style]}>
      <View style={styles.cardHeader}>
        <Text style={styles.headerTitle}>AI Security Diagnostic Report</Text>
        <View style={[styles.badge, { backgroundColor: getStatusBgColor() }]}>
          <Text style={[styles.badgeText, { color: getStatusColor() }]}>
            {riskLevel} Risk
          </Text>
        </View>
      </View>
      
      <Text style={styles.meta}>Inspection Module: {type}</Text>
      
      <View style={styles.payloadContainer}>
        <Text style={styles.payloadLabel}>Audited Target Payload:</Text>
        <Text style={styles.payloadText} numberOfLines={3}>{inputData}</Text>
      </View>
      
      <View style={styles.divider} />
      
      <View style={styles.statsRow}>
        <View style={styles.statBox}>
          <Text style={styles.statLabel}>Threat Index</Text>
          <Text style={[styles.statValue, { color: getStatusColor() }]}>{threatScore}%</Text>
        </View>
        <View style={styles.statBox}>
          <Text style={styles.statLabel}>Model Confidence</Text>
          <Text style={styles.statValue}>{confidence}%</Text>
        </View>
        <View style={styles.statBox}>
          <Text style={styles.statLabel}>Verdict</Text>
          <Text style={[styles.statValue, { color: getStatusColor(), fontSize: 13 }]}>
            {isHighRisk ? 'BLOCKED' : (isMediumRisk ? 'WARNING' : 'SAFE')}
          </Text>
        </View>
      </View>

      {explanation && (
        <View style={styles.explanationContainer}>
          <Text style={styles.explanationTitle}>Explainable AI (LIME/SHAP Heuristics)</Text>
          <Text style={styles.explanationText}>{explanation}</Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: Colors.cardBorder,
    borderRadius: 24,
    padding: 20,
    width: '100%',
    shadowColor: Colors.accentPrimary,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.08,
    shadowRadius: 20,
    elevation: 4,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  headerTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  badge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
  },
  badgeText: {
    fontSize: 11,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  meta: {
    fontSize: 12,
    color: Colors.accentPrimary,
    fontWeight: '600',
    marginBottom: 14,
  },
  payloadContainer: {
    backgroundColor: Colors.bgPrimary,
    padding: 12,
    borderRadius: 12,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: 'rgba(79, 124, 255, 0.05)',
  },
  payloadLabel: {
    fontSize: 11,
    color: Colors.textMuted,
    fontWeight: '600',
    marginBottom: 4,
  },
  payloadText: {
    fontSize: 13,
    color: Colors.textSecondary,
    fontFamily: 'System',
    lineHeight: 18,
  },
  divider: {
    height: 1,
    backgroundColor: Colors.bgTertiary,
    marginBottom: 14,
    opacity: 0.5,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  statBox: {
    flex: 1,
    alignItems: 'center',
  },
  statLabel: {
    fontSize: 11,
    color: Colors.textSecondary,
    marginBottom: 4,
  },
  statValue: {
    fontSize: 15,
    fontWeight: '800',
    color: Colors.textPrimary,
  },
  explanationContainer: {
    marginTop: 16,
    backgroundColor: 'rgba(139, 92, 246, 0.05)',
    borderWidth: 1,
    borderColor: 'rgba(139, 92, 246, 0.12)',
    borderRadius: 12,
    padding: 12,
  },
  explanationTitle: {
    fontSize: 11,
    fontWeight: '700',
    color: Colors.accentViolet,
    marginBottom: 4,
    textTransform: 'uppercase',
  },
  explanationText: {
    fontSize: 12,
    color: Colors.textSecondary,
    lineHeight: 16,
  }
});
