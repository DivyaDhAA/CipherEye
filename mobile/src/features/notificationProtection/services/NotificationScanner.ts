import { NativeEventEmitter, NativeModules, Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  NotificationScanResult,
  NotificationSettingsConfig,
  NativeNotificationPayload,
} from '../types';
import { classifyApp } from '../utils/appClassifier';
import { ThreatAnalyzer } from './ThreatAnalyzer';
import { NotificationPermissionService } from './NotificationPermission';

const STORAGE_KEY_HISTORY = 'ciphereye_notification_history';
const STORAGE_KEY_SETTINGS = 'ciphereye_notification_settings';

export const DEFAULT_SETTINGS: NotificationSettingsConfig = {
  protectionEnabled: true,
  sensitivity: 'Medium',
  backgroundMonitoring: true,
  notificationAlerts: true,
  soundEnabled: true,
  vibrationEnabled: true,
  ignoredApps: [],
};

export class NotificationScannerService {
  private static processedHashes = new Set<string>();
  private static eventSubscription: any = null;

  /**
   * Load stored settings
   */
  static async getSettings(): Promise<NotificationSettingsConfig> {
    try {
      const data = await AsyncStorage.getItem(STORAGE_KEY_SETTINGS);
      if (data) {
        return { ...DEFAULT_SETTINGS, ...JSON.parse(data) };
      }
    } catch (err) {
      console.warn('Failed to load notification settings:', err);
    }
    return DEFAULT_SETTINGS;
  }

  /**
   * Save updated settings
   */
  static async saveSettings(settings: NotificationSettingsConfig): Promise<void> {
    try {
      await AsyncStorage.setItem(STORAGE_KEY_SETTINGS, JSON.stringify(settings));
    } catch (err) {
      console.warn('Failed to save notification settings:', err);
    }
  }

  /**
   * Load scan history from AsyncStorage
   */
  static async getHistory(): Promise<NotificationScanResult[]> {
    try {
      const data = await AsyncStorage.getItem(STORAGE_KEY_HISTORY);
      if (data) {
        return JSON.parse(data);
      }
    } catch (err) {
      console.warn('Failed to load notification history:', err);
    }
    return [];
  }

  /**
   * Save new scan result to history
   */
  static async addScanResult(result: NotificationScanResult): Promise<NotificationScanResult[]> {
    try {
      const history = await this.getHistory();
      // Keep up to 200 items in history
      const updated = [result, ...history.filter(item => item.id !== result.id)].slice(0, 200);
      await AsyncStorage.setItem(STORAGE_KEY_HISTORY, JSON.stringify(updated));
      return updated;
    } catch (err) {
      console.warn('Failed to save scan result:', err);
      return [];
    }
  }

  /**
   * Delete single item from history
   */
  static async deleteHistoryItem(id: string): Promise<NotificationScanResult[]> {
    try {
      const history = await this.getHistory();
      const updated = history.filter(item => item.id !== id);
      await AsyncStorage.setItem(STORAGE_KEY_HISTORY, JSON.stringify(updated));
      return updated;
    } catch (err) {
      console.warn('Failed to delete history item:', err);
      return [];
    }
  }

  /**
   * Clear all notification history
   */
  static async clearHistory(): Promise<void> {
    try {
      await AsyncStorage.removeItem(STORAGE_KEY_HISTORY);
    } catch (err) {
      console.warn('Failed to clear notification history:', err);
    }
  }

