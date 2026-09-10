import React, { useEffect } from 'react';
import { View, StyleSheet, ScrollView, Text } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Header } from '../../src/components/common/Header';
import { ConnectionStatus } from '../../src/components/common/ConnectionStatus';
import { StatCard } from '../../src/components/common/StatCard';
import { useAuthorityStore } from '../../src/store/useAuthorityStore';
import { useDisasterStore } from '../../src/store/useDisasterStore';
import { colors, spacing, radius, typography, shadows } from '../../src/theme';
import {
  ShieldAlert,
  Users,
  Home,
  Radio,
  CloudRain,
  Cpu,
  Megaphone,
  AlertTriangle,
  Navigation,
  Truck,
  CheckCircle2,
} from 'lucide-react-native';

interface EpiZone {
  id: string;
  zone: string;
  epiScore: number;
  level: 'CRITICAL' | 'HIGH' | 'MODERATE';
  popAtRisk: number;
  timeToFailure: string;
  roadStatus: string;
  primaryAction: string;
}

const EPI_ZONES: EpiZone[] = [
  {
    id: 'epi-1',
    zone: 'NH-10 20th Mile to Singtam Corridor',
    epiScore: 8.9,
    level: 'CRITICAL',
    popAtRisk: 14200,
    timeToFailure: '< 45 mins',
    roadStatus: 'BLOCKED (Boulders & Slurry)',
    primaryAction: 'Immediate ridge evacuation; BRO Swastik deployed',
  },
  {
    id: 'epi-2',
    zone: 'Dikchu - Rangpo Valley Slope',
    epiScore: 7.4,
    level: 'HIGH',
    popAtRisk: 6800,
    timeToFailure: '1.5 - 3 hours',
    roadStatus: 'SINGLE ACCESS ONLY',
    primaryAction: 'Staged evacuation to Dikchu Community Staging',
  },
  {
    id: 'epi-3',
    zone: 'Pakyong Airport Ridge Sector',
    epiScore: 6.2,
    level: 'MODERATE',
    popAtRisk: 3800,
    timeToFailure: '4 - 6 hours',
    roadStatus: 'OPEN WITH SPEED RESTRICTION',
    primaryAction: 'Continuous piezometer & drone monitoring',
  },
];

