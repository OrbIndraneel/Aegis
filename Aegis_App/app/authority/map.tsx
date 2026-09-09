import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Text, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Header } from '../../src/components/common/Header';
import { ConnectionStatus } from '../../src/components/common/ConnectionStatus';
import { HazardMap } from '../../src/components/map/HazardMap';
import { MapFloatingControls } from '../../src/components/map/MapFloatingControls';
import { MapLegend } from '../../src/components/map/MapLegend';
import { useDisasterStore } from '../../src/store/useDisasterStore';
import { colors, spacing, radius, typography, shadows } from '../../src/theme';
import { VADODARA_ROAD_CLOSURES, MOCK_INCIDENTS } from '../../src/services/mock/mockData';
import { ShieldAlert, Users, Radio, Home, Navigation, Play, StopCircle, HeartPulse } from 'lucide-react-native';
import { TelemetryService } from '../../src/services/telemetry/telemetryService';
import { TrackedUnit, Coordinate } from '../../src/types';

// Default initial rescue fleet positions (Vadodara)
const INITIAL_FLEET: TrackedUnit[] = [
  {
    unitId: 'AMB-01',
    name: 'Ambulance 01 (SSG Trauma)',
    role: 'AMBULANCE',
    coordinate: { latitude: 22.3015, longitude: 73.1890 },
    heading: 45,
    speedKmH: 0,
    status: 'STANDBY',
    tracedPath: [{ latitude: 22.3015, longitude: 73.1890 }],
  },
  {
    unitId: 'NDRF-BOAT-02',
    name: 'NDRF Rescue Boat 02',
    role: 'RESCUE_BOAT',
    coordinate: { latitude: 22.3180, longitude: 73.1750 },
    heading: 120,
    speedKmH: 18,
    status: 'EN_ROUTE',
    tracedPath: [{ latitude: 22.3180, longitude: 73.1750 }],
  },
  {
    unitId: 'CIV-SOS-88',
    name: 'Stranded Civilian (SOS Active)',
    role: 'CIVILIAN',
    coordinate: { latitude: 22.3210, longitude: 73.2080 },
    status: 'EVACUATING',
  },
];

// Sample AI Safe Corridor from SSG Trauma to Stranded Civilian SOS
const DISPATCH_RESCUE_CORRIDOR: Coordinate[] = [
  { latitude: 22.3015, longitude: 73.1890 },
  { latitude: 22.3050, longitude: 73.1920 },
  { latitude: 22.3100, longitude: 73.1960 },
  { latitude: 22.3160, longitude: 73.2020 },
  { latitude: 22.3210, longitude: 73.2080 },
];

