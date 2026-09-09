import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Navigation, X, ShieldCheck, AlertCircle, Clock, MapPin, CornerUpRight, AlertTriangle } from 'lucide-react-native';
import { colors, typography, spacing, radius, shadows } from '../../src/theme';
import { useDisasterStore } from '../../src/store/useDisasterStore';
import { SeverityBadge } from '../../src/components/common/SeverityBadge';

export default function RouteDetailModalScreen() {
  const router = useRouter();
  const { evacuationRoute } = useDisasterStore();

  if (!evacuationRoute) {
    return (
      <SafeAreaView style={styles.container}>
        <Text style={{ color: '#FFF' }}>No active route</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Top Header Bar */}
      <View style={styles.topBar}>
        <TouchableOpacity style={styles.closeBtn} onPress={() => router.back()} activeOpacity={0.8}>
          <X size={20} color={colors.text.primary} />
        </TouchableOpacity>
        <Text style={styles.screenTitle}>DYNAMIC EVACUATION ROUTE BREAKDOWN</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Route Overview Header Card */}
        <View style={styles.headerCard}>
          <View style={styles.titleRow}>
            <View style={styles.iconBox}>
              <ShieldCheck size={20} color={colors.status.success} />
            </View>
            <View style={styles.flex1}>
              <Text style={styles.safetyHeader}>AI SAFETY SCORE: {evacuationRoute.safetyScore}%</Text>
              <Text style={styles.targetName}>Destination: {evacuationRoute.shelterName}</Text>
            </View>
            <SeverityBadge severity={evacuationRoute.riskIndex} size="sm" />
          </View>

          <View style={styles.statsRow}>
            <View style={styles.statBox}>
              <Clock size={14} color={colors.text.secondary} />
              <Text style={styles.statVal}>{evacuationRoute.estimatedTimeMins} mins</Text>
              <Text style={styles.statLabel}>EVAC ETA</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statBox}>
              <MapPin size={14} color={colors.text.secondary} />
              <Text style={styles.statVal}>{evacuationRoute.distanceKm} km</Text>
              <Text style={styles.statLabel}>DISTANCE</Text>
            </View>
          </View>
        </View>

        {/* Road Closures En-Route Warnings */}
        {evacuationRoute.roadClosuresEnRoute.length > 0 && (
          <View style={styles.closuresCard}>
            <View style={styles.closureTitleRow}>
              <AlertTriangle size={16} color={colors.severity.CRITICAL.main} />
              <Text style={styles.closureTitle}>EN-ROUTE ROAD CLOSURES DETECTED</Text>
            </View>
            {evacuationRoute.roadClosuresEnRoute.map((closure, idx) => (
              <View key={idx} style={styles.closureItem}>
                <Text style={styles.closureLoc}>{closure.locationName}</Text>
                <Text style={styles.closureReason}>{closure.reason}</Text>
              </View>
            ))}
          </View>
        )}

        {/* Turn-by-Turn Guidance List */}
        <Text style={styles.sectionTitle}>TURN-BY-TURN GUIDANCE PREVIEW</Text>
        <View style={styles.turnList}>
          {evacuationRoute.turnByTurnInstructions.map((step, idx) => (
            <View key={step.id} style={styles.turnItem}>
              <View style={styles.turnIconBox}>
                <CornerUpRight size={16} color={colors.primary.main} />
              </View>

              <View style={styles.turnTextContainer}>
                <Text style={styles.turnText}>{step.instruction}</Text>
                <Text style={styles.turnDistance}>{step.distanceMeters}m straight</Text>
                {step.hazardWarning && (
                  <Text style={styles.turnWarning}>⚠️ {step.hazardWarning}</Text>
                )}
              </View>
            </View>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.primary,
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.border.subtle,
  },
  closeBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.background.tertiary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  screenTitle: {
    color: colors.text.primary,
    fontSize: typography.fontSize.xs,
    fontWeight: typography.fontWeight.heavy,
    letterSpacing: 0.5,
  },
  content: {
    flex: 1,
    padding: spacing.md,
  },
  headerCard: {
    backgroundColor: colors.background.secondary,
    borderRadius: radius.lg,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.border.strong,
    marginBottom: spacing.md,
    ...shadows.md,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  iconBox: {
    width: 36,
    height: 36,
    borderRadius: radius.md,
    backgroundColor: 'rgba(16, 185, 129, 0.15)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  flex1: {
    flex: 1,
  },
  safetyHeader: {
    color: colors.status.success,
    fontSize: typography.fontSize.xs,
    fontWeight: typography.fontWeight.heavy,
  },
  targetName: {
    color: colors.text.primary,
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.bold,
  },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.background.tertiary,
    borderRadius: radius.md,
    padding: spacing.sm,
  },
  statBox: {
    flex: 1,
    alignItems: 'center',
  },
  statVal: {
    color: colors.text.primary,
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.heavy,
    marginVertical: 2,
  },
  statLabel: {
    color: colors.text.secondary,
    fontSize: 9,
    fontWeight: typography.fontWeight.bold,
  },
  statDivider: {
    width: 1,
    height: 24,
    backgroundColor: colors.border.default,
  },
  closuresCard: {
    backgroundColor: 'rgba(239, 68, 68, 0.12)',
    borderRadius: radius.md,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.severity.CRITICAL.border,
    marginBottom: spacing.md,
  },
  closureTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    marginBottom: spacing.xs,
  },
  closureTitle: {
    color: colors.severity.CRITICAL.text,
    fontSize: typography.fontSize.xs,
    fontWeight: typography.fontWeight.heavy,
  },
  closureItem: {
    marginTop: 4,
  },
  closureLoc: {
    color: colors.text.primary,
    fontSize: typography.fontSize.xs,
    fontWeight: typography.fontWeight.bold,
  },
  closureReason: {
    color: colors.text.secondary,
    fontSize: 11,
  },
  sectionTitle: {
    color: colors.text.secondary,
    fontSize: typography.fontSize.xs,
    fontWeight: typography.fontWeight.heavy,
    letterSpacing: 0.5,
    marginBottom: spacing.sm,
  },
  turnList: {
    gap: spacing.sm,
    marginBottom: spacing.xxl,
  },
  turnItem: {
    flexDirection: 'row',
    backgroundColor: colors.background.secondary,
    borderRadius: radius.md,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.border.subtle,
    gap: spacing.sm,
  },
  turnIconBox: {
    width: 32,
    height: 32,
    borderRadius: radius.sm,
    backgroundColor: 'rgba(59, 130, 246, 0.15)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  turnTextContainer: {
    flex: 1,
  },
  turnText: {
    color: colors.text.primary,
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.bold,
  },
  turnDistance: {
    color: colors.text.secondary,
    fontSize: 11,
    marginTop: 2,
  },
  turnWarning: {
    color: colors.severity.MODERATE.text,
    fontSize: 11,
    marginTop: 4,
    fontWeight: typography.fontWeight.semibold,
  },
});
