import {
  Hazard,
  Shelter,
  EvacuationRoute,
  CascadePrediction,
  AuthorityStatistics,
  RoadClosureMarker,
  Incident,
  CivilianFieldReport,
  VulnerableVillage,
  VulnerableRoad,
  EmergencyPriorityIndex,
} from '../../types';
import { AlertMessage as AlertType } from '../../types/alert';

// ============================================================
// NER EAST SIKKIM / GANGTOK / NH-10 HAZARD DATASET (SIH26001)
// ============================================================

export const EAST_SIKKIM_HAZARDS: Hazard[] = [
  {
    id: 'hz-ner-01',
    name: 'NH-10 20th Mile Slope Failure & Debris Cone',
    type: 'LANDSLIDE',
    severity: 'CRITICAL',
    warningLevel: 'WARNING',
    probability: 96,
    riskScore: 94,
    affectedPopulation: 14200,
    center: { latitude: 27.2340, longitude: 88.5120 },
    coordinates: [
      { latitude: 27.2420, longitude: 88.5020 },
      { latitude: 27.2480, longitude: 88.5250 },
      { latitude: 27.2290, longitude: 88.5320 },
      { latitude: 27.2180, longitude: 88.5100 },
      { latitude: 27.2280, longitude: 88.4980 },
    ],
    radiusMeters: 2200,
    description: 'Critical slope destabilisation along NH-10 hill cut. High-intensity rainfall triggered 1,400m³ debris displacement blocking the Teesta road corridor. Active rockfall and mudflow impacting lifeline transit.',
    predictedSurgeTimeMins: 15,
    roadClosuresCount: 2,
    recommendedAction: 'Halt all transit on NH-10 20th Mile pass. Divert traffic via Upper Ridge Corridor to Singtam Staging Center.',
    lastUpdated: '5 mins ago',

    // Landslide Telemetry Signals
    slopeAngleDegrees: 48,
    soilMoisturePercent: 96,
    rainfall24hMm: 215,
    rainfall72hMm: 380,
    historicalSusceptibility: 'VERY_HIGH',
    modelConfidence: 94.6,
    dataFreshnessMinutes: 4,
    geologicalFormation: 'Daling Sequence Weathered Phyllite & Mica-Schist',
    vulnerableRoadSegments: ['NH-10 20th Mile Cut', 'Teesta Low-Level Link Road'],
    vulnerableVillages: ['Rangpo Basti', 'Singtam Riverside Hamlet'],
  },
  {
    id: 'hz-ner-02',
    name: 'Ranipool-Singtam Riverbank Scour & Rockfall',
    type: 'ROCKFALL',
    severity: 'HIGH',
    warningLevel: 'WATCH',
    probability: 82,
    riskScore: 78,
    affectedPopulation: 9800,
    center: { latitude: 27.2800, longitude: 88.5800 },
    coordinates: [
      { latitude: 27.2890, longitude: 88.5700 },
      { latitude: 27.2920, longitude: 88.5910 },
      { latitude: 27.2710, longitude: 88.5940 },
      { latitude: 27.2680, longitude: 88.5720 },
    ],
    radiusMeters: 1500,
    description: 'Toe erosion by swollen mountain stream combined with slope saturation. Loose boulders shedding onto Ranipool Bridge approach.',
    predictedSurgeTimeMins: 40,
    roadClosuresCount: 1,
    recommendedAction: 'Regulated one-way convoy only. Preemptively close if rainfall exceeds 25mm/hr.',
    lastUpdated: '12 mins ago',

    slopeAngleDegrees: 39,
    soilMoisturePercent: 84,
    rainfall24hMm: 168,
    rainfall72hMm: 290,
    historicalSusceptibility: 'HIGH',
    modelConfidence: 89.2,
    dataFreshnessMinutes: 8,
    geologicalFormation: 'Gneissic Colluvium & Fluvial Terraces',
    vulnerableRoadSegments: ['Ranipool Bridge Northern Approach'],
    vulnerableVillages: ['Lower Ranipool Settlement'],
  },
  {
    id: 'hz-ner-03',
    name: 'Upper Sichey Hillside Creep & Tension Cracks',
    type: 'SLOPE_FAILURE',
    severity: 'MODERATE',
    warningLevel: 'NOTICE',
    probability: 64,
    riskScore: 56,
    affectedPopulation: 6400,
    center: { latitude: 27.3320, longitude: 88.6080 },
    coordinates: [
      { latitude: 27.3400, longitude: 88.6000 },
      { latitude: 27.3420, longitude: 88.6200 },
      { latitude: 27.3250, longitude: 88.6220 },
      { latitude: 27.3220, longitude: 88.6020 },
    ],
    radiusMeters: 1100,
    description: 'Ground displacement sensors and community reports indicate widening tension cracks along uphill terraces. Retaining wall seepage observed.',
    predictedSurgeTimeMins: 120,
    roadClosuresCount: 0,
    recommendedAction: 'Civilian advisory: Inspect structural foundations, prepare emergency grab-kits, avoid terraced slope toes.',
    lastUpdated: '22 mins ago',

    slopeAngleDegrees: 28,
    soilMoisturePercent: 72,
    rainfall24hMm: 118,
    rainfall72hMm: 210,
    historicalSusceptibility: 'MODERATE',
    modelConfidence: 86.4,
    dataFreshnessMinutes: 15,
    geologicalFormation: 'Weathered Quartzite & Sandstone Matrix',
    vulnerableRoadSegments: ['Sichey Internal Access By-Road'],
    vulnerableVillages: ['Upper Sichey Community'],
  },
];


