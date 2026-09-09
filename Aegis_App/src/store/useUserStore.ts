import { create } from 'zustand';
import { UserRole, UserProfile, EmergencyContact } from '../types/user';
import { Coordinate } from '../types/disaster';
import { LocationService } from '../services/location/locationService';

interface UserState {
  profile: UserProfile;
  isSosActive: boolean;
  sosCountdown: number;

  // Actions
  setRole: (role: UserRole) => void;
  updateLocation: () => Promise<Coordinate>;
  setLanguage: (lang: 'EN' | 'HI' | 'GU') => void;
  toggleOfflineMode: () => void;
  triggerSos: () => void;
  cancelSos: () => void;
  addEmergencyContact: (contact: Omit<EmergencyContact, 'id'>) => void;
}

export const useUserStore = create<UserState>((set, get) => ({
  profile: {
    id: 'demo-civilian-01',
    role: 'CIVILIAN',
    fullName: 'Demo User',
    phoneNumber: '+91 00000 00000',
    language: 'EN',
    locationPermissionGranted: true,
    currentLocation: { latitude: 22.3072, longitude: 73.1812 },
    selectedCity: 'Vadodara',
    medicalConditions: 'None Specified (Demo Profile)',
    bloodGroup: 'O+ (Demo)',
    emergencyContacts: [
      { id: 'ec-1', name: 'Primary Family Contact', relation: 'Family', phoneNumber: '+91 00000 00001', isPrimary: true },
      { id: 'ec-2', name: 'State Emergency Operation Center (SEOC)', relation: 'Official Control Room', phoneNumber: '1070', isPrimary: false },
      { id: 'ec-3', name: 'NDRF National Disaster Helpline', relation: 'Official NDRF Helpline', phoneNumber: '1078', isPrimary: false },
    ],
    offlineModeEnabled: false,
    highContrastModeEnabled: true,
  },
  isSosActive: false,
  sosCountdown: 0,

  setRole: (role: UserRole) => {
    set((state) => ({
      profile: { ...state.profile, role },
    }));
  },

  updateLocation: async () => {
    const loc = await LocationService.getCurrentLocation();
    set((state) => ({
      profile: { ...state.profile, currentLocation: loc },
    }));
    return loc;
  },

  setLanguage: (language) => {
    set((state) => ({
      profile: { ...state.profile, language },
    }));
    import('@react-native-async-storage/async-storage').then((storage) => {
      storage.default.setItem('@suraksha_language', language).catch(() => {});
    });
  },

  toggleOfflineMode: () => {
    set((state) => ({
      profile: { ...state.profile, offlineModeEnabled: !state.profile.offlineModeEnabled },
    }));
  },

  triggerSos: () => {
    set({ isSosActive: true, sosCountdown: 3 });
  },

  cancelSos: () => {
    set({ isSosActive: false, sosCountdown: 0 });
  },

  addEmergencyContact: (contact) => {
    const newContact: EmergencyContact = {
      ...contact,
      id: `ec-${Date.now()}`,
    };
    set((state) => ({
      profile: {
        ...state.profile,
        emergencyContacts: [...state.profile.emergencyContacts, newContact],
      },
    }));
  },
}));
