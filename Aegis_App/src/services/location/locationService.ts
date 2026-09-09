import * as Location from 'expo-location';
import { Coordinate } from '../../types';

export interface LocationState {
  coordinate: Coordinate;
  status: 'GRANTED' | 'DENIED' | 'UNAVAILABLE' | 'STALE' | 'FALLBACK';
  accuracyMeters?: number;
  lastUpdated: string;
  error?: string;
}

export class LocationService {
  private static DEFAULT_LOCATION: Coordinate = { latitude: 22.3072, longitude: 73.1812 }; // Vadodara Center

  /**
   * Request GPS Location Permissions safely
   */
  static async requestPermissions(): Promise<boolean> {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      return status === 'granted';
    } catch (error) {
      console.warn('Location permission request exception caught gracefully:', error);
      return false;
    }
  }

  /**
   * Safe location fetch with full fallback handling.
   * Never throws or crashes if permission is denied or GPS is unavailable.
   */
  static async getCurrentLocationState(): Promise<LocationState> {
    try {
      const hasPermission = await this.requestPermissions();
      if (!hasPermission) {
        return {
          coordinate: this.DEFAULT_LOCATION,
          status: 'DENIED',
          lastUpdated: new Date().toLocaleTimeString(),
          error: 'Location permission denied by user. Operating in fallback coordinates.',
        };
      }

      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });

      return {
        coordinate: {
          latitude: location.coords.latitude,
          longitude: location.coords.longitude,
        },
        status: 'GRANTED',
        accuracyMeters: location.coords.accuracy || 10,
        lastUpdated: new Date().toLocaleTimeString(),
      };
    } catch (err: any) {
      console.warn('Location fetch failed or unavailable, using fallback:', err);
      return {
        coordinate: this.DEFAULT_LOCATION,
        status: 'UNAVAILABLE',
        lastUpdated: new Date().toLocaleTimeString(),
        error: 'GPS hardware signal unavailable. Falling back to disaster region center.',
      };
    }
  }

  /**
   * Get Coordinate fallback helper
   */
  static async getCurrentLocation(): Promise<Coordinate> {
    const state = await this.getCurrentLocationState();
    return state.coordinate;
  }

  /**
   * Subscribe to live GPS location updates with safe listener cleanup.
   */
  static async watchLocation(
    onUpdate: (coord: Coordinate) => void
  ): Promise<Location.LocationSubscription | null> {
    try {
      const hasPermission = await this.requestPermissions();
      if (!hasPermission) return null;

      return await Location.watchPositionAsync(
        {
          accuracy: Location.Accuracy.High,
          timeInterval: 5000,
          distanceInterval: 10,
        },
        (loc) => {
          onUpdate({
            latitude: loc.coords.latitude,
            longitude: loc.coords.longitude,
          });
        }
      );
    } catch (err) {
      console.warn('Unable to start live location watcher:', err);
      return null;
    }
  }

  /**
   * Calculate Haversine distance in km between two GPS points
   */
  static calculateDistanceKm(coord1: Coordinate, coord2: Coordinate): number {
    const R = 6371;
    const dLat = ((coord2.latitude - coord1.latitude) * Math.PI) / 180;
    const dLon = ((coord2.longitude - coord1.longitude) * Math.PI) / 180;
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos((coord1.latitude * Math.PI) / 180) *
        Math.cos((coord2.latitude * Math.PI) / 180) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return parseFloat((R * c).toFixed(2));
  }
}

