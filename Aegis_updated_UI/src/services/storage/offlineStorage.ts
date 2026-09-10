import AsyncStorage from '@react-native-async-storage/async-storage';
import { Hazard, Shelter, EvacuationRoute, EmergencyAlert, CivilianFieldReport } from '../../types';

const STORAGE_KEYS = {
  HAZARDS: '@aegis_hazards',
  SHELTERS: '@aegis_shelters',
  ALERTS: '@aegis_alerts',
  ROUTE: '@aegis_route',
  NETWORK_STATUS: '@aegis_network',
  LAST_SYNC: '@aegis_last_sync',
  FIELD_REPORTS_QUEUE: '@aegis_field_reports_queue',
};

export class OfflineStorage {
  static async saveHazards(hazards: Hazard[]): Promise<void> {
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.HAZARDS, JSON.stringify(hazards));
    } catch (e) {}
  }

  static async getHazards(): Promise<Hazard[]> {
    try {
      const data = await AsyncStorage.getItem(STORAGE_KEYS.HAZARDS);
      return data ? JSON.parse(data) : [];
    } catch (e) {
      return [];
    }
  }

  static async getCachedHazards(): Promise<Hazard[]> {
    return this.getHazards();
  }

  static async saveShelters(shelters: Shelter[]): Promise<void> {
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.SHELTERS, JSON.stringify(shelters));
    } catch (e) {}
  }

  static async getShelters(): Promise<Shelter[]> {
    try {
      const data = await AsyncStorage.getItem(STORAGE_KEYS.SHELTERS);
      return data ? JSON.parse(data) : [];
    } catch (e) {
      return [];
    }
  }

  static async getCachedShelters(): Promise<Shelter[]> {
    return this.getShelters();
  }

  static async saveAlerts(alerts: EmergencyAlert[]): Promise<void> {
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.ALERTS, JSON.stringify(alerts));
    } catch (e) {}
  }

  static async getAlerts(): Promise<EmergencyAlert[]> {
    try {
      const data = await AsyncStorage.getItem(STORAGE_KEYS.ALERTS);
      return data ? JSON.parse(data) : [];
    } catch (e) {
      return [];
    }
  }

  static async saveRoute(route: EvacuationRoute): Promise<void> {
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.ROUTE, JSON.stringify(route));
    } catch (e) {}
  }

  static async getCachedRoute(): Promise<EvacuationRoute | null> {
    try {
      const data = await AsyncStorage.getItem(STORAGE_KEYS.ROUTE);
      return data ? JSON.parse(data) : null;
    } catch (e) {
      return null;
    }
  }

  static async saveDisasterCache(
    hazards: Hazard[],
    shelters: Shelter[],
    route?: EvacuationRoute | null
  ): Promise<void> {
    await this.saveHazards(hazards);
    await this.saveShelters(shelters);
    if (route) await this.saveRoute(route);
  }

  static async saveNetworkStatus(isOnline: boolean): Promise<void> {
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.NETWORK_STATUS, JSON.stringify(isOnline));
    } catch (e) {}
  }

  static async getLastSyncTime(): Promise<number> {
    try {
      const data = await AsyncStorage.getItem(STORAGE_KEYS.LAST_SYNC);
      return data ? parseInt(data, 10) : Date.now();
    } catch (e) {
      return Date.now();
    }
  }

  static async saveLastSyncTime(timestamp: number): Promise<void> {
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.LAST_SYNC, timestamp.toString());
    } catch (e) {}
  }

  // ============================================================
  // OFFLINE FIELD REPORT QUEUEING
  // ============================================================

  static async queueFieldReport(report: CivilianFieldReport): Promise<void> {
    try {
      const current = await this.getQueuedFieldReports();
      current.push(report);
      await AsyncStorage.setItem(STORAGE_KEYS.FIELD_REPORTS_QUEUE, JSON.stringify(current));
    } catch (e) {
      console.warn('Failed to queue field report locally:', e);
    }
  }

  static async getQueuedFieldReports(): Promise<CivilianFieldReport[]> {
    try {
      const data = await AsyncStorage.getItem(STORAGE_KEYS.FIELD_REPORTS_QUEUE);
      return data ? JSON.parse(data) : [];
    } catch (e) {
      return [];
    }
  }

  static async clearQueuedFieldReports(): Promise<void> {
    try {
      await AsyncStorage.removeItem(STORAGE_KEYS.FIELD_REPORTS_QUEUE);
    } catch (e) {}
  }
}