// ============================================================
// NER EMERGENCY STAGING SHELTERS & TRANSIT CAMPS
// ============================================================

export const EAST_SIKKIM_SHELTERS: Shelter[] = [
  {
    id: 'sh-ner-01',
    name: 'Singtam Community Relief Staging Complex',
    address: 'Singtam Bazar Elevated Safe Ridge, East Sikkim',
    coordinate: { latitude: 27.2380, longitude: 88.4980 },
    totalCapacity: 2500,
    currentOccupancy: 1100,
    capacity: {
      totalCapacity: 2500,
      currentOccupancy: 1100,
      availableBeds: 1400,
      occupancyPercentage: 44,
      level: 'Available',
    },
    status: 'OPEN',
    distanceKm: 3.8,
    amenities: {
      medicalKit: true,
      foodSupplies: true,
      cleanWater: true,
      powerGenerator: true,
      sanitation: true,
      petFriendly: true,
    },
    contactNumber: '+91 3592 231100',
    ndrfUnitId: 'SDRF-NER-BN02',
    lastUpdated: '5 mins ago',
  },
  {
    id: 'sh-ner-02',
    name: 'Gangtok Paljor Stadium Disaster Staging Facility',
    address: 'Paljor Stadium Ridge, Gangtok, East Sikkim',
    coordinate: { latitude: 27.3310, longitude: 88.6140 },
    totalCapacity: 3500,
    currentOccupancy: 2150,
    capacity: {
      totalCapacity: 3500,
      currentOccupancy: 2150,
      availableBeds: 1350,
      occupancyPercentage: 61,
      level: 'Limited',
    },
    status: 'OPEN',
    distanceKm: 8.4,
    amenities: {
      medicalKit: true,
      foodSupplies: true,
      cleanWater: true,
      powerGenerator: true,
      sanitation: true,
      petFriendly: false,
    },
    contactNumber: '+91 3592 202107',
    ndrfUnitId: 'NDRF-BN12-HILL',
    lastUpdated: '10 mins ago',
  },
  {
    id: 'sh-ner-03',
    name: 'Rangpo Transit Camp & Border Medical Post',
    address: 'Rangpo Plateau Staging Ground, East Sikkim',
    coordinate: { latitude: 27.1760, longitude: 88.5300 },
    totalCapacity: 1200,
    currentOccupancy: 1180,
    capacity: {
      totalCapacity: 1200,
      currentOccupancy: 1180,
      availableBeds: 20,
      occupancyPercentage: 98,
      level: 'Full',
    },
    status: 'FULL',
    distanceKm: 6.2,
    amenities: {
      medicalKit: true,
      foodSupplies: true,
      cleanWater: true,
      powerGenerator: true,
      sanitation: true,
      petFriendly: true,
    },
    contactNumber: '+91 3592 240215',
    ndrfUnitId: 'SDRF-NER-BN01',
    lastUpdated: '18 mins ago',
  },
];


// ============================================================
// MOUNTAIN ROAD CLOSURES & PASS BLOCKADES
// ============================================================

