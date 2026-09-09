import React, { useRef, useEffect, Component, ReactNode } from 'react';
import { View, StyleSheet, Text, TouchableOpacity } from 'react-native';
import MapView, { Polygon, Marker, Polyline, PROVIDER_DEFAULT } from 'react-native-maps';
import { Hazard, Shelter, EvacuationRoute, RoadClosureMarker, Coordinate } from '../../types';
import { colors, radius, spacing, typography, shadows } from '../../theme';
import { AlertTriangle, Home, MapPin, Navigation, ShieldAlert, Crosshair } from 'lucide-react-native';
import { HazardMap as WebFallbackMap } from './HazardMap.web';

interface Props {
  hazards: Hazard[];
  shelters: Shelter[];
  evacuationRoute?: EvacuationRoute | null;
  roadClosures?: RoadClosureMarker[];
  userLocation?: Coordinate | null;
  onSelectHazard?: (hazard: Hazard) => void;
  onSelectShelter?: (shelter: Shelter) => void;
  layers?: {
    hazards: boolean;
    shelters: boolean;
    routes: boolean;
    roadClosures: boolean;
  };
}

class MapErrorBoundary extends Component<{ children: ReactNode }, { hasError: boolean }> {
  state = { hasError: false };

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error: any) {
    console.warn('[HazardMap Native ErrorBoundary] Caught map crash:', error);
  }

  render() {
    if (this.state.hasError) {
      return <WebFallbackMap />;
    }
    return this.props.children;
  }
}

const isValidCoordinate = (coord?: Coordinate | null): coord is Coordinate => {
  return (
    coord != null &&
    typeof coord.latitude === 'number' &&
    !isNaN(coord.latitude) &&
    typeof coord.longitude === 'number' &&
    !isNaN(coord.longitude)
  );
};

export const HazardMap: React.FC<Props> = ({
  hazards = [],
  shelters = [],
  evacuationRoute,
  roadClosures = [],
  userLocation,
  onSelectHazard,
  onSelectShelter,
  layers = { hazards: true, shelters: true, routes: true, roadClosures: true },
}) => {
  const mapRef = useRef<MapView | null>(null);

  const initialRegion = {
    latitude: isValidCoordinate(userLocation) ? userLocation.latitude : 22.3072,
    longitude: isValidCoordinate(userLocation) ? userLocation.longitude : 73.1812,
    latitudeDelta: 0.08,
    longitudeDelta: 0.08,
  };

  useEffect(() => {
    if (isValidCoordinate(userLocation) && mapRef.current) {
      try {
        mapRef.current.animateToRegion(
          {
            latitude: userLocation.latitude,
            longitude: userLocation.longitude,
            latitudeDelta: 0.06,
            longitudeDelta: 0.06,
          },
          1000
        );
      } catch (e) {
        console.warn('Map animation failed:', e);
      }
    }
  }, [userLocation]);

  const getHazardFillColor = (severity: string) => {
    switch (severity) {
      case 'CRITICAL': return 'rgba(220, 38, 38, 0.45)';
      case 'HIGH': return 'rgba(239, 68, 68, 0.35)';
      case 'MODERATE': return 'rgba(245, 158, 11, 0.35)';
      default: return 'rgba(16, 185, 129, 0.3)';
    }
  };

  const getHazardStrokeColor = (severity: string) => {
    switch (severity) {
      case 'CRITICAL': return colors.severity.CRITICAL.main;
      case 'HIGH': return colors.severity.HIGH.main;
      case 'MODERATE': return colors.severity.MODERATE.main;
      default: return colors.status.success;
    }
  };

  return (
    <MapErrorBoundary>
      <View style={styles.container}>
        <MapView
          ref={mapRef}
          style={styles.map}
          provider={PROVIDER_DEFAULT}
          initialRegion={initialRegion}
          showsUserLocation={isValidCoordinate(userLocation)}
          showsMyLocationButton={false}
          showsCompass={false}
        >
          {/* 1. HAZARD POLYGONS */}
          {layers.hazards &&
            hazards.map((hazard) => {
              if (!hazard.coordinates || !Array.isArray(hazard.coordinates)) return null;
              const validCoords = hazard.coordinates.filter(isValidCoordinate);
              if (validCoords.length < 3) return null;
              return (
                <Polygon
                  key={hazard.id}
                  coordinates={validCoords}
                  fillColor={getHazardFillColor(hazard.severity)}
                  strokeColor={getHazardStrokeColor(hazard.severity)}
                  strokeWidth={2.5}
                  tappable={true}
                  onPress={() => onSelectHazard?.(hazard)}
                />
              );
            })}

          {/* 2. EVACUATION ROUTE POLYLINES */}
          {layers.routes && evacuationRoute?.polyline && (
            <>
              {Array.isArray(evacuationRoute.polyline) && (
                <Polyline
                  coordinates={evacuationRoute.polyline.filter(isValidCoordinate)}
                  strokeColor={colors.status.success}
                  strokeWidth={5}
                />
              )}
              {Array.isArray(evacuationRoute.alternativePolyline) && (
                <Polyline
                  coordinates={evacuationRoute.alternativePolyline.filter(isValidCoordinate)}
                  strokeColor={colors.primary.main}
                  strokeWidth={4}
                  lineDashPattern={[6, 4]}
                />
              )}
              {Array.isArray(evacuationRoute.dangerousSegmentsPolyline) && (
                <Polyline
                  coordinates={evacuationRoute.dangerousSegmentsPolyline.filter(isValidCoordinate)}
                  strokeColor={colors.severity.CRITICAL.main}
                  strokeWidth={4}
                  lineDashPattern={[4, 4]}
                />
              )}
            </>
          )}

          {/* 3. SHELTER MARKERS */}
          {layers.shelters &&
            shelters.map((shelter) => {
              if (!isValidCoordinate(shelter.coordinate)) return null;
              const occupancy = shelter.totalCapacity ? shelter.currentOccupancy / shelter.totalCapacity : 0;
              const badgeColor =
                occupancy >= 0.9
                  ? colors.severity.CRITICAL.main
                  : occupancy >= 0.7
                  ? colors.severity.MODERATE.main
                  : colors.status.success;

              return (
                <Marker
                  key={shelter.id}
                  coordinate={shelter.coordinate}
                  onPress={() => onSelectShelter?.(shelter)}
                  title={shelter.name}
                >
                  <View style={[styles.shelterPin, { borderColor: badgeColor }]}>
                    <Home size={14} color="#FFF" />
                  </View>
                </Marker>
              );
            })}

          {/* 4. ROAD CLOSURES */}
          {layers.roadClosures &&
            roadClosures.map((closure) => {
              if (!isValidCoordinate(closure.coordinate)) return null;
              return (
                <Marker key={closure.id} coordinate={closure.coordinate} title={closure.name}>
                  <View style={styles.roadClosurePin}>
                    <Text style={styles.closureText}>✕</Text>
                  </View>
                </Marker>
              );
            })}
        </MapView>
      </View>
    </MapErrorBoundary>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.primary,
  },
  map: {
    width: '100%',
    height: '100%',
  },
  shelterPin: {
    width: 32,
    height: 32,
    borderRadius: radius.full,
    backgroundColor: colors.background.secondary,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
    ...shadows.md,
  },
  roadClosurePin: {
    width: 24,
    height: 24,
    borderRadius: radius.xs,
    backgroundColor: colors.severity.CRITICAL.main,
    alignItems: 'center',
    justifyContent: 'center',
  },
  closureText: {
    color: '#FFF',
    fontWeight: typography.fontWeight.heavy,
    fontSize: 12,
  },
});
