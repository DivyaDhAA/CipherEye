import { NativeModules, Platform, PermissionsAndroid } from 'react-native';

const { NotificationListenerModule } = NativeModules;

export class NotificationPermissionService {
  /**
   * Check if Android Notification Listener Access is granted
   */
  static async isGranted(): Promise<boolean> {
    if (Platform.OS !== 'android') {
      return false;
    }
    try {
      if (NotificationListenerModule && NotificationListenerModule.isPermissionGranted) {
        return await NotificationListenerModule.isPermissionGranted();
      }
      return false;
    } catch (err) {
      console.warn('Error checking Notification Access permission:', err);
      return false;
    }
  }

  /**
   * Open Android Notification Listener Access settings screen
   */
  static async requestPermission(): Promise<boolean> {
    if (Platform.OS !== 'android') {
      return false;
    }
    try {
      if (NotificationListenerModule && NotificationListenerModule.requestPermission) {
        return await NotificationListenerModule.requestPermission();
      }
      return false;
    } catch (err) {
      console.warn('Error requesting Notification Access permission:', err);
      return false;
    }
  }

  /**
   * Request Android RECEIVE_SMS and READ_SMS Permissions
   */
  static async requestSmsPermissions(): Promise<boolean> {
    if (Platform.OS !== 'android') {
      return false;
    }
    try {
      const permissions = [
        PermissionsAndroid.PERMISSIONS.RECEIVE_SMS,
        PermissionsAndroid.PERMISSIONS.READ_SMS,
      ];

      if (Platform.Version >= 33) {
        // @ts-ignore
        permissions.push(PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS);
      }

      const granted = await PermissionsAndroid.requestMultiple(permissions);
      return (
        granted[PermissionsAndroid.PERMISSIONS.RECEIVE_SMS] === PermissionsAndroid.RESULTS.GRANTED &&
        granted[PermissionsAndroid.PERMISSIONS.READ_SMS] === PermissionsAndroid.RESULTS.GRANTED
      );
    } catch (err) {
      console.warn('Error requesting SMS permissions:', err);
      return false;
    }
  }

  /**
   * Retrieve native SMS scan history list
   */
  static async getSmsScanHistory(): Promise<any[]> {
    if (Platform.OS !== 'android' || !NotificationListenerModule?.getSmsScanHistory) {
      return [];
    }
    try {
      return await NotificationListenerModule.getSmsScanHistory();
    } catch (err) {
      console.warn('Error fetching SMS history:', err);
      return [];
    }
  }

  /**
   * Post native Android Notification Center scam alert (Green/Yellow/Red)
   */
  static async postScamAlert(
    reportId: string,
    title: string,
    body: string,
    riskLevel: string,
    threatScore: number,
    confidence: number,
    reasons: string[]
  ): Promise<boolean> {
    if (Platform.OS !== 'android') {
      return false;
    }
    try {
      if (NotificationListenerModule && NotificationListenerModule.postScamAlert) {
        return await NotificationListenerModule.postScamAlert(
          reportId,
          title,
          body,
          riskLevel,
          threatScore,
          confidence,
          JSON.stringify(reasons)
        );
      }
      return false;
    } catch (err) {
      console.warn('Error posting native Android alert:', err);
      return false;
    }
  }
}
