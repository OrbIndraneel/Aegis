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
}

const delay = (ms = 300) => new Promise((resolve) => setTimeout(resolve, ms));

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
      assignedUnit: 'NDRF Battalion 06 (Rescue Boat 4)',
      status: 'DISPATCHED',
    };

    this.activeSosRecord = record;
    return record;
  }

  /**
   * Cancel Active SOS
   */
  static async cancelSos(): Promise<boolean> {
    await delay(300);
    if (this.activeSosRecord) {
      this.activeSosRecord.status = 'CANCELLED';
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
