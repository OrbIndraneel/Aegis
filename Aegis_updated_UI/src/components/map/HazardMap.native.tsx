import React, { useRef, useEffect } from 'react';
import { View, StyleSheet, Text, TouchableOpacity } from 'react-native';
import MapView, { Polygon, Marker, Polyline, PROVIDER_DEFAULT } from 'react-native-maps';
import { Hazard, Shelter, EvacuationRoute, RoadClosureMarker, Coordinate } from '../../types';
import { colors, radius, spacing, typography, shadows } from '../../theme';
import { AlertTriangle, Home, MapPin, Navigation, ShieldAlert, Crosshair } from 'lucide-react-native';

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

export const HazardMap: React.FC<Props> = ({
  hazards,
  shelters,
  evacuationRoute,
  roadClosures = [],
  userLocation,
  onSelectHazard,
  onSelectShelter,
  layers = { hazards: true, shelters: true, routes: true, roadClosures: true },
}) => {
  const mapRef = useRef<MapView | null>(null);

  const initialRegion = {
    latitude: userLocation?.latitude || 27.234,
    longitude: userLocation?.longitude || 88.512,
    latitudeDelta: 0.12,
    longitudeDelta: 0.12,
  };

  useEffect(() => {
    if (userLocation && mapRef.current) {
      mapRef.current.animateToRegion({
        latitude: userLocation.latitude,
        longitude: userLocation.longitude,
        latitudeDelta: 0.06,
        longitudeDelta: 0.06,
      }, 1000);
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
    <View style={styles.container}>
      <MapView
        ref={mapRef}
        style={styles.map}
        provider={PROVIDER_DEFAULT}
        initialRegion={initialRegion}
        showsUserLocation={true}
        showsMyLocationButton={false}
        showsCompass={false}
      >
        {/* 1. HAZARD POLYGONS */}
        {layers.hazards &&
          hazards.map((hazard) => {
            if (!hazard.coordinates || hazard.coordinates.length < 3) return null;
            return (
              <Polygon
                key={hazard.id}
                coordinates={hazard.coordinates}
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
            <Polyline
              coordinates={evacuationRoute.polyline}
              strokeColor={colors.status.success}
              strokeWidth={5}
            />
            {evacuationRoute.alternativePolyline && (
              <Polyline
                coordinates={evacuationRoute.alternativePolyline}
                strokeColor={colors.primary.main}
                strokeWidth={4}
                lineDashPattern={[6, 4]}
              />
            )}
            {evacuationRoute.dangerousSegmentsPolyline && (
              <Polyline
                coordinates={evacuationRoute.dangerousSegmentsPolyline}
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
            const occupancy = shelter.currentOccupancy / shelter.totalCapacity;
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
          roadClosures.map((closure) => (
            <Marker key={closure.id} coordinate={closure.coordinate} title={closure.name}>
              <View style={styles.roadClosurePin}>
                <Text style={styles.closureText}>✕</Text>
              </View>
            </Marker>
          ))}
      </MapView>
    </View>
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
