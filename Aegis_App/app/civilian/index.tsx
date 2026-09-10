import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, StatusBar, Animated, Easing } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { HazardMap } from '../../src/components/map/HazardMap';
import { MapFloatingControls } from '../../src/components/map/MapFloatingControls';
import { FloatingAlertCard } from '../../src/components/civilian/FloatingAlertCard';
import { SafeguardBottomSheet } from '../../src/components/civilian/SafeguardBottomSheet';
import { EmergencySituationOverlay } from '../../src/components/civilian/EmergencySituationOverlay';
import { useDisasterStore } from '../../src/store/useDisasterStore';
import { useUserStore } from '../../src/store/useUserStore';
import { getTopRecommendedShelter } from '../../src/utils/shelterLoadBalancer';

export default function CivilianHomeScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const {
    hazards,
    shelters,
    evacuationRoute,
    alerts,
    loadDisasterData,
    isEmergencyModeActive,
    setEmergencyModeActive,
  } = useDisasterStore();
  const { profile } = useUserStore();

  // Smooth State Transition Animated Values
  const overlayAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    loadDisasterData();
  }, []);

  // Drive state-driven Emergency Panel Reveal
  const activeAlert = alerts[0];
  const criticalHazard = hazards.find((h) => h.severity === 'CRITICAL') || hazards[0];
  const topShelter = getTopRecommendedShelter(shelters, profile?.currentLocation);

  const shouldShowEmergencyMode = isEmergencyModeActive && !!criticalHazard;

  useEffect(() => {
    Animated.timing(overlayAnim, {
      toValue: shouldShowEmergencyMode ? 1 : 0,
      duration: 320,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    }).start();
  }, [shouldShowEmergencyMode]);

  const handleSosPress = () => {
    router.push('/civilian/sos' as any);
  };

  const handleNavigationPress = () => {
    router.push('/civilian/evacuation' as any);
  };

  const handleSheltersPress = () => {
    router.push('/civilian/shelters' as any);
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />

      {/* FULL-SCREEN IMMERSIVE LIVE MAP */}
      <View style={styles.mapArea}>
        <HazardMap
          hazards={hazards}
          shelters={shelters}
          evacuationRoute={evacuationRoute}
          userLocation={profile?.currentLocation}
        />

        {/* Floating Controls on Top Left */}
        <View style={[styles.controlsPosition, { top: Math.max(insets.top + 70, 75) }]}>
          <MapFloatingControls />
        </View>

        {/* Floating Dynamic Alert Banner near Top Center */}
        <View
          style={[
            styles.alertBannerOverlay,
            { top: Math.max(insets.top + 8, 16) },
          ]}
          pointerEvents="box-none"
        >
          <FloatingAlertCard
            title={activeAlert ? activeAlert.title : 'MONITORING DISASTER REGION'}
            subtitle={activeAlert ? `${activeAlert.targetRegion} • Issued ${activeAlert.issuedAt}` : 'Operational hazard telemetry monitoring active'}
            actionText={activeAlert ? (activeAlert.actionRequired || 'Evacuate using AI dynamic corridor') : 'Tap to view safe evacuation corridors'}
            severity={criticalHazard?.severity || 'CRITICAL'}
            onPress={() => setEmergencyModeActive(true)}
          />
        </View>

        {/* State-Driven Emergency Situation Mode vs Safeguard Bottom Sheet */}
        <View style={styles.bottomSheetPosition} pointerEvents="box-none">
          {shouldShowEmergencyMode ? (
            <Animated.View
              style={{
                opacity: overlayAnim,
                transform: [
                  {
                    translateY: overlayAnim.interpolate({
                      inputRange: [0, 1],
                      outputRange: [180, 0],
                    }),
                  },
                ],
              }}
            >
              <EmergencySituationOverlay
                hazard={criticalHazard}
                shelter={topShelter}
                evacuationRoute={evacuationRoute}
                userLocation={profile?.currentLocation}
                onNavigateEvacuation={handleNavigationPress}
                onNavigateShelters={handleSheltersPress}
                onTriggerSos={handleSosPress}
                onDismiss={() => setEmergencyModeActive(false)}
              />
            </Animated.View>
          ) : (
            <Animated.View
              style={{
                opacity: overlayAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [1, 0],
                }),
              }}
            >
              <SafeguardBottomSheet
                onSosPress={handleSosPress}
                onNavigationPress={handleNavigationPress}
                evacuationRoute={evacuationRoute}
              />
            </Animated.View>
          )}
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
