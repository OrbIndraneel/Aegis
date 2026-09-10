import {
  HazardZone,
  Shelter,
  EvacuationRoute,
  CascadePrediction,
  AuthorityStats,
  Coordinate,
  DisasterType,
  CivilianFieldReport,
  VulnerableVillage,
  VulnerableRoad,
  FieldReportStatus,
} from '../../types/disaster';
import { AlertMessage, AlertDispatchPayload } from '../../types/alert';
import {
  EAST_SIKKIM_HAZARDS,
  EAST_SIKKIM_SHELTERS,
  EAST_SIKKIM_EVACUATION_ROUTE,
  INITIAL_FIELD_REPORTS,
  VULNERABLE_VILLAGES,
  VULNERABLE_ROADS,
  MOCK_ALERTS,
  MOCK_AUTHORITY_STATS,
} from './mockData';

// In-memory reports store
let fieldReportsStore: CivilianFieldReport[] = [...INITIAL_FIELD_REPORTS];

// Zero latency response helper for immediate web and mobile loading
const delay = (_ms: number = 0) => Promise.resolve();

export class MockDisasterService {
  /**
   * Fetch active hazard zones by region (NER East Sikkim focus)
   */
  static async getHazards(region: string = 'East Sikkim'): Promise<HazardZone[]> {
    return EAST_SIKKIM_HAZARDS;
  }

  /**
   * Fetch nearby emergency shelters / staging camps
   */
  static async getShelters(region: string = 'East Sikkim'): Promise<Shelter[]> {
    return EAST_SIKKIM_SHELTERS;
  }

  /**
   * AI Dynamic Safest Evacuation Route calculation engine
   */
  static async calculateSafeRoute(
    origin: Coordinate,
    destinationShelterId?: string
  ): Promise<EvacuationRoute> {
    return EAST_SIKKIM_EVACUATION_ROUTE;
  }

  /**
   * AI Cascade & Secondary Hazard Predictor (For Authority Control Room)
   * Simulates AI predictions based on rainfall (mm/hr) & soil saturation (%)
   */
  static async predictCascadeScenario(
    rainfallMm: number,
    soilSaturationPercent: number = 90
  ): Promise<CascadePrediction> {
    await delay(450);

    const rockfallRisk = Math.min(100, Math.round((rainfallMm / 200) * 85 + (soilSaturationPercent / 100) * 15));
    const debrisFlowRisk = Math.min(100, Math.round((rainfallMm / 220) * 90 + (soilSaturationPercent / 100) * 10));
    const riverDammingRisk = Math.min(100, Math.round((rainfallMm / 250) * 75));

    return {
      id: `pred-casc-${Date.now()}`,
      primaryDisaster: {
        type: 'LANDSLIDE',
        triggerValue: `${rainfallMm}mm/hr Rain & ${soilSaturationPercent}% Soil Saturation`,
        location: 'East Sikkim NH-10 & Teesta River Basin Corridor',
      },
      confidenceScore: 94.6,
      predictedSecondaryHazards: [
        {
          id: 'sec-01',
          hazardName: 'Secondary Debris Cone Breach on NH-10 Lifeline',
          disasterType: 'LANDSLIDE',
          probability: debrisFlowRisk,
          estimatedTimeHours: 1.5,
          affectedSector: 'NH-10 Mile 20 to 24 Pass',
          severity: debrisFlowRisk > 80 ? 'CRITICAL' : 'HIGH',
          recommendedAction: 'Suspend all light & heavy vehicle movement; activate Upper Ridge diversion.',
        },
        {
          id: 'sec-02',
          hazardName: 'Teesta River Toe Erosion & Flash Riverbank Scour',
          disasterType: 'FLOOD',
          probability: riverDammingRisk,
          estimatedTimeHours: 3.0,
          affectedSector: 'Singtam Low-lying Riverfront',
          severity: riverDammingRisk > 75 ? 'HIGH' : 'MODERATE',
          recommendedAction: 'Preemptively evacuate riverside dwellings to Singtam Staging Camp.',
        },
        {
          id: 'sec-03',
          hazardName: 'High-Tension Transmission Tower Foundation Shear',
          disasterType: 'SLOPE_FAILURE',
          probability: rockfallRisk,
          estimatedTimeHours: 4.5,
          affectedSector: 'Rangpo Power Grid Spur 2',
          severity: 'HIGH',
          recommendedAction: 'Reroute grid power via Gangtok Substation loop; alert Power Dept inspection team.',
        },
      ],
      impactedInfrastructure: [
        { name: 'NH-10 Mountain Lifeline Corridor', type: 'HIGHWAY', riskLevel: debrisFlowRisk > 80 ? 'CRITICAL' : 'HIGH' },
        { name: 'Teesta River Safe Ridge Bridge', type: 'BRIDGE', riskLevel: riverDammingRisk > 75 ? 'HIGH' : 'MODERATE' },
        { name: 'Rangpo 132kV Power Grid Spur', type: 'POWER_GRID', riskLevel: rockfallRisk > 80 ? 'HIGH' : 'MODERATE' },
        { name: 'Singtam Valley Telecom Tower Node', type: 'COMMUNICATION_TOWER', riskLevel: 'MODERATE' },
      ],
      generatedTimestamp: new Date().toLocaleTimeString(),
    };
  }

  /**
   * Fetch active alerts stream
   */
  static async getAlerts(): Promise<AlertMessage[]> {
    await delay(150);
    return MOCK_ALERTS;
  }

  /**
   * Fetch Authority Dashboard Statistics
   */
  static async getAuthorityStats(): Promise<AuthorityStats> {
    await delay(200);
    return MOCK_AUTHORITY_STATS;
  }

  /**
   * Dispatch Emergency Broadcast Alert (Authority Control Room)
   */
  static async dispatchEmergencyAlert(payload: AlertDispatchPayload): Promise<AlertMessage> {
    await delay(350);
    const newAlert: AlertMessage = {
      id: `alt-${Date.now()}`,
      title: payload.title,
      body: payload.body,
      severity: payload.severity,
      disasterType: payload.disasterType,
      targetRegion: payload.targetRegion,
      issuedBy: 'MDoNER State Disaster Command (AEGIS)',
      issuedAt: 'Just now',
      actionRequired: payload.actionRequired,
      affectedPopulationEstimate: 14200,
      acknowledgmentRequired: payload.severity === 'CRITICAL',
    };
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
