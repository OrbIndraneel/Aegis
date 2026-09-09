import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { CloudRain, Waves, Cpu, Play } from 'lucide-react-native';
import { colors, typography, spacing, radius, shadows } from '../../theme';
import { useAuthorityStore } from '../../store/useAuthorityStore';

export const SimulationControl: React.FC = () => {
  const {
    rainfallMmInput,
    riverLevelMetersInput,
    setRainfallMm,
    setRiverLevelMeters,
    runCascadeSimulation,
    isSimulating,
  } = useAuthorityStore();

  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <View style={styles.iconBox}>
          <Cpu size={18} color={colors.safety.main} />
        </View>
        <View>
          <Text style={styles.title}>AI SCENARIO & CASCADE SIMULATOR</Text>
          <Text style={styles.subtitle}>Simulate secondary flood & landslide hazards</Text>
        </View>
      </View>

      {/* Rainfall Slider Input Controls */}
      <View style={styles.inputGroup}>
        <View style={styles.labelRow}>
          <View style={styles.labelLeft}>
            <CloudRain size={14} color={colors.text.secondary} />
            <Text style={styles.label}>Precipitation Rate</Text>
          </View>
          <Text style={styles.valueText}>{rainfallMmInput} mm/hr</Text>
        </View>
        <View style={styles.presetRow}>
          {[50, 120, 180, 250, 320].map((val) => (
            <TouchableOpacity
              key={val}
              style={[styles.presetChip, rainfallMmInput === val && styles.presetChipActive]}
              onPress={() => setRainfallMm(val)}
            >
              <Text style={[styles.presetText, rainfallMmInput === val && styles.presetTextActive]}>
                {val}mm
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* River Level Surge Controls */}
      <View style={styles.inputGroup}>
        <View style={styles.labelRow}>
          <View style={styles.labelLeft}>
            <Waves size={14} color={colors.text.secondary} />
            <Text style={styles.label}>Vishwamitri River Height</Text>
          </View>
          <Text style={styles.valueText}>{riverLevelMetersInput.toFixed(1)} m</Text>
        </View>
        <View style={styles.presetRow}>
          {[1.2, 1.8, 2.4, 3.0, 3.8].map((val) => (
            <TouchableOpacity
              key={val}
              style={[styles.presetChip, riverLevelMetersInput === val && styles.presetChipActive]}
              onPress={() => setRiverLevelMeters(val)}
            >
              <Text style={[styles.presetText, riverLevelMetersInput === val && styles.presetTextActive]}>
                {val}m
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Run Simulation Trigger */}
      <TouchableOpacity
        style={styles.simButton}
        onPress={runCascadeSimulation}
        disabled={isSimulating}
        activeOpacity={0.8}
      >
        <Play size={16} color="#FFF" />
        <Text style={styles.simButtonText}>
          {isSimulating ? 'Computing Neural Cascade...' : 'RUN AI SCENARIO SIMULATION'}
        </Text>
      </TouchableOpacity>
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
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  iconBox: {
    width: 36,
    height: 36,
    borderRadius: radius.md,
    backgroundColor: 'rgba(249, 115, 22, 0.15)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    color: colors.safety.main,
    fontSize: typography.fontSize.xs,
    fontWeight: typography.fontWeight.heavy,
    letterSpacing: 0.5,
  },
  subtitle: {
    color: colors.text.secondary,
    fontSize: typography.fontSize.xs,
  },
  inputGroup: {
    marginBottom: spacing.md,
  },
  labelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.xs,
  },
  labelLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  label: {
    color: colors.text.primary,
    fontSize: typography.fontSize.xs,
    fontWeight: typography.fontWeight.semibold,
  },
  valueText: {
    color: colors.primary.light,
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.bold,
  },
  presetRow: {
    flexDirection: 'row',
    gap: spacing.xs,
  },
  presetChip: {
    flex: 1,
    backgroundColor: colors.background.tertiary,
    paddingVertical: spacing.xs,
    borderRadius: radius.sm,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border.subtle,
  },
  presetChipActive: {
    backgroundColor: colors.primary.main,
    borderColor: colors.primary.light,
  },
  presetText: {
    color: colors.text.secondary,
    fontSize: typography.fontSize.xs,
    fontWeight: typography.fontWeight.medium,
  },
  presetTextActive: {
    color: '#FFF',
    fontWeight: typography.fontWeight.bold,
  },
  simButton: {
    backgroundColor: colors.safety.main,
    borderRadius: radius.md,
    paddingVertical: spacing.sm,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xs,
    marginTop: spacing.xs,
  },
  simButtonText: {
    color: '#FFF',
    fontSize: typography.fontSize.xs,
    fontWeight: typography.fontWeight.heavy,
    letterSpacing: 0.5,
  },
});