export default function AuthorityMapScreen() {
  const { hazards, shelters, evacuationRoute } = useDisasterStore();

  const [trackedUnits, setTrackedUnits] = useState<TrackedUnit[]>(INITIAL_FLEET);
  const [selectedUnit, setSelectedUnit] = useState<TrackedUnit | null>(null);
  const [isSimulatingDispatch, setIsSimulatingDispatch] = useState(false);
  const [activeRescueCorridor, setActiveRescueCorridor] = useState<Coordinate[] | undefined>(undefined);

  const [layers, setLayers] = useState({
    hazards: true,
    shelters: true,
    routes: true,
    roadClosures: true,
  });

  // Subscribe to real-time WebSocket telemetry updates
  useEffect(() => {
    const unsubscribe = TelemetryService.subscribe(
      (incomingUnit) => {
        setTrackedUnits((prev) => {
          const index = prev.findIndex((u) => u.unitId === incomingUnit.unitId);
          if (index >= 0) {
            const updated = [...prev];
            const existing = updated[index];
            const updatedPath = existing.tracedPath
              ? [...existing.tracedPath, incomingUnit.coordinate]
              : [incomingUnit.coordinate];

            updated[index] = {
              ...existing,
              ...incomingUnit,
              tracedPath: updatedPath,
            };
            return updated;
          }
          return [...prev, incomingUnit];
        });
      },
      (snapshot) => {
        if (snapshot && snapshot.length > 0) {
          setTrackedUnits(snapshot);
        }
      }
    );

    return () => unsubscribe();
  }, []);

  const hasActiveHazards = hazards && hazards.length > 0;

  // Option B: Auto-dispatch emergency response unit when hazards/SOS present
  useEffect(() => {
    if (hasActiveHazards && !isSimulatingDispatch) {
      setIsSimulatingDispatch(true);
      setActiveRescueCorridor(DISPATCH_RESCUE_CORRIDOR);

      const cancelSim = TelemetryService.startVehicleSimulation(
        DISPATCH_RESCUE_CORRIDOR,
        {
          unitId: 'AMB-01',
          name: 'Ambulance 01 (SSG Trauma)',
          role: 'AMBULANCE',
        },
        (stepUnit) => {
          setTrackedUnits((prev) => {
            const index = prev.findIndex((u) => u.unitId === stepUnit.unitId);
            if (index >= 0) {
              const updated = [...prev];
              updated[index] = stepUnit;
              return updated;
            }
            return [...prev, stepUnit];
          });
        }
      );

      return () => cancelSim();
    } else if (!hasActiveHazards) {
      setIsSimulatingDispatch(false);
      setActiveRescueCorridor(undefined);
    }
  }, [hasActiveHazards]);

  // Manual Toggle / Override for Ambulance Dispatch
  const toggleDispatchSimulation = () => {
    if (isSimulatingDispatch) {
      TelemetryService.disconnect();
      setIsSimulatingDispatch(false);
      setActiveRescueCorridor(undefined);
    } else {
      setIsSimulatingDispatch(true);
      setActiveRescueCorridor(DISPATCH_RESCUE_CORRIDOR);

      TelemetryService.startVehicleSimulation(
        DISPATCH_RESCUE_CORRIDOR,
        {
          unitId: 'AMB-01',
          name: 'Ambulance 01 (SSG Trauma)',
          role: 'AMBULANCE',
        },
        (stepUnit) => {
          setTrackedUnits((prev) => {
            const index = prev.findIndex((u) => u.unitId === stepUnit.unitId);
            if (index >= 0) {
              const updated = [...prev];
              updated[index] = stepUnit;
              return updated;
            }
            return [...prev, stepUnit];
          });
        }
      );
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <Header title="TACTICAL GIS MAP COMMAND" />
      <ConnectionStatus />

      <View style={styles.mapFrame}>
        <HazardMap
          hazards={hazards}
          shelters={shelters}
          evacuationRoute={hasActiveHazards ? evacuationRoute : null}
          activeCorridorPolyline={hasActiveHazards ? activeRescueCorridor : undefined}
          trackedUnits={trackedUnits}
          roadClosures={hasActiveHazards ? VADODARA_ROAD_CLOSURES : []}
          onSelectUnit={(unit: TrackedUnit) => setSelectedUnit(unit)}
          layers={layers}
        />

        {/* Floating Controls */}
        <MapFloatingControls
          onMyLocation={() => {}}
          onToggleLayers={() =>
            setLayers((prev) => ({ ...prev, hazards: !prev.hazards, shelters: !prev.shelters }))
          }
          onZoomIn={() => {}}
          onZoomOut={() => {}}
          onRecenter={() => {}}
          onToggleEmergencyMode={() => {}}
          isEmergencyActive={true}
        />

        <MapLegend />

        {/* Top Tactical Command Overlay */}
        <View style={styles.topTacticalPill}>
          <Radio size={14} color={colors.safety.main} />
          <Text style={styles.tacticalText}>
            COMMAND MODE • {trackedUnits.length} UNITS TRACKED
          </Text>
        </View>

        {/* Live Simulation Dispatch Action Button */}
        <TouchableOpacity
          style={[styles.simButton, isSimulatingDispatch && styles.simButtonActive]}
          onPress={toggleDispatchSimulation}
          activeOpacity={0.85}
        >
          {isSimulatingDispatch ? (
            <>
              <StopCircle size={14} color="#FFF" />
              <Text style={styles.simButtonText}>STOP AMBULANCE DISPATCH</Text>
            </>
          ) : (
            <>
              <Play size={14} color="#FFF" />
              <Text style={styles.simButtonText}>SIMULATE AMBULANCE RESCUE ROUTE</Text>
            </>
          )}
        </TouchableOpacity>

        {/* Selected Unit Details Modal Card */}
        {selectedUnit && (
          <View style={styles.unitDetailCard}>
            <View style={styles.unitCardHeader}>
              <HeartPulse size={18} color={colors.severity.CRITICAL.main} />
              <Text style={styles.unitCardTitle}>{selectedUnit.name}</Text>
              <TouchableOpacity onPress={() => setSelectedUnit(null)}>
                <Text style={styles.closeBtn}>✕</Text>
              </TouchableOpacity>
            </View>
            <View style={styles.unitCardRow}>
              <Text style={styles.unitCardLabel}>ROLE: {selectedUnit.role}</Text>
              <Text style={styles.unitCardLabel}>SPEED: {selectedUnit.speedKmH || 0} km/h</Text>
              <Text style={styles.unitCardStatus}>STATUS: {selectedUnit.status}</Text>
            </View>
          </View>
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.primary,
  },
  mapFrame: {
    flex: 1,
    position: 'relative',
  },
  topTacticalPill: {
    position: 'absolute',
    top: spacing.md,
    left: spacing.md,
    backgroundColor: colors.background.secondary,
    borderRadius: radius.full,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    borderWidth: 1,
    borderColor: colors.safety.main,
    zIndex: 10,
  },
  tacticalText: {
    color: colors.safety.main,
    fontSize: 10,
    fontWeight: typography.fontWeight.heavy,
  },
  simButton: {
    position: 'absolute',
    bottom: spacing.lg,
    alignSelf: 'center',
    backgroundColor: colors.primary.main,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radius.full,
    borderWidth: 1,
    borderColor: '#FFFFFF',
    zIndex: 20,
    ...shadows.lg,
  },
  simButtonActive: {
    backgroundColor: colors.severity.CRITICAL.main,
  },
  simButtonText: {
    color: '#FFF',
    fontWeight: typography.fontWeight.heavy,
    fontSize: 12,
    letterSpacing: 0.5,
  },
  unitDetailCard: {
    position: 'absolute',
    top: spacing.xxl + 20,
    left: spacing.md,
    right: spacing.md,
    backgroundColor: colors.background.secondary,
    borderRadius: radius.md,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.border.strong,
    zIndex: 25,
    ...shadows.md,
  },
  unitCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    marginBottom: spacing.xs,
  },
  unitCardTitle: {
    flex: 1,
    color: colors.text.primary,
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.heavy,
  },
  closeBtn: {
    color: colors.text.secondary,
    fontSize: 16,
    paddingHorizontal: spacing.xs,
  },
  unitCardRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: spacing.xs,
  },
  unitCardLabel: {
    color: colors.text.secondary,
    fontSize: 11,
    fontWeight: typography.fontWeight.medium,
  },
  unitCardStatus: {
    color: colors.status.success,
    fontSize: 11,
    fontWeight: typography.fontWeight.bold,
  },
});

