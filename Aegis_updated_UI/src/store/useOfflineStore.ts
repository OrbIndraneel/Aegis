import { create } from 'zustand';
import { OfflineStorage } from '../services/storage/offlineStorage';
import { Hazard, Shelter, EmergencyAlert, CivilianFieldReport } from '../types';
import { EAST_SIKKIM_HAZARDS, EAST_SIKKIM_SHELTERS, MOCK_ALERTS } from '../services/mock/mockData';
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
  cachedHazards: EAST_SIKKIM_HAZARDS,
  cachedShelters: EAST_SIKKIM_SHELTERS,
  cachedAlerts: MOCK_ALERTS,
  queuedReports: [],

  silentBackgroundSync: async () => {
    try {
      set({ isSyncing: true });
      const updatedTime = Date.now();

      await OfflineStorage.saveHazards(EAST_SIKKIM_HAZARDS);
      await OfflineStorage.saveShelters(EAST_SIKKIM_SHELTERS);
      await OfflineStorage.saveAlerts(MOCK_ALERTS);
      await OfflineStorage.saveLastSyncTime(updatedTime);

      // Also attempt syncing any queued field reports
      await get().syncQueuedReports();

      set({
        isOnline: true,
        isSyncing: false,
        lastSyncTimestamp: updatedTime,
        cachedHazards: EAST_SIKKIM_HAZARDS,
        cachedShelters: EAST_SIKKIM_SHELTERS,
        cachedAlerts: MOCK_ALERTS,
      });
    } catch (err) {
      console.warn('Silent background sync fallback to local cache:', err);
      set({ isOnline: false, isSyncing: false });
      await get().loadCachedData();
    }
  },

  checkSyncStatus: async () => {
    // Non-blocking background sync so initial render is instantaneous
    get().loadCachedData().then(() => {
      get().silentBackgroundSync();
    }).catch(() => {});
  },

  loadCachedData: async () => {
    const hazards = await OfflineStorage.getHazards();
    const shelters = await OfflineStorage.getShelters();
    const alerts = await OfflineStorage.getAlerts();
    const lastSync = await OfflineStorage.getLastSyncTime();
    const queuedReports = await OfflineStorage.getQueuedFieldReports();

    set({
      cachedHazards: hazards.length > 0 ? hazards : EAST_SIKKIM_HAZARDS,
      cachedShelters: shelters.length > 0 ? shelters : EAST_SIKKIM_SHELTERS,
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
          contactPhone: report.contactPhone,
        });
      }
      await OfflineStorage.clearQueuedFieldReports();
      set({ queuedReports: [] });
    } catch (e) {
      console.warn('Could not sync queued reports at this time:', e);
    }
  },
}));
