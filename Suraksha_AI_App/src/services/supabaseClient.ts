import { createClient } from '@supabase/supabase-js';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Shelter, EmergencyAlert } from '../types';
import { HazardZone } from '../types/disaster';

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL || 'https://your-project.supabase.co';
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || 'your-anon-key-here';

const isBrowser = typeof window !== 'undefined';

const ssrSafeStorage = {
  getItem: async (key: string): Promise<string | null> => {
    if (!isBrowser) return null;
    try {
      return await AsyncStorage.getItem(key);
    } catch {
      return null;
    }
  },
  setItem: async (key: string, value: string): Promise<void> => {
    if (!isBrowser) return;
    try {
      await AsyncStorage.setItem(key, value);
    } catch {}
  },
  removeItem: async (key: string): Promise<void> => {
    if (!isBrowser) return;
    try {
      await AsyncStorage.removeItem(key);
    } catch {}
  },
};

/**
 * Singleton Direct Supabase Client for React Native / Expo.
 * Configured with SSR-safe storage for authentication state persistence.
 */
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: ssrSafeStorage,
    autoRefreshToken: isBrowser,
    persistSession: isBrowser,
    detectSessionInUrl: false,
  },
});

/**
 * Helper to check if Supabase environment keys are properly configured.
 */
export const isSupabaseConfigured = (): boolean => {
  return (
    supabaseUrl !== 'https://your-project.supabase.co' &&
    supabaseAnonKey !== 'your-anon-key-here' &&
    supabaseUrl.trim().length > 0 &&
    supabaseAnonKey.trim().length > 0
  );
};

/**
 * Direct Supabase Service Helper Layer
 */
export class SupabaseDirectService {
  /**
   * Fetches active relief shelters directly from Supabase `shelters` table matching mobile app Shelter interface.
   */
  public static async fetchSheltersDirect(): Promise<Shelter[]> {
    if (!isSupabaseConfigured()) return [];

    const { data, error } = await supabase
      .from('shelters')
      .select('*')
      .order('name', { ascending: true });

    if (error || !data) {
      console.warn('[SupabaseDirectService] fetchSheltersDirect error:', error);
      return [];
    }

    return data.map((item: any) => ({
      id: String(item.id),
      name: item.name,
      address: item.address || 'Address not listed',
      coordinate: {
        latitude: item.latitude ?? 22.3072,
        longitude: item.longitude ?? 73.1812,
      },
      capacity: {
        totalCapacity: item.total_capacity || item.capacity || 500,
        currentOccupancy: item.current_occupancy || 0,
        availableBeds: Math.max(0, (item.total_capacity || 500) - (item.current_occupancy || 0)),
        occupancyPercentage: Math.round(((item.current_occupancy || 0) / (item.total_capacity || 500)) * 100),
        level: (item.capacity_level as any) || 'Available',
      },
      totalCapacity: item.total_capacity || item.capacity || 500,
      currentOccupancy: item.current_occupancy || 0,
      status: (item.status?.toUpperCase() as any) || 'OPEN',
      distanceKm: item.distance_km || 2.5,
      amenities: {
        medicalKit: item.medical_facilities_available ?? item.amenities?.medicalKit ?? true,
        foodSupplies: (item.food_supplies_days ?? 7) > 0,
        cleanWater: (item.water_supply_liters ?? 5000) > 0,
        powerGenerator: item.power_generator ?? item.amenities?.powerGenerator ?? true,
        sanitation: item.amenities?.sanitation ?? true,
        petFriendly: item.amenities?.petFriendly ?? false,
      },
      contactNumber: item.contact_number || '+91-1800-111-999',
      ndrfUnitId: item.ndrf_unit_id || 'NDRF-BN-06',
      lastUpdated: 'Live Supabase DB',
    }));
  }

