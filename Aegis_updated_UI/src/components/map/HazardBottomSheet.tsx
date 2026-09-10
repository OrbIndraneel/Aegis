import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { AlertTriangle, X, Navigation, Users, Clock, ShieldAlert, ArrowRight } from 'lucide-react-native';
import { colors, radius, spacing, typography, shadows } from '../../theme';
import { Hazard } from '../../types';
import { SeverityBadge } from '../common/SeverityBadge';

interface Props {
  hazard: Hazard;
  onClose: () => void;
  onEvacuateAway: (hazard: Hazard) => void;
}

export const HazardBottomSheet: React.FC<Props> = ({
  hazard,
  onClose,
  onEvacuateAway,
}) => {
  return (
    <View style={styles.sheet}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.titleRow}>
          <View style={[styles.iconBox, { backgroundColor: 'rgba(239, 68, 68, 0.15)' }]}>
            <AlertTriangle size={20} color={colors.severity[hazard.severity].main} />
          </View>
          <View style={styles.flex1}>
            <Text style={styles.title} numberOfLines={1}>
              {hazard.name}
            </Text>
            <Text style={styles.subtitle}>Type: {hazard.type.replace('_', ' ')} • Last updated {hazard.lastUpdated}</Text>
          </View>
        </View>
        <TouchableOpacity style={styles.closeBtn} onPress={onClose} activeOpacity={0.8}>
          <X size={18} color={colors.text.secondary} />
        </TouchableOpacity>
      </View>

      {/* Badges Row */}
      <View style={styles.badgeRow}>
        <SeverityBadge severity={hazard.severity} size="md" />
        <View style={styles.probChip}>
          <Text style={styles.probText}>PROBABILITY: {hazard.probability}%</Text>
        </View>
        <View style={styles.riskChip}>
          <Text style={styles.riskText}>RISK INDEX: {hazard.riskScore}/100</Text>
        </View>
      </View>

      {/* Description */}
      <Text style={styles.desc}>{hazard.description}</Text>

      {/* Detailed Metrics Grid */}
      <View style={styles.metricsGrid}>
        <View style={styles.metricBox}>
          <Users size={14} color={colors.text.secondary} />
          <Text style={styles.metricVal}>{hazard.affectedPopulation.toLocaleString()}</Text>
          <Text style={styles.metricSub}>AFFECTED PEOPLE</Text>
        </View>

        <View style={styles.metricBox}>
          <Clock size={14} color={colors.text.secondary} />
          <Text style={styles.metricVal}>{hazard.predictedSurgeTimeMins || 25} MINS</Text>
          <Text style={styles.metricSub}>SURGE ETA</Text>
        </View>

        <View style={styles.metricBox}>
          <ShieldAlert size={14} color={colors.severity.CRITICAL.main} />
          <Text style={styles.metricVal}>{hazard.radiusMeters || 1800}m</Text>
          <Text style={styles.metricSub}>THREAT RADIUS</Text>
        </View>
      </View>

      {/* Recommended Action */}
      <View style={styles.actionBox}>
        <Text style={styles.actionHeader}>💡 RECOMMENDED CIVILIAN ACTION</Text>
        <Text style={styles.actionBody}>{hazard.recommendedAction}</Text>
      </View>

      {/* CTA Button */}
      <TouchableOpacity
        style={styles.ctaBtn}
        onPress={() => onEvacuateAway(hazard)}
        activeOpacity={0.85}
      >
        <Navigation size={16} color="#FFF" />
        <Text style={styles.ctaText}>CALCULATE SAFEST EVACUATION PATH AWAY</Text>
        <ArrowRight size={16} color="#FFF" />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  sheet: {
    position: 'absolute',
    bottom: spacing.md,
    left: spacing.md,
    right: spacing.md,
    backgroundColor: colors.background.secondary,
    borderRadius: radius.xl,
    padding: spacing.md,
    borderWidth: 1.5,
    borderColor: colors.severity.CRITICAL.border,
    zIndex: 25,
    ...shadows.lg,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.xs,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    flex: 1,
  },
  iconBox: {
    width: 38,
    height: 38,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  flex1: {
    flex: 1,
  },
  title: {
    color: colors.text.primary,
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.heavy,
  },
  subtitle: {
    color: colors.text.secondary,
    fontSize: 11,
  },
  closeBtn: {
    padding: 4,
  },
  badgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    marginVertical: spacing.xs,
  },
  probChip: {
    backgroundColor: 'rgba(245, 158, 11, 0.15)',
    paddingHorizontal: spacing.xs,
    paddingVertical: 2,
    borderRadius: radius.xs,
    borderWidth: 1,
    borderColor: 'rgba(245, 158, 11, 0.4)',
  },
  probText: {
    color: colors.severity.MODERATE.text,
    fontSize: 10,
    fontWeight: typography.fontWeight.bold,
  },
  riskChip: {
    backgroundColor: 'rgba(220, 38, 38, 0.15)',
    paddingHorizontal: spacing.xs,
    paddingVertical: 2,
    borderRadius: radius.xs,
    borderWidth: 1,
    borderColor: 'rgba(220, 38, 38, 0.4)',
  },
  riskText: {
    color: colors.severity.CRITICAL.text,
    fontSize: 10,
    fontWeight: typography.fontWeight.bold,
  },
  desc: {
    color: colors.text.secondary,
    fontSize: typography.fontSize.xs,
    lineHeight: 18,
    marginVertical: spacing.xs,
  },
  metricsGrid: {
    flexDirection: 'row',
    gap: spacing.xs,
    marginVertical: spacing.xs,
  },
  metricBox: {
    flex: 1,
    backgroundColor: colors.background.tertiary,
    padding: spacing.xs,
    borderRadius: radius.md,
    alignItems: 'center',
  },
  metricVal: {
    color: colors.text.primary,
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.heavy,
    marginVertical: 2,
  },
  metricSub: {
    color: colors.text.muted,
    fontSize: 8,
    fontWeight: typography.fontWeight.bold,
  },
  actionBox: {
    backgroundColor: colors.background.tertiary,
    borderRadius: radius.md,
    padding: spacing.sm,
    marginVertical: spacing.xs,
  },
  actionHeader: {
    color: colors.text.highlight,
    fontSize: 10,
    fontWeight: typography.fontWeight.bold,
  },
  actionBody: {
    color: colors.text.primary,
    fontSize: typography.fontSize.xs,
    marginTop: 2,
  },
  ctaBtn: {
    backgroundColor: colors.severity.CRITICAL.main,
    borderRadius: radius.md,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xs,
    marginTop: spacing.xs,
    ...shadows.glowRed,
  },
  ctaText: {
    color: '#FFF',
    fontSize: typography.fontSize.xs,
    fontWeight: typography.fontWeight.heavy,
    letterSpacing: 0.5,
  },
});
