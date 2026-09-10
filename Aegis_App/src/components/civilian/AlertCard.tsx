import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { AlertTriangle, Clock, MapPin, Building2, ChevronRight } from 'lucide-react-native';
import { colors, typography, spacing, radius, shadows } from '../../theme';
import { AlertMessage } from '../../types/alert';
import { SeverityBadge } from '../common/SeverityBadge';
import { RiskExplanationAccordion } from './RiskExplanationAccordion';
import { getAlertRiskReasons } from '../../utils/riskExplanation';

interface Props {
  alert: AlertMessage;
  onPressAction?: () => void;
}

export const AlertCard: React.FC<Props> = ({ alert, onPressAction }) => {
  const isCritical = alert.severity === 'CRITICAL';
  const riskFactors = getAlertRiskReasons(alert);

  return (
    <View style={[styles.card, isCritical && styles.cardCritical]}>
      <View style={styles.header}>
        <SeverityBadge severity={alert.severity} size="sm" />
        <View style={styles.timeRow}>
          <Clock size={12} color="#9CA3AF" />
          <Text style={styles.timeText}>{alert.issuedAt}</Text>
        </View>
      </View>

      <Text style={styles.title}>{alert.title}</Text>
      <Text style={styles.body}>{alert.body}</Text>

      <View style={styles.metaRow}>
        <View style={styles.metaItem}>
          <Building2 size={12} color="#71717A" />
          <Text style={styles.metaText} numberOfLines={1}>
            {alert.issuedBy}
          </Text>
        </View>
        <View style={styles.metaItem}>
          <MapPin size={12} color="#71717A" />
          <Text style={styles.metaText} numberOfLines={1}>
            {alert.targetRegion}
          </Text>
        </View>
      </View>

      {/* Why Am I At Risk? Expandable Accordion */}
      <RiskExplanationAccordion factors={riskFactors} theme="light" />

      {alert.actionRequired && (
        <TouchableOpacity
          style={[
            styles.actionButton,
            { backgroundColor: isCritical ? colors.severity.CRITICAL.main : colors.primary.main },
          ]}
          onPress={onPressAction}
          activeOpacity={0.85}
        >
          <AlertTriangle size={14} color="#FFF" />
          <Text style={styles.actionText}>
            ACTION REQUIRED: {alert.actionRequired.replace('_', ' ')}
          </Text>
          <ChevronRight size={14} color="#FFF" />
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: radius.xl,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: 'rgba(23, 32, 51, 0.08)',
    marginBottom: spacing.sm,
    ...shadows.sm,
  },
  cardCritical: {
    borderColor: 'rgba(185, 28, 28, 0.35)',
    backgroundColor: '#FFFFFF',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.xs,
  },
  timeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  timeText: {
    color: '#8494A7',
    fontSize: 11,
  },
  title: {
    color: colors.text.primary,
    fontSize: 15,
    fontWeight: typography.fontWeight.heavy,
    marginVertical: 4,
  },
  body: {
    color: colors.text.secondary,
    fontSize: 12,
    lineHeight: 18,
    marginBottom: spacing.sm,
  },
  metaRow: {
    gap: 4,
    marginBottom: spacing.sm,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  metaText: {
    color: colors.text.secondary,
    fontSize: 11,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.md,
    paddingVertical: 10,
    borderRadius: radius.pill,
    marginTop: spacing.xs,
  },
  actionText: {
    color: '#FFF',
    fontSize: 11,
    fontWeight: typography.fontWeight.heavy,
    letterSpacing: 0.5,
  },
});
