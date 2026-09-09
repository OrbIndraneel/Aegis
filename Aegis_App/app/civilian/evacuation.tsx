import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Header } from '../../src/components/common/Header';
import { ConnectionStatus } from '../../src/components/common/ConnectionStatus';
import { SeverityBadge } from '../../src/components/common/SeverityBadge';
import { InteractiveMap } from '../../src/components/map/InteractiveMap';
import { useDisasterStore } from '../../src/store/useDisasterStore';
import { useUserStore } from '../../src/store/useUserStore';
import { colors, typography, spacing, radius, shadows } from '../../src/theme';
import { Navigation, ShieldAlert, Clock, MapPin, AlertTriangle, CheckCircle2, CornerUpRight, StopCircle } from 'lucide-react-native';

export default function CivilianEvacuationScreen() {
  const { evacuationRoute, hazards, shelters, loadDisasterData } = useDisasterStore();
  const { profile } = useUserStore();

  const [isEvacuating, setIsEvacuating] = useState(false);
  const [etaRemainingMins, setEtaRemainingMins] = useState(evacuationRoute?.estimatedTimeMins || 14);
  const [distanceRemainingKm, setDistanceRemainingKm] = useState(evacuationRoute?.distanceKm || 4.2);

  useEffect(() => {
    if (!evacuationRoute) {
      loadDisasterData();
    } else {
      setEtaRemainingMins(evacuationRoute.estimatedTimeMins);
      setDistanceRemainingKm(evacuationRoute.distanceKm);
    }
  }, [evacuationRoute]);

  useEffect(() => {
    let timer: any;
    if (isEvacuating && etaRemainingMins > 0) {
      timer = setInterval(() => {
        setEtaRemainingMins((prev) => Math.max(1, prev - 1));
        setDistanceRemainingKm((prev) => Math.max(0.2, parseFloat((prev - 0.3).toFixed(1))));
      }, 5000);
    }
    return () => clearInterval(timer);
  }, [isEvacuating, etaRemainingMins]);

  if (!evacuationRoute) {
    return (
      <SafeAreaView style={styles.container}>
        <Header title="SAFE EVACUATION" />
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>Calculating safest route to emergency shelter...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <Header title="SAFE EVACUATION ROUTE" />
      <ConnectionStatus />

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* High Risk Banner */}
        <View style={styles.riskBanner}>
          <ShieldAlert size={22} color={colors.severity.CRITICAL.main} />
          <View style={styles.riskTextContainer}>
            <Text style={styles.riskTitle}>YOU ARE IN A HIGH RISK FLOOD ZONE</Text>
            <Text style={styles.riskSubtitle}>
              Follow AI Dynamic Route away from Vishwamitri River surge overflow
            </Text>
          </View>
        </View>

        {/* Live Evacuation Map Display Frame */}
        <View style={styles.mapFrame}>
          <InteractiveMap
            hazards={hazards}
            shelters={shelters}
            evacuationRoute={evacuationRoute}
            userLocation={profile.currentLocation}
            showLayersControl={false}
          />
        </View>

        {/* EVACUATION MODE CONTROLLER */}
        {!isEvacuating ? (
          <View style={styles.routeOverviewCard}>
            <View style={styles.cardHeader}>
              <View style={styles.badgeIcon}>
                <Navigation size={20} color={colors.status.success} />
              </View>
              <View style={styles.flex1}>
                <Text style={styles.aiTag}>AI SAFEST EVACUATION CORRIDOR</Text>
                <Text style={styles.destName}>Target: {evacuationRoute.shelterName}</Text>
              </View>
              <SeverityBadge severity={evacuationRoute.riskIndex} size="sm" />
            </View>

            {/* Metrics Row */}
            <View style={styles.metricsGrid}>
              <View style={styles.metricItem}>
                <Clock size={14} color={colors.text.secondary} />
                <Text style={styles.metricValue}>{evacuationRoute.estimatedTimeMins} mins</Text>
                <Text style={styles.metricLabel}>ESTIMATED ETA</Text>
              </View>
              <View style={styles.metricDivider} />
              <View style={styles.metricItem}>
                <MapPin size={14} color={colors.text.secondary} />
                <Text style={styles.metricValue}>{evacuationRoute.distanceKm} km</Text>
                <Text style={styles.metricLabel}>DISTANCE</Text>
              </View>
              <View style={styles.metricDivider} />
              <View style={styles.metricItem}>
                <CheckCircle2 size={14} color={colors.status.success} />
                <Text style={[styles.metricValue, { color: colors.status.success }]}>
                  {evacuationRoute.safetyScore}%
                </Text>
                <Text style={styles.metricLabel}>SAFETY SCORE</Text>
              </View>
            </View>

            {/* Road Closures En-Route Warning */}
            {evacuationRoute.roadClosuresEnRoute.length > 0 && (
              <View style={styles.closureBox}>
                <AlertTriangle size={14} color={colors.severity.CRITICAL.main} />
                <Text style={styles.closureText} numberOfLines={1}>
                  Road Closed: {evacuationRoute.roadClosuresEnRoute[0].locationName} ({evacuationRoute.roadClosuresEnRoute[0].reason})
                </Text>
              </View>
            )}

            {/* START EVACUATION TRIGGER */}
            <TouchableOpacity
              style={styles.startBtn}
              onPress={() => setIsEvacuating(true)}
              activeOpacity={0.85}
            >
              <Navigation size={18} color="#FFF" />
              <Text style={styles.startBtnText}>START ACTIVE EVACUATION</Text>
            </TouchableOpacity>
          </View>
        ) : (
          /* ACTIVE LIVE NAVIGATION MODE CARD */
          <View style={styles.activeEvacCard}>
            <View style={styles.activeHeader}>
              <View style={styles.livePulse} />
              <Text style={styles.activeTitle}>LIVE EVACUATION NAVIGATION ACTIVE</Text>
            </View>

            <View style={styles.activeMetricsRow}>
              <View style={styles.activeMetricBox}>
                <Text style={styles.activeMetricVal}>{etaRemainingMins} MINS</Text>
                <Text style={styles.activeMetricSub}>REMAINING ETA</Text>
              </View>
              <View style={styles.activeMetricBox}>
                <Text style={styles.activeMetricVal}>{distanceRemainingKm} KM</Text>
                <Text style={styles.activeMetricSub}>DISTANCE TO SHELTER</Text>
              </View>
            </View>

            {/* Live Turn-by-Turn Instruction */}
            <Text style={styles.instructionHeader}>CURRENT NAVIGATION STEP</Text>
            <View style={styles.stepCard}>
              <CornerUpRight size={20} color={colors.primary.main} />
              <View style={styles.flex1}>
                <Text style={styles.stepTitle}>
                  {evacuationRoute.turnByTurnInstructions[1]?.instruction || 'Head North towards Sama Flyover'}
                </Text>
                <Text style={styles.stepDist}>In 800m • Follow Green Polyline Corridor</Text>
              </View>
            </View>

            <TouchableOpacity
              style={styles.stopBtn}
              onPress={() => setIsEvacuating(false)}
              activeOpacity={0.8}
            >
              <StopCircle size={16} color="#FFF" />
              <Text style={styles.stopBtnText}>End Navigation</Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.primary,
  },
  content: {
    flex: 1,
    padding: spacing.md,
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyText: {
    color: colors.text.secondary,
    fontSize: typography.fontSize.sm,
  },
  riskBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(220, 38, 38, 0.15)',
    borderRadius: radius.lg,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.severity.CRITICAL.border,
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  riskTextContainer: {
    flex: 1,
  },
  riskTitle: {
    color: colors.severity.CRITICAL.text,
    fontSize: typography.fontSize.xs,
    fontWeight: typography.fontWeight.heavy,
    letterSpacing: 0.5,
  },
  riskSubtitle: {
    color: colors.text.secondary,
    fontSize: 11,
    marginTop: 2,
  },
  mapFrame: {
    height: 240,
    borderRadius: radius.lg,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: colors.border.strong,
    marginBottom: spacing.md,
  },
  routeOverviewCard: {
    backgroundColor: colors.background.secondary,
    borderRadius: radius.xl,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.border.strong,
    marginBottom: spacing.xxl,
    ...shadows.md,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  badgeIcon: {
    width: 38,
    height: 38,
    borderRadius: radius.md,
    backgroundColor: 'rgba(16, 185, 129, 0.15)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  flex1: {
    flex: 1,
  },
  aiTag: {
    color: colors.status.success,
    fontSize: 10,
    fontWeight: typography.fontWeight.heavy,
    letterSpacing: 0.5,
  },
  destName: {
    color: colors.text.primary,
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.bold,
  },
  metricsGrid: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.background.tertiary,
    borderRadius: radius.md,
    padding: spacing.sm,
    marginBottom: spacing.sm,
  },
  metricItem: {
    flex: 1,
    alignItems: 'center',
  },
  metricValue: {
    color: colors.text.primary,
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.heavy,
    marginVertical: 2,
  },
  metricLabel: {
    color: colors.text.secondary,
    fontSize: 8,
    fontWeight: typography.fontWeight.bold,
  },
  metricDivider: {
    width: 1,
    height: 20,
    backgroundColor: colors.border.default,
  },
  closureBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(239, 68, 68, 0.12)',
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: radius.sm,
    gap: spacing.xs,
    marginBottom: spacing.md,
  },
  closureText: {
    color: colors.severity.CRITICAL.text,
    fontSize: 11,
    flex: 1,
  },
  startBtn: {
    backgroundColor: colors.status.success,
    borderRadius: radius.md,
    paddingVertical: spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xs,
    ...shadows.glowBlue,
  },
  startBtnText: {
    color: '#FFF',
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.heavy,
    letterSpacing: 1,
  },
  activeEvacCard: {
    backgroundColor: colors.background.secondary,
    borderRadius: radius.xl,
    padding: spacing.md,
    borderWidth: 1.5,
    borderColor: colors.status.success,
    marginBottom: spacing.xxl,
    ...shadows.lg,
  },
  activeHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    marginBottom: spacing.md,
  },
  livePulse: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: colors.status.success,
  },
  activeTitle: {
    color: colors.status.success,
    fontSize: typography.fontSize.xs,
    fontWeight: typography.fontWeight.heavy,
    letterSpacing: 0.5,
  },
  activeMetricsRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  activeMetricBox: {
    flex: 1,
    backgroundColor: colors.background.tertiary,
    padding: spacing.md,
    borderRadius: radius.md,
    alignItems: 'center',
  },
  activeMetricVal: {
    color: colors.text.primary,
    fontSize: typography.fontSize.xl,
    fontWeight: typography.fontWeight.heavy,
  },
  activeMetricSub: {
    color: colors.text.secondary,
    fontSize: 9,
    fontWeight: typography.fontWeight.bold,
    marginTop: 2,
  },
  instructionHeader: {
    color: colors.text.secondary,
    fontSize: 10,
    fontWeight: typography.fontWeight.bold,
    marginBottom: 4,
  },
  stepCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.background.tertiary,
    padding: spacing.md,
    borderRadius: radius.md,
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  stepTitle: {
    color: colors.text.primary,
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.bold,
  },
  stepDist: {
    color: colors.text.secondary,
    fontSize: 11,
    marginTop: 2,
  },
  stopBtn: {
    backgroundColor: colors.background.tertiary,
    borderRadius: radius.md,
    paddingVertical: spacing.sm,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xs,
    borderWidth: 1,
    borderColor: colors.border.subtle,
  },
  stopBtnText: {
    color: colors.text.secondary,
    fontSize: typography.fontSize.xs,
    fontWeight: typography.fontWeight.bold,
  },
});
