import { Coordinate, HazardSeverity } from '../types';

/**
 * Calculate Haversine distance in km between two GPS coordinates
 */
export function calculateDistanceKm(coord1: Coordinate, coord2: Coordinate): number {
  const R = 6371; // Earth radius in km
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
 * Compute severity risk score from precipitation rate & river height
 */
export function computeRiskSeverity(rainfallMm: number, riverMeters: number): HazardSeverity {
  const score = (rainfallMm / 300) * 50 + (riverMeters / 4.0) * 50;
  if (score >= 75) return 'CRITICAL';
  if (score >= 50) return 'HIGH';
  if (score >= 25) return 'MODERATE';
  return 'LOW';
}
