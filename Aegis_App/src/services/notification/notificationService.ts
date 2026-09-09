import * as Notifications from 'expo-notifications';
import { Platform, Vibration } from 'react-native';
import { EmergencyAlert, HazardSeverity } from '../../types';

// Configure notification presentation for foreground alerts
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

export class NotificationService {
  /**
   * Request Notification Permissions
   */
  static async requestPermissions(): Promise<boolean> {
    try {
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
            ? Notifications.AndroidNotificationPriority.MAX
            : Notifications.AndroidNotificationPriority.DEFAULT,
        },
        trigger: null,
      });
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
