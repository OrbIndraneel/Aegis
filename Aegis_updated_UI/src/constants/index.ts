export const EMERGENCY_HOTLINES = [
  { name: 'NDRF Disaster Helpline', number: '1078', desc: 'National Disaster Response Force' },
  { name: 'State Emergency Operation Center', number: '1070', desc: 'Sikkim SDMA Control Room' },
  { name: 'District Collector Helpline', number: '1077', desc: 'Gangtok & East Sikkim Collectorate' },
  { name: 'SDRF 2nd Mountain Battalion', number: '112', desc: 'State Disaster Response Force' },
  { name: 'BRO Project Swastik Helpline', number: '1033', desc: 'National Highways & Border Roads' },
  { name: 'Ambulance Medical Emergency', number: '108', desc: 'Emergency Mountain Trauma Response' },
  { name: 'Police Control Room', number: '100', desc: 'Law & Safety Control' },
];

export const IMD_WARNING_THRESHOLDS = {
  NOTICE_RAIN_24H_MM: 50,
  WATCH_RAIN_24H_MM: 100,
  WARNING_RAIN_24H_MM: 150,
  SOIL_SATURATION_CRITICAL_PERCENT: 85,
  SLOPE_CRITICAL_ANGLE_DEG: 38,
};

export const CITIES = ['East Sikkim', 'Gangtok', 'Rangpo', 'Singtam'] as const;
