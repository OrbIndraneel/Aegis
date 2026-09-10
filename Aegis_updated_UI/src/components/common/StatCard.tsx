import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors, typography, spacing, radius, shadows } from '../../theme';

interface Props {
  title: string;
  value: string | number;
  subtitle?: string;
  icon?: React.ReactNode;
  variant?: 'default' | 'danger' | 'warning' | 'success';
}

export const StatCard: React.FC<Props> = ({
  title,
  value,
  subtitle,
  icon,
  variant = 'default',
}) => {
  const getBorderColor = () => {
    switch (variant) {
      case 'danger':
        return colors.severity.CRITICAL.border;
      case 'warning':
        return colors.severity.MODERATE.border;
      case 'success':
        return colors.severity.LOW.border;
      default:
        return colors.border.subtle;
    }
  };

  const getValueColor = () => {
    switch (variant) {
      case 'danger':
        return colors.severity.CRITICAL.text;
      case 'warning':
        return colors.severity.MODERATE.text;
      case 'success':
        return colors.severity.LOW.text;
      default:
        return colors.text.primary;
    }
  };

  return (
    <View style={[styles.card, { borderColor: getBorderColor() }]}>
      <View style={styles.header}>
        <Text style={styles.title} numberOfLines={1}>
          {title}
        </Text>
        {icon && <View style={styles.iconWrapper}>{icon}</View>}
      </View>
      <Text style={[styles.value, { color: getValueColor() }]} numberOfLines={1}>
        {value}
      </Text>
      {subtitle && (
        <Text style={styles.subtitle} numberOfLines={1}>
          {subtitle}
        </Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.background.secondary,
    borderRadius: radius.md,
    padding: spacing.md,
    borderWidth: 1,
    flex: 1,
    minWidth: 140,
    ...shadows.sm,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.xs,
  },
  title: {
    color: colors.text.secondary,
    fontSize: typography.fontSize.xs,
    fontWeight: typography.fontWeight.semibold,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    flex: 1,
  },
  iconWrapper: {
    marginLeft: spacing.xs,
  },
  value: {
    fontSize: typography.fontSize.xl,
    fontWeight: typography.fontWeight.heavy,
    marginVertical: 2,
  },
  subtitle: {
    color: colors.text.muted,
    fontSize: 11,
  },
});
