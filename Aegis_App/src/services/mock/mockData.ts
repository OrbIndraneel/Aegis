import { Hazard, Shelter, EvacuationRoute, CascadePrediction, AuthorityStatistics, RoadClosureMarker, Incident } from '../../types';
import { AlertMessage as AlertType } from '../../types/alert';

// ----------------------------------------------------
// VADODARA DEMO HAZARD DATASET (Multi-Hazard GIS)
// ----------------------------------------------------
export const VADODARA_HAZARDS: Hazard[] = [
  {
    id: 'hz-vad-01',
    name: 'Vishwamitri River Surge Overflow',
    type: 'FLOOD',
    severity: 'CRITICAL',
    probability: 95,
    riskScore: 92,
    affectedPopulation: 34500,
    center: { latitude: 22.3072, longitude: 73.1812 },
    coordinates: [
      { latitude: 22.3150, longitude: 73.1700 },
      { latitude: 22.3200, longitude: 73.1900 },
      { latitude: 22.3000, longitude: 73.2050 },
      { latitude: 22.2900, longitude: 73.1850 },
      { latitude: 22.3050, longitude: 73.1650 },
    ],
    radiusMeters: 1800,
    description: 'Vishwamitri river level crossed 26ft danger mark. Submerged Sayajigunj & Fatehgunj sectors. Extreme flood velocity.',
    predictedSurgeTimeMins: 25,
    roadClosuresCount: 4,
    recommendedAction: 'Immediate evacuation to elevated ground or Sama Indoor Stadium.',
    lastUpdated: '10 mins ago',
  },
  {
    id: 'hz-vad-02',
    name: 'Alkapuri Underpass Inundation',
    type: 'EXTREME_RAINFALL',
    severity: 'HIGH',
    probability: 88,
    riskScore: 78,
    affectedPopulation: 18200,
    center: { latitude: 22.3140, longitude: 73.1620 },
    coordinates: [
      { latitude: 22.3220, longitude: 73.1550 },
      { latitude: 22.3250, longitude: 73.1700 },
      { latitude: 22.3080, longitude: 73.1720 },
      { latitude: 22.3020, longitude: 73.1560 },
    ],
    radiusMeters: 1200,
    description: 'Waterlogging depth 3.5ft due to 220mm/hr precipitation. Station underpass sealed.',
    predictedSurgeTimeMins: 45,
    roadClosuresCount: 2,
    recommendedAction: 'Bypass Railway Station underpass via Alkapuri Flyover ramp.',
    lastUpdated: '15 mins ago',
  },
  {
    id: 'hz-vad-03',
    name: 'Manjalpur Substation Power Grid Fire Risk',
    type: 'WILDFIRE',
    severity: 'MODERATE',
    probability: 60,
    riskScore: 54,
    affectedPopulation: 12000,
    center: { latitude: 22.2750, longitude: 73.1920 },
    coordinates: [
      { latitude: 22.2820, longitude: 73.1850 },
      { latitude: 22.2850, longitude: 73.2000 },
      { latitude: 22.2680, longitude: 73.2020 },
      { latitude: 22.2650, longitude: 73.1860 },
    ],
    radiusMeters: 900,
    description: 'Transformer spark risk due to water inundation at electrical grid node.',
    predictedSurgeTimeMins: 90,
    roadClosuresCount: 1,
    recommendedAction: 'Power grid isolation active; avoid electrical poles.',
    lastUpdated: '30 mins ago',
  },
];

// ----------------------------------------------------
// UTTARAKHAND SCENARIO (Landslide & Soil Saturation)
// ----------------------------------------------------
export const UTTARAKHAND_SHELTERS: Shelter[] = [
  {
    id: 'sh-uk-01',
    name: 'Pipalkoti Disaster Staging & Transit Camp',
    address: 'NH-7 Highway Safe Ridge, Pipalkoti, Chamoli',
    coordinate: { latitude: 30.4300, longitude: 79.4300 },
    totalCapacity: 3000,
    currentOccupancy: 1400,
    capacity: {
      totalCapacity: 3000,
      currentOccupancy: 1400,
      availableBeds: 1600,
      occupancyPercentage: 46,
      level: 'Available',
    },
    status: 'OPEN',
    distanceKm: 12.5,
    amenities: {
      medicalKit: true,
      foodSupplies: true,
      cleanWater: true,
      powerGenerator: true,
      sanitation: true,
      petFriendly: true,
    },
    contactNumber: '+91 1372 252107',
    ndrfUnitId: 'NDRF-BN15-HILL',
    lastUpdated: '10 mins ago',
  },
];

