import { create } from 'zustand';
import { OfflineStorage } from '../services/storage/offlineStorage';
import { Hazard, Shelter, EmergencyAlert } from '../types';
import { VADODARA_HAZARDS, VADODARA_SHELTERS, MOCK_ALERTS } from '../services/mock/mockData';

interface OfflineState {
  isOnline: boolean;
  isSyncing: boolean;
  lastSyncTimestamp: number | null;
  cachedHazards: Hazard[];
  cachedShelters: Shelter[];
  cachedAlerts: EmergencyAlert[];

  silentBackgroundSync: () => Promise<void>;
  checkSyncStatus: () => Promise<void>;
  loadCachedData: () => Promise<void>;
}

export const useOfflineStore = create<OfflineState>((set, get) => ({
  isOnline: true,
  isSyncing: false,
  lastSyncTimestamp: Date.now(),
  cachedHazards: VADODARA_HAZARDS,
  cachedShelters: VADODARA_SHELTERS,
  cachedAlerts: MOCK_ALERTS,

  silentBackgroundSync: async () => {
    try {
      set({ isSyncing: true });
      const updatedTime = Date.now();

      await OfflineStorage.saveHazards(VADODARA_HAZARDS);
      await OfflineStorage.saveShelters(VADODARA_SHELTERS);
      await OfflineStorage.saveAlerts(MOCK_ALERTS);
      await OfflineStorage.saveLastSyncTime(updatedTime);

      set({
        isOnline: true,
        isSyncing: false,
        lastSyncTimestamp: updatedTime,
        cachedHazards: VADODARA_HAZARDS,
        cachedShelters: VADODARA_SHELTERS,
        cachedAlerts: MOCK_ALERTS,
      });
    } catch (err) {
      console.warn('Silent background sync fallback to local cache:', err);
      set({ isOnline: false, isSyncing: false });
      await get().loadCachedData();
    }
  },

  checkSyncStatus: async () => {
    await get().loadCachedData();
    await get().silentBackgroundSync();
  },

  loadCachedData: async () => {
    const hazards = await OfflineStorage.getHazards();
    const shelters = await OfflineStorage.getShelters();
    const alerts = await OfflineStorage.getAlerts();
    const lastSync = await OfflineStorage.getLastSyncTime();

    set({
      cachedHazards: hazards.length > 0 ? hazards : VADODARA_HAZARDS,
      cachedShelters: shelters.length > 0 ? shelters : VADODARA_SHELTERS,
      cachedAlerts: alerts.length > 0 ? alerts : MOCK_ALERTS,
      lastSyncTimestamp: lastSync,
    });
  },
}));
