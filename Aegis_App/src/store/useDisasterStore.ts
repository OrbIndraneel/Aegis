import { create } from 'zustand';
import { HazardZone, Shelter, EvacuationRoute, Coordinate } from '../types/disaster';
import { AlertMessage } from '../types/alert';
import { CivilianFieldReport, FieldReportStatus, VulnerableVillage, VulnerableRoad } from '../types';
import { ApiClient } from '../services/api/client';
import { OfflineStorage } from '../services/storage/offlineStorage';
import { getTopRecommendedShelter } from '../utils/shelterLoadBalancer';

interface DisasterState {
  selectedCity: string;
  hazards: HazardZone[];
  shelters: Shelter[];
  evacuationRoute: EvacuationRoute | null;
  alerts: AlertMessage[];
  fieldReports: CivilianFieldReport[];
  vulnerableVillages: VulnerableVillage[];
  vulnerableRoads: VulnerableRoad[];
  isLoading: boolean;
  error: string | null;
  isEmergencyModeActive: boolean;

  // Actions
  setSelectedCity: (city: string) => void;
  setEmergencyModeActive: (active: boolean) => void;
  loadDisasterData: (city?: string) => Promise<void>;
  calculateSafeRoute: (origin: { latitude: number; longitude: number }, shelterId?: string) => Promise<void>;
  loadCachedData: () => Promise<boolean>;
  loadFieldReports: () => Promise<void>;
  submitFieldReport: (
    report: Omit<CivilianFieldReport, 'id' | 'timestamp' | 'formattedTime' | 'status'>
  ) => Promise<CivilianFieldReport>;
  updateFieldReportStatus: (reportId: string, status: FieldReportStatus) => Promise<void>;
}

export const useDisasterStore = create<DisasterState>((set, get) => ({
  selectedCity: 'East Sikkim',
  hazards: [],
  shelters: [],
  evacuationRoute: null,
  alerts: [],
  fieldReports: [],
  vulnerableVillages: [],
  vulnerableRoads: [],
  isLoading: false,
  error: null,
  isEmergencyModeActive: true,

  setSelectedCity: (city: string) => {
    set({ selectedCity: city });
    get().loadDisasterData(city);
  },

  setEmergencyModeActive: (isEmergencyModeActive: boolean) => {
    set({ isEmergencyModeActive });
  },

  loadDisasterData: async (city?: string) => {
    const targetCity = city || get().selectedCity;
    set({ isLoading: true, error: null });
    try {
      const [hazards, shelters, alerts, fieldReports, vulnerableVillages, vulnerableRoads] =
        await Promise.all([
          ApiClient.fetchHazards(targetCity),
          ApiClient.fetchShelters(targetCity),
          ApiClient.fetchAlerts(),
          ApiClient.fetchFieldReports(),
          ApiClient.fetchVulnerableVillages(),
          ApiClient.fetchVulnerableRoads(),
        ]);

      // Determine top shelter using shelter load balancer
      const origin = { latitude: 22.3072, longitude: 73.1812 };
      const topShelter = getTopRecommendedShelter(shelters, origin);

      // Calculate safe route to load-balanced shelter
      const route = await ApiClient.calculateRoute(
        origin,
        topShelter?.id || shelters[0]?.id
      );

      set({
        hazards,
        shelters,
        alerts,
        fieldReports,
        vulnerableVillages,
        vulnerableRoads,
        evacuationRoute: route,
        isLoading: false,
      });

      // Save to offline storage cache
      await OfflineStorage.saveDisasterCache(hazards, shelters, route);
    } catch (err) {
      console.warn('Failed to fetch live disaster data, falling back to cache:', err);
      const cacheLoaded = await get().loadCachedData();
      if (!cacheLoaded) {
        set({ error: 'Unable to load disaster data', isLoading: false });
      }
    }
  },

  loadFieldReports: async () => {
    try {
      const reports = await ApiClient.fetchFieldReports();
      set({ fieldReports: reports });
    } catch (err) {
      console.warn('Failed to load field reports:', err);
    }
  },

  submitFieldReport: async (report) => {
    const newReport = await ApiClient.submitFieldReport(report);
    set((state) => ({
      fieldReports: [newReport, ...state.fieldReports],
    }));
    return newReport;
  },

  updateFieldReportStatus: async (reportId: string, status: FieldReportStatus) => {
    await ApiClient.updateFieldReportStatus(reportId, status);
    set((state) => ({
      fieldReports: state.fieldReports.map((r) =>
        r.id === reportId ? { ...r, status } : r
      ),
    }));
  },

  calculateSafeRoute: async (origin, shelterId) => {
    set({ isLoading: true });
    try {
      const route = await ApiClient.calculateRoute(origin, shelterId);
      set({ evacuationRoute: route, isLoading: false });
    } catch (err) {
      set({ error: 'Route calculation failed', isLoading: false });
    }
  },

  loadCachedData: async () => {
    const hazards = await OfflineStorage.getCachedHazards();
    const shelters = await OfflineStorage.getCachedShelters();
    const route = await OfflineStorage.getCachedRoute();

    if (hazards && shelters) {
      set({
        hazards,
        shelters,
        evacuationRoute: route,
        isLoading: false,
      });
      return true;
    }
    return false;
  },
}));