  /**
   * Fetches active hazard zones directly from Supabase PostGIS geometry table.
   */
  public static async fetchHazardsDirect(): Promise<HazardZone[]> {
    if (!isSupabaseConfigured()) return [];

    const { data, error } = await supabase
      .from('hazard_zones')
      .select('*')
      .eq('is_active', true);

    if (error || !data) {
      console.warn('[SupabaseDirectService] fetchHazardsDirect error:', error);
      return [];
    }

    return data.map((item: any) => ({
      id: String(item.id),
      name: item.name,
      type: (item.type?.toUpperCase() as any) || 'LANDSLIDE',
      severity: (item.severity?.toUpperCase() as any) || 'HIGH',
      probability: item.probability || 85,
      riskScore: item.risk_score || 80,
      affectedPopulation: item.affected_population || item.affected_population_estimate || 0,
      coordinates: (item.polygon_coordinates || []).map((coord: [number, number]) => ({
        latitude: coord[0],
        longitude: coord[1],
      })),
      center: {
        latitude: item.center_latitude || 27.33,
        longitude: item.center_longitude || 88.61,
      },
      radiusMeters: item.radius_meters || 1500,
      description: item.description || 'Active landslide susceptibility and flash flood danger zone.',
      predictedSurgeTimeMins: item.predicted_surge_time_mins || item.estimated_lead_time_mins || 45,
      roadClosuresCount: item.road_closures_count || 0,
      recommendedAction: item.recommended_action || 'Evacuate immediately via AI-optimized safe routes.',
      lastUpdated: 'Live Supabase DB',
    }));
  }

  /**
   * Subscribes to real-time hazard zone alerts directly from Supabase PostgreSQL replication.
   */
  public static subscribeToRealtimeHazards(onHazardUpdate: (hazard: HazardZone) => void) {
    if (!isSupabaseConfigured()) return null;

    const channel = supabase
      .channel('public:hazard_zones')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'hazard_zones' }, (payload: any) => {
        const item: any = payload.new;
        onHazardUpdate({
          id: String(item.id),
          name: item.name || `${item.type || 'Landslide'} Hazard Zone`,
          type: (item.type?.toUpperCase() as any) || 'LANDSLIDE',
          severity: (item.severity?.toUpperCase() as any) || 'HIGH',
          probability: item.probability || 85,
          riskScore: item.risk_score || 80,
          affectedPopulation: item.affected_population || 12000,
          coordinates: (item.polygon_coordinates || []).map((pair: [number, number]) => ({ latitude: pair[0], longitude: pair[1] })),
          center: { latitude: item.center_latitude || 27.33, longitude: item.center_longitude || 88.61 },
          description: item.description || 'Slope instability detected.',
          predictedSurgeTimeMins: item.predicted_surge_time_mins || 45,
          roadClosuresCount: item.road_closures_count || 2,
          recommendedAction: item.recommended_action || 'Evacuate via designated safe routes.',
          lastUpdated: new Date().toLocaleTimeString(),
        });
      })
      .subscribe();

    return channel;
  }

  /**
   * Submits a geotagged citizen field report directly to Supabase `landslide_field_reports` table.
   */
  public static async submitFieldReportDirect(report: {
    reporter_id: string;
    reporter_role?: string;
    latitude: number;
    longitude: number;
    incident_type: string;
    title?: string;
    media_url?: string;
    description?: string;
    civilian_phone?: string;
  }) {
    if (!isSupabaseConfigured()) {
      throw new Error('Supabase credentials not configured');
    }

    const { data, error } = await supabase
      .from('landslide_field_reports')
      .insert([
        {
          title: report.title || `${report.incident_type} Report`,
          reporter_id: report.reporter_id,
          reporter_role: report.reporter_role || 'CIVILIAN',
          civilian_phone: report.civilian_phone,
          latitude: report.latitude,
          longitude: report.longitude,
          incident_type: report.incident_type,
          media_url: report.media_url,
          description: report.description,
          verification_status: 'Pending',
          status: 'Pending',
        },
      ])
      .select();

    if (error) {
      console.error('[Supabase Error] submitFieldReportDirect:', error.message);
      throw error;
    }

    return data;
  }
}
