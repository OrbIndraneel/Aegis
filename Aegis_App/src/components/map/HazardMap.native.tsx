import React, { useRef, useEffect, Component, ReactNode } from 'react';
import { View, StyleSheet, Text, Platform } from 'react-native';
import MapView, { Polygon, Marker, Polyline, UrlTile, PROVIDER_GOOGLE, PROVIDER_DEFAULT } from 'react-native-maps';
import { Hazard, Shelter, EvacuationRoute, RoadClosureMarker, Coordinate, TrackedUnit } from '../../types';
import { colors, radius, spacing, typography, shadows } from '../../theme';
import { AlertTriangle, Home, MapPin, Navigation, ShieldAlert, Crosshair, HeartPulse, Truck, User } from 'lucide-react-native';
import { HazardMap as WebFallbackMap } from './HazardMap.web';

interface Props {
  hazards?: Hazard[];
  shelters?: Shelter[];
  evacuationRoute?: EvacuationRoute | null;
  tracedPath?: Coordinate[];
  activeCorridorPolyline?: Coordinate[];
  trackedUnits?: TrackedUnit[];
  roadClosures?: RoadClosureMarker[];
  userLocation?: Coordinate | null;
  onSelectHazard?: (hazard: Hazard) => void;
  onSelectShelter?: (shelter: Shelter) => void;
  onSelectUnit?: (unit: TrackedUnit) => void;
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

const DARK_MAP_STYLE = [
  { elementType: 'geometry', stylers: [{ color: '#1d2c4d' }] },
  { elementType: 'labels.text.fill', stylers: [{ color: '#8ec3b9' }] },
  { elementType: 'labels.text.stroke', stylers: [{ color: '#1a3646' }] },
  { featureType: 'administrative.country', elementType: 'geometry.stroke', stylers: [{ color: '#4b6878' }] },
  { featureType: 'administrative.land_parcel', elementType: 'labels.text.fill', stylers: [{ color: '#64779e' }] },
  { featureType: 'administrative.province', elementType: 'geometry.stroke', stylers: [{ color: '#4b6878' }] },
  { featureType: 'landscape.man_made', elementType: 'geometry.stroke', stylers: [{ color: '#334e87' }] },
  { featureType: 'landscape.natural', elementType: 'geometry', stylers: [{ color: '#023e58' }] },
  { featureType: 'poi', elementType: 'geometry', stylers: [{ color: '#283d6a' }] },
  { featureType: 'poi', elementType: 'labels.text.fill', stylers: [{ color: '#6f9ba5' }] },
  { featureType: 'poi', elementType: 'labels.text.stroke', stylers: [{ color: '#1d2c4d' }] },
  { featureType: 'poi.park', elementType: 'geometry.fill', stylers: [{ color: '#023e58' }] },
  { featureType: 'poi.park', elementType: 'labels.text.fill', stylers: [{ color: '#3C7680' }] },
  { featureType: 'road', elementType: 'geometry', stylers: [{ color: '#304a7d' }] },
  { featureType: 'road', elementType: 'labels.text.fill', stylers: [{ color: '#98a5be' }] },
  { featureType: 'road', elementType: 'labels.text.stroke', stylers: [{ color: '#1d2c4d' }] },
  { featureType: 'road.highway', elementType: 'geometry', stylers: [{ color: '#2c6675' }] },
  { featureType: 'road.highway', elementType: 'geometry.stroke', stylers: [{ color: '#255763' }] },
  { featureType: 'road.highway', elementType: 'labels.text.fill', stylers: [{ color: '#b0d5ce' }] },
  { featureType: 'road.highway', elementType: 'labels.text.stroke', stylers: [{ color: '#023e58' }] },
  { featureType: 'transit', elementType: 'labels.text.fill', stylers: [{ color: '#98a5be' }] },
  { featureType: 'transit', elementType: 'labels.text.stroke', stylers: [{ color: '#1d2c4d' }] },
  { featureType: 'transit.line', elementType: 'geometry.fill', stylers: [{ color: '#283d6a' }] },
  { featureType: 'transit.station', elementType: 'geometry', stylers: [{ color: '#3a4762' }] },
  { featureType: 'water', elementType: 'geometry', stylers: [{ color: '#0e1626' }] },
  { featureType: 'water', elementType: 'labels.text.fill', stylers: [{ color: '#4e6d70' }] },
];

export const HazardMap: React.FC<Props> = ({
  hazards = [],
  shelters = [],
  evacuationRoute,
  tracedPath = [],
  activeCorridorPolyline,
  trackedUnits = [],
  roadClosures = [],
  userLocation,
  onSelectHazard,
  onSelectShelter,
  onSelectUnit,
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
          provider={Platform.OS === 'android' ? PROVIDER_GOOGLE : PROVIDER_DEFAULT}
          mapType={Platform.OS === 'android' ? 'none' : 'standard'}
          initialRegion={initialRegion}
          showsUserLocation={isValidCoordinate(userLocation)}
          showsMyLocationButton={false}
          showsCompass={true}
          customMapStyle={DARK_MAP_STYLE}
        >
          {/* Universal high-res tile layer fallback ensures crisp map display even if Google Maps SDK has no key in Expo Go */}
          <UrlTile
            urlTemplate="https://a.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}.png"
            maximumZ={19}
            tileSize={256}
            flipY={false}
            zIndex={1}
          />

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
          {layers.routes && (
            <>
              {/* Active Corridor Override */}
              {Array.isArray(activeCorridorPolyline) && activeCorridorPolyline.length > 1 && (
                <Polyline
                  coordinates={activeCorridorPolyline.filter(isValidCoordinate)}
                  strokeColor={colors.status.success}
                  strokeWidth={6}
                />
              )}

              {/* Standard AI Route Polyline */}
              {evacuationRoute?.polyline && Array.isArray(evacuationRoute.polyline) && (
                <Polyline
                  coordinates={evacuationRoute.polyline.filter(isValidCoordinate)}
                  strokeColor="rgba(34, 197, 94, 0.65)"
                  strokeWidth={5}
                />
              )}

              {/* Alternative Route Polyline */}
              {Array.isArray(evacuationRoute?.alternativePolyline) && (
                <Polyline
                  coordinates={evacuationRoute.alternativePolyline.filter(isValidCoordinate)}
                  strokeColor={colors.primary.main}
                  strokeWidth={4}
                  lineDashPattern={[6, 4]}
                />
              )}

              {/* Dangerous Corridor Polyline */}
              {Array.isArray(evacuationRoute?.dangerousSegmentsPolyline) && (
                <Polyline
                  coordinates={evacuationRoute.dangerousSegmentsPolyline.filter(isValidCoordinate)}
                  strokeColor={colors.severity.CRITICAL.main}
                  strokeWidth={4}
                  lineDashPattern={[4, 4]}
                />
              )}

              {/* REAL-TIME TRACED PATH (Breadcrumb Trail of actual movement) */}
              {Array.isArray(tracedPath) && tracedPath.length > 1 && (
                <Polyline
                  coordinates={tracedPath.filter(isValidCoordinate)}
                  strokeColor="#2563EB"
                  strokeWidth={6}
                  lineCap="round"
                  lineJoin="round"
                />
              )}

              {/* Fleet Units Traced Breadcrumbs */}
              {trackedUnits.map((unit) => {
                if (unit.tracedPath && unit.tracedPath.length > 1) {
                  return (
                    <Polyline
                      key={`fleet-trace-${unit.unitId}`}
                      coordinates={unit.tracedPath.filter(isValidCoordinate)}
                      strokeColor={unit.role === 'AMBULANCE' ? 'rgba(239, 68, 68, 0.7)' : 'rgba(59, 130, 246, 0.7)'}
                      strokeWidth={4}
                      lineDashPattern={[4, 3]}
                    />
                  );
                }
                return null;
              })}
            </>
          )}

          {/* 3. LIVE TRACKED FLEET & SOS UNITS */}
          {trackedUnits.map((unit) => {
            if (!isValidCoordinate(unit.coordinate)) return null;
            const isAmbulance = unit.role === 'AMBULANCE';
            const isNdrf = unit.role === 'NDRF_TRUCK' || unit.role === 'RESCUE_BOAT';

            return (
              <Marker
                key={`tracked-${unit.unitId}`}
                coordinate={unit.coordinate}
                rotation={unit.heading || 0}
                anchor={{ x: 0.5, y: 0.5 }}
                title={`${unit.name} • ${unit.speedKmH || 0} km/h`}
                description={`Status: ${unit.status}`}
                onPress={() => onSelectUnit?.(unit)}
              >
                <View
                  style={[
                    styles.vehiclePin,
                    isAmbulance
                      ? styles.ambulancePin
                      : isNdrf
                      ? styles.ndrfPin
                      : styles.civilianPin,
                  ]}
                >
                  {isAmbulance ? (
                    <HeartPulse size={16} color="#FFF" />
                  ) : isNdrf ? (
                    <Truck size={16} color="#FFF" />
                  ) : (
                    <User size={14} color="#FFF" />
                  )}
                </View>
              </Marker>
            );
          })}

          {/* 4. SHELTER MARKERS */}
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

          {/* 5. ROAD CLOSURES */}
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
    width: '100%',
    height: '100%',
    backgroundColor: '#0A0F1A',
  },
  map: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
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
  vehiclePin: {
    width: 36,
    height: 36,
    borderRadius: radius.full,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#FFFFFF',
    ...shadows.md,
  },
  ambulancePin: {
    backgroundColor: colors.severity.CRITICAL.main,
  },
  ndrfPin: {
    backgroundColor: '#EA580C', // Tactical Orange
  },
  civilianPin: {
    backgroundColor: colors.primary.main,
  },
});
