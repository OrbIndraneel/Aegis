import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Navigation, ShieldCheck, Clock, MapPin, AlertCircle, ChevronRight } from 'lucide-react-native';
import { colors, typography, spacing, radius, shadows } from '../../theme';
import { EvacuationRoute } from '../../types/disaster';
import { SeverityBadge } from '../common/SeverityBadge';

interface Props {
  route: EvacuationRoute;
  onPressDetails?: () => void;
}

export const EvacuationRouteCard: React.FC<Props> = ({ route, onPressDetails }) => {
  return (
    <View style={styles.card}>
      {/* Safety Score Header */}
      <View style={styles.header}>
        <View style={styles.titleRow}>
          <View style={styles.badgeIcon}>
            <ShieldCheck size={18} color={colors.status.success} />
          </View>
          <View>
            <Text style={styles.cardTitle}>AI DYNAMIC SAFEST ROUTE</Text>
            <Text style={styles.shelterTarget}>To: {route.shelterName}</Text>
          </View>
        </View>

        <View style={styles.scoreContainer}>
          <Text style={styles.scoreValue}>{route.safetyScore}%</Text>
          <Text style={styles.scoreLabel}>SAFETY SCORE</Text>
        </View>
      </View>

      {/* Route Metrics Row */}
      <View style={styles.metricsRow}>
        <View style={styles.metricItem}>
          <Clock size={14} color={colors.text.secondary} />
          <Text style={styles.metricText}>{route.estimatedTimeMins} mins evac time</Text>
        </View>

        <View style={styles.metricDivider} />

        <View style={styles.metricItem}>
          <MapPin size={14} color={colors.text.secondary} />
          <Text style={styles.metricText}>{route.distanceKm} km distance</Text>
        </View>

        <View style={styles.metricDivider} />

        <SeverityBadge severity={route.riskIndex} size="sm" />
      </View>

      {/* Avoided Hazards Banner */}
      {route.avoidedHazards && route.avoidedHazards.length > 0 && (
        <View style={styles.avoidedBanner}>
          <AlertCircle size={14} color={colors.status.success} />
          <Text style={styles.avoidedText} numberOfLines={1}>
            Path bypasses: {route.avoidedHazards.join(', ')}
          </Text>
        </View>
      )}

      {/* Action Button */}
      {onPressDetails && (
        <TouchableOpacity style={styles.actionBtn} onPress={onPressDetails} activeOpacity={0.8}>
          <Navigation size={14} color="#FFF" />
          <Text style={styles.actionBtnText}>Start Turn-by-Turn Navigation</Text>
          <ChevronRight size={16} color="#FFF" />
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.background.secondary,
    borderRadius: radius.lg,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.border.strong,
    ...shadows.md,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.md,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    flex: 1,
  },
  badgeIcon: {
    width: 36,
    height: 36,
    borderRadius: radius.md,
    backgroundColor: 'rgba(16, 185, 129, 0.15)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardTitle: {
    color: colors.status.success,
    fontSize: typography.fontSize.xs,
    fontWeight: typography.fontWeight.heavy,
    letterSpacing: 0.5,
  },
  shelterTarget: {
    color: colors.text.primary,
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.bold,
  },
  scoreContainer: {
    alignItems: 'flex-end',
    backgroundColor: 'rgba(16, 185, 129, 0.1)',
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: 'rgba(16, 185, 129, 0.3)',
  },
  scoreValue: {
    color: colors.status.success,
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.heavy,
  },
  scoreLabel: {
    color: colors.text.secondary,
    fontSize: 9,
    fontWeight: typography.fontWeight.bold,
  },
  metricsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.background.tertiary,
    padding: spacing.sm,
    borderRadius: radius.md,
    marginBottom: spacing.sm,
  },
  metricItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  metricText: {
    color: colors.text.primary,
    fontSize: typography.fontSize.xs,
    fontWeight: typography.fontWeight.semibold,
  },
  metricDivider: {
    width: 1,
    height: 12,
    backgroundColor: colors.border.default,
  },
  avoidedBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(16, 185, 129, 0.1)',
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: radius.sm,
    gap: spacing.xs,
    marginBottom: spacing.md,
  },
  avoidedText: {
    color: colors.status.success,
    fontSize: typography.fontSize.xs,
    fontWeight: typography.fontWeight.medium,
    flex: 1,
  },
  actionBtn: {
    backgroundColor: colors.primary.main,
    borderRadius: radius.md,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xs,
    ...shadows.glowBlue,
  },
  actionBtnText: {
    color: '#FFF',
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.bold,
    flex: 1,
    textAlign: 'center',
  },
});