  /**
   * Process an incoming notification payload
   */
  static async processNotificationPayload(
    payload: NativeNotificationPayload,
    apiBaseUrl?: string,
    onResultCallback?: (result: NotificationScanResult) => void
  ): Promise<NotificationScanResult | null> {
    const { packageName, title, body, timestamp } = payload;

    // 1. WhatsApp Exclusion Check
    const appInfo = classifyApp(packageName);
    if (appInfo.isExcluded) {
      return null;
    }

    // 2. Check Settings (Protection Enabled & Ignored Apps)
    const settings = await this.getSettings();
    if (!settings.protectionEnabled) {
      return null;
    }

    if (settings.ignoredApps.includes(packageName)) {
      return null;
    }

    // 3. Prevent duplicate processing
    const contentHash = `${packageName}_${title}_${body}_${Math.floor((timestamp || Date.now()) / 10000)}`;
    if (this.processedHashes.has(contentHash)) {
      return null;
    }
    this.processedHashes.add(contentHash);
    if (this.processedHashes.size > 100) {
      const firstKey = this.processedHashes.values().next().value;
      if (firstKey) this.processedHashes.delete(firstKey);
    }

    // 4. Perform Threat Analysis
    const effectiveApiUrl = apiBaseUrl || (Platform.OS === 'android' ? 'http://10.0.2.2:5001/api/v1' : 'http://localhost:5001/api/v1');
    const analysis = await ThreatAnalyzer.analyzeWithBackend(
      title,
      body,
      packageName,
      effectiveApiUrl,
      settings.sensitivity
    );

    const scanResult: NotificationScanResult = {
      id: 'notif-' + Date.now() + '-' + Math.floor(Math.random() * 1000),
      packageName,
      appName: appInfo.name,
      category: appInfo.category,
      title,
      body,
      timestamp: timestamp || Date.now(),
      threatScore: analysis.threatScore,
      confidence: analysis.confidence,
      riskLevel: analysis.riskLevel,
      explanation: analysis.explanation,
      reasons: analysis.reasons,
      recommendedAction: analysis.recommendedAction,
      isRead: false,
    };

    // 5. Save result to history
    await this.addScanResult(scanResult);

    // 6. Trigger native Android Notification Center Alert if notificationAlerts setting is enabled
    if (settings.notificationAlerts) {
      await NotificationPermissionService.postScamAlert(
        scanResult.id,
        `${scanResult.appName}: ${scanResult.title}`,
        scanResult.body,
        scanResult.riskLevel,
        scanResult.threatScore,
        scanResult.confidence,
        scanResult.reasons
      );
    }

    if (onResultCallback) {
      onResultCallback(scanResult);
    }

    return scanResult;
  }

  /**
   * Start Native Event Listener
   */
  static startListener(
    apiBaseUrl?: string,
    onResultCallback?: (result: NotificationScanResult) => void
  ) {
    if (Platform.OS !== 'android') return;

    this.stopListener();

    try {
      if (!NativeModules.NotificationListenerModule) {
        console.warn('NotificationListenerModule is not available on this build/device');
        return;
      }
      const eventEmitter = new NativeEventEmitter(NativeModules.NotificationListenerModule);
      this.eventSubscription = eventEmitter.addListener('onNotificationReceived', async (event: NativeNotificationPayload) => {
        if (event && event.packageName) {
          await this.processNotificationPayload(event, apiBaseUrl, onResultCallback);
        }
      });

      // SMS Receiver Event Subscription
      eventEmitter.addListener('onSmsReceived', async (event: any) => {
        if (event && event.body) {
          const smsResult: NotificationScanResult = {
            id: event.id || ('sms-' + Date.now()),
            packageName: 'com.google.android.apps.messaging',
            appName: 'SMS Scanner',
            category: 'SMS',
            title: event.sender || 'SMS Sender',
            body: event.body,
            timestamp: event.timestamp || Date.now(),
            threatScore: event.prediction === 'Scam' ? 85 : (event.prediction === 'Suspicious' ? 45 : 10),
            confidence: event.confidence || 96.0,
            riskLevel: event.prediction === 'Scam' ? 'High' : (event.prediction === 'Suspicious' ? 'Medium' : 'Safe'),
            explanation: `Automatic SMS Scanner: ${event.prediction} classification.`,
            reasons: [
              `Prediction: ${event.prediction}`,
              `Confidence: ${(event.confidence || 96).toFixed(1)}%`
            ],
            recommendedAction: event.prediction === 'Scam' ? 'Do NOT click links or share details.' : 'Verified.',
            isRead: false
          };
          await this.addScanResult(smsResult);
          if (onResultCallback) onResultCallback(smsResult);
        }
      });
    } catch (err) {
      console.warn('Failed to attach NativeEventEmitter listener:', err);
    }
  }

  /**
   * Stop Native Event Listener
   */
  static stopListener() {
    if (this.eventSubscription) {
      try {
        this.eventSubscription.remove();
      } catch (err) {}
      this.eventSubscription = null;
    }
  }
}
