import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Network, AlertTriangle, CheckCircle2, ShieldAlert, Cpu } from 'lucide-react-native';
import { colors, typography, spacing, radius, shadows } from '../../theme';
import { CascadePrediction } from '../../types/disaster';
import { SeverityBadge } from '../common/SeverityBadge';

interface Props {
  prediction: CascadePrediction;
}

export const CascadePredictionCard: React.FC<Props> = ({ prediction }) => {
  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <View style={styles.titleRow}>
          <View style={styles.badgeIcon}>
            <Cpu size={18} color={colors.primary.main} />
          </View>
          <View style={styles.titleTextContainer}>
            <Text style={styles.title}>AI PREDICTED CASCADE RISKS</Text>
            <Text style={styles.trigger}>Trigger: {prediction.primaryDisaster.triggerValue}</Text>
          </View>
        </View>
        <View style={styles.confidenceBox}>
          <Text style={styles.confidenceScore}>{prediction.confidenceScore}%</Text>
          <Text style={styles.confidenceLabel}>AI CONFIDENCE</Text>
        </View>
      </View>

      {/* Secondary Hazard Tree List */}
      <Text style={styles.sectionTitle}>SECONDARY DISASTER IMPACT PREVIEW</Text>
      {prediction.predictedSecondaryHazards.map((item, index) => (
        <View key={item.id} style={styles.cascadeItem}>
          <View style={styles.treeLine} />
          <View style={styles.itemContent}>
            <View style={styles.itemHeader}>
              <Text style={styles.hazardName} numberOfLines={1}>
                {item.hazardName}
              </Text>
              <SeverityBadge severity={item.severity} size="sm" />
            </View>

            <View style={styles.probRow}>
              <Text style={styles.probText}>Probability: {item.probability}%</Text>
              <Text style={styles.timeText}>ETA: In {item.estimatedTimeHours} hrs</Text>
            </View>

            <Text style={styles.sectorText}>Sector: {item.affectedSector}</Text>
            <Text style={styles.actionText}>💡 {item.recommendedAction}</Text>
          </View>
        </View>
      ))}

      {/* Impacted Infrastructure Nodes */}
      <Text style={styles.sectionTitle}>INFRASTRUCTURE VULNERABILITY MATRIX</Text>
      <View style={styles.infraGrid}>
        {prediction.impactedInfrastructure.map((infra, idx) => (
          <View key={idx} style={styles.infraChip}>
            <ShieldAlert size={12} color={colors.text.secondary} />
            <Text style={styles.infraName} numberOfLines={1}>
              {infra.name}
            </Text>
            <SeverityBadge severity={infra.riskLevel} size="sm" showDot={false} />
          </View>
        ))}
      </View>
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
    marginBottom: spacing.md,
    ...shadows.md,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.md,
    paddingBottom: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.border.subtle,
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
    backgroundColor: 'rgba(59, 130, 246, 0.15)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  titleTextContainer: {
    flex: 1,
  },
  title: {
    color: colors.primary.light,
    fontSize: typography.fontSize.xs,
    fontWeight: typography.fontWeight.heavy,
    letterSpacing: 0.5,
  },
  trigger: {
    color: colors.text.secondary,
    fontSize: 11,
  },
  confidenceBox: {
    alignItems: 'flex-end',
    backgroundColor: 'rgba(59, 130, 246, 0.1)',
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: 'rgba(59, 130, 246, 0.3)',
  },
  confidenceScore: {
    color: colors.primary.light,
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.heavy,
  },
  confidenceLabel: {
    color: colors.text.secondary,
    fontSize: 8,
    fontWeight: typography.fontWeight.bold,
  },
  sectionTitle: {
    color: colors.text.secondary,
    fontSize: typography.fontSize.xs,
    fontWeight: typography.fontWeight.bold,
    letterSpacing: 0.5,
    marginVertical: spacing.xs,
  },
  cascadeItem: {
    flexDirection: 'row',
    marginVertical: spacing.xs,
    paddingLeft: spacing.xs,
  },
  treeLine: {
    width: 2,
    backgroundColor: colors.primary.main,
    marginRight: spacing.sm,
    borderRadius: radius.full,
  },
  itemContent: {
    flex: 1,
    backgroundColor: colors.background.tertiary,
    borderRadius: radius.md,
    padding: spacing.sm,
    borderWidth: 1,
    borderColor: colors.border.subtle,
  },
  itemHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  hazardName: {
    color: colors.text.primary,
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.bold,
    flex: 1,
    marginRight: spacing.xs,
  },
  probRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: 2,
  },
  probText: {
    color: colors.severity.MODERATE.text,
    fontSize: typography.fontSize.xs,
    fontWeight: typography.fontWeight.semibold,
  },
  timeText: {
    color: colors.text.secondary,
    fontSize: typography.fontSize.xs,
  },
  sectorText: {
    color: colors.text.secondary,
    fontSize: 11,
    marginVertical: 2,
  },
  actionText: {
    color: colors.text.highlight,
    fontSize: 11,
    marginTop: 2,
    fontStyle: 'italic',
  },
  infraGrid: {
    gap: spacing.xs,
    marginTop: spacing.xs,
  },
  infraChip: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.background.tertiary,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: radius.sm,
    borderWidth: 1,
    borderColor: colors.border.subtle,
  },
  infraName: {
    color: colors.text.primary,
    fontSize: typography.fontSize.xs,
    flex: 1,
    marginHorizontal: spacing.xs,
  },
});
