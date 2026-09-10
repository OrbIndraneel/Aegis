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
   * Local Emergency Notification Trigger helper
   */
  static async triggerEmergencyBroadcast(severity: HazardSeverity = 'CRITICAL') {
    const alert: EmergencyAlert = {
      id: `alert-${Date.now()}`,
      title: 'LANDSLIDE RED WARNING — NH-10 MILE 20',
      body: 'Sikkim SDMA orders immediate civilian evacuation along NH-10 20th Mile corridor to Singtam Relief Camp.',
      severity,
      disasterType: 'LANDSLIDE',
      targetRegion: 'East Sikkim - NH-10 Corridor & Singtam',
      issuedBy: 'MDoNER Disaster Early Warning System (AEGIS)',
      issuedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      actionRequired: 'EVACUATE_IMMEDIATELY',
      affectedPopulationEstimate: 24800,
    };
    await this.scheduleEmergencyAlert(alert);
    return alert;
  }
}
