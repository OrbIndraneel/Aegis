import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { CloudRain, Zap, Mountain, AlertCircle } from 'lucide-react-native';
import { colors, radius, spacing, typography, shadows } from '../../theme';

interface Props {
  activeScenario: 'NORMAL' | 'FLOOD_SURGE' | 'UTTARAKHAND_CASCADE';
  onSelectScenario: (scenario: 'NORMAL' | 'FLOOD_SURGE' | 'UTTARAKHAND_CASCADE') => void;
}

export const DemoScenarioSelector: React.FC<Props> = ({
  activeScenario,
  onSelectScenario,
}) => {
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Zap size={12} color={colors.safety.main} />
        <Text style={styles.title}>DEMO DISASTER SCENARIOS</Text>
      </View>

      <View style={styles.scenarioRow}>
        <TouchableOpacity
          style={[styles.chip, activeScenario === 'NORMAL' && styles.chipActive]}
          onPress={() => onSelectScenario('NORMAL')}
        >
          <Text style={[styles.chipText, activeScenario === 'NORMAL' && styles.chipTextActive]}>
            Vadodara Normal
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.chip, activeScenario === 'FLOOD_SURGE' && styles.chipActive]}
          onPress={() => onSelectScenario('FLOOD_SURGE')}
        >
          <CloudRain size={10} color={activeScenario === 'FLOOD_SURGE' ? '#FFF' : colors.text.secondary} />
          <Text style={[styles.chipText, activeScenario === 'FLOOD_SURGE' && styles.chipTextActive]}>
            Vishwamitri Surge
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.chip, activeScenario === 'UTTARAKHAND_CASCADE' && styles.chipActiveDanger]}
          onPress={() => onSelectScenario('UTTARAKHAND_CASCADE')}
        >
          <Mountain size={10} color="#FFF" />
          <Text style={[styles.chipText, activeScenario === 'UTTARAKHAND_CASCADE' && styles.chipTextActive]}>
            Uttarakhand Cascade
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.background.secondary,
    borderRadius: radius.md,
    padding: spacing.xs,
    borderWidth: 1,
    borderColor: colors.border.strong,
    marginHorizontal: spacing.md,
    marginTop: spacing.xs,
    ...shadows.sm,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 4,
    paddingHorizontal: 4,
  },
  title: {
    color: colors.safety.main,
    fontSize: 9,
    fontWeight: typography.fontWeight.heavy,
    letterSpacing: 0.5,
  },
  scenarioRow: {
    flexDirection: 'row',
    gap: spacing.xs,
  },
  chip: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.background.tertiary,
    paddingVertical: 4,
    borderRadius: radius.xs,
    borderWidth: 1,
    borderColor: colors.border.subtle,
    gap: 2,
  },
  chipActive: {
    backgroundColor: colors.primary.main,
    borderColor: colors.primary.light,
  },
  chipActiveDanger: {
    backgroundColor: colors.severity.CRITICAL.main,
    borderColor: colors.severity.CRITICAL.border,
  },
  chipText: {
    color: colors.text.secondary,
    fontSize: 10,
    fontWeight: typography.fontWeight.semibold,
  },
  chipTextActive: {
    color: '#FFF',
    fontWeight: typography.fontWeight.bold,
  },
});
