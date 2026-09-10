export type HazardSeverity = 'LOW' | 'MODERATE' | 'HIGH' | 'CRITICAL';
export type WarningLevel = 'NOTICE' | 'WATCH' | 'WARNING';
export type HazardType = 'LANDSLIDE' | 'MUDSLIDE' | 'ROCKFALL' | 'SLOPE_FAILURE' | 'DEBRIS_FLOW' | 'FLOOD' | 'EXTREME_RAINFALL';
export type UserRole = 'CIVILIAN' | 'AUTHORITY';
export type ShelterStatus = 'OPEN' | 'FULL' | 'CLOSED' | 'COMPROMISED';
export type ShelterCapacityLevel = 'Available' | 'Limited' | 'Full';

export interface Coordinate {
  latitude: number;
  longitude: number;
}

export interface EmergencyContact {
  id: string;
  name: string;
  relation: string;
  phoneNumber: string;
  isPrimary: boolean;
}

export interface CivilianProfile {
  id: string;
  fullName: string;
  phoneNumber: string;
  language: 'EN' | 'HI' | 'GU';
  locationPermissionGranted: boolean;
  currentLocation?: Coordinate;
  selectedCity: string;
  medicalConditions?: string;
  bloodGroup?: string;
  emergencyContacts: EmergencyContact[];
  offlineModeEnabled: boolean;
  highContrastModeEnabled: boolean;
}

export interface AuthorityProfile {
  id: string;
  officialName: string;
  badgeId: string;
  designation: string;
  department: string;
  jurisdictionRegion: string;
  controlRoomPhone: string;
}

export interface User {
  id: string;
  role: UserRole;
  civilianProfile?: CivilianProfile;
  authorityProfile?: AuthorityProfile;
}

export interface Hazard {
  id: string;
  name: string;
  type: HazardType;
  severity: HazardSeverity;
  warningLevel?: WarningLevel;
  probability: number; // 0 - 100%
  riskScore: number; // 0 - 100
  affectedPopulation: number;
  coordinates: Coordinate[];
  center: Coordinate;
  radiusMeters?: number;
  description: string;
  predictedSurgeTimeMins?: number;
  roadClosuresCount: number;
  recommendedAction: string;
  lastUpdated: string;

  // SIH26001 Landslide-Specific Intelligence Attributes
  slopeAngleDegrees?: number;
  soilMoisturePercent?: number;
  rainfall24hMm?: number;
  rainfall72hMm?: number;
  historicalSusceptibility?: 'LOW' | 'MODERATE' | 'HIGH' | 'VERY_HIGH';
  modelConfidence?: number; // 0 - 100%
  dataFreshnessMinutes?: number;
  geologicalFormation?: string;
  vulnerableRoadSegments?: string[];
  vulnerableVillages?: string[];
}

export interface ShelterCapacity {
  totalCapacity: number;
  currentOccupancy: number;
  availableBeds: number;
  occupancyPercentage: number;
  level: ShelterCapacityLevel;
}

export interface Shelter {
  id: string;
  name: string;
  address: string;
  coordinate: Coordinate;
  capacity: ShelterCapacity;
  totalCapacity: number;
  currentOccupancy: number;
  status: ShelterStatus;
  distanceKm: number;
  amenities: {
    medicalKit: boolean;
    foodSupplies: boolean;
    cleanWater: boolean;
    powerGenerator: boolean;
    sanitation: boolean;
    petFriendly: boolean;
  };
  contactNumber: string;
  ndrfUnitId?: string;
  lastUpdated: string;
}

export interface RoadClosureMarker {
  id: string;
  name: string;
  coordinate: Coordinate;
  reason: string;
  severity: HazardSeverity;
}

export interface RouteSegment {
  id: string;
  instruction: string;
  distanceMeters: number;
  startCoordinate: Coordinate;
  endCoordinate: Coordinate;
  riskLevel: HazardSeverity;
  hazardWarning?: string;
  roadClosed: boolean;
}

export interface EvacuationRoute {
  id: string;
  name: string;
  origin: Coordinate;
  destinationShelterId: string;
  shelterName: string;
  polyline: Coordinate[];
  alternativePolyline?: Coordinate[];
  dangerousSegmentsPolyline?: Coordinate[];
  distanceKm: number;
  estimatedTimeMins: number;
  safetyScore: number; // 0 - 100%
  riskIndex: HazardSeverity;
  hazardExposureCount: number;
  roadClosuresCount: number;
  segments: RouteSegment[];
  avoidedHazards: string[];
  roadClosuresEnRoute: {
    locationName: string;
    coordinate: Coordinate;
    reason: string;
  }[];
  turnByTurnInstructions: {
    id: string;
    instruction: string;
    distanceMeters: number;
    hazardWarning?: string;
  }[];
}

