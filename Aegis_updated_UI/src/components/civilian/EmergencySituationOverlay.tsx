import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Animated, Easing, Platform } from 'react-native';
import { ShieldAlert, Navigation, Home, AlertOctagon, ArrowRight, MapPin, X } from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors, typography, spacing, radius, shadows } from '../../theme';
import { Hazard, Shelter, EvacuationRoute, Coordinate } from '../../types';
import { calculateDistanceKm } from '../../utils/riskExplanation';

interface Props {
  hazard: Hazard;
  shelter?: Shelter | null;
  evacuationRoute?: EvacuationRoute | null;
  userLocation?: Coordinate;
  onNavigateEvacuation: () => void;
  onNavigateShelters: () => void;
  onTriggerSos: () => void;
  onDismiss: () => void;
}

export const EmergencySituationOverlay: React.FC<Props> = ({
  hazard,
  shelter,
  evacuationRoute,
  userLocation,
  onNavigateEvacuation,
  onNavigateShelters,
  onTriggerSos,
  onDismiss,
}) => {
  const insets = useSafeAreaInsets();
  const userLoc = userLocation || { latitude: 27.234, longitude: 88.512 };
  const distanceToDangerKm = calculateDistanceKm(userLoc, hazard.center);
  const shelterOccupancy = shelter?.capacity?.occupancyPercentage ?? 44;

  // Restrained live breathing pulses for emergency state
  const headerPulse = useRef(new Animated.Value(0.4)).current;
  const sosBtnScale = useRef(new Animated.Value(1)).current;
  const safeCardScale = useRef(new Animated.Value(1)).current;
  const shelterCardScale = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(headerPulse, {
          toValue: 0.95,
          duration: 1400,
          easing: Easing.inOut(Easing.quad),
          useNativeDriver: true,
        }),
        Animated.timing(headerPulse, {
          toValue: 0.4,
          duration: 1400,
          easing: Easing.inOut(Easing.quad),
          useNativeDriver: true,
        }),
      ])
    );
    loop.start();
    return () => loop.stop();
  }, []);

  const handleSosPressIn = () => {
    Animated.spring(sosBtnScale, {
      toValue: 0.96,
      speed: 30,
      bounciness: 0,
      useNativeDriver: true,
    }).start();
  };

  const handleSosPressOut = () => {
    Animated.spring(sosBtnScale, {
      toValue: 1,
      speed: 24,
      bounciness: 2,
      useNativeDriver: true,
    }).start();
  };

  return (
    <View style={styles.container}>
      {/* 1. LIQUID GLASS HEADER BAR (No solid flat red block) */}
      <View style={styles.topHeader}>
        <View style={styles.headerTitleRow}>
          <View style={styles.liveIndicatorCircle}>
            <Animated.View style={[styles.liveDotPulse, { opacity: headerPulse }]} />
            <ShieldAlert size={16} color="#F87171" />
          </View>
          <View style={styles.headerTextContainer}>
            <Text style={styles.headerTag}>EMERGENCY SITUATION MODE</Text>
            <Text style={styles.headerTitle} numberOfLines={1}>{hazard.name}</Text>
          </View>
        </View>

        <TouchableOpacity style={styles.exitBtn} onPress={onDismiss} activeOpacity={0.75}>
          <X size={13} color="#CBD5E1" />
          <Text style={styles.exitBtnText}>Standard View</Text>
        </TouchableOpacity>
      </View>

      {/* 2. VERTICALLY SCROLLABLE CONTENT WITH BOTTOM NAV PADDING */}
      <ScrollView
        style={styles.scrollArea}
        contentContainerStyle={[
          styles.scrollContent,
          { paddingBottom: Math.max(insets.bottom + 92, 104) },
        ]}
        showsVerticalScrollIndicator={false}
      >
        {/* COHESIVE LIQUID GLASS HAZARD TELEMETRY SECTION (Single unified glass container) */}
        <View style={styles.unifiedHazardGlassCard}>
          <View style={styles.hazardMainRow}>
            <View style={styles.flex1}>
              <Text style={styles.sectionLabel}>CURRENT HAZARD & SEVERITY</Text>
              <Text style={styles.hazardNameText}>{hazard.type} - {hazard.name}</Text>
            </View>

            <View style={styles.severityBadge}>
              <Animated.View style={[styles.miniLiveBadgeDot, { opacity: headerPulse }]} />
              <Text style={styles.severityBadgeText}>{hazard.severity}</Text>
            </View>
          </View>

          <View style={styles.glassDivider} />

          <View style={styles.distanceTelemetryRow}>
            <MapPin size={15} color="#EF4444" />
            <View style={styles.flex1}>
              <Text style={styles.distanceTitle}>
                {distanceToDangerKm} km <Text style={styles.distanceSubtitle}>from danger epicentre</Text>
              </Text>
              <Text style={styles.alertRadiusText}>
                Alert Radius: {((hazard.radiusMeters || 1800) / 1000).toFixed(1)} km
              </Text>
            </View>
          </View>
        </View>

        {/* PRIMARY ACTION: SAFEST EVACUATION CORRIDOR */}
        <Animated.View style={{ transform: [{ scale: safeCardScale }] }}>
          <TouchableOpacity
            style={styles.primarySafeCard}
            onPress={onNavigateEvacuation}
            onPressIn={() => Animated.spring(safeCardScale, { toValue: 0.98, speed: 28, useNativeDriver: true }).start()}
            onPressOut={() => Animated.spring(safeCardScale, { toValue: 1, speed: 24, useNativeDriver: true }).start()}
            activeOpacity={0.9}
          >
            <View style={styles.actionHeaderRow}>
              <View style={styles.iconCircleGreen}>
                <Navigation size={20} color="#6EE7B7" />
              </View>
              <View style={styles.flex1}>
                <Text style={styles.actionTagGreen}>SAFEST EVACUATION ROUTE (PRIMARY)</Text>
                <Text style={styles.actionTitleGreen}>
                  {evacuationRoute ? `${evacuationRoute.estimatedTimeMins} mins • ${evacuationRoute.distanceKm} km` : '14 mins • 4.2 km'}
                </Text>
                <Text style={styles.actionSubText}>
                  {evacuationRoute?.shelterName ? `To: ${evacuationRoute.shelterName}` : 'Bypasses NH-10 active landslide debris zone'}
                </Text>
              </View>
              <ArrowRight size={18} color="#34D399" />
            </View>
          </TouchableOpacity>
        </Animated.View>

        {/* SECONDARY ACTION: RECOMMENDED SAFE SHELTER */}
        <Animated.View style={{ transform: [{ scale: shelterCardScale }] }}>
          <TouchableOpacity
            style={styles.secondaryShelterCard}
            onPress={onNavigateShelters}
            onPressIn={() => Animated.spring(shelterCardScale, { toValue: 0.98, speed: 28, useNativeDriver: true }).start()}
            onPressOut={() => Animated.spring(shelterCardScale, { toValue: 1, speed: 24, useNativeDriver: true }).start()}
            activeOpacity={0.9}
          >
            <View style={styles.actionHeaderRow}>
              <View style={styles.iconCircleBlue}>
                <Home size={20} color="#93C5FD" />
              </View>
              <View style={styles.flex1}>
                <Text style={styles.actionTagBlue}>RECOMMENDED SAFE SHELTER</Text>
                <Text style={styles.actionTitleBlue} numberOfLines={1}>
                  {shelter ? shelter.name : 'Singtam Community Staging Complex'}
                </Text>
                <Text style={styles.actionSubText}>
                  {shelter?.distanceKm || 3.8} km • {shelterOccupancy}% occupied (Optimal Bed Capacity)
                </Text>
              </View>
              <ArrowRight size={18} color="#60A5FA" />
            </View>
          </TouchableOpacity>
        </Animated.View>

        {/* HIGH-VISIBILITY EMERGENCY SOS BUTTON */}
        <Animated.View style={{ transform: [{ scale: sosBtnScale }] }}>
          <TouchableOpacity
            style={styles.sosTriggerBtn}
            onPress={onTriggerSos}
            onPressIn={handleSosPressIn}
            onPressOut={handleSosPressOut}
            activeOpacity={0.92}
          >
            <AlertOctagon size={20} color="#FFF" />
            <Text style={styles.sosTriggerText}>TRIGGER EMERGENCY RESCUE SOS</Text>
          </TouchableOpacity>
        </Animated.View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'rgba(10, 15, 26, 0.96)',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    borderWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.35)',
    borderTopColor: 'rgba(239, 68, 68, 0.5)',
    maxHeight: '85%',
    overflow: 'hidden',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: -8 },
    shadowOpacity: 0.5,
    shadowRadius: 16,
    elevation: 12,
    ...(Platform.OS === 'web'
      ? ({
          backdropFilter: 'blur(16px)',
          WebkitBackdropFilter: 'blur(16px)',
        } as any)
      : {}),
  },
  topHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: 'rgba(15, 23, 42, 0.9)',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.08)',
  },
  headerTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flex: 1,
  },
  liveIndicatorCircle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: 'rgba(239, 68, 68, 0.15)',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  liveDotPulse: {
    position: 'absolute',
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: 'rgba(239, 68, 68, 0.25)',
  },
  headerTextContainer: {
    flex: 1,
  },
  headerTag: {
    color: '#F87171',
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 0.8,
  },
  headerTitle: {
    color: '#F8FAFC',
    fontSize: 13.5,
    fontWeight: '700',
    marginTop: 1,
  },
  exitBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.12)',
    gap: 4,
  },
  exitBtnText: {
    color: '#CBD5E1',
    fontSize: 10.5,
    fontWeight: '600',
  },
  scrollArea: {
    paddingHorizontal: 16,
    paddingTop: 14,
  },
  scrollContent: {
    gap: 12,
  },

  /* UNIFIED COHESIVE HAZARD GLASS CARD */
  unifiedHazardGlassCard: {
    backgroundColor: 'rgba(15, 23, 42, 0.85)',
    borderRadius: 18,
    padding: 14,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    gap: 10,
  },
  hazardMainRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: 8,
  },
  flex1: {
    flex: 1,
  },
  sectionLabel: {
    color: '#94A3B8',
    fontSize: 9.5,
    fontWeight: '700',
    letterSpacing: 0.6,
  },
  hazardNameText: {
    color: '#F8FAFC',
    fontSize: 14,
    fontWeight: '800',
    marginTop: 2,
  },
  severityBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(220, 38, 38, 0.25)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.4)',
    gap: 4,
  },
  miniLiveBadgeDot: {
    width: 5,
    height: 5,
    borderRadius: 2.5,
    backgroundColor: '#EF4444',
  },
  severityBadgeText: {
    color: '#F87171',
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  glassDivider: {
    height: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
  },
  distanceTelemetryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  distanceTitle: {
    color: '#EF4444',
    fontSize: 14,
    fontWeight: '800',
  },
  distanceSubtitle: {
    color: '#CBD5E1',
    fontSize: 12,
    fontWeight: '500',
  },
  alertRadiusText: {
    color: '#94A3B8',
    fontSize: 11,
    marginTop: 2,
  },

  /* PRIMARY ACTION: SAFEST EVACUATION CORRIDOR */
  primarySafeCard: {
    backgroundColor: 'rgba(6, 78, 59, 0.5)',
    borderRadius: 18,
    padding: 14,
    borderWidth: 1,
    borderColor: 'rgba(16, 185, 129, 0.35)',
    borderTopColor: 'rgba(52, 211, 153, 0.5)',
  },
  actionHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  iconCircleGreen: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(16, 185, 129, 0.2)',
    borderWidth: 1,
    borderColor: 'rgba(52, 211, 153, 0.3)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionTagGreen: {
    color: '#34D399',
    fontSize: 9.5,
    fontWeight: '800',
    letterSpacing: 0.6,
  },
  actionTitleGreen: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '800',
    marginTop: 2,
  },

  /* SECONDARY ACTION: RECOMMENDED SHELTER */
  secondaryShelterCard: {
    backgroundColor: 'rgba(30, 58, 138, 0.45)',
    borderRadius: 18,
    padding: 14,
    borderWidth: 1,
    borderColor: 'rgba(59, 130, 246, 0.35)',
  },
  iconCircleBlue: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(59, 130, 246, 0.2)',
    borderWidth: 1,
    borderColor: 'rgba(96, 165, 250, 0.3)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionTagBlue: {
    color: '#60A5FA',
    fontSize: 9.5,
    fontWeight: '800',
    letterSpacing: 0.6,
  },
  actionTitleBlue: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '800',
    marginTop: 2,
  },
  actionSubText: {
    color: '#E2E8F0',
    fontSize: 11.5,
    marginTop: 2,
  },

  /* SOS TRIGGER BUTTON */
  sosTriggerBtn: {
    backgroundColor: '#DC2626',
    borderRadius: 16,
    paddingVertical: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    borderWidth: 1,
    borderColor: '#EF4444',
    shadowColor: '#DC2626',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.45,
    shadowRadius: 10,
    elevation: 6,
  },
  sosTriggerText: {
    color: '#FFFFFF',
    fontSize: 13.5,
    fontWeight: '800',
    letterSpacing: 0.8,
  },
});
