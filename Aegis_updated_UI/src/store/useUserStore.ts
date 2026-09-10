import { create } from 'zustand';
import { UserRole, UserProfile, EmergencyContact } from '../types/user';
import { Coordinate } from '../types/disaster';
import { LocationService } from '../services/location/locationService';
import { SosDispatchRecord } from '../services/mock/mockSosService';
import { VoiceGuidanceService } from '../services/audio/voiceGuidanceService';

interface UserState {
  profile: UserProfile;
  isSosActive: boolean;
  sosCountdown: number;
  isRescueBeaconActive: boolean;
  activeBeaconRecord: SosDispatchRecord | null;
  isVoiceGuidanceEnabled: boolean;

  // Actions
  setRole: (role: UserRole) => void;
  updateLocation: () => Promise<Coordinate>;
  setLanguage: (lang: 'EN' | 'HI' | 'GU') => void;
  toggleOfflineMode: () => void;
  triggerSos: () => void;
  cancelSos: () => void;
  addEmergencyContact: (contact: Omit<EmergencyContact, 'id'>) => void;
  setRescueBeaconState: (active: boolean, record?: SosDispatchRecord | null) => void;
  toggleVoiceGuidance: () => void;
  logout: () => void;
}

export const useUserStore = create<UserState>((set, get) => ({
  profile: {
    id: 'aegis-civ-01',
    role: 'CIVILIAN',
    fullName: 'Civilian Evacuee',
    phoneNumber: '+91 98000 00000',
    language: 'EN',
    locationPermissionGranted: true,
    currentLocation: { latitude: 27.2340, longitude: 88.5120 },
    selectedCity: 'East Sikkim',
    medicalConditions: 'None Specified',
    bloodGroup: 'O+',
    emergencyContacts: [
      { id: 'ec-1', name: 'Primary Family Contact', relation: 'Family', phoneNumber: '+91 98000 00001', isPrimary: true },
      { id: 'ec-2', name: 'Sikkim State Emergency Operation Center (SEOC)', relation: 'State Control Room', phoneNumber: '1070', isPrimary: false },
      { id: 'ec-3', name: 'NDRF Mountain Disaster Helpline', relation: 'NDRF Helpline', phoneNumber: '1078', isPrimary: false },
    ],
    offlineModeEnabled: false,
    highContrastModeEnabled: true,
  },
  isSosActive: false,
  sosCountdown: 0,
  isRescueBeaconActive: false,
  activeBeaconRecord: null,
  isVoiceGuidanceEnabled: false,

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
      storage.default.setItem('@aegis_language', language).catch(() => {});
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
    set({ isSosActive: false, sosCountdown: 0, isRescueBeaconActive: false, activeBeaconRecord: null });
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

  setRescueBeaconState: (isRescueBeaconActive, record = null) => {
    set({ isRescueBeaconActive, activeBeaconRecord: record || null });
  },

  toggleVoiceGuidance: () => {
    const nextState = !get().isVoiceGuidanceEnabled;
    VoiceGuidanceService.setVoiceGuidanceEnabled(nextState);
    set({ isVoiceGuidanceEnabled: nextState });
  },

  logout: () => {
    VoiceGuidanceService.stopSpeaking();
    set({
      isSosActive: false,
      sosCountdown: 0,
      isRescueBeaconActive: false,
      activeBeaconRecord: null,
      isVoiceGuidanceEnabled: false,
    });
  },
}));
