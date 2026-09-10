import {
  HazardZone,
  Shelter,
  EvacuationRoute,
  CascadePrediction,
  AuthorityStats,
  Coordinate,
  DisasterType,
} from '../../types/disaster';
import { AlertMessage, AlertDispatchPayload } from '../../types/alert';
import { CivilianFieldReport, FieldReportStatus, VulnerableVillage, VulnerableRoad } from '../../types';
import {
  VADODARA_HAZARDS,
  VADODARA_SHELTERS,
  VADODARA_EVACUATION_ROUTE,
  UTTARAKHAND_HAZARDS,
  UTTARAKHAND_SHELTERS,
  MOCK_ALERTS,
  MOCK_AUTHORITY_STATS,
  INITIAL_FIELD_REPORTS,
  VULNERABLE_VILLAGES,
  VULNERABLE_ROADS,
} from './mockData';

let fieldReportsStore: CivilianFieldReport[] = [...INITIAL_FIELD_REPORTS];

// Simulated Network Delay helper to mimic realistic API calls
const delay = (ms: number = 300) => new Promise((resolve) => setTimeout(resolve, ms));

export class MockDisasterService {
  /**
   * Fetch active hazard zones by city/region
   */
  static async getHazards(city: string = 'Vadodara'): Promise<HazardZone[]> {
    await delay(250);
    if (city === 'Uttarakhand') {
      return UTTARAKHAND_HAZARDS;
    }
    return VADODARA_HAZARDS;
  }

  /**
   * Fetch nearby emergency shelters
   */
  static async getShelters(city: string = 'Vadodara'): Promise<Shelter[]> {
    await delay(250);
    if (city === 'Uttarakhand') {
      return UTTARAKHAND_SHELTERS;
    }
    return VADODARA_SHELTERS;
  }

  /**
   * AI Dynamic Safest Evacuation Route calculation engine
   */
  static async calculateSafeRoute(
    origin: Coordinate,
    destinationShelterId?: string
  ): Promise<EvacuationRoute> {
    await delay(400);
    // Return high-fidelity route with dynamic AI safety calculation
    return VADODARA_EVACUATION_ROUTE;
  }

  /**
   * AI Cascade & Secondary Hazard Predictor (For Authority Control Room)
   * Simulates AI predictions based on rainfall (mm/hr) & river levels (m)
   */
  static async predictCascadeScenario(
    rainfallMm: number,
    riverLevelMeters: number
  ): Promise<CascadePrediction> {
    await delay(500);

    // Compute dynamic secondary hazard risks based on inputs
    const floodRisk = Math.min(100, Math.round((rainfallMm / 250) * 80 + (riverLevelMeters / 3.5) * 40));
    const landslideRisk = Math.min(100, Math.round((rainfallMm / 200) * 90));
    const bridgeRisk = riverLevelMeters > 2.2 ? 'CRITICAL' : riverLevelMeters > 1.8 ? 'HIGH' : 'MODERATE';

    return {
      id: `pred-casc-${Date.now()}`,
      primaryDisaster: {
        type: 'FLOOD',
        triggerValue: `${rainfallMm}mm/hr Rain & ${riverLevelMeters.toFixed(1)}m River Level`,
        location: 'Vishwamitri River Catchment Basin, Gujarat',
      },
      confidenceScore: 94.8,
      predictedSecondaryHazards: [
        {
          id: 'sec-01',
          hazardName: 'Flash Inundation of Sayajigunj Commercial Hub',
          disasterType: 'FLOOD',
          probability: floodRisk,
          estimatedTimeHours: riverLevelMeters > 2.4 ? 0.5 : 1.5,
          affectedSector: 'Sector 3 & Central Railway Approach',
          severity: floodRisk > 80 ? 'CRITICAL' : 'HIGH',
          recommendedAction: 'Issue immediate Level-3 evacuation for ground floor structures.',
        },
        {
          id: 'sec-02',
          hazardName: 'Soil Saturation & Slope Collapse along NH-8 Bypass',
          disasterType: 'LANDSLIDE',
          probability: landslideRisk,
          estimatedTimeHours: 2.5,
          affectedSector: 'Eastern Outer Ring Bypass',
          severity: landslideRisk > 70 ? 'HIGH' : 'MODERATE',
          recommendedAction: 'Divert heavy freight transport via Highway 48 North.',
        },
        {
          id: 'sec-03',
          hazardName: 'Substation Electrical Grid Short-Circuit Risk',
          disasterType: 'WILDFIRE',
          probability: Math.min(90, floodRisk * 0.7),
          estimatedTimeHours: 4.0,
          affectedSector: 'Fatehgunj Substation Node',
          severity: 'HIGH',
          recommendedAction: 'Preemptively isolate Power Grid Transformer 4.',
        },
      ],
      impactedInfrastructure: [
        { name: 'Vishwamitri Main Railway Bridge', type: 'BRIDGE', riskLevel: bridgeRisk },
        { name: 'National Highway 8 Corridor', type: 'HIGHWAY', riskLevel: landslideRisk > 75 ? 'HIGH' : 'MODERATE' },
        { name: 'Alkapuri Thermal Substation', type: 'POWER_GRID', riskLevel: floodRisk > 80 ? 'CRITICAL' : 'HIGH' },
      ],
      generatedTimestamp: new Date().toLocaleTimeString(),
    };
  }

