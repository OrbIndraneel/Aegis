export type HazardSeverity = 'LOW' | 'MODERATE' | 'HIGH' | 'CRITICAL';
export type HazardType = 'FLOOD' | 'LANDSLIDE' | 'CYCLONE' | 'EARTHQUAKE' | 'WILDFIRE' | 'EXTREME_RAINFALL';
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
  selectedCity: 'Vadodara' | 'Uttarakhand' | 'Mumbai' | 'Ahmedabad';
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
  id?: string;
  name?: string;
  locationName?: string;
  coordinate: Coordinate;
  reason?: string;
  severity?: HazardSeverity;
  isPassable?: boolean;
}

export interface RouteSegment {
  id: string;
  instruction: string;
  distanceMeters: number;
  startCoordinate?: Coordinate;
  endCoordinate?: Coordinate;
  riskLevel?: HazardSeverity;
  hazardWarning?: string;
  roadClosed?: boolean;
}

export interface EvacuationRoute {
  id: string;
  name?: string;
  shelterId?: string;
  destinationShelterId?: string;
  shelterName?: string;
  origin?: Coordinate;
  totalDistanceMeters?: number;
  estimatedDurationMins?: number;
  distanceKm: number;
  estimatedTimeMins: number;
  safetyScore?: number;
  riskIndex: HazardSeverity;
  hazardExposureCount?: number;
  roadClosuresCount?: number;
  polyline: Coordinate[];
  alternativePolyline?: Coordinate[];
  dangerousSegmentsPolyline?: Coordinate[];
  segments?: RouteSegment[];
  avoidedHazards?: string[];
  turnByTurnInstructions: RouteSegment[];
  roadClosuresEnRoute: RoadClosureMarker[];
  safePassageProbability?: number;
  safeRouteName?: string;
  safeZoneDistanceKm?: number;
  safeZoneName?: string;
  isOfflineCached?: boolean;
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
}

export type TrackedRole = 'AMBULANCE' | 'RESCUE_BOAT' | 'NDRF_TRUCK' | 'CIVILIAN';
export type TrackedStatus = 'EN_ROUTE' | 'ON_SCENE' | 'EVACUATING' | 'STANDBY';

export interface TrackedUnit {
  unitId: string;
  name: string;
  role: TrackedRole;
  coordinate: Coordinate;
  heading?: number;
  speedKmH?: number;
  status: TrackedStatus;
  targetCivilianId?: string;
  targetLocation?: Coordinate;
  tracedPath?: Coordinate[];
  lastUpdated?: number;
}

export interface TelemetryPacket {
  type: 'LOCATION_UPDATE' | 'FLEET_SNAPSHOT' | 'PING' | 'PONG' | 'BEACON_BROADCAST' | 'BEACON_SNAPSHOT' | 'BEACON_UPDATE';
  unitId?: string;
  name?: string;
  role?: TrackedRole;
  coordinate?: Coordinate;
  heading?: number;
  speedKmH?: number;
  status?: TrackedStatus;
  targetCivilianId?: string;
  timestamp?: number;
  units?: TrackedUnit[];
  beacon?: RescueBeacon;
  beacons?: RescueBeacon[];
}

export type BeaconTriageLevel = 'CRITICAL_RED' | 'URGENT_YELLOW' | 'STABLE_GREEN';
export type BeaconProximityZone = 'IMMEDIATE' | 'NEAR' | 'FAR';

export interface RescueBeacon {
  beaconId: string;
  userId: string;
  fullName: string;
  bloodGroup?: string;
  triagePriority: BeaconTriageLevel;
  sosReason: string;
  medicalNotes?: string;
  coordinate: Coordinate;
  batteryLevel: number;
  signalStrengthDbm: number; // RSSI in dBm (-30 to -95)
  estimatedDistanceMeters: number;
  proximityZone: BeaconProximityZone;
  isActive: boolean;
  isTorchActive: boolean;
  isSirenActive: boolean;
  lastBroadcastTimestamp: number;
}

export interface TriVectorBeaconState {
  isActive: boolean;
  isTorchActive: boolean;
  isSirenActive: boolean;
  isVoiceActive: boolean;
  isMuted: boolean;
  operatingMode: 'TURBO_CRITICAL' | 'ENDURANCE_SAVER';
  beaconId: string;
  triagePriority: BeaconTriageLevel;
  broadcastIntervalMs: number;
  activeSeconds: number;
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
  code: string;
  corridorName: string;
  status: 'OPEN' | 'ONE_WAY_RESTRICTED' | 'HIGH_RISK_WATCH' | 'BLOCKED_IMPASSABLE';
  criticalPasses: string[];
  blockadeLengthKm?: number;
  alternativeBypass: string;
}
