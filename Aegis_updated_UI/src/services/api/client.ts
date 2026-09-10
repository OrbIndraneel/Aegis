import { MockDisasterService } from '../mock/mockDisasterService';
import {
  HazardZone,
  Shelter,
  EvacuationRoute,
  CascadePrediction,
  AuthorityStats,
  CivilianFieldReport,
  VulnerableVillage,
  VulnerableRoad,
  FieldReportStatus,
} from '../../types/disaster';
import { AlertMessage, AlertDispatchPayload } from '../../types/alert';

/**
 * Centralized API Service Abstraction Layer for AEGIS.
 * 
 * When backend integration is ready, replace MockDisasterService calls
 * inside this class with actual fetch/axios API calls matching MDoNER / PostGIS specifications.
 */
export class ApiClient {
  private static baseUrl = process.env.EXPO_PUBLIC_API_URL || 'https://api.example.com/v1';

  public static async fetchHazards(region: string = 'East Sikkim'): Promise<HazardZone[]> {
    return await MockDisasterService.getHazards(region);
  }

  public static async fetchShelters(region: string = 'East Sikkim'): Promise<Shelter[]> {
    return await MockDisasterService.getShelters(region);
  }

  public static async calculateRoute(
    origin: { latitude: number; longitude: number },
    shelterId?: string
  ): Promise<EvacuationRoute> {
    return await MockDisasterService.calculateSafeRoute(origin, shelterId);
  }

  public static async predictCascade(
    rainfallMm: number,
    soilSaturationPercent: number
  ): Promise<CascadePrediction> {
    return await MockDisasterService.predictCascadeScenario(rainfallMm, soilSaturationPercent);
  }

  public static async fetchAlerts(): Promise<AlertMessage[]> {
    return await MockDisasterService.getAlerts();
  }

  public static async fetchAuthorityStats(): Promise<AuthorityStats> {
    return await MockDisasterService.getAuthorityStats();
  }

  public static async dispatchAlert(payload: AlertDispatchPayload): Promise<AlertMessage> {
    return await MockDisasterService.dispatchEmergencyAlert(payload);
  }

  public static async fetchFieldReports(): Promise<CivilianFieldReport[]> {
    return await MockDisasterService.getFieldReports();
  }

  public static async submitFieldReport(
    report: Omit<CivilianFieldReport, 'id' | 'timestamp' | 'formattedTime' | 'status'>
  ): Promise<CivilianFieldReport> {
    return await MockDisasterService.submitFieldReport(report);
  }

  public static async updateFieldReportStatus(id: string, status: FieldReportStatus): Promise<void> {
    return await MockDisasterService.updateFieldReportStatus(id, status);
  }

  public static async fetchVulnerableVillages(): Promise<VulnerableVillage[]> {
    return await MockDisasterService.getVulnerableVillages();
  }

  public static async fetchVulnerableRoads(): Promise<VulnerableRoad[]> {
    return await MockDisasterService.getVulnerableRoads();
  }
}
