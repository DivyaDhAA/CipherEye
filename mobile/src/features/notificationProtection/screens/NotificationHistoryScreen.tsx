import React, { useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  FlatList,
  TextInput,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { NotificationScanResult, ScamRiskLevel } from '../types';
import { NotificationCard } from '../components/NotificationCard';

interface NotificationHistoryScreenProps {
  history: NotificationScanResult[];
  onSelectResult: (result: NotificationScanResult) => void;
  onDeleteItem: (id: string) => void;
  onClearHistory: () => void;
  onGoBack?: () => void;
  onSimulateNotification?: (
    appName: string,
    packageName: string,
    title: string,
    body: string
  ) => Promise<any>;
}

export const NotificationHistoryScreen: React.FC<NotificationHistoryScreenProps> = ({
  history,
  onSelectResult,
  onDeleteItem,
  onClearHistory,
  onGoBack,
  onSimulateNotification,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilter, setSelectedFilter] = useState<string>('All');
  const [sortBy, setSortBy] = useState<'newest' | 'score'>('newest');
  const [customTestText, setCustomTestText] = useState('');
  const [simulating, setSimulating] = useState(false);

  const filterOptions = ['All', 'Scam', 'Suspicious', 'Safe', 'SMS', 'Gmail', 'UPI', 'Banking'];

  const handleTestSimulate = async (
    appName: string,
    packageName: string,
    title: string,
    body: string
  ) => {
    if (!onSimulateNotification) return;
    setSimulating(true);
    try {
      const res = await onSimulateNotification(appName, packageName, title, body);
      if (res) {
        Alert.alert(
          res.riskLevel === 'Critical Scam' || res.riskLevel === 'High Risk'
            ? '🔴 Scam Alert Triggered'
            : res.riskLevel === 'Medium Risk'
            ? '🟡 Suspicious Notification Triggered'
            : '🟢 Safe Notification Verified',
          `Notification intercepted! Native notification posted to status bar.\nThreat Score: ${res.threatScore}/100 | Risk: ${res.riskLevel}`
        );
      }
    } catch (err) {
      console.warn('Simulation error:', err);
    } finally {
      setSimulating(false);
    }
  };

  const filteredHistory = history.filter(item => {
    const matchesSearch =
      (item.title || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (item.body || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (item.appName || '').toLowerCase().includes(searchQuery.toLowerCase());

    if (!matchesSearch) return false;

    if (selectedFilter === 'All') return true;
    if (selectedFilter === 'Scam') return item.riskLevel === 'Critical Scam' || item.riskLevel === 'High Risk';
    if (selectedFilter === 'Suspicious') return item.riskLevel === 'Medium Risk';
    if (selectedFilter === 'Safe') return item.riskLevel === 'Safe' || item.riskLevel === 'Low Risk';
    if (selectedFilter === 'SMS') return item.category === 'SMS' || item.category === 'Google Messages' || item.category === 'Phone Messages';
    if (selectedFilter === 'Gmail') return item.category === 'Gmail' || item.category === 'Outlook';
    if (selectedFilter === 'UPI') return item.category === 'UPI';
    if (selectedFilter === 'Banking') return item.category === 'Banking';

    return true;
  }).sort((a, b) => {
    if (sortBy === 'score') {
      return b.threatScore - a.threatScore;
    }
    return b.timestamp - a.timestamp;
  });

  const handleConfirmClear = () => {
    Alert.alert(
      'Clear Scan History',
      'Are you sure you want to permanently delete all notification scan history?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Clear All',
          style: 'destructive',
          onPress: () => onClearHistory(),
        },
      ]
    );
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        {onGoBack && (
          <TouchableOpacity onPress={onGoBack} style={styles.backBtn}>
            <Text style={styles.backBtnText}>←</Text>
          </TouchableOpacity>
        )}
        <View style={{ flex: 1 }}>
          <Text style={styles.title}>Notification Scan History</Text>
          <Text style={styles.subtitle}>
            {history.length} notifications audited by CipherEye AI
          </Text>
        </View>
        {history.length > 0 && (
          <TouchableOpacity onPress={handleConfirmClear} style={styles.clearBtn}>
            <Text style={styles.clearBtnText}>Clear All</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Demo Interceptor Test Studio Card */}
      {onSimulateNotification && (
        <View style={styles.demoStudioCard}>
          <Text style={styles.demoStudioTitle}>🧪 Demo Notification Interceptor Studio</Text>
          <Text style={styles.demoStudioDesc}>
            Test live notification scanning & status bar alerts for invigilator demonstration:
          </Text>

          <View style={styles.presetButtonsRow}>
            <TouchableOpacity
              style={[styles.presetBtn, { backgroundColor: '#FEE2E2', borderColor: '#FCA5A5' }]}
              onPress={() =>
                handleTestSimulate(
                  'Messages',
                  'com.google.android.apps.messaging',
                  'CapitalOne Bank Security Alert',
                  'URGENT: Your account has been suspended due to unauthorized access. Click http://capitalone-update.xyz to restore access immediately.'
                )
              }
              disabled={simulating}
            >
              <Text style={[styles.presetBtnText, { color: '#DC2626' }]}>🔴 Phishing SMS</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.presetBtn, { backgroundColor: '#FEF3C7', borderColor: '#FDE68A' }]}
              onPress={() =>
                handleTestSimulate(
                  'SMS Service',
                  'com.samsung.android.messaging',
                  'Courier Delivery Notice',
                  'Package #CE-9402 delivery failed. Pay $1.99 redelivery fee at http://bit.ly/courier-pay before package return.'
                )
              }
              disabled={simulating}
            >
              <Text style={[styles.presetBtnText, { color: '#D97706' }]}>🟡 Delivery Fee Trap</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.presetBtn, { backgroundColor: '#DCFCE7', borderColor: '#86EFAC' }]}
              onPress={() =>
                handleTestSimulate(
                  'Amazon Shopping',
                  'com.amazon.mShop.android.shopping',
                  'Your order has shipped!',
                  'Track package #CE-1002 in the Amazon app. Expected delivery tomorrow.'
                )
              }
              disabled={simulating}
            >
              <Text style={[styles.presetBtnText, { color: '#16A34A' }]}>🟢 Safe Order Update</Text>
            </TouchableOpacity>
          </View>

          {/* Custom Text Test Input */}
          <View style={styles.customTestInputRow}>
            <TextInput
              style={styles.customTestInput}
              placeholder="Or enter custom notification message to test..."
              placeholderTextColor="#94A3B8"
              value={customTestText}
              onChangeText={setCustomTestText}
            />
            <TouchableOpacity
              style={styles.customTestSendBtn}
              onPress={() => {
                if (!customTestText.trim()) return;
                handleTestSimulate(
                  'Test Notifier',
                  'com.demo.notifier',
                  'Custom Notification Test',
                  customTestText
                );
                setCustomTestText('');
              }}
              disabled={simulating || !customTestText.trim()}
            >
              <Text style={styles.customTestSendText}>Run Test</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      {/* Search Input */}
      <View style={styles.searchBar}>
        <Text style={styles.searchIcon}>🔍</Text>
        <TextInput
          style={styles.searchInput}
          placeholder="Search notifications, apps, or text..."
          placeholderTextColor="#94A3B8"
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
        {searchQuery.length > 0 && (
          <TouchableOpacity onPress={() => setSearchQuery('')}>
            <Text style={{ color: '#94A3B8', fontWeight: '700' }}>✕</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Filters & Sorting */}
      <View style={styles.controlsRow}>
        <FlatList
          horizontal
          showsHorizontalScrollIndicator={false}
          data={filterOptions}
          keyExtractor={item => item}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={[
                styles.filterChip,
                selectedFilter === item && styles.filterChipActive,
              ]}
              onPress={() => setSelectedFilter(item)}
            >
              <Text
                style={[
                  styles.filterChipText,
                  selectedFilter === item && styles.filterChipTextActive,
                ]}
              >
                {item}
              </Text>
            </TouchableOpacity>
          )}
        />
      </View>

      <View style={styles.sortRow}>
        <Text style={styles.sortLabel}>Sort by:</Text>
        <TouchableOpacity
          style={[styles.sortChip, sortBy === 'newest' && styles.sortChipActive]}
          onPress={() => setSortBy('newest')}
        >
          <Text style={[styles.sortChipText, sortBy === 'newest' && styles.sortChipTextActive]}>Newest</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.sortChip, sortBy === 'score' && styles.sortChipActive]}
          onPress={() => setSortBy('score')}
        >
          <Text style={[styles.sortChipText, sortBy === 'score' && styles.sortChipTextActive]}>Highest Threat</Text>
        </TouchableOpacity>
      </View>

      {/* History List */}
      <FlatList
        data={filteredHistory}
        keyExtractor={item => item.id}
        renderItem={({ item }) => (
          <NotificationCard
            item={item}
            onPress={onSelectResult}
            onDelete={onDeleteItem}
          />
        )}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={{ fontSize: 44, marginBottom: 12 }}>🛡️</Text>
            <Text style={styles.emptyTitle}>No Notification Logs Found</Text>
            <Text style={styles.emptySubtitle}>
              {searchQuery || selectedFilter !== 'All'
                ? 'No notifications match your search query or selected filter.'
                : 'CipherEye AI will continuously scan incoming notifications as they arrive.'}
            </Text>
          </View>
        }
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 12,
  },
  backBtn: {
    marginRight: 12,
    padding: 6,
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
  clearBtn: {
    backgroundColor: '#FEE2E2',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  clearBtnText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#EF4444',
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    marginHorizontal: 20,
    borderRadius: 14,
    paddingHorizontal: 14,
    height: 46,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: 12,
  },
  searchIcon: {
    fontSize: 14,
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 13,
    color: '#0F172A',
  },
  controlsRow: {
    paddingHorizontal: 20,
    marginBottom: 10,
  },
  filterChip: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginRight: 8,
  },
  filterChipActive: {
    backgroundColor: '#2563EB',
    borderColor: '#2563EB',
  },
  filterChipText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#64748B',
  },
  filterChipTextActive: {
    color: '#FFFFFF',
  },
  sortRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 14,
    gap: 8,
  },
  sortLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: '#94A3B8',
  },
  sortChip: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    backgroundColor: '#F1F5F9',
  },
  sortChipActive: {
    backgroundColor: '#DBEAFE',
  },
  sortChipText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#64748B',
  },
  sortChipTextActive: {
    color: '#2563EB',
  },
  listContent: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
    paddingHorizontal: 20,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#0F172A',
    marginBottom: 6,
  },
  emptySubtitle: {
    fontSize: 12,
    color: '#64748B',
    textAlign: 'center',
    lineHeight: 18,
  },
  demoStudioCard: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: 20,
    marginBottom: 14,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
  },
  demoStudioTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: '#0F172A',
    marginBottom: 4,
  },
  demoStudioDesc: {
    fontSize: 11,
    color: '#64748B',
    marginBottom: 12,
    lineHeight: 16,
  },
  presetButtonsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 12,
  },
  presetBtn: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 10,
    borderWidth: 1,
  },
  presetBtnText: {
    fontSize: 11,
    fontWeight: '800',
  },
  customTestInputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  customTestInput: {
    flex: 1,
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 10,
    paddingHorizontal: 12,
    height: 38,
    fontSize: 11,
    color: '#0F172A',
  },
  customTestSendBtn: {
    backgroundColor: '#2563EB',
    paddingHorizontal: 12,
    height: 38,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  customTestSendText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '800',
  },
});
