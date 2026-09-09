import AsyncStorage from '@react-native-async-storage/async-storage';
import { Hazard, Shelter, EvacuationRoute, EmergencyAlert } from '../../types';

const STORAGE_KEYS = {
  HAZARDS: '@suraksha_hazards',
  SHELTERS: '@suraksha_shelters',
  ALERTS: '@suraksha_alerts',
  ROUTE: '@suraksha_route',
  NETWORK_STATUS: '@suraksha_network',
  LAST_SYNC: '@suraksha_last_sync',
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

  static async saveDisasterCache(hazards: Hazard[], shelters: Shelter[], route?: EvacuationRoute | null): Promise<void> {
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
}
