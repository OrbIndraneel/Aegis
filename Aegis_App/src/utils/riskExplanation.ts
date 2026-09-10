import { Hazard, AlertMessage, Coordinate, RoadClosureMarker } from '../types';

export interface RiskFactor {
  id: string;
  iconName: string;
  label: string;
  detail: string;
  valueBadge?: string;
}

/**
 * Calculates straight-line distance in kilometers using the Haversine formula
 */
export function calculateDistanceKm(coord1: Coordinate, coord2: Coordinate): number {
  const R = 6371; // Radius of the Earth in km
  const dLat = ((coord2.latitude - coord1.latitude) * Math.PI) / 180;
  const dLon = ((coord2.longitude - coord1.longitude) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((coord1.latitude * Math.PI) / 180) *
      Math.cos((coord2.latitude * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return parseFloat((R * c).toFixed(2));
}

/**
 * Derives empirical, data-backed reasons why a user is at risk for a given landslide hazard zone
 */
export function getHazardRiskReasons(
  hazard: Hazard,
  userLocation?: Coordinate,
  roadClosures: RoadClosureMarker[] = []
): RiskFactor[] {
  const factors: RiskFactor[] = [];

  // 1. Proximity / Zone check
  if (userLocation) {
    const distKm = calculateDistanceKm(userLocation, hazard.center);
    const radiusKm = (hazard.radiusMeters || 1500) / 1000;
    if (distKm <= radiusKm) {
      factors.push({
        id: 'rf-zone-inside',
        iconName: 'MapPin',
        label: 'Inside Active Landslide Perimeter',
        detail: `Your location is ${distKm} km from slope failure epicentre (within ${radiusKm} km alert radius).`,
        valueBadge: 'CRITICAL PROXIMITY',
      });
    } else if (distKm <= radiusKm * 2) {
      factors.push({
        id: 'rf-zone-near',
        iconName: 'MapPin',
        label: 'Near Active Rockfall & Slope Zone',
        detail: `You are ${distKm} km from active slope displacement corridor (${hazard.name}).`,
        valueBadge: 'ADJACENT CORRIDOR',
      });
    }
  }

  // 2. Cumulative Precipitation & Rainfall Rate
  if (hazard.rainfall24hMm) {
    factors.push({
      id: 'rf-rainfall',
      iconName: 'CloudRain',
      label: 'Cumulative Monsoon Precipitation',
      detail: `24-Hour Cumulative: ${hazard.rainfall24hMm} mm${hazard.rainfall72hMm ? ` • 72-Hour: ${hazard.rainfall72hMm} mm` : ''}. Threshold exceeded for slope liquefaction.`,
      valueBadge: `${hazard.rainfall24hMm} mm / 24h`,
    });
  }

  // 3. Soil Moisture Saturation Level
  if (hazard.soilMoisturePercent) {
    factors.push({
      id: 'rf-soil',
      iconName: 'Waves',
      label: 'Soil Pore-Water Saturation',
      detail: `Subsurface soil moisture at ${hazard.soilMoisturePercent}% of saturation capacity. Drastic reduction in shear strength.`,
      valueBadge: `${hazard.soilMoisturePercent}% Saturation`,
    });
  }

  // 4. Slope Steepness & Mountain Terrain Gradient
  if (hazard.slopeAngleDegrees) {
    factors.push({
      id: 'rf-slope',
      iconName: 'Mountain',
      label: 'Steep Mountain Slope Gradient',
      detail: `Slope inclination measured at ${hazard.slopeAngleDegrees}° in ${hazard.geologicalFormation || 'Weathered Phyllite & Schist Formation'}. High gravity shear stress.`,
      valueBadge: `${hazard.slopeAngleDegrees}° Incline`,
    });
  }

  // 5. High Hazard Probability & Risk Estimation
  if (hazard.probability >= 70) {
    factors.push({
      id: 'rf-prob',
      iconName: 'AlertTriangle',
      label: 'Landslide Failure Probability',
      detail: `Model estimate: ${hazard.probability}% failure probability${hazard.modelConfidence ? ` with ${hazard.modelConfidence}% confidence score` : ''}.`,
      valueBadge: `${hazard.probability}% Probability`,
    });
  }

  // 6. Road Closures & Mountain Highway Blockades
  const closuresCount = hazard.roadClosuresCount || roadClosures.length;
  if (closuresCount > 0) {
    factors.push({
      id: 'rf-roads',
      iconName: 'OctagonAlert',
      label: 'Mountain Pass / Highway Closure',
      detail: `${closuresCount} highway link(s) impassable due to boulder fall and active slope debris.`,
      valueBadge: `${closuresCount} Blocked Pass(es)`,
    });
  }

  // 7. Data Freshness / Telemetry
  if (hazard.dataFreshnessMinutes !== undefined) {
    factors.push({
      id: 'rf-freshness',
      iconName: 'Clock',
      label: 'Telemetry Baseline Freshness',
      detail: `Regional baseline record synchronized ${hazard.dataFreshnessMinutes} minutes ago via MDoNER monitoring profile.`,
      valueBadge: `${hazard.dataFreshnessMinutes}m ago`,
    });
  }

  return factors;
}

/**
 * Derives risk reasons for an Emergency Alert Message
 */
export function getAlertRiskReasons(alert: AlertMessage, userLocation?: Coordinate): RiskFactor[] {
  const factors: RiskFactor[] = [];

  factors.push({
    id: 'rf-alt-target',
    iconName: 'MapPin',
    label: 'Target Mountain Sector',
    detail: `Issued specifically for ${alert.targetRegion}.`,
  });

  if (alert.severity === 'CRITICAL' || alert.severity === 'HIGH') {
    factors.push({
      id: 'rf-alt-sev',
      iconName: 'ShieldAlert',
      label: `${alert.severity} Directive Level`,
      detail: `Issued by ${alert.issuedBy}. Official mandate: ${alert.actionRequired?.replace(/_/g, ' ') || 'Immediate evacuation'}.`,
    });
  }

  if (alert.affectedPopulationEstimate) {
    factors.push({
      id: 'rf-alt-pop',
      iconName: 'Users',
      label: 'Exposed Population',
      detail: `Estimated ${alert.affectedPopulationEstimate.toLocaleString()} citizens in affected mountain corridor.`,
    });
  }

  return factors;
}
