import { create } from 'zustand';
import { OfflineStorage } from '../services/storage/offlineStorage';
import { Hazard, Shelter, EmergencyAlert, CivilianFieldReport } from '../types';
import { VADODARA_HAZARDS, VADODARA_SHELTERS, MOCK_ALERTS } from '../services/mock/mockData';
import { ApiClient } from '../services/api/client';

interface OfflineState {
  isOnline: boolean;
  isSyncing: boolean;
  lastSyncTimestamp: number | null;
  cachedHazards: Hazard[];
  cachedShelters: Shelter[];
  cachedAlerts: EmergencyAlert[];
  queuedReports: CivilianFieldReport[];

  silentBackgroundSync: () => Promise<void>;
  checkSyncStatus: () => Promise<void>;
  loadCachedData: () => Promise<void>;
  queueFieldReportOffline: (report: CivilianFieldReport) => Promise<void>;
  syncQueuedReports: () => Promise<void>;
}

export const useOfflineStore = create<OfflineState>((set, get) => ({
  isOnline: true,
  isSyncing: false,
  lastSyncTimestamp: Date.now(),
  cachedHazards: VADODARA_HAZARDS,
  cachedShelters: VADODARA_SHELTERS,
  cachedAlerts: MOCK_ALERTS,
  queuedReports: [],

  silentBackgroundSync: async () => {
    try {
      set({ isSyncing: true });
      const updatedTime = Date.now();

      await OfflineStorage.saveHazards(VADODARA_HAZARDS);
      await OfflineStorage.saveShelters(VADODARA_SHELTERS);
      await OfflineStorage.saveAlerts(MOCK_ALERTS);
      await OfflineStorage.saveLastSyncTime(updatedTime);

      // Attempt syncing queued field reports upon reconnection
      await get().syncQueuedReports();

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
    const queuedReports = await OfflineStorage.getQueuedFieldReports();

    set({
      cachedHazards: hazards.length > 0 ? hazards : VADODARA_HAZARDS,
      cachedShelters: shelters.length > 0 ? shelters : VADODARA_SHELTERS,
      cachedAlerts: alerts.length > 0 ? alerts : MOCK_ALERTS,
      queuedReports,
      lastSyncTimestamp: lastSync,
    });
  },

  queueFieldReportOffline: async (report: CivilianFieldReport) => {
    await OfflineStorage.queueFieldReport(report);
    set((state) => ({
      queuedReports: [...state.queuedReports, report],
    }));
  },

  syncQueuedReports: async () => {
    const queued = await OfflineStorage.getQueuedFieldReports();
    if (queued.length === 0) return;

    try {
      for (const report of queued) {
        await ApiClient.submitFieldReport({
          reportType: report.reportType,
          title: report.title,
          description: report.description,
          coordinate: report.coordinate,
          locationName: report.locationName,
          severity: report.severity,
          photoUri: report.photoUri,
          reportedBy: report.reportedBy,
        });
      }
      await OfflineStorage.clearQueuedFieldReports();
      set({ queuedReports: [] });
    } catch (e) {
      console.warn('Failed syncing offline field reports queue:', e);
    }
  },
}));
