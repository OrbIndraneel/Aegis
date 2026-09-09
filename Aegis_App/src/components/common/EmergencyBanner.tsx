import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { AlertTriangle, Clock, MapPin, X, ChevronRight, Info } from 'lucide-react-native';
import { colors, radius, spacing, typography, shadows } from '../../theme';
import { EmergencyAlert } from '../../types';
import { SeverityBadge } from './SeverityBadge';

interface Props {
  alert?: EmergencyAlert | null;
  onPressEvacuate?: () => void;
}

export const EmergencyBanner: React.FC<Props> = ({ alert, onPressEvacuate }) => {
  const [dismissed, setDismissed] = useState(false);

  if (!alert || dismissed) return null;

  const isCritical = alert.severity === 'CRITICAL';

  return (
    <View style={[styles.banner, isCritical && styles.bannerCritical]}>
      {/* Header Row */}
      <View style={styles.headRow}>
        <SeverityBadge severity={alert.severity} size="sm" />
        <View style={styles.timeBox}>
          <Clock size={12} color={colors.text.secondary} />
          <Text style={styles.timeText}>{alert.issuedAt}</Text>
        </View>
        <TouchableOpacity onPress={() => setDismissed(true)} style={styles.dismissBtn}>
          <X size={16} color={colors.text.secondary} />
        </TouchableOpacity>
      </View>

      {/* Headline & Instructions */}
      <Text style={styles.title}>{alert.title}</Text>
      <Text style={styles.body}>{alert.body}</Text>

      {/* Target Region */}
      <View style={styles.regionRow}>
        <MapPin size={12} color={colors.text.muted} />
        <Text style={styles.regionText}>Target Zone: {alert.targetRegion} • Issued by {alert.issuedBy}</Text>
      </View>

      {/* OS DND Disclaimer Note */}
      <View style={styles.disclaimerRow}>
        <Info size={11} color={colors.text.muted} />
        <Text style={styles.disclaimerText}>
          In-app emergency notifications respect device OS notification permissions & DND settings.
        </Text>
      </View>

      {/* Action CTA Button */}
      {onPressEvacuate && alert.actionRequired === 'EVACUATE_IMMEDIATELY' && (
        <TouchableOpacity
          style={styles.actionBtn}
          onPress={onPressEvacuate}
          activeOpacity={0.85}
        >
          <AlertTriangle size={14} color="#FFF" />
          <Text style={styles.actionText}>EXECUTE IMMEDIATE SAFE EVACUATION</Text>
          <ChevronRight size={14} color="#FFF" />
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  banner: {
    backgroundColor: colors.background.secondary,
    borderRadius: radius.lg,
    padding: spacing.md,
    borderWidth: 1.5,
    borderColor: colors.border.strong,
    marginHorizontal: spacing.md,
    marginVertical: spacing.xs,
    ...shadows.md,
  },
  bannerCritical: {
    backgroundColor: 'rgba(220, 38, 38, 0.12)',
    borderColor: colors.severity.CRITICAL.border,
    ...shadows.glowRed,
  },
  headRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.xs,
  },
  timeBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  timeText: {
    color: colors.text.secondary,
    fontSize: 11,
  },
  dismissBtn: {
    padding: 2,
  },
  title: {
    color: colors.text.primary,
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.heavy,
    marginVertical: 2,
  },
  body: {
    color: colors.text.secondary,
    fontSize: typography.fontSize.xs,
    lineHeight: 18,
    marginVertical: 4,
  },
  regionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginVertical: 2,
  },
  regionText: {
    color: colors.text.muted,
    fontSize: 10,
  },
  disclaimerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 4,
    paddingTop: 4,
    borderTopWidth: 1,
    borderTopColor: colors.border.subtle,
  },
  disclaimerText: {
    color: colors.text.muted,
    fontSize: 9,
    fontStyle: 'italic',
    flex: 1,
  },
  actionBtn: {
    backgroundColor: colors.severity.CRITICAL.main,
    borderRadius: radius.md,
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xs,
    marginTop: spacing.sm,
  },
  actionText: {
    color: '#FFF',
    fontSize: typography.fontSize.xs,
    fontWeight: typography.fontWeight.heavy,
    letterSpacing: 0.5,
  },
});