export const NER_ROAD_CLOSURES: RoadClosureMarker[] = [
  {
    id: 'rc-ner-01',
    name: 'NH-10 20th Mile Pass (Teesta Valley Corridor)',
    coordinate: { latitude: 27.2340, longitude: 88.5120 },
    reason: 'Active Debris Flow & Boulder Blockade — Sealed by BRO',
    severity: 'CRITICAL',
  },
  {
    id: 'rc-ner-02',
    name: 'Singtam Riverbank Low-Level Approach Road',
    coordinate: { latitude: 27.2410, longitude: 88.5040 },
    reason: 'River Swell & Toe Scour Undercutting Road Shoulder',
    severity: 'HIGH',
  },
];


// ============================================================
// VULNERABLE VILLAGES & MOUNTAIN SETTLEMENTS (SIH26001)
// ============================================================

export const VULNERABLE_VILLAGES: VulnerableVillage[] = [
  {
    id: 'vil-01',
    name: 'Rangpo Basti',
    district: 'East Sikkim',
    population: 3400,
    coordinate: { latitude: 27.2180, longitude: 88.5100 },
    riskLevel: 'CRITICAL',
    slopeAngle: 46,
    primaryRoadAccess: 'NH-10 Link',
    isIsolated: true,
    evacuationShelterId: 'sh-ner-01',
  },
  {
    id: 'vil-02',
    name: 'Singtam Riverside Hamlet',
    district: 'East Sikkim',
    population: 4800,
    coordinate: { latitude: 27.2390, longitude: 88.5010 },
    riskLevel: 'HIGH',
    slopeAngle: 37,
    primaryRoadAccess: 'Singtam Valley Link',
    isIsolated: false,
    evacuationShelterId: 'sh-ner-01',
  },
  {
    id: 'vil-03',
    name: 'Dikchu Valley Settlement',
    district: 'East Sikkim',
    population: 2100,
    coordinate: { latitude: 27.3680, longitude: 88.5200 },
    riskLevel: 'HIGH',
    slopeAngle: 42,
    primaryRoadAccess: 'North Sikkim Highway',
    isIsolated: true,
    evacuationShelterId: 'sh-ner-02',
  },
  {
    id: 'vil-04',
    name: 'Upper Sichey Hillside',
    district: 'East Sikkim',
    population: 5600,
    coordinate: { latitude: 27.3320, longitude: 88.6080 },
    riskLevel: 'MODERATE',
    slopeAngle: 28,
    primaryRoadAccess: 'Gangtok West Road',
    isIsolated: false,
    evacuationShelterId: 'sh-ner-02',
  },
];

// ============================================================
// VULNERABLE ROADS & HIGHWAY ARTERIES
// ============================================================

export const VULNERABLE_ROADS: VulnerableRoad[] = [
  {
    id: 'road-01',
    code: 'NH-10',
    corridorName: 'Sikkim Lifeline Highway (Siliguri - Gangtok)',
    status: 'BLOCKED_IMPASSABLE',
    criticalPasses: ['20th Mile', '29th Mile', 'Baluwakhani'],
    blockadeLengthKm: 4.8,
    alternativeBypass: 'Upper Ridge Mountain By-Pass via Singtam Ridge',
  },
  {
    id: 'road-02',
    code: 'Singtam-Dikchu Link',
    corridorName: 'Teesta Hydro & Valley Arterial',
    status: 'ONE_WAY_RESTRICTED',
    criticalPasses: ['Dikchu Gorge Cut'],
    blockadeLengthKm: 1.2,
    alternativeBypass: 'Mangan Northern Ridge Road',
  },
  {
    id: 'road-03',
    code: 'Ranipool-Gangtok Corridor',
    corridorName: 'East Sikkim Central Approach',
    status: 'HIGH_RISK_WATCH',
    criticalPasses: ['Ranipool Bridge Ramp'],
    alternativeBypass: 'Tadong Overhead Bypass Road',
  },
];

// ============================================================
// EMERGENCY PRIORITY INDEX (EPI) BREAKDOWN
// ============================================================

