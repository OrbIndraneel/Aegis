import { Platform, Vibration } from 'react-native';
import Constants, { ExecutionEnvironment } from 'expo-constants';
import { EmergencyAlert, HazardSeverity } from '../../types';

let Notifications: any = null;

// Expo Go SDK 53+ on Android throws an unhandled error immediately when expo-notifications is loaded.
// By detecting Expo Go via Constants, we prevent requiring the module in Expo Go while keeping it active in standalone / development builds.
const isExpoGo =
  Constants.appOwnership === 'expo' ||
  Constants.executionEnvironment === ExecutionEnvironment.StoreClient;

if (!isExpoGo) {
  try {
    Notifications = require('expo-notifications');
    if (Notifications && typeof Notifications.setNotificationHandler === 'function') {
      Notifications.setNotificationHandler({
        handleNotification: async () => ({
          shouldShowAlert: true,
          shouldPlaySound: true,
          shouldSetBadge: true,
          shouldShowBanner: true,
          shouldShowList: true,
        }),
      });
    }
  } catch (error) {
    console.info('[NotificationService] Push notifications fallback enabled.');
  }
} else {
  console.info('[NotificationService] Native push notifications disabled in Expo Go (SDK 53+). Active in development build.');
}

export class NotificationService {
  /**
   * Request Notification Permissions
   */
  static async requestPermissions(): Promise<boolean> {
    try {
      if (!Notifications?.requestPermissionsAsync) {
        return true; // Graceful mock in Expo Go
      }
      const { status } = await Notifications.requestPermissionsAsync();
      return status === 'granted';
    } catch (error) {
      console.warn('Notification permission error:', error);
      return false;
    }
  }

  /**
   * Trigger emergency alert notification with vibration pattern for critical levels
   */
  static async scheduleEmergencyAlert(alert: EmergencyAlert) {
    try {
      const isCritical = alert.severity === 'CRITICAL' || alert.severity === 'HIGH';

      if (isCritical) {
        Vibration.vibrate([0, 500, 200, 500, 200, 800]);
      }

      if (Notifications?.scheduleNotificationAsync) {
        await Notifications.scheduleNotificationAsync({
          content: {
            title: `🚨 [${alert.severity}] ${alert.title}`,
            body: alert.body,
            data: {
              alertId: alert.id,
              severity: alert.severity,
              actionRequired: alert.actionRequired,
            },
            sound: true,
            priority: isCritical
              ? (Notifications.AndroidNotificationPriority?.MAX || 5)
              : (Notifications.AndroidNotificationPriority?.DEFAULT || 3),
          },
          trigger: null,
        });
      }
    } catch (error) {
      console.warn('Error scheduling alert notification:', error);
    }
  }

  /**
   * Alias for scheduleEmergencyAlert
   */
  static async scheduleEmergencyAlertNotification(alert: EmergencyAlert) {
    return this.scheduleEmergencyAlert(alert);
  }

  /**
   * Local Demo Emergency Notification Trigger helper for testing
   */
  static async triggerDemoAlert(severity: HazardSeverity = 'CRITICAL') {
    const demoAlert: EmergencyAlert = {
      id: `demo-${Date.now()}`,
      title: 'FLASH FLOOD EMERGENCY DISPATCH',
      body: 'GSDMA orders immediate evacuation for Vishwamitri catchment sector to Sama Stadium Relief Camp.',
      severity,
      disasterType: 'FLOOD',
      targetRegion: 'Vadodara - Sectors 1 to 5',
      issuedBy: 'State Disaster Operations Command Center',
      issuedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      actionRequired: 'EVACUATE_IMMEDIATELY',
      affectedPopulationEstimate: 34500,
    };
    await this.scheduleEmergencyAlert(demoAlert);
    return demoAlert;
  }
}