export const UTTARAKHAND_HAZARDS: Hazard[] = [
  {
    id: 'hz-uk-01',
    name: 'Chamoli Badrinath NH-7 Mountain Debris Slope',
    type: 'LANDSLIDE',
    severity: 'CRITICAL',
    probability: 98,
    riskScore: 96,
    affectedPopulation: 6500,
    center: { latitude: 30.5400, longitude: 79.5200 },
    coordinates: [
      { latitude: 30.5500, longitude: 79.5100 },
      { latitude: 30.5550, longitude: 79.5300 },
      { latitude: 30.5300, longitude: 79.5350 },
      { latitude: 30.5250, longitude: 79.5150 },
    ],
    radiusMeters: 2500,
    description: 'Major rockfall & mudslide triggered by 280mm precipitation. Soil saturation 99%.',
    predictedSurgeTimeMins: 10,
    roadClosuresCount: 3,
    recommendedAction: 'Halt all vehicle movement along NH-7 slope. Divert to Pipalkoti Transit Ridge.',
    lastUpdated: 'Just now',
  },
];

// ----------------------------------------------------
// ROAD CLOSURES DATASET
// ----------------------------------------------------
export const VADODARA_ROAD_CLOSURES: RoadClosureMarker[] = [
  {
    id: 'rc-01',
    name: 'Vadodara Railway Station Underpass',
    coordinate: { latitude: 22.3100, longitude: 73.1830 },
    reason: '4.5ft Waterlogging - Sealed by Traffic Police',
    severity: 'CRITICAL',
  },
  {
    id: 'rc-02',
    name: 'Sayajigunj River Bridge Approach Ramps',
    coordinate: { latitude: 22.3160, longitude: 73.1790 },
    reason: 'Vishwamitri River Surge Overflow',
    severity: 'CRITICAL',
  },
];

// ----------------------------------------------------
// SHELTERS DATASET WITH CAPACITY LEVELS
// ----------------------------------------------------
export const VADODARA_SHELTERS: Shelter[] = [
  {
    id: 'sh-vad-01',
    name: 'MS University Sports Complex Shelter',
    address: 'Near Fatehgunj Flyover, Vadodara, Gujarat',
    coordinate: { latitude: 22.3210, longitude: 73.1880 },
    totalCapacity: 1200,
    currentOccupancy: 840,
    capacity: {
      totalCapacity: 1200,
      currentOccupancy: 840,
      availableBeds: 360,
      occupancyPercentage: 70,
      level: 'Limited',
    },
    status: 'OPEN',
    distanceKm: 1.4,
    amenities: {
      medicalKit: true,
      foodSupplies: true,
      cleanWater: true,
      powerGenerator: true,
      sanitation: true,
      petFriendly: true,
    },
    contactNumber: '+91 265 2795555',
    ndrfUnitId: 'NDRF-BN06-A',
    lastUpdated: '5 mins ago',
  },
  {
    id: 'sh-vad-02',
    name: 'Sama Indoor Sports Indoor Relief Camp',
    address: 'Sama Savli Road, Vadodara',
    coordinate: { latitude: 22.3380, longitude: 73.1960 },
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
      petFriendly: false,
    },
    contactNumber: '+91 265 2781100',
    ndrfUnitId: 'NDRF-BN06-B',
    lastUpdated: '12 mins ago',
  },
  {
    id: 'sh-vad-03',
    name: 'Navrachana High School Relief Center',
    address: 'Vasna-Bhayli Road, Vadodara',
    coordinate: { latitude: 22.2980, longitude: 73.1380 },
    totalCapacity: 800,
    currentOccupancy: 790,
    capacity: {
      totalCapacity: 800,
      currentOccupancy: 790,
      availableBeds: 10,
      occupancyPercentage: 99,
      level: 'Full',
    },
    status: 'FULL',
    distanceKm: 5.1,
    amenities: {
      medicalKit: true,
      foodSupplies: true,
      cleanWater: true,
      powerGenerator: false,
      sanitation: true,
      petFriendly: true,
    },
    contactNumber: '+91 265 2252444',
    lastUpdated: '20 mins ago',
  },
];