export const MOCK_EPI_ZONES: { zoneName: string; epi: EmergencyPriorityIndex }[] = [
  {
    zoneName: 'NH-10 20th Mile / Rangpo Basti Sector',
    epi: {
      score: 91,
      level: 'CRITICAL',
      factors: {
        hazardRiskScore: 96,
        populationExposureScore: 88,
        connectivityLossIndex: 94,
        criticalInfraImpactScore: 92,
        urgencyScore: 86,
      },
      recommendedIntervention: 'Immediate mountain SDRF air & foot deployment; enforce strict barrier at 20th Mile cut.',
    },
  },
  {
    zoneName: 'Singtam Riverside Basin',
    epi: {
      score: 76,
      level: 'HIGH',
      factors: {
        hazardRiskScore: 82,
        populationExposureScore: 78,
        connectivityLossIndex: 70,
        criticalInfraImpactScore: 75,
        urgencyScore: 74,
      },
      recommendedIntervention: 'Preposition water tankers and emergency rations at Singtam Community Center.',
    },
  },
  {
    zoneName: 'Upper Sichey Hillside Cluster',
    epi: {
      score: 58,
      level: 'ELEVATED',
      factors: {
        hazardRiskScore: 64,
        populationExposureScore: 60,
        connectivityLossIndex: 52,
        criticalInfraImpactScore: 54,
        urgencyScore: 60,
      },
      recommendedIntervention: 'Community advisory broadcast and daily ground displacement survey.',
    },
  },
];

// ============================================================
// CIVILIAN FIELD REPORTS STREAM (SIH26001)
// ============================================================

export const INITIAL_FIELD_REPORTS: CivilianFieldReport[] = [
  {
    id: 'fr-001',
    reportType: 'GROUND_CRACKS',
    title: 'Longitudinal Tension Cracks along Hill Cut',
    description: 'Ground fracture ~4 inches wide opened behind Rangpo Upper School hillside terrace. Retaining wall showing visible tilt.',
    coordinate: { latitude: 27.2210, longitude: 88.5140 },
    locationName: 'Rangpo Basti Upper Slope',
    severity: 'HIGH',
    timestamp: Date.now() - 18 * 60 * 1000,
    formattedTime: '18 mins ago',
    status: 'VERIFIED_BY_SDRF',
    reportedBy: 'Tenzing Norbu (Local Resident)',
    contactPhone: '+91 98000 12345',
  },
  {
    id: 'fr-002',
    reportType: 'BLOCKED_ROAD',
    title: 'Rockfall Boulders blocking NH-10 KM 22',
    description: 'Three large boulders cascaded onto highway carriageway. Light vehicles halted; power lines tangled on slope.',
    coordinate: { latitude: 27.2340, longitude: 88.5120 },
    locationName: 'NH-10 20th Mile Pass',
    severity: 'CRITICAL',
    timestamp: Date.now() - 32 * 60 * 1000,
    formattedTime: '32 mins ago',
    status: 'UNDER_REVIEW',
    reportedBy: 'BRO Patrol Unit 4',
    contactPhone: '+91 3592 231011',
  },
  {
    id: 'fr-003',
    reportType: 'SLOPE_MOVEMENT',
    title: 'Mud slurry and soil creep near Singtam',
    description: 'Continuous slurry flow across culvert drain. Drainage blocked, overland water cutting road edge.',
    coordinate: { latitude: 27.2420, longitude: 88.5020 },
    locationName: 'Singtam Valley Lower Cut',
    severity: 'MODERATE',
    timestamp: Date.now() - 55 * 60 * 1000,
    formattedTime: '55 mins ago',
    status: 'SUBMITTED',
    reportedBy: 'Suman Rai (Citizen Observer)',
  },
];

// ============================================================
// FIELD INCIDENTS REPORTED TO CONTROL ROOM
// ============================================================

