import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { AlertTriangle, Users, Clock, ShieldAlert, ArrowRight } from 'lucide-react-native';
import { colors, radius, spacing, typography, shadows } from '../../theme';
import { Hazard } from '../../types';
import { SeverityBadge } from '../common/SeverityBadge';

interface Props {
  hazard: Hazard;
  onPress?: () => void;
}

export const HazardCard: React.FC<Props> = ({ hazard, onPress }) => {
  return (
    <TouchableOpacity
      style={styles.card}
      onPress={onPress}
      activeOpacity={0.85}
    >
      <View style={styles.header}>
        <View style={styles.titleRow}>
          <AlertTriangle size={18} color={colors.severity[hazard.severity].main} />
          <Text style={styles.title} numberOfLines={1}>
            {hazard.name}
          </Text>
        </View>
        <SeverityBadge severity={hazard.severity} size="sm" />
      </View>

      <Text style={styles.desc}>{hazard.description}</Text>

      <View style={styles.metricsRow}>
        <View style={styles.metricItem}>
          <Users size={12} color={colors.text.secondary} />
          <Text style={styles.metricText}>{hazard.affectedPopulation.toLocaleString()} Affected</Text>
        </View>

        <View style={styles.metricItem}>
          <Clock size={12} color={colors.text.secondary} />
          <Text style={styles.metricText}>Surge ETA: {hazard.predictedSurgeTimeMins || 25} mins</Text>
        </View>
      </View>

      <View style={styles.actionBox}>
        <Text style={styles.actionText}>Action: {hazard.recommendedAction}</Text>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.background.secondary,
    borderRadius: radius.lg,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.border.strong,
    marginBottom: spacing.sm,
    ...shadows.sm,
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
  title: {
    color: colors.text.primary,
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.heavy,
    flex: 1,
  },
  desc: {
    color: colors.text.secondary,
    fontSize: typography.fontSize.xs,
    lineHeight: 18,
    marginVertical: 4,
  },
  metricsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: spacing.xs,
  },
  metricItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  metricText: {
    color: colors.text.primary,
    fontSize: 11,
    fontWeight: typography.fontWeight.bold,
  },
  actionBox: {
    backgroundColor: colors.background.tertiary,
    borderRadius: radius.sm,
    padding: spacing.xs,
    marginTop: spacing.xs,
  },
  actionText: {
    color: colors.text.highlight,
    fontSize: 10,
    fontWeight: typography.fontWeight.semibold,
  },
});