// ----------------------------------------------------
// FIELD INCIDENTS REPORTED TO CONTROL ROOM
// ----------------------------------------------------
export const MOCK_INCIDENTS: Incident[] = [
  {
    id: 'inc-01',
    title: 'Sayajigunj Residential Block Trapped Civilians',
    reportedBy: 'Civilian Distress Call (SOS-402)',
    locationName: 'Sayajigunj Sector 2, Vadodara',
    coordinate: { latitude: 22.3120, longitude: 73.1800 },
    severity: 'CRITICAL',
    type: 'FLOOD',
    status: 'Evacuation',
    affectedPopulation: 140,
    startTime: '10:15 AM',
    predictedEscalation: 'High risk of water level reaching 1st floor in 30 mins',
    timestamp: '15 mins ago',
    civilianPhone: '+91 00000 00002',
    description: 'Ground floor submerged. 14 residents including elderly need boat evacuation.',
  },
  {
    id: 'inc-02',
    title: 'Fatehgunj Flyover Lower Ramp Submerged Car',
    reportedBy: 'VMC Field Patrol Unit 4',
    locationName: 'Fatehgunj Junction, Vadodara',
    coordinate: { latitude: 22.3210, longitude: 73.1850 },
    severity: 'HIGH',
    type: 'FLOOD',
    status: 'Critical',
    affectedPopulation: 4,
    startTime: '10:45 AM',
    predictedEscalation: 'Vehicle stalling, NDRF team deployed with winch',
    timestamp: '25 mins ago',
    description: '2 vehicles trapped in 3.8ft water under flyover ramp.',
  },
  {
    id: 'inc-03',
    title: 'Chamoli Hillside Soil Saturation Rockfall Warning',
    reportedBy: 'Uttarakhand State Disaster Patrol',
    locationName: 'Badrinath National Highway NH-7',
    coordinate: { latitude: 30.5400, longitude: 79.5200 },
    severity: 'CRITICAL',
    type: 'LANDSLIDE',
    status: 'Warning',
    affectedPopulation: 6500,
    startTime: '09:30 AM',
    predictedEscalation: 'Full slope failure predicted if rain continues > 150mm/hr',
    timestamp: '40 mins ago',
    description: 'Loose boulders sliding down NH-7 corridor. Traffic diverted.',
  },
  {
    id: 'inc-04',
    title: 'Sama Substation Electrical Spark Advisory',
    reportedBy: 'GETCO Control Desk',
    locationName: 'Sama Savli Road Node',
    coordinate: { latitude: 22.3350, longitude: 73.1920 },
    severity: 'MODERATE',
    type: 'WILDFIRE',
    status: 'Monitoring',
    affectedPopulation: 1200,
    startTime: '08:00 AM',
    predictedEscalation: 'Substation auto-isolated; monitoring transformer temp',
    timestamp: '1 hour ago',
    description: 'Substation power grid isolated as precaution against storm surge.',
  },
];

