import React from 'react';
import { StyleSheet, View, Text, TouchableOpacity } from 'react-native';
import { NotificationScanResult } from '../types';
import { RiskBadge } from './RiskBadge';

interface NotificationCardProps {
  item: NotificationScanResult;
  onPress: (item: NotificationScanResult) => void;
  onDelete: (id: string) => void;
}

export const NotificationCard: React.FC<NotificationCardProps> = ({ item, onPress, onDelete }) => {
  const formattedTime = new Date(item.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  const formattedDate = new Date(item.timestamp).toLocaleDateString([], { month: 'short', day: 'numeric' });

  return (
    <TouchableOpacity style={styles.card} onPress={() => onPress(item)} activeOpacity={0.85}>
      <View style={styles.topRow}>
        <View style={styles.appInfo}>
          <Text style={styles.appName}>{item.appName}</Text>
          <Text style={styles.dot}>•</Text>
          <Text style={styles.timeText}>{formattedDate}, {formattedTime}</Text>
        </View>
        <RiskBadge level={item.riskLevel} size="small" />
      </View>

      <Text style={styles.title} numberOfLines={1}>
        {item.title || 'Untitled Notification'}
      </Text>

      <Text style={styles.body} numberOfLines={2}>
        {item.body}
      </Text>

      <View style={styles.reasonsContainer}>
        {item.reasons.slice(0, 2).map((reason, idx) => (
          <Text key={idx} style={styles.reasonTag} numberOfLines={1}>
            • {reason}
          </Text>
        ))}
      </View>

      <View style={styles.footer}>
        <View style={styles.scoreRow}>
          <Text style={styles.scoreText}>Threat Score: <Text style={styles.scoreNum}>{item.threatScore}/100</Text></Text>
        </View>

        <TouchableOpacity onPress={() => onDelete(item.id)} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
          <Text style={styles.deleteBtnText}>Delete</Text>
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  appInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: 8,
  },
  appName: {
    fontSize: 12,
    fontWeight: '800',
    color: '#2563EB',
  },
  dot: {
    fontSize: 10,
    color: '#94A3B8',
    marginHorizontal: 4,
  },
  timeText: {
    fontSize: 11,
    color: '#64748B',
  },
  title: {
    fontSize: 14,
    fontWeight: '800',
    color: '#0F172A',
    marginBottom: 4,
  },
  body: {
    fontSize: 12,
    color: '#475569',
    lineHeight: 17,
    marginBottom: 10,
  },
  reasonsContainer: {
    backgroundColor: '#F8FAFC',
    borderRadius: 8,
    padding: 8,
    marginBottom: 10,
    gap: 3,
  },
  reasonTag: {
    fontSize: 11,
    color: '#475569',
    fontWeight: '500',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
    paddingTop: 8,
  },
  scoreRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  scoreText: {
    fontSize: 11,
    color: '#64748B',
    fontWeight: '600',
  },
  scoreNum: {
    fontWeight: '900',
    color: '#0F172A',
  },
  deleteBtnText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#EF4444',
  },
});
