import { Coordinate } from './disaster';

export type UserRole = 'CIVILIAN' | 'AUTHORITY';

export interface EmergencyContact {
  id: string;
  name: string;
  relation: string;
  phoneNumber: string;
  isPrimary: boolean;
}

export interface UserProfile {
  id: string;
  role: UserRole;
  fullName: string;
  phoneNumber: string;
  language: 'EN' | 'HI' | 'GU';
  locationPermissionGranted: boolean;
  currentLocation?: Coordinate;
  selectedCity: 'Vadodara' | 'Uttarakhand' | 'Mumbai' | 'Ahmedabad';
  medicalConditions?: string;
  bloodGroup?: string;
  emergencyContacts: EmergencyContact[];
  offlineModeEnabled: boolean;
  highContrastModeEnabled: boolean;
}
