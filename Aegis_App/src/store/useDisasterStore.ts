import { create } from 'zustand';
import { HazardZone, Shelter, EvacuationRoute } from '../types/disaster';
import { AlertMessage } from '../types/alert';
import { ApiClient } from '../services/api/client';
import { OfflineStorage } from '../services/storage/offlineStorage';

interface DisasterState {
  selectedCity: string;
  hazards: HazardZone[];
  shelters: Shelter[];
  evacuationRoute: EvacuationRoute | null;
  alerts: AlertMessage[];
  isLoading: boolean;
  error: string | null;

  // Actions
  setSelectedCity: (city: string) => void;
  loadDisasterData: (city?: string) => Promise<void>;
  calculateSafeRoute: (origin: { latitude: number; longitude: number }, shelterId?: string) => Promise<void>;
  loadCachedData: () => Promise<boolean>;
}

export const useDisasterStore = create<DisasterState>((set, get) => ({
  selectedCity: 'Vadodara',
  hazards: [],
  shelters: [],
  evacuationRoute: null,
  alerts: [],
  isLoading: false,
  error: null,

  setSelectedCity: (city: string) => {
    set({ selectedCity: city });
    get().loadDisasterData(city);
  },

  loadDisasterData: async (city?: string) => {
    const targetCity = city || get().selectedCity;
    set({ isLoading: true, error: null });
    try {
      const [hazards, shelters, alerts] = await Promise.all([
        ApiClient.fetchHazards(targetCity),
        ApiClient.fetchShelters(targetCity),
        ApiClient.fetchAlerts(),
      ]);

      // Calculate safe route to closest shelter
      const route = await ApiClient.calculateRoute(
        { latitude: 22.3072, longitude: 73.1812 },
        shelters[0]?.id
      );

      set({
        hazards,
        shelters,
        alerts,
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
