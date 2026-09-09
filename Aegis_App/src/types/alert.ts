import { HazardSeverity, HazardType, EmergencyAlert } from './index';

export type AlertMessage = EmergencyAlert;

export interface AlertDispatchPayload {
  targetRegion: string;
  disasterType: HazardType;
  severity: HazardSeverity;
  title: string;
  body: string;
  actionRequired: EmergencyAlert['actionRequired'];
  sendPushNotification: boolean;
  triggerEmergencySiren: boolean;
}