export const MOCK_INCIDENTS: Incident[] = [
  {
    id: 'inc-01',
    title: 'NH-10 20th Mile Active Slope Failure & Vehicle Blockade',
    reportedBy: 'BRO Mountain Patrol & Citizen Distress',
    locationName: 'NH-10 KM 20, East Sikkim',
    coordinate: { latitude: 27.2340, longitude: 88.5120 },
    severity: 'CRITICAL',
    type: 'LANDSLIDE',
    status: 'Evacuation',
    affectedPopulation: 140,
    startTime: '10:15 AM',
    predictedEscalation: 'High risk of further slope displacement if rain continues > 15mm/hr',
    timestamp: '15 mins ago',
    civilianPhone: '+91 98000 11111',
    description: '14 vehicles halted before debris cone. SDRF mountain rescue deploying to assist 45 stranded passengers.',
  },
  {
    id: 'inc-02',
    title: 'Rangpo Basti Hillside Tension Crack Expansion',
    reportedBy: 'Field Observation Report (FR-001)',
    locationName: 'Rangpo Basti Upper Slope',
    coordinate: { latitude: 27.2210, longitude: 88.5140 },
    severity: 'HIGH',
    type: 'SLOPE_FAILURE',
    status: 'Warning',
    affectedPopulation: 340,
    startTime: '10:45 AM',
    predictedEscalation: 'Soil saturation at 96%; prompt evacuation to Singtam Staging advised',
    timestamp: '25 mins ago',
    description: 'Ground cracks widening. 8 households along slope edge pre-emptively relocated.',
  },
  {
    id: 'inc-03',
    title: 'Ranipool Bridge Northern Approach Boulder Shedding',
    reportedBy: 'Sikkim Traffic Police Control',
    locationName: 'Ranipool River Corridor',
    coordinate: { latitude: 27.2800, longitude: 88.5800 },
    severity: 'HIGH',
    type: 'ROCKFALL',
    status: 'Critical',
    affectedPopulation: 650,
    startTime: '09:30 AM',
    predictedEscalation: 'One-way regulated convoy active; monitoring boulder roll trajectory',
    timestamp: '40 mins ago',
    description: 'Loose boulders sliding down steep gorge face. Safety netting partially damaged.',
  },
  {
    id: 'inc-04',
    title: 'Upper Sichey Retaining Wall Drainage Saturation',
    reportedBy: 'Gangtok Municipal Disaster Ward Officer',
    locationName: 'Upper Sichey Community Ridge',
    coordinate: { latitude: 27.3320, longitude: 88.6080 },
    severity: 'MODERATE',
    type: 'SLOPE_FAILURE',
    status: 'Monitoring',
    affectedPopulation: 120,
    startTime: '08:00 AM',
    predictedEscalation: 'Soil moisture 72%; weep holes functioning, no rapid sliding detected',
    timestamp: '1 hour ago',
    description: 'Precautionary monitoring of residential hill cut behind community hall.',
  },
];

// ============================================================
// DYNAMIC SAFER ROUTE (AVOIDING LANDSLIDE CORRIDORS)
// ============================================================

export const EAST_SIKKIM_EVACUATION_ROUTE: EvacuationRoute = {
  id: 'route-ner-safe-01',
  name: 'AI Dynamic Safe Mountain Corridor (Bypasses NH-10 Rockfall)',
  origin: { latitude: 27.2280, longitude: 88.5200 },
  destinationShelterId: 'sh-ner-01',
  shelterName: 'Singtam Community Relief Staging Complex',
  polyline: [
    { latitude: 27.2280, longitude: 88.5200 },
    { latitude: 27.2310, longitude: 88.5160 },
    { latitude: 27.2350, longitude: 88.5080 },
    { latitude: 27.2370, longitude: 88.5020 },
    { latitude: 27.2380, longitude: 88.4980 },
  ],
  alternativePolyline: [
    { latitude: 27.2280, longitude: 88.5200 },
    { latitude: 27.2240, longitude: 88.5080 },
    { latitude: 27.2320, longitude: 88.4990 },
    { latitude: 27.2380, longitude: 88.4980 },
  ],
  dangerousSegmentsPolyline: [
    { latitude: 27.2340, longitude: 88.5120 },
    { latitude: 27.2370, longitude: 88.5140 },
  ],
  distanceKm: 5.4,
  estimatedTimeMins: 18,
  safetyScore: 94,
  riskIndex: 'LOW',
  hazardExposureCount: 1,
  roadClosuresCount: 1,
  segments: [
    {
      id: 'seg-1',
      instruction: 'Head North-West along Rangpo Ridge Road away from river cut',
      distanceMeters: 950,
      startCoordinate: { latitude: 27.2280, longitude: 88.5200 },
      endCoordinate: { latitude: 27.2310, longitude: 88.5160 },
      riskLevel: 'LOW',
      roadClosed: false,
    },
    {
      id: 'seg-2',
      instruction: 'Turn Left onto Upper Ridge Safe Bypass (Completely avoids NH-10 20th Mile rockfall debris)',
      distanceMeters: 2100,
      startCoordinate: { latitude: 27.2310, longitude: 88.5160 },
      endCoordinate: { latitude: 27.2350, longitude: 88.5080 },
      riskLevel: 'MODERATE',
      hazardWarning: 'Stable bedrock corridor; maintain steady mountain speed < 25 km/h',
      roadClosed: false,
    },
    {
      id: 'seg-3',
      instruction: 'Descend gently onto Singtam High Plateau Approach',
      distanceMeters: 1850,
      startCoordinate: { latitude: 27.2350, longitude: 88.5080 },
      endCoordinate: { latitude: 27.2370, longitude: 88.5020 },
      riskLevel: 'LOW',
      roadClosed: false,
    },
    {
      id: 'seg-4',
      instruction: 'Arrive safely at Singtam Community Relief Staging Complex Gate 1',
      distanceMeters: 500,
      startCoordinate: { latitude: 27.2370, longitude: 88.5020 },
      endCoordinate: { latitude: 27.2380, longitude: 88.4980 },
      riskLevel: 'LOW',
      roadClosed: false,
    },
  ],
  avoidedHazards: ['NH-10 20th Mile Active Debris Cone', 'Teesta Low-Level River Scour'],
  roadClosuresEnRoute: [
    {
      locationName: 'NH-10 20th Mile Mountain Pass',
      coordinate: { latitude: 27.2340, longitude: 88.5120 },
      reason: '1,400m³ Active Debris Flow & Boulder Blockade',
    },
  ],
  turnByTurnInstructions: [
    { id: 't1', instruction: 'Head North-West along Rangpo Ridge Road away from river cut', distanceMeters: 950 },
    { id: 't2', instruction: 'Turn Left onto Upper Ridge Safe Bypass (Completely avoids NH-10 20th Mile rockfall debris)', distanceMeters: 2100, hazardWarning: 'Stable bedrock corridor; maintain steady mountain speed < 25 km/h' },
    { id: 't3', instruction: 'Descend gently onto Singtam High Plateau Approach', distanceMeters: 1850 },
    { id: 't4', instruction: 'Arrive safely at Singtam Community Relief Staging Complex Gate 1', distanceMeters: 500 },
  ],
};