// ----------------------------------------------------
// SAFEST & ALTERNATIVE EVACUATION ROUTES
// ----------------------------------------------------
export const VADODARA_EVACUATION_ROUTE: EvacuationRoute = {
  id: 'route-vad-safe-01',
  name: 'AI Dynamic Safe Route (Avoids Vishwamitri Surge)',
  origin: { latitude: 22.3072, longitude: 73.1812 },
  destinationShelterId: 'sh-vad-02',
  shelterName: 'Sama Indoor Sports Relief Camp',
  polyline: [
    { latitude: 22.3072, longitude: 73.1812 },
    { latitude: 22.3120, longitude: 73.1750 },
    { latitude: 22.3250, longitude: 73.1760 },
    { latitude: 22.3320, longitude: 73.1850 },
    { latitude: 22.3380, longitude: 73.1960 },
  ],
  alternativePolyline: [
    { latitude: 22.3072, longitude: 73.1812 },
    { latitude: 22.3010, longitude: 73.1650 },
    { latitude: 22.3200, longitude: 73.1600 },
    { latitude: 22.3380, longitude: 73.1960 },
  ],
  dangerousSegmentsPolyline: [
    { latitude: 22.3072, longitude: 73.1812 },
    { latitude: 22.3100, longitude: 73.1830 },
  ],
  distanceKm: 4.2,
  estimatedTimeMins: 14,
  safetyScore: 94,
  riskIndex: 'LOW',
  hazardExposureCount: 1,
  roadClosuresCount: 1,
  segments: [
    {
      id: 'seg-1',
      instruction: 'Head West on Race Course Road towards Alkapuri Overbridge',
      distanceMeters: 800,
      startCoordinate: { latitude: 22.3072, longitude: 73.1812 },
      endCoordinate: { latitude: 22.3120, longitude: 73.1750 },
      riskLevel: 'LOW',
      roadClosed: false,
    },
    {
      id: 'seg-2',
      instruction: 'Turn Right onto Elevated Flyover (Bypassing Station Waterlogging)',
      distanceMeters: 1400,
      startCoordinate: { latitude: 22.3120, longitude: 73.1750 },
      endCoordinate: { latitude: 22.3250, longitude: 73.1760 },
      riskLevel: 'MODERATE',
      hazardWarning: 'Avoid lower ramp; high water below',
      roadClosed: false,
    },
    {
      id: 'seg-3',
      instruction: 'Continue North straight onto Sama-Savli Highway Corridor',
      distanceMeters: 1500,
      startCoordinate: { latitude: 22.3250, longitude: 73.1760 },
      endCoordinate: { latitude: 22.3320, longitude: 73.1850 },
      riskLevel: 'LOW',
      roadClosed: false,
    },
  ],
  avoidedHazards: ['Vishwamitri River Surge Zone A', 'Fatehgunj Underpass Flood'],
  roadClosuresEnRoute: [
    {
      locationName: 'Station Underpass Road',
      coordinate: { latitude: 22.3100, longitude: 73.1830 },
      reason: '4.5ft Waterlogging - Sealed by Traffic Police',
    },
  ],
  turnByTurnInstructions: [
    { id: 't1', instruction: 'Head West on Race Course Road towards Alkapuri Overbridge', distanceMeters: 800 },
    { id: 't2', instruction: 'Turn Right onto Elevated Flyover (Bypassing Station Waterlogging)', distanceMeters: 1400, hazardWarning: 'Avoid lower ramp; high water below' },
    { id: 't3', instruction: 'Continue North straight onto Sama-Savli Highway Corridor', distanceMeters: 1500 },
    { id: 't4', instruction: 'Turn Right into Sama Indoor Stadium Entry Gate 2', distanceMeters: 500 },
  ],
};

export const MOCK_ALERTS: AlertType[] = [
  {
    id: 'alt-001',
    title: 'RED ALERT: Flash Evacuation Order for Vishwamitri Belt',
    body: 'GSDMA & Collector Vadodara mandate immediate evacuation for Sayajigunj, Fatehgunj, and Parshuram Nagar residents to Sama Relief Camp.',
    severity: 'CRITICAL',
    disasterType: 'FLOOD',
    targetRegion: 'Vadodara - Sectors 1 to 5',
    issuedBy: 'Gujarat State Disaster Management Authority (GSDMA)',
    issuedAt: '12 mins ago',
    actionRequired: 'EVACUATE_IMMEDIATELY',
    affectedPopulationEstimate: 34500,
    acknowledgmentRequired: true,
  },
];

export const MOCK_AUTHORITY_STATS: AuthorityStatistics = {
  activeDisastersCount: 3,
  criticalHazardCount: 2,
  totalAffectedPopulation: 64700,
  totalEvacuatedPopulation: 28400,
  sheltersOpenCount: 8,
  totalShelterBeds: 9500,
  occupiedShelterBeds: 5890,
  ndrfTeamsDeployed: 14,
  activeBroadcastAlerts: 4,
};
