export type ScamRiskLevel = 'Safe' | 'Low Risk' | 'Medium Risk' | 'High Risk' | 'Critical Scam';

export type AppCategory = 
  | 'SMS'
  | 'Gmail'
  | 'Outlook'
  | 'Telegram'
  | 'Instagram'
  | 'Facebook'
  | 'Messenger'
  | 'Banking'
  | 'UPI'
  | 'Google Messages'
  | 'Phone Messages'
  | 'Shopping'
  | 'Courier'
  | 'Excluded'
  | 'Unknown';

export interface NotificationScanResult {
  id: string;
  packageName: string;
  appName: string;
  category: AppCategory;
  title: string;
  body: string;
  timestamp: number;
  threatScore: number;
  confidence: number;
  riskLevel: ScamRiskLevel;
  explanation: string;
  reasons: string[];
  recommendedAction: string;
  isRead?: boolean;
  isDeleted?: boolean;
}

export type SensitivityLevel = 'Low' | 'Medium' | 'High';

export interface NotificationSettingsConfig {
  protectionEnabled: boolean;
  sensitivity: SensitivityLevel;
  backgroundMonitoring: boolean;
  notificationAlerts: boolean;
  soundEnabled: boolean;
  vibrationEnabled: boolean;
  ignoredApps: string[]; // Package names or app identifiers
}

export interface NativeNotificationPayload {
  packageName: string;
  title: string;
  body: string;
  timestamp: number;
  category?: string;
  id?: number;
}
