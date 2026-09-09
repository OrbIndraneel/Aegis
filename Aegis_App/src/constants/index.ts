export const EMERGENCY_HOTLINES = [
  { name: 'NDRF Disaster Helpline', number: '1078', desc: 'National Disaster Response Force' },
  { name: 'State Emergency Operation Center', number: '1070', desc: 'Gujarat SDMA Control Room' },
  { name: 'District Collector Helpline', number: '1077', desc: 'Vadodara Collectorate' },
  { name: 'Ambulance Medical Emergency', number: '108', desc: 'Emergency Trauma Response' },
  { name: 'Police Control Room', number: '100', desc: 'Law & Safety Control' },
  { name: 'Fire Emergency', number: '101', desc: 'Fire & Rescue Services' },
];

export const IMD_WARNING_THRESHOLDS = {
  HEAVY_RAIN_MM_HR: 100,
  VERY_HEAVY_RAIN_MM_HR: 180,
  EXTREME_RAIN_MM_HR: 250,
  VISHWAMITRI_DANGER_LEVEL_FEET: 26,
  VISHWAMITRI_WARNING_LEVEL_FEET: 20,
};

export const CITIES = ['Vadodara', 'Uttarakhand', 'Mumbai', 'Ahmedabad'] as const;
