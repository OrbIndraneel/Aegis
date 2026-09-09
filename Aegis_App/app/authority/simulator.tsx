import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Header } from '../../src/components/common/Header';
import { ConnectionStatus } from '../../src/components/common/ConnectionStatus';
import { useAuthorityStore } from '../../src/store/useAuthorityStore';
import { colors, typography, spacing, radius, shadows } from '../../src/theme';
import { Cpu, CloudRain, Waves, Play, AlertTriangle, ShieldAlert, ArrowDown, Network, CheckCircle2 } from 'lucide-react-native';
import { SeverityBadge } from '../../src/components/common/SeverityBadge';

export default function SimulatorScreen() {
  const {
    rainfallMmInput,
    riverLevelMetersInput,
    setRainfallMm,
    setRiverLevelMeters,
    cascadePrediction,
    runCascadeSimulation,
    isSimulating,
  } = useAuthorityStore();

  const [durationHours, setDurationHours] = useState(6);
  const [soilSaturationPercent, setSoilSaturationPercent] = useState(94);
  const [targetRegion, setTargetRegion] = useState('Vadodara & Chamoli Corridor');

  const handleRunScenario = async () => {
    await runCascadeSimulation();
  };

  return (
    <SafeAreaView style={styles.container}>
      <Header title="AI CASCADE & SCENARIO SIMULATOR" />
      <ConnectionStatus />

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* PROMINENT AI PREDICTION BADGE */}
        <View style={styles.aiBadgeBanner}>
          <Cpu size={20} color={colors.primary.light} />
          <View style={styles.flex1}>
            <Text style={styles.aiBadgeTag}>AEGIS AI GNN & OR-TOOLS SOLVER ENGINE</Text>
            <Text style={styles.aiBadgeTitle}>Secondary Hazard Cascade Predictor</Text>
          </View>
          <View style={styles.confidenceBox}>
            <Text style={styles.confidenceVal}>94.8%</Text>
            <Text style={styles.confidenceSub}>CONFIDENCE</Text>
          </View>
        </View>

        {/* 1. SCENARIO SIMULATOR INPUT FORM */}
        <View style={styles.card}>
          <Text style={styles.cardSectionTitle}>SCENARIO PARAMETERS INPUT</Text>

          {/* Region */}
          <Text style={styles.label}>AFFECTED REGION / CATCHMENT BASIN</Text>
          <TextInput
            style={styles.input}
            value={targetRegion}
            onChangeText={setTargetRegion}
          />

          {/* Rainfall & Duration */}
          <View style={styles.inputRow}>
            <View style={styles.flex1}>
              <Text style={styles.label}>RAINFALL (MM/HR)</Text>
              <View style={styles.presetGrid}>
                {[120, 180, 250, 320].map((val) => (
                  <TouchableOpacity
                    key={val}
                    style={[styles.presetChip, rainfallMmInput === val && styles.presetActive]}
                    onPress={() => setRainfallMm(val)}
                  >
                    <Text style={[styles.presetText, rainfallMmInput === val && styles.presetTextActive]}>
                      {val}mm
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <View style={styles.flex1}>
              <Text style={styles.label}>DURATION (HOURS)</Text>
              <View style={styles.presetGrid}>
                {[3, 6, 12, 24].map((val) => (
                  <TouchableOpacity
                    key={val}
                    style={[styles.presetChip, durationHours === val && styles.presetActive]}
                    onPress={() => setDurationHours(val)}
                  >
                    <Text style={[styles.presetText, durationHours === val && styles.presetTextActive]}>
                      {val}h
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          </View>

          {/* Soil Saturation & River Level */}
          <View style={styles.inputRow}>
            <View style={styles.flex1}>
              <Text style={styles.label}>SOIL SATURATION (%)</Text>
              <View style={styles.presetGrid}>
                {[60, 80, 94, 100].map((val) => (
                  <TouchableOpacity
                    key={val}
                    style={[styles.presetChip, soilSaturationPercent === val && styles.presetActive]}
                    onPress={() => setSoilSaturationPercent(val)}
                  >
                    <Text style={[styles.presetText, soilSaturationPercent === val && styles.presetTextActive]}>
                      {val}%
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <View style={styles.flex1}>
              <Text style={styles.label}>RIVER LEVEL (METERS)</Text>
              <View style={styles.presetGrid}>
                {[1.8, 2.6, 3.2, 4.0].map((val) => (
                  <TouchableOpacity
                    key={val}
                    style={[styles.presetChip, riverLevelMetersInput === val && styles.presetActive]}
                    onPress={() => setRiverLevelMeters(val)}
                  >
                    <Text style={[styles.presetText, riverLevelMetersInput === val && styles.presetTextActive]}>
                      {val}m
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          </View>

          {/* RUN SCENARIO BUTTON */}
          <TouchableOpacity
            style={styles.runBtn}
            onPress={handleRunScenario}
            disabled={isSimulating}
            activeOpacity={0.85}
          >
            <Play size={18} color="#FFF" />
            <Text style={styles.runBtnText}>
              {isSimulating ? 'RUNNING AI SCENARIO SIMULATION...' : 'RUN SCENARIO'}
            </Text>
          </TouchableOpacity>
        </View>

        {/* 2. MOCK PREDICTION RESULTS & PROBABILITIES */}
        <View style={styles.card}>
          <Text style={styles.cardSectionTitle}>CURRENT EVENT & AI PROBABILITIES</Text>
          <View style={styles.currentEventBox}>
            <CloudRain size={16} color={colors.primary.light} />
            <Text style={styles.currentEventText}>
              Current Event: Heavy Rainfall ({rainfallMmInput} mm / {durationHours} hours)
            </Text>
          </View>

          {/* Probability Cards */}
          <View style={styles.probGrid}>
            <View style={[styles.probCard, { borderColor: colors.severity.CRITICAL.border }]}>
              <Text style={styles.probVal}>91%</Text>
              <Text style={styles.probLabel}>FLOOD PROBABILITY</Text>
            </View>
            <View style={[styles.probCard, { borderColor: colors.severity.HIGH.border }]}>
              <Text style={[styles.probVal, { color: colors.severity.MODERATE.text }]}>84%</Text>
              <Text style={styles.probLabel}>LANDSLIDE PROBABILITY</Text>
            </View>
            <View style={[styles.probCard, { borderColor: colors.primary.main }]}>
              <Text style={[styles.probVal, { color: colors.primary.light }]}>67%</Text>
              <Text style={styles.probLabel}>ROAD FAILURE</Text>
            </View>
          </View>

          <Text style={styles.popEstimateText}>
            💡 Estimated Affected Population: <Text style={{ color: colors.text.primary, fontWeight: 'bold' }}>48,200 Citizens</Text>
          </Text>
        </View>

        {/* 3. VISUAL CASCADE CHAIN */}
        <View style={styles.card}>
          <Text style={styles.cardSectionTitle}>VISUAL DISASTER CASCADE CHAIN</Text>
          <View style={styles.chainContainer}>
            <View style={styles.chainNode}>
              <Text style={styles.nodeTitle}>Heavy Rainfall</Text>
              <Text style={styles.nodeSub}>{rainfallMmInput} mm / {durationHours}h</Text>
            </View>
            <ArrowDown size={14} color={colors.primary.main} style={styles.chainArrow} />

            <View style={styles.chainNode}>
              <Text style={styles.nodeTitle}>Soil Saturation</Text>
              <Text style={styles.nodeSub}>{soilSaturationPercent}% Moisture Saturation</Text>
            </View>
            <ArrowDown size={14} color={colors.safety.main} style={styles.chainArrow} />

            <View style={styles.chainNode}>
              <Text style={styles.nodeTitle}>Landslide Risk</Text>
              <Text style={styles.nodeSub}>Chamoli NH-7 Hillside Slope Failure</Text>
            </View>
            <ArrowDown size={14} color={colors.severity.CRITICAL.main} style={styles.chainArrow} />

            <View style={styles.chainNode}>
              <Text style={styles.nodeTitle}>Road Closure</Text>
              <Text style={styles.nodeSub}>National Highway 8 Corridor Sealed</Text>
            </View>
            <ArrowDown size={14} color={colors.severity.CRITICAL.main} style={styles.chainArrow} />

            <View style={[styles.chainNode, styles.finalNode]}>
              <Text style={[styles.nodeTitle, { color: colors.status.success }]}>Evacuation Impact</Text>
              <Text style={styles.nodeSub}>AI Reroutes 28,400 Evacuees to Sama Relief Camp</Text>
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.primary,
  },
  content: {
    flex: 1,
    padding: spacing.md,
  },
  aiBadgeBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(59, 130, 246, 0.12)',
    borderRadius: radius.lg,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: 'rgba(59, 130, 246, 0.3)',
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  flex1: {
    flex: 1,
  },
  aiBadgeTag: {
    color: colors.primary.light,
    fontSize: 9,
    fontWeight: typography.fontWeight.heavy,
    letterSpacing: 0.5,
  },
  aiBadgeTitle: {
    color: colors.text.primary,
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.heavy,
  },
  confidenceBox: {
    alignItems: 'flex-end',
    backgroundColor: 'rgba(59, 130, 246, 0.2)',
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: radius.md,
  },
  confidenceVal: {
    color: colors.primary.light,
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.heavy,
  },
  confidenceSub: {
    color: colors.text.secondary,
    fontSize: 8,
    fontWeight: typography.fontWeight.bold,
  },
  card: {
    backgroundColor: colors.background.secondary,
    borderRadius: radius.lg,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.border.strong,
    marginBottom: spacing.md,
    ...shadows.sm,
  },
  cardSectionTitle: {
    color: colors.text.secondary,
    fontSize: 10,
    fontWeight: typography.fontWeight.heavy,
    letterSpacing: 0.5,
    marginBottom: spacing.sm,
  },
  label: {
    color: colors.text.secondary,
    fontSize: 9,
    fontWeight: typography.fontWeight.bold,
    marginBottom: 4,
  },
  input: {
    backgroundColor: colors.background.tertiary,
    borderRadius: radius.md,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    color: colors.text.primary,
    fontSize: typography.fontSize.xs,
    borderWidth: 1,
    borderColor: colors.border.subtle,
    marginBottom: spacing.sm,
  },
  inputRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginBottom: spacing.sm,
  },
  presetGrid: {
    flexDirection: 'row',
    gap: 4,
  },
  presetChip: {
    flex: 1,
    backgroundColor: colors.background.tertiary,
    paddingVertical: 4,
    borderRadius: radius.xs,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border.subtle,
  },
  presetActive: {
    backgroundColor: colors.safety.main,
    borderColor: colors.safety.light,
  },
  presetText: {
    color: colors.text.secondary,
    fontSize: 10,
    fontWeight: typography.fontWeight.semibold,
  },
  presetTextActive: {
    color: '#FFF',
    fontWeight: typography.fontWeight.bold,
  },
  runBtn: {
    backgroundColor: colors.safety.main,
    borderRadius: radius.md,
    paddingVertical: spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xs,
    marginTop: spacing.xs,
    ...shadows.glowBlue,
  },
  runBtnText: {
    color: '#FFF',
    fontSize: typography.fontSize.xs,
    fontWeight: typography.fontWeight.heavy,
    letterSpacing: 1,
  },
  currentEventBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.background.tertiary,
    padding: spacing.sm,
    borderRadius: radius.md,
    gap: spacing.xs,
    marginBottom: spacing.sm,
  },
  currentEventText: {
    color: colors.text.primary,
    fontSize: typography.fontSize.xs,
    fontWeight: typography.fontWeight.semibold,
  },
  probGrid: {
    flexDirection: 'row',
    gap: spacing.xs,
    marginBottom: spacing.sm,
  },
  probCard: {
    flex: 1,
    backgroundColor: colors.background.tertiary,
    padding: spacing.sm,
    borderRadius: radius.md,
    alignItems: 'center',
    borderWidth: 1,
  },
  probVal: {
    color: colors.severity.CRITICAL.text,
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.heavy,
  },
  probLabel: {
    color: colors.text.muted,
    fontSize: 8,
    fontWeight: typography.fontWeight.bold,
    textAlign: 'center',
    marginTop: 2,
  },
  popEstimateText: {
    color: colors.text.secondary,
    fontSize: typography.fontSize.xs,
  },
  chainContainer: {
    alignItems: 'center',
    paddingVertical: spacing.xs,
  },
  chainNode: {
    width: '100%',
    backgroundColor: colors.background.tertiary,
    borderRadius: radius.md,
    padding: spacing.sm,
    borderWidth: 1,
    borderColor: colors.border.subtle,
    alignItems: 'center',
  },
  finalNode: {
    borderColor: colors.status.success,
    backgroundColor: 'rgba(16, 185, 129, 0.1)',
  },
  nodeTitle: {
    color: colors.text.primary,
    fontSize: typography.fontSize.xs,
    fontWeight: typography.fontWeight.bold,
  },
  nodeSub: {
    color: colors.text.secondary,
    fontSize: 10,
    marginTop: 2,
  },
  chainArrow: {
    marginVertical: 4,
  },
});
