import React, { useState } from 'react';
import { View, StyleSheet, Text, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Header } from '../../src/components/common/Header';
import { ConnectionStatus } from '../../src/components/common/ConnectionStatus';
import { HazardMap } from '../../src/components/map/HazardMap';
import { MapFloatingControls } from '../../src/components/map/MapFloatingControls';
import { MapLegend } from '../../src/components/map/MapLegend';
import { useDisasterStore } from '../../src/store/useDisasterStore';
import { colors, spacing, radius, typography } from '../../src/theme';
import { VADODARA_ROAD_CLOSURES, MOCK_INCIDENTS } from '../../src/services/mock/mockData';
import { ShieldAlert, Users, Radio, Home } from 'lucide-react-native';

export default function AuthorityMapScreen() {
  const { hazards, shelters, evacuationRoute } = useDisasterStore();

  const [layers, setLayers] = useState({
    hazards: true,
    shelters: true,
    routes: true,
    roadClosures: true,
  });

  return (
    <SafeAreaView style={styles.container}>
      <Header title="TACTICAL GIS MAP COMMAND" />
      <ConnectionStatus />

      <View style={styles.mapFrame}>
        <HazardMap
          hazards={hazards}
          shelters={shelters}
          evacuationRoute={evacuationRoute}
          roadClosures={VADODARA_ROAD_CLOSURES}
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
          <Text style={styles.tacticalText}>COMMAND MODE • 14 NDRF UNITS ACTIVE</Text>
        </View>
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
});