// ============================================================
// EMERGENCY ALERTS STREAM (MDoNER & SDMA ISSUED)
// ============================================================

export const MOCK_ALERTS: AlertType[] = [
  {
    id: 'alt-ner-001',
    title: 'RED ALERT: Landslide & Slope Evacuation Order (NH-10 20th Mile)',
    body: 'MDoNER & Sikkim State Disaster Management Authority mandate immediate evacuation of settlements along the 20th Mile to Singtam Relief Staging Ground.',
    severity: 'CRITICAL',
    disasterType: 'LANDSLIDE',
    targetRegion: 'East Sikkim - NH-10 Corridor & Rangpo Basti',
    issuedBy: 'Sikkim State Disaster Management Authority (SSDMA) & MDoNER',
    issuedAt: '8 mins ago',
    actionRequired: 'EVACUATE_IMMEDIATELY',
    affectedPopulationEstimate: 14200,
    acknowledgmentRequired: true,
  },
  {
    id: 'alt-ner-002',
    title: 'ORANGE WATCH: High Precipitation & Rockfall Advisory',
    body: 'Continuous 180mm rain recorded. BRO teams deployed along Ranipool-Singtam route. Heavy freight vehicle movement strictly suspended.',
    severity: 'HIGH',
    disasterType: 'ROCKFALL',
    targetRegion: 'East Sikkim - Ranipool Gorge Sector',
    issuedBy: 'Border Roads Organisation (Project Swastik)',
    issuedAt: '35 mins ago',
    actionRequired: 'SEEK_HIGH_GROUND',
    affectedPopulationEstimate: 9800,
    acknowledgmentRequired: false,
  },
];

// ============================================================
// AUTHORITY DASHBOARD STATISTICS (SIH26001 MDoNER CONTROL ROOM)
// ============================================================

export const MOCK_AUTHORITY_STATS: AuthorityStatistics = {
  activeDisastersCount: 3,
  criticalHazardCount: 1,
  totalAffectedPopulation: 30400,
  totalEvacuatedPopulation: 11200,
  sheltersOpenCount: 6,
  totalShelterBeds: 7200,
  occupiedShelterBeds: 4430,
  ndrfTeamsDeployed: 8,
  activeBroadcastAlerts: 2,
  averageEpiScore: 78,
  vulnerableVillagesCount: 4,
  blockedHighwayMilesKm: 4.8,
};
