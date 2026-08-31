import { createClient } from '@supabase/supabase-js';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Shelter, HazardZone, EmergencyAlert } from '../types';

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL || 'https://your-project.supabase.co';
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || 'your-anon-key-here';

/**
 * Singleton Direct Supabase Client for React Native / Expo.
 * Configured with AsyncStorage for authentication state persistence.
 */
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
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
    if (!isSupabaseConfigured()) {
      throw new Error('Supabase URL/Key not configured in .env');
    }

    const { data, error } = await supabase
      .from('shelters')
      .select('*')
      .or('status.eq.OPEN,status.eq.Open');

    if (error) {
      console.error('[Supabase Error] fetchSheltersDirect:', error.message);
      throw error;
    }

    return (data || []).map((s: any) => {
      const totCap = s.total_capacity || s.capacity || 500;
      const currOcc = s.current_occupancy || 0;
      const availBeds = Math.max(0, totCap - currOcc);
      const occPct = Math.round((currOcc / (totCap || 1)) * 100);

      let level: 'Available' | 'Limited' | 'Full' = 'Available';
      if (currOcc >= totCap) level = 'Full';
      else if (occPct > 80) level = 'Limited';

      const amen = s.amenities || {};

      return {
        id: s.id,
        name: s.name,
        address: s.address || s.name,
        coordinate: {
          latitude: s.latitude || 22.3072,
          longitude: s.longitude || 73.1812,
        },
        capacity: {
          totalCapacity: totCap,
          currentOccupancy: currOcc,
          availableBeds: availBeds,
          occupancyPercentage: occPct,
          level: s.capacity_level || level,
        },
        totalCapacity: totCap,
        currentOccupancy: currOcc,
        status: (s.status?.toUpperCase() as any) || 'OPEN',
        distanceKm: s.distance_km || 1.2,
        amenities: {
          medicalKit: amen.medicalKit ?? s.medical_facilities_available ?? true,
          foodSupplies: amen.foodSupplies ?? true,
          cleanWater: amen.cleanWater ?? true,
          powerGenerator: amen.powerGenerator ?? s.power_generator ?? true,
          sanitation: amen.sanitation ?? true,
          petFriendly: amen.petFriendly ?? false,
        },
        contactNumber: s.contact_number || s.contact || '108',
        ndrfUnitId: s.ndrf_unit_id,
        lastUpdated: s.updated_at ? new Date(s.updated_at).toLocaleTimeString() : new Date().toLocaleTimeString(),
      };
    });
  }

  /**
   * Fetches active emergency alerts directly from Supabase `emergency_alerts` table.
   */
  public static async fetchAlertsDirect(): Promise<EmergencyAlert[]> {
    if (!isSupabaseConfigured()) {
      throw new Error('Supabase URL/Key not configured in .env');
    }

    const { data, error } = await supabase
      .from('emergency_alerts')
      .select('*')
      .order('issued_at', { ascending: false });

    if (error) {
      console.error('[Supabase Error] fetchAlertsDirect:', error.message);
      throw error;
    }

    return (data || []).map((a: any) => ({
      id: a.id,
      title: a.title,
      body: a.body,
      severity: (a.severity?.toUpperCase() as any) || 'HIGH',
      disasterType: (a.disaster_type?.toUpperCase() as any) || 'LANDSLIDE',
      targetRegion: a.target_region,
      issuedBy: a.issued_by || 'State Disaster Authority',
      issuedAt: a.issued_at || new Date().toISOString(),
      actionRequired: (a.action_required as any) || 'EVACUATE_IMMEDIATELY',
      affectedPopulationEstimate: a.affected_population_estimate || 15000,
      acknowledgmentRequired: a.acknowledgment_required ?? false,
    }));
  }

  /**
   * Subscribes to real-time hazard zone alerts directly from Supabase PostgreSQL replication.
   */
  public static subscribeToRealtimeHazards(onHazardUpdate: (hazard: HazardZone) => void) {
    if (!isSupabaseConfigured()) return null;

    const channel = supabase
      .channel('public:hazard_zones')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'hazard_zones' }, (payload) => {
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
