import React from 'react';
import { StyleSheet, View, Text, TouchableOpacity } from 'react-native';
import { NotificationScanResult } from '../types';
import { RiskBadge } from './RiskBadge';

interface AlertCardProps {
  result: NotificationScanResult;
  onPress: (result: NotificationScanResult) => void;
  onDismiss?: (id: string) => void;
}

export const AlertCard: React.FC<AlertCardProps> = ({ result, onPress, onDismiss }) => {
  const isHighRisk = result.riskLevel === 'Critical Scam' || result.riskLevel === 'High Risk';
  const isMediumRisk = result.riskLevel === 'Medium Risk';

  const cardBorderColor = isHighRisk ? '#EF4444' : isMediumRisk ? '#F59E0B' : '#E2E8F0';
  const cardBgColor = isHighRisk ? '#FEF2F2' : isMediumRisk ? '#FFFBEB' : '#FFFFFF';

  return (
    <TouchableOpacity
      style={[styles.card, { borderColor: cardBorderColor, backgroundColor: cardBgColor }]}
      onPress={() => onPress(result)}
      activeOpacity={0.88}
    >
      <View style={styles.headerRow}>
        <View style={styles.appRow}>
          <Text style={styles.appTitle} numberOfLines={1}>
            {result.appName} • {result.title}
          </Text>
        </View>
        <RiskBadge level={result.riskLevel} size="small" />
      </View>

      <Text style={styles.bodyText} numberOfLines={2}>
        {result.body}
      </Text>

      <View style={styles.footerRow}>
        <View style={styles.scoreBadge}>
          <Text style={styles.scoreLabel}>Score: </Text>
          <Text style={[styles.scoreValue, isHighRisk && { color: '#EF4444' }]}>
            {result.threatScore}/100
          </Text>
          <Text style={styles.confidenceLabel}> ({result.confidence}% Confidence)</Text>
        </View>

        {onDismiss && (
          <TouchableOpacity onPress={() => onDismiss(result.id)} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
            <Text style={styles.dismissText}>Dismiss</Text>
          </TouchableOpacity>
        )}
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    borderRadius: 16,
    padding: 14,
    borderWidth: 1.5,
    marginBottom: 12,
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  appRow: {
    flex: 1,
    marginRight: 8,
  },
  appTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: '#0F172A',
  },
  bodyText: {
    fontSize: 12,
    color: '#475569',
    lineHeight: 17,
    marginBottom: 10,
  },
  footerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: 'rgba(226, 232, 240, 0.6)',
    paddingTop: 8,
  },
  scoreBadge: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  scoreLabel: {
    fontSize: 11,
    color: '#64748B',
    fontWeight: '600',
  },
  scoreValue: {
    fontSize: 11,
    fontWeight: '900',
    color: '#0F172A',
  },
  confidenceLabel: {
    fontSize: 10,
    color: '#94A3B8',
  },
  dismissText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#64748B',
  },
});
