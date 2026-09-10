import { create } from 'zustand';
import {
  HazardZone,
  Shelter,
  EvacuationRoute,
  CivilianFieldReport,
  VulnerableVillage,
  VulnerableRoad,
  Coordinate,
} from '../types/disaster';
import { FieldReportStatus } from '../types';
import { AlertMessage } from '../types/alert';
import { ApiClient } from '../services/api/client';
import { OfflineStorage } from '../services/storage/offlineStorage';
import { getTopRecommendedShelter } from '../utils/shelterLoadBalancer';
import {
  EAST_SIKKIM_HAZARDS,
  EAST_SIKKIM_SHELTERS,
  EAST_SIKKIM_EVACUATION_ROUTE,
  MOCK_ALERTS,
  INITIAL_FIELD_REPORTS,
  VULNERABLE_VILLAGES,
  VULNERABLE_ROADS,
} from '../services/mock/mockData';

// Primary Default Mountain Center: East Sikkim NH-10 Corridor
export const DEFAULT_NER_COORDINATE: Coordinate = {
  latitude: 27.2340,
  longitude: 88.5120,
};

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
  calculateSafeRoute: (origin: Coordinate, shelterId?: string) => Promise<void>;
  loadCachedData: () => Promise<boolean>;
  loadFieldReports: () => Promise<void>;
  submitFieldReport: (
    report: Omit<CivilianFieldReport, 'id' | 'timestamp' | 'formattedTime' | 'status'>
  ) => Promise<CivilianFieldReport>;
  updateFieldReportStatus: (reportId: string, status: FieldReportStatus) => Promise<void>;
}

export const useDisasterStore = create<DisasterState>((set, get) => ({
  selectedCity: 'East Sikkim',
  hazards: EAST_SIKKIM_HAZARDS,
  shelters: EAST_SIKKIM_SHELTERS,
  evacuationRoute: EAST_SIKKIM_EVACUATION_ROUTE,
  alerts: MOCK_ALERTS,
  fieldReports: INITIAL_FIELD_REPORTS,
  vulnerableVillages: VULNERABLE_VILLAGES,
  vulnerableRoads: VULNERABLE_ROADS,
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

      // Determine top shelter using shelter load balancer in NER mountains
      const topShelter = getTopRecommendedShelter(shelters, DEFAULT_NER_COORDINATE);

      // Calculate safe route to load-balanced shelter
      const route = await ApiClient.calculateRoute(
        DEFAULT_NER_COORDINATE,
        topShelter?.id || shelters[0]?.id
      );

      const hasCriticalHazard =
        hazards.some((h) => h.severity === 'CRITICAL' || h.warningLevel === 'WARNING') ||
        alerts.some((a) => a.severity === 'CRITICAL');

      set({
        hazards,
        shelters,
        alerts,
        fieldReports,
        vulnerableVillages,
        vulnerableRoads,
        evacuationRoute: route,
        isLoading: false,
        isEmergencyModeActive: hasCriticalHazard,
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
      const hasCriticalHazard = hazards.some(
        (h) => h.severity === 'CRITICAL' || h.warningLevel === 'WARNING'
      );
      set({
        hazards,
        shelters,
        evacuationRoute: route,
        isLoading: false,
        isEmergencyModeActive: hasCriticalHazard,
      });
      return true;
    }
    return false;
  },

  loadFieldReports: async () => {
    try {
      const fieldReports = await ApiClient.fetchFieldReports();
      set({ fieldReports });
    } catch (err) {
      console.warn('Could not refresh field reports:', err);
    }
  },

  submitFieldReport: async (report) => {
    const created = await ApiClient.submitFieldReport(report);
    set((state) => ({
      fieldReports: [created, ...state.fieldReports],
    }));
    return created;
  },

  updateFieldReportStatus: async (reportId, status) => {
    await ApiClient.updateFieldReportStatus(reportId, status);
    set((state) => ({
      fieldReports: state.fieldReports.map((r) => (r.id === reportId ? { ...r, status } : r)),
    }));
  },
}));
