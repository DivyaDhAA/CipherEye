import { useState, useEffect, useCallback } from 'react';
import {
  NotificationScanResult,
  NotificationSettingsConfig,
} from '../types';
import { NotificationScannerService, DEFAULT_SETTINGS } from '../services/NotificationScanner';
import { NotificationPermissionService } from '../services/NotificationPermission';

export const useNotificationProtection = (apiBaseUrl?: string) => {
  const [history, setHistory] = useState<NotificationScanResult[]>([]);
  const [settings, setSettings] = useState<NotificationSettingsConfig>(DEFAULT_SETTINGS);
  const [permissionGranted, setPermissionGranted] = useState<boolean>(false);
  const [latestAlert, setLatestAlert] = useState<NotificationScanResult | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  // Check Android permission access
  const refreshPermissionStatus = useCallback(async () => {
    const isGranted = await NotificationPermissionService.isGranted();
    setPermissionGranted(isGranted);
    return isGranted;
  }, []);

  // Load history & settings on mount
  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      await refreshPermissionStatus();
      const loadedSettings = await NotificationScannerService.getSettings();
      setSettings(loadedSettings);
      const loadedHistory = await NotificationScannerService.getHistory();
      setHistory(loadedHistory);
    } catch (err) {
      console.warn('Error loading notification protection data:', err);
    } finally {
      setLoading(false);
    }
  }, [refreshPermissionStatus]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Start real-time background listener
  useEffect(() => {
    if (permissionGranted && settings.protectionEnabled) {
      NotificationScannerService.startListener(apiBaseUrl, newResult => {
        setLatestAlert(newResult);
        setHistory(prev => [newResult, ...prev.filter(item => item.id !== newResult.id)]);
      });
    } else {
      NotificationScannerService.stopListener();
    }

    return () => {
      NotificationScannerService.stopListener();
    };
  }, [permissionGranted, settings.protectionEnabled, apiBaseUrl]);

  const requestPermission = async () => {
    await NotificationPermissionService.requestPermission();
    // Re-check permission after user returns from settings
    setTimeout(() => {
      refreshPermissionStatus();
    }, 1500);
  };

  const updateSettings = async (newSettings: NotificationSettingsConfig) => {
    setSettings(newSettings);
    await NotificationScannerService.saveSettings(newSettings);
  };

  const deleteItem = async (id: string) => {
    const updated = await NotificationScannerService.deleteHistoryItem(id);
    setHistory(updated);
  };

  const clearHistory = async () => {
    await NotificationScannerService.clearHistory();
    setHistory([]);
  };

  const simulateNotification = async (
    appName: string,
    packageName: string,
    title: string,
    body: string
  ) => {
    const result = await NotificationScannerService.processNotificationPayload(
      {
        packageName,
        title,
        body,
        timestamp: Date.now(),
      },
      apiBaseUrl
    );
    if (result) {
      setLatestAlert(result);
      setHistory(prev => [result, ...prev.filter(item => item.id !== result.id)]);
    }
    return result;
  };

  return {
    history,
    settings,
    permissionGranted,
    latestAlert,
    loading,
    requestPermission,
    refreshPermissionStatus,
    updateSettings,
    deleteItem,
    clearHistory,
    simulateNotification,
  };
};
