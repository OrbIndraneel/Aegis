import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Header } from '../../src/components/common/Header';
import { ConnectionStatus } from '../../src/components/common/ConnectionStatus';
import { useAuthorityStore } from '../../src/store/useAuthorityStore';
import { colors, typography, spacing, radius, shadows } from '../../src/theme';
import {
  Cpu,
  CloudRain,
  Mountain,
  Play,
  AlertTriangle,
  ShieldAlert,
  ArrowDown,
  Network,
  CheckCircle2,
  Compass,
} from 'lucide-react-native';
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

  const [durationHours, setDurationHours] = useState(72);
  const [soilSaturationPercent, setSoilSaturationPercent] = useState(88);
  const [slopeAngleDeg, setSlopeAngleDeg] = useState(42);
  const [targetRegion, setTargetRegion] = useState('East Sikkim • NH-10 Corridor (Singtam - Rangpo)');

  const handleRunScenario = async () => {
    await runCascadeSimulation();
  };

  return (
    <SafeAreaView style={styles.container}>
      <Header
        title="AEGIS CASCADE MODELER"
        subtitle="NER Landslide & Cascade Risk Simulator"
      />
      <ConnectionStatus />

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* PROMINENT AI PREDICTION BADGE */}
        <View style={styles.aiBadgeBanner}>
          <Cpu size={22} color="#0284C7" />
          <View style={styles.flex1}>
            <Text style={styles.aiBadgeTag}>AEGIS GRAPH ATTENTION NETWORK (GAT)</Text>
            <Text style={styles.aiBadgeTitle}>Multi-Hazard Geotechnical Cascade Modeling</Text>
          </View>
          <View style={styles.confidenceBox}>
            <Text style={styles.confidenceVal}>96.4%</Text>
            <Text style={styles.confidenceSub}>CONFIDENCE</Text>
          </View>
        </View>

        {/* 1. SCENARIO SIMULATOR INPUT FORM */}
        <View style={styles.card}>
          <Text style={styles.cardSectionTitle}>GEOTECHNICAL SCENARIO PARAMETERS</Text>

          {/* Region */}
          <Text style={styles.label}>SURVEILLANCE SECTOR / WATERSHED BASIN</Text>
          <TextInput
            style={styles.input}
            value={targetRegion}
            onChangeText={setTargetRegion}
          />

          {/* Cumulative Rainfall & Duration */}
          <View style={styles.inputRow}>
            <View style={styles.flex1}>
              <Text style={styles.label}>ACCUMULATED RAINFALL (MM)</Text>
              <View style={styles.presetGrid}>
                {[120, 180, 210, 280].map((val) => (
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
              <Text style={styles.label}>ACCUMULATION WINDOW</Text>
              <View style={styles.presetGrid}>
                {[24, 48, 72, 96].map((val) => (
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

          {/* Soil Saturation & Slope Angle */}
          <View style={styles.inputRow}>
            <View style={styles.flex1}>
              <Text style={styles.label}>SOIL SATURATION (%)</Text>
              <View style={styles.presetGrid}>
                {[65, 78, 88, 96].map((val) => (
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
              <Text style={styles.label}>SLOPE ANGLE (DEGREES)</Text>
              <View style={styles.presetGrid}>
                {[32, 38, 42, 48].map((val) => (
                  <TouchableOpacity
                    key={val}
                    style={[styles.presetChip, slopeAngleDeg === val && styles.presetActive]}
                    onPress={() => setSlopeAngleDeg(val)}
                  >
                    <Text style={[styles.presetText, slopeAngleDeg === val && styles.presetTextActive]}>
                      {val}°
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
            <Play size={16} color="#FFF" />
            <Text style={styles.runBtnText}>
              {isSimulating ? 'SOLVING GAT CASCADE GRAPH...' : 'EXECUTE CASCADE SIMULATION'}
            </Text>
          </TouchableOpacity>
        </View>

        {/* 2. PREDICTION RESULTS & PROBABILITIES */}
        <View style={styles.card}>
          <Text style={styles.cardSectionTitle}>SIMULATED FAILURE PROBABILITIES</Text>
          <View style={styles.currentEventBox}>
            <CloudRain size={16} color="#0284C7" />
            <Text style={styles.currentEventText}>
              Condition: {rainfallMmInput}mm over {durationHours}h • Saturation: {soilSaturationPercent}% • Slope: {slopeAngleDeg}°
            </Text>
          </View>

          {/* Probability Cards */}
          <View style={styles.probGrid}>
            <View style={[styles.probCard, { borderColor: '#FECACA' }]}>
              <Text style={styles.probVal}>94%</Text>
              <Text style={styles.probLabel}>SLOPE FAILURE</Text>
            </View>
            <View style={[styles.probCard, { borderColor: '#FDE68A' }]}>
              <Text style={[styles.probVal, { color: '#B45309' }]}>88%</Text>
              <Text style={styles.probLabel}>VALLEY DAMMING</Text>
            </View>
            <View style={[styles.probCard, { borderColor: '#BAE6FD' }]}>
              <Text style={[styles.probVal, { color: '#0284C7' }]}>96%</Text>
              <Text style={styles.probLabel}>NH-10 ROAD CUT</Text>
            </View>
          </View>

          <Text style={styles.popEstimateText}>
            💡 Estimated Exposed Population: <Text style={styles.boldText}>24,800 Mountain Citizens</Text>
          </Text>
        </View>

        {/* 3. VISUAL CASCADE CHAIN */}
        <View style={styles.card}>
          <Text style={styles.cardSectionTitle}>VISUAL GAT CASCADE CHAIN</Text>
          <View style={styles.chainContainer}>
            <View style={styles.chainNode}>
              <Text style={styles.nodeTitle}>Prolonged Monsoon Precipitation</Text>
              <Text style={styles.nodeSub}>{rainfallMmInput} mm cumulative over {durationHours} hours</Text>
            </View>
            <ArrowDown size={14} color="#0284C7" style={styles.chainArrow} />

            <View style={styles.chainNode}>
              <Text style={styles.nodeTitle}>Pore Water Pressure Spike</Text>
              <Text style={styles.nodeSub}>{soilSaturationPercent}% soil moisture saturation; shear strength reduced</Text>
            </View>
            <ArrowDown size={14} color="#D97706" style={styles.chainArrow} />

            <View style={styles.chainNode}>
              <Text style={styles.nodeTitle}>Mass Slope Collapse (Mile 20)</Text>
              <Text style={styles.nodeSub}>Rotational debris failure on {slopeAngleDeg}° metamorphic hillside</Text>
            </View>
            <ArrowDown size={14} color="#DC2626" style={styles.chainArrow} />

            <View style={styles.chainNode}>
              <Text style={styles.nodeTitle}>Lifeline Arterial Cut</Text>
              <Text style={styles.nodeSub}>NH-10 20th Mile pass buried; Teesta valley downstream hazard</Text>
            </View>
            <ArrowDown size={14} color="#DC2626" style={styles.chainArrow} />

            <View style={[styles.chainNode, styles.finalNode]}>
              <Text style={[styles.nodeTitle, { color: '#059669' }]}>Emergency Prioritisation & Detour</Text>
              <Text style={styles.nodeSub}>
                EPI Index triggers BRO heavy machinery & activates Upper Ridge safe bypass
              </Text>
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
    backgroundColor: '#F8FAFC',
  },
  content: {
    flex: 1,
    padding: spacing.md,
    paddingBottom: 110,
  },
  aiBadgeBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F0F9FF',
    borderRadius: radius.lg,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: '#BAE6FD',
    gap: spacing.sm,
    marginBottom: spacing.md,
    ...shadows.sm,
  },
  flex1: {
    flex: 1,
  },
  aiBadgeTag: {
    color: '#0284C7',
    fontSize: 9.5,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  aiBadgeTitle: {
    color: '#0F172A',
    fontSize: 13.5,
    fontWeight: '700',
    marginTop: 2,
  },
  confidenceBox: {
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#BAE6FD',
  },
  confidenceVal: {
    fontSize: 13,
    fontWeight: '800',
    color: '#0284C7',
  },
  confidenceSub: {
    fontSize: 7.5,
    color: '#64748B',
    fontWeight: '700',
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: radius.lg,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: spacing.md,
    ...shadows.sm,
  },
  cardSectionTitle: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.6,
    color: '#475569',
    marginBottom: 10,
  },
  label: {
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.4,
    color: '#64748B',
    marginBottom: 4,
    marginTop: 6,
  },
  input: {
    backgroundColor: '#F8FAFC',
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: '#CBD5E1',
    paddingHorizontal: 10,
    height: 38,
    fontSize: 12.5,
    color: '#0F172A',
  },
  inputRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 4,
  },
  presetGrid: {
    flexDirection: 'row',
    gap: 4,
  },
  presetChip: {
    flex: 1,
    backgroundColor: '#F1F5F9',
    borderRadius: 6,
    paddingVertical: 6,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  presetActive: {
    backgroundColor: '#0F172A',
    borderColor: '#0F172A',
  },
  presetText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#475569',
  },
  presetTextActive: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  runBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: '#0F172A',
    borderRadius: radius.md,
    paddingVertical: 12,
    marginTop: 14,
    ...shadows.sm,
  },
  runBtnText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
    letterSpacing: 0.4,
  },
  currentEventBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#F0F9FF',
    padding: 8,
    borderRadius: 8,
    marginBottom: 10,
  },
  currentEventText: {
    fontSize: 11.5,
    color: '#0369A1',
    fontWeight: '600',
  },
  probGrid: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 10,
  },
  probCard: {
    flex: 1,
    backgroundColor: '#F8FAFC',
    borderRadius: 8,
    borderWidth: 1,
    paddingVertical: 8,
    alignItems: 'center',
  },
  probVal: {
    fontSize: 18,
    fontWeight: '800',
    color: '#DC2626',
  },
  probLabel: {
    fontSize: 8.5,
    fontWeight: '700',
    color: '#64748B',
    marginTop: 2,
    textAlign: 'center',
  },
  popEstimateText: {
    fontSize: 11.5,
    color: '#64748B',
  },
  boldText: {
    color: '#0F172A',
    fontWeight: '700',
  },
  chainContainer: {
    alignItems: 'center',
    gap: 2,
    marginTop: 4,
  },
  chainNode: {
    width: '100%',
    backgroundColor: '#F8FAFC',
    borderRadius: 8,
    padding: 10,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  finalNode: {
    backgroundColor: '#ECFDF5',
    borderColor: '#A7F3D0',
  },
  nodeTitle: {
    fontSize: 12.5,
    fontWeight: '700',
    color: '#0F172A',
  },
  nodeSub: {
    fontSize: 11,
    color: '#64748B',
    marginTop: 2,
  },
  chainArrow: {
    marginVertical: 2,
  },
});
