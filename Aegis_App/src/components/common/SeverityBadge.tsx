import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { SeverityLevel } from '../../types/disaster';
import { colors, typography, radius, spacing } from '../../theme';

interface Props {
  severity: SeverityLevel;
  size?: 'sm' | 'md' | 'lg';
  showDot?: boolean;
}

export const SeverityBadge: React.FC<Props> = ({
  severity,
  size = 'md',
  showDot = true,
}) => {
  const config = colors.severity[severity] || colors.severity.LOW;

  const isSmall = size === 'sm';
  const isLarge = size === 'lg';

  return (
    <View
      style={[
        styles.badge,
        {
          backgroundColor: config.background,
          borderColor: config.border,
          paddingHorizontal: isSmall ? spacing.xs : isLarge ? spacing.md : spacing.sm,
          paddingVertical: isSmall ? 2 : isLarge ? spacing.xs : 4,
        },
      ]}
    >
      {showDot && (
        <View
          style={[
            styles.dot,
            {
              backgroundColor: config.main,
              width: isSmall ? 6 : 8,
              height: isSmall ? 6 : 8,
            },
          ]}
        />
      )}
      <Text
        style={[
          styles.text,
          {
            color: config.text,
            fontSize: isSmall ? typography.fontSize.xs : isLarge ? typography.fontSize.md : typography.fontSize.sm,
          },
        ]}
      >
        {severity}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: radius.full,
    borderWidth: 1,
    alignSelf: 'flex-start',
  },
  dot: {
    borderRadius: radius.full,
    marginRight: spacing.xs,
  },
  text: {
    fontWeight: typography.fontWeight.bold,
    letterSpacing: 0.5,
  },
});
