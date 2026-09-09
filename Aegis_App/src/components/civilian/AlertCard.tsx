import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { AlertTriangle, Clock, MapPin, Building2, ChevronRight } from 'lucide-react-native';
import { colors, typography, spacing, radius, shadows } from '../../theme';
import { AlertMessage } from '../../types/alert';
import { SeverityBadge } from '../common/SeverityBadge';

interface Props {
  alert: AlertMessage;
  onPressAction?: () => void;
}

export const AlertCard: React.FC<Props> = ({ alert, onPressAction }) => {
  const isCritical = alert.severity === 'CRITICAL';

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

      {alert.actionRequired && (
        <TouchableOpacity
          style={[
            styles.actionButton,
            { backgroundColor: isCritical ? '#DC2626' : '#18181B' },
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
    borderColor: 'rgba(0, 0, 0, 0.05)',
    marginBottom: spacing.sm,
    ...shadows.sm,
  },
  cardCritical: {
    borderColor: 'rgba(220, 38, 38, 0.25)',
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
    color: '#9CA3AF',
    fontSize: 11,
  },
  title: {
    color: '#18181B',
    fontSize: 15,
    fontWeight: typography.fontWeight.heavy,
    marginVertical: 4,
  },
  body: {
    color: '#71717A',
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
    color: '#71717A',
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
