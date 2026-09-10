import { create } from 'zustand';
import { CascadePrediction, AuthorityStats } from '../types/disaster';
import { ApiClient } from '../services/api/client';

interface AuthorityState {
  stats: AuthorityStats | null;
  rainfallMmInput: number;
  riverLevelMetersInput: number;
  cascadePrediction: CascadePrediction | null;
  isSimulating: boolean;
  activeMapLayers: {
    floods: boolean;
    landslides: boolean;
    shelters: boolean;
    evacuationRoutes: boolean;
    ndrfUnits: boolean;
  };

  // Actions
  loadStats: () => Promise<void>;
  setRainfallMm: (val: number) => void;
  setRiverLevelMeters: (val: number) => void;
  runCascadeSimulation: () => Promise<void>;
  toggleMapLayer: (layer: keyof AuthorityState['activeMapLayers']) => void;
}

export const useAuthorityStore = create<AuthorityState>((set, get) => ({
  stats: null,
  rainfallMmInput: 180,
  riverLevelMetersInput: 2.6,
  cascadePrediction: null,
  isSimulating: false,
  activeMapLayers: {
    floods: true,
    landslides: true,
    shelters: true,
    evacuationRoutes: true,
    ndrfUnits: true,
  },

  loadStats: async () => {
    try {
      const stats = await ApiClient.fetchAuthorityStats();
      set({ stats });
    } catch (err) {
      console.warn('Failed to load authority stats:', err);
    }
  },

  setRainfallMm: (rainfallMmInput) => set({ rainfallMmInput }),
  setRiverLevelMeters: (riverLevelMetersInput) => set({ riverLevelMetersInput }),

  runCascadeSimulation: async () => {
    set({ isSimulating: true });
    try {
      const prediction = await ApiClient.predictCascade(
        get().rainfallMmInput,
        get().riverLevelMetersInput
      );
      set({ cascadePrediction: prediction, isSimulating: false });
    } catch (err) {
      set({ isSimulating: false });
    }
  },

  toggleMapLayer: (layer) => {
    set((state) => ({
      activeMapLayers: {
        ...state.activeMapLayers,
        [layer]: !state.activeMapLayers[layer],
      },
    }));
  },
}));