export default function AuthorityDashboardScreen() {
  const { stats, loadStats } = useAuthorityStore();
  const { hazards, shelters, alerts } = useDisasterStore();

  useEffect(() => {
    loadStats();
  }, []);

  const totalBeds = stats?.totalShelterBeds || 9500;
  const occupiedBeds = stats?.occupiedShelterBeds || 5890;
  const utilizationPercent = Math.round((occupiedBeds / totalBeds) * 100);

  return (
    <SafeAreaView style={styles.container}>
      <Header
        title="CONTROL ROOM COMMAND"
        subtitle="National Disaster Response & Landslide Telemetry"
      />
      <ConnectionStatus />

      <ScrollView
        style={styles.scrollContent}
        contentContainerStyle={styles.scrollContainer}
        showsVerticalScrollIndicator={false}
      >
        {/* State Disaster Emergency Overview Banner */}
        <View style={styles.overviewBanner}>
          <ShieldAlert size={26} color="#DC2626" />
          <View style={styles.flex1}>
            <View style={styles.bannerBadgeRow}>
              <Text style={styles.bannerTag}>WARNING PROTOCOL • LEVEL 3 RED ALERT</Text>
              <View style={styles.livePulseDot} />
            </View>
            <Text style={styles.bannerTitle}>
              Gangtok & East Sikkim (NH-10 Lifeline Corridor)
            </Text>
            <Text style={styles.bannerSubtitle}>
              GAT AI Cascade: 72h Cumulative Rain (210mm) + Soil Saturation (88%) → Debris Flow & Road Cut
            </Text>
          </View>
        </View>

        {/* 6 CORE OPERATIONAL ANSWERS */}
        <Text style={styles.sectionHeader}>CORE OPERATIONAL SITUATION ASSESSMENT</Text>
        <View style={styles.situationalCard}>
          <View style={styles.sitGrid}>
            <View style={styles.sitItem}>
              <Text style={styles.sitNum}>01</Text>
              <View style={styles.sitContent}>
                <Text style={styles.sitTitle}>Warning Level</Text>
                <Text style={styles.sitValue}>WARNING (Red)</Text>
                <Text style={styles.sitSub}>High failure probability</Text>
              </View>
            </View>

            <View style={styles.sitItem}>
              <Text style={styles.sitNum}>02</Text>
              <View style={styles.sitContent}>
                <Text style={styles.sitTitle}>Location & Spread</Text>
                <Text style={styles.sitValue}>NH-10 20th Mile & Singtam</Text>
                <Text style={styles.sitSub}>1.8 km debris cone radius</Text>
              </View>
            </View>

            <View style={styles.sitItem}>
              <Text style={styles.sitNum}>03</Text>
              <View style={styles.sitContent}>
                <Text style={styles.sitTitle}>Landslide Type</Text>
                <Text style={styles.sitValue}>Rotational Debris Flow</Text>
                <Text style={styles.sitSub}>Slope 42°, Foliated Gneiss</Text>
              </View>
            </View>

            <View style={styles.sitItem}>
              <Text style={styles.sitNum}>04</Text>
              <View style={styles.sitContent}>
                <Text style={styles.sitTitle}>Exposed Population</Text>
                <Text style={styles.sitValue}>24,800 Citizens</Text>
                <Text style={styles.sitSub}>4 mountain village clusters</Text>
              </View>
            </View>

            <View style={styles.sitItem}>
              <Text style={styles.sitNum}>05</Text>
              <View style={styles.sitContent}>
                <Text style={styles.sitTitle}>Highest Priority Zone</Text>
                <Text style={styles.sitValue}>Singtam Sector (EPI 8.9)</Text>
                <Text style={styles.sitSub}>Immediate evacuation active</Text>
              </View>
            </View>

            <View style={styles.sitItem}>
              <Text style={styles.sitNum}>06</Text>
              <View style={styles.sitContent}>
                <Text style={styles.sitTitle}>Response & Staging</Text>
                <Text style={styles.sitValue}>BRO Swastik + SDRF 2nd</Text>
                <Text style={styles.sitSub}>Upper Ridge Detour open</Text>
              </View>
            </View>
          </View>
        </View>

        {/* 1. TACTICAL KPI METRICS */}
        <Text style={styles.sectionHeader}>TACTICAL TELEMETRY METRICS</Text>

        <View style={styles.kpiRow}>
          <StatCard
            title="ACTIVE HAZARDS"
            value="3 Slope Failures"
            subtitle="NH-10 Mile 20 & Singtam"
            variant="danger"
            icon={<AlertTriangle size={16} color={colors.severity.CRITICAL.main} />}
          />
          <StatCard
            title="TOP EMERGENCY ZONE"
            value="Singtam (EPI 8.9)"
            subtitle="High isolation vulnerability"
            variant="danger"
            icon={<ShieldAlert size={16} color={colors.severity.CRITICAL.main} />}
          />
        </View>

        <View style={styles.kpiRow}>
          <StatCard
            title="POPULATION AT RISK"
            value="24,800 Citizens"
            subtitle="4 Mountain Village Clusters"
            variant="warning"
            icon={<Users size={16} color={colors.severity.MODERATE.main} />}
          />
          <StatCard
            title="SHELTER OCCUPANCY"
            value={`${utilizationPercent}%`}
            subtitle={`${occupiedBeds} / ${totalBeds} Mountain Beds`}
            variant="success"
            icon={<Home size={16} color={colors.status.success} />}
          />
        </View>

        <View style={styles.kpiRow}>
          <StatCard
            title="72H RAINFALL TOTAL"
            value="210 mm"
            subtitle="Soil Saturation: 88%"
            variant="warning"
            icon={<CloudRain size={16} color={colors.primary.light} />}
          />
          <StatCard
            title="GAT CASCADE MODEL"
            value="3 Chains Modeled"
            subtitle="Geotechnical Cascade Graph"
            variant="default"
            icon={<Cpu size={16} color={colors.primary.main} />}
          />
        </View>

        {/* 2. EMERGENCY PRIORITY INDEX (EPI) RANKING TABLE */}
        <View style={styles.sectionTitleRow}>
          <Text style={styles.sectionHeader}>EMERGENCY PRIORITY INDEX (EPI) RANKING</Text>
          <Text style={styles.epiFormula}>Multi-Factor Prioritisation</Text>
        </View>

        <View style={styles.epiCard}>
          {EPI_ZONES.map((zone, idx) => (
            <View
              key={zone.id}
              style={[
                styles.epiItem,
                idx !== EPI_ZONES.length - 1 && styles.epiItemBorder,
              ]}
            >
              <View style={styles.epiHeaderRow}>
                <View style={styles.epiRankBadge}>
                  <Text style={styles.epiRankText}>#{idx + 1}</Text>
                </View>
                <View style={styles.flex1}>
                  <Text style={styles.epiZoneTitle}>{zone.zone}</Text>
                  <Text style={styles.epiRoadStatus}>Status: {zone.roadStatus}</Text>
                </View>
                <View
                  style={[
                    styles.epiScoreBadge,
                    zone.level === 'CRITICAL' ? styles.scoreCritical : styles.scoreHigh,
                  ]}
                >
                  <Text style={styles.epiScoreNumber}>{zone.epiScore}</Text>
                  <Text style={styles.epiScoreLabel}>/ 10</Text>
                </View>
              </View>

              <View style={styles.epiDetailRow}>
                <Text style={styles.epiDetailText}>
                  Exposed: <Text style={styles.boldText}>{zone.popAtRisk.toLocaleString()}</Text>
                </Text>
                <Text style={styles.epiDetailText}>
                  Est. Window: <Text style={styles.boldText}>{zone.timeToFailure}</Text>
                </Text>
              </View>

              <View style={styles.epiActionBox}>
                <Navigation size={12} color="#0284C7" />
                <Text style={styles.epiActionText}>{zone.primaryAction}</Text>
              </View>
            </View>
          ))}
        </View>

        {/* 3. COMMAND CENTER DISPATCH LOG */}
        <Text style={styles.sectionHeader}>REAL-TIME DISPATCH STATUS</Text>
        <View style={styles.summaryCard}>
          <View style={styles.summaryRow}>
            <Radio size={15} color="#10B981" />
            <Text style={styles.summaryText}>
              SDRF 2nd Mountain Battalion staged at Singtam Community Center.
            </Text>
          </View>
          <View style={styles.summaryRow}>
            <Truck size={15} color="#F59E0B" />
            <Text style={styles.summaryText}>
              BRO Project Swastik excavators clearing debris at NH-10 20th Mile.
            </Text>
          </View>
          <View style={styles.summaryRow}>
            <CheckCircle2 size={15} color="#3B82F6" />
            <Text style={styles.summaryText}>
              Alternate Upper Ridge Bypass operational for civilian small vehicles.
            </Text>
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
  scrollContent: {
    flex: 1,
    padding: spacing.md,
  },
  scrollContainer: {
    paddingBottom: 110,
  },
  overviewBanner: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#FEF2F2',
    borderRadius: radius.lg,
    padding: spacing.md,
    borderWidth: 1.5,
    borderColor: '#FECACA',
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  flex1: {
    flex: 1,
  },
  bannerBadgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  livePulseDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: '#DC2626',
  },
  bannerTag: {
    color: '#991B1B',
    fontSize: 9.5,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  bannerTitle: {
    color: '#0F172A',
    fontSize: 15,
    fontWeight: '800',
    marginTop: 2,
  },
  bannerSubtitle: {
    color: '#7F1D1D',
    fontSize: 11.5,
    marginTop: 4,
    lineHeight: 16,
  },
  sectionHeader: {
    color: '#475569',
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.6,
    marginVertical: spacing.xs,
  },
  sectionTitleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: spacing.sm,
    marginBottom: spacing.xs,
  },
  epiFormula: {
    fontSize: 10,
    color: '#64748B',
    fontWeight: '600',
  },
  situationalCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: radius.lg,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: spacing.md,
    ...shadows.sm,
  },
  sitGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  sitItem: {
    width: '47%',
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
    backgroundColor: '#F8FAFC',
    borderRadius: radius.md,
    padding: 10,
    borderWidth: 1,
    borderColor: '#F1F5F9',
  },
  sitNum: {
    fontSize: 12,
    fontWeight: '800',
    color: '#94A3B8',
  },
  sitContent: {
    flex: 1,
  },
  sitTitle: {
    fontSize: 10,
    color: '#64748B',
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  sitValue: {
    fontSize: 12.5,
    fontWeight: '800',
    color: '#0F172A',
    marginTop: 1,
  },
  sitSub: {
    fontSize: 10,
    color: '#94A3B8',
    marginTop: 1,
  },
  kpiRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginBottom: spacing.sm,
  },
  epiCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: radius.lg,
    padding: spacing.sm,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: spacing.md,
    ...shadows.sm,
  },
  epiItem: {
    padding: spacing.sm,
  },
  epiItemBorder: {
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  epiHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  epiRankBadge: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#0F172A',
    alignItems: 'center',
    justifyContent: 'center',
  },
  epiRankText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '800',
  },
  epiZoneTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#0F172A',
  },
  epiRoadStatus: {
    fontSize: 10.5,
    color: '#DC2626',
    fontWeight: '700',
    marginTop: 1,
  },
  epiScoreBadge: {
    flexDirection: 'row',
    alignItems: 'baseline',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
    borderWidth: 1,
  },
  scoreCritical: {
    backgroundColor: '#FEF2F2',
    borderColor: '#FECACA',
  },
  scoreHigh: {
    backgroundColor: '#FFFBEB',
    borderColor: '#FCD34D',
  },
  epiScoreNumber: {
    fontSize: 14,
    fontWeight: '800',
    color: '#991B1B',
  },
  epiScoreLabel: {
    fontSize: 9.5,
    color: '#991B1B',
    marginLeft: 1,
  },
  epiDetailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: 6,
    paddingHorizontal: 4,
  },
  epiDetailText: {
    fontSize: 11,
    color: '#64748B',
  },
  boldText: {
    color: '#0F172A',
    fontWeight: '700',
  },
  epiActionBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F0F9FF',
    paddingHorizontal: 8,
    paddingVertical: 5,
    borderRadius: 6,
    gap: 6,
  },
  epiActionText: {
    fontSize: 11,
    color: '#0369A1',
    fontWeight: '600',
    flex: 1,
  },
  summaryCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: radius.lg,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    gap: 10,
    marginBottom: spacing.xxl,
    ...shadows.sm,
  },
  summaryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  summaryText: {
    color: '#334155',
    fontSize: 12,
    fontWeight: '500',
    flex: 1,
  },
});
