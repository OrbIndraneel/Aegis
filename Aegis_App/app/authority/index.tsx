import React, { useEffect } from 'react';
import { View, StyleSheet, ScrollView, Text } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Header } from '../../src/components/common/Header';
import { ConnectionStatus } from '../../src/components/common/ConnectionStatus';
import { StatCard } from '../../src/components/common/StatCard';
import { useAuthorityStore } from '../../src/store/useAuthorityStore';
import { useDisasterStore } from '../../src/store/useDisasterStore';
import { colors, spacing, radius, typography } from '../../src/theme';
import { ShieldAlert, Users, Home, Radio, CloudRain, Cpu, Megaphone, AlertTriangle, Navigation } from 'lucide-react-native';

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
      <Header title="CONTROL ROOM COMMAND" />
      <ConnectionStatus />

      <ScrollView style={styles.scrollContent} contentContainerStyle={styles.scrollContainer} showsVerticalScrollIndicator={false}>
        {/* State Disaster Emergency Overview Banner */}
        <View style={styles.overviewBanner}>
          <ShieldAlert size={24} color={colors.severity.CRITICAL.main} />
          <View style={styles.flex1}>
            <Text style={styles.bannerTag}>STATE DISASTER COMMAND • LEVEL 4 DISASTER ALERT</Text>
            <Text style={styles.bannerTitle}>Vadodara Vishwamitri Flood Crisis Command</Text>
          </View>
        </View>

        {/* 1. HIGH QUALITY STATISTIC CARDS GRID (9 KEY METRICS) */}
        <Text style={styles.sectionHeader}>TACTICAL EMERGENCY METRICS</Text>
        
        {/* Grid Row 1 */}
        <View style={styles.kpiRow}>
          <StatCard
            title="ACTIVE INCIDENTS"
            value="4 Field Reports"
            subtitle="2 Evacuations In-Progress"
            variant="danger"
            icon={<AlertTriangle size={16} color={colors.severity.CRITICAL.main} />}
          />
          <StatCard
            title="CRITICAL RISK ZONES"
            value={stats?.criticalHazardCount || 2}
            subtitle="Sayajigunj & Chamoli"
            variant="danger"
            icon={<ShieldAlert size={16} color={colors.severity.CRITICAL.main} />}
          />
        </View>

        {/* Grid Row 2 */}
        <View style={styles.kpiRow}>
          <StatCard
            title="PEOPLE AT RISK"
            value={(stats?.totalAffectedPopulation || 64700).toLocaleString()}
            subtitle={`${(stats?.totalEvacuatedPopulation || 28400).toLocaleString()} Evacuated`}
            variant="warning"
            icon={<Users size={16} color={colors.severity.MODERATE.main} />}
          />
          <StatCard
            title="SHELTER UTILIZATION"
            value={`${utilizationPercent}%`}
            subtitle={`${occupiedBeds} / ${totalBeds} Beds`}
            variant="success"
            icon={<Home size={16} color={colors.status.success} />}
          />
        </View>

        {/* Grid Row 3 */}
        <View style={styles.kpiRow}>
          <StatCard
            title="ACTIVE EVACUATIONS"
            value="28,400 Citizens"
            subtitle="Sama Stadium Staging"
            variant="success"
            icon={<Navigation size={16} color={colors.status.success} />}
          />
          <StatCard
            title="CURRENT RAINFALL"
            value="180 mm/hr"
            subtitle="IMD Heavy Rain Alert"
            variant="warning"
            icon={<CloudRain size={16} color={colors.primary.light} />}
          />
        </View>

        {/* Grid Row 4 */}
        <View style={styles.kpiRow}>
          <StatCard
            title="PREDICTED HAZARDS"
            value="3 Secondary Hazards"
            subtitle="Flash Flood & Landslide"
            variant="default"
            icon={<Cpu size={16} color={colors.primary.main} />}
          />
          <StatCard
            title="ALERTS DISPATCHED"
            value={`${alerts.length || 4} Broadcasts`}
            subtitle="42,500 Civilians Reached"
            variant="default"
            icon={<Megaphone size={16} color={colors.safety.main} />}
          />
        </View>

        {/* Tactical Emergency Dispatch Quick Actions */}
        <Text style={styles.sectionHeader}>COMMAND CENTER TACTICAL OVERVIEW</Text>
        <View style={styles.summaryCard}>
          <View style={styles.summaryRow}>
            <Radio size={16} color={colors.safety.main} />
            <Text style={styles.summaryText}>NDRF Battalion 06 active in Fatehgunj Sector</Text>
          </View>
          <View style={styles.summaryRow}>
            <ShieldAlert size={16} color={colors.severity.CRITICAL.main} />
            <Text style={styles.summaryText}>Vishwamitri river level: 26.4 ft (Danger Mark: 26.0 ft)</Text>
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
  scrollContent: {
    flex: 1,
    padding: spacing.md,
  },
  scrollContainer: {
    paddingBottom: 110,
  },
  overviewBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(220, 38, 38, 0.15)',
    borderRadius: radius.lg,
    padding: spacing.md,
    borderWidth: 1.5,
    borderColor: colors.severity.CRITICAL.border,
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  flex1: {
    flex: 1,
  },
  bannerTag: {
    color: colors.severity.CRITICAL.text,
    fontSize: 9,
    fontWeight: typography.fontWeight.heavy,
    letterSpacing: 0.5,
  },
  bannerTitle: {
    color: colors.text.primary,
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.heavy,
  },
  sectionHeader: {
    color: colors.text.secondary,
    fontSize: typography.fontSize.xs,
    fontWeight: typography.fontWeight.heavy,
    letterSpacing: 0.5,
    marginVertical: spacing.xs,
  },
  kpiRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginBottom: spacing.sm,
  },
  summaryCard: {
    backgroundColor: colors.background.secondary,
    borderRadius: radius.lg,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.border.strong,
    gap: spacing.xs,
    marginBottom: spacing.xxl,
  },
  summaryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  summaryText: {
    color: colors.text.primary,
    fontSize: typography.fontSize.xs,
    fontWeight: typography.fontWeight.semibold,
  },
});
