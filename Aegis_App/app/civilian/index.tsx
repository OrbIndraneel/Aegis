import React, { useEffect } from 'react';
import { View, StyleSheet, StatusBar } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { HazardMap } from '../../src/components/map/HazardMap';
import { MapFloatingControls } from '../../src/components/map/MapFloatingControls';
import { FloatingAlertCard } from '../../src/components/civilian/FloatingAlertCard';
import { SafeguardBottomSheet } from '../../src/components/civilian/SafeguardBottomSheet';
import { useDisasterStore } from '../../src/store/useDisasterStore';

export default function CivilianHomeScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { alerts, loadDisasterData } = useDisasterStore();

  useEffect(() => {
    loadDisasterData();
  }, []);

  const activeAlert = alerts[0];

  const handleSosPress = () => {
    router.push('/civilian/sos' as any);
  };

  const handleNavigationPress = () => {
    router.push('/civilian/evacuation' as any);
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />

      {/* FULL-SCREEN IMMERSIVE MAP */}
      <View style={styles.mapArea}>
        <HazardMap />

        {/* Floating Circular Controls on Top Left */}
        <View style={[styles.controlsPosition, { top: Math.max(insets.top + 70, 75) }]}>
          <MapFloatingControls />
        </View>

        {/* Floating Dynamic Critical Alert Banner near Top Center */}
        <View
          style={[
            styles.alertBannerOverlay,
            { top: Math.max(insets.top + 8, 16) },
          ]}
          pointerEvents="box-none"
        >
          <FloatingAlertCard
            title={activeAlert ? activeAlert.title : 'MONITORING DISASTER REGION'}
            subtitle={activeAlert ? `${activeAlert.targetRegion} • Issued ${activeAlert.issuedAt}` : 'All hazard sensors reporting live telemetry'}
            actionText={activeAlert ? (activeAlert.actionRequired || 'Evacuate using AI dynamic corridor') : 'Tap to view safe evacuation corridors'}
          />
        </View>

        {/* Translucent Dark Bottom Sheet */}
        <View style={styles.bottomSheetPosition} pointerEvents="box-none">
          <SafeguardBottomSheet
            onSosPress={handleSosPress}
            onNavigationPress={handleNavigationPress}
          />
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0A0F1A',
  },
  mapArea: {
    flex: 1,
    position: 'relative',
  },
  controlsPosition: {
    position: 'absolute',
    left: 0,
    zIndex: 20,
  },
  alertBannerOverlay: {
    position: 'absolute',
    left: 14,
    right: 14,
    zIndex: 10,
  },
  bottomSheetPosition: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 30,
  },
});
