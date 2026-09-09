import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated } from 'react-native';
import { AlertOctagon } from 'lucide-react-native';
import { colors, typography, spacing, radius, shadows } from '../../theme';

interface Props {
  onPress: () => void;
  size?: 'normal' | 'large';
}

export const SOSButton: React.FC<Props> = ({ onPress, size = 'normal' }) => {
  const isLarge = size === 'large';
  const buttonDiameter = isLarge ? 120 : 64;

  return (
    <TouchableOpacity
      style={[
        styles.sosOuter,
        {
          width: buttonDiameter,
          height: buttonDiameter,
          borderRadius: buttonDiameter / 2,
        },
      ]}
      onPress={onPress}
      activeOpacity={0.85}
    >
      <View
        style={[
          styles.sosInner,
          {
            width: buttonDiameter - 12,
            height: buttonDiameter - 12,
            borderRadius: (buttonDiameter - 12) / 2,
          },
        ]}
      >
        <AlertOctagon size={isLarge ? 36 : 22} color="#FFF" />
        <Text style={[styles.sosText, isLarge && styles.sosTextLarge]}>EMERGENCY</Text>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  sosOuter: {
    backgroundColor: 'rgba(220, 38, 38, 0.3)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: colors.severity.CRITICAL.main,
    ...shadows.glowRed,
  },
  sosInner: {
    backgroundColor: colors.severity.CRITICAL.main,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 8,
  },
  sosText: {
    color: '#FFF',
    fontSize: 10,
    fontWeight: typography.fontWeight.heavy,
    letterSpacing: 1,
    marginTop: 2,
  },
  sosTextLarge: {
    fontSize: typography.fontSize.lg,
  },
});
