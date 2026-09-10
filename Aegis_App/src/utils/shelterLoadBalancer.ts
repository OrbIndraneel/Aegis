import { Shelter, Coordinate } from '../types';
import { calculateDistanceKm } from './riskExplanation';

export interface LoadBalancedShelter extends Shelter {
  loadBalanceScore: number;
  recommendationReason: string;
  isLoadBalancedChoice: boolean;
}

/**
 * Ranks shelters based on a composite load-balancing score considering:
 * 1. Distance (km)
 * 2. Occupancy Percentage (%)
 * 3. Status ('OPEN' vs 'FULL'/'CLOSED')
 * 4. Availability Level ('Available' > 'Limited')
 *
 * Prevents disaster bottlenecking where evacuees all rush to the closest
 * shelter, causing severe overcrowding.
 */
export function getLoadBalancedShelterRecommendations(
  shelters: Shelter[],
  userLocation?: Coordinate
): LoadBalancedShelter[] {
  if (!shelters || shelters.length === 0) return [];

  const defaultUserLoc: Coordinate = { latitude: 22.3072, longitude: 73.1812 };
  const loc = userLocation || defaultUserLoc;

  const scoredShelters = shelters.map((shelter) => {
    const distKm = shelter.distanceKm ?? calculateDistanceKm(loc, shelter.coordinate);
    const occupancyPercent =
      shelter.capacity?.occupancyPercentage ??
      (shelter.totalCapacity > 0 ? Math.round((shelter.currentOccupancy / shelter.totalCapacity) * 100) : 100);

    // Distance weight: 1.5 per km
    const distanceCost = distKm * 1.5;

    // Occupancy weight: exponential penalty when > 70%, extreme penalty when > 90%
    let occupancyCost = occupancyPercent * 0.5;
    if (occupancyPercent >= 90) {
      occupancyCost += 150; // Severe crowding penalty
    } else if (occupancyPercent >= 75) {
      occupancyCost += 40; // Moderate crowding penalty
    }

    // Status penalty
    let statusCost = 0;
    if (shelter.status === 'FULL') statusCost += 300;
    if (shelter.status === 'CLOSED' || shelter.status === 'COMPROMISED') statusCost += 1000;

    const totalScore = distanceCost + occupancyCost + statusCost;

    // Build human-readable recommendation rationale
    let rationale = '';
    if (shelter.status !== 'OPEN') {
      rationale = `Status: ${shelter.status} • Cannot accept evacuees`;
    } else if (occupancyPercent < 60) {
      rationale = `Recommended: ${distKm} km • ${occupancyPercent}% occupied (High Bed Availability)`;
    } else if (occupancyPercent < 85) {
      rationale = `Moderate Load: ${distKm} km • ${occupancyPercent}% occupied (Limited Beds)`;
    } else {
      rationale = `Near Capacity: ${distKm} km • ${occupancyPercent}% occupied (Sub-optimal)`;
    }

    return {
      ...shelter,
      distanceKm: distKm,
      loadBalanceScore: parseFloat(totalScore.toFixed(2)),
      recommendationReason: rationale,
      isLoadBalancedChoice: false,
    };
  });

  // Sort by load balance score ascending (lowest score = best recommended shelter)
  scoredShelters.sort((a, b) => a.loadBalanceScore - b.loadBalanceScore);

  // Mark the top open shelter as the load balanced choice
  if (scoredShelters.length > 0 && scoredShelters[0].status === 'OPEN') {
    scoredShelters[0].isLoadBalancedChoice = true;
  }

  return scoredShelters;
}

/**
 * Returns the single top load-balanced recommended shelter
 */
export function getTopRecommendedShelter(
  shelters: Shelter[],
  userLocation?: Coordinate
): LoadBalancedShelter | null {
  const ranked = getLoadBalancedShelterRecommendations(shelters, userLocation);
  return ranked.find((s) => s.status === 'OPEN') || ranked[0] || null;
}
