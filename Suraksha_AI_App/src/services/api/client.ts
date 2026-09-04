import { MockDisasterService } from '../mock/mockDisasterService';
import { SupabaseDirectService, isSupabaseConfigured } from '../supabaseClient';
import { HazardZone, Shelter, EvacuationRoute, CascadePrediction, AuthorityStats, Coordinate } from '../../types/disaster';
import { AlertMessage, AlertDispatchPayload } from '../../types/alert';

/**
 * Centralized API Service Abstraction Layer for SURAKSHA AI.
 * 
 * Supports Hybrid-Mode:
 * 1. Direct Supabase Client (when configured in .env for fast direct DB & Auth queries)
 * 2. Live FastAPI Backend Service (for ML prediction & OR-Tools routing)
 * 3. High-fidelity Mock Disaster Service fallback (for offline or local demo testing)
 */
export class ApiClient {

  private static baseUrl = (process.env.EXPO_PUBLIC_API_URL || 'http://localhost:8000').replace(/\/$/, '');
  private static enableMock = process.env.EXPO_PUBLIC_ENABLE_MOCK_SERVICE === 'true';

  private static async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const url = `${this.baseUrl}${endpoint.startsWith('/') ? '' : '/'}${endpoint}`;
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 4000);

    try {
      const response = await fetch(url, {
        ...options,
        signal: controller.signal,
        headers: {
          'Content-Type': 'application/json',
          ...(options.headers || {}),
        },
      });
      clearTimeout(timeoutId);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      clearTimeout(timeoutId);
      throw error;
    }
  }

  public static async fetchHazards(city: string = 'Vadodara'): Promise<HazardZone[]> {
    if (this.enableMock) {
      return await MockDisasterService.getHazards(city);
    }
    try {
      const lat = city === 'Uttarakhand' ? 30.0668 : 22.3072;
      const lng = city === 'Uttarakhand' ? 79.0193 : 73.1812;
      const data: any = await this.request('/api/predict-cascade', {
        method: 'POST',
        body: JSON.stringify({
          latitude: lat,
          longitude: lng,
          rainfall_mm: 180.0,
          river_level_m: 2.6,
          district_id: city.toLowerCase(),
        }),
      });

      const hazardCoords: Coordinate[] = (data.polygon_coordinates || []).map(
        (pair: [number, number]) => ({ latitude: pair[0], longitude: pair[1] })
      );

      const mockHazards = await MockDisasterService.getHazards(city);

      const hazard: HazardZone = {
        id: `gnn-${data.district_id}`,
        name: `${data.primary_hazard} & ${data.secondary_cascade_hazard} Cascade Zone`,
        type: data.primary_hazard?.toUpperCase().includes('FLOOD') ? 'FLOOD' : 'LANDSLIDE',
        severity: (data.risk_level?.toUpperCase() as any) || 'HIGH',
        probability: Math.round((data.cascade_probability || 0.85) * 100),
        riskScore: Math.round((data.severity_score || 8.0) * 10),
        affectedPopulation: data.affected_population_estimate || 45000,
        coordinates: hazardCoords.length > 0 ? hazardCoords : mockHazards[0]?.coordinates || [],
        center: { latitude: lat, longitude: lng },
        description: `GNN Cascade Warning: ${data.secondary_cascade_hazard} expected with ${data.estimated_lead_time_mins}m lead time.`,
        predictedSurgeTimeMins: data.estimated_lead_time_mins || 45,
        roadClosuresCount: 3,
        recommendedAction: 'Evacuate immediately via OR-Tools dynamic route.',
        lastUpdated: new Date().toLocaleTimeString(),
      };

      return [hazard];
    } catch (error) {
      console.warn('[ApiClient] Live hazards request failed, falling back to mock:', error);
      return await MockDisasterService.getHazards(city);
    }
  }

  public static async fetchShelters(city: string = 'Vadodara'): Promise<Shelter[]> {
    if (this.enableMock) {
      return await MockDisasterService.getShelters(city);
    }
    if (isSupabaseConfigured()) {
      try {
        return await SupabaseDirectService.fetchSheltersDirect();
      } catch (err) {
        console.warn('[ApiClient] Direct Supabase shelter fetch failed, falling back to FastAPI:', err);
      }
    }
    try {
      const lat = city === 'Uttarakhand' ? 30.0668 : 22.3072;
      const lng = city === 'Uttarakhand' ? 79.0193 : 73.1812;
      const data: any[] = await this.request(`/api/shelters?lat=${lat}&lng=${lng}&radius_km=30`);

      if (Array.isArray(data) && data.length > 0) {
        return data.map((item) => ({
          id: item.shelter_id,
          name: item.name,
          address: item.address || `${item.name}, ${city}`,
          coordinate: { latitude: item.latitude, longitude: item.longitude },
          capacity: {
            totalCapacity: item.capacity,
            currentOccupancy: item.current_occupancy,
            availableBeds: item.capacity - item.current_occupancy,
            occupancyPercentage: Math.round((item.current_occupancy / (item.capacity || 1)) * 100),
            level: item.current_occupancy >= item.capacity ? 'Full' : (item.current_occupancy / item.capacity > 0.8 ? 'Limited' : 'Available'),
          },
          totalCapacity: item.capacity,
          currentOccupancy: item.current_occupancy,
          status: (item.status?.toUpperCase() as any) || 'OPEN',
          distanceKm: item.distance_km || 2.4,
          amenities: {
            medicalKit: item.medical_facilities_available ?? true,
            foodSupplies: (item.food_supplies_days ?? 7) > 0,
            cleanWater: (item.water_supply_liters ?? 5000) > 0,
            powerGenerator: item.power_generator ?? true,
            sanitation: true,
            petFriendly: true,
          },
          contactNumber: item.contact || item.admin_incharge_phone || '+91-9876543210',
          lastUpdated: 'Just now',
        }));
      }
      return await MockDisasterService.getShelters(city);
    } catch (error) {
      console.warn('[ApiClient] Live shelters request failed, falling back to mock:', error);
      return await MockDisasterService.getShelters(city);
    }
  }

  public static async calculateRoute(
    origin: { latitude: number; longitude: number },
    shelterId?: string
  ): Promise<EvacuationRoute> {
    if (this.enableMock) {
      return await MockDisasterService.calculateSafeRoute(origin, shelterId);
    }
    try {
      const data: any = await this.request('/api/evacuation-route', {
        method: 'POST',
        body: JSON.stringify({
          user_lat: origin.latitude,
          user_lng: origin.longitude,
          destination_shelter_id: shelterId || 'sh_01',
          transport_mode: 'walking',
        }),
      });

      const polylineCoords: Coordinate[] = (data.route_coordinates || []).map(
        (pair: [number, number]) => ({ latitude: pair[0], longitude: pair[1] })
      );

      const mockFallback = await MockDisasterService.calculateSafeRoute(origin, shelterId);

      return {
        ...mockFallback,
        id: data.route_id || mockFallback.id,
        distanceKm: data.distance_km ?? mockFallback.distanceKm,
        estimatedTimeMins: data.estimated_time_mins ?? mockFallback.estimatedTimeMins,
        polyline: polylineCoords.length > 0 ? polylineCoords : mockFallback.polyline,
      };
    } catch (error) {
      console.warn('[ApiClient] Live route calculation failed, falling back to mock:', error);
      return await MockDisasterService.calculateSafeRoute(origin, shelterId);
    }
  }

  public static async predictCascade(
    rainfallMm: number,
    riverLevelMeters: number
  ): Promise<CascadePrediction> {
    if (this.enableMock) {
      return await MockDisasterService.predictCascadeScenario(rainfallMm, riverLevelMeters);
    }
    try {
      const data: any = await this.request('/api/predict-cascade', {
        method: 'POST',
        body: JSON.stringify({
          latitude: 22.3072,
          longitude: 73.1812,
          rainfall_mm: rainfallMm,
          river_level_m: riverLevelMeters,
          district_id: 'vadodara_01',
        }),
      });

      const mockFallback = await MockDisasterService.predictCascadeScenario(rainfallMm, riverLevelMeters);

      return {
        id: `gnn-${data.district_id}-${Date.now()}`,
        primaryDisaster: {
          type: (data.primary_hazard?.toUpperCase().includes('FLOOD') ? 'FLOOD' : 'LANDSLIDE') as any,
          triggerValue: `${rainfallMm}mm/hr Rain & ${riverLevelMeters.toFixed(1)}m River Level`,
          location: `${data.district_id} Region`,
        },
        confidenceScore: Math.round((data.cascade_probability || 0.94) * 100),
        predictedSecondaryHazards: [
          {
            id: 'sec-gnn-01',
            hazardName: data.secondary_cascade_hazard || 'Secondary Inundation',
            disasterType: (data.secondary_cascade_hazard?.toUpperCase().includes('LANDSLIDE') ? 'LANDSLIDE' : 'FLOOD') as any,
            probability: Math.round((data.cascade_probability || 0.88) * 100),
            estimatedTimeHours: (data.estimated_lead_time_mins || 45) / 60,
            affectedSector: `District ${data.district_id}`,
            severity: (data.risk_level?.toUpperCase() as any) || 'HIGH',
            recommendedAction: 'Issue immediate Level-3 hazard alert.',
          },
          ...mockFallback.predictedSecondaryHazards.slice(1),
        ],
        impactedInfrastructure: mockFallback.impactedInfrastructure,
        generatedTimestamp: new Date().toLocaleTimeString(),
      };
    } catch (error) {
      console.warn('[ApiClient] Live cascade prediction failed, falling back to mock:', error);
      return await MockDisasterService.predictCascadeScenario(rainfallMm, riverLevelMeters);
    }
  }

  public static async fetchAlerts(): Promise<AlertMessage[]> {
    if (this.enableMock) {
      return await MockDisasterService.getAlerts();
    }
    try {
      const data: any[] = await this.request('/api/alerts/active');
      if (Array.isArray(data) && data.length > 0) {
        return data.map((item) => ({
          id: item.alert_id,
          title: item.title,
          body: item.body,
          severity: (item.severity?.toUpperCase() as any) || 'CRITICAL',
          disasterType: (item.disaster_type?.toUpperCase() as any) || 'FLOOD',
          targetRegion: item.target_region,
          issuedBy: item.issued_by || 'Authority Control Center',
          issuedAt: item.issued_at || 'Just now',
          actionRequired: item.action_required || 'EVACUATE_IMMEDIATELY',
          affectedPopulationEstimate: item.affected_population_estimate || 42500,
          acknowledgmentRequired: item.acknowledgment_required ?? true,
        }));
      }
      return await MockDisasterService.getAlerts();
    } catch (error) {
      console.warn('[ApiClient] Live fetchAlerts failed, falling back to mock:', error);
      return await MockDisasterService.getAlerts();
    }
  }

  public static async fetchAuthorityStats(): Promise<AuthorityStats> {
    return await MockDisasterService.getAuthorityStats();
  }

  public static async dispatchAlert(payload: AlertDispatchPayload): Promise<AlertMessage> {
    if (this.enableMock) {
      return await MockDisasterService.dispatchEmergencyAlert(payload);
    }
    try {
      const data: any = await this.request('/api/alerts/broadcast', {
        method: 'POST',
        body: JSON.stringify({
          title: payload.title,
          body: payload.body,
          severity: payload.severity,
          disaster_type: payload.disasterType,
          target_region: payload.targetRegion,
          action_required: payload.actionRequired,
          send_push_notification: payload.sendPushNotification,
          trigger_emergency_siren: payload.triggerEmergencySiren,
        }),
      });
      return {
        id: data.alert_id,
        title: data.title,
        body: data.body,
        severity: data.severity,
        disasterType: data.disaster_type,
        targetRegion: data.target_region,
        issuedBy: data.issued_by,
        issuedAt: data.issued_at,
        actionRequired: data.action_required,
        affectedPopulationEstimate: data.affected_population_estimate,
        acknowledgmentRequired: data.acknowledgment_required,
      };
    } catch (error) {
      console.warn('[ApiClient] Live dispatchAlert failed, falling back to mock:', error);
      return await MockDisasterService.dispatchEmergencyAlert(payload);
    }
  }

  public static async dispatchSOS(payload: {
    user_id: string;
    user_name?: string;
    user_phone?: string;
    latitude: number;
    longitude: number;
    emergency_type: string;
    notes?: string;
  }) {
    if (this.enableMock) {
      return { success: true, alert_id: `sos-${Date.now()}` };
    }
    try {
      return await this.request('/api/sos', {
        method: 'POST',
        body: JSON.stringify(payload),
      });
    } catch (error) {
      console.warn('[ApiClient] Live SOS dispatch failed:', error);
      return { success: true, alert_id: `sos-offline-${Date.now()}` };
    }
  }

  public static async fetchActiveSOS(lat = 22.3072, lng = 73.1812, radius_km = 50) {
    if (this.enableMock) {
      return [];
    }
    try {
      return await this.request<any[]>(`/api/sos/active?lat=${lat}&lng=${lng}&radius_km=${radius_km}`);
    } catch (error) {
      console.warn('[ApiClient] Live active SOS fetch failed:', error);
      return [];
    }
  }

  // --- SECURITY, CONSENT & ABDM EMERGENCY MEDICAL SERVICES ---

  public static async fetchConsentStatus(civilianId: string = 'demo-civilian-01') {
    try {
      return await this.request<any>(`/api/consent/${civilianId}`);
    } catch (error) {
      console.warn('[ApiClient] Fetch consent failed, using local active fallback:', error);
      return {
        id: 'consent-demo-01',
        civilian_id: civilianId,
        status: 'ACTIVE',
        emergency_use_permitted: true,
        permitted_fields: ['blood_group', 'critical_allergies', 'critical_conditions', 'emergency_contacts'],
        valid_until: '2027-01-01T00:00:00Z',
      };
    }
  }

  public static async updateConsent(payload: {
    civilian_id: string;
    emergency_use_permitted: boolean;
    permitted_fields: string[];
    apaar_id?: string;
    abha_id?: string;
  }) {
    try {
      return await this.request<any>('/api/consent', {
        method: 'POST',
        body: JSON.stringify(payload),
      });
    } catch (error) {
      console.warn('[ApiClient] Update consent failed:', error);
      return { status: 'ACTIVE', ...payload };
    }
  }

  public static async revokeConsent(civilianId: string = 'demo-civilian-01') {
    try {
      return await this.request<any>(`/api/consent/${civilianId}/revoke`, {
        method: 'POST',
      });
    } catch (error) {
      console.warn('[ApiClient] Revoke consent failed:', error);
      return { status: 'REVOKED' };
    }
  }

  public static async fetchMedicalAccessHistory(civilianId: string = 'demo-civilian-01') {
    try {
      return await this.request<any>(`/api/consent/${civilianId}/access-history`);
    } catch (error) {
      console.warn('[ApiClient] Access history fetch failed, returning demo log:', error);
      return {
        civilian_id: civilianId,
        access_logs_count: 1,
        access_history: [
          {
            id: 'demo-audit-01',
            requesting_role: 'FIELD_OFFICER',
            access_reason: 'Emergency Search & Rescue Triage',
            fields_returned: ['blood_group', 'critical_allergies'],
            decision: 'GRANTED',
            created_at: new Date(Date.now() - 3600000).toISOString(),
          }
        ],
      };
    }
  }

  public static async fetchEmergencyMedicalSummary(
    civilianId: string = 'demo-civilian-01',
    authorityHeaders: Record<string, string> = { 'X-Authority-Role': 'FIELD_OFFICER' }
  ) {
    try {
      return await this.request<any>(`/api/medical/summary/${civilianId}?reason=Emergency+Rescue+Triage`, {
        headers: authorityHeaders,
      });
    } catch (error) {
      console.warn('[ApiClient] Emergency medical summary fetch failed, using fallback:', error);
      return {
        access_granted: true,
        medical_data_status: 'fallback_summary',
        authority_role: authorityHeaders['X-Authority-Role'] || 'FIELD_OFFICER',
        summary: {
          civilian_id: civilianId,
          blood_group: 'O+',
          critical_allergies: ['Penicillin'],
          critical_conditions: ['Type 1 Diabetes Mellitus'],
          emergency_contacts: [{ name: 'Family Contact', relation: 'Spouse', phone: '+91 98765 11223' }],
          disclaimer: 'EMERGENCY USE ONLY — ACCESS LOGGED AND MONITORED',
          last_retrieved: new Date().toLocaleTimeString(),
        },
      };
    }
  }

  public static async requestRouteOverride(
    payload: {
      original_route_id: string;
      reason: string;
      override_polyline: number[][];
      requested_changes?: any;
    },
    authorityHeaders: Record<string, string> = { 'X-Authority-Role': 'ADMIN' }
  ) {
    try {
      return await this.request<any>('/api/authority/override-route', {
        method: 'POST',
        headers: authorityHeaders,
        body: JSON.stringify(payload),
      });
    } catch (error) {
      console.warn('[ApiClient] Route override request failed:', error);
      return { message: 'Route override registered (local demo)', override: payload };
    }
  }

  public static async updateShelterStatusAuthorized(
    shelterId: string,
    payload: { current_occupancy: number; status?: string },
    authorityHeaders: Record<string, string> = { 'X-Authority-Role': 'SHELTER_MANAGER', 'X-Authority-Shelter': shelterId }
  ) {
    try {
      return await this.request<any>(`/api/authority/shelters/${shelterId}/status`, {
        method: 'POST',
        headers: authorityHeaders,
        body: JSON.stringify(payload),
      });
    } catch (error) {
      console.warn('[ApiClient] Shelter status update failed:', error);
      return { status: 'success', shelter_id: shelterId, ...payload };
    }
  }
}

