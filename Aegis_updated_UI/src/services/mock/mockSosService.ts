import { Coordinate } from '../../types';

export type SosReason =
  | 'Submerged House'
  | 'Medical Emergency'
  | 'Trapped in Vehicle'
  | 'Landslide Blockade'
  | 'General Rescue';

export interface SosDispatchRecord {
  sosId: string;
  timestamp: string;
  reason: SosReason;
  coordinate: Coordinate;
  userPhone: string;
  userName: string;
  bloodGroup?: string;
  medicalConditions?: string;
  assignedUnit: string;
  status: 'DISPATCHED' | 'EN_ROUTE' | 'RESCUED' | 'CANCELLED';
  isBeaconActivatedByAuthority?: boolean;
}

const delay = (_ms = 0) => Promise.resolve();

export class MockSosService {
  private static activeSosRecord: SosDispatchRecord | null = null;

  /**
   * Transmit SOS Distress Signal
   */
  static async triggerSos(
    reason: SosReason,
    coordinate: Coordinate,
    userName: string,
    userPhone: string,
    bloodGroup?: string,
    medicalConditions?: string
  ): Promise<SosDispatchRecord> {
    await delay(400);

    const record: SosDispatchRecord = {
      sosId: `SOS-IN-${Math.floor(100000 + Math.random() * 900000)}`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
      reason,
      coordinate,
      userPhone,
      userName,
      bloodGroup,
      medicalConditions,
      assignedUnit: 'SDRF 2nd Mountain Battalion (Singtam Staging)',
      status: 'DISPATCHED',
      isBeaconActivatedByAuthority: false,
    };

    this.activeSosRecord = record;
    return record;
  }

  /**
   * Authority Control Room triggers Rescue Beacon for civilian device
   */
  static async activateBeaconByAuthority(sosId?: string): Promise<SosDispatchRecord | null> {
    await delay(300);
    if (!this.activeSosRecord) {
      // Create an active SOS record if authority triggers beacon
      this.activeSosRecord = {
        sosId: sosId || `SOS-IN-${Math.floor(100000 + Math.random() * 900000)}`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        reason: 'Landslide Blockade',
        coordinate: { latitude: 27.2340, longitude: 88.5120 },
        userPhone: '+91 98000 00000',
        userName: 'Civilian Evacuee',
        bloodGroup: 'O+',
        medicalConditions: 'None Specified',
        assignedUnit: 'SDRF 2nd Mountain Battalion (Singtam Staging)',
        status: 'EN_ROUTE',
        isBeaconActivatedByAuthority: true,
      };
    } else {
      this.activeSosRecord.isBeaconActivatedByAuthority = true;
      this.activeSosRecord.status = 'EN_ROUTE';
    }
    return this.activeSosRecord;
  }

  /**
   * Authority Control Room deactivates Rescue Beacon
   */
  static async deactivateBeaconByAuthority(): Promise<boolean> {
    await delay(200);
    if (this.activeSosRecord) {
      this.activeSosRecord.isBeaconActivatedByAuthority = false;
      return true;
    }
    return false;
  }

  /**
   * Cancel Active SOS
   */
  static async cancelSos(): Promise<boolean> {
    await delay(300);
    if (this.activeSosRecord) {
      this.activeSosRecord.status = 'CANCELLED';
      this.activeSosRecord.isBeaconActivatedByAuthority = false;
      this.activeSosRecord = null;
      return true;
    }
    return false;
  }

  /**
   * Get Active SOS Record
   */
  static getActiveRecord(): SosDispatchRecord | null {
    return this.activeSosRecord;
  }
}