  /**
   * Fetch active alerts stream
   */
  static async getAlerts(): Promise<AlertMessage[]> {
    await delay(200);
    return MOCK_ALERTS;
  }

  /**
   * Fetch Authority Dashboard High-Level Statistics
   */
  static async getAuthorityStats(): Promise<AuthorityStats> {
    await delay(300);
    return MOCK_AUTHORITY_STATS;
  }

  /**
   * Dispatch Emergency Broadcast Alert (Authority Control Room)
   */
  static async dispatchEmergencyAlert(payload: AlertDispatchPayload): Promise<AlertMessage> {
    await delay(400);
    const newAlert: AlertMessage = {
      id: `alt-${Date.now()}`,
      title: payload.title,
      body: payload.body,
      severity: payload.severity,
      disasterType: payload.disasterType,
      targetRegion: payload.targetRegion,
      issuedBy: 'Authority Command & Control Center (AEGIS AI)',
      issuedAt: 'Just now',
      actionRequired: payload.actionRequired,
      affectedPopulationEstimate: 42500,
      acknowledgmentRequired: payload.severity === 'CRITICAL',
    };
    // Append to alerts stream
    MOCK_ALERTS.unshift(newAlert);
    return newAlert;
  }

  /**
   * Fetch civilian field reports
   */
  static async getFieldReports(): Promise<CivilianFieldReport[]> {
    await delay(200);
    return [...fieldReportsStore];
  }

  /**
   * Submit new civilian field report
   */
  static async submitFieldReport(
    report: Omit<CivilianFieldReport, 'id' | 'timestamp' | 'formattedTime' | 'status'>
  ): Promise<CivilianFieldReport> {
    await delay(300);
    const newReport: CivilianFieldReport = {
      ...report,
      id: `fr-${Date.now()}`,
      timestamp: Date.now(),
      formattedTime: 'Just now',
      status: 'SUBMITTED',
    };
    fieldReportsStore.unshift(newReport);
    return newReport;
  }

  /**
   * Update report status (e.g. verified by SDRF)
   */
  static async updateFieldReportStatus(id: string, status: FieldReportStatus): Promise<void> {
    await delay(200);
    fieldReportsStore = fieldReportsStore.map((r) => (r.id === id ? { ...r, status } : r));
  }

  /**
   * Fetch vulnerable villages list
   */
  static async getVulnerableVillages(): Promise<VulnerableVillage[]> {
    await delay(150);
    return VULNERABLE_VILLAGES;
  }

  /**
   * Fetch vulnerable road network
   */
  static async getVulnerableRoads(): Promise<VulnerableRoad[]> {
    await delay(150);
    return VULNERABLE_ROADS;
  }
}