export interface EmergencyAlert {
  id: string;
  title: string;
  body: string;
  severity: HazardSeverity;
  disasterType: HazardType;
  targetRegion: string;
  issuedBy: string;
  issuedAt: string;
  actionRequired: 'EVACUATE_IMMEDIATELY' | 'SEEK_HIGH_GROUND' | 'STAY_INDOORS' | 'PREPARE_KIT' | 'ADVISORY_ONLY';
  affectedPopulationEstimate?: number;
  acknowledgmentRequired?: boolean;
}

export type AlertMessage = EmergencyAlert;

export type IncidentStatus = 'Monitoring' | 'Warning' | 'Critical' | 'Evacuation' | 'Resolved';

export interface Incident {
  id: string;
  title: string;
  reportedBy: string;
  locationName: string;
  coordinate: Coordinate;
  severity: HazardSeverity;
  type: HazardType;
  status: IncidentStatus;
  affectedPopulation: number;
  startTime: string;
  predictedEscalation: string;
  timestamp: string;
  civilianPhone?: string;
  description: string;
}

export interface CascadePrediction {
  id: string;
  primaryDisaster: {
    type: HazardType;
    triggerValue: string;
    location: string;
  };
  predictedSecondaryHazards: {
    id: string;
    hazardName: string;
    disasterType: HazardType;
    probability: number;
    estimatedTimeHours: number;
    affectedSector: string;
    severity: HazardSeverity;
    recommendedAction: string;
  }[];
  confidenceScore: number;
  impactedInfrastructure: {
    name: string;
    type: 'BRIDGE' | 'HIGHWAY' | 'POWER_GRID' | 'DAM' | 'COMMUNICATION_TOWER';
    riskLevel: HazardSeverity;
  }[];
  generatedTimestamp: string;
}

export interface WeatherCondition {
  temperatureCelsius: number;
  rainfallMmPerHour: number;
  humidityPercentage: number;
  windSpeedKmh: number;
  visibilityKm: number;
  riverLevelMeters: number;
  dangerLevelMeters: number;
  warningStatus: string;
}

export interface AuthorityStatistics {
  activeDisastersCount: number;
  criticalHazardCount: number;
  totalAffectedPopulation: number;
  totalEvacuatedPopulation: number;
  sheltersOpenCount: number;
  totalShelterBeds: number;
  occupiedShelterBeds: number;
  ndrfTeamsDeployed: number;
  activeBroadcastAlerts: number;
  averageEpiScore?: number;
  vulnerableVillagesCount?: number;
  blockedHighwayMilesKm?: number;
}

// ============================================================
// SIH26001 EMERGENCY PRIORITISATION & FIELD REPORTING TYPES
// ============================================================

export interface EmergencyPriorityIndex {
  score: number; // 0 - 100 composite index
  level: 'LOW' | 'ELEVATED' | 'HIGH' | 'CRITICAL';
  factors: {
    hazardRiskScore: number;         // 0 - 100: Soil saturation, slope failure probability
    populationExposureScore: number; // 0 - 100: Vulnerable village inhabitants in path
    connectivityLossIndex: number;   // 0 - 100: Road cutoff severity & isolation index
    criticalInfraImpactScore: number;// 0 - 100: Lifeline bridges, power grids, communications
    urgencyScore: number;            // 0 - 100: Immediate slope collapse window
  };
  recommendedIntervention: string;
}

export type Severity = HazardSeverity;

export type FieldReportType =
  | 'LANDSLIDE'
  | 'MUDSLIDE'
  | 'SLOPE_MOVEMENT'
  | 'GROUND_CRACKS'
  | 'ROAD_BLOCK'
  | 'BLOCKED_ROAD'
  | 'DEBRIS_FLOW'
  | 'OTHER';

export type FieldReportStatus = 'QUEUED_OFFLINE' | 'SUBMITTED' | 'UNDER_REVIEW' | 'VERIFIED_BY_SDRF' | 'REJECTED';

export interface CivilianFieldReport {
  id: string;
  reportType: FieldReportType;
  type?: FieldReportType;
  title: string;
  description: string;
  coordinate: Coordinate;
  coordinates?: Coordinate;
  locationName: string;
  locality?: string;
  severity: HazardSeverity;
  photoUri?: string;
  photoUrl?: string;
  timestamp: number;
  createdAt?: string;
  formattedTime: string;
  status: FieldReportStatus;
  reportedBy: string;
  reporterName?: string;
  contactPhone?: string;
  reporterPhone?: string;
}

export interface VulnerableVillage {
  id: string;
  name: string;
  district: string;
  population: number;
  coordinate: Coordinate;
  riskLevel: HazardSeverity;
  slopeAngle: number;
  primaryRoadAccess: string;
  isIsolated: boolean;
  evacuationShelterId: string;
}

export interface VulnerableRoad {
  id: string;
  code: string; // e.g. 'NH-10', 'NH-29', 'NH-715A'
  corridorName: string;
  status: 'OPEN' | 'ONE_WAY_RESTRICTED' | 'HIGH_RISK_WATCH' | 'BLOCKED_IMPASSABLE';
  criticalPasses: string[];
  blockadeLengthKm?: number;
  alternativeBypass: string;
}

